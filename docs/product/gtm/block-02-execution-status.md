# PTL GTM Cycle 01 — Block 02 Execution Status

**Block:** 02 — Conversión  
**Status:** IMPLEMENTATION IN PROGRESS  
**Date:** 2026-09-13

## Completed in repository source (`master`)

- `site/index.html` converted from UAT/release-status-oriented homepage to product-conversion landing.
- primary category aligned to `Gestión tributaria personal`.
- hero aligned to `Entiende tu situación tributaria antes de que llegue abril.`
- primary CTA standardized to `Obtener en Microsoft Store`.
- UAT removed as competing hero CTA.
- Store ID / smoke-state / dual-lane explanations removed from the core conversion journey.
- `Para quién` section added.
- temporal problem section added.
- current capability grouping changed to Organiza / Proyecta / Compara / Entiende.
- privacy/trust surfaced before final CTA.
- current capability boundaries made explicit.
- Windows 10/11 requirement surfaced near CTA.
- page title/meta description moved away from `simulador tributario` as product identity.
- `site/privacy.html` reconciled to current public desktop product rather than UAT-only framing.
- privacy wording now avoids promising uninstall persistence or complete export before verification.
- `site/usage.html` reconciled from UAT-specific framing to current public-product capabilities.
- `site/faq.html` refocused on conversion objections: SII, accountant, Excel, local data, credentials, uninstall, export, official status.

## Completed in public projection (`gh-pages`)

The following files were synchronized from the conversion source:

- `site/index.html`
- `site/privacy.html`
- `site/usage.html`
- `site/faq.html`

The existing root redirect to `site/index.html` remains unchanged. No `page/` directory is introduced.

## Store execution

### Completed

- canonical Partner Center copy/specification persisted at `docs/product/gtm/store-listing-v2.md`;
- ASO language v1 defined;
- screenshot order v1 defined;
- present/future/do-not-claim boundaries defined.

### Pending external action

`Microsoft Store Listing v2` is **READY FOR PARTNER CENTER IMPLEMENTATION**.

No available connected integration provides Microsoft Partner Center / Microsoft Store listing mutation in this environment. Therefore the Store listing has not been falsely marked as remotely updated.

## Product evidence E1-E5

### Capture and selection — CLOSED

The product owner re-captured and supplied a complete real-product screenshot set on 2026-09-13.

The canonical public selection is now frozen:

1. E1 — `Resumen anual estimado — Indicadores` → `e1-annual-workspace.png`
2. E2 — `Boletas de honorarios — Resumen anual` → `e2-fee-receipts.png`
3. E3 — `Créditos hipotecarios y art. 55 bis — Beneficio art. 55 bis` → `e3-mortgage-benefit.png`
4. E4 — `Simulación APV A versus B` → `e4-apv-scenario-comparison.png`
5. E5 — `¿Cómo se calculan estos valores? — renta tributable consolidada` → `e5-calculation-explanation.png`

Backup evidence retained:

- `b1-labor-income.png`;
- `b2-annual-reconciliation.png`;
- `b3-pension-apv-overview.png`.

### Provenance — CLOSED

The machine-readable selection and provenance record is:

```text
docs/site/product-evidence-manifest-2026-09-13.json
```

It records:

- source screen;
- canonical filename;
- target repository path;
- dimensions;
- SHA-256;
- public caption;
- alt text;
- purpose;
- refresh trigger.

The capture/selection plan was reconciled in:

```text
docs/site/product-evidence-capture-plan.md
```

GitHub issue `PTL-2 — Product Evidence` has also been updated to reflect the new state.

### Drive binary evidence — CLOSED

The normalized PNGs, backup screenshots and checksums are persisted in:

```text
Personal Tax Ledger/Evidence/Block 02 - Conversion/Product Screenshots/
```

A packaged evidence set is persisted as:

```text
Personal Tax Ledger/Evidence/Block 02 - Conversion/ptl-product-evidence-e1-e5.zip
```

### Repository binary placement — PENDING TOOLING

The connected GitHub write surface currently supports UTF-8 text-file mutation but does not expose binary repository upload.

Therefore the remaining repository-side work is:

- place E1–E5 PNGs under `site/assets/product/`;
- render them in the landing product journey;
- synchronize the same binary assets and HTML to `gh-pages`.

This is a tooling/publication blocker, **not a capture blocker**. Do not recapture the screenshots again merely because repository binary placement remains pending.

## P0 status

| P0 | State |
|---|---|
| P0-01 Store hierarchy v2 | SPEC READY / PARTNER CENTER PENDING |
| P0-02 Store Listing v2 copy | DONE SPEC / REMOTE APPLY PENDING |
| P0-03 E1-E5 Store screenshots | CAPTURE + SELECTION + PROVENANCE DONE / PARTNER CENTER UPLOAD PENDING |
| P0-04 Landing hero v1 | DONE |
| P0-05 Remove UAT hero competition | DONE |
| P0-06 Remove Store lineage/smoke noise | DONE |
| P0-07 Integrate real E1-E5 landing evidence | CAPTURE DONE / REPO BINARY UPLOAD PENDING |
| P0-08 `Para quién` section | DONE |
| P0-09 Temporal problem section | DONE |
| P0-10 Privacy & Trust section | DONE |
| P0-11 Privacy page reconciliation | DONE |
| P0-12 Capabilities page reconciliation | DONE |
| P0-13 UAT/contributor out of core journey | DONE FOR LANDING/NAV |
| P0-14 Metadata away from simulator identity | DONE FOR PRIMARY CONVERSION PAGES |
| P0-15 Windows requirement near CTA | DONE |
| P0-16 Conversion FAQ | DONE |

## Block closure rule

Block 02 remains **implementation in progress** until:

1. the Store Listing v2 is applied/verified in Partner Center;
2. the real E1-E5 PNGs are placed in the repository, rendered on the public landing and synchronized to `gh-pages`;
3. the selected screenshots are applied to the Store listing.

Do not advance Block 03 as a substitute for these remaining Block 02 P0 items.
