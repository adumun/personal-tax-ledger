# PTL-SPIKE-IL-002 — Foreign-service recognition and FX provenance

**Type:** Spike  
**Capability:** TAX-04  
**Status:** DECISION_PROPOSED  
**Priority:** P1  
**Blocks:** `PTL-TASK-IL-005`, `PTL-US-IL-004`

## Objective

Close the domain and provenance contract required to represent services with a foreign payer without conflating:

- payer country;
- source of the income;
- Chilean BHE/document semantics;
- payment/settlement currency;
- tax-recognition date;
- CLP conversion;
- foreign tax paid/withheld;
- exchange-rate provenance.

The spike must prevent a foreign-currency settlement from creating a duplicate taxable income fact when a canonical BHE already exists.

## External authority reviewed

### SII — BHE currency

SII states that boletas de honorarios and other tax documents cannot be issued in foreign currency; they must be issued in CLP. Foreign-currency equivalents may be mentioned only as detail.

Source:
- https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0649.htm

### SII — honoraria received from abroad

SII states that honoraria received abroad for professional advisory services must be included in taxable income. The current annual return form explicitly contains `Honorarios líquidos percibidos de fuente extranjera`.

Sources:
- https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2557.htm
- https://www.sii.cl/servicios_online/renta/2026/rentaform.html

### SII — source versus payer location

SII administrative guidance distinguishes the location of the payer from the source of the income. For a Second Category / article 42 N°2 taxpayer, services materially performed in Chile for a foreign company remain Chile-source income and are recognized in the year of perception.

Source:
- https://www.sii.cl/pagina/jurisprudencia/adminis/2004/renta/ja766.htm

This is a critical modeling constraint: `foreign payer != foreign-source income`.

### SII — FX conversion for foreign-source honoraria

SII instructions state that foreign-source article 42 N°2 income is converted to CLP using the observed exchange rate in force at the date of perception.

Source:
- https://www.sii.cl/documentos/circulares/1999/circu05_2.htm

### Banco Central de Chile — exchange-rate authority

BCCh publishes daily exchange rates/parities for generally accepted foreign currencies. The Dólar Observado is CLP per USD; other nominal CLP exchange rates are derived from the published foreign-currency parity and the observed dollar. Values are published for banking business days and are not subject to later statistical revision.

Sources:
- https://www.bcentral.cl/es/areas/estadisticas/tipos-de-cambios-y-paridades
- https://www.bcentral.cl/es/areas/estadisticas/preguntas-frecuentes-estadisticas
- https://www.bcentral.cl/documents/33528/2546026/Paridades%2BFicha%2Bmetodologica.pdf

## Decision 1 — payer country and income source are separate dimensions

The canonical model MUST carry these concepts independently:

```text
payerCountry
serviceSourceJurisdiction = CHILE | FOREIGN
```

The UI MUST NOT infer `FOREIGN` source merely because `payerCountry != CL`.

For the initial executable scope, the user explicitly classifies where the service was materially performed. Automatic tax-source inference is out of scope.

## Decision 2 — two canonical paths, not one generic foreign-service row

### Path A — foreign payer, Chile-source professional service

```text
payerCountry != CL
serviceSourceJurisdiction = CHILE
```

Canonical tax fact:

```text
fee_receipts / BHE
```

Rules:

- the BHE amount remains CLP because the tax document itself is CLP;
- a foreign-currency payment is settlement/provenance, not another income fact;
- the ledger MUST NOT create both a `DOMESTIC_FEE_INCOME`/BHE row and a second foreign-service income row for the same economic service;
- payment currency, received amount and payment-provider/bank reference may be linked as settlement metadata;
- any exchange difference between the foreign-currency payment and the CLP BHE amount is not automatically interpreted as an additional taxable professional-fee amount in Block 02.

### Path B — actual foreign-source honorarium

```text
serviceSourceJurisdiction = FOREIGN
```

Canonical tax fact:

```text
foreign_service_income
```

This fact is independent from `fee_receipts` because a Chilean BHE is not the canonical document/value authority for a genuinely foreign-source honorarium.

## Decision 3 — recognition date

For `foreign_service_income`, recognition is perception-based.

Canonical field:

```text
receivedAt
```

Rules:

- the commercial year is derived from the perception date;
- invoice/contract/service-completion dates are preserved as documentary/business provenance but do not replace `receivedAt` as the Block 02 recognition date;
- a record without a known perception date is `PENDING` and MUST NOT contribute recognized monetary totals.

## Decision 4 — original value is immutable factual identity

A recognized foreign-source record MUST preserve:

```text
originalAmount
originalCurrency
receivedAt
```

These values describe the economic receipt and MUST NOT be overwritten merely because a later exchange-rate correction is recorded.

Supported currency identifiers use ISO 4217 codes where applicable.

## Decision 5 — CLP tax value is a conversion snapshot, not a live recalculation

The canonical conversion snapshot is:

```text
clpAmount
fxRate
fxRateDate
fxSource
fxSourceReference
convertedAt
conversionStatus
```

Initial source contract:

```text
fxSource = BCCH
```

For USD, the source series is Dólar Observado. For other BCCh-supported currencies, the official nominal CLP exchange rate/parity publication is used.

The conversion used by the record is frozen as historical provenance. A later change in current market FX MUST NOT silently revalue historical recognized income.

## Decision 6 — non-banking-day / unavailable-rate safety

Block 02 MUST NOT silently invent a weekend/holiday FX convention.

If no official BCCh rate can be resolved for the exact legal/effective perception date under the provider contract:

```text
conversionStatus = NEEDS_REVIEW
recognitionState = PENDING
```

The record may preserve the original receipt immediately, but it MUST NOT contribute a CLP recognized amount until the conversion is explicitly resolved with auditable provenance.

A later implementation MAY introduce a formally researched effective-date/fallback rule, but it must not be smuggled in as an implicit `previous business day` assumption.

## Decision 7 — manual FX is allowed only as explicit provenance fallback

When an official automatic lookup cannot resolve the conversion, a user may record an explicit conversion snapshot:

```text
fxSource = MANUAL
fxRate
fxRateDate
fxSourceReference
fxReason
```

Requirements:

- manual values are visibly marked as manual;
- source/reference and reason are mandatory;
- the original amount/currency remain unchanged;
- no silent replacement of an existing conversion is allowed.

This fallback is evidence-preserving, not an automatic tax-rule inference.

## Decision 8 — corrections are append-only conversion provenance

A conversion correction MUST preserve history.

Target model:

```text
foreign_service_income
  currentConversionId

foreign_service_fx_conversions
  id
  foreignServiceIncomeId
  originalAmount
  originalCurrency
  fxRate
  fxRateDate
  fxSource
  fxSourceReference
  fxReason
  clpAmount
  createdAt
  supersedesConversionId?
```

Only one conversion is current, but previous conversion snapshots remain queryable. Correction is not destructive overwrite.

Changing `originalAmount`, `originalCurrency` or `receivedAt` is an economic-fact correction and must be treated separately from an FX correction.

## Decision 9 — foreign tax withholding is provenance, not Block 02 tax-credit calculation

A foreign-source honorarium MAY preserve factual foreign tax information:

```text
foreignTaxAmountOriginal?
foreignTaxCurrency?
foreignTaxPaidAt?
foreignTaxDocumentReference?
```

Block 02 does not calculate article 41 A credit entitlement or annual credit limits. Those facts are captured for later tax-credit capability/reconciliation.

## Decision 10 — ledger projection semantics

The ledger gains a new executable entry kind only for Path B:

```text
FOREIGN_SERVICE_INCOME
```

Projection:

```text
ownerAggregate = FOREIGN_SERVICE_INCOME
ownerRecordId = foreign_service_income.id
occurredOn = receivedAt
recognitionState = RECOGNIZED | PENDING | EXCLUDED
amounts.currency = CLP when conversion is resolved
amounts.gross = clpAmount when recognized
```

The provenance summary MUST retain original currency/amount and conversion identity so the CLP projection remains explainable.

Path A remains projected from `fee_receipts`; linked FX settlement metadata MUST NOT generate another ledger entry.

## Decision 11 — proposed storage boundary

`PTL-TASK-IL-005` should introduce dedicated storage rather than overloading `income_sources` or `fee_receipts`:

```text
foreign_service_income
foreign_service_fx_conversions
```

Rationale:

- different recognition semantics;
- original-currency factual identity;
- append-only conversion provenance;
- optional foreign-tax evidence;
- prevents BHE and foreign-source semantics from being mixed in a single aggregate.

The exact SQLite migration is implementation work for `PTL-TASK-IL-005`, not part of this spike.

## Invariants

1. `foreign payer != foreign-source income`.
2. A CLP BHE remains the canonical tax fact when the service is Chile-source and represented by BHE.
3. FX settlement linked to a BHE is not a second income fact.
4. Genuine foreign-source honoraria are recognized on perception.
5. Original amount/currency are always preserved.
6. CLP conversion is historically frozen with explicit source/date/rate provenance.
7. Unresolved conversion cannot silently contribute a recognized CLP total.
8. Corrections preserve prior conversion snapshots.
9. Block 02 does not calculate foreign-tax credit entitlement.
10. No live-market revaluation of historical recognized records.

## Out of scope

- automatic legal determination of source jurisdiction;
- article 41 A foreign-tax-credit calculation;
- banking fees and spread optimization;
- accounting FX gains/losses;
- crypto settlement;
- unsupported-currency triangulation without an explicit authority contract;
- SII reconciliation/import;
- documentary evidence vault.

## Consequence for PTL-US-IL-004

`PTL-US-IL-004` should be refined from a vague “foreign payer = foreign income” flow into an explicit classification flow:

```text
foreign payer
  -> where was the service materially performed?
     -> CHILE
        -> BHE owner flow + optional foreign-currency settlement provenance
     -> FOREIGN
        -> foreign_service_income + perception-based BCCh conversion snapshot
```

This prevents duplicate facts and gives `PTL-TASK-IL-005` an executable persistence/provider contract.

## Spike closure criteria

The spike can move to `DONE` when the project accepts these decisions and updates:

- `PTL-US-IL-004`;
- `DESIGN-IL-004`;
- `PTL-TASK-IL-005`;
- Block 02 dependency/status documents.

No runtime code change is required to close the spike itself.
