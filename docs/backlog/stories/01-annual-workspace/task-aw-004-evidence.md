# PTL-TASK-AW-004 — Allowlisted Prior-Year Initialization Service — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P1  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-prior-year-initialization`

## Objective

Provide an explicit allowlisted service for reusing prior-year configuration/proposals without copying historical tax facts into the new year.

## Allowlist

Block 01 currently supports exactly one reusable category:

```text
APPLICABILITY_PROFILE
```

It is copied as a revisable proposal into the target AnnualTaxWorkspace. The allowlist is explicit and must grow only through a versioned product/domain decision.

The service does not infer reusable content from table presence and has no income/BHE/mortgage repository dependency.

## Explicit forbidden copy

The service declares and enforces that initialization does not copy:

- realized amounts;
- fee receipts/BHE;
- withholdings or PPM;
- ledger movements;
- documentary evidence;
- SII/reconciliation state;
- readiness/closure state;
- calculated results or historical projections.

## Provenance

Provenance is not embedded into `TaxApplicabilityProfile v1`. It belongs to the initialization operation and is persisted separately as:

```text
annual_workspace_initializations
  target_workspace_id PK
  source_workspace_id
  source_commercial_year
  target_commercial_year
  categories_json
  initialized_at
```

This preserves the profile schema as a tax declaration while retaining auditable `copied_from_year` semantics.

## Atomic user semantics

The initialization orchestration:

1. validates source/target and selected allowlisted categories;
2. creates and activates the target AnnualTaxWorkspace through the existing AW-002 flow;
3. copies only selected reusable proposals;
4. persists provenance;
5. on failure after target creation, removes the target workspace and restores the previously active year.

Deleting the target workspace cascades the copied profile/provenance, preventing partial visible success.

## Idempotency

If the same target already has provenance for the same source year and category set, the service returns the existing initialization with `alreadyInitialized = true` instead of duplicating copied data.

A pre-existing target with different/no provenance remains an explicit conflict.

## Automated evidence

- `test/prior-year-initialization.test.mjs`
  - exact allowlist preview;
  - explicit forbidden-copy catalog;
  - profile proposal copy into target identity/year;
  - persisted provenance;
  - unsupported category rejection before creation;
  - idempotent repeat;
  - rollback and active-year restoration after partial failure.
- `test/prior-year-initialization-frontend.test.mjs`
  - explicit preview flow;
  - mandatory `No se copiarán` communication;
  - explicit annual endpoint;
  - no transactional repository inference in the service.

## Canonical validation

`make validate` rerun after reconciling the obsolete AW-002 frontend assertion: **PASS**.

The first run exercised 179 tests with only the stale AW-002 assertion failing; the assertion was updated to reflect that AW-003 now intentionally enables prior-year initialization, and the rerun completed green with typecheck, tests, desktop and architecture gates passing.

## Closure verdict

`PTL-TASK-AW-004` is **DONE**. Its output makes prior-year initialization coverage available to the terminal `PTL-TASK-AW-008` Block 01 regression gate.
