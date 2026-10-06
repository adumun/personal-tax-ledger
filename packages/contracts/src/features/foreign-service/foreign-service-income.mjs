export const FOREIGN_SERVICE_INCOME_REPOSITORY_METHODS = Object.freeze([
  'list',
  'get',
  'create',
  'updateEconomicFact',
  'appendConversion',
  'listConversions'
]);

export function assertForeignServiceIncomeRepositoryContract(repository) {
  for (const method of FOREIGN_SERVICE_INCOME_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') {
      throw new TypeError(`foreign service income repository requires ${method}()`);
    }
  }
  return repository;
}

export const FOREIGN_EXCHANGE_PROVIDER_METHODS = Object.freeze(['resolveRate']);

export function assertForeignExchangeProviderContract(provider) {
  for (const method of FOREIGN_EXCHANGE_PROVIDER_METHODS) {
    if (typeof provider?.[method] !== 'function') throw new TypeError(`foreign exchange provider requires ${method}()`);
  }
  return provider;
}
