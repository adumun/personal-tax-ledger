# PTL-TASK-AW-002 — Persistence & Migration Evidence

**Type:** Task  
**Status:** DONE  
**Date:** 2026-09-12  
**Closed:** 2026-09-13  
**Branch:** `feat/block-01-annual-workspace-persistence`  
**PR:** `#12`

## Scope delivered

The implementation introduces a SQLite-backed `AnnualTaxWorkspaceRepository` without rewriting existing fact tables.

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

## Automated coverage

`test/annual-tax-workspace-sqlite.test.mjs` covers:

1. materialization from active settings + real user-data years while rejecting rule-seed-only phantom years;
2. idempotent repository reopening/materialization without duplicate annual rows;
3. explicit workspace metadata creation without copying `income_sources` and without changing `settings.year`.

## Canonical validation

Executed from a complete local checkout of the branch:

```text
make validate
  -> typecheck PASS
  -> tests 118/118 PASS
  -> failures 0
  -> desktop:check PASS
  -> architecture:check PASS
```

The new SQLite migration tests all pass and the complete repository suite remains green.

## Closure verdict

`PTL-TASK-AW-002` is **DONE**.

Confirmed outcomes:

- persistence is additive and rerunnable;
- reopening the same SQLite database is idempotent;
- `settings.year` retains compatibility semantics;
- seeded tax-rule years do not become phantom user workspaces;
- no existing income/BHE/mortgage facts are duplicated or rewritten;
- explicit workspace creation persists annual metadata only and does not switch the active compatibility year.

UI navigation and stale-write protection remain intentionally outside this Task. The next safety-critical node is `PTL-TASK-AW-005`, followed by `PTL-US-AW-006`.
