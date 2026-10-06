import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppxManifest, msixConfig } from './msix-config.mjs';
import { createBrandedPng, MSIX_BRAND_ASSET_VERSION } from './msix-assets.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(repoRoot, 'out', 'Personal Tax Ledger-win32-x64');
const outDir = join(repoRoot, 'out', 'msix');
const stagingDir = join(outDir, 'staging');
const assetsDir = join(stagingDir, 'Assets');
const metadataPath = join(outDir, 'msix-build.json');

const REQUIRED_ASSETS = Object.freeze([
  { name: 'StoreLogo.png', width: 50, height: 50 },
  { name: 'Square44x44Logo.png', width: 44, height: 44 },
  { name: 'Square150x150Logo.png', width: 150, height: 150 },
  { name: 'Wide310x150Logo.png', width: 310, height: 150 }
]);

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function writeBrandedAsset({ name, width, height }) {
  const png = createBrandedPng(width, height);
  const path = join(assetsDir, name);
  writeFileSync(path, png);
  return {
    name,
    width,
    height,
    sha256: sha256(png),
    brandAssetVersion: MSIX_BRAND_ASSET_VERSION
  };
}

function assertCertificationAssets(assets) {
  if (assets.length !== REQUIRED_ASSETS.length) {
    throw new Error(`Set de assets MSIX incompleto: ${assets.length}/${REQUIRED_ASSETS.length}.`);
  }

  const hashes = new Set(assets.map(asset => asset.sha256));
  if (hashes.size !== assets.length) {
    throw new Error('Los assets MSIX deben materializarse como imágenes específicas por tamaño; se detectaron binarios duplicados.');
  }

  for (const required of REQUIRED_ASSETS) {
    const asset = assets.find(candidate => candidate.name === required.name);
    if (!asset || asset.width !== required.width || asset.height !== required.height) {
      throw new Error(`Asset MSIX requerido inválido o ausente: ${required.name}.`);
    }
    if (asset.brandAssetVersion !== MSIX_BRAND_ASSET_VERSION) {
      throw new Error(`Asset MSIX sin identidad PTL versionada: ${required.name}.`);
    }
  }
}

if (!existsSync(join(sourceDir, 'PersonalTaxLedger.exe'))) {
  throw new Error(`No existe el paquete desktop Windows esperado en ${sourceDir}. Ejecuta npm run desktop:package:win primero.`);
}

const config = msixConfig();
rmSync(outDir, { recursive: true, force: true });
mkdirSync(stagingDir, { recursive: true });
cpSync(sourceDir, stagingDir, { recursive: true });
mkdirSync(assetsDir, { recursive: true });

const assets = REQUIRED_ASSETS.map(writeBrandedAsset);
assertCertificationAssets(assets);
writeFileSync(join(stagingDir, 'AppxManifest.xml'), createAppxManifest(config), 'utf8');

const manifest = readFileSync(join(stagingDir, 'AppxManifest.xml'));
const metadata = {
  formatVersion: 2,
  mode: config.mode,
  identityName: config.identityName,
  publisher: config.publisher,
  publisherDisplayName: config.publisherDisplayName,
  version: config.version,
  architecture: config.architecture,
  sourceDirectory: sourceDir,
  stagingDirectory: stagingDir,
  expectedPackageName: `PersonalTaxLedger-${config.version}-x64.msix`,
  manifestSha256: sha256(manifest),
  certification: {
    policy: '10.1.1.11 On Device Tiles',
    brandingAssetVersion: MSIX_BRAND_ASSET_VERSION,
    placeholderAssetsAllowed: false,
    assets
  },
  createdAt: new Date().toISOString()
};
writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

console.log('MSIX staging prepared:');
console.log(`- mode: ${metadata.mode}`);
console.log(`- identity: ${metadata.identityName}`);
console.log(`- publisher: ${metadata.publisher}`);
console.log(`- version: ${metadata.version}`);
console.log(`- branding: ${MSIX_BRAND_ASSET_VERSION}`);
console.log(`- certification assets: ${assets.length}/${REQUIRED_ASSETS.length} branded`);
console.log(`- staging: ${metadata.stagingDirectory}`);
console.log(`- metadata: ${metadataPath}`);
console.log('Next: package staging with MakeAppx.exe on a Windows SDK host, run WACK, then resubmit to Partner Center.');
