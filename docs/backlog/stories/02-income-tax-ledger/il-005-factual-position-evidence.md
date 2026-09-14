# PTL-US-IL-005 — Factual annual income position — Evidence

**Story:** `PTL-US-IL-005`  
**Status:** `DONE`  
**Priority:** P1  
**UI impact:** `NEW_SECTION`

## Objective

Expose an annual factual income position derived exclusively from the canonical ledger of the active `AnnualTaxWorkspace`.

The section answers factual questions only:

- how many ledger facts exist;
- how much recognized gross amount is registered;
- what withholding / PPM amounts are registered where the owner provider exposes them;
- how those facts divide by ledger category;
- which ledger entries support each category total.

It does not answer final-tax questions.

## Canonical model change

`AnnualTaxLedgerResult.factualSummary` is extended with:

```text
totalsByEntryKind
  <entryKind>
    entryCount
    recognitionCounts
    totalsByCurrency
      <currency>
        gross
        withholding
        ppm
        net
```

Each amount total retains the existing:

```text
amount
presentCount
missingCount
```

semantics.

## Recognition rule

Only `RECOGNIZED` entries contribute monetary totals.

`PENDING` and `EXCLUDED` entries:

- remain counted in `entryCount` / `recognitionCounts`;
- remain visible in the ledger;
- do not inflate recognized factual amounts.

No tax-liability interpretation is added.

## Annual versus filtered views

The factual position is intentionally based on an unfiltered read of the active annual ledger.

The ledger table may still use `entryKind` / recognition filters. This prevents an interaction filter from silently redefining the annual position.

Each category exposes `Ver entradas`, which applies the corresponding `entryKind` filter to the ledger table. This makes the category total traceable to its supporting entries while retaining the unfiltered annual position above it.

## UI content

The section includes:

- `Posición factual anual`;
- annual entry count;
- gross registered amount when present;
- withholding / PPM registered amount when present;
- category cards for the entry kinds present in the active year;
- per-category recognized gross, withholding and PPM;
- per-category recognized / pending / excluded counts;
- `Ver entradas` trace action.

Missing facts render as `No registrado`, not zero by inference.

## Hard boundary

```text
NOT refund forecast
NOT tax liability
NOT readiness percentage
NOT SII reconciliation result
NOT optimization advice
```

No generic ledger mutation, persistence table, acquisition logic or foreign-exchange behavior is introduced.

## Automated coverage

- `test/annual-tax-ledger-read-model.test.mjs`
  - category separation;
  - recognition-state monetary exclusion;
  - withholding/gross category totals.
- `test/annual-income-ledger-frontend.test.mjs`
  - factual-position presentation;
  - category trace action;
  - unfiltered annual read alongside filtered table;
  - explicit non-tax boundary;
  - typed `totalsByEntryKind` client contract.

## Validation evidence

Pre-visual validation completed successfully through the canonical Make façade:

```text
make bootstrap
make typecheck
make test
```

Result: **PASS**.

User visual validation completed successfully.

Confirmed:

- `Posición factual anual` reads as factual context, not a tax outcome;
- overall annual totals remain stable while the ledger table is filtered;
- category cards use product language rather than internal enums;
- absent monetary facts remain `No registrado` rather than inferred zero;
- recognized / pending / excluded counts are understandable;
- `Ver entradas` traces each category to its supporting ledger rows;
- no copy or hierarchy suggests tax liability, refund forecast, readiness, SII reconciliation or optimization.

Result: **USER_VISUAL_APPROVED**.

Canonical closure validation was then executed on the same final head:

```text
make validate
```

Result: **PASS**.

## Closure

`PTL-US-IL-005` is `DONE`.

Closure preserves the architectural boundary:

- factual position remains a read-only derived projection;
- `income_sources` / `fee_receipts` remain mutation authorities;
- no generic ledger mutation or duplicate persistence was introduced;
- no liability, refund, readiness, reconciliation or optimization semantics were introduced.
