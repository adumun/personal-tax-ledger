# Distribution build modes

Status: IMPLEMENTED_PENDING_NATIVE_VALIDATION  
Scope: Windows desktop distribution  
Canonical entrypoint: repository root `Makefile`

## Goal

Personal Tax Ledger has two deliberately separate Windows distribution lanes:

1. **Store/public lane**: produces the Microsoft Store submission candidate (`.msix`).
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

The UAT artifact is intended for controlled testing by known testers, not public release.

## Smart App Control / reputation caveat

An unsigned or privately signed UAT installer can be blocked by Smart App Control, Windows Application Control, SmartScreen, or enterprise policy on another Windows machine. This is not equivalent to a Store certification failure.

If a tester machine blocks the UAT `Setup.exe`, capture the exact Windows message and Code Integrity/Smart App Control state as evidence. Do not weaken or disable security controls as an automatic workaround.

For the final public distribution gate, the authoritative validation must be performed with the Microsoft Store-delivered, Store-signed package.

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

## Preflight gate

Both lanes depend on:

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
- WSL has the current desktop build prerequisites;
- Store lane: Windows SDK / MakeAppx is installed on the Windows host;
- UAT lane: Mono and Wine are available when Squirrel is built from WSL/Linux.

## DoD — Store lane

- validation PASS;
- Store MSIX created;
- Store identity and publisher match Partner Center;
- package round-trip PASS;
- `distribution-manifest.json` created;
- MSIX SHA-256 recorded;
- artifact location is `out/distribution/store`.

This does **not** mean the release is public. Certification, publishing and Store-signed runtime validation remain separate gates.

## DoD — UAT lane

- validation PASS;
- Squirrel installer created;
- UAT artifact uses explicit `-UAT-Setup.exe` naming;
- `distribution-manifest.json` created;
- EXE SHA-256 recorded;
- artifact location is `out/distribution/uat`;
- tester is informed that the artifact is not Store-signed.

## Current validation status

The build interface and scripts are implemented on `master`, but the new top-level commands themselves still require native execution evidence before this document can move from `IMPLEMENTED_PENDING_NATIVE_VALIDATION` to `VALIDATED`.
