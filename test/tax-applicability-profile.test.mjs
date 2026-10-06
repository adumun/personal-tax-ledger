import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  TAX_APPLICABILITY_DIMENSION,
  TAX_APPLICABILITY_DIMENSIONS,
  TAX_APPLICABILITY_VALUE,
  createTaxApplicabilityProfile,
  normalizeTaxApplicabilityAnswers
} from '@personal-tax-ledger/core';
import { createAnnualWorkspaceContext } from '@personal-tax-ledger/contracts';
import { createTaxApplicabilityProfileUseCases } from '@personal-tax-ledger/application';
import {
  createSqliteAnnualTaxWorkspaceRepository,
  createSqliteDatabase,
  createSqliteTaxApplicabilityProfileRepository
} from '@personal-tax-ledger/sqlite-adapter';

const baseContext = Object.freeze({ workspaceId: 'local-workspace', actorId: 'local-user' });

function workspace(year = 2026) {
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

test('AW-003: el dominio expone exactamente cinco dimensiones tri-state y completa ausentes con UNKNOWN', () => {
  assert.deepEqual(TAX_APPLICABILITY_DIMENSIONS, [
    'DEPENDENT_INCOME',
    'DOMESTIC_FEE_INCOME',
    'FOREIGN_SERVICE_INCOME',
    'APV_CONTRIBUTIONS',
    'MORTGAGE_INTEREST'
  ]);
  const answers = normalizeTaxApplicabilityAnswers({ DEPENDENT_INCOME: 'YES', MORTGAGE_INTEREST: 'NO' });
  assert.equal(answers.DEPENDENT_INCOME, TAX_APPLICABILITY_VALUE.YES);
  assert.equal(answers.MORTGAGE_INTEREST, TAX_APPLICABILITY_VALUE.NO);
  assert.equal(answers.DOMESTIC_FEE_INCOME, TAX_APPLICABILITY_VALUE.UNKNOWN);
  assert.equal(answers.FOREIGN_SERVICE_INCOME, TAX_APPLICABILITY_VALUE.UNKNOWN);
  assert.equal(answers.APV_CONTRIBUTIONS, TAX_APPLICABILITY_VALUE.UNKNOWN);
});

test('AW-003: dimensiones no versionadas o valores fuera de YES/NO/UNKNOWN son rechazados', () => {
  assert.throws(() => normalizeTaxApplicabilityAnswers({ ACTUAL_EXPENSE_EVALUATION: 'YES' }), /dimensión no soportada/);
  assert.throws(() => normalizeTaxApplicabilityAnswers({ DEPENDENT_INCOME: 'MAYBE' }), /valor no soportado/);
  assert.throws(() => createTaxApplicabilityProfile({
    annualWorkspaceId: 'aw-2026', commercialYear: 2026, answers: {}, profileVersion: 2, updatedAt: '2026-09-13T00:00:00.000Z'
  }), /profileVersion no soportado/);
});

test('AW-003: leer un perfil inexistente produce una proyección UNKNOWN sin persistir hechos', async () => {
  let upsertCalls = 0;
  const context = createAnnualWorkspaceContext(baseContext, workspace());
  const repository = {
    async get() { return null; },
    async upsert() { upsertCalls += 1; throw new Error('not expected'); }
  };
  const useCases = createTaxApplicabilityProfileUseCases({
    repository,
    now: () => '2026-09-13T01:00:00.000Z'
  });
  const profile = await useCases.getTaxApplicabilityProfile(context);
  assert.equal(profile.annualWorkspaceId, context.annualWorkspaceId);
  assert.equal(profile.commercialYear, 2026);
  assert.equal(Object.values(profile.answers).every(value => value === 'UNKNOWN'), true);
  assert.equal(upsertCalls, 0);
});

test('AW-003: guardar NO sólo persiste declaración; el use case no conoce repositorios de hechos', async () => {
  const context = createAnnualWorkspaceContext(baseContext, workspace());
  let saved;
  const repository = {
    async get() { return saved || null; },
    async upsert(_context, profile) { saved = profile; return profile; }
  };
  const useCases = createTaxApplicabilityProfileUseCases({
    repository,
    now: () => '2026-09-13T02:00:00.000Z'
  });
  const profile = await useCases.saveTaxApplicabilityProfile(context, {
    [TAX_APPLICABILITY_DIMENSION.DOMESTIC_FEE_INCOME]: 'NO'
  });
  assert.equal(profile.answers.DOMESTIC_FEE_INCOME, 'NO');
  assert.equal(profile.answers.DEPENDENT_INCOME, 'UNKNOWN');
  assert.deepEqual(Object.keys(repository).sort(), ['get', 'upsert']);
});

test('AW-003: una mutación stale no alcanza el repository si cambió el AnnualWorkspace activo', async () => {
  const context2025 = createAnnualWorkspaceContext(baseContext, workspace(2025));
  const context2026 = createAnnualWorkspaceContext(baseContext, workspace(2026));
  let upsertCalls = 0;
  const repository = {
    async get() { return null; },
    async upsert() { upsertCalls += 1; throw new Error('must not persist'); }
  };
  const useCases = createTaxApplicabilityProfileUseCases({
    repository,
    resolveActiveContext: async () => context2026,
    now: () => '2026-09-13T03:00:00.000Z'
  });
  await assert.rejects(
    () => useCases.saveTaxApplicabilityProfile(context2025, { DEPENDENT_INCOME: 'YES' }),
    error => error?.code === 'workspace_year_mismatch'
  );
  assert.equal(upsertCalls, 0);
});

test('AW-003: SQLite persiste perfil por annualWorkspaceId y conserva los cinco estados normalizados', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'ptl-applicability-'));
  const database = createSqliteDatabase({ path: join(directory, 'profile.sqlite') });
  try {
    const workspaces = createSqliteAnnualTaxWorkspaceRepository(undefined, database);
    const annualWorkspace = await workspaces.getByCommercialYear(baseContext, 2026);
    assert.ok(annualWorkspace);
    const context = createAnnualWorkspaceContext(baseContext, annualWorkspace);
    const repository = createSqliteTaxApplicabilityProfileRepository(undefined, database);
    const useCases = createTaxApplicabilityProfileUseCases({
      repository,
      resolveActiveContext: async () => context,
      now: () => '2026-09-13T04:00:00.000Z'
    });

    const saved = await useCases.saveTaxApplicabilityProfile(context, {
      DEPENDENT_INCOME: 'YES',
      DOMESTIC_FEE_INCOME: 'YES',
      FOREIGN_SERVICE_INCOME: 'UNKNOWN',
      APV_CONTRIBUTIONS: 'NO',
      MORTGAGE_INTEREST: 'YES'
    });
    const reloaded = await useCases.getTaxApplicabilityProfile(context);

    assert.deepEqual(reloaded, saved);
    assert.equal(reloaded.profileVersion, 1);
    assert.equal(reloaded.answers.APV_CONTRIBUTIONS, 'NO');
    assert.equal(reloaded.answers.FOREIGN_SERVICE_INCOME, 'UNKNOWN');
    assert.equal(database.db.prepare('SELECT COUNT(*) AS count FROM tax_applicability_profiles').get().count, 1);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
