import { LOCAL_WORKSPACE_CONTEXT } from '@personal-tax-ledger/contracts';
import { createTaxParameterUseCases, createTaxRuleSourceUseCases } from '@personal-tax-ledger/application';
import { createSqliteTaxParameterRepository, createSqliteTaxRuleSourceRepository } from '@personal-tax-ledger/sqlite-adapter';
import { createTaxParameterRouter, createTaxRuleSourceRouter } from '@personal-tax-ledger/http-api';

export function createTaxParameterComposition(dependencies) {
  const repository = dependencies?.taxParameterRepository || createSqliteTaxParameterRepository(undefined, dependencies?.database);
  const useCases = createTaxParameterUseCases({ repository, resolveActiveContext: dependencies?.resolveAnnualContext });
  return {
    taxParameterUseCases: useCases,
    createTaxParameterRouter: routerDependencies => createTaxParameterRouter({
      ...routerDependencies,
      useCases,
      context: LOCAL_WORKSPACE_CONTEXT,
      resolveContext: dependencies?.resolveAnnualContext
    })
  };
}

export function createTaxRuleSourceComposition(dependencies) {
  const repository = dependencies?.taxRuleSourceRepository || createSqliteTaxRuleSourceRepository(undefined, dependencies?.database);
  const useCases = createTaxRuleSourceUseCases({ repository });
  return {
    taxRuleSourceUseCases: useCases,
    createTaxRuleSourceRouter: routerDependencies => createTaxRuleSourceRouter({ ...routerDependencies, useCases })
  };
}
