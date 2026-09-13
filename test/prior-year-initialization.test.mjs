import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPriorYearInitializationUseCases,
  PRIOR_YEAR_REUSABLE_CATEGORY
} from '@personal-tax-ledger/application';

const baseContext = { workspaceId: 'local-workspace', actorId: 'local-user' };
const sourceWorkspace = {
  id: 'annual-tax-workspace-2025',
  commercialYear: 2025,
  derivedTaxYearLabel: 'AT2026',
  lifecycleState: 'PREPARING',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ruleVersionRef: null
};
const targetWorkspace = {
  ...sourceWorkspace,
  id: 'annual-tax-workspace-2026',
  commercialYear: 2026,
  derivedTaxYearLabel: 'AT2027'
};
const sourceProfile = {
  annualWorkspaceId: sourceWorkspace.id,
  commercialYear: 2025,
  profileVersion: 1,
  answers: {
    DEPENDENT_INCOME: 'YES',
    DOMESTIC_FEE_INCOME: 'NO',
    FOREIGN_SERVICE_INCOME: 'UNKNOWN',
    APV_CONTRIBUTIONS: 'YES',
    MORTGAGE_INTEREST: 'NO'
  },
  updatedAt: '2025-12-01T00:00:00.000Z'
};

function harness(overrides = {}) {
  let targetExists = false;
  let activeYear = 2025;
  let copiedProfile = null;
  let provenance = null;
  let removeCalls = 0;

  const annualWorkspaceRepository = {
    async list() { return [sourceWorkspace, ...(targetExists ? [targetWorkspace] : [])]; },
    async getByCommercialYear(_context, year) {
      if (Number(year) === 2025) return sourceWorkspace;
      if (Number(year) === 2026 && targetExists) return targetWorkspace;
      return null;
    },
    async create() { throw new Error('not used directly'); },
    async remove(_context, year) {
      if (Number(year) === 2026) targetExists = false;
      removeCalls += 1;
      return true;
    }
  };

  const settingsUseCases = {
    async getSettings() { return { year: activeYear }; },
    async updateSettings(_context, input) { activeYear = Number(input.year); return { year: activeYear }; }
  };

  const annualWorkspaceFlowUseCases = {
    async createEmptyWorkspace(_context, year) {
      assert.equal(Number(year), 2026);
      targetExists = true;
      activeYear = 2026;
      return { workspace: targetWorkspace, support: { state: 'SUPPORTED' }, activeCommercialYear: 2026 };
    }
  };

  const taxApplicabilityProfileRepository = {
    async get(context) {
      return context.annualWorkspaceId === sourceWorkspace.id ? sourceProfile : copiedProfile;
    },
    async upsert(_context, profile) {
      copiedProfile = Object.freeze({ ...profile, answers: Object.freeze({ ...profile.answers }) });
      return copiedProfile;
    }
  };

  const initializationRepository = {
    async getByTargetWorkspaceId() { return provenance; },
    async create(_context, record) {
      provenance = Object.freeze({ ...record, categories: Object.freeze([...record.categories]) });
      return provenance;
    }
  };

  const useCases = createPriorYearInitializationUseCases({
    annualWorkspaceRepository,
    annualWorkspaceFlowUseCases,
    settingsUseCases,
    taxApplicabilityProfileRepository,
    initializationRepository,
    now: () => '2026-09-13T06:30:00.000Z',
    ...overrides
  });

  return {
    useCases,
    state: () => ({ targetExists, activeYear, copiedProfile, provenance, removeCalls }),
    setExistingInitialization(record) { targetExists = true; provenance = record; }
  };
}

test('AW-003: preview allowlista únicamente el perfil y explicita categorías prohibidas', async () => {
  const { useCases } = harness();
  const preview = await useCases.previewPriorYearInitialization(baseContext, {
    sourceCommercialYear: 2025,
    targetCommercialYear: 2026
  });
  assert.deepEqual(preview.categories.map(item => item.key), [PRIOR_YEAR_REUSABLE_CATEGORY.APPLICABILITY_PROFILE]);
  assert.equal(preview.categories[0].available, true);
  assert.ok(preview.forbiddenCopy.includes('FEE_RECEIPTS'));
  assert.ok(preview.forbiddenCopy.includes('DOCUMENTARY_EVIDENCE'));
  assert.ok(preview.forbiddenCopy.includes('CALCULATED_RESULTS_OR_PROJECTIONS'));
});

test('AW-003: inicialización copia el perfil como propuesta al nuevo workspace y persiste provenance', async () => {
  const { useCases, state } = harness();
  const result = await useCases.initializeFromPriorYear(baseContext, {
    sourceCommercialYear: 2025,
    targetCommercialYear: 2026,
    categories: [PRIOR_YEAR_REUSABLE_CATEGORY.APPLICABILITY_PROFILE]
  });
  assert.equal(result.alreadyInitialized, false);
  assert.equal(state().activeYear, 2026);
  assert.equal(state().copiedProfile.annualWorkspaceId, targetWorkspace.id);
  assert.equal(state().copiedProfile.commercialYear, 2026);
  assert.deepEqual(state().copiedProfile.answers, sourceProfile.answers);
  assert.equal(state().provenance.sourceCommercialYear, 2025);
  assert.equal(state().provenance.targetCommercialYear, 2026);
  assert.deepEqual(state().provenance.categories, ['APPLICABILITY_PROFILE']);
});

test('AW-003: categorías no allowlisted se rechazan antes de crear el destino', async () => {
  const { useCases, state } = harness();
  await assert.rejects(
    () => useCases.initializeFromPriorYear(baseContext, {
      sourceCommercialYear: 2025,
      targetCommercialYear: 2026,
      categories: ['FEE_RECEIPTS']
    }),
    error => error.code === 'unsupported_reusable_category'
  );
  assert.equal(state().targetExists, false);
  assert.equal(state().activeYear, 2025);
});

test('AW-003: repetir la misma inicialización es idempotente y no vuelve a copiar', async () => {
  const { useCases, state } = harness();
  await useCases.initializeFromPriorYear(baseContext, {
    sourceCommercialYear: 2025,
    targetCommercialYear: 2026,
    categories: ['APPLICABILITY_PROFILE']
  });
  const firstProfile = state().copiedProfile;
  const repeated = await useCases.initializeFromPriorYear(baseContext, {
    sourceCommercialYear: 2025,
    targetCommercialYear: 2026,
    categories: ['APPLICABILITY_PROFILE']
  });
  assert.equal(repeated.alreadyInitialized, true);
  assert.equal(state().copiedProfile, firstProfile);
});

test('AW-003: fallo parcial revierte workspace destino y restaura el año previamente activo', async () => {
  const failingInitializationRepository = {
    async getByTargetWorkspaceId() { return null; },
    async create() { throw new Error('provenance write failed'); }
  };
  const { useCases, state } = harness({ initializationRepository: failingInitializationRepository });
  await assert.rejects(
    () => useCases.initializeFromPriorYear(baseContext, {
      sourceCommercialYear: 2025,
      targetCommercialYear: 2026,
      categories: ['APPLICABILITY_PROFILE']
    }),
    /provenance write failed/
  );
  assert.equal(state().targetExists, false);
  assert.equal(state().activeYear, 2025);
  assert.equal(state().removeCalls, 1);
});
