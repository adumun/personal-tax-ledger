import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ledgerPath = 'apps/local/web/src/app/AnnualIncomeLedgerSection.tsx';
const gatePath = 'apps/local/web/src/app/AnnualWorkspaceGate.tsx';
const contextPath = 'apps/local/web/src/app/ledger-owner-flow-context.tsx';
const workspacePath = 'apps/local/web/src/app/WorkspaceView.tsx';
const feePath = 'apps/local/web/src/features/fee-receipts/FeeReceiptsModule.tsx';

test('IL-B: ledger exposes owner-aware add and edit actions without mutation authority', async () => {
  const source = await readFile(ledgerPath, 'utf8');

  assert.match(source, /onAddIncome/);
  assert.match(source, /onAddFeeReceipt/);
  assert.match(source, /onOpenOwner/);
  assert.match(source, /\+ Renta \/ ingreso/);
  assert.match(source, /\+ BHE/);
  assert.match(source, /Ver \/ editar/);
  assert.match(source, /Las acciones abren el editor del agregado propietario/);

  assert.doesNotMatch(source, /fetch\([^)]*method:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
  assert.doesNotMatch(source, /incomeService\.(?:create|update|remove)/);
  assert.doesNotMatch(source, /feeReceiptService\.(?:create|update|remove)/);
});

test('IL-B: annual compositor carries exact owner identity and reloads ledger after round trip', async () => {
  const [gate, context] = await Promise.all([
    readFile(gatePath, 'utf8'),
    readFile(contextPath, 'utf8')
  ]);

  assert.match(gate, /ownerRecordId:\s*entry\.ownerRecordId/);
  assert.match(gate, /ownerAggregate:\s*'INCOME_SOURCE',\s*mode:\s*'CREATE'/s);
  assert.match(gate, /ownerAggregate:\s*'FEE_RECEIPT',\s*mode:\s*'CREATE'/s);
  assert.match(gate, /setLedgerRevision\(revision => revision \+ 1\)/);
  assert.match(gate, /setSurface\('annual-ledger'\)/);
  assert.match(gate, /key=\{`\$\{catalog\.activeCommercialYear\}:\$\{ledgerRevision\}`\}/);
  assert.match(gate, /LedgerOwnerFlowProvider/);

  assert.match(context, /ownerAggregate:\s*LedgerOwnerAggregate/);
  assert.match(context, /ownerRecordId\?:\s*string/);
  assert.match(context, /mode:\s*LedgerOwnerFlowMode/);
  assert.match(context, /markOpened/);
  assert.match(context, /complete/);
});

test('IL-B / US-IL-002: income owner flow opens exact existing editor and returns after save or cancel', async () => {
  const source = await readFile(workspacePath, 'utf8');

  assert.match(source, /useLedgerOwnerFlow/);
  assert.match(source, /intent\?\.ownerAggregate !== 'INCOME_SOURCE'/);
  assert.match(source, /intent\.mode === 'CREATE'/);
  assert.match(source, /sources\.find\(source => String\(source\.id\) === intent\.ownerRecordId\)/);
  assert.match(source, /setEditing\(\{ \.\.\.target \}\)/);
  assert.match(source, /setIncomesTab\('form'\)/);
  assert.match(source, /incomeService\.update\(source\)/);
  assert.match(source, /incomeService\.create\(source\)/);
  assert.match(source, /ownerFlow\.complete\(\)/);
  assert.match(source, /onClick=\{cancelSourceEdit\}/);
});

test('IL-B / US-IL-003: BHE owner flow opens exact existing editor and returns after save or cancel', async () => {
  const source = await readFile(feePath, 'utf8');

  assert.match(source, /useLedgerOwnerFlow/);
  assert.match(source, /intent\?\.ownerAggregate !== 'FEE_RECEIPT'/);
  assert.match(source, /intent\.mode === 'CREATE'/);
  assert.match(source, /receipts\.find\(receipt => String\(receipt\.id\) === intent\.ownerRecordId\)/);
  assert.match(source, /setEditing\(\{ \.\.\.target \}\)/);
  assert.match(source, /setFeeTab\('boletas'\)/);
  assert.match(source, /feeReceiptService\.update\(payload\)/);
  assert.match(source, /feeReceiptService\.create\(payload\)/);
  assert.match(source, /ownerFlow\.complete\(\)/);
  assert.match(source, /onClick=\{cancelOwnerEdit\}/);
});
