# PTL-US-AW-005 — Annual Workspace Overview — Evidence

**Type:** Story  
**Capability:** TAX-01  
**Priority:** P0  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-annual-workspace-overview`

## User outcome implemented

The active annual context now exposes an `Año tributario` overview that summarizes the structural state of the selected period without presenting a tax result.

## Acceptance evidence

- **AC-01:** the surface explicitly says it is structural context and directs tax outcome to `Resumen anual`.
- **AC-02:** missing domain data renders as `No registrado`; unavailable evidence renders as `Capacidad aún no disponible`, never as zero tax/economic outcome.
- **AC-03:** applicability completeness displays answered, pending and `NEEDS_REVIEW` counts.
- **AC-04:** evidence is shown as unavailable rather than exposing a fake executable action.
- **AC-05:** exact-year rules are read-only structural status from AW-007.
- **AC-06:** the overview reloads whenever active `commercialYear` changes.

## Visible groups

### Período
- Año comercial;
- Operación Renta derived label;
- lifecycle (`En preparación` in Block 01);
- last structural update timestamp.

### Perfil del año
- responded count;
- pending count;
- needs-review count.

### Información disponible
- dependent/salary source count;
- BHE count;
- mortgage count;
- evidence capability availability.

### Reglas del período
- `SUPPORTED`, `SUPPORTED_WITH_WARNINGS` or `UNSUPPORTED` from the canonical AW-007 policy.

## Hard boundary

The screen does not expose refund/payment estimates, readiness percentage, Annual Tax Health, SII reconciliation or optimization recommendations.

## Canonical validation

`make validate` executed from a complete local checkout on 2026-09-13:

- typecheck: PASS;
- tests: **169/169 PASS, 0 fail**;
- desktop check: PASS;
- architecture check: PASS.

The AW-005-specific frontend/application tests passed for structural copy, empty-state semantics, annual reload and absence of fake economic `$0` values.

## Closure

`PTL-US-AW-005` is **DONE**. The remaining functional Block 01 slice is prior-year initialization (`PTL-TASK-AW-004 + PTL-US-AW-003`).
