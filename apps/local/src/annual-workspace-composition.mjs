import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import {
  createAnnualWorkspaceFlowUseCases,
  createSupportedYearPolicyUseCases
} from '@personal-tax-ledger/application';
import {
  createSqliteTaxParameterRepository,
  createSqliteTaxRuleSourceRepository
} from '@personal-tax-ledger/sqlite-adapter';
import { createAnnualWorkspaceRouter } from '@personal-tax-ledger/http-api';

export function createAnnualWorkspaceComposition(dependencies) {
  const taxParameterRepository = dependencies?.taxParameterRepository
    || createSqliteTaxParameterRepository(undefined, dependencies?.database);
  const taxRuleSourceRepository = dependencies?.taxRuleSourceRepository
    || createSqliteTaxRuleSourceRepository(undefined, dependencies?.database);
  const supportedYearPolicyUseCases = createSupportedYearPolicyUseCases({
    taxParameterRepository,
    taxRuleSourceRepository
  });
  const annualWorkspaceFlowUseCases = createAnnualWorkspaceFlowUseCases({
    repository: dependencies.annualWorkspaceRepository,
    settingsUseCases: dependencies.settingsUseCases,
    supportedYearPolicyUseCases
  });

  return {
    supportedYearPolicyUseCases,
    annualWorkspaceFlowUseCases,
    createAnnualWorkspaceRouter: routerDependencies => createAnnualWorkspaceRouter({
      ...routerDependencies,
      useCases: annualWorkspaceFlowUseCases,
      context: LOCAL_WORKSPACE_CONTEXT
    })
  };
}
