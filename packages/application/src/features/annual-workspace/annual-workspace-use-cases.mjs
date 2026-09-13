import { assertAnnualTaxWorkspaceRepositoryContract } from '@personal-tax-ledger/contracts';

export function createAnnualWorkspaceUseCases({ repository }) {
  assertAnnualTaxWorkspaceRepositoryContract(repository);

  return {
    async listWorkspaces(context) {
      return repository.list(context);
    },

    async getWorkspaceByCommercialYear(context, commercialYear) {
      return repository.getByCommercialYear(context, commercialYear);
    },

    async createWorkspace(context, workspace) {
      return repository.create(context, workspace);
    }
  };
}
