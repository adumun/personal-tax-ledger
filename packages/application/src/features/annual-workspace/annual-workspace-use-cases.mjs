import {
  assertAnnualTaxWorkspaceRepositoryContract,
  assertSettingsRepositoryContract,
  assertWorkspaceContext,
  createAnnualWorkspaceContext
} from '@personal-tax-ledger/contracts';
import {
  createAnnualTaxWorkspace,
  normalizeCommercialYear,
  TAX_YEAR_SUPPORT
} from '@personal-tax-ledger/core';

function flowError(code, message, details = {}) {
  const error = new Error(message);
  error.name = 'AnnualWorkspaceFlowError';
  error.code = code;
  Object.assign(error, details);
  return error;
}

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

export function createAnnualWorkspaceFlowUseCases({
  repository,
  settingsUseCases,
  supportedYearPolicyUseCases,
  now = () => new Date().toISOString()
}) {
  assertAnnualTaxWorkspaceRepositoryContract(repository);
  if (typeof repository?.remove !== 'function') {
    throw new TypeError('AnnualWorkspaceFlow requiere repository.remove() para compensación');
  }
  if (typeof settingsUseCases?.getSettings !== 'function' || typeof settingsUseCases?.updateSettings !== 'function') {
    throw new TypeError('AnnualWorkspaceFlow requiere SettingsUseCases');
  }
  if (typeof supportedYearPolicyUseCases?.getSupportedYearState !== 'function') {
    throw new TypeError('AnnualWorkspaceFlow requiere SupportedYearPolicyUseCases');
  }

  async function supportFor(commercialYear) {
    return supportedYearPolicyUseCases.getSupportedYearState(commercialYear);
  }

  function assertSupportAllowsTransition(support, acceptWarnings) {
    if (support.state === TAX_YEAR_SUPPORT.UNSUPPORTED) {
      throw flowError(
        'unsupported_tax_year',
        `PTL no dispone de un rule set completo para el año comercial ${support.commercialYear}`,
        { commercialYear: support.commercialYear, support }
      );
    }
    if (support.state === TAX_YEAR_SUPPORT.SUPPORTED_WITH_WARNINGS && !acceptWarnings) {
      throw flowError(
        'tax_year_support_warning_confirmation_required',
        `El año comercial ${support.commercialYear} tiene reglas operativas sin provenance completa`,
        { commercialYear: support.commercialYear, support }
      );
    }
  }

  return {
    async listWorkspaceOptions(context) {
      assertWorkspaceContext(context);
      const [workspaces, settings] = await Promise.all([
        repository.list(context),
        settingsUseCases.getSettings(context)
      ]);
      const support = await Promise.all(workspaces.map(workspace => supportFor(workspace.commercialYear)));
      return {
        activeCommercialYear: Number(settings.year),
        workspaces: workspaces.map((workspace, index) => ({ workspace, support: support[index] }))
      };
    },

    async selectWorkspace(context, commercialYear, { acceptWarnings = false } = {}) {
      assertWorkspaceContext(context);
      const year = normalizeCommercialYear(commercialYear);
      const workspace = await repository.getByCommercialYear(context, year);
      if (!workspace) {
        throw flowError('annual_workspace_not_found', `No existe workspace para el año comercial ${year}`, { commercialYear: year });
      }
      const support = await supportFor(year);
      assertSupportAllowsTransition(support, acceptWarnings);
      await settingsUseCases.updateSettings(context, { year });
      return { workspace, support, activeCommercialYear: year };
    },

    async createEmptyWorkspace(context, commercialYear, { acceptWarnings = false } = {}) {
      assertWorkspaceContext(context);
      const year = normalizeCommercialYear(commercialYear);
      const existing = await repository.getByCommercialYear(context, year);
      if (existing) {
        throw flowError('annual_workspace_already_exists', `Ya existe workspace para el año comercial ${year}`, {
          commercialYear: year,
          existingWorkspace: existing
        });
      }

      const support = await supportFor(year);
      assertSupportAllowsTransition(support, acceptWarnings);
      const timestamp = now();
      const workspace = createAnnualTaxWorkspace({
        id: `annual-tax-workspace-${year}`,
        commercialYear: year,
        createdAt: timestamp,
        updatedAt: timestamp,
        ruleVersionRef: null
      });

      const created = await repository.create(context, workspace);
      try {
        await settingsUseCases.updateSettings(context, { year });
      } catch (error) {
        await repository.remove(context, year);
        throw error;
      }

      return { workspace: created, support, activeCommercialYear: year };
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
