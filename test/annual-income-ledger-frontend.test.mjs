import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const componentPath = new URL('../apps/local/web/src/app/AnnualIncomeLedgerSection.tsx', import.meta.url);
const gatePath = new URL('../apps/local/web/src/app/AnnualWorkspaceGate.tsx', import.meta.url);
const workspacePath = new URL('../apps/local/web/src/app/WorkspaceView.tsx', import.meta.url);
const overviewPath = new URL('../apps/local/web/src/app/AnnualWorkspaceOverviewSection.tsx', import.meta.url);
const profilePath = new URL('../apps/local/web/src/app/ApplicabilityProfileSection.tsx', import.meta.url);
const clientPath = new URL('../apps/local/web/src/app/tax-ledger-client.ts', import.meta.url);

test('US-IL-001: ledger anual visible conserva estructura factual y filtros exactos', async () => {
  const source = await readFile(componentPath, 'utf8');
  assert.match(source, /Ingresos del año/);
  assert.match(source, /Año comercial \$\{commercialYear\}/);
  assert.match(source, /Bruto registrado/);
  assert.match(source, /Retenciones \/ PPM registrados/);
  assert.match(source, /entryKind/);
  assert.match(source, /recognitionState/);
  assert.match(source, /No hay ingresos registrados para este año/);
  assert.match(source, /No registrado/);
  assert.match(source, /No representa el impuesto final, una devolución estimada, el estado de preparación tributaria ni una conciliación con el SII/);
  assert.doesNotMatch(source, /TAX-04/);
  assert.doesNotMatch(source, /\breadiness\b/i);
  assert.doesNotMatch(source, /<small>[^<]*(?:Devolución estimada|Saldo por pagar|Readiness)/i);
  assert.doesNotMatch(source, /<h[1-6][^>]*>[^<]*(?:Devolución estimada|Saldo por pagar|Readiness)/i);
});

test('US-IL-001: renta dependiente, BHE y otros owners se distinguen sin dual-write', async () => {
  const source = await readFile(componentPath, 'utf8');
  assert.match(source, /DEPENDENT_INCOME/);
  assert.match(source, /DOMESTIC_FEE_INCOME/);
  assert.match(source, /OTHER_INCOME_SOURCE/);
  assert.match(source, /ownerAggregate/);
  assert.match(source, /ownerRecordId/);
  assert.match(source, /Solo lectura/);
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
});

test('US-IL-006: cambio anual invalida respuestas visuales stale y preserva identidad propietaria', async () => {
  const source = await readFile(componentPath, 'utf8');
  assert.match(source, /requestSerial/);
  assert.match(source, /serial !== requestSerial\.current/);
  assert.match(source, /next\.commercialYear !== commercialYear/);
  assert.match(source, /STALE_SUPPRESSED/);
  assert.match(source, /entry\.ownerAggregate/);
  assert.match(source, /entry\.ownerRecordId/);
});

test('React profile dogfood: surfaces anuales consumen PageHeader compartido', async () => {
  const [ledger, overview, profile] = await Promise.all([
    readFile(componentPath, 'utf8'),
    readFile(overviewPath, 'utf8'),
    readFile(profilePath, 'utf8')
  ]);
  assert.match(ledger, /import \{ PageHeader \} from '@adumun\/react-components'/);
  assert.match(overview, /import \{ PageHeader \} from '@adumun\/react-components'/);
  assert.match(profile, /import \{ PageHeader \} from '@adumun\/react-components'/);
  assert.match(ledger, /<PageHeader/);
  assert.match(overview, /<PageHeader/);
  assert.match(profile, /<PageHeader/);
  assert.doesNotMatch(profile, />NEEDS_REVIEW</);
});

test('US-IL-001: ledger vive como surface del único AppShell bajo el AnnualWorkspace activo', async () => {
  const gate = await readFile(gatePath, 'utf8');
  assert.match(gate, /AppShell/);
  assert.match(gate, /PrimaryNav/);
  assert.match(gate, /ContextHeader/);
  assert.match(gate, /surface === 'annual-ledger'/);
  assert.match(gate, /<AnnualIncomeLedgerSection commercialYear=\{catalog\.activeCommercialYear\}/);
});

test('React profile dogfood: WorkspaceView deja de poseer sidebar y segundo selector anual', async () => {
  const workspace = await readFile(workspacePath, 'utf8');
  assert.match(workspace, /WorkspaceView\(\{ tab \}/);
  assert.doesNotMatch(workspace, /className="sidebar"/);
  assert.doesNotMatch(workspace, /className="app-shell"/);
  assert.doesNotMatch(workspace, /className="year-picker"/);
  assert.doesNotMatch(workspace, /const changeYear\s*=/);
});

test('US-IL-006: el cliente del ledger continúa siendo estrictamente read-only', async () => {
  const client = await readFile(clientPath, 'utf8');
  assert.match(client, /\/api\/tax-ledger/);
  assert.match(client, /async list\(/);
  assert.doesNotMatch(client, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(client, /\b(?:create|update|delete|remove)\s*\(/);
});
