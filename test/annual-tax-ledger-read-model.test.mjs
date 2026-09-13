import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnnualTaxLedgerReadModel } from '@personal-tax-ledger/application';
import {
  createTaxLedgerEntry,
  TAX_LEDGER_ENTRY_KIND,
  TAX_LEDGER_OWNER_AGGREGATE,
  TAX_LEDGER_RECOGNITION_STATE
} from '@personal-tax-ledger/core';

const context = {
  workspaceId: 'local-workspace',
  actorId: 'local-user',
  annualWorkspaceId: 'aw-2026',
  commercialYear: 2026
};

function entry(overrides = {}) {
  return createTaxLedgerEntry({
    ledgerEntryId: 'income-source:1',
    annualWorkspaceId: 'aw-2026',
    commercialYear: 2026,
    entryKind: TAX_LEDGER_ENTRY_KIND.DEPENDENT_INCOME,
    ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.INCOME_SOURCE,
    ownerRecordId: '1',
    occurredOn: null,
    periodRef: 'YEAR:2026',
    recognitionState: TAX_LEDGER_RECOGNITION_STATE.RECOGNIZED,
    amounts: { currency: 'CLP', gross: 1000, withholding: null, ppm: null, net: null },
    counterpartySummary: 'Employer',
    provenanceSummary: { source: 'income_sources' },
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides
  });
}

function provider(entries) {
  return { async list(receivedContext) {
    assert.equal(receivedContext.annualWorkspaceId, context.annualWorkspaceId);
    return entries;
  } };
}

test('IL-003: compone providers con orden anual determinista e identidad intacta', async () => {
  const model = createAnnualTaxLedgerReadModel({ providers: [
    provider([entry({ ledgerEntryId: 'income-source:1' })]),
    provider([
      entry({
        ledgerEntryId: 'fee-receipt:b',
        ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.FEE_RECEIPT,
        ownerRecordId: 'b',
        entryKind: TAX_LEDGER_ENTRY_KIND.DOMESTIC_FEE_INCOME,
        occurredOn: '2026-08-01',
        periodRef: 'MONTH:2026-08'
      }),
      entry({
        ledgerEntryId: 'fee-receipt:a',
        ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.FEE_RECEIPT,
        ownerRecordId: 'a',
        entryKind: TAX_LEDGER_ENTRY_KIND.DOMESTIC_FEE_INCOME,
        occurredOn: '2026-09-01',
        periodRef: 'MONTH:2026-09'
      })
    ])
  ] });

  const result = await model.listAnnualLedger(context);
  assert.equal(result.annualWorkspaceId, 'aw-2026');
  assert.equal(result.commercialYear, 2026);
  assert.deepEqual(result.entries.map(item => item.ledgerEntryId), [
    'fee-receipt:a',
    'fee-receipt:b',
    'income-source:1'
  ]);
});

test('IL-003: filtros exactos por kind, owner y recognition no mutan providers', async () => {
  const entries = [
    entry(),
    entry({
      ledgerEntryId: 'fee-receipt:1',
      ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.FEE_RECEIPT,
      ownerRecordId: '1',
      entryKind: TAX_LEDGER_ENTRY_KIND.DOMESTIC_FEE_INCOME,
      recognitionState: TAX_LEDGER_RECOGNITION_STATE.PENDING,
      amounts: { currency: 'CLP', gross: 200, withholding: 20, ppm: 0, net: 180 }
    })
  ];
  const sourceProvider = provider(entries);
  const model = createAnnualTaxLedgerReadModel({ providers: [sourceProvider] });

  const result = await model.listAnnualLedger(context, {
    entryKind: TAX_LEDGER_ENTRY_KIND.DOMESTIC_FEE_INCOME,
    ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.FEE_RECEIPT,
    recognitionState: TAX_LEDGER_RECOGNITION_STATE.PENDING
  });

  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].ledgerEntryId, 'fee-receipt:1');
  assert.deepEqual(Object.keys(sourceProvider), ['list']);
});

test('IL-003: totales sólo usan RECOGNIZED y conservan ausencia como missingCount', async () => {
  const model = createAnnualTaxLedgerReadModel({ providers: [provider([
    entry({ ledgerEntryId: 'income-source:gross', amounts: { currency: 'CLP', gross: 1000, withholding: null, ppm: null, net: null } }),
    entry({ ledgerEntryId: 'income-source:net', amounts: { currency: 'CLP', gross: null, withholding: null, ppm: null, net: 700 } }),
    entry({
      ledgerEntryId: 'fee-receipt:pending',
      ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.FEE_RECEIPT,
      ownerRecordId: 'pending',
      entryKind: TAX_LEDGER_ENTRY_KIND.DOMESTIC_FEE_INCOME,
      recognitionState: TAX_LEDGER_RECOGNITION_STATE.PENDING,
      amounts: { currency: 'CLP', gross: 5000, withholding: 500, ppm: 0, net: 4500 }
    })
  ])] });

  const result = await model.listAnnualLedger(context);
  assert.deepEqual(result.factualSummary.recognitionCounts, { RECOGNIZED: 2, PENDING: 1, EXCLUDED: 0 });
  assert.deepEqual(result.factualSummary.totalsByCurrency.CLP.gross, { amount: 1000, presentCount: 1, missingCount: 1 });
  assert.deepEqual(result.factualSummary.totalsByCurrency.CLP.net, { amount: 700, presentCount: 1, missingCount: 1 });
  assert.deepEqual(result.factualSummary.totalsByCurrency.CLP.withholding, { amount: 0, presentCount: 0, missingCount: 2 });
});

test('IL-003: IDs duplicados entre providers se rechazan en vez de colapsar facts', async () => {
  const duplicate = entry({ ledgerEntryId: 'shared:1' });
  const model = createAnnualTaxLedgerReadModel({ providers: [provider([duplicate]), provider([duplicate])] });
  await assert.rejects(() => model.listAnnualLedger(context), /duplicate ledgerEntryId: shared:1/);
});

test('IL-003: provider no puede devolver una entry de otro AnnualWorkspace', async () => {
  const foreign = entry({ annualWorkspaceId: 'aw-2025', commercialYear: 2025, periodRef: 'YEAR:2025' });
  const model = createAnnualTaxLedgerReadModel({ providers: [provider([foreign])] });
  await assert.rejects(() => model.listAnnualLedger(context), /outside annual context/);
});
