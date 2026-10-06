export const FEE_RECEIPT_FOREIGN_SETTLEMENT_REPOSITORY_METHODS = Object.freeze([
  'getByFeeReceiptId',
  'upsert'
]);

export function assertFeeReceiptForeignSettlementRepositoryContract(repository) {
  for (const method of FEE_RECEIPT_FOREIGN_SETTLEMENT_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') {
      throw new TypeError(`fee receipt foreign settlement repository must implement ${method}()`);
    }
  }
  return repository;
}
