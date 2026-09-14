import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

import {
  createAnnualWorkspaceContext,
  LOCAL_WORKSPACE_CONTEXT
} from '@personal-tax-ledger/contracts';
import {
  createBcchForeignExchangeProvider,
  createForeignServiceIncomeUseCases,
  createForeignServiceTaxLedgerProvider
} from '@personal-tax-ledger/application';
import {
  createSqliteDatabase,
  createSqliteForeignServiceIncomeRepository
} from '@personal-tax-ledger/sqlite-adapter';

function annualContext(year = 2026) {
  return createAnnualWorkspaceContext(LOCAL_WORKSPACE_CONTEXT, {
    id: `annual-${year}`,
    commercialYear: year
  });
}

function withRepository(fn) {
  const directory = mkdtempSync(join(tmpdir(), 'ptl-foreign-service-'));
  const database = createSqliteDatabase({ path: join(directory, 'foreign.sqlite') });
  const repository = createSqliteForeignServiceIncomeRepository(undefined, database);
  return Promise.resolve()
    .then(() => fn({ repository, database }))
    .finally(() => {
      database.close();
      rmSync(directory, { recursive: true, force: true });
    });
}

test('IL-005: foreign-source fact preserves original value and append-only conversion history', async () => {
  await withRepository(async ({ repository }) => {
    const context = annualContext();
    const created = await repository.create(context, {
      payerName: 'Foreign Client LLC',
      payerCountry: 'US',
      serviceSourceJurisdiction: 'FOREIGN',
      receivedAt: '2026-05-10',
      originalAmount: 1000,
      originalCurrency: 'USD'
    });

    assert.equal(created.taxYear, 2026);
    assert.equal(created.originalAmount, 1000);
    assert.equal(created.originalCurrency, 'USD');
    assert.equal(created.currentConversionId, null);

    const first = await repository.appendConversion(context, created.id, {
      fxRate: 930,
      fxRateDate: '2026-05-10',
      fxSource: 'MANUAL',
      fxSourceReference: 'BCCh historical consultation',
      fxReason: 'Exact rate entered from official source'
    });
    const second = await repository.appendConversion(context, created.id, {
      fxRate: 935,
      fxRateDate: '2026-05-10',
      fxSource: 'MANUAL',
      fxSourceReference: 'Corrected BCCh historical consultation',
      fxReason: 'Correct transcription error'
    });

    const after = await repository.get(context, created.id);
    const history = await repository.listConversions(context, created.id);

    assert.equal(after.originalAmount, 1000);
    assert.equal(after.originalCurrency, 'USD');
    assert.equal(after.currentConversionId, second.id);
    assert.equal(history.length, 2);
    assert.equal(history[0].supersedesConversionId, null);
    assert.equal(history[1].supersedesConversionId, first.id);
    assert.equal(history[0].clpAmount, 930000);
    assert.equal(history[1].clpAmount, 935000);
  });
});

test('IL-005: BCCh provider never silently substitutes a different rate date', async () => {
  const provider = createBcchForeignExchangeProvider({
    async lookupRate() {
      return {
        status: 'RESOLVED',
        rate: 920,
        rateDate: '2026-05-08',
        sourceReference: 'BCCh series test'
      };
    }
  });

  const result = await provider.resolveRate({ currency: 'USD', date: '2026-05-10', targetCurrency: 'CLP' });
  assert.equal(result.status, 'NEEDS_REVIEW');
  assert.equal(result.reason, 'BCCH_RATE_DATE_MISMATCH');
});

test('IL-005: official conversion freezes exact BCCh provenance and ledger recognizes only resolved conversion', async () => {
  await withRepository(async ({ repository }) => {
    const context = annualContext();
    const fxProvider = createBcchForeignExchangeProvider({
      async lookupRate({ currency, date }) {
        assert.equal(currency, 'USD');
        assert.equal(date, '2026-06-15');
        return {
          status: 'RESOLVED',
          rate: 940.25,
          rateDate: date,
          sourceReference: 'BCCh:DOLAR_OBSERVADO:2026-06-15'
        };
      }
    });
    const useCases = createForeignServiceIncomeUseCases({
      repository,
      fxProvider,
      resolveActiveContext: async () => context
    });
    const created = await useCases.createForeignServiceIncome(context, {
      payerName: 'Global Client Inc',
      payerCountry: 'US',
      serviceSourceJurisdiction: 'FOREIGN',
      receivedAt: '2026-06-15',
      originalAmount: 500,
      originalCurrency: 'USD'
    });

    const ledgerProvider = createForeignServiceTaxLedgerProvider({ foreignServiceUseCases: useCases });
    const before = await ledgerProvider.list(context);
    assert.equal(before.length, 1);
    assert.equal(before[0].entryKind, 'FOREIGN_SERVICE_INCOME');
    assert.equal(before[0].recognitionState, 'PENDING');
    assert.equal(before[0].amounts.gross, null);
    assert.equal(before[0].provenanceSummary.originalAmount, 500);
    assert.equal(before[0].provenanceSummary.originalCurrency, 'USD');

    const resolution = await useCases.resolveOfficialConversion(context, created.id);
    assert.equal(resolution.status, 'RESOLVED');

    const after = await ledgerProvider.list(context);
    assert.equal(after[0].recognitionState, 'RECOGNIZED');
    assert.equal(after[0].amounts.currency, 'CLP');
    assert.equal(after[0].amounts.gross, 470125);
    assert.equal(after[0].provenanceSummary.fxSource, 'BCCH');
    assert.equal(after[0].provenanceSummary.fxRateDate, '2026-06-15');
    assert.equal(after[0].provenanceSummary.fxSourceReference, 'BCCh:DOLAR_OBSERVADO:2026-06-15');
  });
});

test('IL-005: perception year is enforced and CHILE-source services cannot enter foreign_service_income', async () => {
  await withRepository(async ({ repository }) => {
    const context = annualContext(2026);
    const useCases = createForeignServiceIncomeUseCases({
      repository,
      resolveActiveContext: async () => context
    });

    await assert.rejects(
      () => useCases.createForeignServiceIncome(context, {
        payerName: 'Foreign Payer',
        payerCountry: 'US',
        serviceSourceJurisdiction: 'CHILE',
        receivedAt: '2026-03-01',
        originalAmount: 100,
        originalCurrency: 'USD'
      }),
      /FOREIGN source jurisdiction/
    );

    await assert.rejects(
      () => useCases.createForeignServiceIncome(context, {
        payerName: 'Foreign Payer',
        payerCountry: 'US',
        serviceSourceJurisdiction: 'FOREIGN',
        receivedAt: '2025-12-31',
        originalAmount: 100,
        originalCurrency: 'USD'
      }),
      /workspace_year_mismatch|commercial year|año/i
    );
  });
});
