# Block 01 — Annual Workspace & Tax Profile

**Status:** `DOGFOOD / FIRST VISIBLE SLICE CLOSED`  
**Primary capability:** `TAX-01 — Annual Tax Workspace`  
**Related capabilities:** `TAX-02`, `TAX-06`, `TAX-09`, `TAX-10`, `TAX-11`, `TAX-12`  
**Story standard:** `STD-WMS-STORY-001@0.1.0-draft`  
**UI definition standard:** `STD-EXP-UIDEF-001@0.1.0-draft`

## Objective

Turn the current implicit `settings.year` behavior into an explicit annual tax workspace that becomes the stable parent context for all tax facts, evidence, calculations, projections and later year closure.

The block is deliberately narrow: it establishes annual identity, year selection/creation, explicit prior-year initialization, applicability profile and visible workspace context. It does **not** implement tax calculation, SII reconciliation, readiness scoring, Annual Tax Health or year closure; those capabilities consume this workspace later.

## Current execution status

The Block 01 fast lane has closed its foundation, safety chain and first visible annual-workspace slice:

- [`PTL-SPIKE-AW-001`](spike-aw-001-applicability-profile.md) — **DONE**; five applicability dimensions closed;
- [`SQLite migration assessment`](sqlite-migration-assessment.md) — **PASS**;
- `PTL-TASK-AW-001` — **DONE**; `make validate` 115/115;
- `PTL-TASK-AW-002` — **DONE**; `make validate` 118/118;
- `PTL-TASK-AW-005` — **DONE**; `make validate` 127/127;
- `PTL-US-AW-006` — **DONE**; `make validate` 131/131;
- `PTL-TASK-AW-007` — **DONE**; `make validate` 136/136;
- `PTL-US-AW-001` — **DONE**; persisted-only AnnualWorkspace selection, derived AT and protected reload validated;
- `PTL-US-AW-002` — **DONE**; explicit empty workspace creation, support-policy enforcement, duplicate blocking and failure compensation validated;
- canonical validation for the visible slice: **149/149 tests**, plus `desktop:check` and `architecture:check` PASS.

The next executable P0 node is `PTL-TASK-AW-003 — TaxApplicabilityProfile schema and repository`, followed by `PTL-US-AW-004 — Applicability Profile`.

## Existing implementation baseline

The application now:

- persists first-class `AnnualTaxWorkspace` metadata;
- exposes a persistent Annual Workspace context header;
- lists/selects only persisted annual workspaces;
- derives Operación Renta from `commercialYear`;
- creates a new annual workspace explicitly through `Empezar vacío`;
- validates year support through AW-007 rather than UI ranges or fallback defaults;
- keeps `settings.year` only as compatibility active pointer during migration;
- reloads year-scoped data under trusted annual context;
- rejects stale/cross-year writes and stale responses;
- preserves year isolation for income, BHE and mortgage operations.

Rule-catalog seed years remain distinct from user workspaces. `tax_parameters` / `tax_rule_sources` can determine supported-year policy but do not independently authorize workspace materialization.

## Annual identity convention

PTL MUST distinguish:

- **Commercial year**: year in which income/events occur, e.g. `2026`;
- **Tax year / Operación Renta**: filing year derived from the commercial year, e.g. `AT2027`.

Canonical workspace identity is keyed by `commercialYear`. The AT label is derived and never independently editable.

```text
commercialYear = 2026
operationRenta = AT2027
```

## Stories in this block

| ID | Story | UI impact | Fidelity | Status |
|---|---|---|---|---|
| `PTL-US-AW-001` | Select and enter an annual workspace | `NEW_SECTION`, `FLOW_CHANGE` | L1 | DONE |
| `PTL-US-AW-002` | Create a new annual workspace | `NEW_SCREEN`, `FLOW_CHANGE` | L2 | DONE |
| `PTL-US-AW-003` | Initialize a year from a prior year without copying tax facts | `FLOW_CHANGE`, `STATE_CHANGE` | L2 | REFINING |
| `PTL-US-AW-004` | Define the annual tax applicability profile | `NEW_SECTION`, `FIELD_ADDITION` | L2 | REFINING |
| `PTL-US-AW-005` | Understand the selected workspace context and completeness | `NEW_SCREEN`, `STATE_CHANGE` | L2 | REFINING |
| `PTL-US-AW-006` | Preserve strict year isolation during navigation and editing | `STATE_CHANGE` | L1 | DONE |

Detailed contracts: [`user-stories.md`](user-stories.md).

## Design contract

The structural and interaction contract is in [`design-contract.md`](design-contract.md).

The persistent **Workspace Context Header** is now the visible authority for annual navigation/creation. `Configuración tributaria` remains focused on tax parameters/rules and no longer owns year switching.

`DESIGN-AW-004` remains reconciled with the closed Spike and exposes only the five accepted applicability dimensions.

## Enablers and dependency model

Technical Tasks, Spikes, dependency edges, statuses and critical paths are in [`enablers-and-dependencies.md`](enablers-and-dependencies.md).

## Implementation roadmap

The current execution order and resolved gates are in [`implementation-roadmap.md`](implementation-roadmap.md).

The roadmap is a versioned implementation specification. It does not replace GitHub Issues/Jira as the execution board.

## Scope boundary

### Included

- first-class annual workspace identity;
- commercial-year selection and derived AT label;
- creation of an empty year;
- explicit initialization from prior year;
- annual applicability profile;
- visible workspace summary/context;
- year isolation invariants;
- migration/compatibility with current year-scoped data.

### Explicitly excluded

- amounts for salary/honoraria/contractor (`Block 02 — Income & Tax Ledger`);
- document uploads/evidence (`Block 03`);
- expense eligibility (`Block 04`);
- AFP/health reconciliation (`Block 05`);
- tax calculation (`Block 06`);
- projected settlement/optimization (`Block 07`);
- SII reconciliation (`Block 08`);
- readiness score, annual health and closing/reopening workflow (`Block 09`);
- AI/Cloud processing (`Block 10`).

## Block closure path

Remaining implementation sequence:

1. `PTL-TASK-AW-003` — TaxApplicabilityProfile schema/repository;
2. `PTL-US-AW-004` — Applicability Profile;
3. `PTL-TASK-AW-006 + PTL-US-AW-005` — workspace overview;
4. P1 `PTL-TASK-AW-004 + PTL-US-AW-003` — allowlisted prior-year initialization;
5. `PTL-TASK-AW-008` — block-level regression closure and effective DoD/dogfood review.
