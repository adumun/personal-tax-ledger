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

Foreign-service income is not shown as a fake supported type until `SPIKE-IL-002` closes its value/provenance contract.

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
- `Agregar BHE` -> existing fee receipt flow.

There is no generic `edit ledger row` mutation.

## DESIGN-IL-002 — Dependent income editing

Reuse the existing salary/income editor semantics. When entered from the ledger, the UI must identify the active annual context and return to the same annual ledger after save/cancel.

Do not collapse AFP, health, APV, withholding or notes into a generic amount-only editor.

## DESIGN-IL-003 — Domestic BHE editing

Reuse the existing BHE form and statuses. The ledger shell may summarize the record, but detailed fields remain in the BHE domain surface.

A cancelled BHE must remain visibly distinguishable and must not be visually presented as an ordinary realized income row.

## DESIGN-IL-004 — Foreign-service income

Reserved. No executable UI until `PTL-SPIKE-IL-002` closes FX recognition and provenance.

Required eventual fields include original currency/amount and explicit conversion provenance; exact copy remains unresolved until the spike closes.

## DESIGN-IL-005 — Factual annual income position

A compact section above or adjacent to the ledger may show:

- entry count;
- factual gross by category;
- registered withholding/PPM by category/provider when meaningful.

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
