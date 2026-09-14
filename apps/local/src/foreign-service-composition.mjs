import {
  createBcchForeignExchangeProvider,
  createForeignServiceIncomeUseCases
} from '@personal-tax-ledger/application';
import { createSqliteForeignServiceIncomeRepository } from '@personal-tax-ledger/sqlite-adapter';

export function createForeignServiceComposition(dependencies) {
  const foreignServiceIncomeRepository = dependencies?.foreignServiceIncomeRepository
    || createSqliteForeignServiceIncomeRepository(undefined, dependencies?.database);
  const fxProvider = dependencies?.foreignExchangeProvider
    || (dependencies?.bcchLookupRate
      ? createBcchForeignExchangeProvider({ lookupRate: dependencies.bcchLookupRate })
      : undefined);
  const foreignServiceUseCases = createForeignServiceIncomeUseCases({
    repository: foreignServiceIncomeRepository,
    fxProvider,
    resolveActiveContext: dependencies?.resolveAnnualContext
  });

  return {
    foreignServiceIncomeRepository,
    foreignExchangeProvider: fxProvider,
    foreignServiceUseCases
  };
}
