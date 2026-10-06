# PTL-TASK-AW-006 — Annual Workspace Overview Projection — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** DONE  
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

The projection intentionally contains no refund/payment estimate, tax liability amount, readiness percentage, Annual Tax Health score, SII reconciliation state or optimization recommendation.

## Empty semantics

Absence is represented structurally by zero counts and the UI renders `No registrado`. Evidence is explicitly `UNAVAILABLE / Capacidad aún no disponible`. None of these states are rendered as `$0`.

## Rule provenance

The overview reuses `PTL-TASK-AW-007` through `getSupportedYearState(commercialYear)`; it does not define a second support policy.

## Canonical validation

`make validate` executed from a complete local checkout on 2026-09-13:

- typecheck: PASS;
- tests: **169/169 PASS, 0 fail**;
- desktop check: PASS;
- architecture check: PASS.

AW-006/AW-005 coverage passed for structural projection, explicit empty semantics, annual-context reload, strict tax-outcome boundary and canonical AW-007 rule-state reuse.

## Closure

`PTL-TASK-AW-006` is **DONE**. The overview projection is ready for Block 01 regression closure once prior-year initialization is implemented.
