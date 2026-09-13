import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const gateSource = await readFile('apps/local/web/src/app/AnnualWorkspaceGate.tsx', 'utf8');
const cssSource = await readFile('apps/local/web/src/app/annual-workspace.css', 'utf8');
const apiSource = await readFile('apps/local/web/src/api.ts', 'utf8');

test('AW-001: header visible usa workspaces persistidos y muestra AT derivado no editable', () => {
  assert.match(gateSource, /listAnnualWorkspaces/);
  assert.match(gateSource, /Año comercial/);
  assert.match(gateSource, /Operación Renta/);
  assert.match(gateSource, /derivedTaxYearLabel/);
  assert.doesNotMatch(gateSource, /YEAR_FLOOR/);
});

test('AW-001: AnnualWorkspace queda como única autoridad visible para cambiar año', () => {
  assert.match(cssSource, /\.year-picker\s*\{[\s\S]*display:\s*none\s*!important/);
  assert.match(cssSource, /Configuración tributaria no longer exposes a second year switcher/);
  assert.match(cssSource, /h2 \+ \.form-grid > label:first-child[\s\S]*display:\s*none\s*!important/);
  assert.match(gateSource, /catalog\.workspaces\.map/);
});

test('AW-001\/AW-006: selección usa transición generacional protegida y remount por año activo', () => {
  assert.match(apiSource, /selectAnnualWorkspace:[\s\S]*annualWorkspaceTransition/);
  assert.match(apiSource, /beginWorkspaceTransition/);
  assert.match(gateSource, /WorkspaceView key=\{catalog\.activeCommercialYear\}/);
  assert.match(gateSource, /Cambiando contexto/);
});

test('AW-002: creación mantiene Empezar vacío como modo explícito y no copia hechos', () => {
  assert.match(gateSource, /Crear año tributario/);
  assert.match(gateSource, /creationMode === 'EMPTY'/);
  assert.match(gateSource, /Empezar vacío/);
  assert.match(gateSource, /No copia ingresos, boletas, hipotecas, APV, evidencia ni conciliaciones/);
});

test('AW-003: inicialización desde año anterior es una opción explícita separada de Empezar vacío', () => {
  assert.match(gateSource, /creationMode === 'PRIOR'/);
  assert.match(gateSource, /Inicializar desde un año anterior/);
  assert.match(gateSource, /Año fuente/);
  assert.match(gateSource, /Crear e inicializar/);
});

test('AW-002: cliente crea por endpoint anual y no mediante settings.year implícito', () => {
  assert.match(apiSource, /createAnnualWorkspace:[\s\S]*\/api\/annual-workspaces/);
  assert.match(apiSource, /mode: 'EMPTY'/);
});
