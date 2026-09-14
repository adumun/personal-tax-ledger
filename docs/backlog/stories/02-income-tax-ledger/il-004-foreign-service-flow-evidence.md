# PTL-US-IL-004 — Foreign payer / foreign-source flow — Evidence

**Story:** `PTL-US-IL-004`  
**Status:** `IMPLEMENTED / VISUAL_VALIDATION_PENDING`  
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
- stale/cross-year protection remains inherited from Block 01;
- successful settlement save returns through the annual-ledger owner flow rather than leaving a detached mutation surface open.

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

If no official FX adapter is available or an exact safe rate cannot be resolved, the operation remains pending/requires review and the ledger does not gain a recognized CLP amount; the UI does not guess a rate.

## Owner-flow integration

`ledger-owner-flow-context.tsx` now recognizes:

```text
INCOME_SOURCE
FEE_RECEIPT
FOREIGN_SERVICE_INCOME
```

The annual ledger starts foreign create/edit intents through the same owner-flow context used for other aggregate owners. Closing/cancelling/completing the foreign flow returns to the same annual ledger and triggers the parent ledger remount/reload path; no generic ledger mutation endpoint is introduced.

## Product language boundary

Raw conversion-state/source enums are not rendered as product labels. The UI presents user-facing language such as:

- `Conversión resuelta`;
- `Pendiente de conversión`;
- `Requiere revisión`;
- `Banco Central de Chile`;
- `Conversión manual`.

Provider failure reasons are translated to non-technical explanations before display.

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

## Engineering consistency review

The branch was re-inspected against `master` before Draft PR creation. The review confirmed:

- JS contracts and `.d.ts` declarations expose the settlement repository and foreign-service contracts consistently;
- repository contract tests prevent settlement provenance from satisfying the BHE repository authority contract;
- SQLite keeps settlement storage separate and constrains source jurisdiction to `CHILE`;
- settlement use cases resolve the BHE owner and enforce active-year ownership before persistence;
- foreign-service use cases continue to reject `CHILE` source jurisdiction;
- official FX remains exact-date and returns explicit review-required results when unavailable/mismatched;
- metadata-only corrections preserve a valid current FX pointer;
- FX-driving economic corrections invalidate only the current pointer while historical snapshots remain append-only;
- owner-aware frontend flow is now consistent with the existing income/BHE pattern;
- no generic ledger mutation or dual-write path was added.

## Automated coverage prepared

`test/foreign-service-flow.test.mjs` proves:

1. Path A settlement remains linked to a BHE;
2. Path A does not create `foreign_service_income` or a second foreign ledger row;
3. a BHE from another commercial year cannot receive the active-year settlement.

`test/foreign-service-flow-frontend.test.mjs` proves the frontend contract for:

1. explicit foreign-payer entry point;
2. owner-aware `FOREIGN_SERVICE_INCOME` create/edit integration;
3. payer-country/source-jurisdiction separation;
4. Path A BHE settlement boundary and save-to-ledger round trip;
5. Path B fact/conversion/history boundary;
6. no raw technical conversion-state/source labels;
7. article 41 A exclusion.

`test/foreign-service-http.test.mjs` proves owner-specific HTTP delegation for Path A and Path B.

`test/foreign-service-income.test.mjs` additionally proves:

- non-conversion metadata edits preserve a valid current FX snapshot;
- changing an FX-driving economic fact invalidates only the current pointer;
- historical conversion evidence remains intact;
- BCCh date mismatch cannot silently substitute a different date;
- unresolved conversion remains non-recognized in the ledger.

## Validation state

The implementation is ready for the local pre-visual gate, but this evidence does **not** claim that the user's local branch has passed it yet.

Required pre-visual gate:

```text
make bootstrap
make typecheck
make test
```

If that gate is green, the next step is `make up` and visual validation of both Paths.

Because this story introduces a visible new flow, closure requires:

```text
USER_VISUAL_APPROVED
  -> make validate PASS
  -> DONE
```

Until visual approval and canonical validation, the pull request remains Draft and the story must not be marked `DONE`.
