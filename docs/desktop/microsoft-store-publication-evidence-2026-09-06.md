# Microsoft Store publication — evidencia completa de la primera submission de PTL 0.1.5.0

**Fecha de ejecución:** 2026-09-06 (CLT, UTC-03:00)  
**Producto:** Personal Tax Ledger  
**Estado al cierre de este checkpoint:** `IN_CERTIFICATION / PRE_PROCESSING`  
**Candidate:** `0.1.5.0` x64

## 1. Resultado ejecutivo

La primera submission real de Personal Tax Ledger a Microsoft Store fue construida, validada localmente con Windows App Certification Kit, configurada en Partner Center y enviada a certificación.

Estado alcanzado:

```text
Store identity                         PASS
MSIX Store staging                     PASS
Store package build                    PASS
Round-trip MakeAppx                    PASS
SHA-256 persisted                      PASS
Expected pre-Store Authenticode        NotSigned
WACK overall                           PASS
Partner Center pricing/properties      COMPLETE
IARC age ratings                       COMPLETE
Package upload                         VALIDATED
Store listing                          COMPLETE
runFullTrust justification             COMPLETE
Submission options                     COMPLETE
Submit for certification               DONE
Current Partner Center stage           PRE-PROCESSING
Certification                          PENDING
Publishing                             PENDING
```

## 2. Identidad canónica Store

```text
Package/Identity/Name       Admn.PersonalTaxLedger
Package/Identity/Publisher  CN=5D12CBCA-3417-412D-81A4-21E062DB93F5
PublisherDisplayName        Adümün
PFN                         Admn.PersonalTaxLedger_eraxmwbat6msg
Store ID                    9N8NR29965DS
MSA app Id                  ef7500be-f1b4-4bd0-8791-a6d3b5b2b92f
```

Store URL reservada:

`https://apps.microsoft.com/detail/9N8NR29965DS`

## 3. Artefacto presentado

```text
File       PersonalTaxLedger-0.1.5.0-x64-store.msix
Version    0.1.5.0
Arch       x64
Bytes      163545577
SHA-256    3143FB6C181A80D42FE638D3979092BEA098C7C26B43D1BA7E87CD5F0FAFCC5F
Signature  NotSigned (expected before Store processing)
```

El artefacto fue construido en un lane separado del sideload de desarrollo.

## 4. WACK

Windows App Certification Kit:
- versión de report: `10.0.28000.2705`;
- `OVERALL_RESULT="PASS"`;
- `PARTIAL_RUN="FALSE"`;
- app: `Admn.PersonalTaxLedger`;
- versión: `0.1.5.0`;
- x64;
- Centennial/MSIX.

Se observó un FAIL dentro del test opcional `Blocked executables`, con referencias heurísticas a `CreateProcessW`, `cmd`, `reg`, `bash` y contenido de Electron/Chromium. El resultado global se mantuvo en PASS. Esta observación queda preservada y no se interpreta como un rechazo de la submission.

## 5. Configuración de Partner Center

### 5.1 Pricing and availability

```text
Markets              Chile only
Future markets       Disabled
Audience             Public
Discoverability      Discoverable
Release              As soon as possible
Stop acquisition     Never
Currency             CLP - Chile
Retail price         0 / Free
Free trial           None
Sale pricing         None
```

Racional: el producto modela tributación personal chilena y no debe descubrirse globalmente por defecto.

### 5.2 Properties

Categoría seleccionada:
- `Personal finance`;
- `Budgeting + taxes`.

Privacidad:
- se respondió `Yes` a acceso/colección/transmisión de información personal, porque la aplicación accede y procesa información personal local aunque no la envíe a un backend;
- privacy policy pública configurada en la web del repo.

Declaraciones:
- sin compras fuera de Store;
- sin declaración formal de accessibility testing;
- sin Mixed Reality;
- sin OneDrive backup declarado;
- sin recording/broadcast;
- sin pen/ink;
- sin generative AI.

Requisitos:
- sólo se declaran requisitos respaldados; se evitó inventar RAM/DirectX/GPU/CPU.

### 5.3 Age ratings / IARC

App type: `All Other App Types`.

Respuestas relevantes:
- no ratings-relevant downloaded content;
- no user content sharing;
- no online content externo;
- no productos/actividades age-restricted;
- no ubicación compartida con otros usuarios;
- no compra de digital goods;
- no rewards/crypto/NFT;
- no browser/search engine;
- no news/educational primary purpose;
- no physical media / external rating board.

Resultados:
- Chile CCC: `TE / All ages`;
- Brazil DJCTQ: `L / All ages`;
- ESRB: `Everyone`;
- IARC Global: `3+`;
- Microsoft Store: `3+`;
- PEGI: `3`;
- USK: `0 / Everyone`.

### 5.4 Packages

Partner Center reconoció:

```text
Version        0.1.5.0
Architecture   x64
Device family  Windows.Desktop
Min version    10.0.19041.0
Validation     Validated
```

Sólo `Windows 10/11 Desktop` queda habilitado. La opción automática de futuras device families se deshabilitó.

Capability restringida detectada: `runFullTrust`.

### 5.5 Store listing

Listing principal: `Spanish (Chile)`.

Nombre: `Personal Tax Ledger`.

Descripción pública orientada a:
- estimación de impuestos personales en Chile;
- remuneraciones y múltiples empleadores;
- boletas de honorarios;
- gastos;
- APV;
- créditos hipotecarios;
- reliquidación anual explicable;
- persistencia local.

Se evita afirmar afiliación con el SII y se incluye un disclaimer de herramienta de apoyo.

Keywords definidas:
- impuestos Chile;
- impuestos personales;
- renta;
- boletas de honorarios;
- APV;
- remuneraciones;
- reliquidación.

Publisher/developed by: `Adümün`.

Las capturas de Store deben usar datos ficticios o anonimizados.

### 5.6 Submission options

Publishing policy: publicar tan pronto como pase certificación.

`runFullTrust` se justificó porque PTL es una aplicación Win32/Electron empaquetada como MSIX y requiere:
- runtime Electron/Node.js;
- acceso a user-data/workspace local;
- SQLite local;
- comunicación con el servicio local de la app;
- permisos estándar del usuario, no elevación administrativa normal.

Texto compacto utilizado/conceptualmente equivalente:

> Personal Tax Ledger is an Electron-based Win32 desktop app packaged as MSIX. It requires runFullTrust to run the desktop runtime, access local user-data/workspace files, use local SQLite storage, and communicate with its local application service under the signed-in user's standard permissions. It does not install drivers or services, does not require administrator elevation during normal use, and does not use runFullTrust to bypass Windows security controls.

## 6. Submission

Antes del envío, Partner Center mostraba todas las secciones `Complete` y el package `Validated`.

Después de seleccionar `Submit for certification`:
- producto: `In certification`;
- `Submission`: completed;
- `Pre-processing`: active;
- `Certification`: pending;
- `Publishing`: pending;
- publishing comenzará automáticamente al pasar certification.

## 7. Evidencia visual

La evidencia visual completa de Partner Center fue congelada como un bundle binario versionado por checksum. Cada imagen tiene:
- nombre semántico;
- descripción;
- SHA-256;
- tamaño;
- media type.

El manifest canónico de checksums y metadatos es `docs/desktop/microsoft-store-publication-evidence-manifest-2026-09-06.json`.

Bundle binario de evidencia:

```text
ptl-ms-store-evidence-2026-09-06.zip
SHA-256: 6eff6633cce3bd42eb528a2e85945d43392c2f44023703ac366bbd32bc9b0f25
```

El bundle conserva 27 screenshots PNG de Partner Center, el reporte WACK XML, el log WACK, el log de preparación del artefacto Store y el manifest machine-readable. El bundle se mantiene en el evidence vault privado; el repositorio conserva los metadatos y hashes verificables para evitar exponer evidencia operacional innecesaria en la superficie pública.

## 8. Relación con evidencia técnica previa

Este checkpoint debe leerse junto con:
- `microsoft-store-msix.md`;
- `microsoft-store-submission-0.1.5.md`;
- `msix-015-preparation-evidence-2026-09-06.md`;
- `msix-store-submission-prep-evidence-2026-09-06.md`;
- `msix-015-wack-evidence-2026-09-06.md`;
- `windows-application-control-diagnostic-2026-09-06.md`;
- `windows-code-signing.md`.

## 9. Gates pendientes

No declarar release `DONE` todavía.

Pendientes:
1. certification PASS;
2. publishing PASS;
3. Store URL activa;
4. instalación desde Microsoft Store;
5. inspección de firma Store;
6. Smart App Control PASS con artefacto Store;
7. launch;
8. listener local en loopback;
9. ausencia de prompt de Firewall nuevo;
10. userData/workspace/DB preservados;
11. upgrade path Store validado;
12. eventual retiro controlado de la instalación Squirrel histórica;
13. cierre de release y actualización del pre-estándar.

## 10. Conclusión

El proceso demostró que PTL ya no está únicamente en fase de packaging experimental: existe un candidate Store real, WACK PASS, package validado por Partner Center y una submission activa en pre-processing.

El estado recomendado es:

`NATIVE_MSIX_VALIDATED_STORE_SUBMITTED_CERTIFICATION_PENDING`
