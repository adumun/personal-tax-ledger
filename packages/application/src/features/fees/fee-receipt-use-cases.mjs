import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertFeeReceiptRepositoryContract
} from '@personal-tax-ledger/contracts';
import { createActiveWorkspaceGuard } from '../../shared/active-workspace-guard.mjs';

function assertEntityInActiveYear(context, entity, operation) {
  if (!entity) return null;
  assertContextCommercialYear(context, entity.taxYear, operation);
  return entity;
}

export function createFeeReceiptUseCases({ repository, resolveActiveContext }) {
  assertFeeReceiptRepositoryContract(repository);
  const assertContextStillActive = createActiveWorkspaceGuard(resolveActiveContext);
  return {
    async listFeeReceipts(context, filters = {}) {
      assertAnnualWorkspaceContext(context);
      const taxYear = filters.taxYear == null || filters.taxYear === ''
        ? context.commercialYear
        : assertContextCommercialYear(context, filters.taxYear, 'listFeeReceipts');
      return repository.list(context, { ...filters, taxYear });
    },
    async getFeeReceipt(context, id) {
      assertAnnualWorkspaceContext(context);
      return assertEntityInActiveYear(context, await repository.get(context, id), 'getFeeReceipt');
    },
    async createFeeReceipt(context, input) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, input?.taxYear, 'createFeeReceipt');
      await assertContextStillActive(context, 'createFeeReceipt');
      return repository.create(context, input);
    },
    async updateFeeReceipt(context, id, input) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, input?.taxYear, 'updateFeeReceipt');
      const current = await repository.get(context, id);
      if (!current) return null;
      assertEntityInActiveYear(context, current, 'updateFeeReceipt');
      await assertContextStillActive(context, 'updateFeeReceipt');
      return repository.update(context, id, input);
    },
    async deleteFeeReceipt(context, id) {
      assertAnnualWorkspaceContext(context);
      const current = await repository.get(context, id);
      if (!current) return false;
      assertEntityInActiveYear(context, current, 'deleteFeeReceipt');
      await assertContextStillActive(context, 'deleteFeeReceipt');
      return repository.remove(context, id);
    },
    async duplicateFeeReceipt(context, id) {
      assertAnnualWorkspaceContext(context);
      const current = await repository.get(context, id);
      if (!current) return null;
      assertEntityInActiveYear(context, current, 'duplicateFeeReceipt');
      await assertContextStillActive(context, 'duplicateFeeReceipt');
      return repository.duplicate(context, id);
    }
  };
}
