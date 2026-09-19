import playwrightTest from '../.tools/playwright/node_modules/@playwright/test/index.js';

const { test, expect } = playwrightTest;

const now = '2026-09-16T05:00:00.000Z';

function amount(amount = 0, presentCount = 0, missingCount = 0) {
  return { amount, presentCount, missingCount };
}

function summaryFor(entries) {
  const recognized = entries.filter(entry => entry.recognitionState === 'RECOGNIZED').length;
  const pending = entries.filter(entry => entry.recognitionState === 'PENDING').length;
  const excluded = entries.filter(entry => entry.recognitionState === 'EXCLUDED').length;
  const gross = entries.reduce((sum, entry) => sum + (entry.amounts.gross || 0), 0);
  return {
    entryCount: entries.length,
    recognitionCounts: { RECOGNIZED: recognized, PENDING: pending, EXCLUDED: excluded },
    totalsByCurrency: {
      CLP: {
        gross: amount(gross, entries.filter(entry => entry.amounts.gross != null).length, 0),
        withholding: amount(),
        ppm: amount(),
        net: amount()
      }
    },
    totalsByEntryKind: {}
  };
}

function ledgerPayload(year, entries = []) {
  return {
    annualWorkspaceId: `e2e-workspace-${year}`,
    commercialYear: year,
    filters: { entryKind: null, ownerAggregate: null, recognitionState: null },
    entries,
    factualSummary: summaryFor(entries)
  };
}

async function activeCommercialYear(page) {
  const response = await page.request.get('/api/annual-workspaces');
  expect(response.ok(), 'La app debe estar levantada con make up antes del E2E').toBeTruthy();
  const payload = await response.json();
  return payload.activeCommercialYear;
}

async function openAnnualLedger(page) {
  await page.goto('/');
  await page.getByText('Ingresos del año', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Ingresos del año' })).toBeVisible();
}

async function mockLedger(page, year, entriesProvider = () => []) {
  await page.route(/\/api\/tax-ledger(?:\?.*)?$/, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(ledgerPayload(year, entriesProvider()))
    });
  });
}

test.describe('PTL-US-IL-004 — Servicio con pagador extranjero', () => {
  test('Path A: Chile persiste sólo settlement de una BHE y vuelve al ledger', async ({ page }) => {
    const year = await activeCommercialYear(page);
    await mockLedger(page, year);

    const receipt = {
      id: 'e2e-bhe-001',
      taxYear: year,
      issueDate: `${year}-06-15`,
      folio: 'E2E-001',
      clientName: 'E2E Foreign Payer Chile',
      clientTaxId: null,
      description: 'Servicio E2E Path A',
      amountInputType: 'GROSS',
      grossAmount: 1000000,
      netAmount: 855000,
      withholdingMode: 'WITHHELD_BY_RECIPIENT',
      withholdingRate: 0.145,
      withheldAmount: 145000,
      ppmPaidAmount: 0,
      taxable: true,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      paymentDate: `${year}-06-20`,
      notes: null
    };

    let settlementPayload = null;
    let foreignCreateCalls = 0;

    await page.route(/\/api\/fee-receipts(?:\?.*)?$/, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([receipt])
    }));

    await page.route('**/api/fee-receipts/e2e-bhe-001/foreign-settlement', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: 'not_found' }) });
        return;
      }
      settlementPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          feeReceiptId: receipt.id,
          ...settlementPayload,
          createdAt: now,
          updatedAt: now
        })
      });
    });

    await page.route('**/api/foreign-service-income', async route => {
      if (route.request().method() === 'POST') foreignCreateCalls += 1;
      await route.continue();
    });

    await openAnnualLedger(page);
    await page.getByRole('button', { name: '+ Servicio con pagador extranjero' }).click();

    const dialog = page.getByRole('dialog', { name: 'Servicio con pagador extranjero' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('País del pagador (ISO, 2 letras)', { exact: true }).fill('US');
    await dialog.getByRole('button', { name: /Chile/ }).click();

    await dialog.getByRole('combobox').selectOption(receipt.id);
    await dialog.getByLabel('Monto recibido', { exact: true }).fill('1100');
    await dialog.getByLabel('Moneda recibida', { exact: true }).fill('USD');
    await dialog.getByLabel('Fecha del pago', { exact: true }).fill(`${year}-06-20`);
    await dialog.getByLabel('Referencia banco / proveedor', { exact: true }).fill('E2E-BANK-A');
    await dialog.getByRole('button', { name: 'Guardar settlement y volver al ledger', exact: true }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Ingresos del año' })).toBeVisible();
    expect(foreignCreateCalls).toBe(0);
    expect(settlementPayload).toMatchObject({
      payerCountry: 'US',
      serviceSourceJurisdiction: 'CHILE',
      receivedAmount: 1100,
      receivedCurrency: 'USD',
      receivedAt: `${year}-06-20`,
      providerReference: 'E2E-BANK-A'
    });
  });

  test('Path B: extranjero conserva original, exige FX explícito y reabre el owner exacto', async ({ page }) => {
    const year = await activeCommercialYear(page);
    let visibleInLedger = false;
    let record = null;
    let conversions = [];
    let createPayload = null;
    let updatePayload = null;

    const ledgerEntry = () => ({
      ledgerEntryId: 'e2e-ledger-foreign-001',
      annualWorkspaceId: `e2e-workspace-${year}`,
      commercialYear: year,
      entryKind: 'FOREIGN_SERVICE_INCOME',
      ownerAggregate: 'FOREIGN_SERVICE_INCOME',
      ownerRecordId: 'e2e-foreign-001',
      occurredOn: `${year}-07-10`,
      periodRef: `YEAR:${year}`,
      recognitionState: conversions.length ? 'RECOGNIZED' : 'PENDING',
      amounts: {
        currency: 'CLP',
        gross: conversions.length ? 950000 : null,
        withholding: null,
        ppm: null,
        net: null
      },
      counterpartySummary: 'E2E Foreign Client',
      provenanceSummary: null,
      updatedAt: now
    });

    await mockLedger(page, year, () => visibleInLedger ? [ledgerEntry()] : []);

    await page.route('**/api/foreign-service-income', async route => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      createPayload = route.request().postDataJSON();
      record = {
        id: 'e2e-foreign-001',
        ...createPayload,
        currentConversionId: null,
        createdAt: now,
        updatedAt: now
      };
      visibleInLedger = true;
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(record) });
    });

    await page.route('**/api/foreign-service-income/e2e-foreign-001', async route => {
      if (route.request().method() === 'PUT') {
        updatePayload = route.request().postDataJSON();
        record = { ...record, ...updatePayload, updatedAt: now };
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(record) });
    });

    await page.route('**/api/foreign-service-income/e2e-foreign-001/conversions', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(conversions)
    }));

    await page.route('**/api/foreign-service-income/e2e-foreign-001/conversions/official', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'NEEDS_REVIEW', reason: 'OFFICIAL_PROVIDER_UNAVAILABLE' })
    }));

    await page.route('**/api/foreign-service-income/e2e-foreign-001/conversions/manual', async route => {
      const payload = route.request().postDataJSON();
      const conversion = {
        id: 'e2e-fx-001',
        foreignServiceIncomeId: 'e2e-foreign-001',
        originalAmount: record.originalAmount,
        originalCurrency: record.originalCurrency,
        fxRate: payload.fxRate,
        fxRateDate: payload.fxRateDate,
        fxSource: 'MANUAL',
        fxSourceReference: payload.fxSourceReference,
        fxReason: payload.fxReason,
        clpAmount: record.originalAmount * payload.fxRate,
        conversionStatus: 'RESOLVED',
        supersedesConversionId: null,
        createdAt: now
      };
      conversions = [conversion];
      record = { ...record, currentConversionId: conversion.id, updatedAt: now };
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(conversion) });
    });

    await openAnnualLedger(page);
    await page.getByRole('button', { name: '+ Servicio con pagador extranjero' }).click();

    let dialog = page.getByRole('dialog', { name: 'Servicio con pagador extranjero' });
    await dialog.getByLabel('País del pagador (ISO, 2 letras)', { exact: true }).fill('US');
    await dialog.getByRole('button', { name: /Extranjero/ }).click();
    await dialog.getByLabel('Pagador', { exact: true }).fill('E2E Foreign Client');
    await dialog.getByLabel('Fecha de percepción', { exact: true }).fill(`${year}-07-10`);
    await dialog.getByLabel('Monto original', { exact: true }).fill('1000');
    await dialog.getByLabel('Moneda original', { exact: true }).fill('USD');
    await dialog.getByLabel('Descripción', { exact: true }).fill('Servicio E2E Path B');
    await dialog.getByRole('button', { name: 'Guardar hecho', exact: true }).click();

    expect(createPayload).toMatchObject({
      taxYear: year,
      payerName: 'E2E Foreign Client',
      payerCountry: 'US',
      serviceSourceJurisdiction: 'FOREIGN',
      receivedAt: `${year}-07-10`,
      originalAmount: 1000,
      originalCurrency: 'USD'
    });
    await expect(dialog.getByText('Pendiente de conversión', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Requiere revisión', { exact: true })).toBeVisible();

    await dialog.getByRole('button', { name: 'Intentar resolver con fuente oficial', exact: true }).click();
    await expect(dialog.getByRole('status')).toContainText('la fuente oficial no está disponible');
    await expect(dialog).not.toContainText('NEEDS_REVIEW');
    await expect(dialog).not.toContainText('BCCH');

    await dialog.getByRole('button', { name: 'Guardar nuevo snapshot manual', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('La conversión manual exige tasa, fecha, fuente/referencia y razón.');

    await dialog.getByLabel('Tipo de cambio', { exact: true }).fill('950');
    await dialog.getByLabel('Fecha de la tasa', { exact: true }).fill(`${year}-07-10`);
    await dialog.getByLabel('Fuente / referencia', { exact: true }).fill('E2E manual fixture');
    await dialog.getByLabel('Razón de uso manual', { exact: true }).fill('Validación E2E determinista');
    await dialog.getByRole('button', { name: 'Guardar nuevo snapshot manual', exact: true }).click();

    await expect(dialog.getByText('Conversión resuelta', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Conversión manual', { exact: true }).first()).toBeVisible();
    await expect(dialog.getByText('$950.000', { exact: true })).toBeVisible();

    await dialog.getByRole('button', { name: 'Volver al ledger', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('E2E Foreign Client', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Ver / editar', exact: true }).click();
    dialog = page.getByRole('dialog', { name: 'Servicio con pagador extranjero' });
    await expect(dialog.getByLabel('Pagador', { exact: true })).toHaveValue('E2E Foreign Client');
    await expect(dialog.getByLabel('Monto original', { exact: true })).toHaveValue('1000');
    await expect(dialog.getByLabel('Moneda original', { exact: true })).toHaveValue('USD');

    await dialog.getByLabel('Descripción', { exact: true }).fill('Servicio E2E Path B editado');
    await dialog.getByRole('button', { name: 'Guardar corrección del hecho', exact: true }).click();
    expect(updatePayload).toMatchObject({ description: 'Servicio E2E Path B editado' });
    await expect(dialog.getByText('Conversión resuelta', { exact: true })).toBeVisible();

    await dialog.getByRole('button', { name: 'Volver al ledger', exact: true }).click();
    await expect(dialog).toBeHidden();
  });
});
