# PTL-TASK-AW-006 — Annual Workspace Overview Projection — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** IN_REVIEW  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-annual-workspace-overview`

## Objective

Provide a structural read model for the active `AnnualTaxWorkspace` without crossing into tax outcome, readiness, SII reconciliation or optimization.

## Projection contract

`createAnnualWorkspaceOverviewUseCases(...)` returns four structural groups:

- `period`: commercial year, derived Operación Renta label, lifecycle and last structural update;
- `profile`: answered/pending/needs-review counts from the applicability profile;
- `information`: presence/counts for salary sources, BHE and mortgages plus explicit evidence capability availability;
- `rules`: exact-year supported-rule state from AW-007.

The projection consumes trusted `AnnualWorkspaceContext` and existing owning capabilities. It does not persist or mutate tax facts.

## Hard exclusions

The projection intentionally contains no:

- refund/payment estimate;
- tax liability amount;
- readiness percentage;
- Annual Tax Health score;
- SII reconciliation state;
- optimization recommendation.

## Empty semantics

Absence is represented structurally by zero counts and the UI renders `No registrado`. Evidence is explicitly `UNAVAILABLE / Capacidad aún no disponible`. None of these states are rendered as `$0`.

## Rule provenance

The overview reuses `PTL-TASK-AW-007` through `getSupportedYearState(commercialYear)`; it does not define a second support policy.

## Automated evidence

- `test/annual-workspace-overview.test.mjs`
  - period/profile/info/rules projection;
  - structural-vs-tax-outcome boundary;
  - latest structural update timestamp;
  - empty-state semantics.
- `test/annual-workspace-overview-frontend.test.mjs`
  - visible `Año tributario` context surface;
  - explicit structural copy;
  - no `$0` fake economic fact;
  - reload on `commercialYear` change;
  - explicit `/api/annual-workspace/overview` endpoint.

## Closure gate

Canonical `make validate` remains mandatory. Until it passes, `PTL-TASK-AW-006` remains **IN_REVIEW**.
