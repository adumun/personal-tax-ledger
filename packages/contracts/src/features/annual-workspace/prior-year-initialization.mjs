export const PRIOR_YEAR_INITIALIZATION_REPOSITORY_METHODS = Object.freeze([
  'getByTargetWorkspaceId',
  'create'
]);

export function assertPriorYearInitializationRepositoryContract(repository) {
  for (const method of PRIOR_YEAR_INITIALIZATION_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') {
      throw new TypeError(`PriorYearInitializationRepository requiere ${method}()`);
    }
  }
  return repository;
}
