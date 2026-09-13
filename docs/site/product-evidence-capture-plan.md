# PTL Product Evidence Capture Plan

**Status:** Capture evidence supplied; canonical site integration pending  
**Date:** 2026-09-08  
**Reconciled:** 2026-09-13  
**Backlog:** PTL-2 — Product Evidence

## Purpose

The PTL public site currently describes important capabilities textually but does not yet canonically project the complete product-evidence set. This plan defines the minimum reproducible screenshot set required to demonstrate the current product truth without exposing real personal tax data.

The goal is not to create marketing mockups. The evidence must come from the real application, use fictitious/test data for public product evidence, correspond to an identified PTL build/distribution state, and remain traceable to the product state it depicts.

## 2026-09-13 reconciliation

The product screenshots/evidence requested by PTL-2 have already been supplied/uploaded by the product owner. Screenshot production is therefore **not a current blocker** and must not be restarted merely because the canonical repository asset paths are not yet populated.

At this checkpoint, neither `master` nor the current `gh-pages` tree exposes the proposed five files under `site/assets/product/`. Therefore two facts must remain separate:

1. **capture/evidence availability:** supplied;
2. **canonical repository normalization + public-site integration:** still pending verification/completion.

PTL-2B should now focus on provenance reconciliation, selection/normalization of the supplied images, canonical asset placement, captions/alt text and public-site integration. Do not fabricate replacement screenshots and do not discard already supplied evidence.

The product distribution context also evolved after the original plan: Personal Tax Ledger is now published in Microsoft Store and the Store-delivered build passed native download/install/launch smoke on 2026-09-11 (`STORE_PUBLICATION_CONFIRMED_NATIVE_RUNTIME_SMOKE_PASS`). External UAT `0.1.6` remains a separate validation lane. Product evidence may identify either lane when provenance requires it; the public site must not present Store and UAT as the same artifact/version.

## Evidence principles

1. Use the real PTL desktop/web UI, not reconstructed mockups.
2. Use fictitious tax data for the public E1–E5 product story.
3. Capture/currently project supported behavior only.
4. Prefer screenshots that explain a reader task rather than screenshots chosen only for visual variety.
5. Make the explainability differentiator visible.
6. Avoid capturing local filesystem paths, usernames, machine names, personal identifiers, real RUTs, real salaries, real mortgage data, tokens or other sensitive information.
7. Each screenshot must have an associated caption and product claim that can be supported by current code/product behavior.
8. Screenshots should be refreshed when a UI change makes them materially misleading; a later distribution state alone does not require recapture if the depicted product behavior remains materially accurate and provenance is preserved.

## Required evidence set

### E1 — Annual workspace / source setup

**Reader question:** What information can I bring into PTL?

Use a state where the application clearly shows the annual workspace and at least representative income/source inputs. Prefer a view that demonstrates more than one source or source type when possible.

Must visually support:

- annual personal-tax workspace;
- remunerations / income sources;
- current local desktop product identity.

Public caption direction:

> Reúne las fuentes que componen tu año tributario en un solo workspace local.

### E2 — Honorarios and/or additional annual inputs

**Reader question:** Does PTL handle more than salary income?

Use the fee-receipts experience or another clearly distinct annual input surface. If the current UI can show fee receipt withholding and expenses coherently, prefer that state.

Must visually support at least one of:

- fee receipts;
- withholding;
- deductible/related expense inputs;
- multi-source annual context.

Public caption direction:

> Incorpora honorarios y otros antecedentes para completar la visión anual.

### E3 — Mortgage / deduction context

**Reader question:** Can PTL model tax-relevant deductions such as mortgage interest?

Use the current mortgage module with fictitious values and enough context to show that PTL models the annual mortgage record/deduction rather than merely storing a loan name.

Must visually support:

- mortgage input or annual mortgage record;
- tax-relevant annual context;
- no unsupported claim beyond current implementation.

Public caption direction:

> Modela antecedentes hipotecarios que participan en la estimación tributaria anual.

### E4 — Scenario comparison

**Reader question:** What does PTL help me compare?

Use `Simulación anual y escenarios` after scenarios have been built with representative fictitious data.

The screenshot should show, where possible:

- multiple scenario rows;
- `Resultado final`;
- `Diferencia vs. base`;
- `Dinero que comprometes`;
- `Ahorro para tu pensión`;
- the plain-language explanation shown above the table;
- the quick-reading result if it fits without making the screenshot unreadable.

This state is directly supported by `ScenariosModule.tsx`, whose purpose is to compare different combinations of the annual tax context and explain trade-offs between tax result, liquidity and pension saving.

Public caption direction:

> Compara escenarios y observa el resultado tributario junto con el dinero que comprometes y el ahorro previsional asociado.

### E5 — Explainable calculation

**Reader question:** Why does PTL produce this result?

This remains the highest-priority screenshot in the set.

Use `¿Cómo se calculan estos valores?` with the calculation explanation modal open and one representative calculation expanded.

The screenshot should expose as much as practical of:

- calculation title and formatted result;
- short description;
- general formula/rule explanation;
- applied expression;
- input values and their origins;
- calculation steps;
- interpretation;
- warnings/assumptions when applicable.

The current application also supports switching to technical detail and exporting JSON. These are valid secondary claims, but the primary screenshot should favor the human-readable explanation rather than raw JSON.

Public caption direction:

> No te quedes sólo con el resultado: revisa qué regla se aplicó, qué valores se usaron y cómo se llegó al cálculo.

## Recommended ordering on the public site

1. E1 — Build the annual picture.
2. E2 — Add another source type.
3. E3 — Add tax-relevant deductions/context.
4. E4 — Compare scenarios.
5. E5 — Explain the result.

This creates a short product narrative:

```text
reunir → completar → modelar → comparar → entender
```

## Capture / provenance contract

Each evidence asset must record:

- evidence id (`E1`…`E5`);
- canonical filename/path once normalized;
- PTL version/build or distribution lane represented;
- capture date when known;
- source application state;
- data classification: `FICTITIOUS_TEST_DATA` for the public product-evidence set;
- public caption;
- alt text;
- relevant product/code source supporting the claim;
- refresh trigger.

Recommended canonical asset names remain:

```text
site/assets/product/e1-annual-workspace.png
site/assets/product/e2-fee-receipts.png
site/assets/product/e3-mortgage.png
site/assets/product/e4-scenario-comparison.png
site/assets/product/e5-calculation-explanation.png
```

These names are normalization targets, not evidence that the files already exist at those paths.

## Acceptance criteria

PTL-2 product evidence is complete for public-site integration when:

- the supplied real-product screenshots have been reconciled against E1–E5;
- every public screenshot uses fictitious/test data and exposes no sensitive/local-machine information;
- E4 visibly demonstrates scenario comparison;
- E5 visibly demonstrates explainability, not merely a final numeric result;
- captions and alt text exist for every public asset;
- version/build/distribution provenance is recorded;
- canonical repository asset paths are populated or an explicitly governed alternative is documented;
- the screenshots remain legible at normal desktop website width;
- the public copy does not claim more than the screenshots and current implementation prove;
- the derived `gh-pages` projection is synchronized from the canonical source.

## Current implementation evidence

The current code already supports the two most important visual claims:

- `ScenariosModule.tsx` provides an annual scenario-comparison table with taxable income, annual tax, estimated balance, difference versus base, liquidity committed and pension saving, plus a plain-language interpretation.
- `calculation-explanation-panel.tsx` exposes human-readable calculation explanations, applied expressions, inputs/origins, ordered steps, result interpretation, warnings, assumptions, optional technical detail and JSON export.

These two surfaces should anchor the public product evidence story.
