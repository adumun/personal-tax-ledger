# Documentación del proyecto

Esta carpeta documenta arquitectura, decisiones, procedimientos operativos, evidencia y trabajo pendiente. La documentación debe describir el código actual, incluir enlaces relativos y distinguir hechos verificados de decisiones futuras.

## Autoridad documental

- GitHub: autoridad técnica para implementación, contratos, configuración final, runbooks, backlog técnico y evidencia reproducible.
- Google Drive: framing/lifecycle/evidencia humana complementaria bajo gobierno ADÜMÜN.
- `site/`: read model web derivado para consumo humano; no constituye una autoridad paralela.

## Índice

- [`development/make-command-interface.md`](development/make-command-interface.md): interfaz Make canónica del repositorio, mapeo hacia comandos nativos, escenarios de uso y troubleshooting.
- [`architecture/README.md`](architecture/README.md): mapa de módulos, límites, HTTP y decisiones técnicas.
- [`backlog/README.md`](backlog/README.md): backlog activo de la iniciativa con slices, gates, dependencias y criterios de aceptación.
- [`backlog/desktop-lifecycle-and-distribution.md`](backlog/desktop-lifecycle-and-distribution.md): secuencia extendida de lifecycle desktop, upgrade, datos, UAT y distribución futura.
- [`desktop/README.md`](desktop/README.md): índice de distribución desktop.
- [`desktop/final-configuration.md`](desktop/final-configuration.md): configuración final Electron/ASAR/staging/Squirrel.Windows.
- [`desktop/lessons-learned.md`](desktop/lessons-learned.md): lecciones aprendidas y decisiones que no deben revertirse sin nueva evidencia.
- [`desktop/uat-evidence-2026-09-04.md`](desktop/uat-evidence-2026-09-04.md): evidencia manual de Windows y lifecycle del instalador.
- [`desktop/microsoft-store-publication-evidence-2026-09-06.md`](desktop/microsoft-store-publication-evidence-2026-09-06.md): evidencia integral de la primera submission real a Microsoft Store.
- [`desktop/microsoft-store-publication-evidence-manifest-2026-09-06.json`](desktop/microsoft-store-publication-evidence-manifest-2026-09-06.json): manifest machine-readable con identidad, candidate, configuración y hashes de evidencia visual.
- [`governance/pre-standard-microsoft-store-publication.md`](governance/pre-standard-microsoft-store-publication.md): pre-estándar ADÜMÜN de publicación de aplicaciones Windows vía Microsoft Store, derivado del proving ground PTL.
- [`desktop-electron.md`](desktop-electron.md): evolución histórica de la ruta Electron y sus gates.
- [`gaps/README.md`](gaps/README.md): pendientes clasificados por tipo, impacto y prioridad.
- [`slice/README.md`](slice/README.md): instrucciones históricas y series de ejecución.
- [`windows-local.md`](windows-local.md): instalación y operación desde PowerShell y CMD.

## Cómo mantenerla

- Enlaza código con rutas relativas, por ejemplo [`apps/local/README.md`](../apps/local/README.md).
- Usa Mermaid para diagramas en Markdown canónico.
- Si una operación recurrente tiene o debe tener fachada Make, documenta primero `make <target>` y después el comando nativo únicamente como implementación/troubleshooting.
- Si se agrega o cambia un target Make, actualiza conjuntamente el `Makefile`, [`development/make-command-interface.md`](development/make-command-interface.md), `make help` y los runbooks afectados.
- Si una decisión cambia el flujo de dependencias, actualiza `architecture/current-state.md`, `target-state.md` y el mapa correspondiente.
- Si cambia la distribución desktop, actualiza conjuntamente `desktop/`, `desktop-electron.md`, backlog/gaps y la proyección `site/`.
- Si algo no puede resolverse por falta de información, registra un gap o backlog item en vez de inventar comportamiento.
- No uses documentación histórica como descripción del estado actual sin marcarla como histórica.
- Mantén paridad semántica entre GitHub, Drive y web sin copiar secretos ni datos personales a superficies públicas.
