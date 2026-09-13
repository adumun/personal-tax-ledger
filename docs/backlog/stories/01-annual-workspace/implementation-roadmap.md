# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / IMPLEMENTING WAVE B`  
**Date:** 2026-09-13  
**Scope:** first implementation push for `Block 01 — Annual Workspace & Tax Profile`

## Objective

Implement the first TAX block quickly while preserving current behavior: replace the implicit/global year setting with a first-class `AnnualTaxWorkspace` that becomes the visible, persistent and safe parent context for later TAX capabilities.

This roadmap is an implementation specification, not an execution board. Day-to-day assignment/status MAY live in GitHub Issues/Jira while preserving references back to this document.

## Decision

`GO`.

The foundational gates and persistence are closed, and the safety chain is actively being implemented:

- `PTL-SPIKE-AW-001` — DONE; five-dimension applicability allowlist accepted;
- SQLite migration assessment — PASS;
- `PTL-TASK-AW-001` — DONE; canonical `make validate` passes with 115/115 tests plus desktop and architecture checks;
- `PTL-TASK-AW-002` — DONE; canonical `make validate` passes with 118/118 tests plus desktop and architecture checks; merged to `master`;
- `PTL-TASK-AW-005` — IN_REVIEW on `feat/block-01-trusted-workspace-context`; implementation complete, canonical validation pending;
- `PTL-TASK-AW-007` — READY in parallel.

Evidence:

- [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md)
- [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md)
- [`task-aw-001-evidence.md`](task-aw-001-evidence.md)
- [`task-aw-002-evidence.md`](task-aw-002-evidence.md)
- [`task-aw-005-evidence.md`](task-aw-005-evidence.md)

Do not wait for Blocks 02–11 to be fully refined. Block 01 is a foundational enabler and delaying it increases migration cost because later income, evidence, expense, reconciliation, projection, health and closure capabilities all need a stable annual parent context.

## Deep dependency path

```text
PTL-TASK-AW-001  AnnualTaxWorkspace contract          [M]  DONE
        ↓
PTL-TASK-AW-002  Persistence + migration              [M]  DONE
        ↓
PTL-US-AW-002    Create annual workspace              [M]
        ↓
PTL-US-AW-004    Applicability profile                [M]
        ↓
PTL-US-AW-005    Workspace overview                   [M]
        ↓
PTL-TASK-AW-008  Block-level regression suite         [M]
```

The safety chain is a separate mandatory path and currently takes precedence over introducing visible year navigation.

## Mandatory parallel inputs

### For `PTL-US-AW-004`

- `PTL-SPIKE-AW-001 — Validate minimum annual applicability dimensions` `[S]` — **DONE**
- `PTL-TASK-AW-003 — TaxApplicabilityProfile schema and repository` `[M]`

### For `PTL-US-AW-002`

- `PTL-TASK-AW-007 — Supported-year and rule-availability policy` `[S]` — **READY**

## Critical safety chain

```text
PTL-TASK-AW-001  [DONE]
        ↓
PTL-TASK-AW-005  Trusted workspace context propagation [L] [IN_REVIEW]
        ↓
PTL-US-AW-006    Strict year isolation                 [M]
        ↓
PTL-TASK-AW-008
```

This chain MUST NOT be postponed until after UI navigation is introduced. It protects against stale asynchronous writes, stale responses, silent form rebinding and cross-year contamination.

Representative failure to prevent:

```text
open edit form in 2025
  -> switch active workspace to 2026
  -> save stale 2025 form
  -> record is incorrectly written into 2026
```

AW-005 now implements both sides of this protection:

```text
backend/application
  -> trusted AnnualWorkspaceContext
  -> year mismatch validation
  -> persisted entity-year validation
  -> active-context revalidation immediately before mutation

frontend
  -> workspace generation changes on annual transition
  -> older async responses are discarded
```

## Fast lane

### Wave A — Foundation — ACTIVE

1. `PTL-SPIKE-AW-001` — **DONE**
2. `PTL-TASK-AW-001` — **DONE**; canonical validation passed
3. `PTL-TASK-AW-007` — **READY**

### Wave B — Persistence & safe context — ACTIVE

1. `PTL-TASK-AW-002` `[M]` — **DONE**; persistence/migration merged and validated
2. `PTL-TASK-AW-003` `[M]` — not started
3. `PTL-TASK-AW-005` `[L]` — **IN_REVIEW**; implementation persisted in PR #13, `make validate` pending

### Vertical Slice 1 — First usable value

1. `PTL-US-AW-001 — Select workspace`
2. `PTL-US-AW-002 — Create workspace`
3. `PTL-US-AW-006 — Strict year isolation`

`PTL-US-AW-006` is the next critical node immediately after clean closure of AW-005.

The first visible target is achieved when PTL no longer treats year only as a hidden/global setting and instead exposes a safe annual workspace context.

### Vertical Slice 2 — Applicability & overview

1. `PTL-US-AW-004 — Applicability Profile`
2. `PTL-TASK-AW-006 — Annual workspace overview projection`
3. `PTL-US-AW-005 — Workspace overview`

### Parallel P1 branch

1. `PTL-TASK-AW-004 — Allowlisted prior-year initialization service`
2. `PTL-US-AW-003 — Initialize from prior year`

This branch is useful but MUST NOT block the first vertical slice.

### Closure

1. `PTL-TASK-AW-008 — Block-level automated regression suite`
2. effective DoR/DoD review;
3. dogfood evidence for `STD-WMS-STORY-001` and `STD-EXP-UIDEF-001`;
4. update dependency/estimate assumptions if implementation evidence differs from planning.

## Preliminary effort estimate

This is a planning estimate, not a delivery commitment.

| Work | Initial estimate | Current assessment |
|---|---:|---:|
| `SPIKE-AW-001` | 1–3 h | DONE |
| `TASK-AW-001` | 0.5–1 day | DONE; canonical validation passed |
| `TASK-AW-002` | 1–2 days | DONE; validated as M implementation |
| `TASK-AW-007` | 2–4 h | READY |
| `TASK-AW-003` | 0.5–1 day | unchanged |
| `TASK-AW-005` | 1–2 days | IN_REVIEW; implementation complete, canonical validation pending |
| `US-AW-001 + US-AW-002` | 0.5–1.5 days | unchanged |
| `US-AW-006` | included in vertical-slice estimate | next critical node after AW-005 |
| `US-AW-004` | 0.5–1 day | unchanged |
| `TASK-AW-006 + US-AW-005` | 0.5–1.5 days | unchanged |
| `TASK-AW-004 + US-AW-003` | 0.5–1 day | unchanged |
| `TASK-AW-008` | 1–2 days | unchanged |

Because several branches are parallelizable, these values MUST NOT be added linearly.

The original end-to-end estimate of **5–8 effective implementation days** remains a reasonable planning envelope. AW-005 has reduced the largest safety uncertainty, but the estimate should not be compressed before US-AW-006 demonstrates the behavior through the actual navigation/editing flow.

## Validated implementation baseline

The repository has material year scoping, and the following mechanics are now established:

- `settings.year` remains the current active-year compatibility source during Block 01 migration;
- `AnnualTaxWorkspace` metadata is first-class and persistent;
- workspace materialization uses only active settings + actual user-data years, never rule-catalog seed years alone;
- materialization is additive/idempotent and can safely rerun after a legacy year switch;
- existing fact tables are not copied or rewritten by workspace migration;
- application operations for income, BHE/fee configuration, mortgages, annual mortgage records and active-year tax parameters consume a trusted `AnnualWorkspaceContext` on the AW-005 branch;
- `tax_rule_sources` remains a provider/rule catalog and is not treated as user workspace ownership.

## Resolved gates

### A — Applicability profile

`PASS / CLOSED`.

Accepted Block 01 dimensions:

```text
DEPENDENT_INCOME
DOMESTIC_FEE_INCOME
FOREIGN_SERVICE_INCOME
APV_CONTRIBUTIONS
MORTGAGE_INTEREST
```

### B — SQLite migration mechanism

`PASS / CLOSED`.

Deterministic materialization uses:

```text
settings.year
+ income_sources.tax_year
+ fee_receipts.tax_year
+ fee_expense_settings.tax_year
+ mortgage_loans.tax_year
+ mortgage_annual_records.tax_year
```

It does not create user workspaces solely from `tax_parameters` or `tax_rule_sources` seed years.

### C — AnnualTaxWorkspace contract validation

`PASS / CLOSED`.

```text
make validate
  -> typecheck PASS
  -> tests 115/115 PASS
  -> desktop:check PASS
  -> architecture:check PASS
```

### D — Annual workspace persistence/migration validation

`PASS / CLOSED`.

```text
make validate
  -> typecheck PASS
  -> tests 118/118 PASS
  -> desktop:check PASS
  -> architecture:check PASS
```

`PTL-TASK-AW-002` is DONE and merged to `master`.

## AW-005 implementation checkpoint

The trusted-context branch currently delivers:

- explicit `AnnualWorkspaceContext` with `annualWorkspaceId` and `commercialYear`;
- dynamic active-context resolver based on `settings.year` + `AnnualTaxWorkspaceRepository`;
- application-boundary year validation across mutable annual domains;
- update/delete validation against the persisted entity's own year;
- second active-context check immediately before mutation to catch request races;
- HTTP `409 workspace_year_mismatch` conflict semantics;
- stale frontend response suppression through annual-workspace generation;
- automatic annual workspace/year enrichment of execution logs;
- compatibility materialization after legacy `settings.year` switching;
- focused tests for stale input, race revalidation, cross-year entity access, tax parameters, logging and HTTP conflict semantics.

Evidence: [`task-aw-005-evidence.md`](task-aw-005-evidence.md).

Closure gate:

```text
make validate
```

Until it passes, AW-005 remains `IN_REVIEW` and PR #13 remains Draft.

## Explicitly not on this path

The first push does not wait for or implement:

- Annual Tax Health;
- SII reconciliation;
- Expense Eligibility;
- Document Intelligence / Cloud;
- complete tax-calculation expansion;
- optimization/planner capabilities;
- tax-year closure/reopen;
- Blocks 02–11 generally.

`US-AW-003` is P1 and may follow the first usable vertical slice.

## Success criterion for the first push

PTL moves from:

```text
implicit global settings.year
```

to:

```text
visible + persistent + canonical AnnualTaxWorkspace
  -> safe active workspace context
  -> explicit commercial year
  -> derived Operación Renta label
  -> strict cross-year isolation
```

with no regression in current income, BHE, mortgage or tax-parameter behavior.

## References

- [`README.md`](README.md)
- [`user-stories.md`](user-stories.md)
- [`design-contract.md`](design-contract.md)
- [`enablers-and-dependencies.md`](enablers-and-dependencies.md)
- [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md)
- [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md)
- [`task-aw-001-evidence.md`](task-aw-001-evidence.md)
- [`task-aw-002-evidence.md`](task-aw-002-evidence.md)
- [`task-aw-005-evidence.md`](task-aw-005-evidence.md)
- [`../../story-definition-and-implementation-readiness.md`](../../story-definition-and-implementation-readiness.md)
- [`../../tax-management-expansion.md`](../../tax-management-expansion.md)

## Work Management note

This roadmap belongs in the repository because it is coupled to the implementation contract, dependencies, migrations, design and acceptance. It MUST NOT become a competing execution board. If GitHub Issues/Jira are used for execution, those work items SHOULD cross-reference the canonical Story/Task/Spike definitions and this roadmap.
