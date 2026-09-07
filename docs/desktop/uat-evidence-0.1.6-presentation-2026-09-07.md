# UAT evidence — 0.1.6 desktop presentation

Status: TECHNICAL_INSTALLER_GATES_PASS_NATIVE_VISUAL_UAT_PENDING  
Date: 2026-09-07  
Scope: local UAT distribution lane / desktop presentation polish

## Purpose

Record the technical evidence for the Personal Tax Ledger 0.1.6 desktop presentation and Squirrel installer polish slice. This evidence covers repository synchronization, canonical installer asset integrity, source/toolchain gates, Windows x64 Electron packaging, Squirrel.Windows installer creation, artifact integrity, and the remaining native visual validation boundary.

## Source revision and version

The governed revalidation synchronized local `master` with GitHub before any build activity.

- package version: `0.1.6`
- validated source revision before the run: `05d597e003689e01a8a4386ba31da2f7cf3d6733`
- local `HEAD` and `origin/master`: identical before validation
- branch: `master`

## Canonical installer asset defect and root-cause correction

An earlier validation correctly blocked the 0.1.6 installer build because `assets/installer/ptl-loading.gif.base64.txt` decoded to bytes beginning with `BGS` instead of the required `GIF89a` signature. The gate was not relaxed.

Root cause: the persisted base64 release asset did not contain valid GIF bytes. This was an asset-persistence defect, not a Squirrel, Make, Wine, Mono, Windows, or Electron packaging defect.

Corrective action applied directly to `master`:

- replaced the invalid base64 payload with a real deterministic animated GIF preserving the previously defined PTL installer visual language;
- retained the cheap pre-build `GIF89a` signature gate;
- strengthened the early contract with dimensions, minimum payload size, trailer, and animation checks;
- documented the canonical asset contract and digest.

Canonical asset contract validated during the final run:

- signature: `GIF89a`;
- dimensions: `400x180`;
- decoded bytes: `8278`;
- frames / Graphic Control Extensions: `4`;
- trailer: `0x3B`;
- SHA-256: `f936bc0eee0be441289cea4db09508a2a02825be91cb8fca8450854f543ed221`;
- `file(1)` recognition: `GIF image data, version 89a, 400 x 180`.

The canonical GIF contract passed before entering the expensive build.

## Pre-build toolchain and source gates

Validated environment:

- Node.js: `v24.20.0`;
- npm: `11.19.0`;
- Mono: `6.8.0.105`;
- Wine: `9.0`.

Validated gates:

- desktop syntax checks: PASS;
- unit/integration tests: `111/111 PASS`;
- architecture check: PASS;
- internal package dependency boundaries: PASS;
- no cycles in the validated internal package graph: PASS.

The build was entered only after these checks and the canonical GIF contract passed.

## Windows x64 package and Squirrel installer build

The corrected 0.1.6 installer was rebuilt successfully.

Electron package:

```text
out/Personal Tax Ledger-win32-x64/PersonalTaxLedger.exe
```

Package evidence:

- size: `246202368` bytes;
- SHA-256: `6eecfd2e86f6538af98f3123b47d9d7c3c2ca85d13c628e9b7603ba27af01eaf`.

Materialized installer GIF:

```text
out/.installer-assets/ptl-loading.gif
```

Materialized GIF evidence:

- size: `8278` bytes;
- SHA-256: `f936bc0eee0be441289cea4db09508a2a02825be91cb8fca8450854f543ed221`;
- digest identical to the canonical persisted release asset.

Squirrel.Windows generated:

```text
out/installer-win32-x64/PersonalTaxLedger-0.1.6-Setup.exe
out/installer-win32-x64/PersonalTaxLedger-0.1.6-full.nupkg
out/installer-win32-x64/RELEASES
```

Installer artifact evidence:

- exact filename: `PersonalTaxLedger-0.1.6-Setup.exe`;
- size: `153660416` bytes;
- SHA-256: `f41f227d1b3e1c811fcc338515f81e8e41d8941370adc47fb609b5069f04c401`.

Squirrel metadata:

- `PersonalTaxLedger-0.1.6-full.nupkg`: `152929908` bytes;
- `RELEASES`: `88` bytes.

## Technical gate result

The final governed validation result is:

```text
canonical GIF valid              PASS
early GIF contract gate          PASS
installer build                  PASS
versioned Setup.exe              PASS
artifact/hash evidence           PASS
native visual installer UAT      PENDING
```

Technical installer revalidation result: `PASS`.

## Presentation-polish scope represented by this build

The 0.1.6 payload includes:

- explicit splash minimum visibility windows;
- updated startup copy per launch kind;
- visible application version in the splash;
- ADÜMÜN attribution;
- splash-to-main opacity transition;
- corrected deterministic Squirrel loading GIF;
- updated installer publisher metadata.

## Remaining native visual UAT gates

The presentation slice is technically built and validated but is not closed until native Windows observation confirms:

1. the Squirrel installer surface appears acceptably branded and professional;
2. the corrected loading GIF renders normally and does not appear corrupt, blank, truncated, or visually malformed;
3. the internal application splash is clearly visible on a fast machine;
4. the splash-to-main transition is visually acceptable;
5. the historical workspace at `C:\Users\carlo\AppData\Roaming\Personal Tax Ledger` remains reused and application data remains intact;
6. no unexpected Windows firewall prompt is introduced;
7. any Smart App Control / reputation block observed on the self-signed or unsigned Squirrel lane is recorded as a distribution-signing boundary rather than incorrectly treated as Store-signed validation.

The historical Squirrel installation must not be removed solely for this UAT. The Store-signed Smart App Control gate remains separate and must not be declared PASS until the Microsoft-certified package is actually tested.

## Release-lane rule

The existing Microsoft Store submission lane remains immutable while under certification. This 0.1.6 Squirrel/UAT payload is a separate distribution artifact and must not be confused with a Microsoft Store-signed package.
