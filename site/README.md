# PTL public website source

Esta carpeta es la fuente versionada del sitio público de Personal Tax Ledger.

## Intención editorial

El sitio aplica una regla explícita **90/10**:

- **90% usuario final / tester UAT**: comprensión del producto, capacidades, alcance, participación UAT, descarga, feedback y preguntas frecuentes.
- **10% colaborador**: entrada secundaria para revisión tributaria, UX y desarrollo de software.

La portada no debe comportarse como documentación de repositorio ni competir visualmente con GitHub. La conversión primaria es participar en la UAT / descargar la versión de validación; la secundaria es enviar feedback; la colaboración técnica es terciaria.

## Estado actual

- versión pública de validación: `0.1.6`;
- etapa: `UAT externa`;
- formulario oficial de feedback: `https://form.jotform.com/262494013962055`;
- canal de descarga pública: GitHub Releases del repositorio;
- PTL es un simulador de apoyo y no reemplaza al SII ni asesoría profesional;
- ante discrepancias tributarias, prevalece la información oficial del SII.

## Páginas principales

- `index.html`: home de producto orientada al usuario final.
- `usage.html`: capacidades y recorrido de uso.
- `uat.html`: hub de participación UAT, descarga y feedback.
- `faq.html`: preguntas frecuentes para usuarios y testers.
- `contribute.html`: puerta secundaria de colaboración tributaria/técnica.

## Superficies técnicas secundarias

Se conservan como referencia para colaboradores, pero no forman parte de la navegación primaria:

- `build.html`
- `architecture.html`
- `distribution.html`
- `evidence.html`
- `lessons.html`

## Reglas

- mantener paridad semántica con el estado real del código y `docs/`;
- separar siempre **actual/validado** de **próximo/planificado**;
- no presentar la UAT como release estable o producto terminado;
- no presentar ningún cálculo de PTL como verdad oficial del SII;
- no copiar secretos, datos tributarios reales, paths personales ni evidencia sensible;
- el feedback UAT debe ser accesible sin conocimientos técnicos;
- la colaboración técnica/tributaria debe permanecer visible pero secundaria;
- `master/site/` es la fuente versionada;
- `gh-pages` es una proyección de publicación derivada y no autoridad documental.

El sitio sigue siendo un **read model derivado** del producto y su conocimiento gobernado. La autoridad técnica permanece en el repositorio y la autoridad tributaria externa permanece en las fuentes oficiales correspondientes.