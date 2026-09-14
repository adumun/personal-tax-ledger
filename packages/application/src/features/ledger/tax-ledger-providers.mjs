import {
  assertAnnualWorkspaceContext,
  assertTaxLedgerProviderContract
} from '@personal-tax-ledger/contracts';
import {
  createTaxLedgerEntry,
  TAX_LEDGER_ENTRY_KIND,
  TAX_LEDGER_OWNER_AGGREGATE,
  TAX_LEDGER_RECOGNITION_STATE
} from '@personal-tax-ledger/core';

function requiredFunction(value, name) {
  if (typeof value !== 'function') throw new TypeError(`${name} is required`);
  return value;
}

function sourceKind(kind) {
  return String(kind ?? '').toUpperCase() === 'SALARY'
    ? TAX_LEDGER_ENTRY_KIND.DEPENDENT_INCOME
    : TAX_LEDGER_ENTRY_KIND.OTHER_INCOME_SOURCE;
}

function sourceAmounts(source) {
  const amount = Number(source.amount);
  const normalizedAmount = Number.isFinite(amount) && amount >= 0 ? amount : null;
  const inputMode = String(source.inputMode ?? 'GROSS').toUpperCase();
  return {
    currency: 'CLP',
    gross: inputMode === 'NET' ? null : normalizedAmount,
    withholding: null,
    ppm: null,
    net: inputMode === 'NET' ? normalizedAmount : null
  };
}

function sourceRecognition(source) {
  return source.active === false
    ? TAX_LEDGER_RECOGNITION_STATE.EXCLUDED
    : TAX_LEDGER_RECOGNITION_STATE.RECOGNIZED;
}

function stableTimestamp(record) {
  return record?.updatedAt ?? record?.createdAt ?? '';
}

export function createIncomeSourceTaxLedgerProvider({ incomeUseCases }) {
  const listIncomeSources = requiredFunction(incomeUseCases?.listIncomeSources, 'incomeUseCases.listIncomeSources');

  return assertTaxLedgerProviderContract({
    async list(context) {
      const scoped = assertAnnualWorkspaceContext(context);
      const rows = await listIncomeSources(scoped, scoped.commercialYear);
      return rows.map(source => createTaxLedgerEntry({
        ledgerEntryId: `income-source:${source.id}`,
        annualWorkspaceId: scoped.annualWorkspaceId,
        commercialYear: scoped.commercialYear,
        entryKind: sourceKind(source.kind),
        ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.INCOME_SOURCE,
        ownerRecordId: source.id,
        occurredOn: null,
        periodRef: `YEAR:${scoped.commercialYear}`,
        recognitionState: sourceRecognition(source),
        amounts: sourceAmounts(source),
        counterpartySummary: source.name,
        provenanceSummary: {
          source: 'income_sources',
          sourceKind: source.kind ?? null,
          inputMode: source.inputMode ?? null,
          frequency: source.frequency ?? null,
          taxable: source.taxable ?? null
        },
        updatedAt: stableTimestamp(source)
      }));
    }
  });
}

function feeRecognition(receipt, recognitionMode) {
  if (receipt.status === 'CANCELLED') return TAX_LEDGER_RECOGNITION_STATE.EXCLUDED;
  if (recognitionMode === 'PAID_ONLY' && receipt.paymentStatus !== 'PAID') {
    return TAX_LEDGER_RECOGNITION_STATE.PENDING;
  }
  return TAX_LEDGER_RECOGNITION_STATE.RECOGNIZED;
}

export function createFeeReceiptTaxLedgerProvider({ feeReceiptUseCases, settingsUseCases }) {
  const listFeeReceipts = requiredFunction(feeReceiptUseCases?.listFeeReceipts, 'feeReceiptUseCases.listFeeReceipts');
  const getSettings = requiredFunction(settingsUseCases?.getSettings, 'settingsUseCases.getSettings');

  return assertTaxLedgerProviderContract({
    async list(context) {
      const scoped = assertAnnualWorkspaceContext(context);
      const [rows, settings] = await Promise.all([
        listFeeReceipts(scoped, { taxYear: scoped.commercialYear }),
        getSettings(scoped)
      ]);
      const recognitionMode = settings?.feeRecognitionMode === 'PAID_ONLY' ? 'PAID_ONLY' : 'ISSUE_DATE';

      return rows.map(receipt => createTaxLedgerEntry({
        ledgerEntryId: `fee-receipt:${receipt.id}`,
        annualWorkspaceId: scoped.annualWorkspaceId,
        commercialYear: scoped.commercialYear,
        entryKind: TAX_LEDGER_ENTRY_KIND.DOMESTIC_FEE_INCOME,
        ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.FEE_RECEIPT,
        ownerRecordId: receipt.id,
        occurredOn: receipt.issueDate ?? null,
        periodRef: receipt.issueDate ? `MONTH:${String(receipt.issueDate).slice(0, 7)}` : `YEAR:${scoped.commercialYear}`,
        recognitionState: feeRecognition(receipt, recognitionMode),
        amounts: {
          currency: 'CLP',
          gross: receipt.grossAmount ?? null,
          withholding: receipt.withheldAmount ?? null,
          ppm: receipt.ppmPaidAmount ?? null,
          net: receipt.netAmount ?? null
        },
        counterpartySummary: receipt.clientName,
        provenanceSummary: {
          source: 'fee_receipts',
          folio: receipt.folio ?? null,
          status: receipt.status ?? null,
          paymentStatus: receipt.paymentStatus ?? null,
          withholdingMode: receipt.withholdingMode ?? null,
          recognitionMode,
          taxable: receipt.taxable ?? null
        },
        updatedAt: stableTimestamp(receipt)
      }));
    }
  });
}

function currentResolvedConversion(conversions, currentConversionId) {
  const conversion = conversions.find(item => item.id === currentConversionId) ?? null;
  return conversion?.conversionStatus === 'RESOLVED' ? conversion : null;
}

export function createForeignServiceTaxLedgerProvider({ foreignServiceUseCases }) {
  const listForeignServiceIncome = requiredFunction(
    foreignServiceUseCases?.listForeignServiceIncome,
    'foreignServiceUseCases.listForeignServiceIncome'
  );
  const listForeignServiceConversions = requiredFunction(
    foreignServiceUseCases?.listForeignServiceConversions,
    'foreignServiceUseCases.listForeignServiceConversions'
  );

  return assertTaxLedgerProviderContract({
    async list(context) {
      const scoped = assertAnnualWorkspaceContext(context);
      const rows = await listForeignServiceIncome(scoped);
      const entries = [];

      for (const income of rows) {
        const conversions = await listForeignServiceConversions(scoped, income.id);
        const conversion = currentResolvedConversion(conversions, income.currentConversionId);
        const recognized = Boolean(income.receivedAt && conversion);
        entries.push(createTaxLedgerEntry({
          ledgerEntryId: `foreign-service-income:${income.id}`,
          annualWorkspaceId: scoped.annualWorkspaceId,
          commercialYear: scoped.commercialYear,
          entryKind: TAX_LEDGER_ENTRY_KIND.FOREIGN_SERVICE_INCOME,
          ownerAggregate: TAX_LEDGER_OWNER_AGGREGATE.FOREIGN_SERVICE_INCOME,
          ownerRecordId: income.id,
          occurredOn: income.receivedAt ?? null,
          periodRef: income.receivedAt
            ? `MONTH:${String(income.receivedAt).slice(0, 7)}`
            : `YEAR:${scoped.commercialYear}`,
          recognitionState: recognized
            ? TAX_LEDGER_RECOGNITION_STATE.RECOGNIZED
            : TAX_LEDGER_RECOGNITION_STATE.PENDING,
          amounts: {
            currency: 'CLP',
            gross: recognized ? conversion.clpAmount : null,
            withholding: null,
            ppm: null,
            net: null
          },
          counterpartySummary: income.payerName,
          provenanceSummary: {
            source: 'foreign_service_income',
            payerCountry: income.payerCountry,
            serviceSourceJurisdiction: income.serviceSourceJurisdiction,
            originalAmount: income.originalAmount,
            originalCurrency: income.originalCurrency,
            receivedAt: income.receivedAt,
            conversionId: conversion?.id ?? null,
            fxRate: conversion?.fxRate ?? null,
            fxRateDate: conversion?.fxRateDate ?? null,
            fxSource: conversion?.fxSource ?? null,
            fxSourceReference: conversion?.fxSourceReference ?? null,
            foreignTaxAmountOriginal: income.foreignTaxAmountOriginal ?? null,
            foreignTaxCurrency: income.foreignTaxCurrency ?? null
          },
          updatedAt: stableTimestamp(income)
        }));
      }

      return entries;
    }
  });
}
