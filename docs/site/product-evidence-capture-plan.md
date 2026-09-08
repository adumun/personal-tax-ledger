# PTL Product Evidence Capture Plan

**Status:** Active implementation plan  
**Date:** 2026-09-08  
**Backlog:** PTL-2 — Product Evidence

## Purpose

The PTL public site currently describes important capabilities textually but does not visually prove the product experience. This plan defines the minimum reproducible screenshot set required to demonstrate the current product truth without exposing real personal tax data.

The goal is not to create marketing mockups. The evidence must come from the real application, use fictitious/test data, correspond to the current UAT line, and remain traceable to the product state it depicts.

## Evidence principles

1. Use the real PTL desktop/web UI, not reconstructed mockups.
2. Use fictitious tax data only.
3. Capture current supported behavior only.
4. Prefer screenshots that explain a reader task rather than screenshots chosen only for visual variety.
5. Make the explainability differentiator visible.
6. Avoid capturing local filesystem paths, usernames, machine names, personal identifiers, real RUTs, real salaries, real mortgage data, tokens or other sensitive information.
7. Each screenshot must have an associated caption and product claim that can be supported by current code/product behavior.
8. Screenshots should be refreshed when a UI change makes them materially misleading.

## Required evidence set

### E1 — Annual workspace / source setup

**Reader question:** What information can I bring into PTL?

Capture a state where the application clearly shows the annual workspace and at least representative income/source inputs. Prefer a view that demonstrates more than one source or source type when possible.

Must visually support:

- annual personal-tax workspace;
- remunerations / income sources;
- current local desktop product identity.

Public caption direction:

> Reúne las fuentes que componen tu año tributario en un solo workspace local.

### E2 — Honorarios and/or additional annual inputs

**Reader question:** Does PTL handle more than salary income?

Capture the fee-receipts experience or another clearly distinct annual input surface. If the current UI can show fee receipt withholding and expenses coherently, prefer that state.

Must visually support at least one of:

- fee receipts;
- withholding;
- deductible/related expense inputs;
- multi-source annual context.

Public caption direction:

> Incorpora honorarios y otros antecedentes para completar la visión anual.

### E3 — Mortgage / deduction context

**Reader question:** Can PTL model tax-relevant deductions such as mortgage interest?

Capture the current mortgage module with fictitious values and enough context to show that PTL models the annual mortgage record/deduction rather than merely storing a loan name.

Must visually support:

- mortgage input or annual mortgage record;
- tax-relevant annual context;
- no unsupported claim beyond current implementation.

Public caption direction:

> Modela antecedentes hipotecarios que participan en la estimación tributaria anual.

### E4 — Scenario comparison

**Reader question:** What does PTL help me compare?

Capture `Simulación anual y escenarios` after scenarios have been built with representative fictitious data.

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

This is the highest-priority screenshot in the set.

Capture `¿Cómo se calculan estos valores?` with the calculation explanation modal open and one representative calculation expanded.

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

## Capture contract

Each evidence asset must record:

- evidence id (`E1`…`E5`);
- filename;
- PTL version/build represented;
- capture date;
- source application state;
- data classification: `FICTITIOUS_TEST_DATA`;
- public caption;
- alt text;
- relevant product/code source supporting the claim;
- refresh trigger.

Recommended asset names:

```text
site/assets/product/e1-annual-workspace.png
site/assets/product/e2-fee-receipts.png
site/assets/product/e3-mortgage.png
site/assets/product/e4-scenario-comparison.png
site/assets/product/e5-calculation-explanation.png
```

## Acceptance criteria

PTL-2 product evidence is ready for site integration when:

- all five required screenshots come from the real current product;
- every screenshot uses fictitious/test data;
- no sensitive/local-machine information is visible;
- E4 visibly demonstrates scenario comparison;
- E5 visibly demonstrates explainability, not merely a final numeric result;
- captions and alt text exist for every asset;
- version/capture provenance is recorded;
- the screenshots remain legible at normal desktop website width;
- the public copy does not claim more than the screenshots and current implementation prove.

## Current implementation evidence

The current code already supports the two most important visual claims:

- `ScenariosModule.tsx` provides an annual scenario-comparison table with taxable income, annual tax, estimated balance, difference versus base, liquidity committed and pension saving, plus a plain-language interpretation.
- `calculation-explanation-panel.tsx` exposes human-readable calculation explanations, applied expressions, inputs/origins, ordered steps, result interpretation, warnings, assumptions, optional technical detail and JSON export.

These two surfaces should anchor the public product evidence story.
