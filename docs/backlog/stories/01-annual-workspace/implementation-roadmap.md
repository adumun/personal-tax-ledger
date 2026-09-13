# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / ALL FUNCTIONAL SLICES CLOSED / AW-008 READY`  
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
- `PTL-TASK-AW-004 + PTL-US-AW-003` — DONE; canonical `make validate` rerun PASS after the obsolete AW-002 assertion was reconciled with the now-enabled AW-003 flow.

## Prior-year initialization — closed contract

The reusable-category allowlist currently contains exactly:

```text
APPLICABILITY_PROFILE
```

The profile is copied as a revisable proposal into the target workspace. No generic table-driven copy is allowed.

Provenance is persisted separately from `TaxApplicabilityProfile v1` in `annual_workspace_initializations` with source/target workspace/year, actual category set and timestamp.

Explicitly forbidden copy remains:

- realized amounts;
- BHE/fee receipts;
- retentions or PPM;
- ledger movements;
- documentary evidence;
- SII/reconciliation state;
- readiness/closure state;
- calculated results or historical projections.

Failure/idempotency semantics are validated: unsupported categories fail before creation; partial failure removes the target and restores the previous active year; identical provenance is idempotent; conflicting existing targets remain explicit conflicts.

## Critical safety chain

```text
PTL-TASK-AW-001 [DONE]
        ↓
PTL-TASK-AW-005 [DONE]
        ↓
PTL-US-AW-006   [DONE]
        ↓
PTL-TASK-AW-008 [READY / TERMINAL QUALITY GATE]
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
| prior-year initialization allowlist/provenance/idempotency/rollback | AVAILABLE |

AW-008 is now the immediate executable node. It must consolidate complete Block 01 regression evidence and effective DoD/dogfood review; it must not add new feature semantics.

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
- prior-year initialization is explicit, allowlisted, auditable and non-transactional.

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

`GO` for `PTL-TASK-AW-008`. No remaining functional dependency blocks terminal Block 01 closure.
