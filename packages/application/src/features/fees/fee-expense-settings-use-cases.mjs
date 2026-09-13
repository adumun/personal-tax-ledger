import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertFeeExpenseSettingsRepositoryContract
} from '@personal-tax-ledger/contracts';
import { createActiveWorkspaceGuard } from '../../shared/active-workspace-guard.mjs';

export function createFeeExpenseSettingsUseCases({ repository, resolveActiveContext }) {
  assertFeeExpenseSettingsRepositoryContract(repository);
  const assertContextStillActive = createActiveWorkspaceGuard(resolveActiveContext);
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
      await assertContextStillActive(context, 'upsertFeeExpenseSettings');
      return repository.upsert(context, year, data);
    }
  };
}
