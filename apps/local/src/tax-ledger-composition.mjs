import {
  createAnnualTaxLedgerReadModel,
  createFeeReceiptTaxLedgerProvider,
  createIncomeSourceTaxLedgerProvider
} from '@personal-tax-ledger/application';
import { createTaxLedgerRouter } from '@personal-tax-ledger/http-api';

export function createTaxLedgerComposition(dependencies) {
  const providers = [
    createIncomeSourceTaxLedgerProvider({ incomeUseCases: dependencies.incomeUseCases }),
    createFeeReceiptTaxLedgerProvider({
      feeReceiptUseCases: dependencies.feeReceiptUseCases,
      settingsUseCases: dependencies.settingsUseCases
    })
  ];
  const readModel = createAnnualTaxLedgerReadModel({ providers });

  return {
    taxLedgerReadModel: readModel,
    taxLedgerProviders: providers,
    createTaxLedgerRouter: routerDependencies => createTaxLedgerRouter({
      ...routerDependencies,
      readModel,
      resolveContext: dependencies.resolveAnnualContext
    })
  };
}
