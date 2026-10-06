export const TAX_APPLICABILITY_PROFILE_REPOSITORY_METHODS = Object.freeze(['get', 'upsert']);

export function assertTaxApplicabilityProfileRepositoryContract(repository) {
  for (const method of TAX_APPLICABILITY_PROFILE_REPOSITORY_METHODS) {
    if (typeof repository?.[method] !== 'function') {
      throw new TypeError(`TaxApplicabilityProfileRepository requiere ${method}()`);
    }
  }
  return repository;
}
