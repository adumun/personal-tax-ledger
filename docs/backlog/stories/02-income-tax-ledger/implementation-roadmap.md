# Block 02 — Income & Tax Ledger — Implementation Roadmap

**Status:** `GO / FIRST ENABLER READY`  
**Date:** 2026-09-13

## Baseline inherited from Block 01

- first-class `AnnualTaxWorkspace`;
- trusted annual context on mutable operations;
- stale/cross-year write protection;
- explicit workspace creation/selection;
- applicability profile and conflict semantics;
- structural annual overview;
- allowlisted prior-year initialization.

Block 02 must consume these contracts rather than reintroduce a second year authority.

## Existing functional baseline

PTL already supports aggregate-specific behavior for:

- salary/income sources;
- BHE/honorarios;
- salary/APV calculations;
- fee gross/net/retention/PPM behavior;
- annual scoping in persistence/application.

The implementation gap is unified TAX-04 ledger semantics and a stable projection/read model.

## Closed decision

`PTL-SPIKE-IL-001` is DONE: the ledger is projection-only over aggregate-owned facts.

This means Block 02 starts with contracts/read models, not with a schema migration that duplicates `income_sources` and `fee_receipts`.

## Immediate implementation slice

### Slice IL-A — Domestic annual ledger foundation

1. `PTL-TASK-IL-001 — TaxLedgerEntry projection contract`
2. `PTL-TASK-IL-002 — Aggregate projection providers`
3. `PTL-TASK-IL-003 — Annual ledger query/read model`
4. `PTL-TASK-IL-004 — Ledger HTTP/client surface`
5. `PTL-US-IL-001 — Unified annual income ledger`
6. `PTL-US-IL-006 — Traceability/authority/year isolation`

This slice is P0 and does not wait for foreign-currency work.

### Slice IL-B — Existing owner flows inside ledger shell

- `PTL-US-IL-002 — Dependent income`
- `PTL-US-IL-003 — Domestic BHE`

Goal: integrate navigation/refresh/traceability while preserving existing owner forms and calculations.

### Slice IL-C — Foreign service / contractor

First close `PTL-SPIKE-IL-002`; then implement `PTL-TASK-IL-005 + PTL-US-IL-004`.

No FX rate source/provider or recognition convention is implied before the spike closes.

### Slice IL-D — Factual annual position

`PTL-US-IL-005` adds traceable factual totals after the unified ledger read model is stable.

### Terminal gate

`PTL-TASK-IL-006` closes Block 02 regression/DoD.

## Hard boundaries

Block 02 does not own:

- evidence vault/acquisition documents;
- SII reconciliation;
- tax readiness;
- annual tax liability/refund;
- optimization/provisioning advice;
- year closure.

It produces canonical factual projections that those later capabilities consume.

## Current executable node

```text
PTL-TASK-IL-001 — TaxLedgerEntry projection contract
```

No unresolved P0 product decision blocks this task.
