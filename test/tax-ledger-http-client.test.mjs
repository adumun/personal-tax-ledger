import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTaxLedgerRouter } from '@personal-tax-ledger/http-api';

const context = {
  workspaceId: 'local-workspace',
  actorId: 'local-user',
  annualWorkspaceId: 'aw-2026',
  commercialYear: 2026
};

function harness(readModel) {
  let response = null;
  const route = createTaxLedgerRouter({
    readModel,
    resolveContext: async () => context,
    json(_res, status, body) { response = { status, body }; },
    apiError(_res, status, code, message) { response = { status, body: { code, message } }; }
  });
  return { route, response: () => response };
}

test('IL-004: GET /api/tax-ledger delegates exact filters under trusted annual context', async () => {
  let received = null;
  const h = harness({
    async query(receivedContext, filters) {
      received = { receivedContext, filters };
      return { annualWorkspaceId: 'aw-2026', commercialYear: 2026, entries: [], summary: { entryCount: 0 } };
    }
  });
  const url = new URL('http://local/api/tax-ledger?entryKind=DEPENDENT_INCOME&ownerAggregate=INCOME_SOURCE&recognitionState=RECOGNIZED');
  const handled = await h.route({ req: { method: 'GET' }, res: {}, path: url.pathname, url });

  assert.equal(handled, true);
  assert.deepEqual(received.receivedContext, context);
  assert.deepEqual(received.filters, {
    entryKind: 'DEPENDENT_INCOME',
    ownerAggregate: 'INCOME_SOURCE',
    recognitionState: 'RECOGNIZED'
  });
  assert.equal(h.response().status, 200);
});

test('IL-004: tax ledger HTTP surface rejects mutation methods before touching read model', async () => {
  let queryCalls = 0;
  const h = harness({ async query() { queryCalls += 1; return {}; } });
  const url = new URL('http://local/api/tax-ledger');
  await h.route({ req: { method: 'POST' }, res: {}, path: url.pathname, url });

  assert.equal(queryCalls, 0);
  assert.equal(h.response().status, 405);
  assert.equal(h.response().body.code, 'method_not_allowed');
});

test('IL-004: active annual context failures remain explicit HTTP conflicts', async () => {
  let response = null;
  const route = createTaxLedgerRouter({
    readModel: { async query() { return {}; } },
    resolveContext: async () => { throw Object.assign(new Error('No active annual workspace'), { code: 'active_workspace_not_found' }); },
    json() {},
    apiError(_res, status, code, message) { response = { status, code, message }; }
  });
  const url = new URL('http://local/api/tax-ledger');
  await route({ req: { method: 'GET' }, res: {}, path: url.pathname, url });

  assert.equal(response.status, 409);
  assert.equal(response.code, 'active_workspace_not_found');
});

test('IL-004: local composition and frontend client expose only the read surface', () => {
  const composition = readFileSync(new URL('../apps/local/src/composition/create-local-composition.mjs', import.meta.url), 'utf8');
  const router = readFileSync(new URL('../apps/local/src/http/router.mjs', import.meta.url), 'utf8');
  const client = readFileSync(new URL('../apps/local/web/src/app/tax-ledger-client.ts', import.meta.url), 'utf8');

  assert.match(composition, /createTaxLedgerComposition/);
  assert.match(composition, /\.\.\.taxLedger/);
  assert.match(router, /createTaxLedgerRouter/);
  assert.match(router, /routeTaxLedger/);
  assert.match(client, /\/api\/tax-ledger/);
  assert.match(client, /async list\(/);
  assert.doesNotMatch(client, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(client, /\b(?:create|update|delete|remove)\s*\(/);
});
