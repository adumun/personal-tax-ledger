# Block 01 — Enablers, Spikes & Dependencies

**Status:** `IMPLEMENTING / WAVE A READY`

This file separates actor-visible Stories from technical enabling work according to `STD-WMS-001` / `STD-WMS-TYPES-001`. No `Technical Story` type is introduced.

## Enabling Tasks

### PTL-TASK-AW-001 — AnnualTaxWorkspace domain/application contract

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** IN_REVIEW

Define a first-class annual workspace contract keyed by `commercialYear` and suitable for all TAX capabilities.

Minimum semantics:

```text
AnnualTaxWorkspace
  id
  commercialYear
  derivedTaxYearLabel
  lifecycleState
  createdAt
  updatedAt
  ruleVersionRef
```

Constraints:

- `derivedTaxYearLabel` is derived, not independently editable;
- the contract does not absorb income/evidence/calculation entities;
- lifecycle must be compatible with future TAX-11 without implementing close/reopen here.

Validation/closure evidence: [`task-aw-001-evidence.md`](task-aw-001-evidence.md).

**Enables:** AW-001, AW-002, AW-006.

---

### PTL-TASK-AW-002 — Persistence and migration from implicit settings.year

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0  
**Status:** READY AFTER TASK-AW-001

Introduce workspace persistence/read APIs and migrate the existing implicit year model without losing current year-scoped data.

Required outcomes:

- discover existing distinct commercial years from persisted user/domain data and `settings.year`;
- do not materialize user workspaces solely from seeded rule-catalog years;
- materialize compatible workspace records deterministically;
- preserve current active year selection;
- no duplicate income/BHE/mortgage records;
- migration is rerunnable/idempotent or explicitly versioned;
- backup/restore compatibility is considered with existing local workspace behavior.

Migration review and sizing evidence: [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md).

**Sizing change:** `L -> M` after schema inspection showed an additive/idempotent migration with no required fact-table rewrite. Escalate to L only if implementation discovers incompatible legacy schema variants or a non-additive migration becomes necessary.

**Enables:** AW-001, AW-002, AW-006.

---

### PTL-TASK-AW-003 — TaxApplicabilityProfile schema and repository

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0

Persist annual applicability independently from actual facts.

Conceptual contract:

```text
TaxApplicabilityProfile
  workspaceId
  dimensions[]
    key
    applicability: YES | NO | UNKNOWN
    source: USER_DECLARED | COPIED_PROPOSAL | DERIVED_CONFLICT
    updatedAt
```

The accepted Block 01 dimension allowlist is defined by [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md). Do not duplicate amounts or computed tax values.

**Enables:** AW-003, AW-004, AW-005.

---

### PTL-TASK-AW-004 — Allowlisted prior-year initialization service

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P1

Create a service that copies only explicitly allowlisted reusable configuration and produces provenance for every copied proposal/template.

Forbidden implementation pattern:

```text
copy all rows where tax_year = source into target year
```

The service must be category-aware and safe as the domain expands.

**Enables:** AW-003.

---

### PTL-TASK-AW-005 — Trusted workspace context propagation

**Type:** Task  
**Role:** ENABLER  
**Size:** L  
**Priority:** P0

Ensure UI, application services and year-scoped persistence operations consume a stable active-workspace identity and protect against stale async writes.

Required concerns:

- request/use-case context includes workspace/year identity;
- stale response suppression or request generation/versioning;
- mismatch validation at application boundary;
- year is logged in material operations;
- open forms cannot silently rebind to another year.

**Enables:** AW-006 and safe downstream TAX blocks.

---

### PTL-TASK-AW-006 — Annual workspace overview projection

**Type:** Task  
**Role:** ENABLER  
**Size:** M  
**Priority:** P0

Build a read model for AW-005 that aggregates structural presence/counts without becoming Annual Tax Health.

Candidate fields:

```text
commercialYear
operationRentaLabel
lifecycleState
profileAnsweredCount
profileUnknownCount
incomeSourceCount
feeReceiptCount
mortgageCount
evidenceCapabilityState
ruleVersionRef
parametersState
lastUpdatedAt
```

**Enables:** AW-005.

---

### PTL-TASK-AW-007 — Supported-year and rule-availability policy

**Type:** Task  
**Role:** ENABLER  
**Size:** S  
**Priority:** P0

Define provider-neutral behavior for creating/opening a commercial year for which PTL lacks a compatible rule set.

Required decision states:

- SUPPORTED;
- SUPPORTED_WITH_WARNINGS;
- UNSUPPORTED.

This Task must consume current tax-rule configuration/version capabilities rather than hard-code UI-only year limits.

**Enables:** AW-002.

---

### PTL-TASK-AW-008 — Block-level automated regression suite

**Type:** Task  
**Role:** QUALITY_ENABLER  
**Size:** M  
**Priority:** P0

Create tests covering:

- migration from current implicit-year persistence;
- select/create year;
- duplicate year;
- year isolation;
- stale async response/write protection;
- prior-year initialization allowlist;
- tri-state applicability profile;
- workspace overview projection.

**Requires:** implementation Tasks above.  
**Enables:** block DoD.

## Spike

### PTL-SPIKE-AW-001 — Validate minimum annual applicability dimensions

**Type:** Spike  
**Size:** S  
**Priority:** P0  
**Status:** DONE  
**Closed:** 2026-09-12

Decision and evidence: [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md).

Accepted dimensions:

- `DEPENDENT_INCOME`;
- `DOMESTIC_FEE_INCOME`;
- `FOREIGN_SERVICE_INCOME`;
- `APV_CONTRIBUTIONS`;
- `MORTGAGE_INTEREST`.

Rejected from the profile because they belong to or are derivable from other domains:

- actual-expense evaluation/election;
- AFP/health information applicability.

`Applicability profile != actual tax facts` remains the governing invariant.

## Dependency graph

```mermaid
flowchart LR
  T1[AW-TASK-001\nWorkspace contract] --> T2[AW-TASK-002\nPersistence migration]
  T1 --> T5[AW-TASK-005\nContext propagation]
  T1 --> U1[AW-US-001\nSelect workspace]
  T2 --> U1

  T1 --> U2[AW-US-002\nCreate workspace]
  T2 --> U2
  T7[AW-TASK-007\nRule availability] --> U2

  U2 --> U3[AW-US-003\nInitialize from prior]
  T3[AW-TASK-003\nApplicability profile] --> U3
  T4[AW-TASK-004\nInitialization service] --> U3

  S1[AW-SPIKE-001\nProfile dimensions DONE] --> U4[AW-US-004\nApplicability profile]
  U2 --> U4
  T3 --> U4

  U1 --> U5[AW-US-005\nWorkspace overview]
  U4 --> U5
  T6[AW-TASK-006\nOverview projection] --> U5

  T1 --> U6[AW-US-006\nYear isolation]
  T2 --> U6
  T5 --> U6

  U1 --> T8[AW-TASK-008\nRegression suite]
  U2 --> T8
  U3 --> T8
  U4 --> T8
  U5 --> T8
  U6 --> T8
```

## Typed edges of interest

| From | Relation | To | Why |
|---|---|---|---|
| TASK-001 | ENABLES | US-001/002/006 | canonical workspace identity |
| TASK-002 | INFRA_DEPENDS_ON | US-001/002/006 | persistence/migration |
| TASK-003 | DATA_DEPENDS_ON | US-003/004/005 | profile model |
| SPIKE-001 | RULE_DEPENDS_ON | US-004 | profile scope resolved 2026-09-12 |
| TASK-005 | ENABLES | US-006 | safe active context |
| US-004 | ENABLES | US-005 | overview needs profile status |

## Fast lane waves

### Wave A — Foundation — READY / IN REVIEW

- SPIKE-001 — DONE
- TASK-001 — IN_REVIEW (focused tests 4/4; full `make validate` pending complete checkout)
- TASK-007 — READY

### Wave B — Persistence & context

- TASK-002 — READY after TASK-001 (`M` after migration review)
- TASK-003
- TASK-005

### Vertical Slice 1 — First usable value

- US-001
- US-002
- US-006

### Vertical Slice 2 — Applicability & overview

- US-004
- TASK-006
- US-005

### P1 parallel branch

- TASK-004
- US-003

### Closure

- TASK-008
- effective DoR/DoD review
- dogfood evidence and deviations

## Critical safety chain

This sequence remains mandatory and must not be postponed:

```text
TASK-001
 -> TASK-005
 -> US-006
 -> TASK-008
```

## Block readiness verdict

**Wave A is READY.** The two immediate start gates are closed:

1. `PTL-SPIKE-AW-001` has a documented decision and no remaining Block 01 uncertainty;
2. SQLite schema/migration behavior has been inspected against the real implementation and `TASK-AW-002` has a deterministic migration plan.

The complete block is not declared DONE/READY as a whole; downstream Stories still depend on their enabling Tasks and effective DoR. Implementation may proceed through the defined fast lane while preserving the safety chain.