# Block 02 — Income & Tax Ledger — Implementation Roadmap

**Status:** `GO / DOMESTIC+FACTUAL SLICES CLOSED / SPIKE-IL-002 DECISION_PROPOSED`  
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

## Current discovery node

### PTL-SPIKE-IL-002 — Foreign-service recognition and FX provenance

Current proposal closes the previously ambiguous model:

```text
foreign payer
  -> source jurisdiction
     -> CHILE
        -> fee_receipts/BHE canonical
        -> FX settlement is linked provenance only
     -> FOREIGN
        -> foreign_service_income canonical
        -> perception date controls year
        -> original value preserved
        -> BCCh-backed frozen CLP conversion snapshot
```

No implementation starts until this decision is accepted because otherwise `PTL-TASK-IL-005` would risk encoding a false equivalence between payer location and income source.

Decision evidence: [`spike-il-002-foreign-service-recognition-fx.md`](spike-il-002-foreign-service-recognition-fx.md).

## Next implementation slice — IL-C

After spike acceptance:

1. `PTL-TASK-IL-005 — Foreign-service provider/value contract implementation`;
2. introduce `foreign_service_income` owner aggregate for genuine foreign-source honoraria;
3. introduce append-only FX conversion provenance;
4. add BCCh conversion-provider contract;
5. add `FOREIGN_SERVICE_INCOME` ledger entry kind/provider;
6. add BHE-linked foreign-currency settlement metadata without a second ledger row;
7. implement `PTL-US-IL-004` UI flow and owner round-trip;
8. visual + canonical validation.

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
PTL-SPIKE-IL-002 acceptance
  -> PTL-TASK-IL-005
  -> PTL-US-IL-004
  -> PTL-TASK-IL-006
  -> Block 02 CLOSED
```
