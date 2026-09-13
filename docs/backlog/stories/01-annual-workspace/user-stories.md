# Block 01 — User Stories

## PTL-US-AW-001 — Seleccionar y entrar a un año tributario

**Type:** Story  
**Capability:** TAX-01  
**Status:** REFINING  
**Priority:** P0  
**Size:** S  
**Canonical data impact:** NONE  
**UI impact:** NEW_SECTION, FLOW_CHANGE  
**Design fidelity:** L1

### User outcome

Como contribuyente, quiero seleccionar el año comercial en el que estoy trabajando para que todas las pantallas, cálculos y registros se interpreten dentro del contexto anual correcto.

### Context

Hoy el año existe como `settings.year` y se modifica desde Configuración tributaria. El comportamiento ya filtra varias entidades por año, pero el contexto anual no está modelado explícitamente como workspace.

### In scope

- selector visible del año comercial actual;
- visualización derivada de la Operación Renta correspondiente (`2026 -> AT2027`);
- cambio de workspace sin mezclar datos de otro año;
- feedback de carga/cambio;
- preservación de una ubicación de navegación válida cuando el cambio de año no invalide la superficie.

### Out of scope

- crear un año inexistente;
- copiar información de años anteriores;
- cerrar/reabrir el año;
- calcular readiness o Annual Tax Health.

### Business rules

1. El contexto canónico editable es `commercialYear`; el año tributario/AT es derivado.
2. Cambiar de año no modifica hechos pertenecientes al año abandonado.
3. Si el año solicitado no existe, la UI no lo crea silenciosamente; deriva al flujo de creación.
4. El cambio debe ser observable y no debe mostrar datos del año anterior como si fueran del nuevo mientras la carga sigue pendiente.

### Acceptance criteria

- **AC-01:** dado que existen workspaces 2025 y 2026, al seleccionar 2025 la aplicación muestra explícitamente `Año comercial 2025 · Operación Renta AT2026`.
- **AC-02:** todos los datos visibles que dependan del contexto anual son recargados para 2025 antes de declararse completado el cambio.
- **AC-03:** durante la transición existe estado `LOADING/IN_PROGRESS` honesto.
- **AC-04:** si falla la carga, el usuario recibe un error recuperable y el workspace previamente válido permanece identificable; no se presenta mezcla parcial como éxito.
- **AC-05:** seleccionar un año no existente inicia o propone el flujo de `PTL-US-AW-002`; no genera registros implícitos.
- **AC-06:** el selector no permite editar independientemente el `AT` derivado.

### UX contract

Surface: persistent Workspace Context Header.  
Design: `DESIGN-AW-001` in `design-contract.md`.

### Dependencies

- `REQUIRES` -> `PTL-TASK-AW-001`
- `REQUIRES` -> `PTL-TASK-AW-002`
- `UI_DEPENDS_ON` -> `DESIGN-AW-001`
- `ENABLES` -> all later year-scoped stories.

### DoR additions

- workspace identity contract agreed;
- migration behavior from current `settings.year` defined;
- L1 header contract reviewed.

### DoD additions

- switch-year tests prove no cross-year leakage;
- UI shows truthful loading/error states;
- existing fee/mortgage/income switching behavior remains regression-tested.

---

## PTL-US-AW-002 — Crear un nuevo workspace anual

**Type:** Story  
**Capability:** TAX-01  
**Status:** REFINING  
**Priority:** P0  
**Size:** M  
**Canonical data impact:** CANONICAL_LEDGER  
**UI impact:** NEW_SCREEN, FLOW_CHANGE  
**Design fidelity:** L2

### User outcome

Como contribuyente, quiero crear explícitamente un nuevo año de trabajo tributario para comenzar a registrar y preparar ese período sin copiar accidentalmente hechos de otro año.

### In scope

- creación de workspace por año comercial;
- AT derivado visible antes de confirmar;
- validación de duplicados;
- opción inicial `Empezar vacío`;
- opción separada `Inicializar desde año anterior`, delegada a AW-003;
- navegación al workspace creado.

### Out of scope

- generar automáticamente ingresos/boletas/documentos;
- importar SII;
- clonar datos sin confirmación.

### Business rules

1. Sólo puede existir un workspace canónico por `commercialYear` dentro del perfil local activo.
2. La creación vacía no copia hechos tributarios, evidencia ni conciliaciones.
3. El workspace nace con lifecycle `OPEN/PREPARING` o vocabulario equivalente que luego pueda componer con TAX-11 sin redefinir cierre.
4. El año no puede quedar fuera del rango soportado por reglas sin advertencia/bloqueo explícito.

### Acceptance criteria

- **AC-01:** el usuario puede iniciar `Crear año tributario` desde el contexto anual.
- **AC-02:** el diálogo muestra `Año comercial` y el `AT` derivado antes de confirmar.
- **AC-03:** si el año ya existe, la creación se bloquea y ofrece abrir ese workspace.
- **AC-04:** `Empezar vacío` crea únicamente el workspace y su configuración base; no aparecen ingresos, BHE, hipotecas, APV, evidencia ni reconciliaciones copiadas.
- **AC-05:** después de crear, el nuevo workspace pasa a ser contexto activo.
- **AC-06:** errores de persistencia no dejan un workspace visible como creado si la operación no quedó confirmada.

### UX contract

Surface: `Create Annual Workspace` modal/screen.  
Design: `DESIGN-AW-002`.

### Dependencies

- `REQUIRES` -> `PTL-TASK-AW-001`
- `REQUIRES` -> `PTL-TASK-AW-002`
- `RULE_DEPENDS_ON` -> `PTL-TASK-AW-007`
- `UI_DEPENDS_ON` -> `DESIGN-AW-002`
- `ENABLES` -> AW-003, AW-004, AW-005.

### DoD additions

- duplicate-year and failure-path tests;
- creation is atomic from user perspective;
- no transactional facts copied in empty mode.

---

## PTL-US-AW-003 — Inicializar un año desde el período anterior sin copiar hechos tributarios

**Type:** Story  
**Capability:** TAX-01  
**Status:** REFINING  
**Priority:** P1  
**Size:** M  
**Canonical data impact:** CANONICAL_LEDGER  
**UI impact:** FLOW_CHANGE, STATE_CHANGE  
**Design fidelity:** L2

### User outcome

Como contribuyente recurrente, quiero reutilizar sólo configuraciones estructurales de un año anterior para reducir trabajo repetitivo sin transformar información histórica en hechos del nuevo ejercicio.

### In scope

- seleccionar año fuente;
- preview de categorías reutilizables;
- copiar únicamente información explícitamente clasificada `REUSABLE_CONFIGURATION`;
- conservar provenance `copied_from_year`;
- confirmación antes de ejecutar.

### Initial reusable candidates

- preferencias/configuración anual no transaccional compatibles;
- estructura de fuentes recurrentes como borrador/template, no como ingreso realizado;
- applicability profile como propuesta revisable.

### Explicitly forbidden copy

- montos realizados;
- BHE emitidas/pagadas;
- retenciones/PPM pagados;
- movimientos de ledger;
- evidencia documental;
- estado SII/reconciliación;
- cierre/readiness del año anterior;
- resultados calculados/proyecciones históricas como hechos actuales.

### Acceptance criteria

- **AC-01:** antes de confirmar, el usuario ve qué categorías serán reutilizadas y cuáles no.
- **AC-02:** el sistema nunca presenta una fuente recurrente copiada como ingreso efectivamente percibido en el nuevo año.
- **AC-03:** todo elemento derivado del año anterior conserva provenance suficiente para explicar su origen.
- **AC-04:** el usuario puede desmarcar categorías opcionales antes de inicializar.
- **AC-05:** una inicialización parcial/fallida no declara éxito ni mezcla silenciosamente estado incompleto.
- **AC-06:** repetir la operación no genera duplicación silenciosa; debe ser idempotente o requerir resolución explícita.

### UX contract

Surface: second step of `Create Annual Workspace` and reusable-configuration preview.  
Design: `DESIGN-AW-003`.

### Dependencies

- `REQUIRES` -> AW-002
- `REQUIRES` -> `PTL-TASK-AW-004`
- `DATA_DEPENDS_ON` -> `PTL-TASK-AW-003`
- `UI_DEPENDS_ON` -> `DESIGN-AW-003`

### Risks

The exact reusable configuration set may evolve as later TAX blocks mature. The copy contract therefore must be allowlisted, never inferred from table presence.

---

## PTL-US-AW-004 — Definir el perfil de aplicabilidad tributaria anual

**Type:** Story  
**Capability:** TAX-01  
**Related:** TAX-06  
**Status:** REFINING  
**Priority:** P0  
**Size:** M  
**Canonical data impact:** CANONICAL_LEDGER  
**UI impact:** NEW_SECTION, FIELD_ADDITION  
**Design fidelity:** L2

### User outcome

Como contribuyente, quiero declarar qué situaciones tributarias espero que apliquen durante el año para que PTL pueda preparar requisitos y flujos relevantes incluso antes de que exista toda la evidencia o los movimientos reales.

### Principle

`Applicability profile != actual tax facts`.

El perfil expresa expectativa/aplicabilidad y puede incluir `YES / NO / UNKNOWN`. Los hechos efectivos se originarán en sus capacidades correspondientes y pueden luego confirmar o contradecir el perfil.

### Accepted profile dimensions

`PTL-SPIKE-AW-001` cerró el conjunto mínimo para Block 01:

- `DEPENDENT_INCOME` — renta dependiente esperada;
- `DOMESTIC_FEE_INCOME` — honorarios/BHE nacionales esperados;
- `FOREIGN_SERVICE_INCOME` — servicios/honorarios con pagador extranjero esperados;
- `APV_CONTRIBUTIONS` — APV esperado durante el período;
- `MORTGAGE_INTEREST` — crédito hipotecario potencialmente relevante.

Estas dimensiones son flags de aplicabilidad/expectativa, no montos ni evidencia de ocurrencia.

No pertenecen al perfil:

- la elección/evaluación de gasto efectivo versus presunto, que pertenece a capacidades de gastos/cálculo;
- un flag AFP/salud, cuya necesidad debe derivarse de hechos previsionales/ingresos y reglas aplicables.

Decisión y rationale: [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md).

### Acceptance criteria

- **AC-01:** cada dimensión admite `Sí`, `No` o `Aún no sé`.
- **AC-02:** dejar `Aún no sé` no inventa una conclusión tributaria y se refleja como información pendiente.
- **AC-03:** cambiar una dimensión no elimina hechos ya existentes del ledger.
- **AC-04:** si existen hechos canónicos incompatibles con una respuesta `No`, PTL muestra conflicto y solicita revisión; no borra datos ni reescribe el perfil silenciosamente.
- **AC-05:** el perfil puede ser reutilizado como propuesta al crear un año siguiente, sujeto a confirmación.
- **AC-06:** futuras capacidades como Readiness pueden consumir el perfil sin convertirlo en evidencia de que el hecho ocurrió.

### UX contract

Surface: `Año tributario > Perfil del año`.  
Design: `DESIGN-AW-004`.

### Dependencies

- `REQUIRES` -> AW-002
- `REQUIRES` -> `PTL-TASK-AW-003`
- `RULE_DEPENDS_ON` -> `PTL-SPIKE-AW-001` — DONE 2026-09-12
- `UI_DEPENDS_ON` -> `DESIGN-AW-004`
- `ENABLES` -> later dynamic readiness requirements.

### Decision status

Minimum Block 01 dimension scope is **CLOSED** by `PTL-SPIKE-AW-001`. Future dimensions require an explicit versioned domain/product change; they are not inferred from tables or later capabilities.

---

## PTL-US-AW-005 — Entender el contexto y estado básico del workspace seleccionado

**Type:** Story  
**Capability:** TAX-01  
**Related:** TAX-06, TAX-10  
**Status:** REFINING  
**Priority:** P0  
**Size:** M  
**Canonical data impact:** DERIVED_PROJECTION  
**UI impact:** NEW_SCREEN, STATE_CHANGE  
**Design fidelity:** L2

### User outcome

Como contribuyente, quiero ver un resumen estructural del año seleccionado para saber qué período estoy preparando, qué información básica existe y cuál es el siguiente paso sin confundirlo con el resultado tributario anual.

### In scope

Annual Workspace overview with:

- commercial year + Operación Renta label;
- workspace lifecycle display (read-only in this block);
- applicability-profile completeness;
- counts/presence indicators for income, BHE, mortgage, evidence when providers exist;
- tax-rule version/reference state;
- last update timestamp;
- contextual calls to action to the correct downstream surface.

### Out of scope

- tax refund/payment forecast;
- readiness percentage;
- optimization recommendation;
- SII reconciliation result;
- close-year action.

### Acceptance criteria

- **AC-01:** the page clearly distinguishes structural workspace status from tax outcome.
- **AC-02:** absent downstream data is shown as `No registrado`/equivalent, never as zero tax liability.
- **AC-03:** profile incompleteness is visible and links to AW-004.
- **AC-04:** if a downstream capability is not implemented yet, the surface does not expose a fake executable action; it may show `Próximamente`/not-available only if product policy permits.
- **AC-05:** rule/version provenance shown here is read-only and links to the appropriate configuration/source surface.
- **AC-06:** the overview updates after valid annual-context changes without requiring application restart.

### UX contract

Surface: new navigation item `Año tributario`.  
Design: `DESIGN-AW-005`.

### Dependencies

- `REQUIRES` -> AW-001
- `REQUIRES` -> AW-004
- `REQUIRES` -> `PTL-TASK-AW-006`
- `UI_DEPENDS_ON` -> `DESIGN-AW-005`

---

## PTL-US-AW-006 — Mantener aislamiento estricto entre años durante navegación y edición

**Type:** Story  
**Capability:** TAX-01  
**Status:** REFINING  
**Priority:** P0  
**Size:** M  
**Canonical data impact:** CANONICAL_LEDGER  
**UI impact:** STATE_CHANGE  
**Design fidelity:** L1

### User outcome

Como contribuyente, quiero que toda alta, edición, eliminación o cálculo quede inequívocamente asociado al año que estoy viendo para evitar contaminar un ejercicio con información de otro.

### Business rules

1. Every year-scoped write must receive/derive the active canonical workspace identity through an explicit trusted context.
2. A stale screen or asynchronous request must not write into a newly selected year by accident.
3. Cross-year movement is explicit copy/migration behavior, never an incidental update.
4. A record whose year conflicts with active workspace context must be rejected or handled by an explicit cross-year flow.

### Acceptance criteria

- **AC-01:** opening an edit form in 2025 and switching to 2026 cannot save that stale form silently into 2026.
- **AC-02:** APIs/application use cases reject mismatched workspace/year identity instead of trusting arbitrary UI state.
- **AC-03:** background refreshes initiated for one year cannot replace visible state for a newer active year.
- **AC-04:** automated tests cover income, fee receipt and mortgage as representative year-scoped aggregates.
- **AC-05:** logs/evidence identify the commercial year involved in material year-scoped operations.

### UX contract

No new full screen. Existing edit flows must invalidate, close or explicitly rebind when workspace changes. Design behavior is documented in `DESIGN-AW-006`.

### Dependencies

- `REQUIRES` -> `PTL-TASK-AW-001`
- `REQUIRES` -> `PTL-TASK-AW-005`
- `INFRA_DEPENDS_ON` -> `PTL-TASK-AW-002`
- `ENABLES` -> safe implementation of all later blocks.

### DoD additions

This Story cannot be Done with UI-only tests; application/persistence boundary tests are mandatory.