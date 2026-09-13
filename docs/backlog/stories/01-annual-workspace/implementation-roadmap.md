# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / OVERVIEW CLOSED`  
**Date:** 2026-09-13  
**Scope:** `Block 01 — Annual Workspace & Tax Profile`

## Objective

Replace the implicit/global year setting with a first-class `AnnualTaxWorkspace` that becomes the visible, persistent and safe parent context for later TAX capabilities while preserving current behavior.

## Current validated baseline

- `PTL-SPIKE-AW-001` — DONE; five-dimension applicability allowlist closed.
- `PTL-TASK-AW-001` — DONE; `make validate` 115/115.
- `PTL-TASK-AW-002` — DONE; `make validate` 118/118.
- `PTL-TASK-AW-005` — DONE; `make validate` 127/127.
- `PTL-US-AW-006` — DONE; `make validate` 131/131.
- `PTL-TASK-AW-007` — DONE; `make validate` 136/136.
- `PTL-US-AW-001 + PTL-US-AW-002` — DONE; `make validate` 149/149.
- `PTL-TASK-AW-003` — DONE; `make validate` 155/155.
- `PTL-US-AW-004` — DONE; `make validate` 164/164.
- `PTL-TASK-AW-006 + PTL-US-AW-005` — DONE; `make validate` **169/169**, `desktop:check` PASS, `architecture:check` PASS.

## Current executable path — prior-year initialization

The only remaining functional Block 01 slice is:

1. `PTL-TASK-AW-004 — Allowlisted prior-year initialization service`;
2. `PTL-US-AW-003 — Initialize from prior year`.

The implementation MUST be category allowlisted. It MUST NOT copy all rows by `tax_year` or turn historical facts into current-year facts.

### Required semantics

Reusable configuration may include only explicitly classified reusable/proposal data, initially:

- applicability profile as a revisable proposal;
- compatible non-transactional annual settings when explicitly allowed;
- future recurring-source templates only when a canonical template model exists.

The following remain forbidden:

- realized amounts;
- BHE, retentions or PPM as current-year facts;
- ledger movements;
- documentary evidence;
- SII/reconciliation state;
- prior-year readiness/closure state;
- calculated results or projections as current-year facts.

Every copied/proposed value must retain source-year provenance and the operation must be idempotent or require explicit conflict resolution.

## Critical safety chain

```text
PTL-TASK-AW-001 [DONE]
        ↓
PTL-TASK-AW-005 [DONE]
        ↓
PTL-US-AW-006   [DONE]
        ↓
PTL-TASK-AW-008 [REACHED / WAITING ONLY ON PRIOR-YEAR INITIALIZATION]
```

## AW-008 readiness

| Required AW-008 coverage | State |
|---|---|
| implicit-year migration | AVAILABLE |
| year isolation | AVAILABLE |
| stale async read/write protection | AVAILABLE |
| supported-year policy | AVAILABLE |
| select/create year | AVAILABLE |
| duplicate-year behavior | AVAILABLE |
| tri-state applicability profile | AVAILABLE |
| workspace overview projection | AVAILABLE |
| prior-year initialization allowlist | PENDING TASK-AW-004/US-AW-003 |

Opening AW-008 as a long-lived partial PR remains intentionally avoided. Once prior-year initialization is validated, AW-008 becomes the immediate terminal quality gate.

## Established technical invariants

- `commercialYear` is canonical; AT/Operación Renta is derived.
- `settings.year` remains a compatibility active-year pointer, not the visible workspace catalog.
- `AnnualTaxWorkspace` metadata is first-class and persistent.
- mutable annual operations consume trusted `AnnualWorkspaceContext` and revalidate active context before persistence.
- frontend generation suppresses stale annual responses.
- exact-year rule availability governs workspace selection/creation support.
- empty workspace creation copies no transactional facts.
- `TaxApplicabilityProfile` is expectation/applicability only and is versioned independently of canonical facts.
- `NO + canonical fact PRESENT => NEEDS_REVIEW`; facts remain authoritative.
- Annual Workspace Overview is structural only and contains no tax outcome/readiness/SII/optimization semantics.

## Canonical evidence

- [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md)
- [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md)
- [`task-aw-001-evidence.md`](task-aw-001-evidence.md)
- [`task-aw-002-evidence.md`](task-aw-002-evidence.md)
- [`task-aw-003-evidence.md`](task-aw-003-evidence.md)
- [`task-aw-005-evidence.md`](task-aw-005-evidence.md)
- [`task-aw-006-evidence.md`](task-aw-006-evidence.md)
- [`task-aw-007-evidence.md`](task-aw-007-evidence.md)
- [`us-aw-001-evidence.md`](us-aw-001-evidence.md)
- [`us-aw-002-evidence.md`](us-aw-002-evidence.md)
- [`us-aw-004-evidence.md`](us-aw-004-evidence.md)
- [`us-aw-005-evidence.md`](us-aw-005-evidence.md)
- [`us-aw-006-evidence.md`](us-aw-006-evidence.md)
- [`enablers-and-dependencies.md`](enablers-and-dependencies.md)

## Decision

`GO` for `PTL-TASK-AW-004 + PTL-US-AW-003`. This is the final functional slice before `PTL-TASK-AW-008` closes Block 01 quality/regression evidence.
