# Desktop distribution

Esta carpeta concentra la documentación técnica de autoridad para la distribución desktop de Personal Tax Ledger.

## Documentos

- [Configuración final](final-configuration.md): composición Electron, staging, ASAR, empaquetado, Squirrel.Windows, paths de datos y comandos finales.
- [Perfil local, workspace y startup](local-profile-workspace-startup.md): implementación del bootstrap local, selector de workspace, onboarding, splash y comportamiento post-upgrade.
- [Modos de build de distribución](distribution-build-modes.md): entrypoints `make build` para Microsoft Store y `make build MODE=uat` / `make build-uat` para instalador local UAT, con separación de artefactos, hashes y DoR/DoD.
- [Diagnóstico Windows Application Control 2026-09-06](windows-application-control-diagnostic-2026-09-06.md): evidencia del bloqueo de `PersonalTaxLedger.exe` 0.1.4 por Smart App Control / Code Integrity y consecuencias para la estrategia de firma.
- [Firma de código Windows](windows-code-signing.md): contrato de signing, variables de entorno, integración con Packager/Squirrel y gate de cierre bajo Smart App Control.
- [Microsoft Store + MSIX](microsoft-store-msix.md): vía principal de distribución pública, contrato de identidad de Partner Center, staging MSIX y gates de compatibilidad.
- [Microsoft Store submission 0.1.5](microsoft-store-submission-0.1.5.md): runbook de la primera submission real, artefacto Store, WACK, `runFullTrust`, privacy policy, listing y gate posterior a certificación.
- [Microsoft Store submission en certificación — 2026-09-06](microsoft-store-submission-in-certification-2026-09-06.md): checkpoint histórico previo a certificación/publicación.
- [Evidencia completa del proceso Microsoft Store — 2026-09-06](microsoft-store-publication-evidence-2026-09-06.md): reconstrucción integral del proceso Partner Center desde pricing hasta envío a certificación, incluyendo decisiones, ratings, package validado y gates entonces pendientes.
- [Manifest machine-readable de evidencia Microsoft Store — 2026-09-06](microsoft-store-publication-evidence-manifest-2026-09-06.json): identidad, candidate, configuración de submission, hashes de 27 screenshots y checksum del bundle binario privado.
- [Publicación Microsoft Store confirmada — 2026-09-11](microsoft-store-publication-confirmed-2026-09-11.md): cierre del gate Microsoft-side de certificación/publicación y separación explícita respecto de la validación nativa post-publicación.
- [Microsoft Store native runtime smoke — 2026-09-11](microsoft-store-native-runtime-smoke-2026-09-11.md): evidencia humana de descarga, instalación, registro en Windows, launch nativo y UI operativa del build entregado por Store.
- [Evidencia preparación MSIX 0.1.5 — 2026-09-06](msix-015-preparation-evidence-2026-09-06.md): gate de preparación del upgrade `0.1.4.0 -> 0.1.5.0`, validaciones de identidad Store y bind explícito a `127.0.0.1`.
- [Lecciones aprendidas](lessons-learned.md): decisiones, fallos reproducidos, causas raíz y correcciones permanentes.
- [Evidencia UAT técnica 2026-09-04](uat-evidence-2026-09-04.md): gates observados en Windows nativo.
- [Ruta Electron](../desktop-electron.md): evolución histórica del wrapper y de los gates de empaquetado.

## Estado actual Microsoft Store

Desde 2026-09-11, Partner Center confirma que Personal Tax Ledger está **In Microsoft Store** y disponible según la discoverability configurada en Availability. Ese mismo día, el build entregado por Microsoft Store fue descargado, instalado y ejecutado correctamente en Windows nativo.

Estado canónico actual:

```text
STORE_PUBLICATION_CONFIRMED_NATIVE_RUNTIME_SMOKE_PASS
```

Quedan cerrados el gate Microsoft-side de certificación/publicación y el smoke nativo de instalación + launch. Las verificaciones profundas de invariantes internos —loopback explícito, identidad del workspace histórico, path/estado SQLite, ausencia de base duplicada y eventual retiro controlado de una instalación Squirrel previa— permanecen como evidencia técnica adicional y no como bloqueadores de la afirmación de que el producto está publicado, instala y ejecuta correctamente desde Store.

Store ID: `9N8NR29965DS`  
Store URL: `https://apps.microsoft.com/detail/9N8NR29965DS`

La lane Store permanece separada de la UAT externa `0.1.6`, cuya provenance y política están documentadas en `uat-public-distribution.md`.

## Autoridad

GitHub es la autoridad técnica. Google Drive conserva framing, lifecycle y evidencia humana complementaria. La web del repo es una proyección de lectura y no sustituye estos documentos.

Los diagramas de arquitectura se expresan en Mermaid en la documentación Markdown canónica.
