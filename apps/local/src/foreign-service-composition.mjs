import {
  createBcchForeignExchangeProvider,
  createForeignServiceIncomeUseCases,
  createFeeReceiptForeignSettlementUseCases
} from '@personal-tax-ledger/application';
import { createForeignServiceRouter } from '@personal-tax-ledger/http-api';
import {
  createSqliteForeignServiceIncomeRepository,
  createSqliteFeeReceiptForeignSettlementRepository
} from '@personal-tax-ledger/sqlite-adapter';

export function createForeignServiceComposition(dependencies) {
  const foreignServiceIncomeRepository = dependencies?.foreignServiceIncomeRepository
    || createSqliteForeignServiceIncomeRepository(undefined, dependencies?.database);
  const feeReceiptForeignSettlementRepository = dependencies?.feeReceiptForeignSettlementRepository
    || createSqliteFeeReceiptForeignSettlementRepository(undefined, dependencies?.database);
  const fxProvider = dependencies?.foreignExchangeProvider
    || (dependencies?.bcchLookupRate
      ? createBcchForeignExchangeProvider({ lookupRate: dependencies.bcchLookupRate })
      : undefined);
  const foreignServiceUseCases = createForeignServiceIncomeUseCases({
    repository: foreignServiceIncomeRepository,
    fxProvider,
    resolveActiveContext: dependencies?.resolveAnnualContext
  });
  const feeReceiptForeignSettlementUseCases = createFeeReceiptForeignSettlementUseCases({
    repository: feeReceiptForeignSettlementRepository,
    feeReceiptUseCases: dependencies?.feeReceiptUseCases,
    resolveActiveContext: dependencies?.resolveAnnualContext
  });

  return {
    foreignServiceIncomeRepository,
    feeReceiptForeignSettlementRepository,
    foreignExchangeProvider: fxProvider,
    foreignServiceUseCases,
    feeReceiptForeignSettlementUseCases,
    createForeignServiceRouter: routerDependencies => createForeignServiceRouter({
      ...routerDependencies,
      foreignServiceUseCases,
      settlementUseCases: feeReceiptForeignSettlementUseCases,
      resolveContext: dependencies?.resolveAnnualContext
    })
  };
}
