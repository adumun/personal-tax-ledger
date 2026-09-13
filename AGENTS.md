# Instrucciones del agente

Este archivo contiene las reglas que el agente (opencode) debe seguir en
este repositorio. Aplica a todas las tareas.

## Stack y convenciones

- Monorepo: apps (`apps/local` como host HTTP y frontend React local) y
  packages (`packages/*`, Node.js ESM, `.mjs`).
- Base de datos: `node:sqlite` sin ORM. Entidades con datos variables como
  JSON TEXT.
- Parámetros tributarios versionados por año en `tax_parameters`; fuentes
  oficiales en `tax_rule_sources`.
- Fuentes de normativa: solo oficiales (SII, BCN, Superintendencia de
  Pensiones, Fonasa). Sin scraping en runtime.
- Arquitectura clean/hexagonal: cálculos puros en `packages/core`; puertos y
  contratos en `packages/contracts`; casos de uso en `packages/application`;
  inbound adapter HTTP en `packages/http-api`; persistencia en
  `packages/sqlite-adapter`; DTOs de transporte en `packages/api-contracts`;
  UI presentacional en `packages/shared-ui`; composition root y host local en
  `apps/local`.
- Errores de validación: lanzar `ValidationError` (de
  `packages/core/src/util.mjs`) y mapearlos a HTTP 400 con `fieldErrors`.
- Redondeo monetario: `round2` de `packages/core/src/util.mjs`.
- Los archivos nuevos del servidor deben exportar las funciones exactas que
  importa `packages/http-api/src/index.mjs`.
- NO agregar comentarios al código salvo que se pidan.
- NO arreglar errores preexistentes de `tsc -b` durante trabajo de
  features; documentarlos como gap (ver abajo).

## REGLA: PTL como primer dogfood / extraction driver React

Personal Tax Ledger es el primer consumidor de prueba y driver de extracción de
`PROFILE-ENG-REACT-001` y del repositorio canónico `adumun/react-components`.
Esto NO convierte a PTL en autoridad normativa ni en dueño de los componentes
compartidos: la autoridad normativa permanece en `adumun/platform-standards` y
la implementación React transversal permanece en `adumun/react-components`.

Para cualquier cambio React material:

1. Clasificar los componentes según la jerarquía ADÜMÜN:
   `Layout -> Page -> Section -> Component -> Sub -> Micro -> Nano`.
2. Antes de crear un componente o capacidad transversal local, buscar primero
   su equivalente en `adumun/react-components`.
3. Si no existe, revisar implementaciones React existentes de ADÜMÜN que puedan
   aportar casos de uso o evidencia, incluyendo al menos los repos relevantes
   entre Auto-IG Posting, KeyGo, Starborne Voyager, PTL y otros consumidores
   activos aplicables.
4. Enumerar y reconciliar los casos de uso, estados runtime, accesibilidad,
   comportamiento responsive, personalización/theming y diferencias de los
   consumidores antes de diseñar la API compartida.
5. Si la responsabilidad es transversal, implementar/promover el componente o
   capability en `adumun/react-components`; PTL debe consumirlo desde allí y no
   mantener una copia local equivalente.
6. Si la responsabilidad es genuinamente de dominio PTL o aún no está madura
   para promoción, mantenerla local y documentar por qué.
7. Preferir composición de capacidades transversales (`Feedbackable`,
   `Confirmable`, `PermissionAware`, `Retryable`, `SaveAware`, etc.) sobre
   duplicación de comportamiento dentro de componentes de feature, evitando
   wrapper pyramids o abstracciones sin contrato real.
8. Todo cambio visual material debe quedar `VISUAL_VALIDATION_PENDING` hasta
   que se levante en el entorno local y sea revisado visualmente por el usuario.
   Tests verdes no reemplazan este gate.
9. La estabilización de un componente compartido requiere dos evidencias:
   validación en `adumun/react-components` y dogfood integrado en PTL.

Flujo operativo canónico:

```text
Necesidad PTL
  -> buscar en adumun/react-components
  -> discovery de implementaciones React ADÜMÜN si falta
  -> reconciliar casos de uso
  -> implementar/ajustar contrato compartido
  -> consumir desde PTL
  -> validación técnica
  -> validación visual cuando corresponda
  -> estabilizar/promover
```

Ver `docs/architecture/react-dogfood-extraction-driver.md`.

## Verificación obligatoria tras una tarea

- `npm test` (backend: `node --test test/*.test.mjs`).
- `cd apps/local/web && npx --no-install vite build`.
- Si el cambio toca la API: verificar con curl contra el servidor en `:3001`.

## REGLA: documentar gaps en `docs/gaps/`

Al final de cada acción principal (es decir, cuando concluya una tarea
sustantiva — implementar un feature, investigar, refactorizar), el agente
DEBE revisar si durante esa acción encontró algo que no pudo hacer, por
cualquiera de estas razones:

1. **Desconocimiento funcional**: no sabe cómo debe comportarse el negocio
   (normativa tributaria, reglas de producto sin definir).
2. **Desconocimiento técnico**: no sabe cómo implementar algo con el stack
   actual.
3. **Prerrequisito faltante**: falta una dependencia, decisión de producto,
   dato semilla, información o acceso para poder avanzar.

Por cada hallazgo, el agente DEBE escribir (o actualizar) un documento en
`docs/gaps/` con el formato:

- Archivo: `YYYY-MM-DD-tema.md` (un archivo por tema o por sesión).
- Contenido por gap: **Tipo** (`funcional` / `técnico` / `prerrequisito`),
  **Descripción**, **Impacto**, **Acción requerida** y **Prioridad**
  (`alta` / `media` / `baja`).
- Actualizar el índice de `docs/gaps/README.md`.

Si no hay gaps nuevos, no es necesario escribir archivos adicionales.

El objetivo es que los gaps queden priorizados y sirvan de hoja de ruta
para sesiones futuras (qué agregar primero).

## Compromisos

- Nunca adivinar valores normativos: si una cifra (tasa, UTA, umbral) no
  está verificada, registrarlo como gap de prioridad alta en lugar de
  inventarla silenciosamente.
