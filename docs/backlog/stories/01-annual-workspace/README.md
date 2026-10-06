# Block 01 — Annual Workspace & Tax Profile

**Status:** `CLOSED / DOGFOOD BASELINE VALIDATED`  
**Primary capability:** `TAX-01 — Annual Tax Workspace`  
**Related capabilities:** `TAX-02`, `TAX-06`, `TAX-09`, `TAX-10`, `TAX-11`, `TAX-12`  
**Story standard:** `STD-WMS-STORY-001@0.1.0-draft`  
**UI definition standard:** `STD-EXP-UIDEF-001@0.1.0-draft`

## Objective

Turn the current implicit `settings.year` behavior into an explicit annual tax workspace that becomes the stable parent context for all tax facts, evidence, calculations, projections and later year closure.

The block is deliberately narrow: it establishes annual identity, year selection/creation, explicit prior-year initialization, applicability profile and visible workspace context. It does **not** implement tax calculation, SII reconciliation, readiness scoring, Annual Tax Health or year closure; those capabilities consume this workspace later.

## Final execution status

All Block 01 functional Stories, enabling Tasks and the terminal quality gate are closed.

Validated milestones:

- `PTL-SPIKE-AW-001` — DONE;
- `PTL-TASK-AW-001` — DONE; 115/115;
- `PTL-TASK-AW-002` — DONE; 118/118;
- `PTL-TASK-AW-005` — DONE; 127/127;
- `PTL-US-AW-006` — DONE; 131/131;
- `PTL-TASK-AW-007` — DONE; 136/136;
- `PTL-US-AW-001 + PTL-US-AW-002` — DONE; 149/149;
- `PTL-TASK-AW-003` — DONE; 155/155;
- `PTL-US-AW-004` — DONE; 164/164;
- `PTL-TASK-AW-006 + PTL-US-AW-005` — DONE; 169/169 plus desktop/architecture checks PASS;
- `PTL-TASK-AW-004 + PTL-US-AW-003` — DONE; canonical rerun PASS;
- `PTL-TASK-AW-008` — DONE; terminal `make validate` **185/185**, desktop check PASS, architecture check PASS.

## Implemented baseline

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
- preserves year isolation for income, BHE and mortgage operations;
- persists a versioned five-dimension applicability profile;
- exposes `NEEDS_REVIEW` without rewriting facts;
- exposes a structural `Año tributario` overview without tax-outcome/readiness/SII semantics;
- implements explicit prior-year initialization preview with a closed reusable-category allowlist;
- stores initialization provenance separately from tax declarations;
- rolls back target workspace/active-year on partial initialization failure;
- protects the complete Block 01 contract with an explicit cross-feature terminal regression suite.

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
| `PTL-US-AW-003` | Initialize a year from a prior year without copying tax facts | `FLOW_CHANGE`, `STATE_CHANGE` | L2 | DONE |
| `PTL-US-AW-004` | Define the annual tax applicability profile | `NEW_SECTION`, `FIELD_ADDITION` | L2 | DONE |
| `PTL-US-AW-005` | Understand the selected workspace context and completeness | `NEW_SCREEN`, `STATE_CHANGE` | L2 | DONE |
| `PTL-US-AW-006` | Preserve strict year isolation during navigation and editing | `STATE_CHANGE` | L1 | DONE |

Detailed contracts: [`user-stories.md`](user-stories.md).

## Design contract

The structural and interaction contract is in [`design-contract.md`](design-contract.md).

The persistent **Workspace Context Header** is the visible authority for annual navigation/creation. `Configuración tributaria` remains focused on tax parameters/rules and no longer owns year switching.

## Enablers and dependency model

Technical Tasks, Spikes, dependency edges, statuses and critical paths are in [`enablers-and-dependencies.md`](enablers-and-dependencies.md).

## Implementation roadmap

The closed execution path and final validated baseline are in [`implementation-roadmap.md`](implementation-roadmap.md).

## Scope boundary

### Included

- first-class annual workspace identity;
- commercial-year selection and derived AT label;
- creation of an empty year;
- explicit initialization from prior year;
- annual applicability profile;
- visible workspace summary/context;
- year isolation invariants;
- migration/compatibility with current year-scoped data;
- terminal cross-feature regression evidence.

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

## Closure verdict

**Block 01 is CLOSED.** The terminal canonical gate passed 185/185 tests with desktop and architecture checks clean. Later TAX blocks may consume the Annual Workspace contract without reopening Block 01 semantics unless a new explicit versioned domain/product change is required.
