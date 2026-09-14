import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ledgerPath = 'apps/local/web/src/app/AnnualIncomeLedgerSection.tsx';
const gatePath = 'apps/local/web/src/app/AnnualWorkspaceGate.tsx';

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

test('IL-B: annual compositor routes ledger entries only by canonical owner aggregate', async () => {
  const source = await readFile(gatePath, 'utf8');

  assert.match(source, /entry\.ownerAggregate === 'INCOME_SOURCE'/);
  assert.match(source, /setSurface\('incomes'\)/);
  assert.match(source, /entry\.ownerAggregate === 'FEE_RECEIPT'/);
  assert.match(source, /setSurface\('fees'\)/);
  assert.match(source, /onOpenOwner=\{openLedgerOwner\}/);
  assert.match(source, /onAddIncome=\{\(\) => setSurface\('incomes'\)\}/);
  assert.match(source, /onAddFeeReceipt=\{\(\) => setSurface\('fees'\)\}/);
});
