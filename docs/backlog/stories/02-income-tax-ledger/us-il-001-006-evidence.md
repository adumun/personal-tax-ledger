# PTL-US-IL-001 + PTL-US-IL-006 — Unified Annual Income Ledger — Evidence

**Type:** Story slice  
**Capability:** TAX-04  
**Priority:** P0  
**Status:** `VISUAL_VALIDATION_PENDING`  
**Date:** 2026-09-13  
**Branch:** `feat/block-02-unified-income-ledger-ui`

## Scope

This slice materializes the first user-visible TAX-04 annual income ledger over the canonical projection delivered by IL-001..IL-004.

It combines:

- `PTL-US-IL-001 — Ver el ledger anual unificado de ingresos`;
- `PTL-US-IL-006 — Conservar trazabilidad, autoridad y aislamiento anual del ledger`.

## Visible behavior

`AnnualIncomeLedgerSection` renders under the active annual workspace and shows:

- explicit `Año comercial / AT` context;
- factual summary cards;
- exact filters by entry type and recognition state;
- normalized rows for dependent income, domestic BHE and other existing income-source kinds;
- factual amount / withholding / PPM when registered;
- explicit `No registrado` for absent values;
- recognition state;
- stable owner aggregate and owner record id;
- responsive table/card behavior for narrow viewports;
- factual-boundary copy that explicitly excludes tax liability, refund, readiness and SII reconciliation semantics.

## Authority and isolation

The UI remains read-only.

It does not create a generic ledger mutation path and does not replace aggregate-owned editors.

A request serial plus `commercialYear` verification suppresses stale responses after annual-context transitions. A response for a prior year is not allowed to replace the current visible ledger state.

## Deferred owner actions

`Ver / editar` actions are intentionally not introduced in this slice. Their real navigation/mutation flow belongs to:

- `PTL-US-IL-002` — dependent income owner flow;
- `PTL-US-IL-003` — domestic BHE owner flow.

No placeholder mutation or fake ledger editor is authorized.

## Automated evidence

`test/annual-income-ledger-frontend.test.mjs` covers:

1. factual structure and exact filters;
2. normalized supported kinds without dual-write semantics;
3. owner aggregate + owner record identity;
4. stale-response suppression on annual-context changes;
5. mounting under the active AnnualWorkspace;
6. read-only client boundary.

Existing IL-004 transport and lifecycle suites remain part of regression validation.

## Visual acceptance gate

This slice has direct UI impact and therefore follows an explicit visual gate:

```text
IMPLEMENTED
 -> targeted automated validation
 -> VISUAL_VALIDATION_PENDING
 -> user runs the branch in the development environment
 -> user reviews layout, information hierarchy, copy, filters and visible states
 -> USER_VISUAL_APPROVED
 -> canonical make validate
 -> DONE / merge
```

A green automated suite alone is **not sufficient** to mark this story slice DONE.

Until the user explicitly approves the visible result in the development environment, the PR must remain Draft and this evidence must remain `VISUAL_VALIDATION_PENDING`.

## Boundaries

This slice does not implement:

- generic ledger CRUD;
- dependent-income editing from the ledger;
- BHE editing from the ledger;
- foreign-service / FX income;
- SII reconciliation;
- evidence vault semantics;
- readiness;
- annual tax liability/refund;
- optimization advice.
