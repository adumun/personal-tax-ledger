# PTL — Story Definition & Implementation Readiness Adoption

**Estado:** `ADOPTION / DISCOVERY`  
**Fecha:** 2026-09-12  
**Referencias transversales propuestas:**

- `adumun/platform-standards/lifecycle/STD-WMS-STORY-001-USER-STORY-DEFINITION-AND-IMPLEMENTATION-READINESS.md`
- `adumun/platform-standards/experience/STD-EXP-UIDEF-001-PRODUCT-UI-INTERACTION-DEFINITION-CONTRACT.md`
- `STD-WMS-001`, `STD-WMS-TYPES-001`, `STD-WCT-001`, `STD-EXP-UX-001`, `STD-EXP-DS-001`, `STD-EXP-A11Y-001`.

## Propósito

Personal Tax Ledger será el primer dogfood para convertir la dirección TAX ya reconciliada en trabajo cercano a implementación mediante Stories normalizadas, artefactos de diseño explícitos, Tasks/Spikes habilitadores, dependencias tipadas y posterior análisis de ruta crítica.

## Reconciliación con Work Management

PTL no creará tipos paralelos como `TECHNICAL_STORY` o `ENABLER_STORY`.

- valor/comportamiento visible para actor => `Story`;
- habilitación técnica/operacional/documental determinista => `Task`;
- reducción de incertidumbre => `Spike`;
- deuda estructural => `Technical Debt` cuando corresponda.

Una Task puede cumplir rol `ENABLER`, pero conserva Type `Task`.

## Método por bloques

Las HUs de TAX se elaborarán por bloques funcionales coherentes, validando el modelo antes de multiplicarlo al backlog completo.

Bloques iniciales de refinamiento:

1. Annual Workspace & Tax Profile.
2. Income & Tax Ledger.
3. Evidence & Acquisition.
4. Expense Eligibility.
5. Contributions & Health.
6. Calculation & Explainability.
7. Projection & Optimization.
8. SII Reconciliation.
9. Annual Health, Readiness & Closure.
10. Document Intelligence / Cloud.
11. Portability / Privacy / Backup.

Cada Story mantiene trazabilidad hacia `TAX-01..TAX-12` y, cuando aplique, `PTL-EXT-01..04`.

## Contrato mínimo de Story

Cada Story debe contener:

- identidad, título, bloque/capability, estado y prioridad;
- actor / necesidad / outcome;
- contexto, alcance y fuera de alcance;
- precondiciones y reglas de dominio;
- criterios de aceptación observables;
- escenarios BDD cuando reduzcan ambigüedad;
- impacto en datos canónicos;
- evidencia/provenance, seguridad/privacidad, auditoría y explainability cuando apliquen;
- impacto UI;
- referencias de diseño requeridas;
- dependencias tipadas;
- Tasks/Spikes habilitadores conocidos;
- estimación y riesgo/incertidumbre;
- DoR/DoD;
- trazabilidad a requisito, estándar, diseño y evidencia de aceptación.

## Impacto de datos

Para TAX se usará inicialmente:

```text
NONE
CANDIDATE_ONLY
CANONICAL_LEDGER
DERIVED_PROJECTION
RECONCILIATION_STATE
EVIDENCE
```

Esto preserva especialmente la regla `candidate != canonical fact`.

## Contrato UI / Interaction

Toda Story declara `NO_UI_CHANGE` o una o más categorías:

```text
NEW_SCREEN
SCREEN_REDESIGN
NEW_SECTION
SECTION_CHANGE
NEW_COMPONENT
FIELD_ADDITION
FIELD_CHANGE
FLOW_CHANGE
STATE_CHANGE
RESPONSIVE_CHANGE
ACCESSIBILITY_CHANGE
```

El artefacto requerido es proporcional al cambio:

- L1 `Structural Wireframe`;
- L2 `Interaction Mockup`;
- L3 `Visual Specification`.

Una Story con impacto UI no queda `READY` si el implementador aún debe imaginar materialmente dónde aparece, cómo se estructura, qué flujo sigue, qué estados tiene o qué copy/labels fundamentales utiliza.

Un `FIELD_ADDITION`, por ejemplo, debe indicar superficie, sección, ubicación, label, control, validación, estados y artefacto de diseño. Un `NEW_SCREEN` requiere pantalla completa en contexto. Un `FLOW_CHANGE` requiere user flow y referencias a las vistas afectadas.

## Estados de experiencia

Cuando materialmente correspondan, el diseño debe contemplar estados tales como `DEFAULT`, `EMPTY`, `LOADING`, `IN_PROGRESS`, `SUCCESS`, `VALIDATION_ERROR`, `DOMAIN_ERROR`, `SYSTEM_ERROR`, `PARTIAL`, `STALE`, `CONFLICT`, `READ_ONLY`, `DISABLED`, `NEEDS_REVIEW` y restricciones de permiso.

No todas las Stories usan todos los estados; los relevantes deben quedar explícitos antes de READY.

## Dependencias

PTL distinguirá al menos:

```text
REQUIRES
ENABLES
DATA_DEPENDS_ON
RULE_DEPENDS_ON
UI_DEPENDS_ON
INFRA_DEPENDS_ON
SOFT_DEPENDS_ON
```

Esto permitirá diferenciar bloqueos reales de afinidad de orden y detectar enablers compartidos.

## Grafo y ruta crítica

Después de completar suficientes bloques:

1. construir DAG de Stories + Tasks + Spikes;
2. detectar ciclos y dependencias inválidas;
3. detectar habilitadores con alto fan-out;
4. identificar trabajo paralelizable;
5. calcular profundidad de dependencias;
6. incorporar estimación comparable;
7. calcular ruta crítica temporal sólo cuando exista duración/esfuerzo comparable.

Sin estimaciones sólo se declarará `dependency criticality`, no CPM temporal.

## Estructura objetivo

```text
docs/backlog/stories/
  README.md
  01-annual-workspace/
  02-income-ledger/
  03-evidence-acquisition/
  04-expense-eligibility/
  05-contributions-health/
  06-calculation-explainability/
  07-projection-optimization/
  08-sii-reconciliation/
  09-readiness-closure/
  10-document-intelligence-cloud/
  11-portability-privacy/
```

Posteriormente:

- `docs/backlog/story-dependency-graph.md`
- `docs/backlog/implementation-critical-path.md`

## Regla de avance

Primero se completará un bloque como prueba del estándar. Sólo después de validar el formato se generará masivamente el resto de Stories.

## Estado

`ADOPTION PLANNED / NOT YET STORY-REFINED`.