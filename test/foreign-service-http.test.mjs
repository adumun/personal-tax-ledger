import test from 'node:test';
import assert from 'node:assert/strict';
import { createForeignServiceRouter } from '@personal-tax-ledger/http-api';

const context = {
  workspaceId: 'local-workspace',
  actorId: 'local-user',
  annualWorkspaceId: 'annual-2026',
  commercialYear: 2026
};

function harness({ foreignServiceUseCases = {}, settlementUseCases = {}, body = {} } = {}) {
  let response = null;
  const route = createForeignServiceRouter({
    foreignServiceUseCases,
    settlementUseCases,
    resolveContext: async () => context,
    readBody: async () => body,
    json(_res, status, payload) { response = { status, body: payload }; },
    apiError(_res, status, code, message) { response = { status, body: { code, message } }; }
  });
  return { route, response: () => response };
}

test('US-IL-004 Path B: HTTP create delegates to foreign_service_income owner under active annual context', async () => {
  let received = null;
  const h = harness({
    body: { payerName: 'Global Client', payerCountry: 'US', serviceSourceJurisdiction: 'FOREIGN', receivedAt: '2026-08-01', originalAmount: 1000, originalCurrency: 'USD' },
    foreignServiceUseCases: {
      async createForeignServiceIncome(receivedContext, input) {
        received = { receivedContext, input };
        return { id: 'fsi-1', taxYear: 2026, ...input };
      }
    }
  });
  const handled = await h.route({ req: { method: 'POST' }, res: {}, path: '/api/foreign-service-income' });
  assert.equal(handled, true);
  assert.deepEqual(received.receivedContext, context);
  assert.equal(received.input.serviceSourceJurisdiction, 'FOREIGN');
  assert.equal(h.response().status, 201);
  assert.equal(h.response().body.id, 'fsi-1');
});

test('US-IL-004 Path B: HTTP conversion surfaces keep official and manual actions explicit', async () => {
  const calls = [];
  const h = harness({
    body: { fxRate: 950, fxRateDate: '2026-08-01', fxSourceReference: 'BCCh manual lookup', fxReason: 'Provider unavailable' },
    foreignServiceUseCases: {
      async resolveOfficialConversion(_context, id) { calls.push(['official', id]); return { status: 'NEEDS_REVIEW', reason: 'OFFICIAL_PROVIDER_UNAVAILABLE' }; },
      async appendManualConversion(_context, id, input) { calls.push(['manual', id, input]); return { id: 'fx-1', conversionStatus: 'RESOLVED' }; }
    }
  });

  await h.route({ req: { method: 'POST' }, res: {}, path: '/api/foreign-service-income/fsi-1/conversions/official' });
  assert.equal(h.response().body.status, 'NEEDS_REVIEW');
  await h.route({ req: { method: 'POST' }, res: {}, path: '/api/foreign-service-income/fsi-1/conversions/manual' });
  assert.equal(h.response().status, 201);
  assert.deepEqual(calls.map(call => call[0]), ['official', 'manual']);
});

test('US-IL-004 Path A: settlement endpoint delegates to BHE-linked provenance use case only', async () => {
  let received = null;
  const h = harness({
    body: { payerCountry: 'US', serviceSourceJurisdiction: 'CHILE', receivedAmount: 900, receivedCurrency: 'USD', receivedAt: '2026-08-02' },
    settlementUseCases: {
      async upsertFeeReceiptForeignSettlement(receivedContext, feeReceiptId, input) {
        received = { receivedContext, feeReceiptId, input };
        return { feeReceiptId, ...input };
      }
    }
  });
  const handled = await h.route({ req: { method: 'PUT' }, res: {}, path: '/api/fee-receipts/bhe-1/foreign-settlement' });
  assert.equal(handled, true);
  assert.deepEqual(received.receivedContext, context);
  assert.equal(received.feeReceiptId, 'bhe-1');
  assert.equal(received.input.serviceSourceJurisdiction, 'CHILE');
  assert.equal(h.response().body.feeReceiptId, 'bhe-1');
});
