# Block 01 — Annual Workspace & Tax Profile

**Status:** `DOGFOOD / IMPLEMENTING WAVE A`  
**Primary capability:** `TAX-01 — Annual Tax Workspace`  
**Related capabilities:** `TAX-02`, `TAX-06`, `TAX-09`, `TAX-10`, `TAX-11`, `TAX-12`  
**Story standard:** `STD-WMS-STORY-001@0.1.0-draft`  
**UI definition standard:** `STD-EXP-UIDEF-001@0.1.0-draft`

## Objective

Turn the current implicit `settings.year` behavior into an explicit annual tax workspace that becomes the stable parent context for all tax facts, evidence, calculations, projections and later year closure.

The block is deliberately narrow: it establishes annual identity, year selection/creation, explicit prior-year initialization, applicability profile and visible workspace context. It does **not** implement tax calculation, SII reconciliation, readiness scoring, Annual Tax Health or year closure; those capabilities consume this workspace later.

## Current execution status

Wave A entered implementation on 2026-09-12 after both immediate start gates passed:

- [`PTL-SPIKE-AW-001`](spike-aw-001-applicability-profile.md) — **DONE**; minimum Block 01 applicability profile resolved to five dimensions;
- [`SQLite migration assessment`](sqlite-migration-assessment.md) — **PASS**; actual startup schema evolution and deterministic workspace materialization path verified;
- `PTL-TASK-AW-001` — **IN_PROGRESS** on `feat/block-01-annual-workspace-foundation`;
- `PTL-TASK-AW-002` — deliberately not started until AW-001 closes; sizing revised `L -> M` after migration inspection;
- `PTL-TASK-AW-007` — READY in Wave A.

The safety chain remains mandatory:

```text
PTL-TASK-AW-001
 -> PTL-TASK-AW-005
 -> PTL-US-AW-006
 -> PTL-TASK-AW-008
```

## Existing implementation baseline

The current application already:

- stores `settings.year`;
- loads incomes, fee receipts, mortgages, tax parameters and simulation by selected year;
- allows changing the year from `Configuración tributaria`;
- can copy income sources from the nearest previous year;
- versions tax parameters by year.

This block must preserve those working capabilities while replacing implicit/global year context with a first-class workspace contract.

The schema review additionally established that rule-catalog seed years are not equivalent to user workspaces. `tax_parameters` / `tax_rule_sources` may inform supported-year policy but do not independently authorize workspace materialization.

## Annual identity convention

PTL MUST distinguish:

- **Commercial year**: year in which income/events occur, e.g. `2026`;
- **Tax year / Operación Renta**: filing year derived from the commercial year, e.g. `AT2027`.

Canonical workspace identity is keyed by `commercialYear`. `taxYearLabel` is derived for presentation and must not create a second independently editable year.

```text
commercialYear = 2026
operationRenta = AT2027
```

## Stories in this block

| ID | Story | UI impact | Fidelity | Status |
|---|---|---|---|---|
| `PTL-US-AW-001` | Select and enter an annual workspace | `NEW_SECTION`, `FLOW_CHANGE` | L1 | REFINING |
| `PTL-US-AW-002` | Create a new annual workspace | `NEW_SCREEN`, `FLOW_CHANGE` | L2 | REFINING |
| `PTL-US-AW-003` | Initialize a year from a prior year without copying tax facts | `FLOW_CHANGE`, `STATE_CHANGE` | L2 | REFINING |
| `PTL-US-AW-004` | Define the annual tax applicability profile | `NEW_SECTION`, `FIELD_ADDITION` | L2 | REFINING |
| `PTL-US-AW-005` | Understand the selected workspace context and completeness | `NEW_SCREEN`, `STATE_CHANGE` | L2 | REFINING |
| `PTL-US-AW-006` | Preserve strict year isolation during navigation and editing | `STATE_CHANGE` | L1 | REFINING |

Detailed contracts: [`user-stories.md`](user-stories.md).

## Design contract

The structural and interaction contract for this block is in [`design-contract.md`](design-contract.md).

Key decision: introduce a dedicated **Año tributario** surface and a persistent workspace context header. The existing `Configuración tributaria` surface keeps tax-rule/parameter editing but stops being the primary owner of year navigation.

`DESIGN-AW-004` is reconciled with the closed Spike and exposes only the five accepted applicability dimensions.

## Enablers and dependency model

Technical Tasks, Spikes, dependency edges, statuses and the block critical paths are in [`enablers-and-dependencies.md`](enablers-and-dependencies.md).

## Implementation roadmap

The current `GO / IMPLEMENTING WAVE A` decision, fast lane, updated effort assessment, safety-critical chain and resolved start gates are in [`implementation-roadmap.md`](implementation-roadmap.md).

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

## Dogfood questions to validate the standards

This block must produce evidence for the proposed ADÜMÜN standards:

1. Is the Story template sufficient without becoming repetitive?
2. Are L1/L2 design artifacts enough for both a simple year selector and a multi-step create/init flow?
3. Do typed dependencies expose real blockers more clearly than generic `depends_on`?
4. Can enabling `Task` work replace invented `Technical Story` types without loss of planning clarity?
5. Can we derive a useful critical path once relative effort is added?

## Block completion criteria

This documentation block is considered refined enough for dependency/estimation review when:

- all six Stories have observable acceptance criteria;
- every Story declares canonical data impact and UI impact;
- design surfaces/states are explicit;
- every known technical prerequisite is represented as Task or Spike;
- dependency edges form an acyclic graph;
- unresolved decisions are explicit rather than delegated to the implementer;
- no Story is marked `READY` merely because documentation exists; effective DoR must still be reviewed.