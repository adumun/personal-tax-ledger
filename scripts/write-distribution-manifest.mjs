import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import process from 'node:process';

const [mode, outputDirectory] = process.argv.slice(2);
if (!['store', 'uat'].includes(mode) || !outputDirectory) {
  console.error('Usage: node scripts/write-distribution-manifest.mjs <store|uat> <output-directory>');
  process.exit(2);
}

const root = resolve(outputDirectory);
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const files = readdirSync(root)
  .filter(name => name !== 'distribution-manifest.json')
  .map(name => {
    const path = join(root, name);
    const stat = statSync(path);
    if (!stat.isFile()) return null;
    const bytes = readFileSync(path);
    return {
      name,
      bytes: stat.size,
      sha256: createHash('sha256').update(bytes).digest('hex')
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name));

const manifest = {
  schemaVersion: 1,
  product: packageJson.productName,
  version: packageJson.version,
  mode,
  generatedAt: new Date().toISOString(),
  intendedUse: mode === 'store'
    ? 'Microsoft Store submission candidate; upload the MSIX artifact to Partner Center.'
    : 'Controlled local UAT installer; not a Microsoft Store submission artifact.',
  files
};

const target = join(root, 'distribution-manifest.json');
writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`distribution manifest: ${basename(target)}`);
for (const file of files) {
  console.log(`- ${file.name}: ${file.bytes} bytes sha256=${file.sha256}`);
}
