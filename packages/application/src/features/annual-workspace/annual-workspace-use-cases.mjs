import {
  assertAnnualTaxWorkspaceRepositoryContract,
  assertSettingsRepositoryContract,
  assertWorkspaceContext,
  createAnnualWorkspaceContext
} from '@personal-tax-ledger/contracts';

export function createAnnualWorkspaceUseCases({ repository }) {
  assertAnnualTaxWorkspaceRepositoryContract(repository);

  return {
    async listWorkspaces(context) {
      assertWorkspaceContext(context);
      return repository.list(context);
    },

    async getWorkspaceByCommercialYear(context, commercialYear) {
      assertWorkspaceContext(context);
      return repository.getByCommercialYear(context, commercialYear);
    },

    async createWorkspace(context, workspace) {
      assertWorkspaceContext(context);
      return repository.create(context, workspace);
    }
  };
}

export function createActiveAnnualWorkspaceContextResolver({
  settingsRepository,
  annualWorkspaceRepository,
  baseContext
}) {
  assertSettingsRepositoryContract(settingsRepository);
  assertAnnualTaxWorkspaceRepositoryContract(annualWorkspaceRepository);
  assertWorkspaceContext(baseContext);

  return async function resolveActiveAnnualWorkspaceContext() {
    const settings = await settingsRepository.get(baseContext);
    const commercialYear = Number(settings?.year);
    const workspace = await annualWorkspaceRepository.getByCommercialYear(baseContext, commercialYear);
    if (!workspace) {
      const error = new Error(`No existe AnnualTaxWorkspace para el año activo ${commercialYear}`);
      error.name = 'ActiveAnnualWorkspaceNotFoundError';
      error.code = 'active_workspace_not_found';
      error.commercialYear = commercialYear;
      throw error;
    }
    return createAnnualWorkspaceContext(baseContext, workspace);
  };
}
