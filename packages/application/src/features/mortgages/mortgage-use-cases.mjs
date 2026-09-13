import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertMortgageRepositoryContract
} from '@personal-tax-ledger/contracts';

function assertEntityInActiveYear(context, entity, operation) {
  if (!entity) return null;
  assertContextCommercialYear(context, entity.taxYear, operation);
  return entity;
}

export function createMortgageUseCases({ repository }) {
  assertMortgageRepositoryContract(repository);
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
      return repository.create(context, input);
    },
    async updateMortgageLoan(context, id, input) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, input?.taxYear, 'updateMortgageLoan');
      const current = await repository.get(context, id);
      if (!current) return null;
      assertEntityInActiveYear(context, current, 'updateMortgageLoan');
      return repository.update(context, id, input);
    },
    async deleteMortgageLoan(context, id) {
      assertAnnualWorkspaceContext(context);
      const current = await repository.get(context, id);
      if (!current) return false;
      assertEntityInActiveYear(context, current, 'deleteMortgageLoan');
      return repository.remove(context, id);
    }
  };
}
