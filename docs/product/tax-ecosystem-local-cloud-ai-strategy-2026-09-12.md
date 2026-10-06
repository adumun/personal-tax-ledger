# PTL — TAX Ecosystem Local-First, Cloud & AI Strategy

**Fecha:** 2026-09-12  
**Estado:** `PRODUCT_DIRECTION / DISCOVERY`  
**Ámbito:** Personal Tax Ledger como proving ground del ecosistema TAX de ADÜMÜN

## North star

El foco inicial del ecosistema TAX queda definido así:

> No esperar a Operación Renta para descubrir cuánto se debe. Durante todo el año, el sistema debe entender ingresos, documentos, cotizaciones, pagos, gastos y beneficios; proyectar el cierre tributario; y ayudar al usuario a tomar decisiones legales y económicamente racionales antes de que sea tarde.

PTL es el primer consumidor real y proving ground. El objetivo no es duplicar la aplicación en múltiples canales, sino construir capacidades tributarias reutilizables que puedan componerse localmente o en cloud.

## Principio de producto

La versión gratuita distribuida en Microsoft Store debe seguir siendo útil por sí misma. La monetización cloud no debe depender de degradar artificialmente Desktop.

La diferenciación se construye por nivel de automatización, inteligencia continua, integración y comodidad:

```text
FREE / LOCAL
  cálculo tributario
  ledger
  escenarios
  explainability
  ingreso manual
  registro/evidencia de gastos
  import/export
  privacidad local-first

LOCAL AI / BYO PROVIDER — FUTURO
  modelo local opcional
  BYOK / provider externo opcional
  procesamiento privado configurable
  extracción documental asistida

TAX CLOUD — PAID
  document intelligence administrada
  ingestion y almacenamiento de evidencia
  extracción y clasificación automática
  expense intelligence
  conciliación
  sincronización multi-device
  seguimiento continuo
  alertas
  provisioning
  optimization planner
  automatizaciones
```

Ninguna de estas líneas obliga a implementarlas todas en una primera ola.

## Tres modalidades de ejecución

### 1. PTL Desktop / Microsoft Store — Free, local-first

Debe conservar:

- Tax Core y reglas tributarias versionadas.
- Annual Tax Workspace.
- Tax Ledger / Timeline.
- Tax Calculation.
- Tax Explainability.
- Projection & Scenarios.
- Tax Provisioning & Optimization cuando dichas capacidades estén implementadas.
- registro manual de gastos potenciales, evidencia y clasificación;
- comparación presunto vs efectivo cuando exista soporte normativo;
- entrada manual y edición explícita;
- import/export y backup local;
- funcionamiento sin una cuenta cloud obligatoria.

La carga de un PDF local puede existir aunque no haya AI incorporada. En ese caso, el documento queda como evidencia y el usuario completa/confirma campos manualmente.

### 2. Desktop con AI local o BYO provider — línea futura

La arquitectura debe dejar abierta la posibilidad de conectar un `DocumentIntelligenceProvider` sin acoplar el dominio a un proveedor concreto.

Providers candidatos futuros, sin compromiso de implementación inmediata:

- runtime/modelo local;
- API externa configurada por el usuario;
- agente/asistente autorizado por el usuario;
- proveedor cloud administrado por ADÜMÜN.

El dominio TAX no debe conocer OpenAI, Anthropic, Ollama, LM Studio ni cualquier otro proveedor concreto.

### 3. TAX Cloud — paid / managed

Cloud habilita capacidades que requieren infraestructura, inferencia, almacenamiento, integración continua o procesamiento administrado:

- ingestion de liquidaciones, boletas, certificados, facturas, recibos y evidencia;
- AI Document Intelligence;
- Expense Intelligence y clasificación tributaria asistida;
- almacenamiento/evidence vault administrado;
- sincronización entre dispositivos;
- adapters e integraciones autorizadas;
- conciliación continua;
- seguimiento del año tributario;
- alertas de subprovisión;
- Tax Optimization Planner continuo;
- automatizaciones y notificaciones;
- costos de inferencia cubiertos por el modelo comercial.

Cloud no debe ser una reimplementación paralela del dominio tributario.

## Tax Document Intelligence

La propuesta cloud no se reduce a OCR.

Debe convertir evidencia tributaria no estructurada en candidatos semánticos del dominio.

Ejemplo conceptual:

```text
PDF / IMAGE
  -> document ingestion
  -> document classification
  -> extraction
  -> normalization
  -> semantic mapping
  -> tax-domain validation
  -> confidence / warnings
  -> user confirmation
  -> canonical ledger
```

Para una liquidación de remuneraciones, el sistema debe distinguir conceptualmente:

```text
GROSS_INCOME
AFP_MANDATORY
AFP_COMMISSION
UNEMPLOYMENT_INSURANCE
HEALTH_LEGAL
HEALTH_ADDITIONAL
PRIVATE_PAYROLL_DEBT
TAX_WITHHOLDING
NET_PAID
```

Extraer texto no es suficiente. La capacidad valiosa es interpretar correctamente el significado tributario/previsional de cada campo y su interacción con otras fuentes de renta.

## Expense Intelligence

El caso real demuestra que la inteligencia documental debe cubrir también egresos/gastos profesionales y no sólo ingresos.

PTL debe poder registrar y analizar, entre otros:

- Microsoft 365;
- ChatGPT;
- Claude;
- servicios Google de uso profesional;
- Internet con uso mixto;
- hardware como computador, tablet, monitor y periféricos;
- software, SaaS, cloud, hosting, dominios y capacitación.

El objetivo no es marcar automáticamente estos conceptos como deducibles. La capa de inteligencia debe producir un candidato de gasto y luego someterlo a reglas/evidencia.

Pipeline objetivo:

```text
RECEIPT / INVOICE / SUBSCRIPTION
  -> extraction
  -> supplier / date / amount / currency
  -> recurring pattern detection
  -> expense category candidate
  -> professional-use candidate
  -> tax treatment candidate
  -> evidence readiness
  -> user confirmation
  -> Expense Registry
  -> Eligibility Assessment
  -> deductible amount
  -> Presumed vs Actual comparison
```

Debe preservarse la diferencia entre:

```text
paid_amount
professional_allocated_amount
deductible_amount
```

Especialmente para Internet y gastos mixtos, el importe pagado no equivale al 100% profesional. Para hardware, costo de compra no equivale necesariamente a gasto deducible íntegro del ejercicio; el sistema debe soportar activos/depreciación y tratamientos especiales.

El usuario debe poder conservar evidencia de estos gastos incluso si finalmente opta por gasto presunto, porque la elección anual no debe destruir historia ni impedir comparación futura.

## Regla crítica: AI candidate != canonical fact

Una AI nunca escribe silenciosamente en el ledger canónico.

Lifecycle mínimo:

```text
RAW_EVIDENCE
  -> EXTRACTED_CANDIDATE
  -> SCHEMA_VALIDATED
  -> TAX_DOMAIN_VALIDATED
  -> USER_CONFIRMED
  -> CANONICAL_LEDGER
```

Cada candidato debe conservar:

- source/evidence reference;
- campo extraído;
- valor original;
- valor normalizado;
- confidence;
- warnings;
- provider/version cuando sea pertinente;
- fecha de procesamiento;
- decisión humana final.

Esto extiende el principio existente: datos externos o inferidos no sobrescriben silenciosamente el estado local.

## Arquitectura de capacidades

Dirección conceptual:

```text
                      TAX ECOSYSTEM
                           |
                      Tax Core
                rules / semantics / math
                           |
        +------------------+------------------+
        |                                     |
  PTL Desktop                          TAX Cloud
  local-first                         managed services
        |                                     |
 manual/local/BYO AI             managed document AI
 local persistence               cloud evidence/storage
 offline scenarios               reconciliation/sync
 expense registry                expense intelligence
 deterministic core              monitoring/automation
```

Capacidades potencialmente reutilizables en el ecosistema:

- Tax Core.
- Tax Rules.
- Tax Contracts.
- Tax Document Intelligence.
- Expense Eligibility & Evidence.
- Tax Evidence.
- Tax Reconciliation.
- Tax Projection.
- Tax Provisioning.
- Tax Optimization.
- Tax Explainability.
- Tax Connectors.
- Tax Cloud runtime/services.

Estas capacidades pueden evolucionar fuera de PTL cuando exista suficiente evidencia de reutilización. PTL no debe fragmentarse prematuramente sólo por anticipar plataforma futura.

## Modelo comercial inicial

### Free/local

El usuario disciplinado debe poder llevar su situación tributaria manualmente sin suscripción obligatoria.

Valor incluido:

- ledger;
- cálculos;
- escenarios;
- explainability;
- registro manual de gastos y evidencia;
- comparación presunto vs efectivo cuando exista soporte;
- información local;
- exportación/backup;
- privacidad local-first.

### Paid/cloud

El usuario paga principalmente por ahorro de trabajo e inteligencia continua:

- subir documentos y obtener candidatos estructurados;
- subir facturas/recibos y obtener candidatos de gasto;
- detección de suscripciones recurrentes;
- preclasificación de elegibilidad/tratamiento;
- mantener evidencia administrada;
- sincronización;
- conciliación;
- seguimiento continuo;
- alertas;
- planificación mensual de reservas;
- recomendaciones de optimización explicables;
- automatización.

La hipótesis comercial es que `document intelligence` y `expense intelligence` pueden ser hooks de adquisición/conversión, mientras que la retención proviene del seguimiento y optimización continua del año tributario.

## Experiencia objetivo

Ejemplo de interacción de alto valor:

```text
Projected annual settlement: $382.000 PAYABLE
Tax reserve available:       $150.000
Coverage:                     39%
Status:                       UNDERPROVISIONED

Recommended monthly reserve: $77.000 x 3
```

Tras un nuevo ingreso:

```text
New foreign income detected/confirmed.
Projected settlement changed from $382.000 to $417.000.
Main driver: higher annual taxable income.
```

Tras registrar gastos:

```text
Presumed expense benchmark:      $5.421.000
Eligible actual expenses:        $2.180.000
Potential / needs review:          $640.000
Current best scenario:           PRESUMED
Gap to outperform presumed:      $3.241.000
```

Y al evaluar APV:

```text
APV B contribution:           $1.000.000
Estimated tax reduction:      $40.000
Tax saved per $1 contributed: $0,04
Liquidity committed:          $1.000.000
Assessment:                   low tax-efficiency at current marginal rate
```

El sistema no debe perseguir una devolución grande como objetivo; debe maximizar preparación, legalidad, explicabilidad y eficiencia económica.

## Límites

- Cloud no redefine reglas que pertenecen a Tax Core.
- AI no es autoridad tributaria.
- AI no puede crear gastos, ingresos, beneficios o deducciones sin evidencia/confirmación.
- Un gasto registrado no es una deducción hasta que exista evaluación normativa suficiente.
- Ningún proveedor de AI forma parte del dominio.
- No hacer `cloud-first` a costa de romper la promesa local-first.
- No crear una segunda implementación del cálculo tributario para cloud.
- No fragmentar capacidades en servicios/repos independientes sin evidencia de reutilización y boundary estable.
- No declarar capacidad implementada por el sólo hecho de estar documentada.

## Prioridad conceptual

Secuencia sugerida, todavía sujeta a conciliación con backlog P0:

1. consolidar Tax Core y TAX-01..14;
2. definir contratos neutrales de evidencia/document intelligence y expense eligibility;
3. soportar ingestion local + confirmación manual;
4. incorporar Expense Registry + Presumed vs Actual Comparator;
5. implementar AI extraction administrada como capability provider cuando exista cloud runtime;
6. incorporar sync/evidence/reconciliation de forma incremental;
7. activar monitoring + optimization continuo una vez que el ledger y la adquisición sean confiables;
8. evaluar local AI / BYO provider después, sin bloquear Cloud.

## Resultado estratégico

PTL evoluciona desde una aplicación tributaria local hacia el primer consumidor de un ecosistema TAX compuesto por un núcleo determinista y capacidades opcionales de automatización.

La propuesta queda resumida en:

> **Local-first by default. Cloud for automation and continuous intelligence. AI as an assistive provider, never as tax authority.**

## Estado

`PRODUCT_DIRECTION / DISCOVERY / NOT_IMPLEMENTED`
