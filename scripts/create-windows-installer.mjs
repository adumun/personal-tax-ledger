import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertProductionWindowsSigning,
  signingSummary,
  windowsSigningConfig
} from './windows-signing.mjs';

const require = createRequire(import.meta.url);
const { createWindowsInstaller } = require('electron-winstaller');

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
const appDirectory = join(repoRoot, 'out', 'Personal Tax Ledger-win32-x64');
const outputDirectory = join(repoRoot, 'out', 'installer-win32-x64');
const installerAssetsDirectory = join(repoRoot, 'out', '.installer-assets');
const loadingGifPath = join(installerAssetsDirectory, 'ptl-loading.gif');
const sourceLoadingGifBase64 = join(repoRoot, 'assets', 'installer', 'ptl-loading.gif.base64.txt');
const setupFileName = `PersonalTaxLedger-${packageJson.version}-Setup.exe`;
const winstallerRoot = dirname(require.resolve('electron-winstaller/package.json'));
const winstallerVendor = join(winstallerRoot, 'vendor');

const EXPECTED_LOADING_GIF_WIDTH = 400;
const EXPECTED_LOADING_GIF_HEIGHT = 180;
const MIN_LOADING_GIF_BYTES = 1024;
const MIN_LOADING_GIF_FRAMES = 2;

function commandAvailable(command) {
  const result = spawnSync('sh', ['-lc', `command -v ${command}`], { stdio: 'ignore' });
  return result.status === 0;
}

function materializeSquirrel7Zip() {
  const hostArch = os.arch();
  const supported = new Set(['x64', 'arm64']);
  if (!supported.has(hostArch)) {
    throw new Error(`Arquitectura host no soportada para 7-Zip de electron-winstaller: ${hostArch}.`);
  }

  const sourceExe = join(winstallerVendor, `7z-${hostArch}.exe`);
  const sourceDll = join(winstallerVendor, `7z-${hostArch}.dll`);
  const targetExe = join(winstallerVendor, '7z.exe');
  const targetDll = join(winstallerVendor, '7z.dll');

  for (const source of [sourceExe, sourceDll]) {
    if (!existsSync(source)) {
      throw new Error(`electron-winstaller no contiene el binario 7-Zip esperado: ${source}`);
    }
  }

  copyFileSync(sourceExe, targetExe);
  copyFileSync(sourceDll, targetDll);

  if (!existsSync(targetExe) || !existsSync(targetDll)) {
    throw new Error('No fue posible materializar vendor/7z.exe y vendor/7z.dll para Squirrel.Windows.');
  }

  console.log(`Squirrel 7-Zip materialized for host arch ${hostArch}:`);
  console.log(`- ${targetExe}`);
  console.log(`- ${targetDll}`);
}

function countGifGraphicControlExtensions(gif) {
  let count = 0;
  for (let i = 0; i <= gif.length - 3; i += 1) {
    if (gif[i] === 0x21 && gif[i + 1] === 0xf9 && gif[i + 2] === 0x04) count += 1;
  }
  return count;
}

function assertCanonicalInstallerGif(gif) {
  if (gif.length < MIN_LOADING_GIF_BYTES) {
    throw new Error(`El asset canónico del instalador es demasiado pequeño (${gif.length} bytes).`);
  }

  if (gif.subarray(0, 6).toString('ascii') !== 'GIF89a') {
    throw new Error('El asset canónico del instalador no decodifica a un GIF89a válido.');
  }

  const width = gif.readUInt16LE(6);
  const height = gif.readUInt16LE(8);
  if (width !== EXPECTED_LOADING_GIF_WIDTH || height !== EXPECTED_LOADING_GIF_HEIGHT) {
    throw new Error(`Dimensiones inesperadas para el GIF del instalador: ${width}x${height}; se esperaba ${EXPECTED_LOADING_GIF_WIDTH}x${EXPECTED_LOADING_GIF_HEIGHT}.`);
  }

  if (gif[gif.length - 1] !== 0x3b) {
    throw new Error('El GIF del instalador no termina con el trailer GIF esperado (0x3B).');
  }

  const frameCount = countGifGraphicControlExtensions(gif);
  if (frameCount < MIN_LOADING_GIF_FRAMES) {
    throw new Error(`El GIF del instalador no contiene animación suficiente: ${frameCount} frame(s) detectados.`);
  }

  return { width, height, frameCount };
}

function materializeInstallerAssets() {
  if (!existsSync(sourceLoadingGifBase64)) {
    throw new Error(`Falta el asset canónico del instalador: ${sourceLoadingGifBase64}`);
  }

  const encoded = readFileSync(sourceLoadingGifBase64, 'utf8').trim();
  if (!encoded) {
    throw new Error('El asset base64 del instalador está vacío.');
  }

  const gif = Buffer.from(encoded, 'base64');
  const contract = assertCanonicalInstallerGif(gif);

  mkdirSync(installerAssetsDirectory, { recursive: true });
  writeFileSync(loadingGifPath, gif);

  if (!existsSync(loadingGifPath)) {
    throw new Error('No fue posible materializar el splash de instalación PTL.');
  }

  console.log(`PTL polished installer GIF materialized: ${loadingGifPath}`);
  console.log(`PTL installer GIF bytes: ${gif.length}`);
  console.log(`PTL installer GIF contract: GIF89a ${contract.width}x${contract.height}, ${contract.frameCount} frames`);
}

if (process.platform !== 'win32') {
  const missing = ['mono', 'wine'].filter(command => !commandAvailable(command));
  if (missing.length > 0) {
    throw new Error(`Generar el instalador Squirrel desde Linux/WSL requiere Mono y Wine. Faltan: ${missing.join(', ')}.`);
  }
}

if (!existsSync(join(appDirectory, 'PersonalTaxLedger.exe'))) {
  throw new Error(`No existe el paquete Windows esperado en ${appDirectory}. Ejecuta npm run desktop:package:win antes de generar el instalador.`);
}

assertProductionWindowsSigning();
const windowsSign = windowsSigningConfig();
const signing = signingSummary();
console.log(`Windows installer signing: ${signing.enabled ? `enabled (${signing.mode})` : 'disabled'}`);
console.log(`Windows signing required: ${signing.required ? 'yes' : 'no'}`);
if (signing.enabled) console.log(`Windows timestamp server: ${signing.timestampServer}`);

materializeSquirrel7Zip();
rmSync(outputDirectory, { recursive: true, force: true });
materializeInstallerAssets();

const installerOptions = {
  appDirectory,
  outputDirectory,
  usePackageJson: false,
  name: 'PersonalTaxLedger',
  title: 'Personal Tax Ledger',
  description: 'Personal tax ledger and estimation desktop application',
  authors: 'Adümün',
  owners: 'Adümün',
  version: packageJson.version,
  exe: 'PersonalTaxLedger.exe',
  setupExe: setupFileName,
  loadingGif: loadingGifPath,
  noMsi: true,
  noDelta: true
};

if (windowsSign) installerOptions.windowsSign = windowsSign;

await createWindowsInstaller(installerOptions);

console.log(`windows installer created: ${join(outputDirectory, setupFileName)}`);
console.log('Squirrel metadata generated in the same directory for later update-channel work.');
