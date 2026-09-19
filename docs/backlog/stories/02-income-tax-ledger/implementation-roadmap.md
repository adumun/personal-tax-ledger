# Block 02 — Income & Tax Ledger — Implementation Roadmap

**Status:** `GO / DOMESTIC+FACTUAL SLICES CLOSED / SPIKE-IL-002 DONE / TASK-IL-005 DONE / US-IL-004 IMPLEMENTED / VISUAL_VALIDATION_BLOCKED`  
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
- `PTL-TASK-IL-005` — DONE: foreign-service aggregate, append-only FX provenance, exact-date BCCh contract and ledger provider implemented; canonical `make validate` PASS.

## Current implementation node — PTL-US-IL-004

The implementation slice is technically assembled and statically reconciled across contracts, application, SQLite, HTTP, frontend owner flow, tests and evidence.

The first pre-visual local execution produced:

```text
make bootstrap   PASS
make typecheck   PASS
make test        236 PASS / 1 FAIL / 237 total
```

The single failure was not a production defect. An older `US-IL-006` frontend test asserted that `AnnualIncomeLedgerSection.tsx` must not reference `entry.ownerRecordId` at all. The current owner-aware contract requires that stable owner identity to reopen the exact canonical `FOREIGN_SERVICE_INCOME` record from the ledger. Removing it would break `PTL-US-IL-004`.

The test has been corrected so that it now verifies the intended boundary: owner identity may be consumed internally for routing but must not be rendered as visible ledger data. The production implementation was not degraded to satisfy the stale assertion.

The focused Playwright browser gate has also been executed successfully on 2026-09-19: Path A PASS, Path B PASS, `2 passed (5.6s)`. Harness-only corrections were required during bring-up; no production behavior was changed to obtain the green E2E result.

```text
Servicio con pagador extranjero
  -> explicit payer country
  -> explicit material service location
     -> CHILE
        -> fee_receipts/BHE remains canonical
        -> fee_receipt_foreign_settlements provenance
        -> save/cancel returns through the annual-ledger owner flow
        -> no second TaxLedgerEntry
     -> FOREIGN
        -> foreign_service_income
        -> perception date controls year
        -> original value preserved
        -> exact-date official FX attempt
        -> documented manual FX fallback when required
        -> append-only conversion history
        -> owner-aware create/edit round trip
        -> FOREIGN_SERVICE_INCOME ledger projection
```

Additional correction semantics distinguish an FX-driving economic-fact edit from metadata-only edits: perception date, original amount or original currency invalidate the current conversion pointer; payer metadata, notes and factual foreign-tax metadata do not invalidate an otherwise valid conversion.

The ledger owner-flow contract includes `FOREIGN_SERVICE_INCOME`; the foreign editor does not operate as an unrelated local mutation path. Product UI labels hide raw technical conversion-state/source enums.

Evidence: [`il-004-foreign-service-flow-evidence.md`](il-004-foreign-service-flow-evidence.md).

## Remaining IL-C sequence

1. rerun automated gates on the FX-feedback correction;
2. visually re-validate Path A + Path B, especially official/manual FX actions;
3. after explicit user visual approval, run canonical `make validate`;
5. close `PTL-US-IL-004` as DONE and finalize evidence;
6. mark the Draft PR ready and merge exact-head;
7. run terminal `PTL-TASK-IL-006` regression/DoD gate;
8. close Block 02 if the terminal gate passes.

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

Block 02 does not own evidence vault, SII reconciliation, readiness, annual tax liability/refund, optimization/provisioning advice, article 41 A credit calculation, automatic legal determination of source jurisdiction, or accounting treatment of FX gains/losses.

## Current executable path

```text
PTL-US-IL-004 automated gates PASS
  -> VISUAL_VALIDATION_PENDING
  -> make up / visual validation
  -> canonical make validate
  -> DONE / PR ready / exact-head merge
  -> PTL-TASK-IL-006
  -> Block 02 CLOSED
```
