import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gate = fs.readFileSync(new URL('../apps/local/web/src/app/AnnualWorkspaceGate.tsx', import.meta.url), 'utf8');
const client = fs.readFileSync(new URL('../apps/local/web/src/app/prior-year-initialization-client.ts', import.meta.url), 'utf8');
const service = fs.readFileSync(new URL('../packages/application/src/features/annual-workspace/prior-year-initialization-use-cases.mjs', import.meta.url), 'utf8');

test('AW-003: flujo visible habilita Inicializar desde un año anterior con preview', () => {
  assert.match(gate, /Inicializar desde un año anterior/);
  assert.match(gate, /Año fuente/);
  assert.match(gate, /Reutilizar/);
  assert.match(gate, /Crear e inicializar/);
  assert.match(gate, /priorYearInitializationClient\.preview/);
});

test('AW-003: preview visible declara obligatoriamente lo que no se copiará', () => {
  assert.match(gate, /No se copiarán/);
  assert.match(gate, /montos realizados ni movimientos de ledger/);
  assert.match(gate, /boletas, retenciones ni PPM/);
  assert.match(gate, /evidencia documental ni conciliaciones SII/);
  assert.match(gate, /resultados calculados ni proyecciones históricas/);
});

test('AW-003: cliente usa endpoint anual explícito de preview e inicialización', () => {
  assert.match(client, /\/api\/annual-workspace\/prior-year-initialization/);
  assert.match(client, /sourceCommercialYear/);
  assert.match(client, /targetCommercialYear/);
  assert.match(client, /categories/);
});

test('AW-004 enabler: allowlist no depende de repositorios transaccionales por presencia de tablas', () => {
  assert.match(service, /APPLICABILITY_PROFILE/);
  assert.doesNotMatch(service, /feeReceiptRepository/);
  assert.doesNotMatch(service, /incomeRepository/);
  assert.doesNotMatch(service, /mortgageRepository/);
  assert.match(service, /unsupported_reusable_category/);
});
