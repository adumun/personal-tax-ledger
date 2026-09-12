# Backlog de la iniciativa — Personal Tax Ledger

Este directorio contiene el backlog técnico y de producto de Personal Tax Ledger cuando el trabajo requiere más detalle que un gap puntual. Su objetivo es mantener una secuencia explícita de slices, gates, criterios de aceptación, evidencia esperada y dependencias.

## Reglas

- El backlog describe trabajo futuro o en curso; no debe presentarse como capacidad ya validada.
- Cada ítem debe indicar propósito, alcance, precondiciones, procedimiento, criterios de aceptación, evidencia y condición de cierre.
- Los cambios funcionales o técnicos deben enlazar con la documentación canónica correspondiente cuando se implementen.
- Los resultados observados manualmente deben persistirse en `docs/desktop/` o `VALIDATION.md` cuando correspondan.
- Los hallazgos UX se registran cuando aparecen; si no bloquean el gate actual, se derivan a backlog de product polish para no perder foco ni evidencia.
- La web pública puede resumir el estado de alto nivel, pero no debe exponer información privada u operacional innecesaria.
- Las nuevas Stories cercanas a implementación deben seguir [`story-definition-and-implementation-readiness.md`](story-definition-and-implementation-readiness.md): Story para valor visible, Task para habilitación técnica determinista y Spike para reducción de incertidumbre.
- Toda Story debe declarar impacto UI. Si existe impacto, la evidencia de diseño proporcional (L1/L2/L3) forma parte de DoR; el implementador no debe inventar ubicación, flujo, estados o copy material faltante.
- Las dependencias deben conservar semántica (`REQUIRES`, `ENABLES`, `DATA_DEPENDS_ON`, `RULE_DEPENDS_ON`, `UI_DEPENDS_ON`, `INFRA_DEPENDS_ON`, `SOFT_DEPENDS_ON`) para permitir análisis posterior de DAG y ruta crítica.

## Prioridad activa

1. [`local-profile-workspace-and-startup.md`](local-profile-workspace-and-startup.md): **siguiente slice P0**. Perfil local, workspace seleccionable, centro de configuración, splash, first-run y experiencia post-upgrade.
2. Backup/export/restore y migraciones, construidos sobre el concepto de workspace.
3. [`ux-and-product-polish.md`](ux-and-product-polish.md): resolver hallazgos de usabilidad antes del UAT no técnico según severidad.
4. UAT no técnico.

La expansión TAX se mantiene en discovery/backlog y no desplaza automáticamente esta prioridad activa hasta una conciliación explícita.

## Backlog activo

- [`local-profile-workspace-and-startup.md`](local-profile-workspace-and-startup.md): configuración local, workspace y bootstrap de inicio.
- [`desktop-lifecycle-and-distribution.md`](desktop-lifecycle-and-distribution.md): lifecycle desktop Windows; gates P0 LC-001..LC-004 cerrados y distribución posterior pendiente.
- [`ux-and-product-polish.md`](ux-and-product-polish.md): hallazgos de usabilidad, overflow, layout, naming y consistencia visual que deben resolverse antes del UAT no técnico según severidad.
- [`tax-management-expansion.md`](tax-management-expansion.md): epics propuestos para Annual Tax Workspace, Readiness, Evidence, Ledger, Projection vs Actual, Data Acquisition, SII Reconciliation, Annual Tax Health, Year Closure y Portability/Privacy.
- [`story-definition-and-implementation-readiness.md`](story-definition-and-implementation-readiness.md): adopción PTL del contrato de Stories, diseño UI/interaction, enabling work, dependencias y futura ruta crítica.
- [`stories/01-annual-workspace/`](stories/01-annual-workspace/README.md): primer bloque dogfood completo; Stories AW-001..006, contrato UI L1/L2, Tasks/Spike habilitadores, DAG y camino de dependencias provisional.

## Refinamiento TAX por bloques

El refinamiento cercano a implementación se inicia con `Block 01 — Annual Workspace & Tax Profile`. Este bloque no altera automáticamente la prioridad P0 activa, pero sí es la referencia para validar `STD-WMS-STORY-001` y `STD-EXP-UIDEF-001` antes de replicar el método al resto de TAX.
