# PTL-TASK-IL-004 — Ledger HTTP / Client Surface — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** IN_REVIEW  
**Date:** 2026-09-13  
**Branch:** `feat/block-02-ledger-http-client-surface`

## Objective

Expose the canonical annual TAX-04 read model through a narrow HTTP/client surface without introducing a generic ledger mutation authority.

## HTTP surface

Implemented:

```text
GET /api/tax-ledger
  ?entryKind=...
  &ownerAggregate=...
  &recognitionState=...
```

The router:

- resolves the trusted active `AnnualWorkspaceContext`;
- delegates exact filters to `createAnnualTaxLedgerReadModel`;
- maps missing active annual context to HTTP 409;
- rejects any non-GET method with HTTP 405 `method_not_allowed` before touching the read model.

## Local composition

`createTaxLedgerComposition` assembles:

- `createIncomeSourceTaxLedgerProvider`;
- `createFeeReceiptTaxLedgerProvider`;
- `createAnnualTaxLedgerReadModel`;
- `createTaxLedgerRouter`.

The local composition root exposes this read surface alongside the owner aggregate capabilities; no ledger repository/table or write service is added.

## Frontend client

`tax-ledger-client.ts` exposes only:

```text
list(filters)
```

It serializes the three supported exact filters and performs only GET requests to `/api/tax-ledger`.

No create/update/delete API is introduced for ledger entries.

## Automated evidence

`test/tax-ledger-http-client.test.mjs` verifies:

1. GET delegates exact filters under trusted annual context;
2. mutation methods return 405 before querying the read model;
3. missing active annual context remains an explicit HTTP 409 conflict;
4. composition root/router/client expose the read-only surface and no frontend mutation method.

## Boundaries

IL-004 does not add UI presentation, generic ledger CRUD, storage, readiness, reconciliation, tax result or FX semantics.

## Closure gate

Canonical `make validate` is mandatory. Until green, `PTL-TASK-IL-004` remains **IN_REVIEW**.
