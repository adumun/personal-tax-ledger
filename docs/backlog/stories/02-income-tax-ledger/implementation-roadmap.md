# Block 02 — Income & Tax Ledger — Implementation Roadmap

**Status:** `GO / DOMESTIC+FACTUAL SLICES CLOSED / SPIKE-IL-002 DONE / TASK-IL-005 VALIDATION_PENDING`  
**Date:** 2026-09-14

## Baseline inherited from Block 01

- first-class `AnnualTaxWorkspace`;
- trusted annual context on mutable operations;
- stale/cross-year write protection;
- explicit workspace creation/selection;
- applicability profile and conflict semantics;
- structural annual overview;
- allowlisted prior-year initialization.

Block 02 consumes these contracts rather than reintroducing a second year authority.

## Closed decisions and contracts

- `PTL-SPIKE-IL-001` — DONE: ledger is projection-only over aggregate-owned facts.
- `PTL-TASK-IL-001` — DONE: `TaxLedgerEntry` + read-only provider port.
- `PTL-TASK-IL-002` — DONE: aggregate projection providers.
- `PTL-TASK-IL-003` — DONE: deterministic annual ledger read model.
- `PTL-TASK-IL-004` — DONE: canonical read-only HTTP/client surface.
- `PTL-US-IL-001` — DONE: unified annual ledger.
- `PTL-US-IL-002` — DONE: dependent-income owner flow.
- `PTL-US-IL-003` — DONE: domestic BHE owner flow.
- `PTL-US-IL-005` — DONE: factual annual income position.
- `PTL-US-IL-006` — DONE: authority/traceability/year isolation.
- `PTL-SPIKE-IL-002` — DONE: foreign payer/source-jurisdiction split, perception recognition and frozen FX provenance accepted.

## Current implementation node — PTL-TASK-IL-005

Implemented foundation:

```text
foreign_service_income
  + foreign_service_fx_conversions
  + annual-context use cases
  + exact-date BCCh provider contract
  + manual provenance fallback
  + FOREIGN_SERVICE_INCOME ledger provider
```

Current state: `IMPLEMENTED / AUTOMATED_VALIDATION_PENDING`.

The implementation preserves the accepted split:

```text
foreign payer
  -> source jurisdiction
     -> CHILE
        -> fee_receipts/BHE remains canonical
        -> foreign settlement cannot enter foreign_service_income
     -> FOREIGN
        -> foreign_service_income
        -> perception date controls year
        -> original value preserved
        -> frozen CLP conversion snapshot
```

Evidence: [`task-il-005-evidence.md`](task-il-005-evidence.md).

## Remaining IL-C sequence

1. validate and close `PTL-TASK-IL-005`;
2. implement `PTL-US-IL-004` product flow:
   - explicit source-jurisdiction classification;
   - Path A BHE/settlement flow;
   - Path B foreign-source owner flow;
   - owner-aware round-trip from annual ledger;
3. user visual validation for the new flow;
4. canonical validation;
5. run terminal `PTL-TASK-IL-006` regression/DoD gate.

## Terminal gate

`PTL-TASK-IL-006` closes Block 02 regression/DoD after IL-C is closed.

It must prove:

- projection-only ledger semantics;
- stable owner identity;
- annual isolation/stale protection;
- non-duplicated salary/APV semantics;
- preserved BHE recognition semantics;
- traceable factual totals;
- foreign payer/source-jurisdiction separation;
- no BHE + FX-payment double counting;
- foreign-source perception recognition;
- frozen conversion provenance;
- unresolved FX cannot silently become recognized CLP income.

## Hard boundaries

Block 02 does not own evidence vault, SII reconciliation, readiness, annual tax liability/refund, optimization/provisioning advice, article 41 A credit calculation, or automatic legal determination of source jurisdiction.

## Current executable path

```text
PTL-TASK-IL-005 validation + closure
  -> PTL-US-IL-004
  -> PTL-TASK-IL-006
  -> Block 02 CLOSED
```
