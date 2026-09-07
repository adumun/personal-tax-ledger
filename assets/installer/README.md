# Installer assets

This directory contains deterministic visual assets used by the Windows UAT/Squirrel installer.

- `ptl-loading.gif.base64.txt`: canonical base64 representation of the branded Squirrel loading surface for Personal Tax Ledger.
- materialized build asset: `out/.installer-assets/ptl-loading.gif`.

The GIF is treated as a release asset. Build scripts decode it verbatim into the installer staging area; they do not regenerate typography at build time. This avoids host-font differences and keeps the installer presentation deterministic across build environments.

## Canonical loader contract

The persisted asset must satisfy the cheap pre-build contract before Squirrel packaging is allowed to start:

- GIF signature: `GIF89a`;
- logical dimensions: `400x180`;
- minimum decoded size: `1024` bytes;
- valid GIF trailer byte: `0x3B`;
- at least two Graphic Control Extensions, so the loading surface is animated rather than a trivial static placeholder.

Current 0.1.6 canonical asset:

- decoded bytes: `8278`;
- frames: `4`;
- SHA-256: `f936bc0eee0be441289cea4db09508a2a02825be91cb8fca8450854f543ed221`;
- visual language: dark PTL desktop background, turquoise accent, PTL badge, product name, `PREPARANDO WINDOWS`, local-data copy and animated progress bar.

When the asset changes, the resulting installer payload changes and must be validated as a new UAT/release artifact. The early asset gate must not be weakened merely to permit packaging.
