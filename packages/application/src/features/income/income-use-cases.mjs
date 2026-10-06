import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertIncomeRepositoryContract
} from '@personal-tax-ledger/contracts';
import { createActiveWorkspaceGuard } from '../../shared/active-workspace-guard.mjs';

function assertEntityInActiveYear(context, entity, operation) {
  if (!entity) return null;
  assertContextCommercialYear(context, entity.taxYear, operation);
  return entity;
}

export function createIncomeUseCases({ repository, resolveActiveContext }) {
  assertIncomeRepositoryContract(repository);
  const assertContextStillActive = createActiveWorkspaceGuard(resolveActiveContext);
  return {
    async listIncomeSources(context, taxYear) {
      assertAnnualWorkspaceContext(context);
      const year = taxYear == null ? context.commercialYear : assertContextCommercialYear(context, taxYear, 'listIncomeSources');
      return repository.list(context, year);
    },
    async getIncomeSource(context, id) {
      assertAnnualWorkspaceContext(context);
      return assertEntityInActiveYear(context, await repository.get(context, id), 'getIncomeSource');
    },
    async createIncomeSource(context, input) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, input?.taxYear, 'createIncomeSource');
      await assertContextStillActive(context, 'createIncomeSource');
      return repository.create(context, input);
    },
    async updateIncomeSource(context, id, input) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, input?.taxYear, 'updateIncomeSource');
      const current = await repository.get(context, id);
      if (!current) return null;
      assertEntityInActiveYear(context, current, 'updateIncomeSource');
      await assertContextStillActive(context, 'updateIncomeSource');
      return repository.update(context, id, input);
    },
    async deleteIncomeSource(context, id) {
      assertAnnualWorkspaceContext(context);
      const current = await repository.get(context, id);
      if (!current) return false;
      assertEntityInActiveYear(context, current, 'deleteIncomeSource');
      await assertContextStillActive(context, 'deleteIncomeSource');
      return repository.remove(context, id);
    },
    async copyIncomeSources(context, fromTaxYear, toTaxYear) {
      assertAnnualWorkspaceContext(context);
      assertContextCommercialYear(context, toTaxYear, 'copyIncomeSources.target');
      await assertContextStillActive(context, 'copyIncomeSources');
      return repository.copy(context, fromTaxYear, toTaxYear);
    }
  };
}
