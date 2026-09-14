# Slice IL-B — Existing owner flows inside ledger shell — Evidence

**Stories:** `PTL-US-IL-002`, `PTL-US-IL-003`  
**Status:** `IMPLEMENTATION_PENDING`  
**Priority:** P0  
**UI impact:** `FLOW_CHANGE`, `FIELD_REUSE`

## Objective

Allow the annual factual ledger to open the canonical owner editor for:

- dependent / other income-source facts;
- domestic fee receipts / BHE;

without creating generic ledger mutation authority or dual-write.

## Required flow

```text
Annual ledger
  -> owner-aware action
  -> existing owner editor
  -> canonical owner save/cancel
  -> return to annual ledger
  -> ledger reloads from projection
```

## Invariants

- `income_sources` remains the mutation authority for dependent/other income-source facts;
- `fee_receipts` remains the mutation authority for domestic BHE;
- ledger entries remain read-only projections;
- owner identity is used only to route to the correct editor;
- annual context remains the active `AnnualTaxWorkspace`;
- no generic ledger update endpoint or dual-write is introduced;
- save/cancel from an owner flow returns to the ledger when the flow originated there;
- stale/cross-year protections from Block 01 remain authoritative.

## Visual gate

Because this slice changes navigation and owner-edit flows, completion requires local visual validation after focused automated tests and before canonical `make validate` / merge.
