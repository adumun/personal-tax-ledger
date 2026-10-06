# Gap de bootstrap y artefacto Store — 2026-10-06

**Tipo:** `prerrequisito`

**Descripción:** La configuración npm local inicia con `allow-git=none`, pero el lockfile actual consume `@adumun/react-components` desde Git en el commit `e9dff2fba8fcf3ec7d352a7c40d5d4d749bc999e`. Por ello, `make bootstrap` y la fase de `npm ci` de `make build` requieren una política local que permita dependencias Git (`NPM_CONFIG_ALLOW_GIT=all`). La ejecución del Store lane quedó detenida antes de generar staging/MSIX por este prerrequisito.

**Impacto:** El gate funcional y técnico pasa con las dependencias ya instaladas, pero no se pudo producir en esta sesión un `.msix` verificable ni completar el lane reproducible desde un checkout limpio con la configuración npm predeterminada.

**Acción requerida:** Reconciliar la política de instalación Git del entorno operativo o publicar/consumir una fuente de paquete permitida para la dependencia fijada; después repetir `make bootstrap` y `make build` en un host con `powershell.exe` y Windows SDK `MakeAppx.exe` disponibles.

**Prioridad:** `media`
