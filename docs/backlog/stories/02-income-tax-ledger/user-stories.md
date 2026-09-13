# Block 02 — User Stories

## PTL-US-IL-001 — Ver el ledger anual unificado de ingresos

**Type:** Story  
**Capability:** TAX-04  
**Status:** REFINING  
**Priority:** P0  
**Size:** M  
**Canonical data impact:** DERIVED_PROJECTION  
**UI impact:** NEW_SECTION, FLOW_CHANGE  
**Design fidelity:** L2

### User outcome

Como contribuyente, quiero ver en un solo ledger los ingresos del año activo para entender qué hechos existen, de qué tipo son y cuál es su estado sin navegar por modelos técnicos separados.

### Acceptance criteria

- muestra únicamente hechos del `AnnualTaxWorkspace` activo;
- renta dependiente/otras fuentes y BHE aparecen como entradas normalizadas pero conservan tipo y origen;
- cada entrada conserva referencia a su agregado propietario y registro canónico;
- filtros por tipo/estado no cambian la autoridad de los hechos;
- ausencia se expresa como `No registrado`, no como ingreso cero;
- no muestra liability, refund, readiness ni reconciliación SII como si fueran parte del ledger factual.

### Dependencies

- `REQUIRES` -> `PTL-TASK-IL-001`
- `REQUIRES` -> `PTL-TASK-IL-002`
- `REQUIRES` -> `PTL-TASK-IL-003`
- `UI_DEPENDS_ON` -> `DESIGN-IL-001`

---

## PTL-US-IL-002 — Mantener renta dependiente desde el contexto del ledger

**Type:** Story  
**Capability:** TAX-04  
**Status:** REFINING  
**Priority:** P0  
**Size:** M  
**Canonical data impact:** CANONICAL_LEDGER  
**UI impact:** FLOW_CHANGE, FIELD_REUSE  
**Design fidelity:** L2

### User outcome

Como contribuyente con uno o más empleadores, quiero registrar y corregir mis hechos de renta dependiente desde el año activo y verlos inmediatamente reflejados en el ledger.

### Acceptance criteria

- las altas/ediciones continúan escribiendo en el agregado propietario de income source;
- el ledger se actualiza desde la proyección, no mediante dual-write;
- empleador, período/año, montos y componentes previsionales existentes conservan su semántica actual;
- una edición stale o cross-year se rechaza por las reglas de Block 01;
- APV de planilla no se duplica al proyectar el hecho en TAX-04.

### Dependencies

- `REQUIRES` -> `US-IL-001`
- `REQUIRES` -> trusted annual context from Block 01
- `UI_DEPENDS_ON` -> `DESIGN-IL-002`

---

## PTL-US-IL-003 — Mantener BHE/honorarios nacionales desde el ledger

**Type:** Story  
**Capability:** TAX-04  
**Status:** REFINING  
**Priority:** P0  
**Size:** M  
**Canonical data impact:** CANONICAL_LEDGER  
**UI impact:** FLOW_CHANGE, FIELD_REUSE  
**Design fidelity:** L2

### User outcome

Como contribuyente que emite BHE, quiero administrar los hechos de honorarios del año activo y ver su bruto, retención/PPM y estado factual dentro del mismo ledger anual.

### Acceptance criteria

- `fee_receipts` sigue siendo autoridad de BHE;
- bruto, líquido, retención/PPM y estados existentes no se reinterpretan por conveniencia del ledger;
- BHE anulada conserva su estado y no se presenta como ingreso tributario realizado si el dominio actual la excluye;
- la proyección permite distinguir BHE de renta dependiente;
- no se inventa conciliación SII ni evidencia documental.

### Dependencies

- `REQUIRES` -> `US-IL-001`
- `UI_DEPENDS_ON` -> `DESIGN-IL-003`

---

## PTL-US-IL-004 — Registrar ingreso por servicios con pagador extranjero

**Type:** Story  
**Capability:** TAX-04  
**Related:** `PTL-EXT-01`  
**Status:** BLOCKED  
**Priority:** P1  
**Size:** L  
**Canonical data impact:** CANONICAL_LEDGER  
**UI impact:** NEW_FLOW, FIELD_ADDITION  
**Design fidelity:** L2

### User outcome

Como contractor o prestador de servicios a un pagador extranjero, quiero registrar el hecho económico en su moneda original y conservar una conversión/provenance explicable para integrarlo al año tributario sin perder el valor original.

### Blocking decision

`PTL-SPIKE-IL-002` debe cerrar:

- fecha de reconocimiento relevante;
- moneda original y monto original;
- valor CLP canónico/proyectado;
- fuente y fecha de tipo de cambio;
- tratamiento cuando existe BHE en CLP pero pago en moneda extranjera;
- corrección/revaluación sin sobrescribir provenance histórica.

No se implementará FX automático antes de ese contrato.

---

## PTL-US-IL-005 — Ver la posición anual factual de ingresos

**Type:** Story  
**Capability:** TAX-04  
**Status:** REFINING  
**Priority:** P1  
**Size:** M  
**Canonical data impact:** DERIVED_PROJECTION  
**UI impact:** NEW_SECTION  
**Design fidelity:** L2

### User outcome

Como contribuyente, quiero ver cuánto ingreso factual está registrado por categoría y qué retenciones/PPM constan para el año, sin confundir ese resumen con mi impuesto anual final.

### Acceptance criteria

- totales se derivan del ledger canónico del año activo;
- separa categorías relevantes en vez de colapsarlas en un único monto opaco;
- distingue bruto/factual de retenciones/PPM cuando el proveedor dispone del dato;
- no presenta refund/payment, liability, optimización ni readiness;
- cada total es trazable a entradas del ledger.

### Dependencies

- `REQUIRES` -> `US-IL-001`
- `REQUIRES` -> `PTL-TASK-IL-003`
- `UI_DEPENDS_ON` -> `DESIGN-IL-005`

---

## PTL-US-IL-006 — Conservar trazabilidad, autoridad y aislamiento anual del ledger

**Type:** Story  
**Capability:** TAX-04  
**Status:** REFINING  
**Priority:** P0  
**Size:** S  
**Canonical data impact:** NONE  
**UI impact:** STATE_CHANGE  
**Design fidelity:** L1

### User outcome

Como contribuyente, quiero que cada entrada del ledger pueda explicar de dónde proviene y que ninguna acción desde el ledger pueda mover o sobrescribir hechos de otro año o agregado.

### Acceptance criteria

- toda entrada expone owner aggregate + owner record id estable;
- mutaciones se delegan al agregado propietario;
- cambiar de año invalida respuestas stale igual que en Block 01;
- una entrada no puede cambiar de tipo/propietario mediante edición genérica;
- provenance futura de TAX-02/TAX-03/TAX-05 se adjunta sin sustituir identidad canónica.
