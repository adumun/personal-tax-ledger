# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / REFINING`  
**Date:** 2026-09-12  
**Scope:** first implementation push for `Block 01 — Annual Workspace & Tax Profile`

## Objective

Implement the first TAX block quickly while preserving current behavior: replace the implicit/global year setting with a first-class `AnnualTaxWorkspace` that becomes the visible, persistent and safe parent context for later TAX capabilities.

This roadmap is an implementation specification, not an execution board. Day-to-day assignment/status MAY live in GitHub Issues/Jira while preserving references back to this document.

## Decision

`GO`.

Do not wait for Blocks 02–11 to be fully refined. Block 01 is a foundational enabler and delaying it increases migration cost because later income, evidence, expense, reconciliation, projection, health and closure capabilities all need a stable annual parent context.

## Deep dependency path

```text
PTL-TASK-AW-001  AnnualTaxWorkspace contract          [M]
        ↓
PTL-TASK-AW-002  Persistence + migration              [L]
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

- `PTL-SPIKE-AW-001 — Validate minimum annual applicability dimensions` `[S]`
- `PTL-TASK-AW-003 — TaxApplicabilityProfile schema and repository` `[M]`

### For `PTL-US-AW-002`

- `PTL-TASK-AW-007 — Supported-year and rule-availability policy` `[S]`

## Critical safety chain

```text
PTL-TASK-AW-001
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

### Wave A — Foundation

Run these as early as possible and largely in parallel after contract alignment:

1. `PTL-SPIKE-AW-001`
2. `PTL-TASK-AW-001`
3. `PTL-TASK-AW-007`

### Wave B — Persistence & safe context

1. `PTL-TASK-AW-002`
2. `PTL-TASK-AW-003`
3. `PTL-TASK-AW-005`

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

| Work | Initial estimate |
|---|---:|
| `SPIKE-AW-001` | 1–3 h |
| `TASK-AW-001` | 0.5–1 day |
| `TASK-AW-002` | 1–2 days |
| `TASK-AW-007` | 2–4 h |
| `TASK-AW-003` | 0.5–1 day |
| `TASK-AW-005` | 1–2 days |
| `US-AW-001 + US-AW-002` | 0.5–1.5 days |
| `US-AW-004` | 0.5–1 day |
| `TASK-AW-006 + US-AW-005` | 0.5–1.5 days |
| `TASK-AW-004 + US-AW-003` | 0.5–1 day |
| `TASK-AW-008` | 1–2 days |

Because several branches are parallelizable, these values MUST NOT be added linearly.

Initial end-to-end estimate for one focused implementer: **5–8 effective implementation days**, conditional on the SQLite migration being straightforward and no major hidden structural debt being discovered.

## Why the estimate is plausible

The repository already has material year scoping:

- `settings.year`;
- `taxYear` on multiple domain/application contracts;
- year-filtered incomes, fee receipts, mortgages and annual records;
- year-scoped tax parameters;
- `listYears()` / year switching behavior;
- separate SQLite repositories for core aggregates.

Therefore the work is primarily to make annual context first-class and safe rather than retrofit the notion of year into a year-agnostic product.

## Start gates

Before implementation moves beyond Wave A:

1. resolve `PTL-SPIKE-AW-001`;
2. inspect the actual schema/migration mechanism in `packages/sqlite-adapter/src/database/database.mjs`;
3. define deterministic migration from current `settings.year`/existing years into `AnnualTaxWorkspace` without duplication or loss;
4. preserve current year-scoped behavior for income, fee receipts, mortgages and tax parameters;
5. implement `TASK-AW-005` / `US-AW-006` alongside annual navigation, not afterward.

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
- [`../../story-definition-and-implementation-readiness.md`](../../story-definition-and-implementation-readiness.md)
- [`../../tax-management-expansion.md`](../../tax-management-expansion.md)

## Work Management note

This roadmap belongs in the repository because it is coupled to the implementation contract, dependencies, migrations, design and acceptance. It MUST NOT become a competing execution board. If GitHub Issues/Jira are used for execution, those work items SHOULD cross-reference the canonical Story/Task/Spike definitions and this roadmap.