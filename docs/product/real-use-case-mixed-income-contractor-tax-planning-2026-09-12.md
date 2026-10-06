# PTL — caso de uso real: contribuyente mixto dependiente + contractor internacional

**Fecha:** 2026-09-12  
**Estado:** `REAL_USE_CASE / DISCOVERY / ANONYMIZED`  
**Relación:** `International Contractor Income Planning` + `Tax Management Expansion`

## Propósito

Persistir un caso de uso real, validado con liquidaciones de sueldo 2026 y una simulación de incorporación de ingresos contractor internacionales desde octubre de 2026.

El caso se anonimiza deliberadamente para no publicar identificadores personales, bancarios ni contractuales. Los importes y relaciones funcionales se conservan porque son la evidencia que permite validar el dominio PTL.

## Perfil funcional del caso

Contribuyente residente en Chile con:

- renta dependiente simultánea;
- AFP con cotización obligatoria del 10% y comisión de 1,27%;
- plan de Isapre cuyo precio pactado ronda 7,95 UF en varios meses;
- empleador dependiente que descuenta 7% legal de salud y adicional de Isapre para completar el precio pactado;
- préstamo CCAF descontado por planilla, que reduce liquidez pero no debe confundirse con rebaja de base tributaria;
- honorario nacional adicional por BHE durante septiembre 2026, inicialmente por un solo mes y sin continuidad garantizada;
- potencial incorporación de servicios contractor para una empresa extranjera, facturados mediante BHE en CLP y pagados en USD;
- PPM/retención de segunda categoría según tipo de receptor;
- necesidad de proyectar Operación Renta y tomar decisiones durante el año para no llegar subprovisionado.

## Evidencia salarial observada enero-agosto 2026

Totales derivados de ocho liquidaciones reales:

| Concepto | Ene-Ago 2026 |
|---|---:|
| Remuneración imponible dependiente | $8.198.594 |
| Monto tributable informado | $5.620.426 |
| AFP 10% | $819.859 |
| Comisión AFP | $104.123 |
| Salud legal 7% | $573.903 |
| Adicional Isapre | $1.346.636 |
| Líquido recibido | $2.041.928 |

La evidencia mensual demuestra que el líquido bajo en determinados meses no es una representación válida de la carga tributaria: existe un descuento CCAF relevante y un adicional de salud significativo.

## Hallazgo 1 — salud dependiente no elimina salud por honorarios

El caso demuestra que PTL no puede interpretar `plan de Isapre pagado por empleador` como `salud independiente = 0`.

Debe distinguir:

```text
DEPENDENT_HEALTH_LEGAL_7
DEPENDENT_HEALTH_ADDITIONAL
INDEPENDENT_HEALTH_CONTRIBUTION
PLAN_PRICE
LEGAL/TAXABLE CAPS
EXCESS / SURPLUS / REFUND
```

La renta dependiente ya financia mensualmente el precio pactado del plan mediante 7% legal + adicional, pero los honorarios pueden generar cotizaciones obligatorias adicionales en la Operación Renta. PTL debe calcular la interacción, topes y potencial exceso/excedente, no duplicar simplemente el precio completo del plan como gasto.

## Hallazgo 2 — deuda personal por planilla no es impuesto

El préstamo CCAF reduce fuertemente el líquido mensual, pero no representa AFP, salud ni impuesto. PTL necesita separar:

```text
GROSS INCOME
- STATUTORY CONTRIBUTIONS
- TAX WITHHOLDING / PREPAYMENTS
- PRIVATE DEBT / PAYROLL DEDUCTIONS
= CASH LIQUIDITY
```

Esto evita utilizar el líquido pagado como proxy de renta tributable o carga fiscal.

## Honorario nacional adicional — septiembre 2026

Se incorpora una BHE nacional bruta de **$2.500.000** para septiembre de 2026, inicialmente por un solo mes. Su continuidad futura no se considera asegurada.

Para discovery se modela separadamente de la renta extranjera porque el lifecycle tributario operacional es distinto:

```text
DOMESTIC_BHE
  -> receptor nacional
  -> retención practicada por receptor cuando corresponda

FOREIGN_BHE
  -> receptor extranjero
  -> PPM enterado por emisor
```

Ambos flujos convergen posteriormente en la determinación anual de honorarios, cotizaciones, gastos y Global Complementario.

Este nuevo dato eleva los honorarios proyectados del caso 2026 desde aproximadamente $15,57 MM a **~$18,07 MM** bajo el escenario de tres meses de contractor extranjero.

## Escenario contractor internacional

Hipótesis de simulación:

- inicio: octubre de 2026;
- remuneración contractor: USD 5.500 mensuales;
- meses 2026: octubre, noviembre, diciembre;
- tipo de cambio de referencia usado en la simulación: aproximadamente 943,4 CLP/USD;
- ingreso contractor aproximado por mes: $5,19 MM CLP;
- ingreso contractor bruto acumulado 2026: aproximadamente $15,57 MM CLP;
- PPM 2026: 15,25%;
- PPM acumulado aproximado: $2,37 MM CLP.

La moneda original y la conversión tributaria CLP deben conservarse por separado con provenance.

## Hallazgo 3 — PPM no es gasto definitivo ni devolución garantizada

El caso invalida dos simplificaciones comunes:

```text
PPM != impuesto definitivo
PPM != devolución futura garantizada
```

El PPM es un anticipo/crédito. En Operación Renta se cruza con cotizaciones previsionales obligatorias, impuesto anual y otros créditos/ajustes. PTL debe modelar el lifecycle:

```text
PROVISIONED -> DECLARED -> PAID -> APPLIED -> RECONCILED
```

## Proyección de cierre 2026 usada para discovery

Para completar el año dependiente se utilizó, sólo como hipótesis de discovery, un nivel similar a agosto para septiembre-diciembre.

Proyección aproximada actualizada:

| Concepto | 2026 proyectado |
|---|---:|
| Remuneración imponible dependiente | ~$13,56 MM |
| Base tributable dependiente informada/proyectada | ~$9,32 MM |
| Honorario nacional septiembre | $2,50 MM |
| Honorarios contractor extranjeros | ~$15,57 MM |
| Honorarios totales | ~$18,07 MM |
| Gastos presuntos honorarios, escenario 30% | ~$5,42 MM |
| Renta neta de honorarios, escenario 30% | ~$12,65 MM |
| Base anual combinada preliminar | ~$21,97 MM |

La tabla IGC AT2027 todavía no existe al momento del análisis; por ello cualquier impuesto anual resultante debe mantenerse como `PROJECTION`, utilizando reglas/valores proxy explicitados y reemplazándolos cuando se publiquen los parámetros definitivos.

## Hallazgo 4 — gasto presunto vs gasto efectivo es una decisión de optimización

Un profesional de segunda categoría puede evaluar, conforme a la normativa aplicable, gastos presuntos versus gastos efectivos. PTL debe impedir combinarlos indebidamente y comparar ambas alternativas usando sólo gastos efectivos elegibles, respaldados y vinculados a la actividad.

El objetivo no es registrar gastos domésticos como profesionales, sino responder:

```text
¿Cuál modalidad legal reduce la renta imponible total
sin introducir gastos no elegibles ni perder trazabilidad?
```

Con honorarios proyectados 2026 de ~$18,07 MM, el 30% presunto representa aproximadamente **$5,42 MM**. Ese valor se convierte en el benchmark que deben superar los gastos efectivos deducibles para que el escenario efectivo sea económicamente superior, sin perjuicio de reglas específicas de activos/depreciación.

## Gastos profesionales reales a registrar en el caso

El caso incorpora gastos recurrentes y potencialmente profesionales que PTL debe permitir registrar aunque todavía no estén aceptados definitivamente como deducibles:

- Microsoft 365 mensual;
- ChatGPT;
- Claude;
- servicios Google de uso profesional;
- Internet hogar con uso mixto personal/profesional;
- futuros computadores, notebooks, tablets, monitores, periféricos y otros equipos;
- software, cloud, hosting, dominios, capacitación y servicios profesionales relacionados con la actividad cuando existan.

El sistema debe separar explícitamente:

```text
RECORDED_EXPENSE
POTENTIAL_TAX_EXPENSE
ELIGIBLE_TAX_EXPENSE
NON_ELIGIBLE_EXPENSE
NEEDS_REVIEW
```

Registrar un gasto no equivale a deducirlo.

## Hallazgo 4A — Expense Eligibility & Evidence

PTL necesita modelar el gasto como una entidad con evidencia y evaluación tributaria, no como un monto plano.

Contrato conceptual mínimo:

```text
Expense
  date
  supplier
  description
  amount
  currency
  category
  evidence
  professional_use_percentage
  recurring_subscription

  tax_assessment
    ELIGIBLE
    POTENTIALLY_ELIGIBLE
    NOT_ELIGIBLE
    NEEDS_REVIEW

  rationale
  rule_reference
  deductible_amount
  tax_year
  treatment
    DIRECT_EXPENSE
    DEPRECIABLE_ASSET
    DEFERRED_OR_SPECIAL
```

Para gastos mixtos como Internet, PTL debe admitir un porcentaje de uso profesional justificable en vez de asumir 0% o 100% silenciosamente.

Para hardware, PTL debe diferenciar precio de compra de monto deducible del ejercicio. Un computador o tablet puede ser un activo necesario para producir renta, pero el tratamiento puede implicar depreciación u otra regla y no necesariamente gasto íntegro inmediato.

## Hallazgo 4B — evidencia extranjera y suscripciones digitales

Servicios como Microsoft 365, ChatGPT, Claude o Google pueden provenir de proveedores extranjeros. PTL debe conservar factura/recibo, proveedor, fecha, moneda, monto original, conversión y evidencia suficiente para evaluar la deducibilidad según normativa aplicable.

La AI puede clasificar o sugerir elegibilidad, pero no declarar canónicamente que el gasto es deducible sin regla, evidencia y confirmación.

## Hallazgo 4C — comparación continua presunto vs efectivo

El usuario no debe verse obligado a escoger anticipadamente la modalidad anual. PTL debe mantener ambos escenarios mientras exista información suficiente:

```text
SCENARIO_PRESUMED
  honoraria * 30% sujeto a límite/regla

SCENARIO_ACTUAL
  sum(eligible deductible amount)

BEST_CURRENT_OPTION
  compare tax outcome
  compare evidence readiness
  compare auditability
```

Cada nuevo gasto elegible debe recalcular la proyección. El sistema debe mostrar cuánto falta para que gastos efectivos superen el beneficio del presunto y cuál es el impacto tributario marginal de cada gasto aceptado.

## Hallazgo 5 — APV requiere evaluación económica, no sólo tributaria

El APV puede modificar la carga tributaria dependiendo del régimen elegido. PTL no debe recomendar APV sólo porque reduce impuesto.

Debe mostrar, al menos:

```text
APV contribution
-> immediate tax effect
-> liquidity committed
-> retirement benefit / state bonus if applicable
-> withdrawal tax/penalty implications
-> net economic benefit
```

Para un contribuyente ubicado en un tramo marginal bajo, una gran contribución APV régimen B puede reducir poco impuesto por cada peso inmovilizado. PTL debe explicitar el `tax saved per $1 contributed`.

## Hallazgo 6 — objetivo correcto: tax readiness, no “devolución máxima”

El sistema no debe optimizar ciegamente por una devolución alta. Una devolución grande puede representar sobreprovisión o anticipos excesivos.

Objetivo recomendado:

```text
minimize legal tax liability where economically rational
+ avoid underprovision
+ preserve liquidity
+ use valid benefits/deductions
+ reach annual settlement close to planned outcome
```

Resultados posibles deseables:

- saldo por pagar cercano a cero;
- devolución razonable si proviene de créditos/beneficios reales;
- cero sorpresas materiales;
- explicación completa de por qué se llegó a ese resultado.

## Evaluación provisional de estrategias 2026

La simulación se mantiene como discovery y debe recalcularse con AT2027 cuando existan parámetros definitivos.

### Reserva líquida

Ahorrar dinero mes a mes no reduce la obligación tributaria, pero resuelve el riesgo de caja. Debe modelarse como `TAX_RESERVE`, separado de gasto y de PPM.

### APV

PTL debe comparar régimen A, régimen B y sin APV según tramo marginal, beneficio previsional, liquidez y restricciones, sin asumir que una modalidad domina siempre.

### Gastos presuntos vs efectivos

Con honorarios proyectados 2026 de ~$18,07 MM, el 30% presunto ronda **$5,42 MM**. Los gastos efectivos tributariamente deducibles deben superar ese benchmark para dominar al presunto, considerando además depreciación y tratamientos especiales.

La aplicación debe permitir registrar desde ya gastos potenciales como Microsoft 365, ChatGPT, Claude, Google e Internet, incluso si finalmente se usa gasto presunto. Esa historia/evidencia no debe perderse porque puede ser útil en años siguientes o para comparar escenarios.

## Nuevas capacidades derivadas

### Tax Optimization Planner

Comparar estrategias legales antes del cierre anual:

1. APV régimen A vs B.
2. Sin APV.
3. Gastos presuntos vs gastos efectivos elegibles.
4. PPM efectivamente pagado vs PPM necesario/proyectado.
5. Efecto de rentas dependientes simultáneas.
6. Efecto de honorarios nacionales y extranjeros simultáneos.
7. Efecto de cotizaciones previsionales ya enteradas por empleadores.
8. Salud legal, adicional de Isapre y potencial exceso/excedente.
9. Beneficios tributarios adicionales sólo cuando sean aplicables y respaldados.
10. Sensibilidad de tipo de cambio para ingresos extranjeros.
11. Costo de oportunidad de inmovilizar liquidez para obtener un ahorro tributario.
12. Impacto incremental de nuevos gastos elegibles.

### Expense Eligibility & Evidence Engine

Requerimiento fuerte derivado del caso real:

- registrar gastos sin presuponer elegibilidad;
- adjuntar evidencia;
- reconocer suscripciones recurrentes;
- manejar proveedor nacional/extranjero y moneda original;
- clasificar categoría tributaria potencial;
- soportar uso profesional parcial;
- distinguir gasto corriente vs activo/depreciación;
- asociar regla/fuente normativa versionada;
- producir `deductible_amount` separado del importe pagado;
- recalcular escenarios presunto vs efectivo;
- identificar evidencia faltante;
- permitir revisión humana;
- integrarse con SII Reconciliation cuando exista fuente oficial/importación disponible.

### Tax Provisioning Strategy

PTL debe poder decir durante el año:

```text
Expected annual tax         $X
Credits / PPM paid          $Y
Expected contributions      $Z
Projected settlement        $N
Recommended monthly reserve $R
```

Y clasificar el resultado:

- `UNDERPROVISIONED`
- `ON_TARGET`
- `OVERPROVISIONED`
- `REFUND_EXPECTED`
- `PAYMENT_EXPECTED`
- `INSUFFICIENT_DATA`

## Reglas de seguridad y producto

- Optimización significa planificación tributaria legal; nunca ocultamiento de rentas ni creación de gastos ficticios.
- Los gastos efectivos requieren elegibilidad y evidencia.
- Registrar un gasto no lo convierte en deducción.
- Un gasto personal no se vuelve profesional sólo por haberse pagado durante una jornada de trabajo.
- AI puede sugerir clasificación/elegibilidad, nunca establecerla como hecho canónico sin regla y confirmación.
- Gastos mixtos deben conservar criterio y porcentaje de asignación profesional.
- Activos deben conservar costo de adquisición y tratamiento tributario por separado.
- Una devolución no debe presentarse como “ganancia”.
- Un APV no debe presentarse como ahorro de impuesto sin mostrar la liquidez comprometida y las consecuencias de retiro.
- Parámetros futuros no publicados deben marcarse como hipótesis/proxy.
- El cálculo debe separar dato observado, proyección, supuesto y regla normativa.
- Datos personales reales usados para validar el caso no deben publicarse en el repositorio.

## Estado

`REAL_USE_CASE / DISCOVERY / NOT_IMPLEMENTED`

Este caso debe utilizarse como fixture conceptual y posteriormente como escenario de aceptación anonimizado para las capacidades de renta mixta, contractor internacional, honorarios nacionales, conciliación anual, salud mixta, planificación tributaria y expense eligibility.
