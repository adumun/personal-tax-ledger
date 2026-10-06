# Canonical Make command interface

## Purpose

Personal Tax Ledger exposes a root-level `Makefile` as the stable operator/developer interface for recurring repository operations.

This follows ADÜMÜN `STD-ENG-DEV-001 — Local Development & Environment Baseline`: contributors and release operators SHOULD invoke repository capabilities through Make rather than memorizing ecosystem-native commands such as `npm run ...`, `node ...`, `bash ...`, `powershell.exe ...` or `MakeAppx.exe ...`.

The policy is intentionally layered:

```text
human / CI / orchestration
        |
        v
      Makefile
        |
        v
versioned repository scripts
        |
        +--> npm / Node.js
        +--> Bash
        +--> PowerShell
        +--> Windows SDK / MakeAppx
        +--> Electron tooling
```

Make is the facade and stable contract. It is not the preferred place for complex implementation logic. Complex logic remains in versioned scripts under `scripts/` or in ecosystem-native build tooling.

## Why this repository uses Make

PTL spans more than one execution ecosystem:

- Node.js/npm for application code and tests;
- Electron for desktop packaging;
- Bash for WSL-oriented orchestration;
- PowerShell only where Windows-native behavior is genuinely required;
- Windows SDK `MakeAppx.exe` for final MSIX creation;
- Squirrel/electron-winstaller for local UAT installers.

Without a facade, operators would have to remember different command sequences and platform-specific arguments. The Make interface hides those details while preserving access to the underlying implementation for diagnostics.

The practical rules are:

1. Documentation intended for routine use MUST show `make ...` commands first.
2. CI or future orchestration SHOULD invoke Make targets rather than duplicate native command sequences.
3. Native commands MAY be documented as implementation references and troubleshooting tools.
4. A Make target SHOULD delegate to repository-owned scripts/native tools instead of copying complex logic into the recipe.
5. The same target name SHOULD keep the same meaning as other ADÜMÜN repositories where the standard defines one.

## Supported environment

The primary development/build environment for PTL is WSL.

Repository source, dependencies, generated files and Git operations live inside WSL. Windows is used as a target/runtime environment and as a bridge for Windows-native SDK tooling when required.

For ordinary Node/local operations, Windows tooling is not required. For Microsoft Store MSIX packaging, the Store lane invokes the Windows SDK from WSL through `powershell.exe` and `wslpath`.

## Discoverability

The first command to use when entering the repository is:

```bash
make help
```

It prints the supported canonical targets and separates baseline development operations from distribution-specific operations.

## Canonical command catalog

### `make bootstrap`

Purpose: prepare locked repository dependencies.

Canonical invocation:

```bash
make bootstrap
```

Current facade implementation:

```text
make bootstrap
  -> npm ci
```

Use it when:

- cloning the repository for the first time;
- switching to a branch that changed `package-lock.json`;
- recovering from a corrupted/inconsistent `node_modules`;
- reproducing a clean build environment.

Expected behavior:

- installs exactly the dependency graph represented by the lockfile;
- fails if `package.json` and `package-lock.json` are inconsistent;
- does not silently rewrite the dependency graph as `npm install` may.

### `make deps`

Purpose: validate the minimum local toolchain before more expensive operations.

```bash
make deps
```

Current facade implementation checks:

```text
node exists
npm exists
Node major version == 24
```

Use it when:

- a new workstation/WSL distribution is being prepared;
- a build fails before tests start;
- Node was recently upgraded/downgraded;
- `nvm`, PATH or shell initialization changed.

A dependency/toolchain failure is intentionally distinguished from an application/test failure.

### `make up`

Purpose: run the primary local application path.

```bash
make up
```

Current facade implementation:

```text
make up
  -> make run-web
     -> npm run build
     -> npm start
```

This starts the local HTTP application using the repository composition root. It is a foreground process.

Use it for:

- ordinary local functional use;
- manual smoke testing of the web/local composition;
- validating behavior without Electron.

### `make down`

Purpose: expose shutdown semantics consistently even though PTL does not currently manage a persistent background service through Make.

```bash
make down
```

PTL currently runs the local server in the foreground; stopping it with `Ctrl-C` is the correct lifecycle action. The target exists to preserve the common ADÜMÜN command surface and explicitly documents that there is no hidden daemon/container state to stop.

### `make test`

Purpose: execute the canonical automated regression suite.

```bash
make test
```

Facade implementation:

```text
make test
  -> npm test
     -> node --test test/*.test.mjs
```

Use it after implementation changes and before creating/reviewing a release artifact.

A PASS means the repository's current baseline test suite passed. It does not by itself certify Windows installation, Microsoft Store acceptance or external UAT.

### `make doctor`

Purpose: fast, non-destructive health assessment of the checkout/toolchain.

```bash
make doctor
```

Current checks include:

- `make deps` toolchain validation;
- `package.json` presence;
- `package-lock.json` presence;
- Store artifact build script presence;
- Windows SDK bridge script presence.

Use it when:

- opening an older checkout/worktree;
- a command fails unexpectedly;
- another developer needs to confirm whether the checkout is structurally usable;
- preparing for a release activity and wanting a cheap preflight before full validation.

`make doctor` SHOULD remain side-effect safe. It must not create a release artifact, mutate production resources or reset user data.

### `make validate`

Purpose: deeper repository/application validation.

```bash
make validate
```

Current facade implementation:

```text
npm run typecheck
make test
npm run desktop:check
npm run architecture:check
```

Use it:

- before PR review/merge;
- after architecture-sensitive changes;
- when changing desktop packaging scripts;
- before a distribution lane when the lane does not already execute equivalent or stronger gates.

### `make lint`

Purpose: run lint/static repository checks.

```bash
make lint
```

Facade implementation:

```text
make lint
  -> npm run lint
```

### `make clean`

Purpose: remove generated distribution/MSIX output owned by the repository.

```bash
make clean
```

Current behavior removes:

```text
out/distribution
out/msix
```

Use it when:

- stale artifacts might be confused with a new release;
- validating reproducibility from a clean generated-output state;
- a failed packaging attempt left partial artifacts.

This target must not remove source files, user runtime data or external Windows installation state.

## Distribution command model

PTL currently has two Windows distribution intents:

```text
Microsoft Store
local/external UAT
```

The common facade is:

```bash
make build
```

`MODE=store` is the default, therefore:

```bash
make build
```

is equivalent to:

```bash
make build MODE=store
```

For local UAT:

```bash
make build MODE=uat
```

### Microsoft Store artifact

Preferred canonical command:

```bash
make build
```

Explicit domain commands:

```bash
make build-store
make store-artifact
```

These three represent the same Store release intent. `make build` is preferred when automation only needs the generic build contract; `make build-store` or `make store-artifact` are useful when human/operator context benefits from explicit channel naming.

Current facade chain:

```text
make build
  -> make build-store
     -> bash scripts/build-store-msix.sh
        -> npm ci
        -> npm test
        -> npm run desktop:check
        -> npm run desktop:msix:prepare:store
           -> PTL_MSIX_MODE=store npm run desktop:msix:prepare
           -> npm run desktop:package:win
           -> npm run build
           -> node scripts/package-desktop.mjs --platform=win32 --arch=x64
           -> node scripts/prepare-msix.mjs
        -> PowerShell bridge
           -> scripts/package-msix.ps1
           -> Windows SDK MakeAppx.exe
        -> unzip-based final container validation
        -> manifest identity/version validation
        -> final tile asset validation
        -> SHA-256 calculation
        -> out/msix/store-artifact.json evidence
```

Expected Store outputs for application version `0.1.6` are:

```text
out/msix/PersonalTaxLedger-0.1.6.0-x64.msix
out/msix/msix-build.json
out/msix/store-artifact.json
```

For future versions, the MSIX version and package name are resolved from repository metadata; operators should not hard-code the current version in their routine commands.

Success ends with:

```text
==> STORE ARTIFACT READY
Package:  .../PersonalTaxLedger-<version>.msix
Version:  <version>.0
SHA-256:  <hash>
Evidence: .../store-artifact.json
```

The `.msix` is the file uploaded to Microsoft Partner Center.

### Local UAT artifact

Canonical commands:

```bash
make build MODE=uat
```

or:

```bash
make build-uat
```

Current facade chain:

```text
make build-uat
  -> make validate
  -> PTL_REQUIRE_WINDOWS_SIGNING=0 PTL_WINDOWS_SIGNING_MODE=off npm run desktop:installer:win
  -> Electron win32-x64 packaging
  -> electron-winstaller / Squirrel.Windows
  -> copy final Setup.exe to out/distribution/uat
  -> write distribution manifest
```

This artifact is intentionally different from the Microsoft Store MSIX. Do not upload the UAT Squirrel installer to Partner Center.

## Native commands: when they are appropriate

Native commands are not forbidden. They are implementation-level tools.

Use native commands when:

- debugging one stage of a failed Make target;
- developing/changing the underlying script itself;
- isolating whether a failure belongs to npm, Electron, PowerShell or MakeAppx;
- collecting lower-level diagnostics for a bug report.

Examples:

```bash
npm test
npm run desktop:check
npm run desktop:msix:prepare:store
bash scripts/build-store-msix.sh
```

These are diagnostic/development references. Routine documentation and operator runbooks should point back to the Make facade.

## Microsoft Store workflow examples

### Normal new Store version

```bash
git switch <release-or-hotfix-branch>
git pull --ff-only
make doctor
make build
```

Then upload the generated `.msix` reported by `STORE ARTIFACT READY`.

### Rebuild after changing only Store branding/package metadata

```bash
make clean
make build
```

The Store script already uses `npm ci` and performs its own regression/packaging checks, so no separate `npm ci` sequence is required for routine use.

### Verify without producing a Store artifact

```bash
make doctor
make validate
```

### Inspect available commands

```bash
make help
```

## Troubleshooting

### `make: command not found`

Cause: GNU Make is not installed in the WSL distribution.

Check:

```bash
command -v make
```

For Ubuntu/WSL, install the normal build tooling package using the OS package manager, then rerun:

```bash
make help
```

Do not replace the documented facade with permanent direct npm commands merely because Make is missing; Make is a repository prerequisite under the ADÜMÜN execution-interface standard.

### `Expected Node 24.x`

`make deps` intentionally rejects a different Node major version.

Check:

```bash
node --version
npm --version
```

If using nvm, activate an appropriate Node 24.x installation before retrying. PTL's `package.json` declares the supported Node range; the Make check protects against accidentally building with another major version.

### `npm ci` fails because package files are inconsistent

Do not switch to `npm install` as a release workaround without understanding the difference.

A lockfile inconsistency usually means:

- `package.json` changed without committing the matching `package-lock.json`;
- a merge resolved one file but not the other;
- the working tree has uncommitted dependency changes.

Inspect:

```bash
git status
npm ci
```

Repair and commit the dependency metadata coherently before generating a release artifact.

### npm prints deprecated transitive dependency warnings

The current Squirrel/electron-winstaller dependency graph may emit warnings for old transitive packages such as `inflight`, `rimraf` or `glob`.

Distinguish warnings from security findings and build failures.

Relevant checks:

```bash
npm audit
make test
```

The Store release should not be blocked only because an upstream transitive dependency prints a deprecation warning if:

- install succeeds;
- `npm audit` reports no actionable vulnerability for the current graph;
- regression/build gates pass;
- replacing the dependency would require unrelated release-scope changes.

Such warnings should remain tracked as upstream/tooling technical debt rather than suppressed blindly.

### `powershell.exe: command not found`

The Store lane is being executed somewhere other than the supported WSL/Windows integration path, or Windows interop is disabled.

Check:

```bash
command -v powershell.exe
powershell.exe -NoProfile -Command '$PSVersionTable.PSVersion'
```

PTL does not require a second Windows checkout. The expected model is a WSL checkout invoking the Windows host tool through interop.

### `wslpath: command not found`

The Store lane expects WSL semantics. Confirm the command is running inside the WSL distribution containing the repository.

```bash
uname -a
command -v wslpath
```

Do not move or clone the repository to Windows merely to satisfy the packaging lane.

### `MakeAppx.exe no fue encontrado`

The Windows side of the WSL bridge cannot locate the Windows SDK Packaging Tools.

The repository script searches normal Windows SDK locations and PATH. Diagnose from WSL with:

```bash
powershell.exe -NoProfile -Command "Get-Command MakeAppx.exe -ErrorAction SilentlyContinue"
```

If it is absent, install/repair the Windows SDK Packaging Tools on the Windows host. The repository itself remains in WSL.

### MSIX staging succeeds but final packaging fails

Separate the stages conceptually:

```text
Electron package
-> MSIX staging
-> MakeAppx package creation
-> final container validation
```

Run the full facade once first:

```bash
make build
```

Then use lower-level implementation commands only to isolate the failing stage. Preserve the full error output; do not reuse a partially generated artifact for Partner Center.

### `ERROR: ... is not referenced by the final manifest`

The Store script validates the final packaged `AppxManifest.xml`, not only the staging directory.

Possible causes:

- manifest generation changed;
- an asset filename changed without changing the manifest;
- path escaping/normalization in a validation script is incorrect;
- the final package was built from stale staging.

Recommended sequence:

```bash
make clean
make build
```

If it persists, inspect:

```bash
cat out/msix/staging/AppxManifest.xml
unzip -p out/msix/*.msix AppxManifest.xml
```

The staging and final manifest references must agree.

### Tile/branding validation fails

The Microsoft Store lane requires the complete product-specific asset set and explicitly rejects placeholder-like/incomplete certification metadata.

Check:

```bash
find out/msix/staging/Assets -maxdepth 1 -type f -printf '%f\n'
cat out/msix/msix-build.json
```

Expected files include:

```text
StoreLogo.png
Square44x44Logo.png
Square150x150Logo.png
Wide310x150Logo.png
```

Do not bypass this validation to create a Store artifact. It directly protects against the Store certification failure `10.1.1.11 On Device Tiles` previously observed by PTL.

### Artifact exists but `STORE ARTIFACT READY` was not printed

Treat the run as failed.

A `.msix` file may have been physically created before one of the post-package validation gates failed. The canonical success condition is the final `STORE ARTIFACT READY` message plus evidence generation.

Do not upload a package from a failed run simply because the file exists.

### Wrong or stale package is visible in `out/msix`

Run:

```bash
make clean
make build
```

Then use the exact package path printed by the successful Store target and verify the SHA-256 from `store-artifact.json`.

### UAT installer is confused with Store package

Check the extensions and output lanes:

```text
Store: .msix under out/msix/
UAT:   .exe under out/distribution/uat/
```

Only the Store `.msix` belongs in Microsoft Partner Center.

## Adding future Make targets

When a recurring repository capability appears, use this decision process:

1. If `STD-ENG-DEV-001` already defines a canonical name (`test`, `build`, `doctor`, etc.), use that semantic name.
2. If the capability is domain/channel specific, add a descriptive alias such as `build-store` while preserving the generic target where applicable.
3. Put complex logic in a versioned script under `scripts/` or ecosystem-native tool configuration.
4. Keep the Make recipe thin.
5. Add the target to `make help`.
6. Document both the Make facade and the underlying implementation reference in this document.
7. Update README/runbooks to show Make as the normal invocation path.
8. Ensure future CI/orchestration calls Make rather than duplicating the underlying sequence.

## Authority and references

The root `Makefile` is the executable facade for this repository.

This document is the human-readable operational reference for that facade. If behavior changes, update both in the same change.

The governing ADÜMÜN rule is `STD-ENG-DEV-001 — Local Development & Environment Baseline` in `adumun/platform-standards`. It defines the common Make-wrapper model and canonical baseline target semantics.
