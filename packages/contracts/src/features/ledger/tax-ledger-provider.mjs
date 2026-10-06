export const TAX_LEDGER_PROVIDER_METHODS = Object.freeze(['list']);

export function assertTaxLedgerProviderContract(provider) {
  if (!provider || typeof provider !== 'object') throw new TypeError('tax ledger provider is required');
  for (const method of TAX_LEDGER_PROVIDER_METHODS) {
    if (typeof provider[method] !== 'function') throw new TypeError(`tax ledger provider must implement ${method}()`);
  }
  return provider;
}
