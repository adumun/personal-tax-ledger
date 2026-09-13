# Block 02 — Income & Tax Ledger — Implementation Roadmap

**Status:** `GO / IL-003 CLOSED / IL-004 READY`  
**Date:** 2026-09-13

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
- `PTL-TASK-IL-001` — DONE: `TaxLedgerEntry` + read-only provider port; canonical gate **190/190**.
- `PTL-TASK-IL-002` — DONE: aggregate projection providers; canonical gate **195/195**.
- `PTL-TASK-IL-003` — DONE: deterministic annual ledger read model with exact filters, annual-context enforcement and traceable factual totals; canonical gate **200/200**, desktop/architecture PASS.

## Immediate implementation slice

### Slice IL-A — Domestic annual ledger foundation

1. `PTL-TASK-IL-001 — TaxLedgerEntry projection contract` — **DONE**;
2. `PTL-TASK-IL-002 — Aggregate projection providers` — **DONE**;
3. `PTL-TASK-IL-003 — Annual ledger query/read model` — **DONE**;
4. `PTL-TASK-IL-004 — Ledger HTTP/client surface` — **READY**;
5. `PTL-US-IL-001 — Unified annual income ledger`;
6. `PTL-US-IL-006 — Traceability/authority/year isolation`.

This slice remains P0 and does not wait for foreign-currency work.

### Slice IL-B — Existing owner flows inside ledger shell

- `PTL-US-IL-002 — Dependent income`
- `PTL-US-IL-003 — Domestic BHE`

### Slice IL-C — Foreign service / contractor

Close `PTL-SPIKE-IL-002`; then implement `PTL-TASK-IL-005 + PTL-US-IL-004`. No FX rate source/provider or recognition convention is implied before the spike closes.

### Slice IL-D — Factual annual position

`PTL-US-IL-005` consumes the stable read model. IL-003 already establishes traceable factual totals without tax-result semantics.

### Terminal gate

`PTL-TASK-IL-006` closes Block 02 regression/DoD.

## Hard boundaries

Block 02 does not own evidence vault, SII reconciliation, readiness, annual tax liability/refund, optimization/provisioning advice or year closure.

## Current executable node

```text
PTL-TASK-IL-004 — Ledger HTTP/client surface
```

No unresolved P0 product decision blocks this task.
