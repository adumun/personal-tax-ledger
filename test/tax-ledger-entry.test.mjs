import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TAX_LEDGER_ENTRY_KIND,
  TAX_LEDGER_OWNER_AGGREGATE,
  TAX_LEDGER_RECOGNITION_STATE,
  createTaxLedgerEntry,
  normalizeTaxLedgerAmounts
} from '@personal-tax-ledger/core';
import {
  TAX_LEDGER_PROVIDER_METHODS,
  assertTaxLedgerProviderContract
} from '@personal-tax-ledger/contracts';

const base = {
  ledgerEntryId: 'INCOME_SOURCE:42',
  annualWorkspaceId: 'annual-tax-workspace-2026',
  commercialYear: 2026,
  entryKind: TAX_LEDGER_ENTRY_KIND.DEPENDENT_INCOME,
  ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.INCOME_SOURCE,
  ownerRecordId: '42',
  periodRef: '2026',
  recognitionState: TAX_LEDGER_RECOGNITION_STATE.RECOGNIZED,
  amounts: { currency: 'CLP', gross: 1000000, withholding: 50000, ppm: null, net: 950000 },
  counterpartySummary: 'Empleador ejemplo',
  provenanceSummary: { sourceType: 'MANUAL' },
  updatedAt: '2026-09-13T07:10:00.000Z'
};

test('IL-001: TaxLedgerEntry conserva identidad anual y autoridad del agregado propietario', () => {
  const entry = createTaxLedgerEntry(base);
  assert.equal(entry.annualWorkspaceId, 'annual-tax-workspace-2026');
  assert.equal(entry.commercialYear, 2026);
  assert.equal(entry.ownerAggregate, 'INCOME_SOURCE');
  assert.equal(entry.ownerRecordId, '42');
  assert.equal(entry.ledgerEntryId, 'INCOME_SOURCE:42');
  assert.ok(Object.isFrozen(entry));
});

test('IL-001: el contrato inicial sólo admite tipos y owners soportados explícitamente', () => {
  assert.deepEqual(Object.values(TAX_LEDGER_ENTRY_KIND).sort(), ['DEPENDENT_INCOME', 'DOMESTIC_FEE_INCOME', 'OTHER_INCOME_SOURCE'].sort());
  assert.deepEqual(Object.values(TAX_LEDGER_OWNER_AGGREGATE).sort(), ['FEE_RECEIPT', 'INCOME_SOURCE']);
  assert.throws(() => createTaxLedgerEntry({ ...base, entryKind: 'FOREIGN_SERVICE_INCOME' }), /unsupported entryKind/);
  assert.throws(() => createTaxLedgerEntry({ ...base, ownerAggregate: 'GENERIC_LEDGER_ROW' }), /unsupported ownerAggregate/);
});

test('IL-001: montos presentacionales preservan unidad y no inventan valores ausentes', () => {
  const amounts = normalizeTaxLedgerAmounts({ currency: 'clp', gross: 1000, withholding: null });
  assert.equal(amounts.currency, 'CLP');
  assert.equal(amounts.gross, 1000);
  assert.equal(amounts.withholding, null);
  assert.equal(amounts.ppm, null);
  assert.equal(amounts.net, null);
  assert.throws(() => normalizeTaxLedgerAmounts({ currency: 'CLP', gross: -1 }), /non-negative/);
});

test('IL-001: recognition state es factual y cerrado; no introduce readiness o reconciliación', () => {
  assert.deepEqual(Object.values(TAX_LEDGER_RECOGNITION_STATE).sort(), ['EXCLUDED', 'PENDING', 'RECOGNIZED'].sort());
  assert.throws(() => createTaxLedgerEntry({ ...base, recognitionState: 'READY' }), /unsupported recognitionState/);
  assert.throws(() => createTaxLedgerEntry({ ...base, recognitionState: 'RECONCILED' }), /unsupported recognitionState/);
});

test('IL-001: provider contract es read-only y exige únicamente list', async () => {
  assert.deepEqual([...TAX_LEDGER_PROVIDER_METHODS], ['list']);
  const provider = assertTaxLedgerProviderContract({ async list() { return [createTaxLedgerEntry(base)]; } });
  const rows = await provider.list({ workspaceId: 'local-workspace', actorId: 'local-user', annualWorkspaceId: base.annualWorkspaceId, commercialYear: 2026 });
  assert.equal(rows.length, 1);
  assert.equal(typeof provider.create, 'undefined');
  assert.equal(typeof provider.update, 'undefined');
  assert.equal(typeof provider.remove, 'undefined');
  assert.throws(() => assertTaxLedgerProviderContract({}), /must implement list/);
});
