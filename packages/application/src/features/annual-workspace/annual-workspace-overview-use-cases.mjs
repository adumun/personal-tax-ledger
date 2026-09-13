import { assertAnnualWorkspaceContext } from '@personal-tax-ledger/contracts';

function latestTimestamp(...values) {
  const valid = values.filter(Boolean).map(value => new Date(value)).filter(value => !Number.isNaN(value.getTime()));
  if (valid.length === 0) return null;
  return new Date(Math.max(...valid.map(value => value.getTime()))).toISOString();
}

export function createAnnualWorkspaceOverviewUseCases({
  annualWorkspaceRepository,
  profileReviewUseCases,
  incomeUseCases,
  feeReceiptUseCases,
  mortgageUseCases,
  supportedYearPolicyUseCases
}) {
  if (typeof annualWorkspaceRepository?.getByCommercialYear !== 'function') throw new TypeError('Overview requiere AnnualTaxWorkspaceRepository');
  if (typeof profileReviewUseCases?.getTaxApplicabilityProfileReview !== 'function') throw new TypeError('Overview requiere applicability review');
  if (typeof incomeUseCases?.listIncomeSources !== 'function') throw new TypeError('Overview requiere income use cases');
  if (typeof feeReceiptUseCases?.listFeeReceipts !== 'function') throw new TypeError('Overview requiere fee receipt use cases');
  if (typeof mortgageUseCases?.listMortgageLoans !== 'function') throw new TypeError('Overview requiere mortgage use cases');
  if (typeof supportedYearPolicyUseCases?.getSupportedYearState !== 'function') throw new TypeError('Overview requiere supported-year policy');

  return {
    async getAnnualWorkspaceOverview(context) {
      const scoped = assertAnnualWorkspaceContext(context);
      const [workspace, profileReview, incomes, feeReceipts, mortgages, ruleSupport] = await Promise.all([
        annualWorkspaceRepository.getByCommercialYear(scoped, scoped.commercialYear),
        profileReviewUseCases.getTaxApplicabilityProfileReview(scoped),
        incomeUseCases.listIncomeSources(scoped),
        feeReceiptUseCases.listFeeReceipts(scoped),
        mortgageUseCases.listMortgageLoans(scoped),
        supportedYearPolicyUseCases.getSupportedYearState(scoped.commercialYear)
      ]);
      if (!workspace) throw Object.assign(new Error('Annual workspace activo no encontrado'), { code: 'active_workspace_not_found' });

      const answeredCount = profileReview.dimensions.filter(item => item.answer !== 'UNKNOWN').length;
      return Object.freeze({
        period: Object.freeze({
          commercialYear: workspace.commercialYear,
          derivedTaxYearLabel: workspace.derivedTaxYearLabel,
          lifecycleState: workspace.lifecycleState,
          updatedAt: latestTimestamp(workspace.updatedAt, profileReview.profile.updatedAt)
        }),
        profile: Object.freeze({
          answeredCount,
          totalCount: profileReview.dimensions.length,
          pendingCount: profileReview.pendingCount,
          needsReviewCount: profileReview.needsReviewCount
        }),
        information: Object.freeze({
          dependentIncomeSources: incomes.filter(item => item.kind === 'SALARY').length,
          feeReceipts: feeReceipts.length,
          mortgages: mortgages.length,
          evidence: Object.freeze({ state: 'UNAVAILABLE', label: 'Capacidad aún no disponible' })
        }),
        rules: Object.freeze({
          state: ruleSupport.state,
          missingRuleKeys: ruleSupport.missingRuleKeys || [],
          warnings: ruleSupport.warnings || []
        })
      });
    }
  };
}
