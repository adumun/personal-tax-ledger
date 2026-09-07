# UAT evidence — 0.1.6 desktop presentation

Status: BUILD_VALIDATED_VISUAL_GATES_PENDING  
Date: 2026-09-07  
Scope: local UAT distribution lane / desktop presentation polish

## Purpose

Record the technical evidence for the Personal Tax Ledger 0.1.6 UAT build created after the desktop presentation polish slice. This evidence covers repository hygiene, version synchronization, validation, packaging, artifact integrity, and placement on the Windows Desktop. Visual installer/splash acceptance remains pending manual observation.

## Source revision and version

- package version: `0.1.6`
- lockfile version synchronized from `0.1.5` to `0.1.6`
- lockfile synchronization commit: `e605501cb32d953991e9917104d591b342500446`
- repository worktree was clean before synchronization and after the build

## Repository hygiene

Known local diagnostic TXT files were moved out of the repository into `~/ptl-local-evidence/` before the build. No untracked diagnostic evidence was deleted or accidentally committed.

## Validation result

The UAT build gate passed:

- typecheck: PASS
- unit/integration tests: 111/111 PASS
- desktop syntax checks: PASS
- architecture checks: PASS
- frontend production build: PASS
- Electron Windows x64 package creation: PASS
- Squirrel.Windows installer creation: PASS
- distribution manifest generation: PASS

## Artifact

```text
out/distribution/uat/PersonalTaxLedger-0.1.6-UAT-Setup.exe
```

Artifact metadata:

- size: `153674752` bytes
- SHA-256: `3c35321e5c413d3406b546abf14101b30360597e77e2468d495df88b4e0a1c44`
- mode: `uat`
- intended use: controlled local UAT; not a Microsoft Store submission artifact

The artifact and its `distribution-manifest.json` were copied to:

```text
C:\Users\carlo\Desktop\PTL-UAT-0.1.6
```

## Presentation-polish scope represented by this build

This 0.1.6 payload includes:

- explicit splash minimum visibility windows;
- updated startup copy per launch kind;
- visible application version in the splash;
- ADÜMÜN attribution;
- splash-to-main opacity transition;
- redesigned deterministic Squirrel loading GIF;
- updated installer publisher metadata.

## Pending manual visual gates

The following evidence is still required before declaring the presentation slice closed:

1. installer surface appears acceptably branded and professional;
2. internal splash is clearly visible on a fast machine;
3. splash-to-main transition is visually acceptable;
4. application data/workspace persistence remains intact;
5. no unexpected Windows security or firewall prompt is introduced by 0.1.6.

## Release-lane rule

The 0.1.5 Store submission remains immutable while in Microsoft certification. This 0.1.6 UAT artifact is a separate payload and must not replace or be confused with the already-submitted 0.1.5.0 Store candidate.
