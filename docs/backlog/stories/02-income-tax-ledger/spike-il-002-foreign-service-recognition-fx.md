# PTL-SPIKE-IL-002 — Foreign-service recognition and FX provenance

**Type:** Spike  
**Capability:** TAX-04  
**Status:** DONE  
**Priority:** P1  
**Unblocks:** `PTL-TASK-IL-005`, `PTL-US-IL-004`

## Closure

Decision accepted by product on 2026-09-14. This spike is now the canonical contract for foreign-service recognition and FX provenance in Block 02.

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

The spike prevents a foreign-currency settlement from creating a duplicate taxable income fact when a canonical BHE already exists.

## Accepted decisions

### 1. Payer country and income source are separate dimensions

```text
payerCountry
serviceSourceJurisdiction = CHILE | FOREIGN
```

The system MUST NOT infer `FOREIGN` source merely because `payerCountry != CL`. For the initial executable scope, the user explicitly classifies where the service was materially performed.

### 2. Two canonical paths

#### Path A — foreign payer, Chile-source professional service

```text
payerCountry != CL
serviceSourceJurisdiction = CHILE
```

Canonical fact remains `fee_receipts / BHE`.

- BHE amount remains CLP;
- foreign-currency payment is settlement/provenance, not another income fact;
- the ledger MUST NOT create both a BHE row and a second foreign-service row for the same economic service;
- settlement currency/reference may be linked as metadata;
- exchange differences are not automatically interpreted as additional taxable professional-fee income in Block 02.

#### Path B — genuine foreign-source honorarium

```text
serviceSourceJurisdiction = FOREIGN
```

Canonical fact is `foreign_service_income`, independent from `fee_receipts`.

### 3. Recognition date

Foreign-source honoraria are perception-based.

```text
receivedAt
```

- commercial year derives from `receivedAt`;
- invoice/contract/service-completion dates remain provenance only;
- unknown perception date => `PENDING` and no recognized monetary total.

### 4. Original value is preserved

```text
originalAmount
originalCurrency
receivedAt
```

These describe the economic receipt and are not overwritten by later FX corrections. ISO 4217 codes are used where applicable.

### 5. CLP value is a frozen conversion snapshot

```text
clpAmount
fxRate
fxRateDate
fxSource
fxSourceReference
convertedAt
conversionStatus
```

Initial official source contract:

```text
fxSource = BCCH
```

USD uses Dólar Observado; other supported currencies use the applicable BCCh nominal/parity publication. Historical recognized records MUST NOT be silently revalued by later market movements.

### 6. Non-banking-day / unavailable-rate safety

No implicit previous-business-day fallback is authorized.

If no official rate can be resolved safely for the effective perception date:

```text
conversionStatus = NEEDS_REVIEW
recognitionState = PENDING
```

The original receipt may be stored, but it does not contribute a recognized CLP amount until resolved with explicit provenance.

### 7. Manual FX fallback requires explicit provenance

```text
fxSource = MANUAL
fxRate
fxRateDate
fxSourceReference
fxReason
```

Manual values must be visibly marked, reference/reason are mandatory, and original amount/currency remain unchanged.

### 8. FX corrections are append-only

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

Prior conversion snapshots remain queryable. Changes to original amount/currency/receivedAt are economic-fact corrections, distinct from FX corrections.

### 9. Foreign tax is factual provenance only in Block 02

Optional factual fields may include:

```text
foreignTaxAmountOriginal?
foreignTaxCurrency?
foreignTaxPaidAt?
foreignTaxDocumentReference?
```

Article 41 A credit entitlement/calculation remains out of scope.

### 10. Ledger projection semantics

New executable entry kind for genuine foreign-source path only:

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

Provenance retains original amount/currency and conversion identity. Path A continues to project from `fee_receipts` only.

### 11. Storage boundary

`PTL-TASK-IL-005` SHALL introduce dedicated storage rather than overload `income_sources` or `fee_receipts`:

```text
foreign_service_income
foreign_service_fx_conversions
```

## Invariants

1. `foreign payer != foreign-source income`.
2. A CLP BHE remains canonical when the service is Chile-source and represented by BHE.
3. FX settlement linked to a BHE is not a second income fact.
4. Genuine foreign-source honoraria are recognized on perception.
5. Original amount/currency are preserved.
6. CLP conversion is frozen with explicit source/date/rate provenance.
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

## External authority reviewed

- SII — BHE currency: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0649.htm
- SII — honoraria received from abroad: https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2557.htm
- SII — annual return form: https://www.sii.cl/servicios_online/renta/2026/rentaform.html
- SII — source versus payer location: https://www.sii.cl/pagina/jurisprudencia/adminis/2004/renta/ja766.htm
- SII — FX conversion for foreign-source honoraria: https://www.sii.cl/documentos/circulares/1999/circu05_2.htm
- Banco Central de Chile — exchange rates/parities: https://www.bcentral.cl/es/areas/estadisticas/tipos-de-cambios-y-paridades
- Banco Central de Chile — statistical FAQ: https://www.bcentral.cl/es/areas/estadisticas/preguntas-frecuentes-estadisticas

## Consequence for PTL-US-IL-004

The story is unblocked and must implement an explicit classification flow:

```text
foreign payer
  -> where was the service materially performed?
     -> CHILE
        -> BHE owner flow + optional foreign-currency settlement provenance
     -> FOREIGN
        -> foreign_service_income + perception-based BCCh conversion snapshot
```

## Closure result

```text
PTL-SPIKE-IL-002 = DONE
PTL-TASK-IL-005 = READY
PTL-US-IL-004 = READY_AFTER_TASK_IL_005
```
