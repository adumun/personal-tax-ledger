import { assertPriorYearInitializationRepositoryContract } from '@personal-tax-ledger/contracts';
import { createSqliteDatabase } from './database/database.mjs';

function ensureSchema(database) {
  database.db.exec(`
    CREATE TABLE IF NOT EXISTS annual_workspace_initializations (
      target_workspace_id TEXT PRIMARY KEY,
      source_workspace_id TEXT NOT NULL,
      source_commercial_year INTEGER NOT NULL,
      target_commercial_year INTEGER NOT NULL,
      categories_json TEXT NOT NULL,
      initialized_at TEXT NOT NULL,
      FOREIGN KEY (target_workspace_id) REFERENCES annual_tax_workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY (source_workspace_id) REFERENCES annual_tax_workspaces(id)
    );
  `);
}

function mapRow(row) {
  if (!row) return null;
  return Object.freeze({
    targetWorkspaceId: row.target_workspace_id,
    sourceWorkspaceId: row.source_workspace_id,
    sourceCommercialYear: Number(row.source_commercial_year),
    targetCommercialYear: Number(row.target_commercial_year),
    categories: Object.freeze(JSON.parse(row.categories_json)),
    initializedAt: row.initialized_at
  });
}

export function createSqlitePriorYearInitializationRepository(delegate, database) {
  let resolved;
  async function resolveDatabase() {
    const target = delegate || database || (resolved ??= createSqliteDatabase());
    ensureSchema(target);
    return target;
  }

  async function getByTargetWorkspaceId(targetWorkspaceId) {
    const { db } = await resolveDatabase();
    return mapRow(db.prepare(`
      SELECT target_workspace_id, source_workspace_id, source_commercial_year,
             target_commercial_year, categories_json, initialized_at
      FROM annual_workspace_initializations
      WHERE target_workspace_id = ?
    `).get(String(targetWorkspaceId)));
  }

  return assertPriorYearInitializationRepositoryContract({
    async getByTargetWorkspaceId(_context, targetWorkspaceId) {
      return getByTargetWorkspaceId(targetWorkspaceId);
    },

    async create(_context, record) {
      const { db } = await resolveDatabase();
      db.prepare(`
        INSERT INTO annual_workspace_initializations (
          target_workspace_id, source_workspace_id, source_commercial_year,
          target_commercial_year, categories_json, initialized_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        record.targetWorkspaceId,
        record.sourceWorkspaceId,
        Number(record.sourceCommercialYear),
        Number(record.targetCommercialYear),
        JSON.stringify(record.categories),
        record.initializedAt
      );
      return getByTargetWorkspaceId(record.targetWorkspaceId);
    }
  });
}
