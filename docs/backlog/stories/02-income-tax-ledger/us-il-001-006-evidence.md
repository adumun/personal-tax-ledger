# PTL-US-IL-001 + PTL-US-IL-006 — Unified Annual Income Ledger — Evidence

**Type:** Story slice  
**Capability:** TAX-04  
**Priority:** P0  
**Status:** `VISUAL_VALIDATION_PENDING`  
**Date:** 2026-09-13  
**Branch:** `feat/block-02-unified-income-ledger-ui`

## Scope

This slice materializes the first user-visible TAX-04 annual income ledger over the canonical projection delivered by IL-001..IL-004 and reconciles its placement into the single shared React application shell.

It combines:

- `PTL-US-IL-001 — Ver el ledger anual unificado de ingresos`;
- `PTL-US-IL-006 — Conservar trazabilidad, autoridad y aislamiento anual del ledger`.

## Visible behavior

`AnnualIncomeLedgerSection` renders as an explicit surface under the active annual workspace and shows:

- factual summary cards;
- exact filters by entry type and recognition state;
- normalized rows for dependent income, domestic BHE and other existing income-source kinds;
- factual amount / withholding / PPM when registered;
- explicit `No registrado` for absent values;
- recognition state;
- stable owner aggregate and owner record id;
- responsive table/card behavior for narrow viewports;
- factual-boundary copy that explicitly excludes tax liability, refund and SII reconciliation semantics.

The surrounding application now consumes shared ADÜMÜN React primitives from `adumun/react-components`:

- `AppShell`;
- `PrimaryNav`;
- `ContextHeader`;
- `PageHeader`.

PTL retains product-specific information architecture, copy, annual-workspace authority and theming.

## Authority and isolation

The UI remains read-only.

It does not create a generic ledger mutation path and does not replace aggregate-owned editors.

A request serial plus `commercialYear` verification suppresses stale responses after annual-context transitions. A response for a prior year is not allowed to replace the current visible ledger state.

The active `AnnualWorkspace` remains the only annual-context authority. The former secondary year selector owned by `WorkspaceView` was removed.

## Deferred owner actions

`Ver / editar` actions are intentionally not introduced in this slice. Their real navigation/mutation flow belongs to:

- `PTL-US-IL-002` — dependent income owner flow;
- `PTL-US-IL-003` — domestic BHE owner flow.

No placeholder mutation or fake ledger editor is authorized.

## Automated evidence

The focused validation was executed through the canonical Make façade on 2026-09-13:

```text
make bootstrap
make typecheck
make test-ledger-ui
```

Observed result:

```text
tests 11
pass 11
fail 0
cancelled 0
skipped 0
todo 0
```

`make typecheck` completed without TypeScript errors.

The focused suite covers:

1. factual ledger structure and exact filters;
2. normalized supported kinds without dual-write semantics;
3. owner aggregate + owner record identity;
4. stale-response suppression on annual-context changes;
5. ledger placement as a surface of the single shared `AppShell`;
6. removal of the competing `WorkspaceView` sidebar and annual selector;
7. consumption of shared `PageHeader` by annual surfaces;
8. read-only client boundary;
9. IL-004 HTTP filter delegation and mutation rejection;
10. explicit conflict behavior for invalid annual context;
11. local composition/client exposure of the canonical read surface only.

`make bootstrap` also emitted an npm `allowScripts` warning for install scripts in `electron-winstaller` and the Git-consumed `@adumun/react-components` package. It did not block bootstrap, typecheck or focused tests. This is a bootstrap determinism observation to reconcile separately; it is not treated as visual acceptance evidence.

## Visual acceptance gate

This slice has direct UI impact and therefore follows an explicit visual gate:

```text
IMPLEMENTED
 -> targeted automated validation [GREEN]
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
