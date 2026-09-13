import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertFeeExpenseSettingsRepositoryContract
} from '@personal-tax-ledger/contracts';

export function createFeeExpenseSettingsUseCases({ repository }) {
  assertFeeExpenseSettingsRepositoryContract(repository);
  return {
    async listFeeExpenseSettings(context) {
      assertAnnualWorkspaceContext(context);
      const items = await repository.list(context);
      return items.filter(item => Number(item.taxYear) === Number(context.commercialYear));
    },
    async getFeeExpenseSettings(context, taxYear) {
      assertAnnualWorkspaceContext(context);
      const year = assertContextCommercialYear(context, taxYear, 'getFeeExpenseSettings');
      return repository.get(context, year);
    },
    async upsertFeeExpenseSettings(context, taxYear, data) {
      assertAnnualWorkspaceContext(context);
      const year = assertContextCommercialYear(context, taxYear, 'upsertFeeExpenseSettings');
      return repository.upsert(context, year, data);
    }
  };
}
