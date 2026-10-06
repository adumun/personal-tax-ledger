import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('AW-006: el frontend exige confirmación explícita antes de cambiar de año', async () => {
  const source = await readFile('apps/local/web/src/api.ts', 'utf8');
  assert.match(source, /WorkspaceTransitionCancelledError/);
  assert.match(source, /window\.confirm/);
  assert.match(source, /descartará cualquier formulario o cambio no guardado/);
  assert.match(source, /beginWorkspaceTransition\(settings\.year\)/);
});

test('AW-006: las respuestas de una generación anual anterior se descartan', async () => {
  const source = await readFile('apps/local/web/src/api.ts', 'utf8');
  assert.match(source, /workspaceGeneration/);
  assert.match(source, /StaleWorkspaceResponseError/);
  assert.match(source, /requestGeneration !== workspaceGeneration/);
});
