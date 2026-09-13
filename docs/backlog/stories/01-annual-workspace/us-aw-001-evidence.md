# PTL-US-AW-001 — Select Annual Workspace — Evidence

**Type:** Story  
**Capability:** TAX-01  
**Priority:** P0  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-visible-annual-workspace`

## User outcome implemented

The product now exposes a persistent Annual Workspace context surface whose selectable values come from persisted `AnnualTaxWorkspace` records rather than an artificial calendar-year range.

The active context displays:

```text
Año comercial <commercialYear>
Operación Renta <derivedTaxYearLabel>
Estado: En preparación
```

`derivedTaxYearLabel` remains read-only and derives from the canonical commercial year.

## Acceptance evidence

### AC-01 — visible commercial year + derived Operación Renta

`AnnualWorkspaceGate` renders the persisted workspace's `commercialYear` and `derivedTaxYearLabel`.

### AC-02 — annual data reloaded before transition is considered usable

Selection runs through the annual workspace transition client. On success the active catalog is reloaded and `WorkspaceView` is remounted with `key={activeCommercialYear}`, causing its complete bootstrap/module reload under the new trusted annual context.

### AC-03 — honest transition state

The Annual Workspace header exposes `Cambiando contexto…` and disables selector/create controls while the transition is in progress.

### AC-04 — recoverable failure

The client transition uses the AW-006 generation/rollback mechanism. Failed selection restores the previous client-side active context and presents a recoverable error instead of declaring the transition successful.

### AC-05 — absent year is not silently created

The visible selector only enumerates `catalog.workspaces`. Selecting a non-existent year is not possible from that control; creation is a separate `+ Crear año` flow. Application flow also rejects direct selection of a missing workspace with `annual_workspace_not_found`.

### AC-06 — AT is not independently editable

The header renders the derived label as text; no AT input exists.

## Compatibility decision

`settings.year` remains the compatibility active pointer during Block 01, but it is no longer the source used to generate visible year options. Legacy year selectors are no longer visible navigation authorities; year switching is owned by the persistent Annual Workspace surface.

## Automated coverage

- `test/annual-workspace-flow.test.mjs`
  - persisted workspace listing + active identity;
  - existing workspace selection;
  - missing year does not materialize silently.
- `test/annual-workspace-visible-frontend.test.mjs`
  - header/AT contract;
  - no `YEAR_FLOOR` source for the visible selector;
  - transition generation + remount behavior;
  - AnnualWorkspace is the single visible year-navigation authority.

## Canonical validation

`make validate` passed from a complete local checkout on 2026-09-13:

- typecheck: PASS;
- tests: **149/149 PASS, 0 fail**;
- `desktop:check`: PASS;
- `architecture:check`: PASS.

AW-001-specific acceptance tests all passed, including persisted-only selection, missing-year rejection, visible derived AT, single visible authority and protected remount/reload semantics.

`PTL-US-AW-001` is **DONE**.
