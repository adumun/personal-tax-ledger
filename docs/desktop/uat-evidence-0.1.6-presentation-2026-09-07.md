# UAT evidence — 0.1.6 desktop presentation

Status: PRESENTATION_SLICE_CLOSED_STORE_SIGNED_SAC_GATE_SEPARATE  
Date: 2026-09-07  
Scope: local UAT distribution lane / desktop presentation polish

## Purpose

Record the final technical and native Windows evidence for the Personal Tax Ledger 0.1.6 desktop presentation and Squirrel installer polish slice. This evidence covers repository synchronization, canonical installer asset integrity, source/toolchain gates, Windows x64 Electron packaging, Squirrel.Windows installer creation, artifact integrity, native visual acceptance, workspace persistence, and the separate Microsoft Store signing boundary.

## Source revision and version

The governed revalidation synchronized local `master` with GitHub before any build activity.

- package version: `0.1.6`
- validated source revision before the governed build: `05d597e003689e01a8a4386ba31da2f7cf3d6733`
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

The governed technical validation result is:

```text
canonical GIF valid              PASS
early GIF contract gate          PASS
installer build                  PASS
versioned Setup.exe              PASS
artifact/hash evidence           PASS
native visual installer UAT      PASS
```

Technical installer revalidation result: `PASS`.

## Native Windows visual UAT

Native Windows validation was executed against the exact governed installer artifact, after verifying its SHA-256 before launch.

Artifact identity on Windows:

- staged path: `C:\Users\carlo\Downloads\PTL-UAT-0.1.6\PersonalTaxLedger-0.1.6-Setup.exe`;
- size: `153660416` bytes;
- SHA-256: `f41f227d1b3e1c811fcc338515f81e8e41d8941370adc47fb609b5069f04c401`;
- artifact identity gate: PASS.

Operator-observed visual and behavioral results:

- installer/loading surface appeared: PASS;
- branded animated PTL GIF rendered correctly: PASS;
- installer presentation judged acceptably professional: PASS;
- unexpected Windows firewall prompt: NONE;
- Windows security/reputation result during this Squirrel UAT: NONE;
- application opened successfully after installation: PASS;
- internal PTL splash clearly visible: PASS;
- splash-to-main transition visually acceptable: PASS;
- historical data/workspace remained intact: PASS.

Native visual installer UAT result: `PASS`.

## Historical workspace persistence evidence

The UAT explicitly inspected the historical workspace:

```text
C:\Users\carlo\AppData\Roaming\Personal Tax Ledger
```

SQLite path:

```text
C:\Users\carlo\AppData\Roaming\Personal Tax Ledger\data\personal-tax-ledger.sqlite
```

Before UAT:

- workspace existed: yes;
- database existed: yes;
- database size: `172032` bytes.

After UAT:

- workspace existed: yes;
- database existed: yes;
- database size: `172032` bytes;
- operator confirmed historical application data remained intact.

The database last-write timestamp changed during the UAT session, which is consistent with the application opening and using the same persisted workspace. No duplicate workspace was observed.

The historical Squirrel installation should still not be removed solely because this presentation UAT passed; removal belongs to the broader distribution-transition decision.

## Presentation-polish scope closed by this evidence

The 0.1.6 presentation slice now has validated evidence for:

- explicit splash minimum visibility windows;
- updated startup copy per launch kind;
- visible application version in the splash;
- ADÜMÜN attribution;
- splash-to-main opacity transition;
- corrected deterministic Squirrel loading GIF;
- updated installer publisher metadata;
- successful native Windows installer presentation;
- successful reuse of the historical workspace.

## Separate Microsoft Store / Smart App Control boundary

This UAT validates the Squirrel/UAT installer lane only.

It does **not** establish that a Microsoft Store-signed package passes Smart App Control. The Store-signed SAC gate remains separate and must remain `PENDING` until the Microsoft-certified package is actually obtained and tested on Windows.

No conclusion about Store certification or Store-signed reputation is inferred from the absence of a reputation warning during this Squirrel UAT.

## Release-lane rule

The Microsoft Store submission lane remains distinct from this Squirrel/UAT payload. Store submission artifacts and Squirrel/UAT artifacts must not be conflated, and the Store-signed security/reputation gate must be recorded independently when available.
