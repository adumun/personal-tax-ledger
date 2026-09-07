# Installer assets

This directory contains deterministic visual assets used by the Windows UAT/Squirrel installer.

- `ptl-loading.gif`: branded Squirrel loading surface for Personal Tax Ledger.

The GIF is treated as a release asset. Build scripts copy it verbatim into the installer staging area; they do not regenerate typography at build time. This avoids host-font differences and keeps the installer presentation deterministic across build environments.

When the asset changes, the resulting installer payload changes and must be validated as a new UAT/release artifact.
