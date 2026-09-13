export const TAX_LEDGER_ENTRY_KIND = Object.freeze({
  DEPENDENT_INCOME: 'DEPENDENT_INCOME',
  DOMESTIC_FEE_INCOME: 'DOMESTIC_FEE_INCOME',
  OTHER_INCOME_SOURCE: 'OTHER_INCOME_SOURCE'
});

export const TAX_LEDGER_OWNER_AGGREGATE = Object.freeze({
  INCOME_SOURCE: 'INCOME_SOURCE',
  FEE_RECEIPT: 'FEE_RECEIPT'
});

export const TAX_LEDGER_RECOGNITION_STATE = Object.freeze({
  RECOGNIZED: 'RECOGNIZED',
  PENDING: 'PENDING',
  EXCLUDED: 'EXCLUDED'
});

const ENTRY_KINDS = new Set(Object.values(TAX_LEDGER_ENTRY_KIND));
const OWNER_AGGREGATES = new Set(Object.values(TAX_LEDGER_OWNER_AGGREGATE));
const RECOGNITION_STATES = new Set(Object.values(TAX_LEDGER_RECOGNITION_STATE));
const AMOUNT_KEYS = Object.freeze(['gross', 'withholding', 'ppm', 'net']);

function requiredText(value, field) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new TypeError(`${field} is required`);
  return normalized;
}

function optionalText(value) {
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized || null;
}

function normalizeCommercialYear(value) {
  const year = Number(value);
  if (!Number.isSafeInteger(year) || year <= 0) throw new TypeError('commercialYear must be a positive integer');
  return year;
}

function normalizeCurrency(value) {
  const currency = requiredText(value, 'amounts.currency').toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new TypeError('amounts.currency must be a three-letter currency code');
  return currency;
}

function normalizeAmount(value, field) {
  if (value == null) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new TypeError(`${field} must be a non-negative finite number or null`);
  return amount;
}

export function normalizeTaxLedgerAmounts(input = {}) {
  const normalized = { currency: normalizeCurrency(input.currency ?? 'CLP') };
  for (const key of AMOUNT_KEYS) normalized[key] = normalizeAmount(input[key], `amounts.${key}`);
  return Object.freeze(normalized);
}

export function createTaxLedgerEntry(input) {
  if (!input || typeof input !== 'object') throw new TypeError('TaxLedgerEntry input is required');

  const entryKind = requiredText(input.entryKind, 'entryKind');
  if (!ENTRY_KINDS.has(entryKind)) throw new TypeError(`unsupported entryKind: ${entryKind}`);

  const ownerAggregate = requiredText(input.ownerAggregate, 'ownerAggregate');
  if (!OWNER_AGGREGATES.has(ownerAggregate)) throw new TypeError(`unsupported ownerAggregate: ${ownerAggregate}`);

  const recognitionState = requiredText(input.recognitionState, 'recognitionState');
  if (!RECOGNITION_STATES.has(recognitionState)) throw new TypeError(`unsupported recognitionState: ${recognitionState}`);

  const commercialYear = normalizeCommercialYear(input.commercialYear);
  const periodRef = requiredText(input.periodRef ?? String(commercialYear), 'periodRef');

  return Object.freeze({
    ledgerEntryId: requiredText(input.ledgerEntryId, 'ledgerEntryId'),
    annualWorkspaceId: requiredText(input.annualWorkspaceId, 'annualWorkspaceId'),
    commercialYear,
    entryKind,
    ownerAggregate,
    ownerRecordId: requiredText(input.ownerRecordId, 'ownerRecordId'),
    occurredOn: optionalText(input.occurredOn),
    periodRef,
    recognitionState,
    amounts: normalizeTaxLedgerAmounts(input.amounts),
    counterpartySummary: optionalText(input.counterpartySummary),
    provenanceSummary: input.provenanceSummary == null
      ? null
      : Object.freeze({ ...input.provenanceSummary }),
    updatedAt: requiredText(input.updatedAt, 'updatedAt')
  });
}
