# Block 02 — Design Contract

## DESIGN-IL-001 — Annual Income Ledger

**Surface:** `Ingresos` / annual ledger  
**Fidelity:** L2

### Structure

```text
Ingresos del año
  Contexto: Año comercial / AT
  Resumen factual
    Entradas registradas
    Bruto registrado
    Retenciones / PPM registrados (when available)
  Filtros
    Tipo
    Estado
  Ledger
    Fecha/período
    Tipo
    Pagador/empleador
    Bruto / monto factual
    Retención/PPM when applicable
    Estado
    Origen
    Acción
```

### Entry types initially visible

- Renta dependiente / income source;
- Honorarios / BHE nacional;
- other existing income-source kinds when the owner aggregate already supports them.

`FOREIGN_SERVICE_INCOME` is now executable through the accepted `PTL-SPIKE-IL-002` decision and closed `PTL-TASK-IL-005` owner/value contract.

### States

- `LOADING`
- `EMPTY`
- `READY`
- `ERROR`
- `STALE_SUPPRESSED`

Empty state copy must mean `No hay ingresos registrados para este año`, never `$0 de ingresos` when no fact exists.

### Actions

Generic ledger actions resolve to owner flows:

- `Ver / editar` -> owner aggregate editor;
- `Agregar renta dependiente` -> existing income source flow;
- `Agregar BHE` -> existing fee receipt flow;
- `Servicio con pagador extranjero` -> explicit source-jurisdiction classification before choosing canonical owner.

There is no generic `edit ledger row` mutation.

## DESIGN-IL-002 — Dependent income editing

Reuse the existing salary/income editor semantics. When entered from the ledger, the UI must identify the active annual context and return to the same annual ledger after save/cancel.

Do not collapse AFP, health, APV, withholding or notes into a generic amount-only editor.

## DESIGN-IL-003 — Domestic BHE editing

Reuse the existing BHE form and statuses. The ledger shell may summarize the record, but detailed fields remain in the BHE domain surface.

A cancelled BHE must remain visibly distinguishable and must not be visually presented as an ordinary realized income row.

## DESIGN-IL-004 — Foreign payer / foreign-source service classification

**Status:** `IMPLEMENTED / AUTOMATED_VALIDATION_PENDING`  
**Fidelity:** L2

The flow must not equate a foreign payer with foreign-source income.

### Entry decision

```text
Servicio con pagador extranjero
  País del pagador
  ¿Dónde se prestó materialmente el servicio?
    Chile
    Extranjero
```

The two answers route to different canonical owners.

### Path A — service materially performed in Chile

Product language should explain that the tax fact remains the Chilean honorarium/BHE flow.

```text
Servicio prestado en Chile
  -> usar / crear BHE en CLP
  -> opcional: registrar cómo se recibió el pago en moneda extranjera
```

The payment/settlement surface may capture:

- currency received;
- amount received;
- payment date;
- payment-provider/bank reference;
- notes.

It must clearly state that this settlement does not create a second income row in the annual ledger.

### Path B — genuinely foreign-source honorarium

The foreign-source editor must capture:

```text
Pagador
País del pagador
Fecha de percepción
Monto original
Moneda original
Origen del servicio = Extranjero
Conversión a CLP
  Estado
  Tipo de cambio
  Fecha del tipo de cambio
  Fuente
  Referencia
```

Optional factual fields may include foreign tax paid/withheld and documentary reference, but the UI must not imply that the app has calculated a foreign-tax credit entitlement.

### Conversion states

- `RESOLVED` — CLP conversion has auditable provenance;
- `NEEDS_REVIEW` — no safe automatic conversion was resolved;
- `SUPERSEDED` — historical conversion retained after correction.

When conversion is `NEEDS_REVIEW`, the record may exist but must remain visibly pending and must not present a recognized CLP total as if final.

### Manual conversion

Manual FX is permitted only when the user explicitly records:

- rate;
- rate date;
- source/reference;
- reason.

It must be visually distinguishable from BCCh-resolved conversion.

### Correction behavior

An FX correction creates a new conversion snapshot and preserves the prior one. The UI must not overwrite conversion history invisibly.

Changing original amount/currency/perception date is an economic-fact correction, not merely an FX correction. Changes that do not affect those conversion inputs preserve the currently valid conversion pointer.

### Implemented interaction

- the annual ledger exposes `+ Servicio con pagador extranjero`;
- Path A reuses BHE as owner and persists a one-to-one `fee_receipt_foreign_settlements` provenance record;
- Path A settlement is never registered as a second `TaxLedgerEntry`;
- Path B creates/edits `foreign_service_income` and exposes current conversion plus append-only history;
- official conversion failure remains explicit `NEEDS_REVIEW`; no rate is guessed;
- manual conversion requires all provenance fields from this contract;
- `FOREIGN_SERVICE_INCOME` rows resolve `Ver / editar` to their owner-specific editor rather than a generic ledger mutation.

### Hard boundary

The foreign-service flow does not own:

- automatic legal determination of source jurisdiction;
- article 41 A credit calculation;
- accounting FX gains/losses;
- optimization advice;
- SII reconciliation;
- documentary evidence vault.

Decision evidence: [`spike-il-002-foreign-service-recognition-fx.md`](spike-il-002-foreign-service-recognition-fx.md).  
Implementation evidence: [`il-004-foreign-service-flow-evidence.md`](il-004-foreign-service-flow-evidence.md).

## DESIGN-IL-005 — Factual annual income position

A compact section above or adjacent to the ledger may show:

- entry count;
- factual gross by category;
- registered withholding/PPM by category/provider when meaningful.

The annual position is derived from the complete active-year ledger and remains stable when interaction filters are applied to the ledger table. Category-level `Ver entradas` actions may apply the corresponding category filter to the table to expose supporting rows without redefining the annual position.

Missing monetary facts are represented as `No registrado`; absence must not be inferred as zero. Only `RECOGNIZED` entries contribute monetary totals, while `PENDING` and `EXCLUDED` remain visible as factual counts.

Hard boundary:

```text
NOT refund forecast
NOT tax liability
NOT readiness percentage
NOT SII reconciliation result
NOT optimization advice
```

## Responsive/accessibility

- table may become stacked ledger cards on narrow viewports;
- type/status/origin must not rely on color alone;
- filters and actions require explicit accessible labels;
- amounts include currency/unit context;
- loading/error states remain announced and recoverable;
- year context remains visible or programmatically associated with the ledger surface.
