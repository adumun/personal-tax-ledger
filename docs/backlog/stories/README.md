# PTL — Repository Backlog Story Index

**Purpose:** navigable implementation-backlog specification for Story-level refinement under ADÜMÜN Work Management.

This directory contains repository-resident backlog specifications that are close enough to implementation to benefit from versioning with the code, design contracts, dependency analysis and durable cross-references.

It is **not** the execution board. Operational assignment, sprint state, due dates or queue management may live in GitHub Issues/Jira or another Work Management provider while this directory preserves the implementation contract.

## Work Management hierarchy

```text
TAX capability / PTL extension
  -> refinement block
    -> Story
      -> Task(s)
      -> Spike(s)
      -> design artifact(s)
      -> acceptance/evidence references
```

Canonical Types remain:

- `Story` — actor-visible value/behavior;
- `Task` — independently manageable enabling/technical/operational work;
- `Spike` — time-boxed uncertainty reduction.

Provider-specific items must preserve these semantics and stable IDs.

## Blocks

| Block | Scope | Status | Primary capability | Entry point |
|---|---|---|---|---|
| 01 | Annual Workspace & Tax Profile | `DOGFOOD / REFINING` | `TAX-01` | [`01-annual-workspace/README.md`](01-annual-workspace/README.md) |
| 02 | Income & Tax Ledger | `PLANNED` | `TAX-04` + income acquisition | not yet refined |
| 03 | Evidence & Acquisition | `PLANNED` | `TAX-02`, `TAX-03` | not yet refined |
| 04 | Expense Eligibility | `PLANNED` | `PTL-EXT-04` | not yet refined |
| 05 | Contributions & Health | `PLANNED` | TAX calculation/input concerns | not yet refined |
| 06 | Calculation & Explainability | `PLANNED` | `TAX-07`, `TAX-08` | not yet refined |
| 07 | Projection & Optimization | `PLANNED` | `TAX-09`, `PTL-EXT-02` | not yet refined |
| 08 | SII Reconciliation | `PLANNED` | `TAX-05` | not yet refined |
| 09 | Annual Health, Readiness & Closure | `PLANNED` | `TAX-06`, `TAX-10`, `TAX-11` | not yet refined |
| 10 | Document Intelligence / Cloud | `PLANNED` | `PTL-EXT-03` | not yet refined |
| 11 | Portability / Privacy / Backup | `PLANNED` | `TAX-12` | not yet refined |

## Block navigation rule

Every refined block must expose from its `README.md`:

1. objective/scope and governing capabilities;
2. Story index;
3. design-contract reference(s);
4. enabling Tasks/Spikes and dependency view;
5. open decisions/risks;
6. completion/readiness criteria;
7. links to upstream product requirements and downstream execution/evidence where material.

Stories and child work must be cross-referenced when the relationship is material. A child Task or Spike must not exist only as an unlinked paragraph if it is independently manageable.

## Cross-block views

When more than one block is refined enough to analyze globally, create/update:

- `../story-dependency-graph.md` — cross-block dependency DAG;
- `../implementation-critical-path.md` — dependency-depth and temporal critical-path analysis when comparable estimates exist.

These views are derived planning surfaces and must link back to the canonical Story/Task/Spike definitions.

## Governing references

- `STD-WMS-001` — Work Management core model.
- `STD-WMS-TYPES-001` — executable work Types.
- `STD-WMS-STORY-001` — Story definition, repository-resident backlog and implementation readiness.
- `STD-EXP-UIDEF-001` — UI/interaction definition contract.
- [`../story-definition-and-implementation-readiness.md`](../story-definition-and-implementation-readiness.md) — PTL adoption profile.
- [`../tax-management-expansion.md`](../tax-management-expansion.md) — TAX capabilities and PTL extension backlog source.
