import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const section = readFileSync(new URL('../apps/local/web/src/app/AnnualWorkspaceOverviewSection.tsx', import.meta.url), 'utf8');
const gate = readFileSync(new URL('../apps/local/web/src/app/AnnualWorkspaceGate.tsx', import.meta.url), 'utf8');
const client = readFileSync(new URL('../apps/local/web/src/app/annual-workspace-overview-client.ts', import.meta.url), 'utf8');

test('AW-005: overview visible declara contexto estructural y no resultado tributario', () => {
  assert.match(section, /Año tributario/);
  assert.match(section, /Contexto estructural del período/);
  assert.match(section, /resultado tributario se muestra en Resumen anual/);
  assert.doesNotMatch(section, /te devolverán|debes pagar|Tax Health|readiness percentage/i);
});

test('AW-005: ausencia se muestra como No registrado y evidencia no disponible, nunca como $0', () => {
  assert.match(section, /No registrado/);
  assert.match(section, /Capacidad aún no disponible|evidence\.label/);
  assert.doesNotMatch(section, /\$0/);
});

test('AW-005: overview se monta bajo el contexto anual y se recarga por commercialYear', () => {
  assert.match(gate, /<AnnualWorkspaceOverviewSection commercialYear=\{catalog\.activeCommercialYear\}/);
  assert.match(section, /\[commercialYear\]/);
  assert.match(client, /\/api\/annual-workspace\/overview/);
});
