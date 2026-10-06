import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createSqliteAnnualTaxWorkspaceRepository,
  createSqliteDatabase,
  createSqlitePriorYearInitializationRepository
} from '@personal-tax-ledger/sqlite-adapter';

const context = { workspaceId: 'local-workspace', actorId: 'local-user' };

test('AW-004: SQLite conserva provenance de inicialización por workspace destino', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'ptl-prior-init-'));
  const database = createSqliteDatabase({ path: join(directory, 'prior-init.sqlite') });
  try {
    const workspaces = createSqliteAnnualTaxWorkspaceRepository(undefined, database);
    const source = await workspaces.getByCommercialYear(context, 2026);
    assert.ok(source);
    const target = await workspaces.create(context, {
      id: 'annual-tax-workspace-2027',
      commercialYear: 2027,
      lifecycleState: 'PREPARING',
      createdAt: '2026-09-13T06:30:00.000Z',
      updatedAt: '2026-09-13T06:30:00.000Z',
      ruleVersionRef: null
    });
    const repository = createSqlitePriorYearInitializationRepository(undefined, database);
    const saved = await repository.create(context, {
      targetWorkspaceId: target.id,
      sourceWorkspaceId: source.id,
      sourceCommercialYear: 2026,
      targetCommercialYear: 2027,
      categories: ['APPLICABILITY_PROFILE'],
      initializedAt: '2026-09-13T06:31:00.000Z'
    });
    const reloaded = await repository.getByTargetWorkspaceId(context, target.id);
    assert.deepEqual(reloaded, saved);
    assert.equal(reloaded.sourceCommercialYear, 2026);
    assert.deepEqual(reloaded.categories, ['APPLICABILITY_PROFILE']);
    assert.equal(database.db.prepare('SELECT COUNT(*) AS count FROM annual_workspace_initializations').get().count, 1);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
