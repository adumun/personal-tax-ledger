import {
  assertAnnualWorkspaceContext,
  assertTaxApplicabilityProfileRepositoryContract
} from '@personal-tax-ledger/contracts';
import { createTaxApplicabilityProfile } from '@personal-tax-ledger/core';
import { createSqliteDatabase } from './database/database.mjs';

function ensureSchema(database) {
  database.db.exec(`
    CREATE TABLE IF NOT EXISTS tax_applicability_profiles (
      annual_workspace_id TEXT PRIMARY KEY,
      commercial_year INTEGER NOT NULL,
      profile_version INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (annual_workspace_id)
        REFERENCES annual_tax_workspaces(id)
        ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tax_applicability_profiles_commercial_year
      ON tax_applicability_profiles(commercial_year);
  `);
}

function mapRow(row) {
  if (!row) return null;
  return createTaxApplicabilityProfile({
    annualWorkspaceId: row.annual_workspace_id,
    commercialYear: Number(row.commercial_year),
    profileVersion: Number(row.profile_version),
    answers: JSON.parse(row.answers_json),
    updatedAt: row.updated_at
  });
}

export function createSqliteTaxApplicabilityProfileRepository(delegate, database) {
  let resolved;

  async function resolveDatabase() {
    const target = delegate || database || (resolved ??= createSqliteDatabase());
    ensureSchema(target);
    return target;
  }

  return assertTaxApplicabilityProfileRepositoryContract({
    async get(context, annualWorkspaceId) {
      const scoped = assertAnnualWorkspaceContext(context);
      if (String(annualWorkspaceId) !== scoped.annualWorkspaceId) {
        throw new TypeError('TaxApplicabilityProfile annualWorkspaceId debe coincidir con el contexto anual');
      }
      const { db } = await resolveDatabase();
      return mapRow(db.prepare(`
        SELECT annual_workspace_id, commercial_year, profile_version, answers_json, updated_at
        FROM tax_applicability_profiles
        WHERE annual_workspace_id = ?
      `).get(scoped.annualWorkspaceId));
    },

    async upsert(context, candidate) {
      const scoped = assertAnnualWorkspaceContext(context);
      const profile = createTaxApplicabilityProfile(candidate);
      if (
        profile.annualWorkspaceId !== scoped.annualWorkspaceId
        || Number(profile.commercialYear) !== Number(scoped.commercialYear)
      ) {
        throw new TypeError('TaxApplicabilityProfile debe pertenecer al contexto anual activo');
      }
      const { db } = await resolveDatabase();
      db.prepare(`
        INSERT INTO tax_applicability_profiles (
          annual_workspace_id,
          commercial_year,
          profile_version,
          answers_json,
          updated_at
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(annual_workspace_id) DO UPDATE SET
          commercial_year = excluded.commercial_year,
          profile_version = excluded.profile_version,
          answers_json = excluded.answers_json,
          updated_at = excluded.updated_at
      `).run(
        profile.annualWorkspaceId,
        profile.commercialYear,
        profile.profileVersion,
        JSON.stringify(profile.answers),
        profile.updatedAt
      );
      return mapRow(db.prepare(`
        SELECT annual_workspace_id, commercial_year, profile_version, answers_json, updated_at
        FROM tax_applicability_profiles
        WHERE annual_workspace_id = ?
      `).get(profile.annualWorkspaceId));
    }
  });
}
