import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createIncomeSourceTaxLedgerProvider,
  createFeeReceiptTaxLedgerProvider
} from '@personal-tax-ledger/application';

const context = {
  workspaceId: 'local-workspace',
  actorId: 'local-user',
  annualWorkspaceId: 'annual-tax-workspace-2026',
  commercialYear: 2026
};

test('IL-002: income provider preserva owner authority y no recalcula gross/net', async () => {
  const provider = createIncomeSourceTaxLedgerProvider({
    incomeUseCases: {
      async listIncomeSources(received, year) {
        assert.equal(received, context);
        assert.equal(year, 2026);
        return [
          {
            id: 7,
            taxYear: 2026,
            active: true,
            name: 'Empleador A',
            kind: 'SALARY',
            amount: 1_500_000,
            inputMode: 'NET',
            frequency: 'MONTHLY',
            taxable: true,
            updatedAt: '2026-09-13T07:25:00.000Z'
          }
        ];
      }
    }
  });

  const [entry] = await provider.list(context);
  assert.equal(entry.ledgerEntryId, 'income-source:7');
  assert.equal(entry.ownerAggregate, 'INCOME_SOURCE');
  assert.equal(entry.ownerRecordId, '7');
  assert.equal(entry.entryKind, 'DEPENDENT_INCOME');
  assert.equal(entry.recognitionState, 'RECOGNIZED');
  assert.equal(entry.amounts.gross, null);
  assert.equal(entry.amounts.net, 1_500_000);
  assert.equal(entry.amounts.withholding, null);
  assert.equal(entry.amounts.ppm, null);
  assert.equal(entry.provenanceSummary.inputMode, 'NET');
});

test('IL-002: income provider excluye fuentes inactivas sin convertir taxable en recognition state', async () => {
  const provider = createIncomeSourceTaxLedgerProvider({
    incomeUseCases: {
      async listIncomeSources() {
        return [{
          id: 8,
          taxYear: 2026,
          active: false,
          name: 'Bono antiguo',
          kind: 'BONUS',
          amount: 300_000,
          inputMode: 'GROSS',
          frequency: 'ONE_TIME',
          taxable: false,
          updatedAt: '2026-09-13T07:25:00.000Z'
        }];
      }
    }
  });
  const [entry] = await provider.list(context);
  assert.equal(entry.entryKind, 'OTHER_INCOME_SOURCE');
  assert.equal(entry.recognitionState, 'EXCLUDED');
  assert.equal(entry.amounts.gross, 300_000);
  assert.equal(entry.provenanceSummary.taxable, false);
});

test('IL-002: fee provider respeta ISSUE_DATE, PAID_ONLY y CANCELLED', async () => {
  const receipts = [
    {
      id: 'f1', taxYear: 2026, issueDate: '2026-02-01', clientName: 'Cliente A',
      grossAmount: 1_000_000, netAmount: 847_500, withheldAmount: 152_500, ppmPaidAmount: 0,
      status: 'ACTIVE', paymentStatus: 'PENDING', withholdingMode: 'WITHHELD_BY_RECIPIENT', taxable: true,
      updatedAt: '2026-09-13T07:25:00.000Z'
    },
    {
      id: 'f2', taxYear: 2026, issueDate: '2026-03-01', clientName: 'Cliente B',
      grossAmount: 500_000, netAmount: 423_750, withheldAmount: 76_250, ppmPaidAmount: 0,
      status: 'CANCELLED', paymentStatus: 'PAID', withholdingMode: 'WITHHELD_BY_RECIPIENT', taxable: true,
      updatedAt: '2026-09-13T07:25:00.000Z'
    }
  ];
  const feeReceiptUseCases = { async listFeeReceipts() { return receipts; } };

  const issueDateProvider = createFeeReceiptTaxLedgerProvider({
    feeReceiptUseCases,
    settingsUseCases: { async getSettings() { return { feeRecognitionMode: 'ISSUE_DATE' }; } }
  });
  const issueEntries = await issueDateProvider.list(context);
  assert.equal(issueEntries[0].recognitionState, 'RECOGNIZED');
  assert.equal(issueEntries[1].recognitionState, 'EXCLUDED');

  const paidOnlyProvider = createFeeReceiptTaxLedgerProvider({
    feeReceiptUseCases,
    settingsUseCases: { async getSettings() { return { feeRecognitionMode: 'PAID_ONLY' }; } }
  });
  const paidEntries = await paidOnlyProvider.list(context);
  assert.equal(paidEntries[0].recognitionState, 'PENDING');
  assert.equal(paidEntries[1].recognitionState, 'EXCLUDED');
});

test('IL-002: fee provider preserva montos canónicos y provenance del owner', async () => {
  const provider = createFeeReceiptTaxLedgerProvider({
    feeReceiptUseCases: {
      async listFeeReceipts(received, filters) {
        assert.equal(received, context);
        assert.deepEqual(filters, { taxYear: 2026 });
        return [{
          id: 'fee-9', taxYear: 2026, issueDate: '2026-09-10', folio: '42', clientName: 'Cliente C',
          grossAmount: 2_500_000, netAmount: 2_118_750, withheldAmount: 381_250, ppmPaidAmount: 0,
          status: 'ACTIVE', paymentStatus: 'PAID', withholdingMode: 'WITHHELD_BY_RECIPIENT', taxable: true,
          updatedAt: '2026-09-13T07:25:00.000Z'
        }];
      }
    },
    settingsUseCases: { async getSettings() { return { feeRecognitionMode: 'PAID_ONLY' }; } }
  });

  const [entry] = await provider.list(context);
  assert.equal(entry.ledgerEntryId, 'fee-receipt:fee-9');
  assert.equal(entry.ownerAggregate, 'FEE_RECEIPT');
  assert.equal(entry.ownerRecordId, 'fee-9');
  assert.equal(entry.entryKind, 'DOMESTIC_FEE_INCOME');
  assert.deepEqual(entry.amounts, {
    currency: 'CLP', gross: 2_500_000, withholding: 381_250, ppm: 0, net: 2_118_750
  });
  assert.equal(entry.periodRef, 'MONTH:2026-09');
  assert.equal(entry.provenanceSummary.recognitionMode, 'PAID_ONLY');
  assert.equal(entry.provenanceSummary.source, 'fee_receipts');
});

test('IL-002: providers no exponen operaciones de mutación del ledger', () => {
  const income = createIncomeSourceTaxLedgerProvider({ incomeUseCases: { async listIncomeSources() { return []; } } });
  const fees = createFeeReceiptTaxLedgerProvider({
    feeReceiptUseCases: { async listFeeReceipts() { return []; } },
    settingsUseCases: { async getSettings() { return {}; } }
  });
  for (const provider of [income, fees]) {
    assert.deepEqual(Object.keys(provider), ['list']);
    assert.equal(provider.create, undefined);
    assert.equal(provider.update, undefined);
    assert.equal(provider.remove, undefined);
  }
});
