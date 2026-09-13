import {
  assertAnnualTaxWorkspaceRepositoryContract,
  assertPriorYearInitializationRepositoryContract,
  assertTaxApplicabilityProfileRepositoryContract,
  assertWorkspaceContext,
  createAnnualWorkspaceContext
} from '@personal-tax-ledger/contracts';
import { normalizeCommercialYear } from '@personal-tax-ledger/core';

export const PRIOR_YEAR_REUSABLE_CATEGORY = Object.freeze({
  APPLICABILITY_PROFILE: 'APPLICABILITY_PROFILE'
});

export const PRIOR_YEAR_FORBIDDEN_COPY = Object.freeze([
  'REALIZED_AMOUNTS',
  'FEE_RECEIPTS',
  'WITHHOLDINGS_OR_PPM',
  'LEDGER_MOVEMENTS',
  'DOCUMENTARY_EVIDENCE',
  'SII_RECONCILIATION',
  'READINESS_OR_CLOSURE',
  'CALCULATED_RESULTS_OR_PROJECTIONS'
]);

function initializationError(code, message, details = {}) {
  const error = new Error(message);
  error.name = 'PriorYearInitializationError';
  error.code = code;
  Object.assign(error, details);
  return error;
}

function sameCategories(left, right) {
  return [...left].sort().join('|') === [...right].sort().join('|');
}

export function createPriorYearInitializationUseCases({
  annualWorkspaceRepository,
  annualWorkspaceFlowUseCases,
  settingsUseCases,
  taxApplicabilityProfileRepository,
  initializationRepository,
  now = () => new Date().toISOString()
}) {
  assertAnnualTaxWorkspaceRepositoryContract(annualWorkspaceRepository);
  assertTaxApplicabilityProfileRepositoryContract(taxApplicabilityProfileRepository);
  assertPriorYearInitializationRepositoryContract(initializationRepository);
  if (typeof annualWorkspaceRepository?.remove !== 'function') throw new TypeError('PriorYearInitialization requiere annualWorkspaceRepository.remove()');
  if (typeof annualWorkspaceFlowUseCases?.createEmptyWorkspace !== 'function') throw new TypeError('PriorYearInitialization requiere AnnualWorkspaceFlowUseCases');
  if (typeof settingsUseCases?.getSettings !== 'function' || typeof settingsUseCases?.updateSettings !== 'function') throw new TypeError('PriorYearInitialization requiere SettingsUseCases');

  async function sourceState(context, sourceCommercialYear) {
    const sourceYear = normalizeCommercialYear(sourceCommercialYear);
    const sourceWorkspace = await annualWorkspaceRepository.getByCommercialYear(context, sourceYear);
    if (!sourceWorkspace) {
      throw initializationError('source_annual_workspace_not_found', `No existe workspace fuente para ${sourceYear}`, { sourceCommercialYear: sourceYear });
    }
    const sourceContext = createAnnualWorkspaceContext(context, sourceWorkspace);
    const sourceProfile = await taxApplicabilityProfileRepository.get(sourceContext, sourceWorkspace.id);
    return { sourceYear, sourceWorkspace, sourceContext, sourceProfile };
  }

  function normalizeSelectedCategories(categories) {
    const selected = [...new Set(categories || [])];
    for (const category of selected) {
      if (!Object.values(PRIOR_YEAR_REUSABLE_CATEGORY).includes(category)) {
        throw initializationError('unsupported_reusable_category', `Categoría no reutilizable: ${category}`, { category });
      }
    }
    return selected;
  }

  return {
    async previewPriorYearInitialization(context, { sourceCommercialYear, targetCommercialYear }) {
      assertWorkspaceContext(context);
      const source = await sourceState(context, sourceCommercialYear);
      const targetYear = normalizeCommercialYear(targetCommercialYear);
      if (source.sourceYear === targetYear) {
        throw initializationError('source_target_year_match', 'El año fuente y destino deben ser distintos');
      }
      const existingTarget = await annualWorkspaceRepository.getByCommercialYear(context, targetYear);
      return Object.freeze({
        sourceCommercialYear: source.sourceYear,
        targetCommercialYear: targetYear,
        targetAlreadyExists: Boolean(existingTarget),
        categories: Object.freeze([
          Object.freeze({
            key: PRIOR_YEAR_REUSABLE_CATEGORY.APPLICABILITY_PROFILE,
            label: 'Perfil de aplicabilidad como propuesta',
            available: Boolean(source.sourceProfile),
            selectedByDefault: Boolean(source.sourceProfile)
          })
        ]),
        forbiddenCopy: PRIOR_YEAR_FORBIDDEN_COPY
      });
    },

    async initializeFromPriorYear(context, {
      sourceCommercialYear,
      targetCommercialYear,
      categories = [PRIOR_YEAR_REUSABLE_CATEGORY.APPLICABILITY_PROFILE],
      acceptWarnings = false
    }) {
      assertWorkspaceContext(context);
      const source = await sourceState(context, sourceCommercialYear);
      const targetYear = normalizeCommercialYear(targetCommercialYear);
      if (source.sourceYear === targetYear) {
        throw initializationError('source_target_year_match', 'El año fuente y destino deben ser distintos');
      }
      const selectedCategories = normalizeSelectedCategories(categories);

      const existingTarget = await annualWorkspaceRepository.getByCommercialYear(context, targetYear);
      if (existingTarget) {
        const prior = await initializationRepository.getByTargetWorkspaceId(context, existingTarget.id);
        if (
          prior
          && Number(prior.sourceCommercialYear) === source.sourceYear
          && sameCategories(prior.categories, selectedCategories)
        ) {
          return Object.freeze({ workspace: existingTarget, initialization: prior, alreadyInitialized: true });
        }
        throw initializationError('annual_workspace_already_exists', `Ya existe workspace para ${targetYear}`, { targetCommercialYear: targetYear });
      }

      if (selectedCategories.includes(PRIOR_YEAR_REUSABLE_CATEGORY.APPLICABILITY_PROFILE) && !source.sourceProfile) {
        throw initializationError('reusable_category_unavailable', 'El año fuente no tiene perfil de aplicabilidad reutilizable', {
          category: PRIOR_YEAR_REUSABLE_CATEGORY.APPLICABILITY_PROFILE
        });
      }

      const previousSettings = await settingsUseCases.getSettings(context);
      const created = await annualWorkspaceFlowUseCases.createEmptyWorkspace(context, targetYear, { acceptWarnings });
      const targetContext = createAnnualWorkspaceContext(context, created.workspace);

      try {
        if (selectedCategories.includes(PRIOR_YEAR_REUSABLE_CATEGORY.APPLICABILITY_PROFILE)) {
          await taxApplicabilityProfileRepository.upsert(targetContext, {
            annualWorkspaceId: created.workspace.id,
            commercialYear: targetYear,
            profileVersion: source.sourceProfile.profileVersion,
            answers: source.sourceProfile.answers,
            updatedAt: now()
          });
        }

        const initialization = await initializationRepository.create(context, {
          targetWorkspaceId: created.workspace.id,
          sourceWorkspaceId: source.sourceWorkspace.id,
          sourceCommercialYear: source.sourceYear,
          targetCommercialYear: targetYear,
          categories: selectedCategories,
          initializedAt: now()
        });
        return Object.freeze({ workspace: created.workspace, initialization, alreadyInitialized: false });
      } catch (error) {
        await annualWorkspaceRepository.remove(context, targetYear);
        try {
          await settingsUseCases.updateSettings(context, { year: Number(previousSettings.year) });
        } catch (restoreError) {
          error.restoreActiveYearError = restoreError;
        }
        throw error;
      }
    }
  };
}
