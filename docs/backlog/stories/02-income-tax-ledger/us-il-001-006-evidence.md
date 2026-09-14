# PTL-US-IL-001 + PTL-US-IL-006 — Unified Annual Income Ledger — Evidence

**Type:** Story slice  
**Capability:** TAX-04  
**Priority:** P0  
**Status:** `VISUAL_VALIDATION_PENDING`  
**Date:** 2026-09-14  
**Branch:** `feat/block-02-unified-income-ledger-ui`

## Scope

This slice materializes the first user-visible TAX-04 annual income ledger over the canonical projection delivered by IL-001..IL-004 and reconciles its placement into the single shared React application shell.

It combines:

- `PTL-US-IL-001 — Ver el ledger anual unificado de ingresos`;
- `PTL-US-IL-006 — Conservar trazabilidad, autoridad y aislamiento anual del ledger`.

## Shared React dogfood

The surrounding application now dogfoods canonical primitives from `adumun/react-components`:

- `AppShell`;
- `PrimaryNav`;
- `ContextHeader`;
- `PageHeader`;
- `SectionCard`;
- `StatusBadge`;
- `Tabs`;
- `Button`;
- `Select`;
- `RadioGroup`;
- `FormActions`.

PTL remains responsible for product information architecture, copy, annual-workspace authority, feature composition and visual theme.

Shared components are themed through their stable `data-adumun-*` hooks rather than by copying implementation source into PTL.

## Page-layer reconciliation

Annual surfaces use the canonical `PageHeader` directly.

Legacy `WorkspaceView` surfaces are now composed by `AnnualWorkspaceGate` through the shared `PageHeader`; the legacy internal header remains temporarily present in the component source but is hidden inside the explicit `.legacy-workspace-page` compatibility boundary. This prevents a second visible page-header authority while allowing incremental extraction instead of a monolithic rewrite.

`No vinculante` is now attached by the page compositor only to `dashboard / Estimación anual`; it is no longer intended as a global status for unrelated work surfaces such as `Ingresos laborales`.

## Visible behavior

`AnnualIncomeLedgerSection` renders as an explicit surface under the active annual workspace and shows:

- factual summary cards;
- exact filters by entry type and recognition state through shared `Select` controls;
- normalized rows for dependent income, domestic BHE and other existing income-source kinds;
- factual amount / withholding / PPM when registered;
- explicit `No registrado` for absent values;
- recognition state through the shared semantic status primitive;
- human-readable owner origin without exposing internal owner record IDs as normal copy;
- responsive table/card behavior for narrow viewports;
- factual-boundary copy that explicitly excludes tax liability, refund and SII reconciliation semantics.

The summary label was refined from `Bruto registrado` to `Monto bruto disponible` so absence of the canonical gross field is not visually confused with a row that can still present another factual amount such as net.

The annual navigation uses product language:

```text
Período
  Resumen del año
  Ingresos del año
  Perfil del año
```

The duplicate active-period footer formerly rendered in the sidebar was removed. The global header is the visible annual-context authority.

`Perfil del año` now uses shared `RadioGroup` plus `FormActions`/`Button` rather than locally rebuilding radio semantics and action layout.

`Ingresos laborales` no longer exposes persisted enum values such as `SALARY` as user-facing copy; the presentation boundary maps them to product language such as `Renta dependiente`.

## Authority and isolation

The ledger UI remains read-only.

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

Earlier heads produced green focused evidence, including an 11/11 run. Those results are historical only because the branch has advanced through shared `Tabs`, action/form primitives, page-layer composition and product-language reconciliation.

The current head requires fresh execution through the canonical Make façade:

```text
make bootstrap
make typecheck
make test-ledger-ui
```

A fresh canonical `make validate` remains intentionally deferred until user visual approval.

The known npm `allowScripts` warning for install scripts in `electron-winstaller` and the Git-consumed `@adumun/react-components` package remains a bootstrap-determinism observation to reconcile separately; it is not treated as visual acceptance evidence.

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
