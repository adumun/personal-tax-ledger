import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAnnualWorkspaceContext,
  WorkspaceContextMismatchError
} from '@personal-tax-ledger/contracts';
import {
  createActiveAnnualWorkspaceContextResolver,
  createExecutionLogUseCases,
  createIncomeUseCases,
  createTaxParameterUseCases
} from '@personal-tax-ledger/application';
import { handleRequestError } from '@personal-tax-ledger/http-api';

const baseContext = Object.freeze({ workspaceId: 'local-workspace', actorId: 'local-user' });

function annualWorkspace(year) {
  return {
    id: `annual-tax-workspace-${year}`,
    commercialYear: year,
    derivedTaxYearLabel: `AT${year + 1}`,
    lifecycleState: 'PREPARING',
    createdAt: '2026-09-13T00:00:00.000Z',
    updatedAt: '2026-09-13T00:00:00.000Z',
    ruleVersionRef: null
  };
}

test('AnnualWorkspaceContext conserva contexto propietario y agrega identidad anual confiable', () => {
  const context = createAnnualWorkspaceContext(baseContext, annualWorkspace(2026));
  assert.deepEqual(context, {
    workspaceId: 'local-workspace',
    actorId: 'local-user',
    annualWorkspaceId: 'annual-tax-workspace-2026',
    commercialYear: 2026
  });
});

test('el resolver obtiene el workspace anual activo en cada invocación y observa cambios de settings.year', async () => {
  let activeYear = 2025;
  const settingsRepository = {
    async get() { return { year: activeYear }; },
    async update() { throw new Error('not used'); }
  };
  const annualWorkspaceRepository = {
    async list() { return []; },
    async getByCommercialYear(_context, year) { return annualWorkspace(Number(year)); },
    async create() { throw new Error('not used'); }
  };
  const resolveContext = createActiveAnnualWorkspaceContextResolver({
    settingsRepository,
    annualWorkspaceRepository,
    baseContext
  });

  assert.equal((await resolveContext()).commercialYear, 2025);
  activeYear = 2026;
  const second = await resolveContext();
  assert.equal(second.commercialYear, 2026);
  assert.equal(second.annualWorkspaceId, 'annual-tax-workspace-2026');
});

test('stale write 2025 es rechazado cuando el workspace activo ya cambió a 2026', async () => {
  let createCalls = 0;
  const repository = {
    async list() { return []; },
    async get() { return null; },
    async create() { createCalls += 1; return null; },
    async update() { throw new Error('not used'); },
    async remove() { throw new Error('not used'); },
    async copy() { throw new Error('not used'); }
  };
  const useCases = createIncomeUseCases({ repository });
  const active2026 = createAnnualWorkspaceContext(baseContext, annualWorkspace(2026));

  await assert.rejects(
    () => useCases.createIncomeSource(active2026, { name: 'Formulario abierto en 2025', taxYear: 2025 }),
    error => error instanceof WorkspaceContextMismatchError
      && error.code === 'workspace_year_mismatch'
      && error.expectedCommercialYear === 2026
      && error.actualCommercialYear === 2025
  );
  assert.equal(createCalls, 0, 'la escritura stale no debe alcanzar el repositorio');
});

test('una mutación iniciada con contexto 2025 se revalida y se bloquea si el activo cambia a 2026 antes de persistir', async () => {
  let activeYear = 2025;
  let createCalls = 0;
  const repository = {
    async list() { return []; },
    async get() { return null; },
    async create() { createCalls += 1; return null; },
    async update() { throw new Error('not used'); },
    async remove() { throw new Error('not used'); },
    async copy() { throw new Error('not used'); }
  };
  const resolveActiveContext = async () => createAnnualWorkspaceContext(baseContext, annualWorkspace(activeYear));
  const useCases = createIncomeUseCases({ repository, resolveActiveContext });
  const requestContext2025 = createAnnualWorkspaceContext(baseContext, annualWorkspace(2025));

  activeYear = 2026;
  await assert.rejects(
    () => useCases.createIncomeSource(requestContext2025, { name: 'Request atrasado', taxYear: 2025 }),
    error => error?.code === 'workspace_year_mismatch'
      && error.expectedCommercialYear === 2026
      && error.actualCommercialYear === 2025
  );
  assert.equal(createCalls, 0, 'la revalidación activa debe ocurrir antes del repositorio');
});

test('update/delete de una entidad perteneciente a otro año se bloquea aunque el request omita cambiar el id', async () => {
  let updateCalls = 0;
  let removeCalls = 0;
  const repository = {
    async list() { return []; },
    async get() { return { id: 7, taxYear: 2025, name: 'Ingreso 2025' }; },
    async create() { throw new Error('not used'); },
    async update() { updateCalls += 1; return null; },
    async remove() { removeCalls += 1; return true; },
    async copy() { throw new Error('not used'); }
  };
  const useCases = createIncomeUseCases({ repository });
  const active2026 = createAnnualWorkspaceContext(baseContext, annualWorkspace(2026));

  await assert.rejects(
    () => useCases.updateIncomeSource(active2026, 7, { name: 'Intento stale', taxYear: 2026 }),
    error => error?.code === 'workspace_year_mismatch'
  );
  await assert.rejects(
    () => useCases.deleteIncomeSource(active2026, 7),
    error => error?.code === 'workspace_year_mismatch'
  );
  assert.equal(updateCalls, 0);
  assert.equal(removeCalls, 0);
});

test('tax_parameters respeta el workspace anual activo y bloquea edición cruzada', async () => {
  let upsertCalls = 0;
  const repository = {
    async list(_context, year) { return [{ ruleKey: 'x', value: year, type: 'number' }]; },
    async get() { return null; },
    async upsert() { upsertCalls += 1; return 1; }
  };
  const active2026 = createAnnualWorkspaceContext(baseContext, annualWorkspace(2026));
  const useCases = createTaxParameterUseCases({ repository, resolveActiveContext: async () => active2026 });

  assert.equal((await useCases.listTaxParameters(active2026, 2026))[0].value, 2026);
  await assert.rejects(
    () => useCases.upsertTaxParameter(active2026, 2025, 'x', 1),
    error => error?.code === 'workspace_year_mismatch'
  );
  assert.equal(upsertCalls, 0);
});

test('la bitácora enriquece operaciones materiales con annualWorkspaceId y commercialYear', async () => {
  let persisted;
  const repository = {
    async create(context, entry) {
      persisted = { context, entry };
      return { id: 1, ...entry };
    },
    async list() { return { items: [], total: 0, page: 1, pageSize: 20 }; }
  };
  const active2026 = createAnnualWorkspaceContext(baseContext, annualWorkspace(2026));
  const useCases = createExecutionLogUseCases({
    repository,
    resolveActiveContext: async () => active2026
  });

  await useCases.createExecutionLog(baseContext, {
    kind: 'ASYNC',
    operation: 'SAVE_INCOME',
    status: 'OK',
    auditMessage: 'id=7'
  });

  assert.equal(persisted.context.commercialYear, 2026);
  assert.match(persisted.entry.auditMessage, /id=7/);
  assert.match(persisted.entry.auditMessage, /annualWorkspaceId=annual-tax-workspace-2026/);
  assert.match(persisted.entry.auditMessage, /commercialYear=2026/);
});

test('workspace_year_mismatch se expone como conflicto HTTP 409 con años esperado y recibido', () => {
  let status;
  let body;
  const res = {
    writeHead(receivedStatus) { status = receivedStatus; },
    end(payload) { body = JSON.parse(payload); }
  };
  handleRequestError(res, new WorkspaceContextMismatchError({
    expectedCommercialYear: 2026,
    actualCommercialYear: 2025,
    operation: 'createIncomeSource'
  }));
  assert.equal(status, 409);
  assert.equal(body.code, 'workspace_year_mismatch');
  assert.deepEqual(body.fieldErrors, {
    expectedCommercialYear: 2026,
    actualCommercialYear: 2025
  });
});
