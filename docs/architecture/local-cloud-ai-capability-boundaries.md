# Local / Cloud / AI capability boundaries

**Estado:** `ARCHITECTURE_DIRECTION / DISCOVERY`  
**Fecha:** 2026-09-12

## Contexto

La arquitectura objetivo existente ya establece paquetes reutilizables con aplicación local y un futuro consumidor cloud. Esta decisión amplía ese estado objetivo para incorporar document intelligence y automatización sin duplicar dominio ni acoplarse a proveedores de AI.

## Decisión

El ecosistema TAX tendrá un núcleo determinista compartido y múltiples composition roots/capability providers.

```text
                         Tax Core
                  rules / semantics / math
                             |
            +----------------+----------------+
            |                                 |
     local composition                  cloud composition
            |                                 |
        SQLite/local                     cloud persistence
        manual input                     managed ingestion
        optional AI                      managed AI provider
        offline                          sync / monitoring
```

### Tax Core

Debe permanecer libre de:

- proveedor de AI;
- storage cloud/local concreto;
- HTTP/UI;
- OCR;
- integración SII concreta;
- secrets/credentials;
- workflows de facturación cloud.

Responsabilidad: reglas, semántica tributaria, cálculos deterministas, clasificación de resultados y contratos de dominio estables.

## Document Intelligence como puerto

Se propone un contrato neutral, conceptualmente equivalente a:

```text
DocumentIntelligenceProvider
  classify(document)
  extract(document, schema/profile)
  explain(result)
```

El contrato no debe mencionar proveedores específicos.

Adaptadores futuros posibles:

```text
LocalModelDocumentIntelligenceAdapter
ExternalApiDocumentIntelligenceAdapter
ManagedCloudDocumentIntelligenceAdapter
ManualExtractionAdapter
```

Los nombres son conceptuales; no declaran implementación.

## Pipeline normativo de incorporación

```text
RawEvidence
  -> ExtractionCandidate
  -> SchemaValidation
  -> TaxSemanticValidation
  -> HumanReview
  -> ConfirmedFact
  -> CanonicalLedger
```

### Invariantes

1. `ExtractionCandidate` no es un hecho canónico.
2. `confidence` nunca reemplaza validación normativa.
3. La evidencia original permanece vinculada al candidato y al hecho confirmado.
4. La AI no modifica el ledger de forma silenciosa.
5. La validación semántica pertenece al dominio/application layer, no al provider.
6. Un provider puede fallar o no existir sin impedir el uso manual de PTL.
7. Local y Cloud deben producir el mismo contrato de candidato cuando procesan el mismo tipo de documento.

## Bounded capabilities

### Local runtime

Responsable de:

- composición local;
- persistencia SQLite;
- evidencia local;
- importación manual;
- uso offline;
- provider opcional local/BYO si existe.

### Cloud runtime

Responsable de:

- tenancy/auth cuando se defina;
- persistencia cloud;
- evidence storage gestionado;
- ejecución de providers administrados;
- jobs/colas de procesamiento;
- sync;
- monitoring/automation;
- límites/quotas/billing de capacidades pagadas.

El Cloud runtime consume Tax Core/application; no contiene una implementación tributaria alternativa.

## Sync

La sincronización no se introduce implícitamente por existir Cloud. Debe definirse como capacidad explícita con identidad, versionado, conflictos y ownership de datos.

Principios preliminares:

- local-first no equivale a local-only;
- cloud opt-in;
- no sobrescritura silenciosa;
- provenance de cambios;
- conflicto explícito cuando no exista merge determinista;
- posibilidad de mantener workspace exclusivamente local.

## Seguridad y privacidad

Documentos tributarios y liquidaciones son evidencia personal sensible del producto, por lo que cualquier capability cloud requiere:

- cifrado en tránsito y almacenamiento según threat model;
- minimización de datos enviados al provider;
- política de retención;
- eliminación/exportación controlada;
- separación tenant/workspace;
- provider logging controlado;
- no reutilización del documento fuera de la finalidad declarada salvo consentimiento/política explícita.

Los requisitos concretos deberán formalizarse antes de producción cloud.

## Economía de inferencia

La separación provider/contract permite tres modelos operativos:

1. `managed`: ADÜMÜN paga inferencia y la incluye en suscripción/uso;
2. `BYOK`: el usuario configura una credencial externa;
3. `local`: inferencia corre en infraestructura del usuario.

La selección es infraestructura/configuración, no semántica tributaria.

## Relación con estado objetivo existente

Este documento no reemplaza `target-state.md`. Lo especializa:

- `core`, `contracts`, `application` y UI reutilizable continúan siendo el fundamento;
- `apps/local` sigue siendo el composition root local;
- un futuro composition root cloud debe reutilizar esos paquetes;
- document intelligence se incorpora mediante puertos/adaptadores, no mediante imports de SDKs AI al core.

## Consecuencias

Positivas:

- una sola verdad tributaria;
- Desktop Free permanece completo y útil;
- Cloud puede monetizar automatización real;
- providers de AI intercambiables;
- posibilidad futura de local AI sin rediseño de dominio;
- testabilidad mediante adapters fake/deterministas.

Costos:

- contratos de extraction candidate y provenance deben diseñarse cuidadosamente;
- sync y tenancy agregan complejidad propia;
- Cloud exige threat model, observabilidad, billing y operaciones;
- AI necesita evaluation suites y fixtures de documentos anonimizados.

## No decidido todavía

- proveedor AI cloud;
- proveedor/storage cloud;
- modelo de pricing;
- repo separado para Tax Cloud;
- tecnología de jobs/colas;
- formato final de sync;
- local model runtime concreto;
- BYOK en primera versión.

Estas decisiones quedan deliberadamente abiertas hasta que exista un slice ejecutable y evidencia suficiente.
