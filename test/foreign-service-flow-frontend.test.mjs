import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ledgerPath = 'apps/local/web/src/app/AnnualIncomeLedgerSection.tsx';
const flowPath = 'apps/local/web/src/app/ForeignServiceFlow.tsx';
const clientPath = 'apps/local/web/src/app/foreign-service-client.ts';
const contextPath = 'apps/local/web/src/app/ledger-owner-flow-context.tsx';

test('US-IL-004: ledger exposes one explicit foreign-payer entry point and owner-aware foreign edit', async () => {
  const [source, context] = await Promise.all([
    readFile(ledgerPath, 'utf8'),
    readFile(contextPath, 'utf8')
  ]);
  assert.match(source, /\+ Servicio con pagador extranjero/);
  assert.match(source, /FOREIGN_SERVICE_INCOME: 'Honorario de fuente extranjera'/);
  assert.match(source, /entry\.ownerAggregate === 'FOREIGN_SERVICE_INCOME'/);
  assert.match(source, /ownerFlow\.begin\(\{ ownerAggregate: 'FOREIGN_SERVICE_INCOME', mode: 'EDIT', ownerRecordId: entry\.ownerRecordId \}\)/);
  assert.match(source, /ownerFlow\.begin\(\{ ownerAggregate: 'FOREIGN_SERVICE_INCOME', mode: 'CREATE' \}\)/);
  assert.match(source, /onClose=\{ownerFlow\.complete\}/);
  assert.match(source, /onComplete=\{ownerFlow\.complete\}/);
  assert.match(context, /'INCOME_SOURCE' \| 'FEE_RECEIPT' \| 'FOREIGN_SERVICE_INCOME'/);
  assert.match(context, /begin:\s*\(intent:\s*LedgerOwnerFlowIntent\)/);
  assert.match(source, /Una BHE en CLP con settlement extranjero sigue siendo una sola entrada de ingreso/);
});

test('US-IL-004: classification keeps payer country separate from source jurisdiction', async () => {
  const source = await readFile(flowPath, 'utf8');
  assert.match(source, /País del pagador/);
  assert.match(source, /¿Dónde se prestó materialmente el servicio\?/);
  assert.match(source, /chooseJurisdiction\('CHILE'\)/);
  assert.match(source, /chooseJurisdiction\('FOREIGN'\)/);
  assert.match(source, /PTL no determina automáticamente/);
});

test('US-IL-004 Path A: settlement writes provenance on BHE surface and save returns through owner flow', async () => {
  const source = await readFile(flowPath, 'utf8');
  const client = await readFile(clientPath, 'utf8');
  assert.match(source, /saveSettlement\(selectedReceiptId/);
  assert.match(source, /La BHE continúa siendo el único hecho de ingreso del ledger/);
  assert.match(source, /Guardar settlement y volver al ledger/);
  assert.match(source, /await foreignServiceClient\.saveSettlement[\s\S]*onComplete\(\)/);
  assert.match(client, /\/api\/fee-receipts\/\$\{feeReceiptId\}\/foreign-settlement/);
  assert.doesNotMatch(client, /foreign-settlement.*\/api\/foreign-service-income/s);
});

test('US-IL-004 Path B: foreign fact and conversion history remain separate operations without raw UI enums', async () => {
  const source = await readFile(flowPath, 'utf8');
  const client = await readFile(clientPath, 'utf8');
  assert.match(source, /Guardar hecho/);
  assert.match(source, /Intentar resolver con fuente oficial/);
  assert.match(source, /Conversión manual documentada/);
  assert.match(source, /Historial de conversiones/);
  assert.match(source, /PTL no calcula en esta story el crédito del artículo 41 A/);
  assert.match(source, /Requiere revisión/);
  assert.match(source, /Banco Central de Chile/);
  assert.match(source, /conversionError && <div className="foreign-service-flow-message error" role="alert">\{conversionError\}<\/div>/);
  assert.match(source, /conversionInfo && <div className="foreign-service-flow-message" role="status">\{conversionInfo\}<\/div>/);
  assert.match(source, /setConversionError\('La conversión manual exige tasa, fecha, fuente\/referencia y razón\.'\)/);
  assert.doesNotMatch(source, />NEEDS_REVIEW</);
  assert.doesNotMatch(source, />BCCH</);
  assert.match(client, /conversions\/official/);
  assert.match(client, /conversions\/manual/);
  assert.match(client, /listConversions/);
});


test('US-IL-004: required and optional fields are explicit in the foreign-service UI', async () => {
  const source = await readFile(flowPath, 'utf8');
  assert.match(source, /Pagador<small aria-hidden="true"> · obligatorio<\/small>/);
  assert.match(source, /Monto original<small aria-hidden="true"> · obligatorio<\/small>/);
  assert.match(source, /Moneda original<small aria-hidden="true"> · obligatorio<\/small>/);
  assert.match(source, /Tipo de cambio<small aria-hidden="true"> · obligatorio<\/small>/);
  assert.match(source, /Fuente \/ referencia<small aria-hidden="true"> · obligatorio<\/small>/);
  assert.match(source, /Razón de uso manual<small aria-hidden="true"> · obligatorio<\/small>/);
  assert.match(source, /Descripción<small aria-hidden="true"> · opcional<\/small>/);
  assert.match(source, /Referencia documental<small aria-hidden="true"> · opcional<\/small>/);
  assert.match(source, /<input required/);
  assert.match(source, /<select required/);
});
