# PTL — International Contractor Income Planning

**Fecha:** 2026-09-12  
**Estado:** `PRODUCT_DIRECTION / DISCOVERY`  
**Relación:** extensión de `tax-management-evolution-and-ms-store-benchmark-2026-09-11.md`  
**Autoridad:** GitHub técnico/producto; Drive conserva framing y lifecycle complementario.

## Origen del caso de uso

La modalidad de contratación internacional como `independent contractor`, pagado en USD por una empresa sin entidad empleadora en Chile y con obligaciones tributarias/previsionales a cargo del propio trabajador, expone una necesidad que PTL debe resolver de forma explícita.

El problema del usuario no es solamente calcular impuesto anual. Necesita responder preguntas operativas durante el año:

- ¿Cuánto dinero realmente puedo considerar disponible después de impuestos, previsión, salud y otras provisiones?
- ¿Cuánto debo reservar mes a mes para no consumir dinero que corresponde a obligaciones futuras?
- ¿Qué diferencia existe entre monto facturado/recibido, monto provisionado, monto declarado, monto pagado y neto efectivamente disponible?
- Si quiero obtener un neto objetivo en CLP, ¿cuánto debo cobrar/facturar en USD?
- ¿Cómo afectan el tipo de cambio, otras rentas, cotizaciones y la regularización anual al resultado real?
- ¿Cómo concilio lo que registré localmente con boletas, F29, pagos y antecedentes posteriores disponibles en SII?

Este caso no convierte PTL en una aplicación de payroll ni de finanzas personales genéricas. Es una extensión directa del lifecycle tributario personal chileno.

## Dirección funcional

PTL debe poder modelar el flujo:

```text
Contract / Expected Gross Income
        -> Foreign Currency Income
        -> CLP Valuation
        -> Tax Provision
        -> Social Security Provision
        -> Health Provision
        -> Other Contractor Costs
        -> Disposable Net Income
```

Y el lifecycle de cada obligación:

```text
PROVISIONED -> DECLARED -> PAID -> RECONCILED
```

La aplicación debe diferenciar explícitamente `cash received` de `economically disposable income`.

## Caso de uso principal — Gross-to-Net Contractor

### Entradas

1. Monto contractual periódico.
2. Moneda contractual, inicialmente al menos USD y CLP.
3. Frecuencia de pago.
4. Fecha de devengo y/o recepción.
5. Tipo de cambio aplicado y fuente/provenance.
6. Naturaleza del ingreso: contractor/honorario exterior u otra categoría soportada.
7. Parámetros tributarios versionados del año correspondiente.
8. Configuración previsional y de salud aplicable al usuario.
9. Otras rentas relevantes del año cuando formen parte del modelo soportado.
10. Beneficios/costos que el usuario debe asumir por no existir relación laboral dependiente, cuando se utilicen para simulación comparativa.

### Salidas mínimas

11. Ingreso bruto contractual.
12. Valor equivalente en CLP y tipo de cambio utilizado.
13. Provisión tributaria mensual/periodizada.
14. Provisión previsional.
15. Provisión de salud.
16. Otras provisiones/costos configurados.
17. Neto estimado disponible.
18. Porcentaje efectivo reservado.
19. Diferencia entre dinero recibido y dinero efectivamente disponible.
20. Proyección anual acumulada.
21. Advertencias sobre componentes todavía estimados o sujetos a regularización anual.

## Caso de uso inverso — Net-to-Gross Target

PTL debe resolver también la pregunta inversa:

> “Quiero disponer de X CLP líquidos reales al mes. ¿Cuánto debo cobrar en USD bajo este esquema?”

### Requisitos

22. Ingreso neto objetivo configurable en CLP.
23. Tipo de cambio base y escenarios alternativos.
24. Parámetros de impuestos, previsión y salud versionados.
25. Cálculo iterativo/determinista del gross requerido para alcanzar el neto objetivo.
26. Rango de sensibilidad ante variación del tipo de cambio.
27. Rango de sensibilidad ante cambios de carga tributaria efectiva.
28. Mostrar claramente qué componentes son normativos, cuáles son configurables y cuáles son supuestos de simulación.
29. Evitar presentar como “líquido garantizado” una cifra que dependa de la declaración anual o de antecedentes incompletos.

## Foreign Currency Income

30. Los ingresos en moneda extranjera deben conservar monto y moneda originales.
31. La conversión a CLP debe ser un hecho derivado con provenance, no una sustitución destructiva del valor original.
32. Debe registrarse la fecha relevante para la conversión según la regla tributaria soportada.
33. El sistema debe poder comparar escenarios de tipo de cambio sin alterar el hecho económico original.
34. Las diferencias entre monto esperado y monto efectivamente recibido por fees/spread de la plataforma de pago o banco deben ser visibles cuando el usuario las registre o importe.
35. El modelo debe permitir identificar la plataforma/intermediario de pago sólo como contexto/provenance; no debe acoplar el dominio a un proveedor específico como Deel.

## Provisioning model

PTL debe introducir el concepto explícito de `Tax/Obligation Provision`.

36. Una provisión es una reserva estimada, no un pago ni una declaración.
37. Cada provisión debe indicar regla/supuesto, período, monto, moneda y origen del cálculo.
38. La provisión puede actualizarse al cambiar datos reales o parámetros, conservando audit trail.
39. Debe evitarse double counting entre provisiones y pagos efectivos.
40. Una obligación pagada/conciliada no debe continuar apareciendo como reserva pendiente.
41. El dashboard debe distinguir al menos: `received`, `reserved`, `declared`, `paid`, `reconciled`, `available`.

## Integración con la macroestructura TAX

### TAX-01 — Annual Tax Workspace

42. El contrato/actividad contractor y sus parámetros deben quedar contextualizados dentro del año tributario correspondiente.
43. El workspace debe permitir coexistencia con remuneraciones dependientes, otros honorarios y demás fuentes soportadas.

### TAX-02 — Tax Data Acquisition

44. Registrar ingresos contractor manualmente o mediante importación estructurada.
45. Incorporar posteriormente evidencia de pagos, liquidaciones de plataforma, cartolas u otros documentos sólo mediante mecanismos soportados y con provenance.
46. Adquirir datos SII relacionados mediante la estrategia oficial/importación asistida ya definida.

### TAX-03 — Tax Evidence Vault

47. Asociar contrato, comprobantes de pago, boletas, formularios, pagos y otros antecedentes al hecho/obligación correspondiente.
48. Mantener evidencia original separada de las proyecciones derivadas.

### TAX-04 — Tax Ledger

49. Registrar cada ingreso extranjero como hecho económico con moneda original y representación tributaria derivada.
50. Registrar eventos de provisión, declaración, pago y conciliación sin colapsarlos en una sola cifra.
51. Permitir trazabilidad desde el neto disponible hasta cada componente que lo explica.

### TAX-05 — Tax Reconciliation

52. Conciliar ledger local con boletas/antecedentes SII, F29 u otras fuentes oficiales soportadas.
53. Detectar discrepancias de período, monto, identidad, duplicidad o ausencia.
54. Diferenciar claramente una provisión local no declarada de una obligación declarada/pagada.

### TAX-06 — Tax Readiness

55. Incluir obligaciones mensuales/anuales esperadas según la situación del contractor cuando el modelo normativo esté soportado.
56. Alertar cuando exista ingreso recibido sin evidencia, declaración/pago esperado o conciliación pendiente.

### TAX-07 — Tax Calculation

57. Mantener las reglas tributarias puras, versionadas y separadas de I/O, moneda, UI e integración SII.
58. Calcular el impacto tributario de ingresos contractor de acuerdo con el alcance normativo implementado y evidenciado.

### TAX-08 — Tax Explainability

59. Explicar de dónde sale cada reserva y cada cifra de neto disponible.
60. Mostrar inputs, parámetros, tipo de cambio, reglas, supuestos y pasos intermedios.
61. Advertir cuando un resultado dependa de regularización anual o información todavía incompleta.

### TAX-09 — Tax Projection & Scenarios

62. Incorporar `Gross-to-Net Contractor` como escenario de proyección.
63. Incorporar `Net-to-Gross Target` como simulación inversa.
64. Permitir comparar distintos montos USD, tipos de cambio y configuraciones sin alterar el ledger real.
65. Mostrar `actual to date`, `projected close` y escenarios alternativos.

### TAX-10 — Annual Tax Health

66. Mostrar cuánto ingreso se ha recibido, cuánto está provisionado, cuánto ya fue pagado/conciliado y cuánto puede considerarse disponible.
67. Destacar riesgo de subprovisión tributaria/previsional.
68. Mostrar impacto de otras rentas cuando corresponda al modelo soportado.

### TAX-11 — Tax Year Closure

69. El cierre debe conservar ingresos originales, conversiones aplicadas, provisiones, pagos, conciliaciones y parámetros usados.
70. La diferencia entre provisión durante el año y resultado final debe quedar explicada y auditable.

### TAX-12 — Tax Portability, Backup & Privacy

71. Contratos, datos bancarios/importados y antecedentes tributarios asociados son datos sensibles y deben respetar el modelo local-first, portabilidad, backup y políticas de seguridad de PTL.

## Nueva capacidad de producto propuesta

Se propone una capacidad visible de usuario denominada provisionalmente:

`Contractor Income Planner`

No constituye necesariamente un nuevo bounded context. En primera instancia se modela como una experiencia/orquestación sobre capacidades TAX existentes, especialmente `Tax Ledger`, `Tax Calculation`, `Tax Projection & Scenarios`, `Tax Explainability` y `Annual Tax Health`.

Subcapacidades visibles:

- `Gross-to-Net Contractor`.
- `Net-to-Gross Target`.
- `Monthly Obligation Provisioning`.
- `Foreign Currency Income`.
- `Actual vs Provisioned vs Paid`.
- `Contractor Annual Projection`.

## Reglas de producto

72. No asumir que una retención/PPM equivale al impuesto anual definitivo.
73. No denominar `líquido` a dinero recibido antes de provisionar obligaciones conocidas/estimadas.
74. No mezclar provisiones con pagos reales.
75. No esconder supuestos del cálculo.
76. No fijar reglas tributarias en UI ni adapters; deben provenir del core versionado.
77. No acoplar el modelo a Deel u otra plataforma específica.
78. No transformar esta función en una calculadora salarial genérica desligada del ledger tributario.
79. La simulación debe poder convertirse en hechos reales sólo mediante confirmación/registro explícito.
80. Toda cifra derivada debe ser reproducible y explicable.

## Valor diferenciador

Este caso permite que PTL responda una pregunta de alto valor que las herramientas de presupuesto o simples calculadoras tributarias normalmente no resuelven de forma integrada:

```text
¿Qué parte del dinero que recibí realmente puedo considerar mía hoy,
qué parte debo reservar y por qué,
y cuánto debería cobrar para alcanzar un neto objetivo sin quedar subprovisionado?
```

La respuesta se construye desde el ledger real del usuario, reglas versionadas, evidencia, conciliación y proyección anual, manteniendo la especialización tributaria de PTL.

## Estado

`DISCOVERY / NOT_IMPLEMENTED`

Este documento amplía la dirección TAX ya aprobada conceptualmente. No declara soporte tributario completo para contractor internacional ni reglas específicas implementadas hasta que exista modelo normativo, contratos, pruebas y evidencia correspondientes.
