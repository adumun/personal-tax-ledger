# Block 02 — Income & Tax Ledger

**Status:** `IN_PROGRESS / IL-A CLOSED / IL-B CLOSED / IL-005 CLOSED / SPIKE-IL-002 DECISION_PROPOSED`  
**Primary capability:** `TAX-04 — Tax Ledger`  
**Related capabilities:** `TAX-01`, `TAX-02`, `TAX-06`, `TAX-07`, `TAX-08`, `TAX-09`  
**Related extension:** `PTL-EXT-01 — International Contractor Income Planning`

## Objective

Turn the existing year-scoped income and BHE aggregates into a single explainable annual income ledger without creating a second source of truth.

Block 02 establishes a canonical **ledger projection, not a second canonical persistence store**. It does not replace aggregate ownership, calculate final annual tax, reconcile against SII or ingest documentary evidence.

## Closed domestic/factual baseline

PTL already has:

- trusted `AnnualWorkspaceContext` and strict year isolation from Block 01;
- unified annual income ledger;
- `income_sources` and `fee_receipts` as owner-specific mutation authorities;
- owner-aware create/edit round-trips from the ledger;
- factual annual income position grouped by category;
- traceable recognition-aware totals;
- no generic ledger mutation store.

Closed stories:

- `PTL-US-IL-001` — DONE;
- `PTL-US-IL-002` — DONE;
- `PTL-US-IL-003` — DONE;
- `PTL-US-IL-005` — DONE;
- `PTL-US-IL-006` — DONE.

## Current critical path — foreign service / FX

The remaining product story, `PTL-US-IL-004`, was blocked because “foreign payer” had not been separated from “foreign-source income” and no recognition/FX provenance contract existed.

`PTL-SPIKE-IL-002` now proposes the following explicit split:

```text
foreign payer
  -> where was the service materially performed?
     -> CHILE
        -> fee_receipts / BHE remains canonical
        -> foreign-currency payment is settlement provenance only
     -> FOREIGN
        -> foreign_service_income
        -> recognition on perception
        -> original currency/amount preserved
        -> frozen CLP conversion snapshot with BCCh provenance
```

Core invariants:

1. `foreign payer != foreign-source income`;
2. payer country and source jurisdiction are separate fields;
3. a CLP BHE plus an FX payment creates one income fact, not two;
4. genuine foreign-source honoraria are recognized on perception;
5. original amount/currency are preserved;
6. recognized CLP value is backed by a frozen, auditable conversion snapshot;
7. unresolved FX remains `PENDING / NEEDS_REVIEW` rather than silently guessing;
8. conversion corrections retain historical snapshots;
9. Block 02 does not calculate article 41 A foreign-tax-credit entitlement.

Decision evidence: [`spike-il-002-foreign-service-recognition-fx.md`](spike-il-002-foreign-service-recognition-fx.md).

## Stories

| ID | Story | UI impact | Fidelity | Status |
|---|---|---|---|---|
| `PTL-US-IL-001` | Ver el ledger anual unificado de ingresos | `NEW_SECTION`, `FLOW_CHANGE` | L2 | DONE |
| `PTL-US-IL-002` | Mantener hechos de renta dependiente dentro del ledger | `FLOW_CHANGE`, `FIELD_REUSE` | L2 | DONE |
| `PTL-US-IL-003` | Mantener BHE/honorarios nacionales dentro del ledger | `FLOW_CHANGE`, `FIELD_REUSE` | L2 | DONE |
| `PTL-US-IL-004` | Registrar servicios con pagador extranjero sin duplicar el hecho tributario | `NEW_FLOW`, `FIELD_ADDITION` | L2 | BLOCKED_BY_SPIKE_DECISION_ACCEPTANCE |
| `PTL-US-IL-005` | Ver posición anual de ingresos basada en hechos | `NEW_SECTION` | L2 | DONE |
| `PTL-US-IL-006` | Conservar trazabilidad, autoridad y aislamiento anual del ledger | `STATE_CHANGE` | L1 | DONE |

Detailed contracts: [`user-stories.md`](user-stories.md).

## Scope boundary

### Included

- unified annual ledger projection;
- stable owner identity;
- domestic income/BHE owner flows;
- annual factual totals;
- foreign-service classification;
- original-value + FX-conversion provenance for genuine foreign-source honoraria;
- explicit year/recognition semantics.

### Explicitly excluded

- evidence upload/document vault (`Block 03`);
- SII reconciliation (`TAX-05` / later block);
- readiness score (`TAX-06`);
- final tax liability/refund (`TAX-07`);
- optimization/provisioning recommendations (`TAX-09` / `PTL-EXT-02`);
- article 41 A credit calculation;
- automatic legal inference of source jurisdiction;
- silent non-banking-day FX fallback.

## Remaining execution order

1. accept/close `PTL-SPIKE-IL-002`;
2. implement `PTL-TASK-IL-005` foreign-service aggregate/provider/value contract;
3. implement `PTL-US-IL-004` product flow;
4. run `PTL-TASK-IL-006` terminal regression/DoD;
5. close Block 02.

See [`implementation-roadmap.md`](implementation-roadmap.md), [`enablers-and-dependencies.md`](enablers-and-dependencies.md), [`spike-il-002-foreign-service-recognition-fx.md`](spike-il-002-foreign-service-recognition-fx.md), [`il-b-owner-flow-evidence.md`](il-b-owner-flow-evidence.md) and [`il-005-factual-position-evidence.md`](il-005-factual-position-evidence.md).
