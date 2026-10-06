import {
  assertAnnualWorkspaceContext,
  assertTaxApplicabilityProfileRepositoryContract
} from '@personal-tax-ledger/contracts';
import {
  createTaxApplicabilityProfile,
  normalizeTaxApplicabilityAnswers
} from '@personal-tax-ledger/core';
import { createActiveWorkspaceGuard } from '../../shared/active-workspace-guard.mjs';

export function createTaxApplicabilityProfileUseCases({
  repository,
  resolveActiveContext,
  now = () => new Date().toISOString()
}) {
  assertTaxApplicabilityProfileRepositoryContract(repository);
  const assertContextStillActive = createActiveWorkspaceGuard(resolveActiveContext);

  return {
    async getTaxApplicabilityProfile(context) {
      const scoped = assertAnnualWorkspaceContext(context);
      const persisted = await repository.get(scoped, scoped.annualWorkspaceId);
      if (persisted) return createTaxApplicabilityProfile(persisted);
      return createTaxApplicabilityProfile({
        annualWorkspaceId: scoped.annualWorkspaceId,
        commercialYear: scoped.commercialYear,
        answers: {},
        updatedAt: now()
      });
    },

    async saveTaxApplicabilityProfile(context, answers) {
      const scoped = assertAnnualWorkspaceContext(context);
      const normalizedAnswers = normalizeTaxApplicabilityAnswers(answers);
      await assertContextStillActive(scoped, 'saveTaxApplicabilityProfile');
      const profile = createTaxApplicabilityProfile({
        annualWorkspaceId: scoped.annualWorkspaceId,
        commercialYear: scoped.commercialYear,
        answers: normalizedAnswers,
        updatedAt: now()
      });
      const saved = await repository.upsert(scoped, profile);
      return createTaxApplicabilityProfile(saved);
    }
  };
}
