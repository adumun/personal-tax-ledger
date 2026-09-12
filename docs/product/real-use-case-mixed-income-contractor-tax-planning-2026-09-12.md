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
- potencial incorporación de servicios contractor para una empresa extranjera, facturados mediante BHE en CLP y pagados en USD;
- PPM de segunda categoría a cargo del propio emisor;
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

Proyección aproximada:

| Concepto | 2026 proyectado |
|---|---:|
| Remuneración imponible dependiente | $13,56 MM |
| Base tributable dependiente informada/proyectada | $9,32 MM |
| Honorarios contractor brutos | $15,57 MM |
| Gastos presuntos honorarios, escenario 30% | ~$4,67 MM |
| Renta neta de honorarios, escenario 30% | ~$10,90 MM |
| Base anual combinada preliminar | ~$20,21 MM |

La tabla IGC AT2027 todavía no existe al momento del análisis; por ello cualquier impuesto anual resultante debe mantenerse como `PROJECTION`, utilizando reglas/valores proxy explicitados y reemplazándolos cuando se publiquen los parámetros definitivos.

## Hallazgo 4 — gasto presunto vs gasto efectivo es una decisión de optimización

Un profesional de segunda categoría puede evaluar, conforme a la normativa aplicable, gastos presuntos versus gastos efectivos. PTL debe impedir combinarlos indebidamente y comparar ambas alternativas usando sólo gastos efectivos elegibles, respaldados y vinculados a la actividad.

El objetivo no es registrar gastos domésticos como profesionales, sino responder:

```text
¿Cuál modalidad legal reduce la renta imponible total
sin introducir gastos no elegibles ni perder trazabilidad?
```

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

## Nuevas capacidades derivadas

### Tax Optimization Planner

Comparar estrategias legales antes del cierre anual:

1. APV régimen A vs B.
2. Sin APV.
3. Gastos presuntos vs gastos efectivos elegibles.
4. PPM efectivamente pagado vs PPM necesario/proyectado.
5. Efecto de rentas dependientes simultáneas.
6. Efecto de cotizaciones previsionales ya enteradas por empleadores.
7. Salud legal, adicional de Isapre y potencial exceso/excedente.
8. Beneficios tributarios adicionales sólo cuando sean aplicables y respaldados.
9. Sensibilidad de tipo de cambio para ingresos extranjeros.
10. Costo de oportunidad de inmovilizar liquidez para obtener un ahorro tributario.

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
- Una devolución no debe presentarse como “ganancia”.
- Un APV no debe presentarse como ahorro de impuesto sin mostrar la liquidez comprometida y las consecuencias de retiro.
- Parámetros futuros no publicados deben marcarse como hipótesis/proxy.
- El cálculo debe separar dato observado, proyección, supuesto y regla normativa.
- Datos personales reales usados para validar el caso no deben publicarse en el repositorio.

## Estado

`REAL_USE_CASE / DISCOVERY / NOT_IMPLEMENTED`

Este caso debe utilizarse como fixture conceptual y posteriormente como escenario de aceptación anonimizado para las capacidades de contractor internacional, conciliación anual, salud mixta y planificación tributaria.
