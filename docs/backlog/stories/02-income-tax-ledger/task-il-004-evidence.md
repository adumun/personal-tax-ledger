# PTL-TASK-IL-004 — Ledger HTTP / Client Surface — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** DONE  
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
- delegates exact filters through the canonical `readModel.listAnnualLedger(context, filters)` contract;
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

Its result contract preserves the canonical IL-003 response shape, including `factualSummary`.

No create/update/delete API is introduced for ledger entries.

## Diagnostic correction before closure

The first canonical validation attempt exposed two implementation/testing defects before merge:

1. the HTTP composition expected an invented `readModel.query(...)` method even though IL-003 canonically exposes `readModel.listAnnualLedger(...)`;
2. HTTP/lifecycle test harnesses could wait indefinitely if the spawned local process exited before the `exit` listener was registered.

Corrections applied in the same PR:

- HTTP now calls only `listAnnualLedger(context, filters)`;
- frontend types use canonical `factualSummary`;
- IL-004 tests explicitly reject reintroduction of `.query`;
- HTTP/lifecycle harnesses capture child stdout/stderr, detect early process termination, and cannot hang waiting for an already-emitted `exit` event.

Focused regression after the fix:

```text
node --test \
  test/http-contract.test.mjs \
  test/local-lifecycle.test.mjs \
  test/tax-ledger-http-client.test.mjs

7 tests / 7 pass / 0 fail / 0 cancelled
```

## Automated evidence

`test/tax-ledger-http-client.test.mjs` verifies:

1. GET delegates exact filters under trusted annual context through `listAnnualLedger`;
2. mutation methods return 405 before querying the read model;
3. missing active annual context remains an explicit HTTP 409 conflict;
4. composition root/router/client expose only the canonical read surface and no frontend mutation method.

Related lifecycle regression coverage:

- `test/http-contract.test.mjs` fails fast with child-process diagnostics;
- `test/local-lifecycle.test.mjs` fails fast and cleans up even when bootstrap exits early.

## Canonical closure evidence

Fresh `make validate` after all corrections:

```text
204 tests / 204 pass / 0 fail / 0 cancelled / 0 skipped / 0 todo
```

Additional gates:

- `typecheck` — PASS;
- `desktop:check` — PASS;
- `architecture:check` — PASS;
- architecture invariants: 10 internal packages, no cycles, server/web legacy roots absent, core/contracts isolated, application without sqlite-adapter access.

The full gate also includes the four IL-004 tests and real local-server lifecycle coverage.

## Boundaries

IL-004 does not add UI presentation, generic ledger CRUD, storage, readiness, reconciliation, tax result or FX semantics.

## Closure

`PTL-TASK-IL-004` is **DONE**. The next P0 slice is `PTL-US-IL-001 — Unified annual income ledger` plus `PTL-US-IL-006 — Traceability/authority/year isolation`.
