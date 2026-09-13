# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / IMPLEMENTING WAVE A`  
**Date:** 2026-09-12  
**Scope:** first implementation push for `Block 01 — Annual Workspace & Tax Profile`

## Objective

Implement the first TAX block quickly while preserving current behavior: replace the implicit/global year setting with a first-class `AnnualTaxWorkspace` that becomes the visible, persistent and safe parent context for later TAX capabilities.

This roadmap is an implementation specification, not an execution board. Day-to-day assignment/status MAY live in GitHub Issues/Jira while preserving references back to this document.

## Decision

`GO`.

The original start gates and the AW-001 validation gate are resolved:

- `PTL-SPIKE-AW-001` — DONE; five-dimension applicability allowlist accepted;
- SQLite migration assessment — PASS; additive/idempotent workspace materialization is viable and `PTL-TASK-AW-002` is revised `L -> M`;
- `PTL-TASK-AW-001` — DONE; canonical `make validate` passes with 115/115 tests plus desktop and architecture checks.

Evidence:

- [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md)
- [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md)
- [`task-aw-001-evidence.md`](task-aw-001-evidence.md)

Do not wait for Blocks 02–11 to be fully refined. Block 01 is a foundational enabler and delaying it increases migration cost because later income, evidence, expense, reconciliation, projection, health and closure capabilities all need a stable annual parent context.

## Deep dependency path

```text
PTL-TASK-AW-001  AnnualTaxWorkspace contract          [M]  DONE
        ↓
PTL-TASK-AW-002  Persistence + migration              [M]  READY
        ↓
PTL-US-AW-002    Create annual workspace              [M]
        ↓
PTL-US-AW-004    Applicability profile                [M]
        ↓
PTL-US-AW-005    Workspace overview                   [M]
        ↓
PTL-TASK-AW-008  Block-level regression suite         [M]
```

This is the current deepest hard-dependency chain. It is not yet a temporal CPM result because estimates remain relative/preliminary.

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
PTL-TASK-AW-005  Trusted workspace context propagation [L]
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

## Fast lane

### Wave A — Foundation — ACTIVE

1. `PTL-SPIKE-AW-001` — **DONE**
2. `PTL-TASK-AW-001` — **DONE**; canonical `make validate` passes: 115/115 tests, desktop check and architecture check clean
3. `PTL-TASK-AW-007` — **READY**

### Wave B — Persistence & safe context

1. `PTL-TASK-AW-002` `[M]` — **READY**; migration gate closed
2. `PTL-TASK-AW-003` `[M]`
3. `PTL-TASK-AW-005` `[L]`

### Vertical Slice 1 — First usable value

1. `PTL-US-AW-001 — Select workspace`
2. `PTL-US-AW-002 — Create workspace`
3. `PTL-US-AW-006 — Strict year isolation`

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
| `TASK-AW-002` | 1–2 days | **0.5–1 day / M**, READY, subject to legacy-fixture validation |
| `TASK-AW-007` | 2–4 h | READY |
| `TASK-AW-003` | 0.5–1 day | unchanged |
| `TASK-AW-005` | 1–2 days | unchanged |
| `US-AW-001 + US-AW-002` | 0.5–1.5 days | unchanged |
| `US-AW-004` | 0.5–1 day | unchanged |
| `TASK-AW-006 + US-AW-005` | 0.5–1.5 days | unchanged |
| `TASK-AW-004 + US-AW-003` | 0.5–1 day | unchanged |
| `TASK-AW-008` | 1–2 days | unchanged |

Because several branches are parallelizable, these values MUST NOT be added linearly.

The original end-to-end estimate of **5–8 effective implementation days** remains a reasonable planning envelope. The migration review reduces uncertainty but does not justify compressing the entire block estimate before the safety-context work (`PTL-TASK-AW-005` / `PTL-US-AW-006`) is implemented and evidenced.

## Validated implementation baseline

The repository really does have material year scoping, but the exact mechanics matter:

- `settings.year` is persisted as JSON in the singleton settings row and remains the current active-year compatibility source;
- `taxYear`/`tax_year` scopes income sources, fee receipts, fee expense settings, mortgages, mortgage annual records and tax catalogs;
- the current SQLite schema evolves at startup through `CREATE ... IF NOT EXISTS`, `PRAGMA table_info` and additive `ALTER TABLE`; there is no persisted ordered migration-version framework;
- `listYears()` currently unions user-data years and rule-catalog years, so it cannot be reused blindly for workspace materialization;
- seeded `tax_parameters` / `tax_rule_sources` years represent rule availability, not proof that the user owns a workspace for that year;
- existing fact tables do not need to be copied or rewritten to materialize `AnnualTaxWorkspace` metadata.

Detailed evidence is in [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md).

## Resolved start gates

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

Removed from the profile:

- actual-expense evaluation/election;
- AFP/health applicability flag.

The profile remains expectation/applicability, never actual tax facts. Canonical-fact conflicts produce `NEEDS_REVIEW`, not destructive reconciliation.

### B — SQLite migration mechanism

`PASS / CLOSED`.

Deterministic materialization must use:

```text
settings.year
+ income_sources.tax_year
+ fee_receipts.tax_year
+ fee_expense_settings.tax_year
+ mortgage_loans.tax_year
+ mortgage_annual_records.tax_year
```

It must not create user workspaces solely from `tax_parameters` or `tax_rule_sources` seed years.

`settings.year` remains the active workspace during compatibility migration. No tax facts are copied implicitly.

### C — AnnualTaxWorkspace contract validation

`PASS / CLOSED`.

Canonical repository validation executed successfully:

```text
make validate
  -> typecheck PASS
  -> tests 115/115 PASS
  -> desktop:check PASS
  -> architecture:check PASS
```

`PTL-TASK-AW-001` is DONE and no longer blocks persistence/migration.

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
- [`../../story-definition-and-implementation-readiness.md`](../../story-definition-and-implementation-readiness.md)
- [`../../tax-management-expansion.md`](../../tax-management-expansion.md)

## Work Management note

This roadmap belongs in the repository because it is coupled to the implementation contract, dependencies, migrations, design and acceptance. It MUST NOT become a competing execution board. If GitHub Issues/Jira are used for execution, those work items SHOULD cross-reference the canonical Story/Task/Spike definitions and this roadmap.