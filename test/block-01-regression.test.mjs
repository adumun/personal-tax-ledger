import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAnnualWorkspaceFlowUseCases,
  createAnnualWorkspaceOverviewUseCases,
  createPriorYearInitializationUseCases,
  createTaxApplicabilityProfileReviewUseCases,
  createTaxApplicabilityProfileUseCases,
  PRIOR_YEAR_REUSABLE_CATEGORY,
  TAX_FACT_PRESENCE
} from '@personal-tax-ledger/application';

const baseContext = Object.freeze({ workspaceId: 'local-workspace', actorId: 'local-user' });

function workspace(year) {
  return Object.freeze({
    id: `annual-tax-workspace-${year}`,
    commercialYear: year,
    derivedTaxYearLabel: `AT${year + 1}`,
    lifecycleState: 'PREPARING',
    createdAt: '2026-09-13T00:00:00.000Z',
    updatedAt: '2026-09-13T00:00:00.000Z',
    ruleVersionRef: null
  });
}

function annualContext(year) {
  return Object.freeze({ ...baseContext, annualWorkspaceId: workspace(year).id, commercialYear: year });
}

test('BLOCK-01: annual workspace remains explicit, supported and duplicate-safe', async () => {
  const rows = new Map([[2026, workspace(2026)]]);
  let activeYear = 2026;
  const flow = createAnnualWorkspaceFlowUseCases({
    repository: {
      async list() { return [...rows.values()]; },
      async getByCommercialYear(_context, year) { return rows.get(Number(year)) || null; },
      async create(_context, item) { rows.set(item.commercialYear, item); return item; },
      async remove(_context, year) { return rows.delete(Number(year)); }
    },
    settingsUseCases: {
      async getSettings() { return { year: activeYear }; },
      async updateSettings(_context, patch) { activeYear = Number(patch.year); return { year: activeYear }; }
    },
    supportedYearPolicyUseCases: {
      async getSupportedYearState(year) {
        return { commercialYear: Number(year), state: Number(year) === 2027 ? 'UNSUPPORTED' : 'SUPPORTED', missingRuleKeys: [], warnings: [] };
      }
    },
    now: () => '2026-09-13T00:00:00.000Z'
  });

  await assert.rejects(() => flow.selectWorkspace(baseContext, 2025), error => error.code === 'annual_workspace_not_found');
  assert.equal(rows.has(2025), false);

  await assert.rejects(() => flow.createEmptyWorkspace(baseContext, 2026), error => error.code === 'annual_workspace_already_exists');
  assert.equal(rows.size, 1);

  await assert.rejects(() => flow.createEmptyWorkspace(baseContext, 2027), error => error.code === 'unsupported_tax_year');
  assert.equal(rows.has(2027), false);
  assert.equal(activeYear, 2026);
});

test('BLOCK-01: stale annual mutation cannot rebind into the newly active workspace', async () => {
  let upserts = 0;
  const profileUseCases = createTaxApplicabilityProfileUseCases({
    repository: {
      async get() { return null; },
      async upsert(_context, profile) { upserts += 1; return profile; }
    },
    resolveActiveContext: async () => annualContext(2026),
    now: () => '2026-09-13T00:00:00.000Z'
  });

  await assert.rejects(
    () => profileUseCases.saveTaxApplicabilityProfile(annualContext(2025), { DEPENDENT_INCOME: 'YES' }),
    error => error.code === 'workspace_year_mismatch'
  );
  assert.equal(upserts, 0);
});

test('BLOCK-01: applicability declaration never overrides canonical facts', async () => {
  const answers = {
    DEPENDENT_INCOME: 'NO',
    DOMESTIC_FEE_INCOME: 'UNKNOWN',
    FOREIGN_SERVICE_INCOME: 'UNKNOWN',
    APV_CONTRIBUTIONS: 'UNKNOWN',
    MORTGAGE_INTEREST: 'UNKNOWN'
  };
  const profile = Object.freeze({
    annualWorkspaceId: annualContext(2026).annualWorkspaceId,
    commercialYear: 2026,
    profileVersion: 1,
    answers: Object.freeze(answers),
    updatedAt: '2026-09-13T00:00:00.000Z'
  });
  const review = createTaxApplicabilityProfileReviewUseCases({
    profileUseCases: {
      async getTaxApplicabilityProfile() { return profile; },
      async saveTaxApplicabilityProfile() { return profile; }
    },
    async readCanonicalFactPresence() {
      return { DEPENDENT_INCOME: TAX_FACT_PRESENCE.PRESENT };
    }
  });

  const projected = await review.getTaxApplicabilityProfileReview(annualContext(2026));
  const salary = projected.dimensions.find(item => item.dimension === 'DEPENDENT_INCOME');
  assert.equal(salary.answer, 'NO');
  assert.equal(salary.factPresence, 'PRESENT');
  assert.equal(salary.state, 'NEEDS_REVIEW');
  assert.equal(projected.profile.answers.DEPENDENT_INCOME, 'NO');
});

test('BLOCK-01: overview remains structural and never becomes a tax-result surface', async () => {
  const overview = createAnnualWorkspaceOverviewUseCases({
    annualWorkspaceRepository: {
      async getByCommercialYear() { return workspace(2026); }
    },
    profileReviewUseCases: {
      async getTaxApplicabilityProfileReview() {
        return {
          profile: { updatedAt: '2026-09-13T01:00:00.000Z' },
          dimensions: [
            { answer: 'YES' }, { answer: 'NO' }, { answer: 'UNKNOWN' }, { answer: 'UNKNOWN' }, { answer: 'YES' }
          ],
          pendingCount: 2,
          needsReviewCount: 1
        };
      }
    },
    incomeUseCases: { async listIncomeSources() { return []; } },
    feeReceiptUseCases: { async listFeeReceipts() { return []; } },
    mortgageUseCases: { async listMortgageLoans() { return []; } },
    supportedYearPolicyUseCases: {
      async getSupportedYearState() { return { state: 'SUPPORTED', missingRuleKeys: [], warnings: [] }; }
    }
  });

  const result = await overview.getAnnualWorkspaceOverview(annualContext(2026));
  assert.equal(result.period.commercialYear, 2026);
  assert.equal(result.period.derivedTaxYearLabel, 'AT2027');
  assert.equal(result.information.dependentIncomeSources, 0);
  assert.equal(result.information.feeReceipts, 0);
  assert.equal(result.information.mortgages, 0);
  for (const forbidden of ['refund', 'payment', 'taxLiability', 'readiness', 'taxHealth', 'siiReconciliation', 'optimization']) {
    assert.equal(forbidden in result, false, `${forbidden} must not be projected by Block 01 overview`);
  }
});

test('BLOCK-01: prior-year initialization is allowlisted, auditable and idempotent', async () => {
  const source = workspace(2025);
  const target = workspace(2026);
  let targetExists = false;
  let activeYear = 2025;
  let copiedProfile = null;
  let provenance = null;
  const sourceProfile = {
    annualWorkspaceId: source.id,
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

  const initialization = createPriorYearInitializationUseCases({
    annualWorkspaceRepository: {
      async list() { return [source, ...(targetExists ? [target] : [])]; },
      async getByCommercialYear(_context, year) {
        if (Number(year) === 2025) return source;
        if (Number(year) === 2026 && targetExists) return target;
        return null;
      },
      async create() { throw new Error('not used directly'); },
      async remove(_context, year) { if (Number(year) === 2026) targetExists = false; return true; }
    },
    annualWorkspaceFlowUseCases: {
      async createEmptyWorkspace() {
        targetExists = true;
        activeYear = 2026;
        return { workspace: target, support: { state: 'SUPPORTED' }, activeCommercialYear: 2026 };
      }
    },
    settingsUseCases: {
      async getSettings() { return { year: activeYear }; },
      async updateSettings(_context, patch) { activeYear = Number(patch.year); return { year: activeYear }; }
    },
    taxApplicabilityProfileRepository: {
      async get(context) { return context.annualWorkspaceId === source.id ? sourceProfile : copiedProfile; },
      async upsert(_context, profile) { copiedProfile = profile; return profile; }
    },
    initializationRepository: {
      async getByTargetWorkspaceId() { return provenance; },
      async create(_context, record) { provenance = record; return record; }
    },
    now: () => '2026-09-13T02:00:00.000Z'
  });

  const preview = await initialization.previewPriorYearInitialization(baseContext, {
    sourceCommercialYear: 2025,
    targetCommercialYear: 2026
  });
  assert.deepEqual(preview.categories.map(item => item.key), [PRIOR_YEAR_REUSABLE_CATEGORY.APPLICABILITY_PROFILE]);
  assert.ok(preview.forbiddenCopy.includes('FEE_RECEIPTS'));
  assert.ok(preview.forbiddenCopy.includes('DOCUMENTARY_EVIDENCE'));

  const request = {
    sourceCommercialYear: 2025,
    targetCommercialYear: 2026,
    categories: [PRIOR_YEAR_REUSABLE_CATEGORY.APPLICABILITY_PROFILE]
  };
  const first = await initialization.initializeFromPriorYear(baseContext, request);
  assert.equal(first.alreadyInitialized, false);
  assert.equal(copiedProfile.annualWorkspaceId, target.id);
  assert.equal(copiedProfile.commercialYear, 2026);
  assert.deepEqual(provenance.categories, ['APPLICABILITY_PROFILE']);

  const copiedIdentity = copiedProfile;
  const repeated = await initialization.initializeFromPriorYear(baseContext, request);
  assert.equal(repeated.alreadyInitialized, true);
  assert.equal(copiedProfile, copiedIdentity);
});
