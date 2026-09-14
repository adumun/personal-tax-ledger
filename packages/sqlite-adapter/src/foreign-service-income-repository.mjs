import {
  assertAnnualWorkspaceContext,
  assertForeignServiceIncomeRepositoryContract
} from '@personal-tax-ledger/contracts';
import {
  configureForeignServiceIncomeDatabase,
  listForeignServiceIncome,
  getForeignServiceIncome,
  createForeignServiceIncome,
  updateForeignServiceEconomicFact,
  appendForeignServiceConversion,
  listForeignServiceConversions
} from './database/foreign-service-income.mjs';
import { createSqliteDatabase } from './database/database.mjs';

export function createSqliteForeignServiceIncomeRepository(delegate, database) {
  let resolved;
  async function resolveDelegate() {
    if (delegate) return delegate;
    if (!resolved) {
      const connection = database || createSqliteDatabase();
      configureForeignServiceIncomeDatabase(connection.db);
      resolved = {
        listForeignServiceIncome,
        getForeignServiceIncome,
        createForeignServiceIncome,
        updateForeignServiceEconomicFact,
        appendForeignServiceConversion,
        listForeignServiceConversions
      };
    }
    return resolved;
  }

  const repository = {
    async list(context, filters = {}) {
      assertAnnualWorkspaceContext(context);
      const api = await resolveDelegate();
      return api.listForeignServiceIncome(filters);
    },
    async get(context, id) {
      assertAnnualWorkspaceContext(context);
      const api = await resolveDelegate();
      return api.getForeignServiceIncome(id);
    },
    async create(context, input) {
      assertAnnualWorkspaceContext(context);
      const api = await resolveDelegate();
      return api.createForeignServiceIncome(input);
    },
    async updateEconomicFact(context, id, input) {
      assertAnnualWorkspaceContext(context);
      const api = await resolveDelegate();
      return api.updateForeignServiceEconomicFact(id, input);
    },
    async appendConversion(context, id, input) {
      assertAnnualWorkspaceContext(context);
      const api = await resolveDelegate();
      return api.appendForeignServiceConversion(id, input);
    },
    async listConversions(context, id) {
      assertAnnualWorkspaceContext(context);
      const api = await resolveDelegate();
      return api.listForeignServiceConversions(id);
    }
  };

  return assertForeignServiceIncomeRepositoryContract(repository);
}
