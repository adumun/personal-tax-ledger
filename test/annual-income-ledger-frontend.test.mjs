import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const componentPath = new URL('../apps/local/web/src/app/AnnualIncomeLedgerSection.tsx', import.meta.url);
const overviewPath = new URL('../apps/local/web/src/app/AnnualWorkspaceOverviewSection.tsx', import.meta.url);
const clientPath = new URL('../apps/local/web/src/app/tax-ledger-client.ts', import.meta.url);

test('US-IL-001: ledger anual visible conserva estructura factual y filtros exactos', async () => {
  const source = await readFile(componentPath, 'utf8');
  assert.match(source, /Ingresos del año/);
  assert.match(source, /Año comercial \{commercialYear\}/);
  assert.match(source, /Bruto registrado/);
  assert.match(source, /Retenciones \/ PPM registrados/);
  assert.match(source, /entryKind/);
  assert.match(source, /recognitionState/);
  assert.match(source, /No hay ingresos registrados para este año/);
  assert.match(source, /No registrado/);
  assert.match(source, /No representa impuesto final, devolución, readiness ni conciliación con SII/);
  assert.doesNotMatch(source, /<small>[^<]*(?:Devolución estimada|Saldo por pagar|Readiness)/i);
  assert.doesNotMatch(source, /<h[1-6][^>]*>[^<]*(?:Devolución estimada|Saldo por pagar|Readiness)/i);
});

test('US-IL-001: renta dependiente, BHE y otros owners se distinguen sin dual-write', async () => {
  const source = await readFile(componentPath, 'utf8');
  assert.match(source, /DEPENDENT_INCOME/);
  assert.match(source, /DOMESTIC_FEE_INCOME/);
  assert.match(source, /OTHER_INCOME_SOURCE/);
  assert.match(source, /ownerAggregate/);
  assert.match(source, /ownerRecordId/);
  assert.match(source, /Vista unificada · solo lectura/);
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
});

test('US-IL-006: cambio anual invalida respuestas visuales stale y preserva identidad propietaria', async () => {
  const source = await readFile(componentPath, 'utf8');
  assert.match(source, /requestSerial/);
  assert.match(source, /serial !== requestSerial\.current/);
  assert.match(source, /next\.commercialYear !== commercialYear/);
  assert.match(source, /STALE_SUPPRESSED/);
  assert.match(source, /entry\.ownerAggregate/);
  assert.match(source, /entry\.ownerRecordId/);
});

test('US-IL-001: la vista se monta bajo el AnnualWorkspace activo', async () => {
  const overview = await readFile(overviewPath, 'utf8');
  assert.match(overview, /AnnualIncomeLedgerSection/);
  assert.match(overview, /commercialYear=\{commercialYear\}/);
});

test('US-IL-006: el cliente del ledger continúa siendo estrictamente read-only', async () => {
  const client = await readFile(clientPath, 'utf8');
  assert.match(client, /\/api\/tax-ledger/);
  assert.match(client, /async list\(/);
  assert.doesNotMatch(client, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(client, /\b(?:create|update|delete|remove)\s*\(/);
});
