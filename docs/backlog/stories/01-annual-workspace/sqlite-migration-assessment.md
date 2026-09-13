# Block 01 — SQLite Migration Assessment

**Status:** CLOSED START GATE  
**Date:** 2026-09-12  
**Primary target:** `PTL-TASK-AW-002` readiness review

## Scope reviewed

Primary implementation:

- `packages/sqlite-adapter/src/database/database.mjs`
- existing SQLite repositories and `YearRepository`
- current `settings.year` behavior
- current year-scoped tables and `listYears()` behavior

This assessment intentionally does not implement `PTL-TASK-AW-002`.

## Current schema evolution mechanism

PTL does not currently have an ordered migration framework or a persisted schema-version table.

Schema evolution runs during database startup through idempotent/adaptive DDL:

- `CREATE TABLE IF NOT EXISTS ...`;
- `CREATE INDEX IF NOT EXISTS ...`;
- `PRAGMA table_info(...)` to inspect an existing table;
- additive `ALTER TABLE ... ADD COLUMN ...` when a column is absent;
- idempotent seed/upsert logic.

Existing examples include addition of `income_sources.tax_year` and `execution_logs.audit_message`.

### Consequence

Block 01 should not silently introduce a second unrelated migration mechanism solely for `AnnualTaxWorkspace`. The first implementation may remain compatible with the current startup migration style, but `TASK-AW-002` must make the Annual Workspace migration explicitly idempotent and testable. A dedicated schema-version framework can be evaluated separately if/when non-additive migrations make the present approach unsafe.

## Existing year sources

The current database can reconstruct known commercial years without modifying tax facts. `listYears()` obtains distinct `tax_year` values from:

- `fee_receipts`;
- `mortgage_loans`;
- `mortgage_annual_records`;
- `income_sources`;
- `fee_expense_settings`;
- `tax_rule_sources`;
- `tax_parameters`;

and always adds `settings.year`.

This is sufficient to discover the current year universe for deterministic workspace materialization.

## Materialization decision

Introduce a new `annual_tax_workspaces` table keyed uniquely by `commercial_year`.

Migration algorithm:

1. collect the distinct existing years using the same semantic source set as `listYears()`;
2. include current `settings.year` even when no year-scoped facts exist yet;
3. for each discovered commercial year, insert one workspace if absent;
4. never update, copy or duplicate existing income/BHE/mortgage/tax-parameter rows as part of workspace materialization;
5. derive Operación Renta / `AT` from `commercial_year`; do not persist an independently editable tax-year label;
6. preserve `settings.year` as the active workspace selection during compatibility migration;
7. make the migration rerunnable through a unique constraint + `INSERT ... ON CONFLICT DO NOTHING` (or equivalent deterministic behavior).

## Proposed persisted shape for TASK-AW-002

The persistence shape must implement, not redefine, the domain contract from `PTL-TASK-AW-001`.

Minimum columns:

```text
annual_tax_workspaces
  id TEXT PRIMARY KEY
  commercial_year INTEGER NOT NULL UNIQUE
  lifecycle_state TEXT NOT NULL
  rule_version_ref TEXT NULL
  created_at TEXT NOT NULL
  updated_at TEXT NOT NULL
```

`derivedTaxYearLabel` is computed outside persistence.

No foreign keys from existing fact tables are required in this migration. Existing `tax_year` columns remain authoritative scoping fields until later work explicitly migrates them. Adding a workspace table must therefore be non-destructive and compatible with current repositories.

## Active workspace compatibility

`settings.year` remains the compatibility source for the active annual context until the workspace-selection application flow is introduced.

Migration rule:

```text
active workspace commercialYear = settings.year
```

Do not rewrite `settings.year` during materialization. Later Block 01 work may wrap or replace how active context is exposed, but migration must preserve the user's currently selected year.

## No implicit copying of facts

Materializing a workspace is metadata creation only.

It must not call `copyIncomeSources()` and must not clone BHE, mortgages, annual mortgage records, parameters, evidence, calculations or other facts. Prior-year initialization remains a separate explicit P1 flow governed by `PTL-TASK-AW-004` / `PTL-US-AW-003`.

## Risks

### R1 — No persisted schema version

Current startup migrations rely on structural inspection rather than ordered migration history. Risk is manageable for this additive table, but tests must prove existing databases upgrade idempotently.

### R2 — Rule catalog years are included by `listYears()`

`tax_parameters` and `tax_rule_sources` may contain seeded years even when the user has no transactional data for those periods. Blindly treating every catalog year as a user workspace would create phantom workspaces.

**Decision:** workspace discovery must distinguish `user/data years` from `rule availability years`.

Materialization sources for actual workspace creation should be:

- `settings.year`;
- `income_sources.tax_year`;
- `fee_receipts.tax_year`;
- `fee_expense_settings.tax_year`;
- `mortgage_loans.tax_year`;
- `mortgage_annual_records.tax_year`.

`tax_parameters` and `tax_rule_sources` inform `TASK-AW-007` supported-year policy but must not independently create user workspaces.

### R3 — Legacy `income_sources.tax_year` backfill

When the column was first added, old rows received `defaultSettings.year`, not necessarily the then-active persisted `settings.year`. Existing installations created before that migration may therefore contain imperfect historical attribution. Block 01 must preserve existing persisted attribution rather than inventing corrections without evidence.

### R4 — Partial startup failure

Startup DDL currently executes as multiple statements without an explicit encompassing migration transaction. `TASK-AW-002` should make workspace materialization atomic enough that a failed start does not leave duplicate or contradictory rows. Additive `CREATE TABLE` plus idempotent inserts keeps recovery straightforward.

### R5 — `settings.year` and workspace table divergence

Until active-workspace selection is fully migrated, both representations coexist. The compatibility layer must validate that `settings.year` maps to a real workspace and repair only missing workspace metadata, never tax facts.

## Sizing verdict for PTL-TASK-AW-002

Previous size: **L**.

Revised size: **M**.

Rationale:

- migration is additive rather than transformational;
- existing year-scoped tables already preserve commercial-year identity;
- deterministic discovery is available;
- no fact-table rewrites or backfills are required;
- active selection can remain compatible with `settings.year`;
- the main non-trivial work is separating user/data years from seeded rule-catalog years and proving idempotent upgrade behavior.

Escalate back to `L` only if implementation discovers existing databases with schema variants that cannot be handled additively or if a non-additive migration becomes necessary.

## Start-gate verdict

The SQLite start gate is **PASS**.

`PTL-TASK-AW-002` is now sufficiently understood to enter Wave B after `PTL-TASK-AW-001` establishes the domain/application contract. `PTL-TASK-AW-002` itself remains intentionally unimplemented at this point.