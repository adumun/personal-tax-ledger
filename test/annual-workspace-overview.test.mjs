import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnnualWorkspaceOverviewUseCases } from '@personal-tax-ledger/application';

const context = {
  workspaceId: 'local-workspace',
  actorId: 'local-user',
  annualWorkspaceId: 'annual-tax-workspace-2026',
  commercialYear: 2026
};

function createUseCases(overrides = {}) {
  return createAnnualWorkspaceOverviewUseCases({
    annualWorkspaceRepository: {
      async getByCommercialYear() {
        return {
          id: context.annualWorkspaceId,
          commercialYear: 2026,
          derivedTaxYearLabel: 'AT2027',
          lifecycleState: 'PREPARING',
          createdAt: '2026-09-01T00:00:00.000Z',
          updatedAt: '2026-09-12T10:00:00.000Z',
          ruleVersionRef: null
        };
      }
    },
    profileReviewUseCases: {
      async getTaxApplicabilityProfileReview() {
        return {
          profile: { updatedAt: '2026-09-13T01:00:00.000Z' },
          dimensions: [
            { answer: 'YES' },
            { answer: 'NO' },
            { answer: 'UNKNOWN' },
            { answer: 'YES' },
            { answer: 'UNKNOWN' }
          ],
          pendingCount: 2,
          needsReviewCount: 1
        };
      }
    },
    incomeUseCases: { async listIncomeSources() { return [{ kind: 'SALARY' }, { kind: 'BONUS' }, { kind: 'SALARY' }]; } },
    feeReceiptUseCases: { async listFeeReceipts() { return [{ id: 'bhe-1' }]; } },
    mortgageUseCases: { async listMortgageLoans() { return []; } },
    supportedYearPolicyUseCases: {
      async getSupportedYearState() { return { state: 'SUPPORTED_WITH_WARNINGS', missingRuleKeys: [], warnings: ['provenance'] }; }
    },
    ...overrides
  });
}

test('AW-005: overview separa estado estructural de resultados tributarios', async () => {
  const overview = await createUseCases().getAnnualWorkspaceOverview(context);
  assert.deepEqual(overview.period, {
    commercialYear: 2026,
    derivedTaxYearLabel: 'AT2027',
    lifecycleState: 'PREPARING',
    updatedAt: '2026-09-13T01:00:00.000Z'
  });
  assert.deepEqual(overview.profile, {
    answeredCount: 3,
    totalCount: 5,
    pendingCount: 2,
    needsReviewCount: 1
  });
  assert.equal(overview.information.dependentIncomeSources, 2);
  assert.equal(overview.information.feeReceipts, 1);
  assert.equal(overview.information.mortgages, 0);
  assert.equal(overview.information.evidence.state, 'UNAVAILABLE');
  assert.equal(overview.rules.state, 'SUPPORTED_WITH_WARNINGS');
  assert.equal('refund' in overview, false);
  assert.equal('readiness' in overview, false);
  assert.equal('taxHealth' in overview, false);
});

test('AW-005: ausencia de datos se expresa como presencia/conteo estructural, no como monto cero', async () => {
  const overview = await createUseCases({
    incomeUseCases: { async listIncomeSources() { return []; } },
    feeReceiptUseCases: { async listFeeReceipts() { return []; } },
    mortgageUseCases: { async listMortgageLoans() { return []; } }
  }).getAnnualWorkspaceOverview(context);
  assert.equal(overview.information.dependentIncomeSources, 0);
  assert.equal(overview.information.feeReceipts, 0);
  assert.equal(overview.information.mortgages, 0);
  assert.equal(Object.values(overview.information).some(value => typeof value === 'string' && value.includes('$0')), false);
});
