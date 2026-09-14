# Slice IL-B — Existing owner flows inside ledger shell — Evidence

**Stories:** `PTL-US-IL-002`, `PTL-US-IL-003`  
**Status:** `DONE`  
**Priority:** P0  
**UI impact:** `FLOW_CHANGE`, `FIELD_REUSE`

## Objective

Allow the annual factual ledger to open the canonical owner editor for dependent / other income-source facts and domestic fee receipts / BHE without creating generic ledger mutation authority or dual-write.

## Required flow

```text
Annual ledger
  -> owner-aware action
  -> explicit owner intent (aggregate + record id + create/edit mode)
  -> existing owner editor
  -> canonical owner save/cancel
  -> return to annual ledger
  -> ledger reloads from projection
```

## Implemented

- ledger page exposes `+ Renta / ingreso` and `+ BHE` owner-entry actions;
- each ledger row exposes `Ver / editar`;
- `AnnualWorkspaceGate` carries `ownerAggregate`, `ownerRecordId` and `CREATE|EDIT` as an explicit local navigation intent;
- `INCOME_SOURCE` opens the existing `WorkspaceView` income editor and targets the exact source by canonical owner record id;
- `FEE_RECEIPT` opens the existing `FeeReceiptsModule` form and targets the exact BHE by canonical owner record id;
- create actions open the corresponding existing create form directly;
- owner saves continue through `incomeService` / `feeReceiptService` only;
- ledger-originated save and cancel return to `Ingresos del año`;
- return increments `ledgerRevision`, remounting the read-only ledger and forcing a fresh canonical projection read;
- unsupported owner aggregates fail explicitly instead of inventing a generic editor;
- `AnnualIncomeLedgerSection` contains no owner mutation service and introduces no POST/PUT/PATCH/DELETE surface.

## Invariants

- `income_sources` remains the mutation authority for dependent/other income-source facts;
- `fee_receipts` remains the mutation authority for domestic BHE;
- ledger entries remain read-only projections;
- owner identity is used only to route to the correct editor;
- annual context remains the active `AnnualTaxWorkspace`;
- no generic ledger update endpoint or dual-write is introduced;
- save/cancel from an owner flow returns to the ledger when the flow originated there;
- stale/cross-year protections from Block 01 remain authoritative.

## Automated gates

Pre-visual validation completed successfully through the canonical Make façade:

```text
make typecheck
make test
```

Result: PASS.

After visual approval, the canonical closure gate was executed on the validated IL-B head:

```text
make validate
```

Result: PASS.

## Visual gate

User visual validation completed successfully for all four required round-trips:

1. ledger -> create income -> cancel/save -> ledger — PASS;
2. ledger row -> exact income edit -> cancel/save -> ledger — PASS;
3. ledger -> create BHE -> cancel/save -> ledger — PASS;
4. ledger row -> exact BHE edit -> cancel/save -> ledger — PASS.

Confirmed visually:

- the expected existing owner editor opens, not a generic ledger editor;
- edit opens the exact selected canonical record;
- cancel returns to `Ingresos del año` without persisting a change;
- save returns to `Ingresos del año` and the visible ledger reflects the saved canonical fact;
- the active commercial year remains unchanged;
- owner/type identity is not rebound by the ledger.

Result: `USER_VISUAL_APPROVED`.

## Closure

```text
AUTOMATED PASS
  + USER_VISUAL_APPROVED
  + CANONICAL make validate PASS
  = DONE
```

`PTL-US-IL-002` and `PTL-US-IL-003` satisfy the IL-B closure contract. The PR may be marked ready and merged after story/backlog reconciliation.