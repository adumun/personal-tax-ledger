import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('shared-ui no depende de infraestructura ni URLs de despliegue', async () => {
  const source = await readFile('packages/shared-ui/src/index.tsx', 'utf8');
  assert.doesNotMatch(source, /(?:firebase|supabase|node:sqlite|process\.env|https?:\/\/|fetch\()/i);
  assert.match(source, /export function IncomesSection/);
  assert.match(source, /export function SummaryMetrics/);
  assert.match(source, /onEdit/);
  assert.match(source, /onRemove/);
});

test('shared-ui exporta un build compilado en dist, no el .tsx fuente', async () => {
  const packageJson = JSON.parse(await readFile('packages/shared-ui/package.json', 'utf8'));
  assert.equal(packageJson.exports['.'].default, './dist/index.js');
  assert.equal(packageJson.exports['.'].types, './dist/index.d.ts');
  assert.equal(packageJson.scripts.build, 'tsc');
  await readFile('packages/shared-ui/dist/index.js', 'utf8');
  await readFile('packages/shared-ui/dist/index.d.ts', 'utf8');
});

test('shared-ui mantiene lenguaje de producto también en el artefacto runtime exportado', async () => {
  const [source, dist, makefile] = await Promise.all([
    readFile('packages/shared-ui/src/index.tsx', 'utf8'),
    readFile('packages/shared-ui/dist/index.js', 'utf8'),
    readFile('Makefile', 'utf8')
  ]);

  for (const content of [source, dist]) {
    assert.match(content, /SALARY[\s\S]*Renta dependiente/);
    assert.match(content, /HONORARIA[\s\S]*Honorarios/);
    assert.match(content, /BONUS[\s\S]*Premio \/ bono/);
  }

  assert.doesNotMatch(source, /className="kind">\{source\.kind\}/);
  assert.doesNotMatch(dist, /className:\s*"kind",\s*children:\s*source\.kind/);
  assert.match(dist, /INCOME_KIND_LABELS\[source\.kind\]\s*\|\|\s*'Ingreso'/);

  assert.match(makefile, /prepare-shared-ui:/);
  assert.match(makefile, /npm run build --workspace @personal-tax-ledger\/shared-ui/);
  assert.match(makefile, /up:\s*deps prepare-shared-ui/);
});
