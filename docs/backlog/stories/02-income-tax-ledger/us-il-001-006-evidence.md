# PTL-US-IL-001 + PTL-US-IL-006 — Unified Annual Income Ledger — Evidence

**Type:** Story slice  
**Capability:** TAX-04  
**Priority:** P0  
**Status:** `USER_VISUAL_APPROVED / CANONICAL_VALIDATION_PENDING`  
**Date:** 2026-09-14  
**Original branch:** `feat/block-02-unified-income-ledger-ui`  
**Post-merge closure branch:** `fix/block-02-post-merge-runtime-reconciliation`

## Scope

This slice materializes the first user-visible TAX-04 annual income ledger over the canonical projection delivered by IL-001..IL-004 and reconciles its placement into the single shared React application shell.

It combines:

- `PTL-US-IL-001 — Ver el ledger anual unificado de ingresos`;
- `PTL-US-IL-006 — Conservar trazabilidad, autoridad y aislamiento anual del ledger`.

## Shared React dogfood

The application dogfoods canonical primitives from `adumun/react-components`:

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

Shared components are themed through stable `data-adumun-*` hooks rather than by copying implementation source into PTL.

The canonical shared-component baseline was merged in `adumun/react-components` PR #1. PTL consumes the exact merged commit `e9dff2fba8fcf3ec7d352a7c40d5d4d749bc999e` for deterministic dogfood provenance.

## Page-layer reconciliation

Annual surfaces use the canonical `PageHeader` directly.

Legacy `WorkspaceView` surfaces are composed by `AnnualWorkspaceGate` through the shared `PageHeader`; the legacy internal header remains temporarily present in component source behind the explicit `.legacy-workspace-page` compatibility boundary. This prevents a second visible page-header authority while allowing incremental extraction instead of a monolithic rewrite.

`No vinculante` is attached only to `dashboard / Estimación anual`; it is not presented as a global status for unrelated work surfaces such as `Ingresos laborales`.

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

`Perfil del año` uses shared `RadioGroup` plus `FormActions` / `Button` rather than locally rebuilding radio semantics and action layout.

`Ingresos laborales` must not expose persisted enum values such as `SALARY` as user-facing copy; the effective exported `@personal-tax-ledger/shared-ui` runtime maps them to product language such as `Renta dependiente`.

## Shared-ui runtime determinism

Visual review exposed an important packaging defect: `packages/shared-ui/src/index.tsx` already mapped `SALARY -> Renta dependiente`, but the package exports `packages/shared-ui/dist/index.js`, whose versioned build artifact was stale and still rendered `source.kind` directly.

The post-merge closure patch keeps the effective runtime aligned by:

- synchronizing the compiled `dist` artifact with the source presentation mapping;
- adding `make prepare-shared-ui` as the canonical rebuild façade;
- rebuilding shared-ui through `make bootstrap`, `make up` and `make build-web` before the runtime/build consumes it;
- testing the effective exported runtime artifact, not only the TSX source;
- rejecting future reintroduction of raw `source.kind` rendering in the exported runtime.

This closes the discrepancy between source-level intent and the actual artifact consumed by Vite / `WorkspaceView`.

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

Earlier heads produced green focused evidence, including an 11/11 run.

On 2026-09-14 an intermediate canonical `make validate` reached 215 tests with 210 pass / 5 fail. The failures were isolated to frontend static assertions that encoded pre-reconciliation implementation details. Those tests were reconciled against the current product contracts without reverting valid UI behavior.

After reconciliation, the user reported the requested `make test` flow green. After the shared-ui runtime fix, the user also reported the requested `make bootstrap` + `make test` + development runtime flow green.

Because PR #26 was merged before the final shared-ui runtime correction was persisted, the closure patch is replayed on a fresh branch from current `master` rather than merging the stale original feature branch, which had diverged from `master`.

The final remaining automated gate for the closure branch is:

```text
make bootstrap
make validate
```

No DONE claim is authorized until that current-head canonical gate is green.

The known npm `allowScripts` warning for install scripts in `electron-winstaller` and the Git-consumed `@adumun/react-components` package remains a bootstrap-determinism observation to reconcile separately; it did not block the validated development flows and is not treated as visual acceptance evidence.

## Visual acceptance gate

The user reviewed the representative development surfaces after the shared React reconciliation:

- `Resumen del año`;
- `Ingresos del año`;
- `Perfil del año`;
- `Estimación anual`;
- `Ingresos laborales`.

The review confirmed the single-shell architecture, shared page hierarchy, scoped `No vinculante` status, shared tabs/forms/actions, annual-context authority and final product-language projection of `SALARY` as `Renta dependiente`.

The explicit visual gate is therefore complete:

```text
IMPLEMENTED
 -> targeted automated validation
 -> local development review
 -> USER_VISUAL_APPROVED
 -> POST-MERGE RUNTIME RECONCILIATION
 -> CANONICAL_VALIDATION_PENDING   <-- current state
 -> make validate PASS
 -> DONE
```

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
