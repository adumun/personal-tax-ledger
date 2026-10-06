import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertMortgageAnnualRecordRepositoryContract
} from '@personal-tax-ledger/contracts';
import { createActiveWorkspaceGuard } from '../../shared/active-workspace-guard.mjs';

function assertEntityInActiveYear(context, entity, operation) {
  if (!entity) return null;
  assertContextCommercialYear(context, entity.taxYear, operation);
  return entity;
}

export function createMortgageAnnualRecordUseCases({ repository, resolveActiveContext }) {
  assertMortgageAnnualRecordRepositoryContract(repository);
  const assertContextStillActive = createActiveWorkspaceGuard(resolveActiveContext);
  return {
    async listAnnualRecords(context, mortgageLoanId, filters = {}) {
      assertAnnualWorkspaceContext(context);
      const taxYear = filters.taxYear == null || filters.taxYear === ''
        ? context.commercialYear
        : assertContextCommercialYear(context, filters.taxYear, 'listAnnualRecords');
      return repository.listByLoan(context, mortgageLoanId, { ...filters, taxYear });
    },
    async listAnnualRecordsByYear(context, taxYear) {
      assertAnnualWorkspaceContext(context);
      const year = assertContextCommercialYear(context, taxYear, 'listAnnualRecordsByYear');
      return repository.listByYear(context, year);
    },
    async getAnnualRecord(context, id) {
      assertAnnualWorkspaceContext(context);
      return assertEntityInActiveYear(context, await repository.get(context, id), 'getAnnualRecord');
    },
    async createAnnualRecord(context, mortgageLoanId, input) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, input?.taxYear, 'createAnnualRecord');
      await assertContextStillActive(context, 'createAnnualRecord');
      return repository.create(context, mortgageLoanId, input);
    },
    async updateAnnualRecord(context, id, input) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, input?.taxYear, 'updateAnnualRecord');
      const current = await repository.get(context, id);
      if (!current) return null;
      assertEntityInActiveYear(context, current, 'updateAnnualRecord');
      await assertContextStillActive(context, 'updateAnnualRecord');
      return repository.update(context, id, input);
    },
    async deleteAnnualRecord(context, id) {
      assertAnnualWorkspaceContext(context);
      const current = await repository.get(context, id);
      if (!current) return false;
      assertEntityInActiveYear(context, current, 'deleteAnnualRecord');
      await assertContextStillActive(context, 'deleteAnnualRecord');
      return repository.remove(context, id);
    }
  };
}
