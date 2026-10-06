# Block 02 — User Stories

## PTL-US-IL-001 — Ver el ledger anual unificado de ingresos

**Type:** Story  
**Capability:** TAX-04  
**Status:** DONE  
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
**Status:** DONE  
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
**Status:** DONE  
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

## PTL-US-IL-004 — Registrar servicios con pagador extranjero sin duplicar el hecho tributario

**Type:** Story  
**Capability:** TAX-04  
**Related:** `PTL-EXT-01`  
**Status:** DONE  
**Priority:** P1  
**Size:** L  
**Canonical data impact:** CANONICAL_LEDGER  
**UI impact:** NEW_FLOW, FIELD_ADDITION  
**Design fidelity:** L2

### User outcome

Como contractor o prestador de servicios con un pagador extranjero, quiero registrar el hecho económico distinguiendo dónde se prestó materialmente el servicio, conservar el valor original y su conversión explicable cuando corresponda, y evitar duplicar un mismo ingreso si ya existe una BHE canónica.

### Refined domain split

`foreign payer` no implica por sí solo `foreign-source income`.

El flujo debe pedir explícitamente:

```text
payerCountry
serviceSourceJurisdiction = CHILE | FOREIGN
```

#### Path A — servicio prestado materialmente en Chile

- `fee_receipts` / BHE continúa siendo la autoridad del hecho tributario;
- la BHE permanece expresada en CLP;
- un pago recibido en USD u otra moneda se guarda como settlement/provenance vinculada a la BHE;
- ese settlement no genera una segunda entrada de ingreso en el ledger;
- Block 02 no interpreta automáticamente diferencias de cambio como un ingreso adicional de honorarios.

#### Path B — honorario realmente de fuente extranjera

- se crea un hecho propietario `foreign_service_income`;
- reconocimiento por fecha de percepción (`receivedAt`);
- se conservan `originalAmount` y `originalCurrency`;
- la conversión CLP queda congelada con `fxRate`, `fxRateDate`, `fxSource`, `fxSourceReference` y `convertedAt`;
- BCCh es la fuente oficial inicial de FX;
- si la conversión no puede resolverse de forma segura, el hecho queda `PENDING / NEEDS_REVIEW` y no aporta monto CLP reconocido;
- una corrección FX conserva el snapshot anterior en vez de sobrescribirlo destructivamente;
- impuestos pagados/retenidos en el extranjero pueden conservarse como hechos/provenance, pero Block 02 no calcula el crédito del artículo 41 A.

### Acceptance criteria

- pagador extranjero y fuente del ingreso se modelan como dimensiones distintas;
- el usuario no pierde moneda/monto original;
- el año comercial del foreign-source honorarium se deriva de `receivedAt`;
- sólo un foreign-source honorarium con conversión resuelta puede aportar monto CLP `RECOGNIZED` al ledger;
- `FOREIGN_SERVICE_INCOME` se proyecta con owner identity estable y provenance de conversión;
- una BHE CLP con pago en moneda extranjera conserva una sola entrada de ingreso;
- no hay live revaluation de registros históricos;
- no existe fallback FX silencioso para días sin tasa oficial resuelta;
- manual FX requiere fuente/referencia/razón explícitas;
- correcciones preservan conversion history;
- no se presenta foreign-tax-credit entitlement, liability, refund, readiness ni conciliación SII como parte de esta story.

### Implementation state

- annual ledger exposes one explicit `Servicio con pagador extranjero` entry point;
- classification asks payer country and material service location separately;
- Path A persists `fee_receipt_foreign_settlements` as BHE-linked provenance only;
- Path A reuses existing BHE create/edit authority and never registers settlement as a ledger provider;
- Path B creates/edits the dedicated `foreign_service_income` owner;
- official FX unavailable/mismatched remains explicit `NEEDS_REVIEW`;
- manual FX requires rate, rate date, source/reference and reason;
- conversion history remains append-only;
- economic-fact changes invalidate current FX only when perception date, original amount or original currency changes;
- foreign owner `Ver / editar` round-trips through its dedicated flow and reloads the annual ledger.

Browser E2E validation is green for Path A and Path B (`2 passed`). The full corrected-head test suite is green. Human visual validation passed after correcting inline conversion feedback and required/optional field affordances. Canonical `make validate` also passed, including 238/238 tests, desktop syntax checks and architecture checks.

### Dependencies

- `REQUIRES` -> `PTL-SPIKE-IL-002` — DONE
- `REQUIRES` -> `PTL-TASK-IL-005` — DONE
- `REQUIRES` -> `US-IL-001`
- `UI_DEPENDS_ON` -> `DESIGN-IL-004`

Decision evidence: [`spike-il-002-foreign-service-recognition-fx.md`](spike-il-002-foreign-service-recognition-fx.md).  
Enabler evidence: [`task-il-005-evidence.md`](task-il-005-evidence.md).  
Story evidence: [`il-004-foreign-service-flow-evidence.md`](il-004-foreign-service-flow-evidence.md).

---

## PTL-US-IL-005 — Ver la posición anual factual de ingresos

**Type:** Story  
**Capability:** TAX-04  
**Status:** DONE  
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

### Implementation interpretation

- la posición anual se calcula sobre el ledger completo del `AnnualTaxWorkspace` activo, independientemente de los filtros aplicados a la tabla;
- sólo entradas `RECOGNIZED` aportan montos;
- `PENDING` y `EXCLUDED` permanecen visibles como conteos factuales, pero no inflan montos reconocidos;
- el desglose canónico se expresa por `entryKind` y moneda;
- `Ver entradas` aplica el filtro de categoría sobre el mismo ledger para materializar la trazabilidad;
- no se crea persistencia, endpoint de mutación ni cálculo tributario final adicional.

### Closure evidence

- pre-visual Make gates — PASS;
- user visual validation — PASS;
- canonical `make validate` — PASS;
- evidence: `il-005-factual-position-evidence.md`.

### Dependencies

- `REQUIRES` -> `US-IL-001`
- `REQUIRES` -> `PTL-TASK-IL-003`
- `UI_DEPENDS_ON` -> `DESIGN-IL-005`

---

## PTL-US-IL-006 — Conservar trazabilidad, autoridad y aislamiento anual del ledger

**Type:** Story  
**Capability:** TAX-04  
**Status:** DONE  
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
