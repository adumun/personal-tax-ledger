# Microsoft Store certification remediation — 2026-09-09

Status: `REMEDIATED_PENDING_RESUBMISSION`

## Certification result

Microsoft Partner Center completed review on 2026-09-09 and returned `Attention needed` for Personal Tax Ledger (`Store ID 9N8NR29965DS`).

The reported policy was:

- `10.1.1.11 On Device Tiles`

Publisher note:

> The available product tile icons include a default image. Tile icons must uniquely represent product so users associate icons with the appropriate products and do not confuse one product for another.

No functional, identity, data, security, or runtime failure was reported in this certification result.

## Root cause

`scripts/prepare-msix.mjs` generated every package tile as a flat solid-color PNG. Those files were deterministic, but they were placeholders rather than product-specific artwork.

The affected manifest assets were:

- `Assets/StoreLogo.png` — 50x50;
- `Assets/Square44x44Logo.png` — 44x44;
- `Assets/Square150x150Logo.png` — 150x150;
- `Assets/Wide310x150Logo.png` — 310x150.

This explains the Store finding: the package technically had all required files, but the images did not uniquely identify Personal Tax Ledger.

## Remediation

The MSIX lane now generates a deterministic PTL-specific identity set (`ptl-ledger-monogram-v1`) instead of placeholder tiles.

The asset renderer includes:

- PTL monogram;
- ledger/document mark;
- established PTL accent color;
- dedicated square and wide compositions;
- deterministic PNG generation without an additional graphics dependency.

`out/msix/msix-build.json` now records:

- branding asset version;
- certification policy being guarded;
- `placeholderAssetsAllowed: false`;
- dimensions and SHA-256 for every required tile.

The preparation step fails if the expected asset set is incomplete, dimensionally inconsistent, duplicated as identical binaries, or loses its versioned PTL branding marker.

A unit test in `test/msix-assets.test.mjs` guards PNG validity, required dimensions, distinct binaries, and the explicit branding version.

## Resubmission procedure

On the Windows packaging host:

```powershell
npm ci
npm test
npm run desktop:check
npm run desktop:msix:prepare:store
```

Then package the generated staging directory with the existing Windows SDK MSIX lane, inspect the four files under `out/msix/staging/Assets`, and run Windows App Certification Kit before uploading the replacement package to Partner Center.

The resubmission must use the PTL-branded output from this remediation branch/commit; an older staging directory must not be reused.

## Gate

The Store/MSIX publication slice remains open until:

1. the corrected package is uploaded;
2. Microsoft Store certification passes policy `10.1.1.11`;
3. Microsoft re-signs the package;
4. the Store-installed build runs with Smart App Control active;
5. runtime loopback and historical workspace persistence are revalidated on the certified build.

This incident also establishes a reusable release rule: default, template, placeholder, monochrome stand-in, or otherwise non-product-specific package artwork is a publication blocker before Store submission.
