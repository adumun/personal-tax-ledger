import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const section = readFileSync(new URL('../apps/local/web/src/app/AnnualWorkspaceOverviewSection.tsx', import.meta.url), 'utf8');
const gate = readFileSync(new URL('../apps/local/web/src/app/AnnualWorkspaceGate.tsx', import.meta.url), 'utf8');
const client = readFileSync(new URL('../apps/local/web/src/app/annual-workspace-overview-client.ts', import.meta.url), 'utf8');

test('AW-005: overview visible declara contexto estructural y no resultado tributario', () => {
  assert.match(section, /PageHeader/);
  assert.match(section, /title="Resumen del año"/);
  assert.match(section, /Estado del período activo y de la información que ya tienes registrada/);
  assert.match(section, /Año comercial/);
  assert.match(section, /Operación Renta/);
  assert.match(section, /Información disponible/);
  assert.match(section, /Reglas del período/);
  assert.doesNotMatch(section, /te devolverán|debes pagar|Tax Health|readiness percentage|Devolución estimada|Saldo por pagar/i);
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
