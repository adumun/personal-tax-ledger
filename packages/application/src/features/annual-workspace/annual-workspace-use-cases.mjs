import { createAnnualTaxWorkspace, normalizeCommercialYear } from '@personal-tax-ledger/core';
import { assertAnnualTaxWorkspaceRepositoryContract } from '@personal-tax-ledger/contracts';

export function createAnnualWorkspaceUseCases({ repository }) {
  assertAnnualTaxWorkspaceRepositoryContract(repository);

  return {
    async listWorkspaces(context) {
      return repository.list(context);
    },

    async getWorkspaceByCommercialYear(context, commercialYear) {
      return repository.getByCommercialYear(context, normalizeCommercialYear(commercialYear));
    },

    async createWorkspace(context, input) {
      const workspace = createAnnualTaxWorkspace(input);
      return repository.create(context, workspace);
    }
  };
}
