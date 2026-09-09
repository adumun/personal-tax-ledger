# Personal Tax Ledger

Estimador local de impuestos personales para Chile. Modela remuneraciones, múltiples empleadores, boletas de honorarios, gastos, APV, créditos hipotecarios y una reliquidación anual explicable.

Este repositorio es un monorepo Node.js. La aplicación ejecutable local vive en `apps/local`; la distribución desktop usa Electron como adaptador de entrega sobre esa misma composición, sin mover lógica tributaria fuera de los paquetes internos.

## Governance y relación con ADÜMÜN

Personal Tax Ledger es un **activo founder-personal gobernado bajo ADÜMÜN**. El ownership personal no lo deja fuera del gobierno ADÜMÜN: conserva lifecycle, documentación, evidencia y estándares comunes, pero no se clasifica como corporate-owned.

Además actúa como **active reference consumer / proving ground** para [`adumun/business-taxops`](https://github.com/adumun/business-taxops). Ambos comparten patrones y semántica tributaria reutilizable, pero mantienen bounded contexts y ownership distintos. Personal Tax Ledger no es legacy ni un alias de Business TaxOps.

Ver [ADÜMÜN governance and Business TaxOps relationship](docs/governance/adumun-governance-and-taxops-relationship.md).

## Navegación

- [Interfaz canónica Make y troubleshooting](docs/development/make-command-interface.md)
- [ADÜMÜN governance y relación con Business TaxOps](docs/governance/adumun-governance-and-taxops-relationship.md)
- [Arquitectura actual](docs/architecture/current-state.md)
- [Arquitectura objetivo](docs/architecture/target-state.md)
- [Mapa de paquetes y destinos](docs/architecture/module-destination-map.md)
- [Catálogo HTTP](docs/architecture/http-route-catalog.md)
- [Política de paquetes](docs/architecture/package-policy.md)
- [Desktop distribution](docs/desktop/README.md)
- [Distribución pública UAT](docs/desktop/uat-public-distribution.md)
- [Configuración final desktop](docs/desktop/final-configuration.md)
- [Lecciones aprendidas desktop](docs/desktop/lessons-learned.md)
- [Evidencia UAT técnica desktop](docs/desktop/uat-evidence-2026-09-04.md)
- [Microsoft Store submission en certificación](docs/desktop/microsoft-store-submission-in-certification-2026-09-06.md)
- [Guía de Windows](docs/windows-local.md)
- [Gaps conocidos](docs/gaps/README.md)
- [Serie de trabajo A.6-A.13](docs/slice/personal-tax-ledger-packs-a6-a13/README.md)

## Interfaz de comandos

PTL adopta el modelo de ejecución de `STD-ENG-DEV-001`: **Make es la interfaz estable del repositorio**. npm, Node.js, Bash, PowerShell, Electron y Windows SDK son herramientas de implementación detrás de esa fachada.

Para descubrir las operaciones disponibles:

```bash
make help
```

Flujo local recomendado:

```bash
make bootstrap
make deps
make up
```

Verificación habitual:

```bash
make doctor
make test
make validate
```

Build de distribución:

```bash
make build
```

`make build` usa Microsoft Store como modo por defecto. Para UAT local Windows:

```bash
make build MODE=uat
```

La referencia completa de cada target, su comando nativo subyacente, escenarios de uso, semántica de éxito/fallo y troubleshooting está en [`docs/development/make-command-interface.md`](docs/development/make-command-interface.md).

Los comandos nativos (`npm run ...`, `bash scripts/...`, `powershell.exe`, `MakeAppx.exe`) siguen existiendo para implementación y diagnóstico, pero no son la interfaz operativa que debe memorizarse ni la que debe priorizarse en runbooks o automatización.

## Estado de distribución desktop

El gate funcional del instalador Windows Squirrel quedó validado el 2026-09-04:

```text
Electron wrapper                 PASS
Portable win32-x64               PASS
ASAR                             PASS
Pruning determinista             PASS
Build Squirrel desde WSL         PASS
Setup.exe Windows                PASS
Reinstall / install-over         PASS
Uninstall + reinstall            PASS
Persistencia de userData         PASS
```

La configuración desktop usa Electron `44.2.0`, `@electron/packager` `20.3.0`, `electron-winstaller` `5.4.4`, `asar: true`, `prune: false` y staging autocontenido en `.desktop-runtime`. Los datos desktop se almacenan bajo `app.getPath('userData')`, separados de los binarios instalados.

Actualmente existen **dos lanes de distribución separadas**:

1. **UAT externa `0.1.6`**: `PersonalTaxLedger-0.1.6-Setup.zip`, distribuido de forma controlada mediante Google Drive. El SHA-256 vigente del ZIP y la política de canal están en [`docs/desktop/uat-public-distribution.md`](docs/desktop/uat-public-distribution.md). El repositorio todavía no tiene GitHub Releases publicados, por lo que Releases no es hoy el canal canónico.
2. **Microsoft Store**: la generación de candidatos se realiza desde WSL mediante la fachada Make. El artefacto final de Store es el `.msix` reportado por `make build` / `make build-store`; el estado de publicación depende de la evidencia vigente de Partner Center y no debe confundirse con la lane UAT.

La UAT no debe presentarse como paquete Microsoft Store, y una submission Store no debe presentarse como release publicada mientras no exista evidencia que cierre certificación, publicación y validación del build firmado por Store.

Siguientes cierres de distribución: confianza de usuario externo/SmartScreen para la lane UAT, eventual migración de artefactos UAT a un canal de release con mejor provenance, validación del resultado de Microsoft Store y política formal de update/autoupdate.

## Mapa del repositorio

| Carpeta | Propósito | Guía |
|---|---|---|
| `apps/local` | Composition root y host HTTP local | [`apps/local/README.md`](apps/local/README.md) |
| `apps/desktop` | Adaptador Electron y lifecycle Squirrel | [`docs/desktop/README.md`](docs/desktop/README.md) |
| `apps/external-consumer` | Consumidor de prueba de exports públicos | [`apps/external-consumer/README.md`](apps/external-consumer/README.md) |
| `packages/core` | Cálculos y reglas puras | [`packages/core/README.md`](packages/core/README.md) |
| `packages/contracts` | Puertos, contextos y asserts | [`packages/contracts/README.md`](packages/contracts/README.md) |
| `packages/application` | Casos de uso | [`packages/application/README.md`](packages/application/README.md) |
| `packages/api-contracts` | DTOs y transporte HTTP | [`packages/api-contracts/README.md`](packages/api-contracts/README.md) |
| `packages/sqlite-adapter` | SQLite, migraciones y repositorios | [`packages/sqlite-adapter/README.md`](packages/sqlite-adapter/README.md) |
| `packages/shared-ui` | Componentes React presentacionales | [`packages/shared-ui/README.md`](packages/shared-ui/README.md) |
| `packages/frontend-application` | Servicios frontend, hooks y orchestration reutilizables | [`packages/frontend-application/README.md`](packages/frontend-application/README.md) |
| `packages/http-api` | Inbound adapter HTTP reutilizable | [`packages/http-api/README.md`](packages/http-api/README.md) |
| `apps/local/web` | Aplicación React local | [`apps/local/web/README.md`](apps/local/web/README.md) |
| `scripts` | Automatización verificable y portable detrás de la fachada Make | [`scripts/README.md`](scripts/README.md) |
| `docs` | Decisiones, procedimientos y gaps | [`docs/README.md`](docs/README.md) |
| `site` | Fuente de la web de conocimiento del repo | [`site/README.md`](site/README.md) |

## Flujo de una petición

```text
apps/local/web/src/features
  -> apps/local/web/src/api.ts
  -> apps/local/src/http/router.mjs
  -> packages/http-api/src/*.mjs
  -> packages/application
  -> packages/contracts
  -> packages/sqlite-adapter
  -> node:sqlite
```

Los cálculos no siguen ese camino: `packages/core` recibe datos y devuelve resultados puros. La UI no contiene SQL y los routers no acceden directamente a tablas.

## Requisitos de desarrollo

- GNU Make.
- Node.js 24.x dentro del rango declarado en `package.json`.
- npm incluido con Node.
- `node:sqlite`, incluido en Node 24.

No se requiere Docker, un ORM, Firebase, Supabase ni una base externa.

Para construir el instalador Squirrel desde WSL/Linux se requieren además Mono y Wine; estos requisitos pertenecen al host de build, no al PC del usuario final.

Para generar MSIX Microsoft Store, el checkout permanece en WSL y se requiere interoperabilidad WSL→Windows con PowerShell y Windows SDK Packaging Tools disponibles en el host Windows.

## Instalación y ejecución local

Interfaz canónica:

```bash
make bootstrap
make deps
make up
```

La aplicación completa queda en `http://localhost:3001` mientras el proceso está activo. Para detenerla se usa `Ctrl-C`; `make down` documenta esta semántica y no gestiona un daemon oculto.

Para desarrollo especializado del frontend/API, los scripts npm siguen siendo detalles de implementación disponibles para diagnóstico y trabajo de bajo nivel. Consulta la guía Make antes de documentar un nuevo flujo directo.

Variables de ejecución:

| Variable | Default | Descripción |
|---|---:|---|
| `PORT` | `3001` | Puerto del host HTTP local. |
| `DB_PATH` | `data/apv-chile.sqlite` | Ruta de la base SQLite en modo local no-Electron. |

## Build desktop y distribución

Microsoft Store:

```bash
make build
```

Equivalentes explícitos:

```bash
make build-store
make store-artifact
```

UAT Windows local:

```bash
make build MODE=uat
```

La lógica nativa está encapsulada detrás de los targets y scripts del repositorio. No copies secuencias npm/PowerShell/MakeAppx a nuevos runbooks salvo como troubleshooting.

## Verificación completa

Interfaz recomendada:

```bash
make doctor
make validate
```

Para necesidades específicas:

```bash
make test
make lint
```

Las pruebas especializadas de workspaces, smoke tests y packaging siguen disponibles como scripts internos, pero cualquier operación recurrente nueva debe evaluarse para ser expuesta mediante Make y documentada en la guía de interfaz.

## Principios para contribuidores

1. Mantén los cálculos en `packages/core` y no introduzcas I/O allí.
2. Define contratos antes de agregar una implementación de repositorio.
3. Inyecta repositorios y clientes en `application` y servicios frontend.
4. Usa DTOs de `packages/api-contracts` en vez de duplicar formas locales.
5. Mantén `shared-ui` libre de `fetch`, SQLite, `process.env` y URLs de despliegue.
6. Agrega tests junto al workspace afectado y conserva los tests de integración en `test/`.
7. Actualiza el README de la carpeta cuando cambie su responsabilidad o API.
8. Documenta en [`docs/gaps/`](docs/gaps/README.md) cualquier decisión funcional, técnica o prerrequisito no resuelto.
9. Mantén GitHub como autoridad técnica; Drive como framing/evidencia complementaria y `site/` como read model derivado.
10. Para operaciones recurrentes, documenta primero la fachada Make y luego el comando nativo que implementa el target; evita convertir tooling específico en la interfaz pública del repo.

## Estado arquitectónico

La serie A14-A18 está certificada como `CLEAN_HEXAGONAL_READY`. El informe final está en [`docs/architecture/final-certification-a18.md`](docs/architecture/final-certification-a18.md); el informe histórico `PACK_A_PARTIAL` se conserva en [`docs/architecture/pack-a-final-report.md`](docs/architecture/pack-a-final-report.md).
