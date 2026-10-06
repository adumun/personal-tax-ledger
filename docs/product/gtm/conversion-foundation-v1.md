# Personal Tax Ledger — Conversion Foundation v1

**Initiative:** PTL Early Adoption & Go-To-Market — Cycle 01  
**Block:** 02 — Conversión  
**Macrostate:** PREPARE  
**Input authority:** `docs/product/gtm/gtm-foundation-v1.md`  
**Status:** SPECIFICATION CLOSED / IMPLEMENTATION IN PROGRESS

## Conversion objective

Transform the GTM foundation into a coherent path:

`discovery -> comprehension -> trust -> Store click -> install`

Block 1 is not redefined here.

## Canonical conversion hierarchy

### Category

> Gestión tributaria personal

### Problem

> Tu situación tributaria se construye durante todo el año, aunque normalmente la revises recién cuando llega Operación Renta.

### Promise

> Organiza y entiende tu situación tributaria durante el año, proyecta tu resultado y llega mejor preparado a Operación Renta.

### Proof

Annual workspace, multiple income sources, honorarios, APV, mortgage context, scenarios and explainable calculations.

### Trust

Desktop/local-first, current local workspace, no online account required for current local capabilities and no SII/bank credentials required for current local operation.

### Boundary

> PTL no presenta declaraciones, no reemplaza al SII y no sustituye asesoría tributaria profesional.

### Primary CTA

> Obtener en Microsoft Store

## Reconciliation decisions

### RC-01 — Simulator is a capability, not the category

The prior public surface repeatedly described PTL primarily as a simulator. This conflicts with the Block 1 category `Gestión tributaria personal` and risks framing PTL as a once-a-year calculator.

**Status:** REQUIRES RECONCILIATION -> implementation started.

### RC-02 — Public product and UAT must not compete

The previous hero and landing journey exposed Store and UAT as parallel calls to action and explained internal distribution lanes, Store IDs and smoke status.

**Decision:** Microsoft Store is the public acquisition lane. UAT remains accessible as a secondary lifecycle/testing surface, not as a competing conversion CTA.

### RC-03 — Privacy must describe the current product, not only UAT

Privacy facts are valuable conversion evidence. UAT-specific footer/framing must not make Store users question applicability.

### RC-04 — Capabilities page must describe the current public product

`usage.html` must not use UAT 0.1.6 as the primary identity of the product.

## Landing IA v2

1. Hero — category, temporal promise, Store CTA, Windows/local trust line.
2. Problem — `Tu situación tributaria no empieza en abril`.
3. Product journey — `reunir -> completar -> modelar -> comparar -> entender`.
4. Current capabilities — organize, project, compare, understand.
5. For whom — mixed income, independent/honorarios, freelance/multiple income, historically unprepared taxpayers.
6. Privacy and trust.
7. What PTL does / does not do.
8. Conversion FAQ.
9. Final Store CTA.

## Hero v1

**Eyebrow:** Gestión tributaria personal para Chile

**H1:**

> Entiende tu situación tributaria antes de que llegue abril.

**Supporting copy:**

> Organiza los antecedentes de tu año, proyecta tu resultado, compara escenarios y entiende cómo se calculan desde una aplicación de escritorio pensada para mantener tu información bajo tu control.

**Primary CTA:** Obtener en Microsoft Store

**Secondary CTA:** Ver cómo funciona

**Trust line:** Gratis · Windows 10/11 · workspace local · no requiere una cuenta en línea para sus capacidades locales actuales.

## CTA policy

- `Obtener en Microsoft Store`: default acquisition CTA when destination is Store.
- `Ver cómo funciona`: allowed informational secondary CTA on the landing.
- `Descargar`: only when a direct binary is actually delivered.
- `Conocer más`: upstream content only, not as a competing CTA once the user is on the landing.
- At conversion points: one acquisition CTA plus at most one informational CTA.

## Trust architecture

### Publicly supportable now

- current work data is stored in a local workspace;
- current local capabilities do not require an online account;
- current PTL does not require SII credentials;
- current PTL does not require banking credentials;
- current registered tax data is not sent to a PTL-owned service according to the current privacy contract;
- PTL is not official SII software;
- PTL does not file tax returns;
- PTL does not replace professional tax advice.

### Must not be promised until verified

- universal data persistence across every uninstall/reinstall path;
- complete ledger export/backup/restore as a generally available product capability.

## Screenshot narrative

Canonical story:

`reunir -> completar -> modelar -> comparar -> entender`

1. E1 annual workspace;
2. E2 honorarios/mixed-income context;
3. E3 mortgage/tax-relevant context;
4. E4 scenario comparison;
5. E5 explainable calculation.

Real product evidence already supplied by the product owner must be reused. Do not replace it with marketing mockups merely because canonical asset normalization is pending.

## Store <-> Landing consistency contract

Store and landing are different lengths of one commercial truth.

They must remain consistent in:

- product category;
- one-line proposition;
- temporal narrative;
- current capability inventory;
- present-vs-future claims;
- privacy/trust facts;
- SII/advice boundaries;
- CTA destination;
- E1-E5 product evidence semantics;
- terminology.

## Immediate funnel

`Landing visit -> understand PTL -> see product proof -> resolve trust/relevance -> Store CTA -> Store page -> install -> first launch`

Activation after first launch is outside Block 2.

## Mobile/desktop discovery

PTL is a Windows desktop product.

P0: expose `Disponible para Windows 10/11` near acquisition CTA.

P1 candidate: simple `Copiar enlace para abrirlo luego en tu PC` handoff for non-Windows/mobile discovery. Do not require email collection by default.

## Copy system

### One-liner

> Tu situación tributaria, organizada y comprensible durante todo el año.

### Short description

> Personal Tax Ledger te ayuda a organizar tu información tributaria personal, proyectar tu resultado anual, comparar escenarios y entender cómo se obtienen los cálculos.

### Benefit vocabulary

- Organiza — Mira tu año como un todo.
- Anticipa — No esperes a abril para descubrir el resultado.
- Compara — Explora antes de decidir.
- Entiende — No te quedes sólo con el número.
- Control — Trabaja localmente con tu información.

## Implementation priorities

### P0 — before sending traffic

- Store Listing v2 prepared and applied in Partner Center;
- reconcile E1-E5 assets and integrate real product evidence;
- conversion hero and navigation;
- remove UAT competition from hero/core journey;
- remove Store ID/smoke/internal distribution language from product journey;
- add `Para quién`;
- add temporal-problem section;
- surface privacy/trust;
- reconcile privacy and capabilities pages;
- refocus FAQ on conversion objections;
- expose Windows requirement;
- update product title/meta description.

### P1 — first cohort

- mobile copy-link handoff;
- qualitative hero/category testing;
- screenshot order testing;
- first legitimate testimonial/review when it exists;
- FAQ refinement from real questions;
- Store icon review at actual Store/search sizes.

### P2 — after data

- ASO refinement;
- CTA wording optimization;
- screenshot sequencing optimization;
- segment landing entries;
- stronger mobile-to-desktop handoff.

## Closed decisions

1. Microsoft Store is the canonical public acquisition channel for the Windows product.
2. The landing's primary conversion target is Microsoft Store.
3. UAT is secondary and must not compete with Store in the core journey.
4. Category remains `Gestión tributaria personal`.
5. `Simulador` is a capability descriptor, not product identity.
6. Hero v1 uses the temporal message `Entiende tu situación tributaria antes de que llegue abril.`
7. Primary CTA is `Obtener en Microsoft Store`.
8. The product-evidence narrative is E1-E5 / `reunir -> completar -> modelar -> comparar -> entender`.
9. Explainability is visible product proof.
10. Local-first is a trust pillar and claims remain factual/bounded.
11. Store and landing obey a single consistency contract.

## Validation hypotheses

- temporal framing beats simulator framing for cold-user comprehension;
- actual screenshots improve trust before Store click;
- explainability is more differentiating than raw feature breadth;
- local-first reduces reluctance around tax information;
- `gestión tributaria personal` is understandable enough for acquisition;
- mixed-income users recognize themselves in `Para quién`;
- removing UAT from the main journey improves clarity without materially harming tester recruitment;
- some mobile users require a desktop-handoff mechanism.
