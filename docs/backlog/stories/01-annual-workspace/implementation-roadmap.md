# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / APPLICABILITY FOUNDATION IN REVIEW`  
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
- `PTL-US-AW-001 + PTL-US-AW-002` — DONE; `make validate` **149/149**, `desktop:check` PASS, `architecture:check` PASS.
- `PTL-TASK-AW-003` — **IN_REVIEW** on `feat/block-01-tax-applicability-profile`.

## Current P0 implementation — AW-003

The applicability foundation now implements:

```text
AnnualWorkspaceContext
  -> TaxApplicabilityProfile v1
  -> five versioned dimensions
  -> YES | NO | UNKNOWN
  -> SQLite persistence by annualWorkspaceId
```

The exact Block 01 dimensions are:

```text
DEPENDENT_INCOME
DOMESTIC_FEE_INCOME
FOREIGN_SERVICE_INCOME
APV_CONTRIBUTIONS
MORTGAGE_INTEREST
```

Key invariants:

- missing declarations normalize to `UNKNOWN`;
- unsupported dimensions/values are rejected;
- the profile is keyed by `annualWorkspaceId`, not a free-floating UI year;
- save revalidates the active annual context before persistence;
- reading an absent profile yields an in-memory all-`UNKNOWN` projection without creating facts;
- the profile use case has no dependency on income, BHE, mortgage, APV or evidence repositories;
- `NO` never deletes/reclassifies canonical facts;
- profile schema is versioned from inception (`profileVersion = 1`).

Evidence: [`task-aw-003-evidence.md`](task-aw-003-evidence.md).

Closure gate remains canonical `make validate`.

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

## AW-008 readiness

| Required AW-008 coverage | State |
|---|---|
| implicit-year migration | AVAILABLE |
| year isolation | AVAILABLE |
| stale async read/write protection | AVAILABLE |
| supported-year policy | AVAILABLE |
| select/create year | AVAILABLE |
| duplicate-year behavior | AVAILABLE |
| prior-year initialization allowlist | PENDING TASK-AW-004/US-AW-003 |
| tri-state applicability profile | FOUNDATION IN REVIEW via TASK-AW-003; observable UI/conflict behavior pending US-AW-004 |
| workspace overview projection | PENDING TASK-AW-006/US-AW-005 |

Opening AW-008 as a long-lived partial PR remains intentionally avoided.

## Next executable path after clean AW-003 closure

### 1 — Applicability Story

`PTL-US-AW-004 — Applicability Profile`

This Story will add the user-visible editor and `NEEDS_REVIEW` conflict projection against canonical facts. Facts remain authoritative and profile answers remain declarations only.

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
- mutable annual operations consume trusted `AnnualWorkspaceContext` and revalidate active context before persistence.
- frontend generation suppresses stale annual responses.
- exact-year rule availability governs workspace selection/creation support.
- empty workspace creation copies no transactional facts.
- TaxApplicabilityProfile is expectation/applicability only and is versioned independently of canonical facts.

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
- [`task-aw-003-evidence.md`](task-aw-003-evidence.md)
- [`enablers-and-dependencies.md`](enablers-and-dependencies.md)

## Decision

`GO / IN_REVIEW` for `PTL-TASK-AW-003`. A clean canonical validation closes the applicability persistence foundation and advances directly to `PTL-US-AW-004`.
