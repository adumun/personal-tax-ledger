# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / FIRST VISIBLE ANNUAL-WORKSPACE SLICE READY`  
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

All canonical validation gates above also passed `desktop:check` and `architecture:check`.

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

The representative cross-year failure is now protected end-to-end:

```text
open/edit in 2025
  -> switch to 2026
  -> stale write or stale response arrives
  -> trusted context/generation detects mismatch
  -> operation/response is rejected
  -> no 2026 contamination
```

Validated representative aggregates include income, BHE/fee receipts and mortgages. Material logs carry annual workspace identity and commercial year.

## Supported-year policy resolved

Annual workspace support is now provider-neutral and exact-year driven:

```text
SUPPORTED
SUPPORTED_WITH_WARNINGS
UNSUPPORTED
```

The legacy `defaultTaxParameters(taxYear)` fallback does not make another year supported. Current seeded behavior is therefore data-driven: 2026 is `SUPPORTED`; a year without its own exact rule set is `UNSUPPORTED`.

This removes the final policy blocker for explicit workspace creation.

## Why AW-008 is not the next implementation PR

AW-008 is the final block-level regression gate. Its specification still requires behaviors that do not exist yet:

| Required AW-008 coverage | State |
|---|---|
| implicit-year migration | AVAILABLE |
| year isolation | AVAILABLE |
| stale async read/write protection | AVAILABLE |
| supported-year policy | AVAILABLE |
| select/create year | PENDING US-AW-001/002 |
| duplicate-year behavior | PENDING US-AW-002 |
| prior-year initialization allowlist | PENDING TASK-AW-004/US-AW-003 |
| tri-state applicability profile | PENDING TASK-AW-003/US-AW-004 |
| workspace overview projection | PENDING TASK-AW-006/US-AW-005 |

Opening AW-008 now as a long-lived partial PR would accumulate unfinished closure work. The regression suite should be assembled as these behaviors land and closed only after its dependencies exist.

## Next executable path

### 1 — First usable annual-workspace vertical slice

Now execute together where coherent:

1. `PTL-US-AW-001 — Select workspace`
2. `PTL-US-AW-002 — Create workspace`

This converts the legacy year selector into explicit user-visible `AnnualTaxWorkspace` navigation/creation while consuming:

- persistent workspace identity from AW-001/AW-002;
- trusted active context and transition generation from AW-005/AW-006;
- exact-year rule availability from AW-007.

The visible flow must not reintroduce an independent editable AT/year concept: `commercialYear` remains canonical and Operación Renta is derived.

### 2 — Applicability

1. `PTL-TASK-AW-003 — TaxApplicabilityProfile schema/repository`
2. `PTL-US-AW-004 — Applicability Profile`

The profile remains expectation/applicability, never actual tax facts.

### 3 — Overview

1. `PTL-TASK-AW-006 — Annual workspace overview projection`
2. `PTL-US-AW-005 — Workspace overview`

### 4 — Prior-year initialization (P1)

1. `PTL-TASK-AW-004 — Allowlisted prior-year initialization service`
2. `PTL-US-AW-003 — Initialize from prior year`

No blanket copying by `tax_year` is allowed.

### 5 — Block closure

`PTL-TASK-AW-008 — Block-level automated regression suite`, followed by effective DoR/DoD review and dogfood evidence.

## Established technical invariants

- `commercialYear` is canonical; AT/Operación Renta is derived.
- `settings.year` remains a compatibility active-year source while visible workspace flows migrate.
- `AnnualTaxWorkspace` metadata is first-class and persistent.
- workspace materialization uses active settings plus actual user-data years, never rule-catalog seed years alone.
- migration/materialization is additive/idempotent and copies no tax facts.
- mutable annual application operations consume `AnnualWorkspaceContext`.
- request/input/persisted entity year must match the trusted annual context.
- mutable operations revalidate active context immediately before persistence.
- frontend workspace generation suppresses stale responses.
- year transitions require explicit confirmation before discarding potentially unsaved form state.
- `tax_rule_sources` remains a provider/rule catalog rather than user-workspace ownership.
- exact-year rule availability, not fallback defaults or UI ranges, governs workspace support.

## Canonical evidence

- [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md)
- [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md)
- [`task-aw-001-evidence.md`](task-aw-001-evidence.md)
- [`task-aw-002-evidence.md`](task-aw-002-evidence.md)
- [`task-aw-005-evidence.md`](task-aw-005-evidence.md)
- [`us-aw-006-evidence.md`](us-aw-006-evidence.md)
- [`task-aw-007-evidence.md`](task-aw-007-evidence.md)
- [`enablers-and-dependencies.md`](enablers-and-dependencies.md)

## Decision

`GO` with the next implementation branch assigned to the combined first visible slice `PTL-US-AW-001 + PTL-US-AW-002`.

AW-008 remains the terminal quality gate for the block; it is not treated as a placeholder feature branch while required functionality is absent.
