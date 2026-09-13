# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / PRIOR-YEAR INITIALIZATION IN REVIEW`  
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
- `PTL-TASK-AW-006 + PTL-US-AW-005` — DONE; `make validate` 169/169, desktop/architecture PASS.

## Current implementation — prior-year initialization

`PTL-TASK-AW-004 + PTL-US-AW-003` are implemented on `feat/block-01-prior-year-initialization` and remain **IN_REVIEW** until canonical validation passes.

### Closed implementation decisions

The reusable-category allowlist currently contains exactly:

```text
APPLICABILITY_PROFILE
```

The profile is copied as a revisable proposal into the target workspace. No generic table-driven copy is allowed.

Provenance is persisted separately from `TaxApplicabilityProfile v1`:

```text
annual_workspace_initializations
  target_workspace_id
  source_workspace_id
  source_commercial_year
  target_commercial_year
  categories_json
  initialized_at
```

This keeps tax declaration semantics separate from copy/audit provenance.

### Explicitly forbidden copy

- realized amounts;
- BHE/fee receipts;
- retentions or PPM;
- ledger movements;
- documentary evidence;
- SII/reconciliation state;
- readiness/closure state;
- calculated results or historical projections.

### Failure/idempotency semantics

- unsupported categories fail before target creation;
- partial failure after target creation removes the target workspace and restores the previously active year;
- identical source/target/category provenance is idempotent;
- a conflicting pre-existing target remains explicit conflict.

## Critical safety chain

```text
PTL-TASK-AW-001 [DONE]
        ↓
PTL-TASK-AW-005 [DONE]
        ↓
PTL-US-AW-006   [DONE]
        ↓
PTL-TASK-AW-008 [REACHED / WAITING ONLY ON PRIOR-YEAR INITIALIZATION VALIDATION]
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
| prior-year initialization allowlist | IN_REVIEW via TASK-AW-004/US-AW-003 |

AW-008 remains unopened as a long-lived partial PR. A clean validation of this slice makes AW-008 immediately executable as the terminal quality gate.

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
- prior-year initialization is allowlisted and records provenance separately from copied proposals.

## Canonical evidence

- [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md)
- [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md)
- [`task-aw-001-evidence.md`](task-aw-001-evidence.md)
- [`task-aw-002-evidence.md`](task-aw-002-evidence.md)
- [`task-aw-003-evidence.md`](task-aw-003-evidence.md)
- [`task-aw-004-evidence.md`](task-aw-004-evidence.md)
- [`task-aw-005-evidence.md`](task-aw-005-evidence.md)
- [`task-aw-006-evidence.md`](task-aw-006-evidence.md)
- [`task-aw-007-evidence.md`](task-aw-007-evidence.md)
- [`us-aw-001-evidence.md`](us-aw-001-evidence.md)
- [`us-aw-002-evidence.md`](us-aw-002-evidence.md)
- [`us-aw-003-evidence.md`](us-aw-003-evidence.md)
- [`us-aw-004-evidence.md`](us-aw-004-evidence.md)
- [`us-aw-005-evidence.md`](us-aw-005-evidence.md)
- [`us-aw-006-evidence.md`](us-aw-006-evidence.md)
- [`enablers-and-dependencies.md`](enablers-and-dependencies.md)

## Decision

`GO / IN_REVIEW` for `PTL-TASK-AW-004 + PTL-US-AW-003`. Canonical `make validate` is the only remaining closure gate before `PTL-TASK-AW-008`.
