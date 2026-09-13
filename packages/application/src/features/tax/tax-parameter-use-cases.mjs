import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertTaxParameterRepositoryContract
} from '@personal-tax-ledger/contracts';
import { createActiveWorkspaceGuard } from '../../shared/active-workspace-guard.mjs';

export function createTaxParameterUseCases({ repository, resolveActiveContext }) {
  assertTaxParameterRepositoryContract(repository);
  const assertContextStillActive = createActiveWorkspaceGuard(resolveActiveContext);
  return {
    async listTaxParameters(context, taxYear) {
      assertAnnualWorkspaceContext(context);
      const year = assertContextCommercialYear(context, taxYear, 'listTaxParameters');
      return repository.list(context, year);
    },
    async getTaxParameter(context, taxYear, ruleKey) {
      assertAnnualWorkspaceContext(context);
      const year = assertContextCommercialYear(context, taxYear, 'getTaxParameter');
      return repository.get(context, year, ruleKey);
    },
    async upsertTaxParameter(context, taxYear, ruleKey, value, type, description) {
      assertAnnualWorkspaceContext(context);
      const year = assertContextCommercialYear(context, taxYear, 'upsertTaxParameter');
      await assertContextStillActive(context, 'upsertTaxParameter');
      return repository.upsert(context, year, ruleKey, value, type, description);
    }
  };
}
