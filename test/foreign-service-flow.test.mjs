import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  createAnnualWorkspaceContext,
  LOCAL_WORKSPACE_CONTEXT
} from '@personal-tax-ledger/contracts';
import {
  createFeeReceiptUseCases,
  createFeeReceiptForeignSettlementUseCases,
  createForeignServiceIncomeUseCases,
  createForeignServiceTaxLedgerProvider
} from '@personal-tax-ledger/application';
import {
  createSqliteDatabase,
  createSqliteFeeReceiptRepository,
  createSqliteFeeReceiptForeignSettlementRepository,
  createSqliteForeignServiceIncomeRepository
} from '@personal-tax-ledger/sqlite-adapter';

function context(year = 2026) {
  return createAnnualWorkspaceContext(LOCAL_WORKSPACE_CONTEXT, {
    id: `annual-${year}`,
    commercialYear: year
  });
}

test('US-IL-004 Path A: settlement extranjero queda ligado a BHE y no crea un segundo ingreso', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'ptl-il004-path-a-'));
  const database = createSqliteDatabase({ path: join(directory, 'path-a.sqlite') });
  const active = context();
  try {
    const feeRepository = createSqliteFeeReceiptRepository(undefined, database);
    const feeUseCases = createFeeReceiptUseCases({ repository: feeRepository, resolveActiveContext: async () => active });
    const settlementRepository = createSqliteFeeReceiptForeignSettlementRepository(undefined, database);
    const settlementUseCases = createFeeReceiptForeignSettlementUseCases({
      repository: settlementRepository,
      feeReceiptUseCases: feeUseCases,
      resolveActiveContext: async () => active
    });
    const foreignRepository = createSqliteForeignServiceIncomeRepository(undefined, database);
    const foreignUseCases = createForeignServiceIncomeUseCases({
      repository: foreignRepository,
      resolveActiveContext: async () => active
    });

    const bhe = await feeUseCases.createFeeReceipt(active, {
      taxYear: 2026,
      issueDate: '2026-07-01',
      clientName: 'Global Client LLC',
      amountInputType: 'GROSS',
      grossAmount: 1_000_000,
      withholdingMode: 'NO_WITHHOLDING',
      withholdingRate: 0,
      paymentStatus: 'PAID',
      paymentDate: '2026-07-05'
    });

    const settlement = await settlementUseCases.upsertFeeReceiptForeignSettlement(active, bhe.id, {
      payerCountry: 'US',
      serviceSourceJurisdiction: 'CHILE',
      receivedAmount: 1_080,
      receivedCurrency: 'USD',
      receivedAt: '2026-07-05',
      providerReference: 'WIRE-123',
      notes: 'Pago recibido en USD por la BHE existente'
    });

    assert.equal(settlement.feeReceiptId, bhe.id);
    assert.equal(settlement.serviceSourceJurisdiction, 'CHILE');
    assert.equal(settlement.receivedCurrency, 'USD');
    assert.equal(settlement.receivedAmount, 1080);
    assert.equal((await settlementUseCases.getFeeReceiptForeignSettlement(active, bhe.id)).providerReference, 'WIRE-123');

    const foreignRows = await foreignUseCases.listForeignServiceIncome(active);
    assert.equal(foreignRows.length, 0);
    const foreignLedger = await createForeignServiceTaxLedgerProvider({ foreignServiceUseCases: foreignUseCases }).list(active);
    assert.equal(foreignLedger.length, 0);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('US-IL-004 Path A: settlement exige BHE del AnnualWorkspace activo', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'ptl-il004-path-a-year-'));
  const database = createSqliteDatabase({ path: join(directory, 'path-a-year.sqlite') });
  const active2026 = context(2026);
  try {
    const feeRepository = createSqliteFeeReceiptRepository(undefined, database);
    const feeUseCases = createFeeReceiptUseCases({ repository: feeRepository, resolveActiveContext: async () => active2026 });
    const settlementRepository = createSqliteFeeReceiptForeignSettlementRepository(undefined, database);
    const settlementUseCases = createFeeReceiptForeignSettlementUseCases({
      repository: settlementRepository,
      feeReceiptUseCases: feeUseCases,
      resolveActiveContext: async () => active2026
    });

    const historical = await feeRepository.create(active2026, {
      taxYear: 2025,
      issueDate: '2025-11-01',
      clientName: 'Historical Client',
      amountInputType: 'GROSS',
      grossAmount: 500_000,
      withholdingMode: 'NO_WITHHOLDING',
      withholdingRate: 0,
      paymentStatus: 'PAID'
    });

    await assert.rejects(
      () => settlementUseCases.upsertFeeReceiptForeignSettlement(active2026, historical.id, {
        payerCountry: 'US',
        receivedAmount: 500,
        receivedCurrency: 'USD',
        receivedAt: '2026-01-02'
      }),
      /workspace_year_mismatch|commercial year|año/i
    );
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
