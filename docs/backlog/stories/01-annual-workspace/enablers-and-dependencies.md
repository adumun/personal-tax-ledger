# Block 01 — Enablers, Spikes & Dependencies

**Status:** `IMPLEMENTING / ALL FUNCTIONAL SLICES CLOSED`

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

---

### PTL-TASK-AW-004 — Allowlisted prior-year initialization service

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P1  
**Status:** DONE

Explicit reusable-category allowlist with `APPLICABILITY_PROFILE` as a revisable proposal; explicit forbidden-copy catalog; separate persisted provenance; idempotent repeat; rollback and prior active-year restoration after partial failure; no transactional repository discovery/inference.

Evidence: [`task-aw-004-evidence.md`](task-aw-004-evidence.md). Canonical `make validate`: PASS after reconciling the stale AW-002 frontend assertion.

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
**Status:** READY

Terminal Block 01 quality gate. Required regression coverage is now available for:

- migration from implicit-year persistence;
- select/create year and duplicate-year behavior;
- strict year isolation and stale async protection;
- supported-year policy;
- tri-state applicability profile and conflict behavior;
- workspace overview projection;
- prior-year initialization allowlist, provenance, idempotency and rollback.

AW-008 must now consolidate/verify the complete block regression contract and close effective DoD/dogfood evidence without redefining feature semantics.

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

  U2 --> U3[AW-US-003\nDONE]
  T3[AW-TASK-003\nDONE] --> U3
  T4[AW-TASK-004\nDONE] --> U3

  S1[AW-SPIKE-001\nDONE] --> U4[AW-US-004\nDONE]
  U2 --> U4
  T3 --> U4

  U1 --> U5[AW-US-005\nDONE]
  U4 --> U5
  T6[AW-TASK-006\nDONE] --> U5

  U1 --> T8[AW-TASK-008\nREADY]
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
- TASK-AW-004 — DONE (`make validate`: PASS)
- TASK-AW-005 — DONE
- TASK-AW-006 — DONE (`make validate`: 169/169)
- TASK-AW-007 — DONE
- US-AW-001 + US-AW-002 — DONE (`make validate`: 149/149)
- US-AW-003 — DONE (`make validate`: PASS)
- US-AW-004 — DONE (`make validate`: 164/164)
- US-AW-005 — DONE (`make validate`: 169/169)
- US-AW-006 — DONE (`make validate`: 131/131)

## Current executable node

`PTL-TASK-AW-008 — Block-level automated regression suite` — **READY**.

## Critical safety chain

```text
TASK-AW-001 [DONE]
 -> TASK-AW-005 [DONE]
 -> US-AW-006 [DONE]
 -> TASK-AW-008 [READY / TERMINAL GATE]
```

## Block readiness verdict

All functional Block 01 Stories and enabling Tasks except the terminal quality enabler are implemented and canonically validated. AW-008 is now the sole remaining closure item.
