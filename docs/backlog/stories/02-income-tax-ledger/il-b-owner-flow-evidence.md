# Slice IL-B — Existing owner flows inside ledger shell — Evidence

**Stories:** `PTL-US-IL-002`, `PTL-US-IL-003`  
**Status:** `IMPLEMENTED_PARTIAL / OWNER_TARGETING_PENDING`  
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

## Implemented in current head

- ledger page exposes `+ Renta / ingreso` and `+ BHE` owner-entry actions;
- each ledger row exposes `Ver / editar`;
- annual compositor routes `INCOME_SOURCE` entries to `Ingresos laborales`;
- annual compositor routes `FEE_RECEIPT` entries to `Boletas de honorarios`;
- unsupported owner aggregates fail explicitly instead of inventing a generic editor;
- `AnnualIncomeLedgerSection` contains no owner mutation service and introduces no POST/PUT/PATCH/DELETE surface;
- source-level regression test covers the owner-routing boundary.

## Still required before IL-B can be DONE

- carry `ownerRecordId` as an explicit navigation intent;
- open the exact existing income-source editor for `INCOME_SOURCE` rows;
- open the exact existing BHE editor for `FEE_RECEIPT` rows;
- creation actions must open the corresponding create form, not only the owner surface;
- save/cancel from a ledger-originated owner flow must return to `Ingresos del año`;
- ledger must reload from the canonical projection after successful owner save;
- visual validation of the complete round-trip.

## Invariants

- `income_sources` remains the mutation authority for dependent/other income-source facts;
- `fee_receipts` remains the mutation authority for domestic BHE;
- ledger entries remain read-only projections;
- owner identity is used only to route to the correct editor;
- annual context remains the active `AnnualTaxWorkspace`;
- no generic ledger update endpoint or dual-write is introduced;
- save/cancel from an owner flow returns to the ledger when the flow originated there;
- stale/cross-year protections from Block 01 remain authoritative.

## Automated gate

Current focused contract:

```text
test/ledger-owner-flow-frontend.test.mjs
```

Run through the canonical Make façade using `make test` until a dedicated recurring target is justified.

## Visual gate

Because this slice changes navigation and owner-edit flows, completion requires local visual validation after focused automated tests and before canonical `make validate` / merge.
