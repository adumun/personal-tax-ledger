# PTL-US-IL-005 — Factual annual income position — Evidence

**Story:** `PTL-US-IL-005`  
**Status:** `VISUAL_VALIDATION_PENDING`  
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

## Automated validation

Fresh validation of the current head completed successfully through the canonical Make façade:

```text
make bootstrap
make typecheck
make test
```

Result: **PASS**.

No canonical `make validate` has been executed for this final head yet because the `NEW_SECTION` visual gate is mandatory first.

## Visual validation

Current state: `VISUAL_VALIDATION_PENDING`.

Local visual review must verify:

- `Posición factual anual` is clearly factual and visually subordinate to the annual context;
- overall annual totals do not change when the ledger table is filtered;
- category cards distinguish Renta dependiente / Honorarios-BHE / other categories without raw internal enums;
- `No registrado` is used when a monetary fact is absent rather than inferring zero;
- recognized / pending / excluded counts remain understandable;
- `Ver entradas` filters the supporting ledger rows for that category;
- no copy or hierarchy suggests tax liability, refund forecast, readiness, SII reconciliation or optimization.

After visual approval, the remaining closure gate is:

```text
make validate
```
