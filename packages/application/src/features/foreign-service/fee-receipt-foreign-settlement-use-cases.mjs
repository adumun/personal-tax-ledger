import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertFeeReceiptForeignSettlementRepositoryContract
} from '@personal-tax-ledger/contracts';
import { createActiveWorkspaceGuard } from '../../shared/active-workspace-guard.mjs';

export function createFeeReceiptForeignSettlementUseCases({ repository, feeReceiptUseCases, resolveActiveContext }) {
  assertFeeReceiptForeignSettlementRepositoryContract(repository);
  if (typeof feeReceiptUseCases?.getFeeReceipt !== 'function') {
    throw new TypeError('feeReceiptUseCases.getFeeReceipt is required');
  }
  const assertContextStillActive = createActiveWorkspaceGuard(resolveActiveContext);

  async function requireOwnedReceipt(context, feeReceiptId, operation) {
    const receipt = await feeReceiptUseCases.getFeeReceipt(context, feeReceiptId);
    if (!receipt) return null;
    assertContextCommercialYear(context, receipt.taxYear, operation);
    return receipt;
  }

  return {
    async getFeeReceiptForeignSettlement(context, feeReceiptId) {
      assertAnnualWorkspaceContext(context);
      const receipt = await requireOwnedReceipt(context, feeReceiptId, 'getFeeReceiptForeignSettlement');
      if (!receipt) return null;
      return repository.getByFeeReceiptId(context, feeReceiptId);
    },

    async upsertFeeReceiptForeignSettlement(context, feeReceiptId, input) {
      assertAnnualWorkspaceContext(context);
      const receipt = await requireOwnedReceipt(context, feeReceiptId, 'upsertFeeReceiptForeignSettlement');
      if (!receipt) return null;
      if (input?.serviceSourceJurisdiction && input.serviceSourceJurisdiction !== 'CHILE') {
        throw new TypeError('BHE foreign settlement only accepts CHILE source jurisdiction');
      }
      await assertContextStillActive(context, 'upsertFeeReceiptForeignSettlement');
      return repository.upsert(context, feeReceiptId, {
        ...input,
        serviceSourceJurisdiction: 'CHILE'
      });
    }
  };
}
