import {
  assertAnnualWorkspaceContext,
  assertFeeReceiptForeignSettlementRepositoryContract
} from '@personal-tax-ledger/contracts';
import {
  configureFeeReceiptForeignSettlementDatabase,
  getFeeReceiptForeignSettlement,
  upsertFeeReceiptForeignSettlement
} from './database/fee-receipt-foreign-settlements.mjs';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteFeeReceiptForeignSettlementRepository(delegate, database) {
  let resolved;

  async function resolveDelegate() {
    if (delegate) return delegate;
    if (!resolved) {
      const connection = database || createSqliteDatabase();
      configureFeeReceiptForeignSettlementDatabase(connection.db);
      resolved = {
        getFeeReceiptForeignSettlement,
        upsertFeeReceiptForeignSettlement
      };
    }
    return resolved;
  }

  return assertFeeReceiptForeignSettlementRepositoryContract({
    async getByFeeReceiptId(context, feeReceiptId) {
      assertAnnualWorkspaceContext(context);
      const api = await resolveDelegate();
      return api.getFeeReceiptForeignSettlement(feeReceiptId);
    },
    async upsert(context, feeReceiptId, input) {
      assertAnnualWorkspaceContext(context);
      const api = await resolveDelegate();
      return api.upsertFeeReceiptForeignSettlement(feeReceiptId, input);
    }
  });
}
