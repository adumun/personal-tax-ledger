# PTL-TASK-IL-003 — Annual Ledger Query / Read Model — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-02-annual-ledger-read-model`

## Objective

Compose the read-only aggregate projection providers into one deterministic annual TAX-04 ledger without introducing persistence, mutation authority, readiness, reconciliation or tax calculation semantics.

## Read model

Added `createAnnualTaxLedgerReadModel({ providers })` in Application.

The read model:

- requires one or more valid `TaxLedgerProvider` implementations;
- requires trusted `AnnualWorkspaceContext` on every query;
- invokes all providers for the same annual context;
- rejects provider entries whose `annualWorkspaceId` or `commercialYear` escape the requested context;
- rejects duplicate `ledgerEntryId` values instead of collapsing facts;
- returns an immutable annual projection.

## Deterministic ordering

Entries are ordered by:

1. `occurredOn` descending when available;
2. entries with a factual date before entries without one;
3. `ledgerEntryId` ascending as deterministic tiebreaker.

No provider insertion order becomes user-visible business semantics.

## Filters

Exact optional filters:

- `entryKind`;
- `ownerAggregate`;
- `recognitionState`.

Unsupported enum values are rejected rather than silently ignored.

## Factual summary

The read model exposes:

- total filtered `entryCount`;
- counts for `RECOGNIZED`, `PENDING`, `EXCLUDED`;
- `totalsByCurrency` for `gross`, `withholding`, `ppm`, `net`.

Only `RECOGNIZED` entries contribute monetary totals.

Each amount total preserves absence explicitly through `amount`, `presentCount` and `missingCount`; a `null` amount never becomes factual zero.

## Boundaries

IL-003 does not introduce generic ledger persistence or mutation, SII reconciliation, readiness, tax liability/refund, salary/APV recalculation, BHE recomputation or FX semantics.

## Automated evidence

`test/annual-tax-ledger-read-model.test.mjs` verifies:

1. deterministic composition and annual identity;
2. exact filters without provider mutation;
3. recognized-only totals with explicit missing-value accounting;
4. duplicate ledger IDs are rejected;
5. cross-workspace/year provider leakage is rejected.

## Canonical validation

Fresh `make validate` on `feat/block-02-annual-ledger-read-model`:

- typecheck: PASS;
- tests: **200/200 PASS, 0 fail**;
- all five IL-003 read-model tests: PASS;
- desktop check: PASS;
- architecture check: PASS.

`PTL-TASK-IL-003` is **DONE**. The next P0 node is `PTL-TASK-IL-004 — Ledger HTTP/client surface`.
