# UAT evidence — 0.1.6 desktop presentation

Status: INSTALLER_ASSET_FIXED_BUILD_REVALIDATION_PENDING  
Date: 2026-09-07  
Scope: local UAT distribution lane / desktop presentation polish

## Purpose

Record the technical evidence for the Personal Tax Ledger 0.1.6 UAT build created after the desktop presentation polish slice. This evidence covers repository hygiene, version synchronization, validation, packaging, artifact integrity, and placement on the Windows Desktop. Visual installer/splash acceptance remains pending manual observation.

## Source revision and version

- package version: `0.1.6`
- lockfile version synchronized from `0.1.5` to `0.1.6`
- lockfile synchronization commit: `e605501cb32d953991e9917104d591b342500446`
- repository worktree was clean before synchronization and after the prior build

## Repository hygiene

Known local diagnostic TXT files were moved out of the repository into `~/ptl-local-evidence/` before the prior build. No untracked diagnostic evidence was deleted or accidentally committed.

## Prior validation result

Before the installer-asset persistence defect was discovered, the UAT build gate had passed:

- typecheck: PASS
- unit/integration tests: 111/111 PASS
- desktop syntax checks: PASS
- architecture checks: PASS
- frontend production build: PASS
- Electron Windows x64 package creation: PASS
- Squirrel.Windows installer creation: PASS
- distribution manifest generation: PASS

That artifact remains historical evidence only; the installer must be rebuilt after the canonical loading-GIF correction because the installer payload changes when the release asset changes.

## Canonical installer asset defect and root-cause correction

A subsequent early validation correctly blocked the 0.1.6 installer build because `assets/installer/ptl-loading.gif.base64.txt` decoded to bytes beginning with `BGS` instead of the required `GIF89a` signature. The gate was not relaxed.

Root cause: the persisted base64 release asset did not contain valid GIF bytes. This was an asset-persistence defect, not a Squirrel, Make, Wine, Mono, Windows, or Electron packaging defect.

Corrective action applied directly to `master`:

- replaced the invalid base64 payload with a real deterministic animated GIF preserving the previously defined PTL installer visual language;
- retained the cheap pre-build `GIF89a` signature gate;
- strengthened the early contract with dimensions, minimum payload size, trailer, and animation checks;
- documented the canonical asset contract and digest.

Corrected canonical asset contract:

- signature: `GIF89a`;
- dimensions: `400x180`;
- decoded bytes: `8278`;
- frames: `4`;
- trailer: `0x3B`;
- SHA-256: `f936bc0eee0be441289cea4db09508a2a02825be91cb8fca8450854f543ed221`.

The asset was independently decoded and opened as a GIF during repair before persistence. Final WSL/Squirrel packaging evidence remains pending the governed validation run against current `master`.

## Prior artifact

```text
out/distribution/uat/PersonalTaxLedger-0.1.6-UAT-Setup.exe
```

Prior artifact metadata:

- size: `153674752` bytes
- SHA-256: `3c35321e5c413d3406b546abf14101b30360597e77e2468d495df88b4e0a1c44`
- mode: `uat`
- intended use: controlled local UAT; not a Microsoft Store submission artifact

The prior artifact and its `distribution-manifest.json` were copied to:

```text
C:\Users\carlo\Desktop\PTL-UAT-0.1.6
```

Because the canonical installer GIF has changed, this prior executable must not be treated as final evidence for the corrected installer asset.

## Presentation-polish scope

The 0.1.6 payload includes:

- explicit splash minimum visibility windows;
- updated startup copy per launch kind;
- visible application version in the splash;
- ADÜMÜN attribution;
- splash-to-main opacity transition;
- redesigned deterministic Squirrel loading GIF;
- updated installer publisher metadata.

## Required revalidation evidence

The next validation run must record, in order:

1. clean/synchronized `master` and version `0.1.6`;
2. canonical base64 decode and GIF contract PASS before any expensive build;
3. canonical GIF SHA-256;
4. desktop syntax/package prerequisites PASS;
5. Windows x64 Electron package creation PASS;
6. Squirrel.Windows installer creation PASS;
7. exact artifact name `PersonalTaxLedger-0.1.6-Setup.exe`;
8. artifact size and SHA-256;
9. final repository state.

## Pending manual visual gates

The following evidence is still required before declaring the presentation slice closed:

1. installer surface appears acceptably branded and professional;
2. internal splash is clearly visible on a fast machine;
3. splash-to-main transition is visually acceptable;
4. application data/workspace persistence remains intact;
5. no unexpected Windows security or firewall prompt is introduced by 0.1.6.

## Release-lane rule

The 0.1.5 Store submission remains immutable while in Microsoft certification. This 0.1.6 UAT artifact is a separate payload and must not replace or be confused with the already-submitted 0.1.5.0 Store candidate.
