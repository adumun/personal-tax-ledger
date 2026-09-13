import { assertAnnualWorkspaceContext, assertTaxLedgerProviderContract } from '@personal-tax-ledger/contracts';
import {
  TAX_LEDGER_ENTRY_KIND,
  TAX_LEDGER_OWNER_AGGREGATE,
  TAX_LEDGER_RECOGNITION_STATE
} from '@personal-tax-ledger/core';

const ENTRY_KINDS = new Set(Object.values(TAX_LEDGER_ENTRY_KIND));
const OWNER_AGGREGATES = new Set(Object.values(TAX_LEDGER_OWNER_AGGREGATE));
const RECOGNITION_STATES = new Set(Object.values(TAX_LEDGER_RECOGNITION_STATE));
const AMOUNT_KEYS = Object.freeze(['gross', 'withholding', 'ppm', 'net']);

function normalizeOptionalFilter(value, allowed, field) {
  if (value == null || value === '') return null;
  const normalized = String(value);
  if (!allowed.has(normalized)) throw new TypeError(`unsupported ${field}: ${normalized}`);
  return normalized;
}

function normalizeFilters(filters = {}) {
  if (!filters || typeof filters !== 'object') throw new TypeError('ledger filters must be an object');
  return Object.freeze({
    entryKind: normalizeOptionalFilter(filters.entryKind, ENTRY_KINDS, 'entryKind'),
    ownerAggregate: normalizeOptionalFilter(filters.ownerAggregate, OWNER_AGGREGATES, 'ownerAggregate'),
    recognitionState: normalizeOptionalFilter(filters.recognitionState, RECOGNITION_STATES, 'recognitionState')
  });
}

function matchesFilters(entry, filters) {
  if (filters.entryKind && entry.entryKind !== filters.entryKind) return false;
  if (filters.ownerAggregate && entry.ownerAggregate !== filters.ownerAggregate) return false;
  if (filters.recognitionState && entry.recognitionState !== filters.recognitionState) return false;
  return true;
}

function compareEntries(left, right) {
  const leftDate = left.occurredOn || null;
  const rightDate = right.occurredOn || null;
  if (leftDate && rightDate && leftDate !== rightDate) return rightDate.localeCompare(leftDate);
  if (leftDate && !rightDate) return -1;
  if (!leftDate && rightDate) return 1;
  return left.ledgerEntryId.localeCompare(right.ledgerEntryId);
}

function emptyAmountTotal() {
  return { amount: 0, presentCount: 0, missingCount: 0 };
}

function ensureCurrencyTotals(target, currency) {
  if (!target[currency]) {
    target[currency] = {
      gross: emptyAmountTotal(),
      withholding: emptyAmountTotal(),
      ppm: emptyAmountTotal(),
      net: emptyAmountTotal()
    };
  }
  return target[currency];
}

function buildFactualSummary(entries) {
  const recognitionCounts = {
    RECOGNIZED: 0,
    PENDING: 0,
    EXCLUDED: 0
  };
  const totalsByCurrency = {};

  for (const entry of entries) {
    recognitionCounts[entry.recognitionState] += 1;
    if (entry.recognitionState !== TAX_LEDGER_RECOGNITION_STATE.RECOGNIZED) continue;

    const currencyTotals = ensureCurrencyTotals(totalsByCurrency, entry.amounts.currency);
    for (const key of AMOUNT_KEYS) {
      const value = entry.amounts[key];
      if (value == null) {
        currencyTotals[key].missingCount += 1;
      } else {
        currencyTotals[key].amount += value;
        currencyTotals[key].presentCount += 1;
      }
    }
  }

  return Object.freeze({
    entryCount: entries.length,
    recognitionCounts: Object.freeze({ ...recognitionCounts }),
    totalsByCurrency: Object.freeze(Object.fromEntries(
      Object.entries(totalsByCurrency).map(([currency, fields]) => [
        currency,
        Object.freeze(Object.fromEntries(
          Object.entries(fields).map(([key, total]) => [key, Object.freeze({ ...total })])
        ))
      ])
    ))
  });
}

function assertEntryBelongsToContext(entry, context) {
  if (entry.annualWorkspaceId !== context.annualWorkspaceId || entry.commercialYear !== context.commercialYear) {
    throw new TypeError(`ledger provider returned entry outside annual context: ${entry.ledgerEntryId}`);
  }
  return entry;
}

export function createAnnualTaxLedgerReadModel({ providers }) {
  if (!Array.isArray(providers) || providers.length === 0) {
    throw new TypeError('at least one TaxLedgerProvider is required');
  }
  const validatedProviders = providers.map(assertTaxLedgerProviderContract);

  return Object.freeze({
    async listAnnualLedger(context, filters = {}) {
      const scoped = assertAnnualWorkspaceContext(context);
      const normalizedFilters = normalizeFilters(filters);
      const batches = await Promise.all(validatedProviders.map(provider => provider.list(scoped)));
      const allEntries = batches.flat().map(entry => assertEntryBelongsToContext(entry, scoped));

      const seen = new Set();
      for (const entry of allEntries) {
        if (seen.has(entry.ledgerEntryId)) throw new TypeError(`duplicate ledgerEntryId: ${entry.ledgerEntryId}`);
        seen.add(entry.ledgerEntryId);
      }

      const entries = allEntries.filter(entry => matchesFilters(entry, normalizedFilters)).sort(compareEntries);
      const factualSummary = buildFactualSummary(entries);

      return Object.freeze({
        annualWorkspaceId: scoped.annualWorkspaceId,
        commercialYear: scoped.commercialYear,
        filters: normalizedFilters,
        entries: Object.freeze(entries),
        factualSummary
      });
    }
  });
}
