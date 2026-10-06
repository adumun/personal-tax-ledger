import { createAnnualWorkspaceOverviewUseCases } from '@personal-tax-ledger/application';
import { createAnnualWorkspaceOverviewRouter } from '@personal-tax-ledger/http-api';

export function createAnnualWorkspaceOverviewComposition(dependencies) {
  const useCases = createAnnualWorkspaceOverviewUseCases({
    annualWorkspaceRepository: dependencies.annualWorkspaceRepository,
    profileReviewUseCases: dependencies.taxApplicabilityProfileReviewUseCases,
    incomeUseCases: dependencies.incomeUseCases,
    feeReceiptUseCases: dependencies.feeReceiptUseCases,
    mortgageUseCases: dependencies.mortgageUseCases,
    supportedYearPolicyUseCases: dependencies.supportedYearPolicyUseCases
  });

  return {
    annualWorkspaceOverviewUseCases: useCases,
    createAnnualWorkspaceOverviewRouter: routerDependencies => createAnnualWorkspaceOverviewRouter({
      ...routerDependencies,
      useCases,
      resolveContext: dependencies.resolveAnnualContext
    })
  };
}
