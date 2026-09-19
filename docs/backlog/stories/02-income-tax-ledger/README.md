# Block 02 — Income & Tax Ledger

**Status:** `IN_PROGRESS / IL-A CLOSED / IL-B CLOSED / IL-005 CLOSED / SPIKE-IL-002 CLOSED / TASK-IL-005 CLOSED / US-IL-004 IMPLEMENTED / VISUAL_VALIDATION_BLOCKED`  
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

## Closed foreign-service foundation

`PTL-SPIKE-IL-002` and `PTL-TASK-IL-005` are closed.

The accepted and implemented split is:

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

Implemented invariants:

1. `foreign payer != foreign-source income`;
2. payer country and source jurisdiction are separate fields;
3. a CLP BHE plus an FX payment creates one income fact, not two;
4. genuine foreign-source honoraria are recognized on perception;
5. original amount/currency are preserved;
6. recognized CLP value is backed by a frozen, auditable conversion snapshot;
7. unresolved FX remains `PENDING / NEEDS_REVIEW` rather than silently guessing;
8. conversion corrections retain historical snapshots in deterministic append order;
9. Block 02 does not calculate article 41 A foreign-tax-credit entitlement.

Decision evidence: [`spike-il-002-foreign-service-recognition-fx.md`](spike-il-002-foreign-service-recognition-fx.md).  
Implementation evidence: [`task-il-005-evidence.md`](task-il-005-evidence.md).

## Current slice — PTL-US-IL-004

Implementation is assembled and statically reconciled across contracts, application, SQLite, HTTP, frontend owner flow, tests and evidence. The first local pre-visual gate attempt passed bootstrap/typecheck and produced 236/237 tests green; the single failure was an obsolete frontend assertion that prohibited internal `ownerRecordId` routing. That test has been corrected without weakening production behavior. The browser E2E gate is green for both Path A and Path B (`2 passed`), and the corrected-head `make typecheck` + `make test` rerun has also been reported green. Human visual validation found an FX-action feedback defect: official/manual conversion actions updated feedback above the user's current viewport, making the buttons appear non-functional. The correction is implemented and the story remains blocked pending rerun and visual re-validation.

Path A:

```text
foreign payer + service performed in CHILE
  -> existing BHE owner
  -> fee_receipt_foreign_settlements provenance
  -> settlement save/cancel returns to the annual ledger
  -> no additional TaxLedgerEntry
```

Path B:

```text
foreign payer + service performed FOREIGN
  -> foreign_service_income owner
  -> original value + perception date
  -> official exact-date FX attempt OR documented manual FX
  -> append-only conversion history
  -> owner-aware create/edit round trip
  -> FOREIGN_SERVICE_INCOME projection
```

The annual ledger exposes one explicit `Servicio con pagador extranjero` action and foreign-source owner rows open their dedicated editor through the shared ledger owner-flow context. Stable `ownerRecordId` is used internally to route to the exact canonical aggregate but is not rendered as ledger data. No legal source-jurisdiction inference is performed by PTL, and product UI does not expose raw technical conversion-state/source enums.

## Stories

| ID | Story | UI impact | Fidelity | Status |
|---|---|---|---|---|
| `PTL-US-IL-001` | Ver el ledger anual unificado de ingresos | `NEW_SECTION`, `FLOW_CHANGE` | L2 | DONE |
| `PTL-US-IL-002` | Mantener hechos de renta dependiente dentro del ledger | `FLOW_CHANGE`, `FIELD_REUSE` | L2 | DONE |
| `PTL-US-IL-003` | Mantener BHE/honorarios nacionales dentro del ledger | `FLOW_CHANGE`, `FIELD_REUSE` | L2 | DONE |
| `PTL-US-IL-004` | Registrar servicios con pagador extranjero sin duplicar el hecho tributario | `NEW_FLOW`, `FIELD_ADDITION` | L2 | IMPLEMENTED / VISUAL_VALIDATION_BLOCKED |
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
- BHE-linked foreign settlement provenance without double counting;
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

1. perform user visual validation for Path A and Path B;
2. after approval, run canonical `make validate` and close `PTL-US-IL-004`;
4. finalize evidence, mark the Draft PR ready and merge exact-head;
5. run `PTL-TASK-IL-006` terminal regression/DoD;
6. close Block 02 if the terminal gate passes.

See [`implementation-roadmap.md`](implementation-roadmap.md), [`enablers-and-dependencies.md`](enablers-and-dependencies.md), [`spike-il-002-foreign-service-recognition-fx.md`](spike-il-002-foreign-service-recognition-fx.md), [`task-il-005-evidence.md`](task-il-005-evidence.md), [`il-004-foreign-service-flow-evidence.md`](il-004-foreign-service-flow-evidence.md), [`il-b-owner-flow-evidence.md`](il-b-owner-flow-evidence.md) and [`il-005-factual-position-evidence.md`](il-005-factual-position-evidence.md).
