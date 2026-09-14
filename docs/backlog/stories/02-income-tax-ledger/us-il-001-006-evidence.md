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

## Shared React dogfood

The surrounding application consumes canonical primitives from `adumun/react-components`:

- `AppShell`;
- `PrimaryNav`;
- `ContextHeader`;
- `PageHeader`;
- `SectionCard`;
- `StatusBadge`.

PTL remains responsible for product information architecture, copy, annual-workspace authority, feature composition and visual theme.

`Tabs` has been cross-repo reconciled and implemented in `adumun/react-components`, but this evidence does **not** claim its PTL dogfood complete while `WorkspaceView` still contains local `sub-tabs`.

## Visible behavior

`AnnualIncomeLedgerSection` renders as an explicit surface under the active annual workspace and shows:

- factual summary cards;
- exact filters by entry type and recognition state;
- normalized rows for dependent income, domestic BHE and other existing income-source kinds;
- factual amount / withholding / PPM when registered;
- explicit `No registrado` for absent values;
- recognition state through the shared semantic status primitive;
- human-readable owner origin without exposing internal owner record IDs as normal copy;
- responsive table/card behavior for narrow viewports;
- factual-boundary copy that explicitly excludes tax liability, refund and SII reconciliation semantics.

The annual navigation now uses product language:

```text
Período
  Resumen del año
  Ingresos del año
  Perfil del año
```

The duplicate active-period footer formerly rendered in the sidebar was removed. The global header is now the visible annual-context authority.

## Authority and isolation

The UI remains read-only.

It does not create a generic ledger mutation path and does not replace aggregate-owned editors.

A request serial plus `commercialYear` verification suppresses stale responses after annual-context transitions. A response for a prior year is not allowed to replace the current visible ledger state.

The active `AnnualWorkspace` remains the only annual-context authority. The former secondary year selector owned by `WorkspaceView` was removed.

Owner aggregate and owner record identity remain part of the ledger contract even though the raw record identifier is no longer rendered as normal user-facing copy.

## Deferred owner actions

`Ver / editar` actions are intentionally not introduced in this slice. Their real navigation/mutation flow belongs to:

- `PTL-US-IL-002` — dependent income owner flow;
- `PTL-US-IL-003` — domestic BHE owner flow.

No placeholder mutation or fake ledger editor is authorized.

## Automated evidence

An earlier head of this branch was executed through the canonical Make façade on 2026-09-13:

```text
make bootstrap
make typecheck
make test-ledger-ui
```

Observed result for that earlier head:

```text
tests 11
pass 11
fail 0
cancelled 0
skipped 0
todo 0
```

`make typecheck` completed without TypeScript errors.

### Current-head status

The branch advanced after the above green evidence to introduce shared `SectionCard` / `StatusBadge`, product-language navigation changes, ledger origin presentation changes and new focused assertions.

Therefore the 11/11 run is retained as historical evidence only. A **fresh** Make-wrapped focused run is required before claiming the current head technically green.

`make bootstrap` also emitted an npm `allowScripts` warning for install scripts in `electron-winstaller` and the Git-consumed `@adumun/react-components` package. It did not block the earlier bootstrap, typecheck or focused tests. This is a bootstrap determinism observation to reconcile separately; it is not treated as visual acceptance evidence.

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
- annual tax liability/refund;
- optimization advice.
