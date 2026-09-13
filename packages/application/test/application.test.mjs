import test from 'node:test';
import assert from 'node:assert/strict';
import { createIncomeUseCases } from '../src/index.mjs';

test('application coordina casos de uso con contexto anual y repositorio inyectado', async () => {
  const context = {
    workspaceId: 'test',
    actorId: 'user',
    annualWorkspaceId: 'annual-tax-workspace-2026',
    commercialYear: 2026
  };
  const calls = [];
  const repository = {
    async list(receivedContext, year) { calls.push(['list', receivedContext, year]); return [{ id: 1, taxYear: 2026 }]; },
    async get() { return null; },
    async create(receivedContext, input) { calls.push(['create', receivedContext, input]); return { ...input, id: 2 }; },
    async update() { return null; },
    async remove() { return true; },
    async copy() { return []; }
  };
  const useCases = createIncomeUseCases({ repository });
  assert.deepEqual(await useCases.listIncomeSources(context, 2026), [{ id: 1, taxYear: 2026 }]);
  assert.equal((await useCases.createIncomeSource(context, { name: 'Trabajo', taxYear: 2026 })).id, 2);
  assert.deepEqual(calls.map(call => call[0]), ['list', 'create']);
});
