# PTL-TASK-AW-002 — Persistence & Migration Evidence

**Type:** Task  
**Status:** IN_PROGRESS  
**Date:** 2026-09-12  
**Branch:** `feat/block-01-annual-workspace-persistence`

## Scope implemented in this branch

The first implementation slice introduces a SQLite-backed `AnnualTaxWorkspaceRepository` without rewriting existing fact tables.

Delivered:

- additive `annual_tax_workspaces` metadata persistence;
- one workspace per canonical `commercial_year` through a database uniqueness constraint;
- deterministic materialization from `settings.year` plus years present in user/domain fact tables;
- explicit exclusion of `tax_parameters` and `tax_rule_sources` as workspace-discovery sources;
- list/get/create repository operations through the contract introduced by `PTL-TASK-AW-001`;
- derived `AT` label remains a core concern and is not persisted as a second editable year;
- no implicit income/BHE/mortgage copying;
- active `settings.year` is read but not modified by materialization or metadata creation.

## Materialization sources

Only these sources may cause a workspace to exist during compatibility migration:

```text
settings.year
income_sources.tax_year
fee_receipts.tax_year
fee_expense_settings.tax_year
mortgage_loans.tax_year
mortgage_annual_records.tax_year
```

The following are explicitly excluded from workspace ownership discovery:

```text
tax_parameters.tax_year
tax_rule_sources.tax_year
```

Those tables express available tax rules, not evidence that the user owns an annual workspace.

## Migration semantics

The repository ensures the metadata table using additive/idempotent SQLite DDL and materializes missing annual rows with:

```text
ON CONFLICT(commercial_year) DO NOTHING
```

Legacy fact rows are never rewritten as part of workspace materialization.

A deterministic migration-created id uses:

```text
annual-tax-workspace-{commercialYear}
```

The table persists:

```text
id
commercial_year
lifecycle_state
rule_version_ref
created_at
updated_at
```

`derivedTaxYearLabel` is reconstructed by Tax Core from `commercialYear`.

## Focused automated coverage added

`test/annual-tax-workspace-sqlite.test.mjs` covers:

1. materialization from active settings + real user-data years while rejecting rule-seed-only phantom years;
2. idempotent repository reopening/materialization without duplicate annual rows;
3. explicit workspace metadata creation without copying `income_sources` and without changing `settings.year`.

## Validation state

The branch has been reviewed structurally against the repository contracts and architecture.

A network-isolated execution environment could not clone the GitHub branch, so repository-wide runtime validation is intentionally **not** claimed here.

Closure gate remains:

```text
make validate
```

from a complete local checkout of this branch.

Until that gate passes, `PTL-TASK-AW-002` remains `IN_PROGRESS`, not `DONE`.

## Remaining AW-002 checks before closure

- execute canonical full validation;
- correct any integration/test failure in the same branch/PR;
- confirm reopening the same on-disk SQLite database remains idempotent under the complete suite;
- retain `settings.year` compatibility semantics;
- do not introduce UI navigation or stale-write protection here; those belong to subsequent nodes, especially `PTL-TASK-AW-005` / `PTL-US-AW-006`.
