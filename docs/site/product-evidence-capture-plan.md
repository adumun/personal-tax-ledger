# PTL Product Evidence Capture Plan

**Status:** Capture re-established and normalized; Drive evidence persisted; repository binary integration pending  
**Date:** 2026-09-08  
**Reconciled:** 2026-09-13  
**Backlog:** PTL-2 — Product Evidence

## Purpose

The PTL public site must demonstrate the real product instead of asking readers to trust textual claims. This plan defines the minimum reproducible screenshot set required to demonstrate the current product truth without exposing real personal tax data.

The goal is not to create marketing mockups. The evidence must come from the real application, use fictitious/test data for public product evidence, correspond to an identified PTL product state, and remain traceable to the product state it depicts.

## 2026-09-13 execution reconciliation

The product owner re-captured and supplied a complete real-product evidence set on 2026-09-13. Screenshot production is now **closed** for Block 02.

The selected public set has been normalized as E1–E5, hashed, packaged and persisted in the canonical PTL Drive evidence area:

```text
Evidence/Block 02 - Conversion/Product Screenshots/
```

A ZIP evidence pack is also persisted in:

```text
Evidence/Block 02 - Conversion/ptl-product-evidence-e1-e5.zip
```

The machine-readable canonical selection/provenance record is:

```text
docs/site/product-evidence-manifest-2026-09-13.json
```

At this checkpoint two facts must remain separate:

1. **capture + selection + normalization + Drive persistence:** DONE;
2. **binary placement under `site/assets/product/` + public-site rendering + Store upload:** PENDING.

The current connected GitHub mutation surface can create/update UTF-8 text files but cannot upload binary PNG repository assets. This tooling limitation must not be confused with missing product evidence and must not trigger another recapture.

The public-site implementation should resume from the selected E1–E5 files once binary repository placement is available.

## Evidence principles

1. Use the real PTL desktop UI, not reconstructed mockups.
2. Use fictitious/test tax data for the public E1–E5 product story.
3. Capture/project supported behavior only.
4. Prefer screenshots that explain a reader task rather than screenshots chosen only for visual variety.
5. Make the explainability differentiator visible.
6. Avoid local filesystem paths, usernames, machine names, personal identifiers, real RUTs, real salaries, real mortgage data, tokens or other sensitive information.
7. Every screenshot has a caption, alt text, hash and product claim.
8. Refresh screenshots only when a UI or behavior change makes the image materially misleading; a later distribution state alone does not require recapture.

## Canonical selected evidence set

### E1 — Annual workspace / product overview

**Selected screen:** `Resumen anual estimado — Indicadores`  
**Canonical filename:** `e1-annual-workspace.png`  
**Target repository path:** `site/assets/product/e1-annual-workspace.png`

Reader question:

> What does PTL give me as an annual working view?

Public caption:

> Construye una visión anual de tu situación tributaria a partir de los antecedentes registrados.

Alt text:

> Vista Resumen anual estimado de Personal Tax Ledger con indicadores de ingresos, base tributable, retenciones, rebaja hipotecaria y devolución estimada.

Why selected:

- gives the strongest one-screen product overview;
- visibly demonstrates annual projection rather than a blank input form;
- exposes multiple connected tax dimensions without requiring technical explanation.

---

### E2 — Honorarios / mixed-income evidence

**Selected screen:** `Boletas de honorarios — Resumen anual`  
**Canonical filename:** `e2-fee-receipts.png`  
**Target repository path:** `site/assets/product/e2-fee-receipts.png`

Reader question:

> Does PTL handle more than salary income?

Public caption:

> Incorpora honorarios, retenciones y PPM dentro de la visión anual.

Alt text:

> Vista Resumen anual de boletas de honorarios de Personal Tax Ledger con bruto emitido, retenciones, PPM, líquido recibido y estado de boletas.

Why selected:

- communicates honorarios faster than the raw record table;
- shows both amounts and tax treatment;
- directly supports the primary mixed-income ICP.

---

### E3 — Mortgage / tax-relevant context

**Selected screen:** `Créditos hipotecarios y art. 55 bis — Beneficio art. 55 bis`  
**Canonical filename:** `e3-mortgage-benefit.png`  
**Target repository path:** `site/assets/product/e3-mortgage-benefit.png`

Reader question:

> Does PTL model tax-relevant context beyond income?

Public caption:

> Modela antecedentes hipotecarios que participan en la estimación tributaria anual.

Alt text:

> Vista del beneficio hipotecario artículo 55 bis en Personal Tax Ledger con intereses anuales, base deducible, porcentaje aplicable y rebaja estimada.

Why selected:

- demonstrates actual tax modeling rather than merely storing a loan record;
- shows legal cap/base/percentage structure visibly;
- provides a strong third step in the product story.

---

### E4 — Scenario comparison

**Selected screen:** `Simulación APV A versus B`  
**Canonical filename:** `e4-apv-scenario-comparison.png`  
**Target repository path:** `site/assets/product/e4-apv-scenario-comparison.png`

Reader question:

> What does PTL help me compare before deciding?

Public caption:

> Compara dos tratamientos de APV y observa sus efectos económicos y tributarios estimados.

Alt text:

> Comparador APV Régimen A versus Régimen B en Personal Tax Ledger con aporte anual, beneficio inmediato, costo económico neto e impuesto anual estimado.

Why selected:

- provides a clear side-by-side comparison;
- makes decision support visible immediately;
- is more legible as a public screenshot than a dense generic scenario table.

---

### E5 — Explainable calculation

**Selected screen:** `¿Cómo se calculan estos valores? — renta tributable consolidada`  
**Canonical filename:** `e5-calculation-explanation.png`  
**Target repository path:** `site/assets/product/e5-calculation-explanation.png`

Reader question:

> Why does PTL produce this result?

Public caption:

> No te quedes sólo con el resultado: revisa la explicación, los valores usados y los pasos del cálculo.

Alt text:

> Modal de explicación de cálculos de Personal Tax Ledger mostrando la renta tributable consolidada, explicación general, cálculo aplicado, valores utilizados y pasos de consolidación.

Why selected:

- this is the strongest visible differentiator in the current product;
- shows human-readable explanation rather than only a final number;
- visibly exposes rule/formula, inputs and ordered calculation steps.

## Backup evidence retained

Three additional real-product screenshots are retained as secondary evidence:

- `b1-labor-income.png` — multiple labor-income sources / employers;
- `b2-annual-reconciliation.png` — annual reconciliation breakdown;
- `b3-pension-apv-overview.png` — pension and APV annual overview.

These are not part of the minimum public E1–E5 story, but remain useful for documentation, later Store sequencing or segment-specific pages.

## Recommended ordering

### Public site

1. E1 — annual picture;
2. E2 — honorarios / mixed income;
3. E3 — tax-relevant mortgage context;
4. E4 — compare scenarios;
5. E5 — understand the calculation.

This preserves the canonical narrative:

```text
reunir → completar → modelar → comparar → entender
```

### Microsoft Store v1 ordering

For a cold Store visitor, explainability should be promoted earlier:

1. E1 — annual picture;
2. E2 — mixed income;
3. E5 — explainability;
4. E4 — scenario comparison;
5. E3 — mortgage context.

Reason: the Store needs to establish differentiation before demonstrating feature breadth.

## Capture / provenance contract

Every selected evidence asset records:

- evidence id (`E1`…`E5`);
- canonical filename;
- target repository path;
- dimensions;
- SHA-256;
- source screen;
- capture date;
- data classification `FICTITIOUS_TEST_DATA`;
- public caption;
- alt text;
- purpose;
- refresh trigger.

The canonical machine-readable record is:

```text
docs/site/product-evidence-manifest-2026-09-13.json
```

## Privacy review

The selected public screenshots were reviewed for obvious public-evidence risks.

Observed data is intentionally generic/fictitious, including labels such as:

- `Cliente 1`, `Cliente 2`, `Cliente 3`;
- `Banco 1`;
- `Casa 1`;
- generic `Trabajo 1` / `Trabajo 2`.

The selected set does not visibly expose:

- real RUTs;
- real emails;
- Windows usernames;
- local filesystem paths;
- machine names;
- passwords/tokens;
- identifiable customer/account names.

This does not convert the screenshots into a privacy guarantee; it only records the public-evidence review of the selected capture state.

## Acceptance criteria — current status

- [x] real-product screenshots re-captured;
- [x] E1–E5 selection closed;
- [x] fictitious/generic public data confirmed at visual-review level;
- [x] E4 visibly demonstrates scenario comparison;
- [x] E5 visibly demonstrates explainability;
- [x] captions defined;
- [x] alt text defined;
- [x] hashes/dimensions recorded;
- [x] Drive evidence persisted;
- [x] backup screenshots retained;
- [ ] canonical PNG assets uploaded to `site/assets/product/` in GitHub;
- [ ] landing renders E1–E5;
- [ ] `gh-pages` binary projection synchronized;
- [ ] Store listing screenshots uploaded/applied in Partner Center.

## Current blocker

The remaining site blocker is not capture. It is binary repository placement through a write surface that currently exposes text-file mutation but not binary upload.

Do not recapture again merely because `site/assets/product/` is not populated.

## Current implementation evidence

The product itself visibly demonstrates:

- annual projection and reconciliation;
- labor income and multiple source handling;
- fee receipts, retention and PPM context;
- mortgage / article 55 bis modeling;
- APV comparison;
- explainable calculations with applied formulas, values and steps.

The E1–E5 evidence set is now sufficient to support the Block 02 conversion story once published to the public surfaces.
