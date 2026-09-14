import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Red estática complementaria: protege que WorkspaceView no vuelva a llamar
// directamente endpoints CRUD de ingresos. La lectura inicial puede llegar por
// bootstrap; las mutaciones siguen delegadas al income-service. La cobertura
// real del comportamiento de income-service vive en test/income-service.test.mjs.
test('WorkspaceView delega mutaciones de ingresos al income-service y no llama CRUD HTTP directo', async () => {
  const source = await readFile('apps/local/web/src/app/WorkspaceView.tsx', 'utf8');
  assert.match(source, /import\s*\{[^}]*incomeService[^}]*\}\s*from\s*'\.\.\/api'/);
  assert.match(source, /api\.bootstrap\(/);
  assert.match(source, /incomeService\.create\(/);
  assert.match(source, /incomeService\.update\(/);
  assert.match(source, /incomeService\.remove\(/);
  assert.doesNotMatch(source, /api\.(?:listIncomes|createIncome|updateIncome|deleteIncome)\(/);
});

test('WorkspaceView renderiza la sección de ingresos compartida de shared-ui', async () => {
  const source = await readFile('apps/local/web/src/app/WorkspaceView.tsx', 'utf8');
  assert.match(source, /import\s*\{[^}]*IncomesSection[^}]*\}\s*from\s*'@personal-tax-ledger\/shared-ui'/);
  assert.match(source, /<IncomesSection\b/);
  assert.match(source, /@personal-tax-ledger\/shared-ui/);
});
