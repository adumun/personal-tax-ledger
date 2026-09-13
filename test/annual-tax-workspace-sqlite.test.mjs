import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createAnnualTaxWorkspace } from '@personal-tax-ledger/core';
import {
  createSqliteAnnualTaxWorkspaceRepository,
  createSqliteDatabase
} from '@personal-tax-ledger/sqlite-adapter';

function createFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'personal-tax-ledger-aw-'));
  const path = join(directory, 'adapter.sqlite');
  const database = createSqliteDatabase({ path });
  return {
    directory,
    path,
    database,
    close() {
      database.close();
      rmSync(directory, { recursive: true, force: true });
    }
  };
}

test('materializa workspaces solo desde settings.year y años con datos reales del usuario', async () => {
  const fixture = createFixture();
  try {
    const activeYear = Number(fixture.database.getSettings().year);
    const previousYear = activeYear - 1;

    fixture.database.createIncomeSource({
      name: 'Fuente histórica',
      kind: 'salary',
      taxYear: previousYear
    });

    const repository = createSqliteAnnualTaxWorkspaceRepository(undefined, fixture.database);
    const workspaces = await repository.list();
    const years = workspaces.map(workspace => workspace.commercialYear);

    assert.deepEqual(years, [activeYear, previousYear].sort((a, b) => b - a));
    assert.equal(years.length, 2, 'los años sembrados solo en catálogos tributarios no crean workspaces fantasma');
    assert.equal((await repository.getByCommercialYear(previousYear)).derivedTaxYearLabel, `AT${previousYear + 1}`);
    assert.equal(Number(fixture.database.getSettings().year), activeYear, 'la migración no cambia el año activo');
  } finally {
    fixture.close();
  }
});

test('la materialización es idempotente y no duplica workspaces al reabrir el repositorio', async () => {
  const fixture = createFixture();
  try {
    const activeYear = Number(fixture.database.getSettings().year);
    const first = createSqliteAnnualTaxWorkspaceRepository(undefined, fixture.database);
    assert.equal((await first.list()).length, 1);

    const second = createSqliteAnnualTaxWorkspaceRepository(undefined, fixture.database);
    assert.equal((await second.list()).length, 1);

    const rows = fixture.database.db.prepare(`
      SELECT commercial_year, COUNT(*) AS total
      FROM annual_tax_workspaces
      GROUP BY commercial_year
    `).all();
    assert.deepEqual(rows.map(row => [Number(row.commercial_year), Number(row.total)]), [[activeYear, 1]]);
  } finally {
    fixture.close();
  }
});

test('crear un workspace persiste solo metadata anual y no copia hechos tributarios', async () => {
  const fixture = createFixture();
  try {
    const activeYear = Number(fixture.database.getSettings().year);
    const targetYear = activeYear + 1;
    fixture.database.createIncomeSource({
      name: 'Fuente del año activo',
      kind: 'salary',
      taxYear: activeYear
    });

    const repository = createSqliteAnnualTaxWorkspaceRepository(undefined, fixture.database);
    const workspace = createAnnualTaxWorkspace({
      id: `annual-tax-workspace-${targetYear}`,
      commercialYear: targetYear,
      createdAt: new Date().toISOString()
    });

    const created = await repository.create(null, workspace);
    assert.equal(created.commercialYear, targetYear);
    assert.equal(created.derivedTaxYearLabel, `AT${targetYear + 1}`);
    assert.equal(fixture.database.listIncomeSources(targetYear).length, 0, 'crear workspace no copia income_sources');
    assert.equal(Number(fixture.database.getSettings().year), activeYear, 'crear metadata no cambia settings.year implícitamente');
  } finally {
    fixture.close();
  }
});
