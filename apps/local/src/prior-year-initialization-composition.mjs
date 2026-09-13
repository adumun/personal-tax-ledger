import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createPriorYearInitializationUseCases } from '@personal-tax-ledger/application';
import { createSqlitePriorYearInitializationRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createPriorYearInitializationRouter } from '@personal-tax-ledger/http-api';

export function createPriorYearInitializationComposition(dependencies) {
  const initializationRepository = dependencies?.priorYearInitializationRepository
    || createSqlitePriorYearInitializationRepository(undefined, dependencies?.database);
  const useCases = createPriorYearInitializationUseCases({
    annualWorkspaceRepository: dependencies.annualWorkspaceRepository,
    annualWorkspaceFlowUseCases: dependencies.annualWorkspaceFlowUseCases,
    settingsUseCases: dependencies.settingsUseCases,
    taxApplicabilityProfileRepository: dependencies.taxApplicabilityProfileRepository,
    initializationRepository
  });

  return {
    priorYearInitializationRepository: initializationRepository,
    priorYearInitializationUseCases: useCases,
    createPriorYearInitializationRouter: routerDependencies => createPriorYearInitializationRouter({
      ...routerDependencies,
      useCases,
      context: LOCAL_WORKSPACE_CONTEXT
    })
  };
}
