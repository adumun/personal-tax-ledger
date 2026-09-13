# PTL-US-AW-002 — Create Annual Workspace — Evidence

**Type:** Story  
**Capability:** TAX-01  
**Priority:** P0  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-visible-annual-workspace`

## User outcome implemented

PTL now exposes an explicit `Crear año tributario` flow. Creation is no longer an incidental consequence of choosing a value from a generic year range.

The first Block 01 creation mode is intentionally limited to:

```text
Empezar vacío
```

`Inicializar desde un año anterior` is visible as a separate future flow but remains disabled until `PTL-US-AW-003` / `PTL-TASK-AW-004` are implemented.

## Acceptance evidence

### AC-01 — explicit create entry point

The persistent Annual Workspace header exposes `+ Crear año`, which opens the dedicated creation modal.

### AC-02 — commercial year + derived AT before confirmation

The modal accepts `Año comercial` and displays `AT<commercialYear + 1>` as derived, non-editable information before creation.

### AC-03 — duplicate year blocked

Both UI and application flow detect an existing persisted workspace before creation. The application rejects duplicates with:

```text
annual_workspace_already_exists
```

The visible message directs the user to open the existing workspace from the selector rather than creating a duplicate.

### AC-04 — empty mode creates only annual metadata

`createEmptyWorkspace` persists only an `AnnualTaxWorkspace`. It does not invoke income, BHE, mortgage, APV, evidence, reconciliation or copy services.

The UI states this explicitly:

```text
Empezar vacío crea únicamente el contexto anual.
No copia ingresos, boletas, hipotecas, APV, evidencia ni conciliaciones.
```

### AC-05 — created workspace becomes active

After metadata persistence, the flow updates the compatibility active pointer `settings.year`; the frontend Annual Workspace transition then reloads the persisted catalog and remounts the year-scoped workspace under the newly active commercial year.

### AC-06 — persistence/activation failure does not leave false visible success

Creation is treated as a user-level compound operation:

```text
create AnnualTaxWorkspace metadata
  -> activate settings.year
  -> success
```

If activation fails after metadata creation, the annual-workspace repository removes the just-created metadata as compensation and the error is propagated. The frontend transition also restores the prior client-side active generation/year. PTL therefore does not present a workspace as successfully created when activation did not complete.

## Supported-year policy integration

AW-002 consumes `PTL-TASK-AW-007` rather than defining its own year range:

- `SUPPORTED` -> creation allowed;
- `SUPPORTED_WITH_WARNINGS` -> explicit user acceptance required;
- `UNSUPPORTED` -> creation blocked with `unsupported_tax_year`.

The historical calculation fallback to another year's defaults does not make the requested commercial year supported.

## HTTP contract

The local API exposes:

```text
GET  /api/annual-workspaces
POST /api/annual-workspaces/select
POST /api/annual-workspaces
```

Creation accepts only `mode: EMPTY` in this Story. Other initialization modes are rejected until their own Story is implemented.

## Automated coverage

- `test/annual-workspace-flow.test.mjs`
  - duplicate-year rejection;
  - unsupported-year rejection;
  - warning requires explicit acceptance;
  - empty creation + activation;
  - failed activation compensates created metadata.
- `test/annual-workspace-visible-frontend.test.mjs`
  - create modal copy and derived AT;
  - prior-year initialization remains unavailable;
  - explicit annual-workspace endpoint is used instead of implicit settings mutation.

## Canonical validation

`make validate` passed from a complete local checkout on 2026-09-13:

- typecheck: PASS;
- tests: **149/149 PASS, 0 fail**;
- `desktop:check`: PASS;
- `architecture:check`: PASS.

AW-002-specific tests all passed, including duplicate rejection, `UNSUPPORTED`, explicit warnings, metadata-only creation, activation and compensation on failure.

`PTL-US-AW-002` is **DONE**.
