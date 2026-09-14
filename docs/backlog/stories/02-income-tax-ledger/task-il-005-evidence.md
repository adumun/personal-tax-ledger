# PTL-TASK-IL-005 — Foreign-service provider/value contract — Evidence

**Task:** `PTL-TASK-IL-005`  
**Status:** `DONE`  
**Priority:** P1  
**Role:** ENABLER

## Objective

Implement the accepted `PTL-SPIKE-IL-002` contract without introducing the `PTL-US-IL-004` user flow yet.

The task establishes the canonical domain/storage/provider foundation for genuinely foreign-source article 42 N°2 service income.

## Implemented boundary

```text
foreign_service_income
  -> economic fact identity
  -> perception year
  -> original amount/currency
  -> current conversion pointer

foreign_service_fx_conversions
  -> append-only conversion snapshots
  -> BCCH | MANUAL provenance
  -> supersedesConversionId history

ForeignServiceIncomeUseCases
  -> annual workspace enforcement
  -> economic-fact correction
  -> official exact-date conversion
  -> explicit manual conversion fallback

ForeignServiceTaxLedgerProvider
  -> FOREIGN_SERVICE_INCOME
  -> FOREIGN_SERVICE_INCOME owner
  -> PENDING until perception + resolved conversion
  -> RECOGNIZED CLP gross only after resolved snapshot
```

## Storage invariants

- `foreign_service_income` accepts only `serviceSourceJurisdiction = FOREIGN`;
- `taxYear` is derived from `receivedAt` when perception is known;
- original amount/currency are persisted independently of the CLP conversion;
- FX correction appends a new row and sets `supersedesConversionId` instead of overwriting history;
- conversion history preserves real append order even when SQLite timestamps share the same second;
- changing the economic fact invalidates `currentConversionId` but does not delete prior conversion history;
- foreign-tax facts are stored only as provenance inputs and do not calculate article 41 A credit.

## FX provider contract

`createBcchForeignExchangeProvider` intentionally resolves only an exact requested date.

If the adapter returns a rate for a different date, the provider returns:

```text
NEEDS_REVIEW / BCCH_RATE_DATE_MISMATCH
```

There is no silent previous-business-day/weekend/holiday fallback.

Resolved BCCh data must provide an explicit `sourceReference`.

Manual conversion is allowed only with:

- `fxSource = MANUAL`;
- `fxSourceReference`;
- `fxReason`;
- explicit rate/date.

## Ledger semantics

A foreign-source income projects as:

```text
entryKind = FOREIGN_SERVICE_INCOME
ownerAggregate = FOREIGN_SERVICE_INCOME
ownerRecordId = foreign_service_income.id
occurredOn = receivedAt
```

Recognition:

```text
receivedAt + current RESOLVED conversion
  -> RECOGNIZED
otherwise
  -> PENDING
```

Only a recognized row exposes `amounts.gross` in CLP.

`provenanceSummary` retains:

- payer country;
- source jurisdiction;
- original amount/currency;
- conversion id;
- FX rate/date/source/reference;
- optional factual foreign-tax fields.

## Path A protection

The foreign-service aggregate/use cases reject `serviceSourceJurisdiction = CHILE`.

Therefore a foreign payer for a service materially performed in Chile cannot be represented through this aggregate. It remains owned by the BHE / `fee_receipts` path and cannot create a duplicate `FOREIGN_SERVICE_INCOME` ledger row.

Settlement metadata UX for that BHE path belongs to `PTL-US-IL-004`; it is not invented here.

## Automated coverage

`test/foreign-service-income.test.mjs` verifies:

1. original value preservation;
2. perception-derived commercial year;
3. append-only conversion correction history;
4. deterministic append ordering when timestamps collide;
5. exact-date BCCh safety/no implicit fallback;
6. `PENDING -> RECOGNIZED` ledger transition only after resolved conversion;
7. frozen BCCh provenance in the ledger;
8. rejection of CHILE-source services from `foreign_service_income`;
9. cross-year rejection through Block 01 annual context rules.

`test/tax-ledger-entry.test.mjs` is reconciled so `FOREIGN_SERVICE_INCOME` is now an explicitly supported canonical entry kind/owner rather than an unsupported placeholder.

## Validation evidence

Executed on the implementation branch after the append-order correction:

```text
make bootstrap  -> PASS
make typecheck  -> PASS
make test       -> PASS
make validate   -> PASS
```

The first full `make test` execution exposed a real ordering defect in FX conversion history: SQLite `CURRENT_TIMESTAMP` can collide at second precision, while UUID ordering is not insertion ordering. Production code was corrected to preserve append order using `created_at ASC, rowid ASC`, after which `make test` passed.

No separate visual gate was required because this task introduces no new end-user UI surface.

## Closure

`PTL-TASK-IL-005` is `DONE`.

The domain/storage/provider foundation is now available for `PTL-US-IL-004`, which owns the user-facing classification, Path A settlement and Path B foreign-source editing flows.
