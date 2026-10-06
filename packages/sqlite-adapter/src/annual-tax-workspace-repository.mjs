import { assertAnnualTaxWorkspaceRepositoryContract } from '@personal-tax-ledger/contracts';
import { createAnnualTaxWorkspace } from '@personal-tax-ledger/core';
import { createSqliteDatabase } from './database/database.mjs';

const WORKSPACE_LIFECYCLE_PREPARING = 'PREPARING';

function mapWorkspaceRow(row) {
  if (!row) return null;
  return createAnnualTaxWorkspace({
    id: row.id,
    commercialYear: Number(row.commercial_year),
    lifecycleState: row.lifecycle_state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ruleVersionRef: row.rule_version_ref
  });
}

function ensureSchemaAndMaterialize(database) {
  const { db } = database;

  db.exec(`
    CREATE TABLE IF NOT EXISTS annual_tax_workspaces (
      id TEXT PRIMARY KEY,
      commercial_year INTEGER NOT NULL UNIQUE,
      lifecycle_state TEXT NOT NULL CHECK (lifecycle_state IN ('PREPARING')),
      rule_version_ref TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_annual_tax_workspaces_commercial_year
      ON annual_tax_workspaces(commercial_year);
  `);

  const settingsYear = Number(database.getSettings().year);
  const rows = db.prepare(`
    SELECT DISTINCT tax_year AS commercial_year FROM (
      SELECT tax_year FROM income_sources
      UNION SELECT tax_year FROM fee_receipts
      UNION SELECT tax_year FROM fee_expense_settings
      UNION SELECT tax_year FROM mortgage_loans
      UNION SELECT tax_year FROM mortgage_annual_records
    ) WHERE tax_year IS NOT NULL
  `).all();

  const years = new Set(rows.map(row => Number(row.commercial_year)).filter(Number.isSafeInteger));
  if (Number.isSafeInteger(settingsYear)) years.add(settingsYear);

  const insert = db.prepare(`
    INSERT INTO annual_tax_workspaces (
      id,
      commercial_year,
      lifecycle_state,
      rule_version_ref,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, NULL, ?, ?)
    ON CONFLICT(commercial_year) DO NOTHING
  `);

  for (const commercialYear of years) {
    const now = new Date().toISOString();
    insert.run(
      `annual-tax-workspace-${commercialYear}`,
      commercialYear,
      WORKSPACE_LIFECYCLE_PREPARING,
      now,
      now
    );
  }
}

function normalizeRepositoryArgs(contextOrValue, maybeValue) {
  return maybeValue === undefined ? contextOrValue : maybeValue;
}

export function createSqliteAnnualTaxWorkspaceRepository(delegate, database) {
  let resolved;

  async function resolveDatabase() {
    const target = delegate || database || (resolved ??= createSqliteDatabase());
    ensureSchemaAndMaterialize(target);
    return target;
  }

  return assertAnnualTaxWorkspaceRepositoryContract({
    async list() {
      const { db } = await resolveDatabase();
      return db.prepare(`
        SELECT *
        FROM annual_tax_workspaces
        ORDER BY commercial_year DESC
      `).all().map(mapWorkspaceRow);
    },

    async getByCommercialYear(contextOrCommercialYear, maybeCommercialYear) {
      const commercialYear = Number(normalizeRepositoryArgs(contextOrCommercialYear, maybeCommercialYear));
      const { db } = await resolveDatabase();
      return mapWorkspaceRow(db.prepare(`
        SELECT *
        FROM annual_tax_workspaces
        WHERE commercial_year = ?
      `).get(commercialYear));
    },

    async create(contextOrWorkspace, maybeWorkspace) {
      const workspace = createAnnualTaxWorkspace(normalizeRepositoryArgs(contextOrWorkspace, maybeWorkspace));
      const { db } = await resolveDatabase();
      db.prepare(`
        INSERT INTO annual_tax_workspaces (
          id,
          commercial_year,
          lifecycle_state,
          rule_version_ref,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        workspace.id,
        workspace.commercialYear,
        workspace.lifecycleState,
        workspace.ruleVersionRef,
        workspace.createdAt,
        workspace.updatedAt
      );
      return mapWorkspaceRow(db.prepare(`
        SELECT *
        FROM annual_tax_workspaces
        WHERE commercial_year = ?
      `).get(workspace.commercialYear));
    },

    async remove(contextOrCommercialYear, maybeCommercialYear) {
      const commercialYear = Number(normalizeRepositoryArgs(contextOrCommercialYear, maybeCommercialYear));
      const { db } = await resolveDatabase();
      return db.prepare(`DELETE FROM annual_tax_workspaces WHERE commercial_year = ?`).run(commercialYear).changes > 0;
    }
  });
}
