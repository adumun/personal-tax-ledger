# PTL public website source

Esta carpeta es la fuente versionada del sitio público de Personal Tax Ledger.

## Intención editorial

El sitio aplica una regla editorial interna **90/10**:

- **90% usuario final / tester UAT**: comprensión del producto, capacidades, alcance, distribución, participación UAT, feedback y preguntas frecuentes.
- **10% colaborador**: entrada secundaria para revisión tributaria, UX y desarrollo de software.

Esta proporción es metadata interna de composición y no debe aparecer como copy o etiqueta visible para el visitante.

La portada no debe comportarse como documentación de repositorio ni competir visualmente con GitHub. Desde la publicación en Microsoft Store, la conversión primaria pública es instalar/consultar el producto desde Store; la UAT `0.1.6` permanece como lane secundaria de validación controlada. El feedback sigue siendo una acción pública importante y la colaboración técnica continúa como entrada terciaria.

## Estado actual

- Microsoft Store: publicación confirmada el 2026-09-11 para la submission lineage `0.1.5.0`;
- Store ID: `9N8NR29965DS`;
- Store URL: `https://apps.microsoft.com/detail/9N8NR29965DS`;
- estado técnico Store: `STORE_PUBLICATION_CONFIRMED_NATIVE_RUNTIME_SMOKE_PASS`;
- el build entregado por Store fue descargado, instalado y ejecutado correctamente en Windows nativo;
- lane pública de validación UAT: `0.1.6`, separada de Store;
- formulario oficial de feedback: `https://form.jotform.com/262494013962055`;
- canal canónico actual de descarga UAT: Google Drive, archivo `PersonalTaxLedger-0.1.6-Setup.zip`;
- SHA-256 del ZIP UAT: `613505df917b89d6014c9c5ab36e054ceba7e67b589e618f45f9713fcfdcfb45`;
- GitHub Releases: aún no existe un release publicado y no debe presentarse como canal canónico actual de la lane UAT;
- PTL es un simulador de apoyo y no reemplaza al SII ni asesoría profesional;
- ante discrepancias tributarias, prevalece la información oficial del SII.

Detalle canónico de distribución UAT: [`docs/desktop/uat-public-distribution.md`](../docs/desktop/uat-public-distribution.md).  
Evidencia canónica de publicación Store: [`docs/desktop/microsoft-store-publication-confirmed-2026-09-11.md`](../docs/desktop/microsoft-store-publication-confirmed-2026-09-11.md).  
Evidencia canónica de runtime Store: [`docs/desktop/microsoft-store-native-runtime-smoke-2026-09-11.md`](../docs/desktop/microsoft-store-native-runtime-smoke-2026-09-11.md).

## Product evidence

PTL-2 define un set E1–E5 para demostrar visualmente workspace anual, honorarios, hipotecario/deducciones, comparación de escenarios y explicabilidad. Las capturas reales ya fueron suministradas/subidas como evidencia de producto; no deben volver a tratarse como un bloqueo de captura.

La normalización de esas imágenes hacia los paths canónicos propuestos bajo `site/assets/product/`, su provenance final y su integración en la superficie pública siguen siendo trabajo de publicación. La ausencia de esos cinco paths en `master/site/assets/product/` no invalida la evidencia ya suministrada, pero sí impide considerar cerrado el DoD de integración del sitio hasta que exista una proyección canónica verificable.

Contrato canónico: [`docs/site/product-evidence-capture-plan.md`](../docs/site/product-evidence-capture-plan.md).

## Páginas principales

- `index.html`: home de producto orientada al usuario final.
- `usage.html`: capacidades y recorrido de uso.
- `uat.html`: hub de participación UAT, descarga y feedback.
- `faq.html`: preguntas frecuentes para usuarios y testers.
- `contribute.html`: puerta secundaria de colaboración tributaria/técnica.
- `privacy.html`: política de privacidad de la aplicación local-first.

## Superficies técnicas secundarias

Se conservan como referencia para colaboradores, pero no forman parte de la navegación primaria objetivo:

- `build.html`
- `architecture.html`
- `distribution.html`
- `evidence.html`
- `lessons.html`

Su clasificación pública final se está revisando en PTL-0 / PTL-3. La historia de ingeniería y evidencia detallada deben permanecer en el repositorio cuando no aporten directamente al reader contract público.

## Reglas

- mantener paridad semántica con el estado real del código y `docs/`;
- separar siempre **actual/validado** de **próximo/planificado**;
- presentar Microsoft Store como distribución pública aprobada y operativa al nivel ya evidenciado;
- mantener la UAT `0.1.6` explícitamente separada de Microsoft Store;
- no presentar ningún cálculo de PTL como verdad oficial del SII;
- no copiar secretos, datos tributarios reales, paths personales ni evidencia sensible;
- el feedback UAT debe ser accesible sin conocimientos técnicos;
- la colaboración técnica/tributaria debe permanecer visible pero secundaria;
- metadata editorial interna, porcentajes de audiencia y decisiones de generación no deben filtrarse al copy público;
- `master/site/` es la fuente versionada;
- `gh-pages` es una proyección de publicación derivada y no autoridad documental.

El sitio sigue siendo un **read model derivado** del producto y su conocimiento gobernado. La autoridad técnica permanece en el repositorio y la autoridad tributaria externa permanece en las fuentes oficiales correspondientes.
