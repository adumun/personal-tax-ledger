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
const setupFileName = `PersonalTaxLedger-${packageJson.version}-Setup.exe`;
const winstallerRoot = dirname(require.resolve('electron-winstaller/package.json'));
const winstallerVendor = join(winstallerRoot, 'vendor');

const PALETTE = [[20,33,38],[53,199,167],[234,244,242],[170,192,187],[45,71,76],[111,141,134],[8,37,31],[0,0,0]];
const FONT={A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],G:['01110','10001','10000','10111','10001','10001','01110'],I:['11111','00100','00100','00100','00100','00100','11111'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],W:['10001','10001','10001','10101','10101','10101','01010'],Y:['10001','10001','01010','00100','00100','00100','00100'],' ':['00000','00000','00000','00000','00000','00000','00000']};

function put16(parts,v){parts.push(Buffer.from([v&255,(v>>8)&255]));}
function subBlocks(bytes){const parts=[];for(let o=0;o<bytes.length;o+=255){const b=bytes.subarray(o,Math.min(o+255,bytes.length));parts.push(Buffer.from([b.length]),b);}parts.push(Buffer.from([0]));return Buffer.concat(parts);}
function naiveLzw(indices,minCodeSize=3){const clear=1<<minCodeSize,eoi=clear+1,codeSize=minCodeSize+1;let current=0,bits=0;const out=[];const emit=code=>{current|=code<<bits;bits+=codeSize;while(bits>=8){out.push(current&255);current>>=8;bits-=8;}};emit(clear);for(const pixel of indices){emit(pixel);emit(clear);}emit(eoi);if(bits>0)out.push(current&255);return Buffer.from(out);}
function canvas(w,h,c=0){return new Uint8Array(w*h).fill(c);}
function rect(buf,w,h,x,y,rw,rh,c){const x0=Math.max(0,x),y0=Math.max(0,y),x1=Math.min(w,x+rw),y1=Math.min(h,y+rh);for(let yy=y0;yy<y1;yy+=1)buf.fill(c,yy*w+x0,yy*w+x1);}
function text(buf,w,h,value,x,y,scale,c){let cursor=x;for(const raw of value.toUpperCase()){const glyph=FONT[raw]||FONT[' '];for(let row=0;row<glyph.length;row+=1){for(let col=0;col<glyph[row].length;col+=1){if(glyph[row][col]==='1')rect(buf,w,h,cursor+col*scale,y+row*scale,scale,scale,c);}}cursor+=6*scale;}}
function installerFrame(w,h,phase){const p=canvas(w,h,0);rect(p,w,h,26,34,70,70,1);text(p,w,h,'PTL',38,57,3,6);text(p,w,h,'PERSONAL TAX LEDGER',120,38,2,2);text(p,w,h,'PREPARANDO WINDOWS',120,68,2,3);text(p,w,h,'TUS DATOS EN TU EQUIPO',120,94,1,3);rect(p,w,h,120,126,250,4,4);const segment=62,travel=250+segment,left=Math.round(120-segment+phase*travel);rect(p,w,h,left,126,segment,4,1);text(p,w,h,'ADUMUN',120,150,1,5);return p;}
function generateInstallerLoadingGif({width=400,height=180,frames=12,delayCs=9}={}){const parts=[Buffer.from('GIF89a','ascii')];put16(parts,width);put16(parts,height);parts.push(Buffer.from([0xF2,0,0]));for(const rgb of PALETTE)parts.push(Buffer.from(rgb));parts.push(Buffer.from([0x21,0xFF,0x0B]),Buffer.from('NETSCAPE2.0','ascii'),Buffer.from([0x03,0x01,0,0,0]));for(let i=0;i<frames;i+=1){const pixels=installerFrame(width,height,i/Math.max(1,frames-1));parts.push(Buffer.from([0x21,0xF9,0x04,0,delayCs&255,(delayCs>>8)&255,0,0]));parts.push(Buffer.from([0x2C]));put16(parts,0);put16(parts,0);put16(parts,width);put16(parts,height);parts.push(Buffer.from([0,3]));parts.push(subBlocks(naiveLzw(pixels,3)));}parts.push(Buffer.from([0x3B]));return Buffer.concat(parts);}

function commandAvailable(command) {
  const result = spawnSync('sh', ['-lc', `command -v ${command}`], { stdio: 'ignore' });
  return result.status === 0;
}

function materializeSquirrel7Zip() {
  const hostArch = os.arch();
  const supported = new Set(['x64', 'arm64']);
  if (!supported.has(hostArch)) throw new Error(`Arquitectura host no soportada para 7-Zip de electron-winstaller: ${hostArch}.`);

  const sourceExe = join(winstallerVendor, `7z-${hostArch}.exe`);
  const sourceDll = join(winstallerVendor, `7z-${hostArch}.dll`);
  const targetExe = join(winstallerVendor, '7z.exe');
  const targetDll = join(winstallerVendor, '7z.dll');

  for (const source of [sourceExe, sourceDll]) {
    if (!existsSync(source)) throw new Error(`electron-winstaller no contiene el binario 7-Zip esperado: ${source}`);
  }

  copyFileSync(sourceExe, targetExe);
  copyFileSync(sourceDll, targetDll);
  if (!existsSync(targetExe) || !existsSync(targetDll)) throw new Error('No fue posible materializar vendor/7z.exe y vendor/7z.dll para Squirrel.Windows.');

  console.log(`Squirrel 7-Zip materialized for host arch ${hostArch}:`);
  console.log(`- ${targetExe}`);
  console.log(`- ${targetDll}`);
}

function materializeInstallerAssets() {
  mkdirSync(installerAssetsDirectory, { recursive: true });
  writeFileSync(loadingGifPath, generateInstallerLoadingGif());
  if (!existsSync(loadingGifPath)) throw new Error('No fue posible materializar el splash de instalación PTL.');
  console.log(`PTL branded installer GIF materialized: ${loadingGifPath}`);
}

if (process.platform !== 'win32') {
  const missing = ['mono', 'wine'].filter(command => !commandAvailable(command));
  if (missing.length > 0) throw new Error(`Generar el instalador Squirrel desde Linux/WSL requiere Mono y Wine. Faltan: ${missing.join(', ')}.`);
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
