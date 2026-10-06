import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const componentPath = new URL('../apps/local/web/src/app/AnnualIncomeLedgerSection.tsx', import.meta.url);
const gatePath = new URL('../apps/local/web/src/app/AnnualWorkspaceGate.tsx', import.meta.url);
const workspacePath = new URL('../apps/local/web/src/app/WorkspaceView.tsx', import.meta.url);
const overviewPath = new URL('../apps/local/web/src/app/AnnualWorkspaceOverviewSection.tsx', import.meta.url);
const profilePath = new URL('../apps/local/web/src/app/ApplicabilityProfileSection.tsx', import.meta.url);
const clientPath = new URL('../apps/local/web/src/app/tax-ledger-client.ts', import.meta.url);
const sharedUiPath = new URL('../packages/shared-ui/src/index.tsx', import.meta.url);

test('US-IL-001: ledger anual visible conserva estructura factual y filtros exactos', async () => {
  const source = await readFile(componentPath, 'utf8');
  assert.match(source, /Ingresos del año/);
  assert.match(source, /Año comercial \$\{commercialYear\}/);
  assert.match(source, /Monto bruto disponible/);
  assert.match(source, /Retenciones \/ PPM registrados/);
  assert.match(source, /entryKind/);
  assert.match(source, /recognitionState/);
  assert.match(source, /La ausencia de registros no se interpreta como \$0 de ingresos/);
  assert.match(source, /No registrado/);
  assert.match(source, /Esta vista no representa el impuesto final, una devolución estimada, el estado de preparación tributaria ni una conciliación con el SII/);
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
  assert.match(source, /proyección de solo lectura/);
  assert.match(source, /no crea una segunda escritura/);
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
});

test('US-IL-005: posición factual anual separa categorías y conserva frontera no tributaria', async () => {
  const [source, client] = await Promise.all([
    readFile(componentPath, 'utf8'),
    readFile(clientPath, 'utf8')
  ]);

  assert.match(source, /Posición factual anual/);
  assert.match(source, /Lo registrado para \{commercialYear\}/);
  assert.match(source, /totalsByEntryKind/);
  assert.match(source, /Bruto factual reconocido/);
  assert.match(source, /Retención registrada/);
  assert.match(source, /PPM registrado/);
  assert.match(source, /Ver entradas/);
  assert.match(source, /setFilters\(current => \(\{ \.\.\.current, entryKind \}\)\)/);
  assert.match(source, /taxLedgerClient\.list\(\{\}\)/);
  assert.match(source, /No calcula tu impuesto anual ni anticipa devolución o pago/);
  assert.doesNotMatch(source, /posición factual[^\n]*(?:refund|liability|readiness|optimización)/i);

  assert.match(client, /TaxLedgerCategorySummary/);
  assert.match(client, /totalsByEntryKind:\s*Record<string, TaxLedgerCategorySummary>/);
});

test('US-IL-006: cambio anual invalida respuestas stale y la identidad propietaria se usa sólo para owner routing, no como dato visible', async () => {
  const [source, client] = await Promise.all([
    readFile(componentPath, 'utf8'),
    readFile(clientPath, 'utf8')
  ]);
  assert.match(source, /requestSerial/);
  assert.match(source, /serial !== requestSerial\.current/);
  assert.match(source, /next\.commercialYear !== commercialYear/);
  assert.match(source, /STALE_SUPPRESSED/);
  assert.match(source, /entry\.ownerAggregate/);
  assert.match(source, /ownerRecordId:\s*entry\.ownerRecordId/);
  assert.match(client, /ownerRecordId:\s*string/);
  assert.doesNotMatch(source, />\s*\{entry\.ownerRecordId\}\s*</);
  assert.doesNotMatch(source, /data-label="[^"]*(?:ID|Id|id)[^"]*"[^>]*>\s*\{entry\.ownerRecordId\}/);
});

test('React profile dogfood: surfaces anuales consumen PageHeader, SectionCard y StatusBadge compartidos', async () => {
  const [ledger, overview, profile] = await Promise.all([
    readFile(componentPath, 'utf8'),
    readFile(overviewPath, 'utf8'),
    readFile(profilePath, 'utf8')
  ]);
  for (const source of [ledger, overview, profile]) {
    assert.match(source, /PageHeader/);
    assert.match(source, /SectionCard/);
    assert.match(source, /StatusBadge/);
    assert.match(source, /from '@adumun\/react-components'/);
  }
  assert.doesNotMatch(profile, />NEEDS_REVIEW</);
});

test('React profile dogfood: annual context, ledger y perfil usan action-form primitives compartidos', async () => {
  const [gate, ledger, profile] = await Promise.all([
    readFile(gatePath, 'utf8'),
    readFile(componentPath, 'utf8'),
    readFile(profilePath, 'utf8')
  ]);
  assert.match(gate, /\bButton\b/);
  assert.match(gate, /\bSelect\b/);
  assert.match(gate, /\bRadioGroup\b/);
  assert.match(gate, /\bFormActions\b/);
  assert.match(ledger, /\bSelect\b/);
  assert.match(ledger, /\bButton\b/);
  assert.match(profile, /\bRadioGroup\b/);
  assert.match(profile, /\bFormActions\b/);
  assert.match(profile, /\bButton\b/);
  assert.doesNotMatch(profile, /role="radiogroup"/);
});

test('React profile dogfood: navegación elimina contexto anual duplicado y usa lenguaje de producto', async () => {
  const gate = await readFile(gatePath, 'utf8');
  assert.match(gate, /PrimaryNavGroup label="Período"/);
  assert.match(gate, />Resumen del año</);
  assert.match(gate, /title="Período activo"/);
  assert.match(gate, /StatusBadge tone="warning" dot>En preparación/);
  assert.doesNotMatch(gate, /ptl-nav-context/);
  assert.doesNotMatch(gate, /PrimaryNavGroup label="Año tributario"/);
});

test('US-IL-001: ledger vive como surface del único AppShell bajo el AnnualWorkspace activo', async () => {
  const gate = await readFile(gatePath, 'utf8');
  assert.match(gate, /AppShell/);
  assert.match(gate, /PrimaryNav/);
  assert.match(gate, /ContextHeader/);
  assert.match(gate, /surface === 'annual-ledger'/);
  assert.match(gate, /<AnnualIncomeLedgerSection[\s\S]*commercialYear=\{catalog\.activeCommercialYear\}/);
  assert.match(gate, /onAddIncome=/);
  assert.match(gate, /onAddFeeReceipt=/);
  assert.match(gate, /onOpenOwner=/);
});

test('React profile dogfood: WorkspaceView deja de poseer sidebar y segundo selector anual', async () => {
  const workspace = await readFile(workspacePath, 'utf8');
  assert.match(workspace, /WorkspaceView\(\{ tab \}/);
  assert.doesNotMatch(workspace, /className="sidebar"/);
  assert.doesNotMatch(workspace, /className="app-shell"/);
  assert.doesNotMatch(workspace, /className="year-picker"/);
  assert.doesNotMatch(workspace, /const changeYear\s*=/);
});

test('React profile dogfood: WorkspaceView adopta Tabs compartido para resumen e ingresos', async () => {
  const workspace = await readFile(workspacePath, 'utf8');
  assert.match(workspace, /import \{ Tabs \} from '@adumun\/react-components'/);
  assert.match(workspace, /<Tabs<SummaryTab>/);
  assert.match(workspace, /label="Vistas de estimación anual"/);
  assert.match(workspace, /<Tabs<IncomesTab>/);
  assert.match(workspace, /label="Vistas de ingresos laborales"/);
  assert.doesNotMatch(workspace, /className="sub-tabs"/);
});

test('Domain language: ingresos laborales no expone enums internos como SALARY', async () => {
  const sharedUi = await readFile(sharedUiPath, 'utf8');
  assert.match(sharedUi, /SALARY: 'Renta dependiente'/);
  assert.match(sharedUi, /INCOME_KIND_LABELS\[source\.kind\]/);
  assert.doesNotMatch(sharedUi, /<span className="kind">\{source\.kind\}<\/span>/);
});

test('US-IL-006: el cliente del ledger continúa siendo estrictamente read-only', async () => {
  const client = await readFile(clientPath, 'utf8');
  assert.match(client, /\/api\/tax-ledger/);
  assert.match(client, /async list\(/);
  assert.doesNotMatch(client, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(client, /\b(?:create|update|delete|remove)\s*\(/);
});
