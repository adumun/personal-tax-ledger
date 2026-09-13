import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertMortgageRepositoryContract
} from '@personal-tax-ledger/contracts';
import { createActiveWorkspaceGuard } from '../../shared/active-workspace-guard.mjs';

function assertEntityInActiveYear(context, entity, operation) {
  if (!entity) return null;
  assertContextCommercialYear(context, entity.taxYear, operation);
  return entity;
}

export function createMortgageUseCases({ repository, resolveActiveContext }) {
  assertMortgageRepositoryContract(repository);
  const assertContextStillActive = createActiveWorkspaceGuard(resolveActiveContext);
  return {
    async listMortgageLoans(context, filters = {}) {
      assertAnnualWorkspaceContext(context);
      const taxYear = filters.taxYear == null || filters.taxYear === ''
        ? context.commercialYear
        : assertContextCommercialYear(context, filters.taxYear, 'listMortgageLoans');
      return repository.list(context, { ...filters, taxYear });
    },
    async getMortgageLoan(context, id) {
      assertAnnualWorkspaceContext(context);
      return assertEntityInActiveYear(context, await repository.get(context, id), 'getMortgageLoan');
    },
    async createMortgageLoan(context, input) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, input?.taxYear, 'createMortgageLoan');
      await assertContextStillActive(context, 'createMortgageLoan');
      return repository.create(context, input);
    },
    async updateMortgageLoan(context, id, input) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, input?.taxYear, 'updateMortgageLoan');
      const current = await repository.get(context, id);
      if (!current) return null;
      assertEntityInActiveYear(context, current, 'updateMortgageLoan');
      await assertContextStillActive(context, 'updateMortgageLoan');
      return repository.update(context, id, input);
    },
    async deleteMortgageLoan(context, id) {
      assertAnnualWorkspaceContext(context);
      const current = await repository.get(context, id);
      if (!current) return false;
      assertEntityInActiveYear(context, current, 'deleteMortgageLoan');
      await assertContextStillActive(context, 'deleteMortgageLoan');
      return repository.remove(context, id);
    }
  };
}
