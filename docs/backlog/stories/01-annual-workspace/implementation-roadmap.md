# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / FIRST VISIBLE ANNUAL-WORKSPACE SLICE IN REVIEW`  
**Date:** 2026-09-13  
**Scope:** `Block 01 — Annual Workspace & Tax Profile`

## Objective

Replace the implicit/global year setting with a first-class `AnnualTaxWorkspace` that becomes the visible, persistent and safe parent context for later TAX capabilities while preserving current behavior.

## Current validated baseline

- `PTL-SPIKE-AW-001` — DONE; five-dimension applicability allowlist closed.
- `PTL-TASK-AW-001` — DONE; `make validate` 115/115.
- `PTL-TASK-AW-002` — DONE; `make validate` 118/118; persistence/migration merged.
- `PTL-TASK-AW-005` — DONE; `make validate` 127/127; trusted context merged.
- `PTL-US-AW-006` — DONE; `make validate` 131/131; strict isolation and UX behavior validated.
- `PTL-TASK-AW-007` — DONE; `make validate` 136/136; exact-year rule availability policy validated.
- `PTL-US-AW-001 + PTL-US-AW-002` — IN_REVIEW on `feat/block-01-visible-annual-workspace`.

All closed canonical validation gates above also passed `desktop:check` and `architecture:check`.

## Critical safety chain

```text
PTL-TASK-AW-001 [DONE]
        ↓
PTL-TASK-AW-005 [DONE]
        ↓
PTL-US-AW-006   [DONE]
        ↓
PTL-TASK-AW-008 [REACHED / NOT YET CLOSABLE]
```

The representative cross-year failure is protected end-to-end by trusted context, active-context revalidation and frontend generation suppression.

## First visible annual-workspace slice

The current branch implements the first user-visible AnnualWorkspace flow:

```text
persisted AnnualTaxWorkspace list
  -> persistent Workspace Context Header
  -> select existing workspace
  -> AW-007 support decision
  -> AW-005/AW-006 protected transition
  -> reload full year-scoped view

+ Crear año
  -> commercialYear + derived AT preview
  -> Empezar vacío
  -> AW-007 support decision
  -> persist metadata only
  -> activate settings.year compatibility pointer
  -> compensate metadata if activation fails
  -> reload under new AnnualWorkspace
```

Important compatibility boundary:

- `settings.year` remains persisted internally as the active pointer during migration;
- it is no longer the visible source of arbitrary year options;
- the header selector lists persisted `AnnualTaxWorkspace` records only;
- legacy year selectors in the old shell/settings are no longer visible navigation authorities;
- AT remains derived and non-editable.

Evidence:
- [`us-aw-001-evidence.md`](us-aw-001-evidence.md)
- [`us-aw-002-evidence.md`](us-aw-002-evidence.md)

Canonical closure gate for this slice:

```text
make validate
```

Until that passes, both Stories remain `IN_REVIEW`.

## Supported-year policy

Annual workspace support is provider-neutral and exact-year driven:

```text
SUPPORTED
SUPPORTED_WITH_WARNINGS
UNSUPPORTED
```

The legacy `defaultTaxParameters(taxYear)` fallback does not make another year supported. A warning requires explicit acceptance; an unsupported year is blocked.

## AW-008 readiness

AW-008 remains the final block-level regression gate.

| Required AW-008 coverage | State |
|---|---|
| implicit-year migration | AVAILABLE |
| year isolation | AVAILABLE |
| stale async read/write protection | AVAILABLE |
| supported-year policy | AVAILABLE |
| select/create year | IMPLEMENTED / VALIDATION PENDING |
| duplicate-year behavior | IMPLEMENTED / VALIDATION PENDING |
| prior-year initialization allowlist | PENDING TASK-AW-004/US-AW-003 |
| tri-state applicability profile | PENDING TASK-AW-003/US-AW-004 |
| workspace overview projection | PENDING TASK-AW-006/US-AW-005 |

Opening AW-008 as a long-lived partial PR remains intentionally avoided.

## Next executable path after clean validation

### 1 — Applicability

1. `PTL-TASK-AW-003 — TaxApplicabilityProfile schema/repository`
2. `PTL-US-AW-004 — Applicability Profile`

The profile remains expectation/applicability, never actual tax facts.

### 2 — Overview

1. `PTL-TASK-AW-006 — Annual workspace overview projection`
2. `PTL-US-AW-005 — Workspace overview`

### 3 — Prior-year initialization (P1)

1. `PTL-TASK-AW-004 — Allowlisted prior-year initialization service`
2. `PTL-US-AW-003 — Initialize from prior year`

No blanket copying by `tax_year` is allowed.

### 4 — Block closure

`PTL-TASK-AW-008 — Block-level automated regression suite`, followed by effective DoR/DoD review and dogfood evidence.

## Established technical invariants

- `commercialYear` is canonical; AT/Operación Renta is derived.
- `settings.year` remains a compatibility active-year pointer, not the visible workspace catalog.
- `AnnualTaxWorkspace` metadata is first-class and persistent.
- workspace materialization uses active settings plus actual user-data years, never rule-catalog seed years alone.
- migration/materialization is additive/idempotent and copies no tax facts.
- mutable annual application operations consume `AnnualWorkspaceContext`.
- request/input/persisted entity year must match the trusted annual context.
- mutable operations revalidate active context immediately before persistence.
- frontend workspace generation suppresses stale responses.
- year transitions require explicit confirmation before discarding potentially unsaved form state.
- exact-year rule availability governs workspace selection/creation support.
- empty workspace creation copies no transactional facts.
- failed activation after creation is compensated before success is reported.

## Canonical evidence

- [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md)
- [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md)
- [`task-aw-001-evidence.md`](task-aw-001-evidence.md)
- [`task-aw-002-evidence.md`](task-aw-002-evidence.md)
- [`task-aw-005-evidence.md`](task-aw-005-evidence.md)
- [`us-aw-006-evidence.md`](us-aw-006-evidence.md)
- [`task-aw-007-evidence.md`](task-aw-007-evidence.md)
- [`us-aw-001-evidence.md`](us-aw-001-evidence.md)
- [`us-aw-002-evidence.md`](us-aw-002-evidence.md)
- [`enablers-and-dependencies.md`](enablers-and-dependencies.md)

## Decision

`GO / IN_REVIEW` for the combined visible slice `PTL-US-AW-001 + PTL-US-AW-002`.

A clean canonical validation closes this slice and advances the P0 path to `PTL-TASK-AW-003`.
