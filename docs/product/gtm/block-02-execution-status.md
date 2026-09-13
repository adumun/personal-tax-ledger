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

### Canonical state

The product owner previously supplied the real-product screenshots and the repository canon records that screenshot production is not the blocker.

### Current execution limitation

During this execution:

- no E1-E5 image files exist under `master/site/assets/product/`;
- no corresponding files exist in the current public projection;
- Library search did not surface the previously supplied native image files;
- GitHub issue #2 contains the reconciliation state but no image attachments/comments.

Therefore screenshot recapture was **not** restarted and marketing mockups were **not** fabricated.

### Remaining action

Recover/materialize the already supplied source images, reconcile them to E1-E5, record provenance, normalize filenames/alt/captions, add them under the governed asset path, and synchronize `gh-pages`.

## P0 status

| P0 | State |
|---|---|
| P0-01 Store hierarchy v2 | SPEC READY / PARTNER CENTER PENDING |
| P0-02 Store Listing v2 copy | DONE SPEC / REMOTE APPLY PENDING |
| P0-03 E1-E5 Store screenshots | BLOCKED ON SOURCE-ASSET RECOVERY |
| P0-04 Landing hero v1 | DONE |
| P0-05 Remove UAT hero competition | DONE |
| P0-06 Remove Store lineage/smoke noise | DONE |
| P0-07 Integrate real E1-E5 landing evidence | BLOCKED ON SOURCE-ASSET RECOVERY |
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
2. the real E1-E5 screenshots are canonically integrated and visible in the public landing/Store listing.

Do not advance Block 03 as a substitute for these remaining Block 02 P0 items.
