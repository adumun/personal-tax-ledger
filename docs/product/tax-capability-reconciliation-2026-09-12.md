# PTL — conciliación de taxonomía TAX y extensiones de producto

**Fecha:** 2026-09-12  
**Estado:** `PRODUCT_DIRECTION / RECONCILED`  
**Autoridad:** este documento reconcilia la taxonomía canónica definida el 2026-09-11 con las extensiones descubiertas el 2026-09-12. No declara implementación.

## Motivo

La dirección del 2026-09-11 definió doce capacidades macro canónicas `TAX-01..TAX-12`. Durante el análisis posterior del caso real de contribuyente mixto, contractor, optimización, AI/Cloud y gastos efectivos aparecieron nuevas líneas de producto. El backlog transitorio utilizó identificadores `PTL-TAX-11..14`, lo que colisionaba semánticamente con `TAX-11 Tax Year Closure` y `TAX-12 Tax Portability, Backup & Privacy`.

La conciliación fija una sola taxonomía macro y separa de ella los feature epics/orquestaciones.

## Taxonomía macro canónica — se conserva sin renumerar

1. `TAX-01 — Annual Tax Workspace`
2. `TAX-02 — Tax Data Acquisition`
3. `TAX-03 — Tax Evidence Vault`
4. `TAX-04 — Tax Ledger`
5. `TAX-05 — Tax Reconciliation`
6. `TAX-06 — Tax Readiness`
7. `TAX-07 — Tax Calculation`
8. `TAX-08 — Tax Explainability`
9. `TAX-09 — Tax Projection & Scenarios`
10. `TAX-10 — Annual Tax Health`
11. `TAX-11 — Tax Year Closure`
12. `TAX-12 — Tax Portability, Backup & Privacy`

Estas capacidades siguen siendo la estructura funcional transversal del Personal Tax Management System. Las 127 observaciones del documento de benchmark permanecen válidas y no se reescriben retroactivamente.

## Extensiones/orquestaciones derivadas — namespace separado

Las líneas descubiertas después no se agregan como `TAX-13`, `TAX-14`, etc. hasta que exista una decisión explícita de promoverlas a capacidad macro transversal. Se manejan como feature epics PTL:

- `PTL-EXT-01 — International Contractor Income Planning`
- `PTL-EXT-02 — Tax Provisioning & Optimization Planner`
- `PTL-EXT-03 — Tax Document Intelligence & Cloud Capability Layer`
- `PTL-EXT-04 — Expense Eligibility & Evidence Engine`

Esto evita confundir una orquestación de producto con una capacidad macro TAX.

## Mapeo de cada extensión hacia TAX-01..12

### PTL-EXT-01 — International Contractor Income Planning

Orquesta principalmente:

- `TAX-01` para el año/workspace;
- `TAX-02` para ingresos, BHE y moneda extranjera;
- `TAX-04` para ledger y lifecycle de ingresos;
- `TAX-05` para conciliación SII;
- `TAX-07` para PPM, cotizaciones e impuesto;
- `TAX-08` para explicar gross/net/provisiones;
- `TAX-09` para escenarios FX y gross-to-net/net-to-gross;
- `TAX-10` para Annual Tax Health.

No constituye un motor tributario separado ni depende de Deel u otro proveedor.

### PTL-EXT-02 — Tax Provisioning & Optimization Planner

Orquesta principalmente:

- `TAX-04` hechos reales del ledger;
- `TAX-05` estado conciliado;
- `TAX-06` readiness;
- `TAX-07` cálculo;
- `TAX-08` explainability;
- `TAX-09` escenarios y comparación;
- `TAX-10` posición anual;
- `TAX-11` preparación del cierre.

Incluye reserva mensual, APV A/B, beneficios, gastos presuntos vs efectivos y legal tax opportunity scanning. Su objetivo es minimizar sorpresas y carga legal cuando sea económicamente racional, no maximizar devoluciones artificialmente.

### PTL-EXT-03 — Tax Document Intelligence & Cloud Capability Layer

Extiende principalmente:

- `TAX-02 Tax Data Acquisition`;
- `TAX-03 Tax Evidence Vault`;
- `TAX-05 Tax Reconciliation`;
- `TAX-06 Tax Readiness`.

La AI produce `candidate data`; no hechos canónicos. El lifecycle mínimo permanece:

`RAW_EVIDENCE -> EXTRACTED_CANDIDATE -> SCHEMA_VALIDATED -> TAX_DOMAIN_VALIDATED -> USER_CONFIRMED -> CANONICAL_LEDGER`.

Cloud y Desktop consumen el mismo Tax Core. Local AI/BYO y providers cloud son adapters, no dominio.

### PTL-EXT-04 — Expense Eligibility & Evidence Engine

Extiende principalmente:

- `TAX-02` registro/adquisición del gasto;
- `TAX-03` evidencia;
- `TAX-04` ledger;
- `TAX-06` readiness del gasto;
- `TAX-07` tratamiento/deducibilidad;
- `TAX-08` explicación de elegibilidad;
- `TAX-09` comparación presunto vs efectivo;
- `TAX-10` impacto anual.

Reglas de dominio fuertes:

- `registered expense != deductible expense`;
- `paid_amount != professional_allocated_amount != deductible_amount`;
- activos y depreciación no colapsan costo de compra con deducción del ejercicio;
- la evidencia se conserva aunque finalmente se declare usando gasto presunto;
- gastos mixtos requieren allocation explícito;
- elegibilidad y tratamiento deben conservar rule source/effective date/provenance.

## Caso real reconciliado

El caso de uso actual combina:

- renta dependiente;
- BHE nacional en septiembre por CLP 2.500.000 bruto;
- escenario contractor internacional desde octubre por USD 5.500/mes;
- PPM/retenciones y cotizaciones;
- salud legal + adicional Isapre + potencial exceso/excedente;
- CCAF como reducción de liquidez, no impuesto;
- evaluación de APV y provisión mensual;
- comparación gasto presunto vs gastos efectivos;
- gastos candidatos recurrentes: Microsoft 365, ChatGPT, Claude, servicios Google e Internet;
- hardware/equipamiento sujeto a tratamiento/depreciación cuando corresponda.

El caso no crea nuevas reglas tributarias por sí mismo: valida requisitos y fuerza a TAX-01..12 a soportar composición real de múltiples fuentes, evidencia, cálculo, proyección y conciliación.

## Relación con SII

Se mantiene íntegramente la decisión del 2026-09-11:

1. no asumir APIs no verificadas;
2. preferir mecanismos oficiales documentados;
3. `official service -> official export -> assisted import -> controlled manual entry`;
4. preservar raw evidence/provenance;
5. no sobrescribir silenciosamente el ledger;
6. `Tax Readiness` consume `Tax Reconciliation`.

Las nuevas líneas de Cloud/AI no relajan estas reglas.

## Transición hacia implementación

La taxonomía reconciliada no debe convertirse directamente en tickets de implementación sin refinamiento. PTL adopta un proceso por bloques y un contrato explícito de Story/readiness documentado en `docs/backlog/story-definition-and-implementation-readiness.md`.

La dirección transversal propuesta reside en:

- `STD-WMS-STORY-001 — User Story Definition & Implementation Readiness`;
- `STD-EXP-UIDEF-001 — Product UI / Interaction Definition Contract`.

Reglas de transición:

- `TAX-01..12` y `PTL-EXT-01..04` son fuentes de trazabilidad para Stories, no sustitutos de las Stories;
- actor-visible value se modela como `Story` conforme a `STD-WMS-TYPES-001`;
- trabajo técnico/habilitador determinista se modela como `Task`, no como un nuevo tipo `Technical Story`;
- incertidumbre se reduce mediante `Spike`;
- una Story con impacto UI no puede quedar `READY` sin artefacto de diseño proporcional y referencia explícita;
- el diseño debe especificar si el cambio es pantalla nueva, rediseño, sección, componente, campos, flujo, estados, responsive o accesibilidad;
- el implementador no debe inventar materialmente ubicación, flujo, estados o copy que debió resolverse durante refinamiento;
- una vez refinados los bloques se construirá un DAG de Stories/Tasks/Spikes, se detectarán habilitadores compartidos y se calculará ruta crítica sólo cuando exista estimación comparable.

PTL actuará como primer dogfood antes de proponer adopción generalizada en otros productos cercanos a implementación.

## North star reconciliado

La evolución queda:

```text
Personal Tax Ledger
  -> Personal Tax Management System
  -> TAX-01..12 como macro-capacidades canónicas
  -> extensiones PTL que orquestan esas capacidades
  -> Stories + Design Contracts + Enabling Work
  -> dependency graph / critical path
  -> local-first por defecto
  -> Cloud para automatización e inteligencia continua
  -> AI como proveedor asistivo, nunca autoridad tributaria
```

El objetivo operativo es mantener durante todo el año una posición tributaria explicable: datos + evidencia + conciliación + readiness + cálculo + proyección + optimización + cierre.

## Decisión de nomenclatura

Desde este punto:

- `TAX-xx` queda reservado para la taxonomía macro canónica.
- `PTL-EXT-xx` identifica extensiones/orquestaciones de producto PTL.
- Los antiguos nombres `PTL-TAX-11..14` quedan deprecados documentalmente y no deben usarse en nuevos artefactos.
- Una extensión sólo podrá promoverse a `TAX-13+` mediante decisión explícita de arquitectura/producto transversal.

## Estado

`RECONCILED / DISCOVERY / NOT_IMPLEMENTED`
