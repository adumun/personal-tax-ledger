# PTL-US-IL-004 — Foreign payer / foreign-source flow — Evidence

**Story:** `PTL-US-IL-004`  
**Status:** `IMPLEMENTED / AUTOMATED_VALIDATION_PENDING`  
**Capability:** `TAX-04`  
**UI impact:** `NEW_FLOW`, `FIELD_ADDITION`  
**Design:** `DESIGN-IL-004`

## Objective

Provide one explicit product entry point for a service with a foreign payer without equating payer location with source jurisdiction and without duplicating a BHE-backed income fact.

## Implemented flow

```text
Ingresos del año
  -> + Servicio con pagador extranjero
     -> payerCountry
     -> ¿Dónde se prestó materialmente el servicio?
        -> CHILE
           -> fee_receipts / BHE remains owner
           -> fee_receipt_foreign_settlements provenance
           -> NO second ledger income row
        -> FOREIGN
           -> foreign_service_income owner
           -> perception date
           -> original amount/currency
           -> exact-date official FX attempt
           -> explicit manual documented FX fallback
           -> append-only conversion history
           -> FOREIGN_SERVICE_INCOME ledger projection
```

## Path A — BHE + foreign-currency settlement

A dedicated child record `fee_receipt_foreign_settlements` stores settlement provenance keyed one-to-one by `fee_receipt_id`.

Captured facts:

- payer country;
- source jurisdiction fixed to `CHILE`;
- received amount;
- received currency;
- received date;
- provider/bank reference;
- notes.

Invariants:

- `fee_receipts` remains the canonical income owner;
- settlement persistence is not registered as a `TaxLedgerProvider`;
- no second income row is created;
- the linked BHE must belong to the active `AnnualWorkspace`;
- stale/cross-year protection remains inherited from Block 01.

## Path B — genuine foreign-source honorarium

The UI creates and edits the existing `foreign_service_income` owner introduced by `PTL-TASK-IL-005`.

It exposes:

- payer and payer country;
- explicit `FOREIGN` source jurisdiction;
- perception date;
- original amount/currency;
- description/notes;
- optional factual foreign-tax fields;
- current CLP conversion state/provenance;
- exact-date official conversion attempt;
- manual conversion with rate/date/source-reference/reason;
- append-only conversion history.

If no official FX adapter is available or an exact safe rate cannot be resolved, the operation reports `NEEDS_REVIEW` and the ledger remains `PENDING`; the UI does not guess a rate.

## Correction semantics

A correction to a conversion input — perception date, original amount or original currency — invalidates the current conversion pointer while retaining history.

Changes that do not affect conversion validity, such as payer metadata, notes or factual foreign-tax fields, preserve the current resolved conversion.

An FX correction remains append-only and links the new snapshot to the superseded conversion.

## HTTP / composition

Added owner-specific HTTP surfaces for:

```text
GET/POST  /api/foreign-service-income
GET/PUT   /api/foreign-service-income/:id
GET        /api/foreign-service-income/:id/conversions
POST       /api/foreign-service-income/:id/conversions/official
POST       /api/foreign-service-income/:id/conversions/manual
GET/PUT    /api/fee-receipts/:id/foreign-settlement
```

The local composition binds these routes to trusted annual-context use cases. The annual ledger itself remains read-only.

## Automated coverage prepared

`test/foreign-service-flow.test.mjs` proves:

1. Path A settlement remains linked to a BHE;
2. Path A does not create `foreign_service_income` or a second foreign ledger row;
3. a BHE from another commercial year cannot receive the active-year settlement.

`test/foreign-service-flow-frontend.test.mjs` proves the frontend contract for:

1. explicit foreign-payer entry point;
2. payer-country/source-jurisdiction separation;
3. Path A BHE settlement boundary;
4. Path B fact/conversion/history boundary;
5. article 41 A exclusion.

`test/foreign-service-http.test.mjs` proves owner-specific HTTP delegation for Path A and Path B.

`test/foreign-service-income.test.mjs` additionally proves:

- non-conversion metadata edits preserve a valid current FX snapshot;
- changing an FX-driving economic fact invalidates only the current pointer;
- historical conversion evidence remains intact.

## Validation state

No automated green result is claimed yet for this implementation head.

Required pre-visual gate:

```text
make bootstrap
make typecheck
make test
```

Because this story introduces a visible new flow, closure requires after that:

```text
USER_VISUAL_APPROVED
  -> make validate PASS
  -> DONE
```

Until visual approval, the pull request remains Draft and the story must not be marked `DONE`.
