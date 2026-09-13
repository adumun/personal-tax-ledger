# Block 01 — Enablers, Spikes & Dependencies

**Status:** `IMPLEMENTING / VISIBLE ANNUAL WORKSPACE SLICE IN REVIEW`

This file separates actor-visible Stories from technical enabling work according to `STD-WMS-001` / `STD-WMS-TYPES-001`. No `Technical Story` type is introduced.

## Enabling Tasks

### PTL-TASK-AW-001 — AnnualTaxWorkspace domain/application contract

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** DONE

Define a first-class annual workspace contract keyed by `commercialYear` and suitable for all TAX capabilities.

Validation/closure evidence: [`task-aw-001-evidence.md`](task-aw-001-evidence.md). Canonical `make validate` passed with 115/115 tests plus desktop and architecture checks.

**Enables:** AW-001, AW-002, AW-006.

---

### PTL-TASK-AW-002 — Persistence and migration from implicit settings.year

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** DONE

Annual workspace metadata persistence and deterministic compatibility migration are implemented without copying tax facts. Workspace materialization uses `settings.year` plus actual user/domain years and excludes rule-catalog seed years as independent workspace evidence.

Evidence: [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md), [`task-aw-002-evidence.md`](task-aw-002-evidence.md). Canonical `make validate` passed with 118/118 tests plus desktop and architecture checks.

**Enables:** AW-001, AW-002, AW-006.

---

### PTL-TASK-AW-003 — TaxApplicabilityProfile schema and repository

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** READY

Persist annual applicability independently from actual facts using the five dimensions closed by [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md).

`Applicability profile != actual tax facts` remains mandatory.

**Enables:** AW-003, AW-004, AW-005.

---

### PTL-TASK-AW-004 — Allowlisted prior-year initialization service

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P1  
**Status:** BLOCKED_BY_AW_003

Create a category-aware allowlisted service that reuses configuration/proposals only. Copying all rows for a prior `tax_year` is forbidden.

**Enables:** AW-003.

---

### PTL-TASK-AW-005 — Trusted workspace context propagation

**Type:** Task  
**Role:** ENABLER  
**Size:** L  
**Priority:** P0  
**Status:** DONE

Delivered and merged:

- trusted `AnnualWorkspaceContext` with `annualWorkspaceId + commercialYear`;
- per-request active-context resolution;
- application-boundary year validation for mutable annual domains;
- persisted-entity year checks for update/delete;
- active-context revalidation immediately before persistence;
- HTTP `409 workspace_year_mismatch` semantics;
- frontend generation-based stale-response suppression;
- execution-log annual context enrichment;
- compatibility rematerialization after legacy year switching.

Evidence: [`task-aw-005-evidence.md`](task-aw-005-evidence.md). Canonical `make validate` passed with 127/127 tests plus desktop and architecture checks.

**Enables:** AW-006 and safe downstream TAX blocks.

---

### PTL-TASK-AW-006 — Annual workspace overview projection

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** BLOCKED_BY_AW_003_AW_004

Build a structural read model for AW-005 without turning it into Annual Tax Health. Candidate fields remain commercial year/AT, lifecycle, profile completeness, structural counts/presence, rule provenance and last update timestamp.

**Enables:** AW-005.

---

### PTL-TASK-AW-007 — Supported-year and rule-availability policy

**Type:** Task  
**Role:** ENABLER  
**Size:** S  
**Priority:** P0  
**Status:** DONE

Provider-neutral year support policy is implemented with three states:

- `SUPPORTED`;
- `SUPPORTED_WITH_WARNINGS`;
- `UNSUPPORTED`.

Support is evaluated from exact-year tax-parameter coverage and exact-year rule provenance. The legacy `defaultTaxParameters()` fallback to 2026 does not make another year supported.

Current seeded behavior is data-driven: 2026 resolves to `SUPPORTED`; a year with no exact rule set resolves to `UNSUPPORTED`.

Evidence: [`task-aw-007-evidence.md`](task-aw-007-evidence.md). Canonical `make validate` passed with 136/136 tests plus desktop and architecture checks.

**Enables:** AW-002.

---

### PTL-TASK-AW-008 — Block-level automated regression suite

**Type:** Task  
**Role:** QUALITY_ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** NOT_READY_FOR_CLOSURE

Final regression coverage must include:

- migration from implicit-year persistence — available;
- select/create year and duplicate-year behavior — implementation available on the current slice, canonical validation pending;
- strict year isolation and stale async protection — available via AW-005/AW-006;
- prior-year initialization allowlist — pending AW-004/US-AW-003;
- tri-state applicability profile — pending AW-003/US-AW-004;
- workspace overview projection — pending TASK-AW-006/US-AW-005.

AW-008 is reached by the safety chain, but starting a long-lived closure PR before these remaining behaviors exist would create a partial regression suite and violate the no-accumulated-PR operating model.

**Requires:** implementation Tasks/Stories above.  
**Enables:** block DoD.

## Spike

### PTL-SPIKE-AW-001 — Validate minimum annual applicability dimensions

**Status:** DONE  
**Closed:** 2026-09-12

Accepted dimensions:

- `DEPENDENT_INCOME`;
- `DOMESTIC_FEE_INCOME`;
- `FOREIGN_SERVICE_INCOME`;
- `APV_CONTRIBUTIONS`;
- `MORTGAGE_INTEREST`.

Rejected from this profile:

- actual-expense evaluation/election;
- AFP/health applicability flag.

## Dependency graph

```mermaid
flowchart LR
  T1[AW-TASK-001\nDONE] --> T2[AW-TASK-002\nDONE]
  T1 --> T5[AW-TASK-005\nDONE]
  T5 --> U6[AW-US-006\nDONE]

  T1 --> U1[AW-US-001\nIN REVIEW]
  T2 --> U1

  T1 --> U2[AW-US-002\nIN REVIEW]
  T2 --> U2
  T7[AW-TASK-007\nDONE] --> U2

  U2 --> U3[AW-US-003\nInitialize prior]
  T3[AW-TASK-003\nREADY] --> U3
  T4[AW-TASK-004] --> U3

  S1[AW-SPIKE-001\nDONE] --> U4[AW-US-004\nApplicability]
  U2 --> U4
  T3 --> U4

  U1 --> U5[AW-US-005\nOverview]
  U4 --> U5
  T6[AW-TASK-006] --> U5

  U1 --> T8[AW-TASK-008]
  U2 --> T8
  U3 --> T8
  U4 --> T8
  U5 --> T8
  U6 --> T8
```

## Fast lane status

### Foundation / persistence

- SPIKE-AW-001 — DONE
- TASK-AW-001 — DONE
- TASK-AW-002 — DONE
- TASK-AW-005 — DONE
- US-AW-006 — DONE (`make validate`: 131/131, desktop/architecture clean)
- TASK-AW-007 — DONE (`make validate`: 136/136, desktop/architecture clean)

### Current P0 slice

1. `PTL-US-AW-001 — Select workspace` — **IN_REVIEW**
2. `PTL-US-AW-002 — Create workspace` — **IN_REVIEW**

Implemented on `feat/block-01-visible-annual-workspace`:

- persistent Annual Workspace Context Header;
- visible selector sourced only from persisted workspaces;
- derived, read-only Operación Renta label;
- AW-005/AW-006 protected transition generation reused for selection/creation;
- explicit empty-workspace creation;
- AW-007 support/warning/block semantics;
- duplicate detection;
- compensating metadata removal when activation fails;
- legacy year controls removed as visible navigation authorities.

Evidence:
- [`us-aw-001-evidence.md`](us-aw-001-evidence.md)
- [`us-aw-002-evidence.md`](us-aw-002-evidence.md)

Closure gate: canonical `make validate`.

### Next after clean closure

1. `PTL-TASK-AW-003 — TaxApplicabilityProfile`
2. `PTL-US-AW-004 — Applicability Profile`
3. `PTL-TASK-AW-006 + PTL-US-AW-005 — Workspace overview`
4. P1 initialization branch (`AW-004 + US-AW-003`)
5. `PTL-TASK-AW-008` final regression closure

## Critical safety chain

```text
TASK-AW-001 [DONE]
 -> TASK-AW-005 [DONE]
 -> US-AW-006 [DONE]
 -> TASK-AW-008 [REACHED, NOT YET CLOSABLE]
```

The safety invariant is implemented and validated. The current visible workspace slice consumes it rather than defining a second transition mechanism.

## Block readiness verdict

The first visible annual-workspace slice is implemented and **IN_REVIEW**. A clean canonical validation will close AW-001/AW-002 and make `PTL-TASK-AW-003` the next P0 implementation node.
