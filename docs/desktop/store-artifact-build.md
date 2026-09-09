# Microsoft Store artifact build

Estado: `IMPLEMENTED`

## Objetivo

Generar desde WSL, en un único comando, el artefacto MSIX listo para cargar en Microsoft Partner Center.

El repositorio y todo el build permanecen en WSL. Para el paso final de empaquetado MSIX, el script usa `powershell.exe` únicamente como bridge hacia `MakeAppx.exe` del Windows SDK instalado en el host Windows. No requiere checkout del repositorio, Node, npm ni una copia del proyecto en Windows.

## Comando canónico

Desde la raíz del repositorio:

```bash
npm run desktop:msix:store:artifact
```

La versión del MSIX se deriva automáticamente desde `package.json` mediante el contrato existente de `scripts/msix-config.mjs`; no se debe escribir manualmente en el comando.

## Pipeline ejecutado

`scripts/build-store-msix.sh` realiza secuencialmente:

1. preflight de WSL y comandos requeridos;
2. `npm ci`;
3. suite completa `npm test`;
4. `npm run desktop:check`;
5. build Electron `win32-x64` y staging Store mediante `npm run desktop:msix:prepare:store`;
6. validación de metadata de certificación y rechazo explícito de placeholders;
7. invocación de `scripts/package-msix.ps1` mediante `powershell.exe`/`wslpath`;
8. empaquetado final con Windows SDK `MakeAppx.exe`;
9. validación estructural del contenedor MSIX;
10. comprobación del `AppxManifest.xml`, identidad Store, versión y referencias a los cuatro assets de branding;
11. comprobación de presencia de:
    - `StoreLogo.png`;
    - `Square44x44Logo.png`;
    - `Square150x150Logo.png`;
    - `Wide310x150Logo.png`;
12. cálculo SHA-256 del paquete;
13. generación de evidencia machine-readable `out/msix/store-artifact.json`.

Cualquier fallo aborta el proceso y no declara el artefacto como listo.

## Salidas

Para una versión npm `0.1.6`, el resultado esperado es:

```text
out/msix/PersonalTaxLedger-0.1.6.0-x64.msix
out/msix/msix-build.json
out/msix/store-artifact.json
```

El `.msix` es el archivo que se carga en Partner Center.

## Regla de firma

El artefacto para Microsoft Store se genera **sin** `-SignForDevelopment`. El canal self-signed pertenece a sideload/UAT y no debe mezclarse con el artefacto de submission de Store.

## Dependencias del host

WSL:

- Node compatible con `package.json`;
- npm;
- `wslpath`;
- `powershell.exe` accesible desde WSL;
- `unzip`;
- `sha256sum`.

Windows host:

- Windows SDK con `MakeAppx.exe` disponible.

No se requiere repositorio ni toolchain de desarrollo Node en Windows.

## DoD de artefacto Store

Un build se considera `STORE ARTIFACT READY` sólo cuando:

- tests pasan;
- desktop source checks pasan;
- staging se genera en `store` mode;
- no se permiten placeholders;
- cuatro assets de certificación tienen branding versionado y SHA-256;
- `MakeAppx.exe` genera el MSIX;
- el ZIP/MSIX es íntegro;
- el manifest contiene `Admn.PersonalTaxLedger`;
- versión del manifest coincide con metadata;
- los cuatro assets existen en el paquete final y están referenciados por el manifest;
- se genera SHA-256 y evidencia final.

Después de este gate, el único paso manual es cargar el `.msix` resultante en Partner Center y enviar la submission a certificación.
