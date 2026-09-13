export const ANNUAL_TAX_WORKSPACE_REPOSITORY_METHODS = Object.freeze([
  'list',
  'getByCommercialYear',
  'create',
  'remove'
]);

export function assertAnnualTaxWorkspaceRepositoryContract(repository) {
  for (const method of ANNUAL_TAX_WORKSPACE_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') {
      throw new TypeError(`AnnualTaxWorkspaceRepository requiere ${method}()`);
    }
  }
  return repository;
}
