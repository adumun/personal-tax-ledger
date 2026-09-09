#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

log() {
  printf '\n==> %s\n' "$*"
}

fail() {
  printf '\nERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

require_command node
require_command npm
require_command wslpath
require_command powershell.exe
require_command unzip
require_command sha256sum

if ! grep -qi microsoft /proc/sys/kernel/osrelease 2>/dev/null && ! grep -qi microsoft /proc/version 2>/dev/null; then
  fail "This Store packaging lane is designed to run from WSL."
fi

log "Personal Tax Ledger — Microsoft Store artifact build"
printf 'Repository: %s\n' "$REPO_ROOT"
printf 'Node:       %s\n' "$(node --version)"
printf 'npm:        %s\n' "$(npm --version)"

log "Installing locked dependencies"
npm ci

log "Running regression suite"
npm test

log "Checking desktop packaging sources"
npm run desktop:check

log "Preparing clean Microsoft Store MSIX staging"
npm run desktop:msix:prepare:store

METADATA="$REPO_ROOT/out/msix/msix-build.json"
[[ -f "$METADATA" ]] || fail "MSIX metadata was not generated: $METADATA"

readarray -t BUILD_INFO < <(node --input-type=module - "$METADATA" <<'NODE'
import { readFileSync } from 'node:fs';
const metadataPath = process.argv[2];
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));

if (metadata.mode !== 'store') {
  throw new Error(`Expected Store mode, got: ${metadata.mode}`);
}
if (!metadata.version) {
  throw new Error('Missing MSIX version in metadata.');
}
if (!metadata.expectedPackageName) {
  throw new Error('Missing expectedPackageName in metadata.');
}
if (metadata.certification?.placeholderAssetsAllowed !== false) {
  throw new Error('Store artifact must explicitly reject placeholder assets.');
}
if (!Array.isArray(metadata.certification?.assets) || metadata.certification.assets.length !== 4) {
  throw new Error('Expected exactly four certified branding assets.');
}
if (metadata.certification.assets.some(asset => !asset.brandAssetVersion || !asset.sha256)) {
  throw new Error('Every certification asset must have branding identity and SHA-256.');
}

console.log(metadata.version);
console.log(metadata.expectedPackageName);
console.log(metadata.stagingDirectory);
NODE
)

VERSION="${BUILD_INFO[0]}"
PACKAGE_NAME="${BUILD_INFO[1]}"
STAGING="${BUILD_INFO[2]}"
OUTPUT="$REPO_ROOT/out/msix/$PACKAGE_NAME"
PACKAGE_SCRIPT="$REPO_ROOT/scripts/package-msix.ps1"

[[ -d "$STAGING" ]] || fail "MSIX staging directory does not exist: $STAGING"
[[ -f "$STAGING/AppxManifest.xml" ]] || fail "AppxManifest.xml missing from staging."
[[ -f "$PACKAGE_SCRIPT" ]] || fail "Windows packaging bridge not found: $PACKAGE_SCRIPT"

log "Packaging Store MSIX $VERSION with Windows SDK MakeAppx via WSL bridge"
STAGING_WIN="$(wslpath -w "$STAGING")"
OUTPUT_WIN="$(wslpath -w "$OUTPUT")"
PACKAGE_SCRIPT_WIN="$(wslpath -w "$PACKAGE_SCRIPT")"

powershell.exe -NoProfile -ExecutionPolicy Bypass \
  -File "$PACKAGE_SCRIPT_WIN" \
  -StagingDirectory "$STAGING_WIN" \
  -OutputPackage "$OUTPUT_WIN"

[[ -f "$OUTPUT" ]] || fail "Expected MSIX was not created: $OUTPUT"

log "Validating final MSIX container"
unzip -tqq "$OUTPUT"

MANIFEST="$(unzip -p "$OUTPUT" AppxManifest.xml)"
[[ -n "$MANIFEST" ]] || fail "AppxManifest.xml could not be read from final MSIX."

for asset in StoreLogo.png Square44x44Logo.png Square150x150Logo.png Wide310x150Logo.png; do
  unzip -Z1 "$OUTPUT" | grep -Fxq "Assets/$asset" || fail "Final MSIX is missing Assets/$asset"
done

printf '%s\n' "$MANIFEST" | grep -Fq 'Name="Admn.PersonalTaxLedger"' || fail "Final manifest does not contain the canonical Store identity."
printf '%s\n' "$MANIFEST" | grep -Fq "Version=\"$VERSION\"" || fail "Final manifest version does not match $VERSION."
printf '%s\n' "$MANIFEST" | grep -Fq 'Assets\Square44x44Logo.png' || fail "Square44x44Logo is not referenced by the final manifest."
printf '%s\n' "$MANIFEST" | grep -Fq 'Assets\Square150x150Logo.png' || fail "Square150x150Logo is not referenced by the final manifest."
printf '%s\n' "$MANIFEST" | grep -Fq 'Assets\Wide310x150Logo.png' || fail "Wide310x150Logo is not referenced by the final manifest."
printf '%s\n' "$MANIFEST" | grep -Fq 'Assets\StoreLogo.png' || fail "StoreLogo is not referenced by the final manifest."

PACKAGE_SHA256="$(sha256sum "$OUTPUT" | awk '{print $1}')"
PACKAGE_SIZE="$(stat -c '%s' "$OUTPUT")"
EVIDENCE="$REPO_ROOT/out/msix/store-artifact.json"

node --input-type=module - "$METADATA" "$OUTPUT" "$PACKAGE_SHA256" "$PACKAGE_SIZE" "$EVIDENCE" <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs';
const [, , metadataPath, packagePath, sha256, size, evidencePath] = process.argv;
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
const evidence = {
  formatVersion: 1,
  channel: 'microsoft-store',
  package: {
    path: packagePath,
    name: metadata.expectedPackageName,
    version: metadata.version,
    architecture: metadata.architecture,
    sha256,
    sizeBytes: Number(size)
  },
  identity: {
    name: metadata.identityName,
    publisher: metadata.publisher,
    publisherDisplayName: metadata.publisherDisplayName
  },
  certification: metadata.certification,
  generatedAt: new Date().toISOString()
};
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
NODE

log "STORE ARTIFACT READY"
printf 'Package:  %s\n' "$OUTPUT"
printf 'Version:  %s\n' "$VERSION"
printf 'SHA-256:  %s\n' "$PACKAGE_SHA256"
printf 'Evidence: %s\n' "$EVIDENCE"
printf '\nUpload this MSIX in Partner Center as the replacement package for the next Store submission.\n'
