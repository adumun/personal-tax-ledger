# PTL GTM Cycle 01 — Block 02 Execution Status

**Block:** 02 — Conversión  
**Status:** CLOSED WITH EXPLICIT EXTERNAL DEFERRAL  
**Date:** 2026-09-13

## Closure decision

Block 02 is closed for the active GTM cycle.

The product owner explicitly decided not to open a new Microsoft Partner Center submission at this time because the current focus is elsewhere. This is a prioritization decision, not a technical blocker and not a missing conversion artifact.

Partner Center work is therefore classified as:

`DEFERRED_BY_PRIORITY / READY_TO_RESUME`

It does not block continuation of the remaining GTM cycle.

## Completed conversion surface

- `site/index.html` is a product-conversion landing rather than a UAT/release-status homepage.
- category: `Gestión tributaria personal`.
- hero: `Entiende tu situación tributaria antes de que llegue abril.`
- primary CTA: `Obtener en Microsoft Store`.
- UAT no longer competes with the conversion CTA.
- `Para quién`, temporal problem, Privacy & Trust, current capability boundaries and conversion FAQ are present.
- metadata is no longer centered on `simulador tributario` as product identity.
- `site/privacy.html`, `site/usage.html` and `site/faq.html` are reconciled to the current public product.
- Windows 10/11 availability is surfaced near the CTA.
- Open Graph title/description/type are present on the primary landing.

## Product evidence E1–E5 — CLOSED

Canonical evidence:

1. E1 — `Resumen anual estimado — Indicadores` → `e1-annual-workspace.png`
2. E2 — `Boletas de honorarios — Resumen anual` → `e2-fee-receipts.png`
3. E3 — `Créditos hipotecarios y art. 55 bis — Beneficio art. 55 bis` → `e3-mortgage-benefit.png`
4. E4 — `Simulación APV A versus B` → `e4-apv-scenario-comparison.png`
5. E5 — `¿Cómo se calculan estos valores? — renta tributable consolidada` → `e5-calculation-explanation.png`

The machine-readable provenance record remains:

```text
docs/site/product-evidence-manifest-2026-09-13.json
```

E1–E5 are physically present under `site/assets/product/` on `master` and `gh-pages` and are rendered in the public journey:

```text
reunir → completar → modelar → comparar → entender
```

Drive retains normalized PNGs, backups, checksums and the packaged evidence set under `Personal Tax Ledger/Evidence/Block 02 - Conversion/`.

## Public projection — VERIFIED

The external GitHub Pages surface was visually verified on 2026-09-13 at:

```text
https://adumun.github.io/personal-tax-ledger/site/index.html
```

Verified browser-visible surfaces include:

- primary navigation;
- product evidence rendering;
- `Para quién`;
- `Privacidad`;
- `FAQ`.

No `page/` directory was introduced.

## Microsoft Store / Partner Center

Preparation is complete:

- canonical Listing v2 specification: `docs/product/gtm/store-listing-v2.md`;
- ASO language v1 defined;
- E1–E5 Store-ready evidence prepared;
- present/future/do-not-claim boundaries defined.

Execution is intentionally deferred:

- no new Partner Center submission will be opened now;
- Store Listing v2 is not claimed as remotely applied;
- Store screenshot reordering is not claimed as applied;
- the existing public Microsoft Store listing remains untouched.

Resume condition: product owner explicitly re-prioritizes Microsoft Store listing optimization.

## P0 final state

| P0 | State |
|---|---|
| P0-01 Store hierarchy v2 | READY / DEFERRED_BY_PRIORITY |
| P0-02 Store Listing v2 copy | SPEC DONE / DEFERRED_BY_PRIORITY |
| P0-03 E1-E5 Store screenshots | READY / DEFERRED_BY_PRIORITY |
| P0-04 Landing hero v1 | DONE |
| P0-05 Remove UAT hero competition | DONE |
| P0-06 Remove Store lineage/smoke noise | DONE |
| P0-07 Integrate real E1-E5 landing evidence | DONE / PUBLIC_HTTP_VERIFIED |
| P0-08 `Para quién` section | DONE |
| P0-09 Temporal problem section | DONE |
| P0-10 Privacy & Trust section | DONE |
| P0-11 Privacy page reconciliation | DONE |
| P0-12 Capabilities page reconciliation | DONE |
| P0-13 UAT/contributor out of core journey | DONE FOR LANDING/NAV |
| P0-14 Metadata away from simulator identity | DONE FOR PRIMARY CONVERSION PAGES |
| P0-15 Windows requirement near CTA | DONE |
| P0-16 Conversion FAQ | DONE |

## Final state

`BLOCK_02_CLOSED / CONVERSION_SURFACE_VERIFIED / PRODUCT_EVIDENCE_PUBLISHED / PARTNER_CENTER_DEFERRED_BY_PRIORITY`

The GTM cycle may continue. Partner Center is a resumable deferred lane, not a gate for the next block.
