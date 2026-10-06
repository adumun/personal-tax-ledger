import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnnualWorkspaceFlowUseCases } from '@personal-tax-ledger/application';

const context = { workspaceId: 'local-workspace', actorId: 'local-user' };

function workspace(year) {
  return {
    id: `annual-tax-workspace-${year}`,
    commercialYear: year,
    derivedTaxYearLabel: `AT${year + 1}`,
    lifecycleState: 'PREPARING',
    createdAt: '2026-09-13T05:20:00.000Z',
    updatedAt: '2026-09-13T05:20:00.000Z',
    ruleVersionRef: null
  };
}

function support(year, state = 'SUPPORTED') {
  return { commercialYear: year, state, missingRuleKeys: [], warnings: [] };
}

function fixture({ existing = [workspace(2026)], activeYear = 2026, supportState = 'SUPPORTED', failActivation = false } = {}) {
  const rows = new Map(existing.map(item => [item.commercialYear, item]));
  const calls = [];
  let settings = { year: activeYear };
  const repository = {
    async list() { return [...rows.values()].sort((a, b) => b.commercialYear - a.commercialYear); },
    async getByCommercialYear(_context, year) { return rows.get(Number(year)) || null; },
    async create(_context, item) { calls.push(['create', item.commercialYear]); rows.set(item.commercialYear, item); return item; },
    async remove(_context, year) { calls.push(['remove', Number(year)]); return rows.delete(Number(year)); }
  };
  const settingsUseCases = {
    async getSettings() { return { ...settings }; },
    async updateSettings(_context, patch) {
      calls.push(['settings', Number(patch.year)]);
      if (failActivation) throw new Error('settings persistence failed');
      settings = { ...settings, ...patch };
      return { ...settings };
    }
  };
  const supportedYearPolicyUseCases = {
    async getSupportedYearState(year) { return support(Number(year), supportState); }
  };
  const useCases = createAnnualWorkspaceFlowUseCases({
    repository,
    settingsUseCases,
    supportedYearPolicyUseCases,
    now: () => '2026-09-13T05:20:00.000Z'
  });
  return { useCases, rows, calls, getSettings: () => settings };
}

test('AW-001: lista sólo workspaces persistidos e identifica el contexto activo', async () => {
  const { useCases } = fixture({ existing: [workspace(2025), workspace(2026)], activeYear: 2026 });
  const result = await useCases.listWorkspaceOptions(context);
  assert.equal(result.activeCommercialYear, 2026);
  assert.deepEqual(result.workspaces.map(item => item.workspace.commercialYear), [2026, 2025]);
  assert.ok(result.workspaces.every(item => item.support.state === 'SUPPORTED'));
});

test('AW-001: seleccionar un workspace existente activa settings.year sin crear metadata implícita', async () => {
  const { useCases, calls, rows, getSettings } = fixture({ existing: [workspace(2025), workspace(2026)] });
  const result = await useCases.selectWorkspace(context, 2025);
  assert.equal(result.workspace.derivedTaxYearLabel, 'AT2026');
  assert.equal(result.activeCommercialYear, 2025);
  assert.equal(getSettings().year, 2025);
  assert.equal(rows.size, 2);
  assert.deepEqual(calls, [['settings', 2025]]);
});

test('AW-001: un año inexistente no se materializa silenciosamente', async () => {
  const { useCases, calls, rows } = fixture();
  await assert.rejects(
    () => useCases.selectWorkspace(context, 2025),
    error => error.code === 'annual_workspace_not_found'
  );
  assert.equal(rows.has(2025), false);
  assert.deepEqual(calls, []);
});

test('AW-002: duplicate year se bloquea antes de persistir y permite abrir el existente por separado', async () => {
  const { useCases, calls, rows } = fixture();
  await assert.rejects(
    () => useCases.createEmptyWorkspace(context, 2026),
    error => error.code === 'annual_workspace_already_exists' && error.existingWorkspace.commercialYear === 2026
  );
  assert.equal(rows.size, 1);
  assert.deepEqual(calls, []);
});

test('AW-002: UNSUPPORTED bloquea creación y no usa fallback de otro año', async () => {
  const { useCases, calls, rows } = fixture({ existing: [], supportState: 'UNSUPPORTED' });
  await assert.rejects(
    () => useCases.createEmptyWorkspace(context, 2027),
    error => error.code === 'unsupported_tax_year'
  );
  assert.equal(rows.has(2027), false);
  assert.deepEqual(calls, []);
});

test('AW-002: warnings requieren aceptación explícita antes de crear', async () => {
  const blocked = fixture({ existing: [], supportState: 'SUPPORTED_WITH_WARNINGS' });
  await assert.rejects(
    () => blocked.useCases.createEmptyWorkspace(context, 2026),
    error => error.code === 'tax_year_support_warning_confirmation_required'
  );
  assert.equal(blocked.rows.size, 0);

  const accepted = fixture({ existing: [], supportState: 'SUPPORTED_WITH_WARNINGS' });
  const result = await accepted.useCases.createEmptyWorkspace(context, 2026, { acceptWarnings: true });
  assert.equal(result.support.state, 'SUPPORTED_WITH_WARNINGS');
  assert.equal(accepted.getSettings().year, 2026);
});

test('AW-002: Empezar vacío crea sólo metadata anual y la vuelve contexto activo', async () => {
  const { useCases, rows, calls, getSettings } = fixture({ existing: [], activeYear: 2025 });
  const result = await useCases.createEmptyWorkspace(context, 2026);
  assert.equal(result.workspace.commercialYear, 2026);
  assert.equal(result.workspace.derivedTaxYearLabel, 'AT2027');
  assert.equal(rows.size, 1);
  assert.equal(getSettings().year, 2026);
  assert.deepEqual(calls, [['create', 2026], ['settings', 2026]]);
});

test('AW-002: si falla activación, compensa metadata y no declara workspace creado', async () => {
  const { useCases, rows, calls } = fixture({ existing: [], activeYear: 2025, failActivation: true });
  await assert.rejects(() => useCases.createEmptyWorkspace(context, 2026), /settings persistence failed/);
  assert.equal(rows.has(2026), false);
  assert.deepEqual(calls, [['create', 2026], ['settings', 2026], ['remove', 2026]]);
});
