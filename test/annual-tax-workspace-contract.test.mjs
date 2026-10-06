import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ANNUAL_TAX_WORKSPACE_LIFECYCLE,
  assertAnnualTaxWorkspace,
  createAnnualTaxWorkspace,
  deriveTaxYearLabel
} from '@personal-tax-ledger/core';
import { createAnnualWorkspaceUseCases } from '@personal-tax-ledger/application';

const baseWorkspace = {
  id: 'aw-2026',
  commercialYear: 2026,
  lifecycleState: ANNUAL_TAX_WORKSPACE_LIFECYCLE.PREPARING,
  createdAt: '2026-09-12T20:00:00.000Z',
  updatedAt: '2026-09-12T20:00:00.000Z',
  ruleVersionRef: 'rules-2026'
};

test('commercial year is canonical and Operación Renta label is derived', () => {
  assert.equal(deriveTaxYearLabel(2026), 'AT2027');
  const workspace = createAnnualTaxWorkspace(baseWorkspace);
  assert.equal(workspace.commercialYear, 2026);
  assert.equal(workspace.derivedTaxYearLabel, 'AT2027');
  assert.equal(workspace.lifecycleState, 'PREPARING');
});

test('derived tax year label cannot become a second editable year', () => {
  const workspace = createAnnualTaxWorkspace({ ...baseWorkspace, derivedTaxYearLabel: 'AT2099' });
  assert.equal(workspace.derivedTaxYearLabel, 'AT2027');
  assert.throws(
    () => assertAnnualTaxWorkspace({ ...workspace, derivedTaxYearLabel: 'AT2099' }),
    /derivedTaxYearLabel debe derivarse/
  );
});

test('application contract delegates a validated AnnualTaxWorkspace through its repository port', async () => {
  const calls = [];
  const workspace = createAnnualTaxWorkspace(baseWorkspace);
  const repository = {
    async list(context) { calls.push(['list', context]); return [workspace]; },
    async getByCommercialYear(context, year) { calls.push(['get', context, year]); return workspace; },
    async create(context, candidate) { calls.push(['create', context, candidate]); return candidate; },
    async remove(context, year) { calls.push(['remove', context, year]); return true; }
  };
  const useCases = createAnnualWorkspaceUseCases({ repository });
  const context = { workspaceId: 'local-workspace', actorId: 'local-user' };

  assert.equal((await useCases.listWorkspaces(context)).length, 1);
  assert.equal((await useCases.getWorkspaceByCommercialYear(context, 2026)).commercialYear, 2026);
  const created = await useCases.createWorkspace(context, workspace);
  assert.equal(created.derivedTaxYearLabel, 'AT2027');
  assert.equal(calls.at(-1)[2], workspace);
  assert.deepEqual(calls.map(call => call[0]), ['list', 'get', 'create']);
});

test('unsupported lifecycle states are rejected instead of inventing future closure semantics', () => {
  assert.throws(
    () => createAnnualTaxWorkspace({ ...baseWorkspace, lifecycleState: 'CLOSED' }),
    /lifecycleState no soportado/
  );
});
