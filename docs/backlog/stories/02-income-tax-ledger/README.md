# Block 02 — Income & Tax Ledger

**Status:** `IN_PROGRESS / IL-A CLOSED / IL-B CLOSED`  
**Primary capability:** `TAX-04 — Tax Ledger`  
**Related capabilities:** `TAX-01`, `TAX-02`, `TAX-06`, `TAX-07`, `TAX-08`, `TAX-09`  
**Related extension:** `PTL-EXT-01 — International Contractor Income Planning`

## Objective

Turn the existing year-scoped income and BHE aggregates into a single explainable annual income ledger without creating a second source of truth.

Block 02 establishes a canonical **ledger projection** over authoritative domain facts. It does not replace aggregate ownership, calculate final annual tax, reconcile against SII or ingest documentary evidence.

## Current implementation baseline

PTL already has:

- `income_sources` for salary/other income-source facts and APV-related fields;
- `fee_receipts` for domestic BHE/honorarios facts;
- separate salary and fee domain calculators;
- trusted `AnnualWorkspaceContext` and strict year isolation from Block 01;
- Annual Workspace overview counts/presence consuming those aggregates;
- unified annual ledger UI over the closed IL-001..IL-004 projection/read contracts;
- owner-aware create/edit flows from the ledger back to the canonical `income_sources` and `fee_receipts` editors;
- first React-profile dogfood through `adumun/react-components`.

## Closed architectural decision

`Tax Ledger` is a **canonical projection, not a second canonical persistence store**.

```text
income_sources ─┐
                ├─> TaxLedgerEntry projection ─> Annual Income Ledger UI/API
fee_receipts ───┘
```

Rules:

1. aggregate-specific repositories remain write authorities;
2. a ledger entry carries a stable reference to its owning aggregate and record;
3. ledger mutation delegates to the owning aggregate flow; it never updates a generic duplicate row;
4. ledger totals are fact summaries only, not tax liability/refund/readiness;
5. later acquisition/evidence/reconciliation capabilities attach provenance/status without silently overwriting canonical facts.

Decision evidence: [`spike-il-001-ledger-authority.md`](spike-il-001-ledger-authority.md).

## Stories

| ID | Story | UI impact | Fidelity | Status |
|---|---|---|---|---|
| `PTL-US-IL-001` | Ver el ledger anual unificado de ingresos | `NEW_SECTION`, `FLOW_CHANGE` | L2 | DONE |
| `PTL-US-IL-002` | Mantener hechos de renta dependiente dentro del ledger | `FLOW_CHANGE`, `FIELD_REUSE` | L2 | DONE |
| `PTL-US-IL-003` | Mantener BHE/honorarios nacionales dentro del ledger | `FLOW_CHANGE`, `FIELD_REUSE` | L2 | DONE |
| `PTL-US-IL-004` | Registrar ingresos por servicios con pagador extranjero | `NEW_FLOW`, `FIELD_ADDITION` | L2 | BLOCKED_BY_SPIKE_IL_002 |
| `PTL-US-IL-005` | Ver posición anual de ingresos basada en hechos | `NEW_SECTION` | L2 | REFINING |
| `PTL-US-IL-006` | Conservar trazabilidad, autoridad y aislamiento anual del ledger | `STATE_CHANGE` | L1 | DONE |

Detailed contracts: [`user-stories.md`](user-stories.md).

## Closed slice — IL-B

`PTL-US-IL-002` and `PTL-US-IL-003` are closed.

The implemented interaction is:

```text
Annual ledger
  -> owner-aware action
  -> canonical owner editor
  -> save/cancel in owner flow
  -> return to annual ledger
  -> reload projection
```

Closure evidence:

- focused automated validation — PASS;
- local visual validation of income/BHE create/edit + save/cancel round-trips — PASS;
- canonical `make validate` — PASS;
- no generic ledger editor or dual-write introduced.

See [`il-b-owner-flow-evidence.md`](il-b-owner-flow-evidence.md).

## Scope boundary

### Included

- unified annual ledger projection;
- normalized entry type/source/status/amount presentation;
- stable owner aggregate/reference identity;
- manual fact maintenance through existing aggregate-specific flows;
- annual factual totals by category;
- year isolation and stale-write protection inherited from Block 01;
- explicit provenance hooks suitable for later acquisition/reconciliation.

### Explicitly excluded

- evidence upload/document vault (`Block 03`);
- SII reconciliation (`TAX-05` / later block);
- readiness score (`TAX-06`);
- final tax liability/refund (`TAX-07`);
- optimization/provisioning recommendations (`TAX-09` / `PTL-EXT-02`);
- automatic FX sourcing until `PTL-SPIKE-IL-002` closes its recognition/provenance rule.

## Execution order

1. `PTL-TASK-IL-001 — TaxLedgerEntry projection contract` — DONE;
2. `PTL-TASK-IL-002 — Aggregate projection providers` — DONE;
3. `PTL-TASK-IL-003 — Annual ledger query/read model` — DONE;
4. `PTL-TASK-IL-004 — Ledger HTTP/client surface` — DONE;
5. `PTL-US-IL-001 + PTL-US-IL-006` — DONE;
6. `PTL-US-IL-002 + PTL-US-IL-003` — DONE;
7. `PTL-US-IL-005` factual annual position is the next executable story;
8. close FX/foreign-service spike before `PTL-US-IL-004`;
9. terminal `PTL-TASK-IL-006` regression/DoD gate.

`PTL-US-IL-005` is dependency-ready from the closed annual ledger read model and can proceed without waiting for the foreign-service spike. `PTL-US-IL-004` remains blocked until `PTL-SPIKE-IL-002` closes FX/recognition/provenance semantics.

See [`implementation-roadmap.md`](implementation-roadmap.md), [`enablers-and-dependencies.md`](enablers-and-dependencies.md) and [`il-b-owner-flow-evidence.md`](il-b-owner-flow-evidence.md).
