# PTL Product Evidence Publish Runbook

**Scope:** PTL-2 / Block 02 conversion evidence  
**Status:** Ready for local execution

## Purpose

Publish the already selected and normalized real-product evidence E1-E5 to both `master` and `gh-pages` without recapturing or modifying the screenshots.

The binary evidence pack is stored in Drive under:

`Personal Tax Ledger/Evidence/Block 02 - Conversion/ptl-product-evidence-e1-e5.zip`

The companion PowerShell publisher is stored alongside it as:

`publish-ptl-e1-e5.ps1`

## Canonical targets

The script publishes these five files to both branches under `site/assets/product/`:

- `e1-annual-workspace.png`
- `e2-fee-receipts.png`
- `e3-mortgage-benefit.png`
- `e4-apv-scenario-comparison.png`
- `e5-calculation-explanation.png`

## Preconditions

- local clone of `adumun/personal-tax-ledger`;
- clean Git working tree;
- authenticated push access to `origin`;
- PowerShell 7 or Windows PowerShell with `Expand-Archive`;
- downloaded `ptl-product-evidence-e1-e5.zip`;
- downloaded `publish-ptl-e1-e5.ps1`.

## Execution

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\publish-ptl-e1-e5.ps1 `
  -EvidenceZip .\ptl-product-evidence-e1-e5.zip `
  -RepoPath C:\path\to\personal-tax-ledger
```

The script:

1. expands the evidence pack into a temporary directory;
2. verifies SHA-256 for all five canonical screenshots;
3. fetches `master` and `gh-pages`;
4. refuses to continue if the working tree is dirty;
5. copies the exact same PNGs to `site/assets/product/` on `master`;
6. commits and pushes only when files changed;
7. repeats the same operation on `gh-pages`;
8. switches the local repository back to `master`;
9. removes the temporary extraction directory.

## Integrity rule

Do not edit or recompress the canonical screenshots before publication. Their SHA-256 values are frozen in `docs/site/product-evidence-manifest-2026-09-13.json` and checked by the publisher.

## After execution

Block 02 still requires:

- landing HTML/CSS integration of E1-E5;
- public readback verification;
- Microsoft Store Listing v2 + screenshot update in Partner Center.

Screenshot capture itself is closed and must not be restarted unless the depicted product becomes materially misleading.
