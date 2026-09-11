# Distribution build modes

Status: STORE_PUBLICATION_CONFIRMED / 0.1.6_PRESENTATION_UAT_PENDING  
Scope: Windows desktop distribution  
Canonical entrypoint: repository root `Makefile`

## Goal

Personal Tax Ledger has two deliberately separate Windows distribution lanes:

1. **Store/public lane**: produces the Microsoft Store submission candidate (`.msix`) and feeds the Store publication process.
2. **Local UAT lane**: produces an installable Squirrel.Windows `Setup.exe` for controlled human UAT outside Microsoft Store.

The lanes must not be confused. A UAT `Setup.exe` is not a Microsoft Store submission artifact, and the Store submission artifact is not distributed as `Setup.exe`.

## Commands

### Default: Microsoft Store candidate

```bash
make build
```

Equivalent:

```bash
make build MODE=store
make build-store
```

Expected output:

```text
out/distribution/store/
├── PersonalTaxLedger-<msix-version>-x64-store.msix
├── AppxManifest.xml
├── msix-build.json
├── store-submission-build.txt
└── distribution-manifest.json
```

This lane:

- runs the validation gate;
- builds the Windows Electron payload;
- prepares Store-mode MSIX staging;
- invokes the Windows SDK packaging script through Windows PowerShell from WSL2;
- validates the package round trip;
- writes SHA-256 evidence to `distribution-manifest.json`.

The Store candidate is intentionally not self-signed with the local development certificate. Microsoft signs/re-signs accepted Store submissions during the Store publication process.

## Local UAT installer

```bash
make build MODE=uat
```

Convenience alias:

```bash
make build-uat
```

Expected output:

```text
out/distribution/uat/
├── PersonalTaxLedger-<version>-UAT-Setup.exe
└── distribution-manifest.json
```

This lane:

- runs the same validation preflight;
- builds the Electron Windows payload;
- creates a Squirrel.Windows installer;
- explicitly does not require production signing;
- renames/copies the final installer with an explicit `UAT` marker;
- records file size and SHA-256.

The UAT artifact is intended for controlled testing by known testers, not as the Microsoft Store package.

## UAT 0.1.5 validation

Native Windows validation confirmed:

- installer generation PASS;
- install PASS;
- uninstall PASS;
- reinstall same version PASS;
- no Smart App Control block observed on the validating machine;
- no unexpected firewall prompt observed;
- workspace/data persistence PASS;
- relaunch PASS.

The remaining issue discovered during 0.1.5 UAT was presentation quality rather than functional distribution behavior: the Squirrel `loadingGif` looked like a technical placeholder and the internal Electron splash was visible for too little time during a fast normal startup.

## 0.1.6 desktop presentation polish

0.1.6 introduces a presentation-only refinement while preserving the distribution architecture:

- the Squirrel loading surface is generated deterministically at packaging time with PTL identity, installation copy, animated progress and ADÜMÜN attribution;
- the internal Electron splash now has explicit minimum visibility windows:
  - `NORMAL`: 1400 ms;
  - `FIRST_RUN`: 1800 ms;
  - `UPDATED`: 1800 ms;
- splash copy includes application version and launch context;
- a short opacity transition avoids an abrupt splash-to-main cut.

If real startup takes longer than the minimum, the splash remains visible naturally until the main window reaches `ready-to-show`.

## Version immutability

A payload version that has entered external certification or release review is immutable.

Consequences for the current release line:

- `0.1.5.0` is the Store submission lineage whose publication was confirmed on 2026-09-11 and must not be rebuilt with changed payload;
- `0.1.5` UAT artifacts remain historical evidence;
- payload-changing desktop presentation work starts at `0.1.6` / future Store package `0.1.6.0`.

Any future modification after a Store submission must advance the version before producing a replacement payload.

## Smart App Control / reputation caveat

An unsigned or privately signed UAT installer can be blocked by Smart App Control, Windows Application Control, SmartScreen, or enterprise policy on another Windows machine. This is not equivalent to a Store certification failure.

If a tester machine blocks the UAT `Setup.exe`, capture the exact Windows message and Code Integrity/Smart App Control state as evidence. Do not weaken or disable security controls as an automatic workaround.

For the public Store lane, Microsoft-side certification/publication is now confirmed. The remaining authoritative technical validation is execution of the Microsoft Store-delivered, Store-signed package on the target Windows host.

## Why `make build --uat` is not used

GNU Make interprets unknown `--...` tokens as Make command-line options before it loads the Makefile, so a custom `--uat` switch is not a reliable Make interface.

The supported equivalent is:

```bash
make build MODE=uat
```

or the shorter alias:

```bash
make build-uat
```

This preserves standard Make semantics and is straightforward to automate.

## Local web execution

```bash
make run-web
```

This builds the local web frontend and starts the existing local application composition root without Electron.

## Preflight gate

Both distribution lanes depend on:

```bash
make validate
```

which currently executes:

```text
npm run typecheck
npm test
npm run desktop:check
npm run architecture:check
```

A distribution build must not proceed when this gate fails.

## Distribution manifest

Every successful lane writes `distribution-manifest.json` with:

- schema version;
- product;
- application version;
- distribution mode (`store` or `uat`);
- generation timestamp;
- intended use;
- artifact file names;
- file sizes;
- SHA-256 hashes.

The manifest is evidence and can later be consumed by release automation / Execution Fabric.

## DoR

Before running either distribution build:

- repository is on the intended source revision;
- Node.js version satisfies `package.json#engines`;
- dependencies are installed;
- package metadata/lockfile are synchronized for the intended version;
- WSL has the current desktop build prerequisites;
- Store lane: Windows SDK / MakeAppx is installed on the Windows host;
- UAT lane: Mono and Wine are available when Squirrel is built from WSL/Linux.

## DoD — Store build artifact

- validation PASS;
- Store MSIX created;
- Store identity and publisher match Partner Center;
- package round-trip PASS;
- `distribution-manifest.json` created;
- MSIX SHA-256 recorded;
- artifact location is `out/distribution/store`.

This build DoD does **not** by itself mean a release is public. Certification and publishing are lifecycle gates outside the local build. For the current `0.1.5.0` submission lineage, those Microsoft-side gates are confirmed PASS as of 2026-09-11. Native Store-delivered runtime validation remains separate.

## DoD — UAT lane

- validation PASS;
- Squirrel installer created;
- UAT artifact uses explicit `-UAT-Setup.exe` naming;
- `distribution-manifest.json` created;
- EXE SHA-256 recorded;
- artifact location is `out/distribution/uat`;
- tester is informed that the artifact is not Store-signed;
- presentation is visually accepted on native Windows;
- reinstall/persistence regression gate remains PASS.

## Current validation status

- 0.1.5 local UAT distribution path: VALIDATED.
- 0.1.5.0 Microsoft Store submission lineage: PUBLISHED / PARTNER CENTER AVAILABILITY CONFIRMED.
- Microsoft-side Store certification/publication gate: PASS.
- Store-delivered native runtime validation: PENDING.
- 0.1.6 presentation source implementation: IMPLEMENTED.
- 0.1.6 native installer/splash visual validation: PENDING.

Canonical publication checkpoint: [`microsoft-store-publication-confirmed-2026-09-11.md`](microsoft-store-publication-confirmed-2026-09-11.md).
