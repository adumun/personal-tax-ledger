# Block 01 — Enablers, Spikes & Dependencies

**Status:** `IMPLEMENTING / PRIOR-YEAR INITIALIZATION IN REVIEW`

This file separates actor-visible Stories from technical enabling work according to `STD-WMS-001` / `STD-WMS-TYPES-001`. No `Technical Story` type is introduced.

## Enabling Tasks

### PTL-TASK-AW-001 — AnnualTaxWorkspace domain/application contract

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** DONE

Define a first-class annual workspace contract keyed by `commercialYear` and suitable for all TAX capabilities. Evidence: [`task-aw-001-evidence.md`](task-aw-001-evidence.md). Canonical `make validate`: 115/115 plus desktop/architecture checks.

---

### PTL-TASK-AW-002 — Persistence and migration from implicit settings.year

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** DONE

Annual workspace metadata persistence and deterministic compatibility migration are implemented without copying tax facts. Evidence: [`task-aw-002-evidence.md`](task-aw-002-evidence.md). Canonical `make validate`: 118/118 plus desktop/architecture checks.

---

### PTL-TASK-AW-003 — TaxApplicabilityProfile schema and repository

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** DONE

Versioned `TaxApplicabilityProfile` v1 with the closed five-dimension allowlist, strict `YES | NO | UNKNOWN` semantics, SQLite persistence by `annualWorkspaceId`, trusted annual context and no dependency on canonical fact repositories.

Evidence: [`task-aw-003-evidence.md`](task-aw-003-evidence.md). Canonical `make validate`: 155/155 plus desktop/architecture checks.

**Enables:** AW-003, AW-004, AW-005.

---

### PTL-TASK-AW-004 — Allowlisted prior-year initialization service

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P1  
**Status:** IN_REVIEW

Implemented on `feat/block-01-prior-year-initialization`:

- explicit reusable-category allowlist;
- Block 01 category: `APPLICABILITY_PROFILE` as revisable proposal;
- explicit forbidden-copy catalog for facts/evidence/results;
- persisted initialization provenance outside the profile schema;
- idempotent repeat for identical source/target/category provenance;
- rollback of target workspace and active-year restoration after partial failure;
- no transactional repository discovery/inference.

Evidence: [`task-aw-004-evidence.md`](task-aw-004-evidence.md). Closure gate: canonical `make validate`.

---

### PTL-TASK-AW-005 — Trusted workspace context propagation

**Type:** Task  
**Role:** ENABLER  
**Size:** L  
**Priority:** P0  
**Status:** DONE

Trusted annual identity, per-request resolution, cross-year validation, stale mutation protection, HTTP conflict semantics, frontend generation protection and annual audit context are implemented. Evidence: [`task-aw-005-evidence.md`](task-aw-005-evidence.md). Canonical `make validate`: 127/127.

---

### PTL-TASK-AW-006 — Annual workspace overview projection

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** DONE

Structural read model for period, applicability completeness, domain-data presence/counts, evidence availability and exact-year rule status. It deliberately excludes tax outcome, readiness, SII reconciliation and optimization.

Evidence: [`task-aw-006-evidence.md`](task-aw-006-evidence.md). Canonical `make validate`: 169/169 plus desktop/architecture checks.

---

### PTL-TASK-AW-007 — Supported-year and rule-availability policy

**Type:** Task  
**Role:** ENABLER  
**Size:** S  
**Priority:** P0  
**Status:** DONE

Provider-neutral exact-year support policy with `SUPPORTED`, `SUPPORTED_WITH_WARNINGS`, `UNSUPPORTED`. Evidence: [`task-aw-007-evidence.md`](task-aw-007-evidence.md). Canonical `make validate`: 136/136.

---

### PTL-TASK-AW-008 — Block-level automated regression suite

**Type:** Task  
**Role:** QUALITY_ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** NOT_READY_FOR_CLOSURE

Final regression coverage must include:

- migration from implicit-year persistence — AVAILABLE;
- select/create year and duplicate-year behavior — AVAILABLE via AW-001/AW-002;
- strict year isolation and stale async protection — AVAILABLE via AW-005/AW-006;
- supported-year policy — AVAILABLE via AW-007;
- tri-state applicability profile and conflict behavior — AVAILABLE via TASK-AW-003/US-AW-004;
- workspace overview projection — AVAILABLE via TASK-AW-006/US-AW-005;
- prior-year initialization allowlist — **IN_REVIEW** via TASK-AW-004/US-AW-003.

AW-008 remains the terminal block-quality gate; it should not become a long-lived partial PR.

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

  T1 --> U1[AW-US-001\nDONE]
  T2 --> U1

  T1 --> U2[AW-US-002\nDONE]
  T2 --> U2
  T7[AW-TASK-007\nDONE] --> U2

  U2 --> U3[AW-US-003\nIN REVIEW]
  T3[AW-TASK-003\nDONE] --> U3
  T4[AW-TASK-004\nIN REVIEW] --> U3

  S1[AW-SPIKE-001\nDONE] --> U4[AW-US-004\nDONE]
  U2 --> U4
  T3 --> U4

  U1 --> U5[AW-US-005\nDONE]
  U4 --> U5
  T6[AW-TASK-006\nDONE] --> U5

  U1 --> T8[AW-TASK-008]
  U2 --> T8
  U3 --> T8
  U4 --> T8
  U5 --> T8
  U6 --> T8
```

## Closed baseline

- SPIKE-AW-001 — DONE
- TASK-AW-001 — DONE
- TASK-AW-002 — DONE
- TASK-AW-003 — DONE (`make validate`: 155/155)
- TASK-AW-005 — DONE
- TASK-AW-006 — DONE (`make validate`: 169/169)
- TASK-AW-007 — DONE
- US-AW-001 + US-AW-002 — DONE (`make validate`: 149/149)
- US-AW-004 — DONE (`make validate`: 164/164)
- US-AW-005 — DONE (`make validate`: 169/169)
- US-AW-006 — DONE (`make validate`: 131/131)

## Current executable node

1. `PTL-TASK-AW-004 — Allowlisted prior-year initialization service` — **IN_REVIEW**
2. `PTL-US-AW-003 — Initialize from prior year` — **IN_REVIEW**

After a clean canonical validation, `PTL-TASK-AW-008` becomes fully ready for terminal Block 01 regression closure.

## Critical safety chain

```text
TASK-AW-001 [DONE]
 -> TASK-AW-005 [DONE]
 -> US-AW-006 [DONE]
 -> TASK-AW-008 [REACHED, WAITING ONLY ON PRIOR-YEAR INITIALIZATION VALIDATION]
```

## Block readiness verdict

All P0 functional behavior is closed. The final P1 functional slice is implemented and awaiting canonical validation; a clean gate advances directly to AW-008.
