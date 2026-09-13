# Personal Tax Ledger — GTM Foundation v1

**Initiative:** PTL Early Adoption & Go-To-Market — Cycle 01  
**Block:** 01 — Fundaciones GTM  
**Macrostate:** PREPARE  
**Status:** CLOSED WITH VALIDATION HYPOTHESES  
**Scope:** Commercial and communication foundation only  
**Out of scope:** campaigns, final creatives, social publishing, paid acquisition execution

---

## 0. Executive decision

Personal Tax Ledger must not be positioned primarily as **an app to calculate taxes** or as **an app only for Operación Renta**. Those descriptions are related to the product, but strategically underrepresent it.

The stronger territory is **personal tax management throughout the year: organization, traceability, projection, understanding and preparation**.

> **Taxes are the domain. Readiness and control are the value.**

### DECIDED

- **Canonical market territory:** Personal Tax Management / Gestión tributaria personal.
- **Primary user outcome:** have my personal tax situation organized and understandable before I need it.
- **Product role:** PTL is the user's working record for understanding and preparing their personal tax position over time.
- PTL must not be confused with an ERP, enterprise accounting software, accountant software, automatic tax filing, an SII replacement, a simple file manager, a generic budgeting app or a one-off tax calculator.
- **Operación Renta is a moment of truth and acquisition hook, not the complete category.**

---

## 1. Problem definition

A person's tax situation is constructed continuously throughout the year, while most people interact with it episodically. Income happens monthly. Fee receipts are issued during the year. Withholdings, PPM, employer changes, deductions, APV, mortgage-related information and other relevant circumstances accumulate over time. The important question is often asked only when Operación Renta approaches: **what does all of this mean for me this year?**

Information may be fragmented between SII, payroll slips, fee receipts, employer information, spreadsheets, PDFs, email, bank records, accountant conversations, prior calculations and personal memory.

The fundamental problem is therefore **not merely calculation**. It is the absence of a persistent personal model of the user's tax situation.

### How a normal user may describe the problem

- “No sé cuánto voy a terminar pagando.”
- “Tengo sueldo y además hago boletas y no sé cómo se junta todo.”
- “En abril recién veo si tengo que pagar.”
- “Tengo todo repartido en distintos lados.”
- “Mi contador me pide cosas y tengo que empezar a buscarlas.”
- “Todos los años termino armando lo mismo de nuevo.”

### Functional problem

The user lacks one coherent place to represent relevant personal tax information, understand how different sources interact, project an annual outcome, compare scenarios, inspect why a result was produced and preserve context over time.

### Cognitive problem

Tax information requires combining concepts that normally live separately: income, retentions, PPM, pensions, deductions, expenses, brackets, tax-year rules and several income sources. Even when every individual number exists somewhere, the user may still lack an understandable answer.

### Emotional problem

The relevant emotional tension is **uncertainty**, not fear. The credible user concern is not wanting to discover too late something that could have been understood earlier. PTL should reduce uncertainty, last-minute scrambling, dependence on memory and ambiguity around projections. It must not manufacture tax anxiety.

### Temporal problem

Events occur continuously while reckoning is periodic.

**Reactive model:** January–December accumulate information → March–April reconstruct information → April react.

**PTL model:** January–December maintain understanding → inspect projections/scenarios during the year → arrive at Operación Renta prepared.

### Fragmentation problem

The SII is an essential authoritative source, but it is not equivalent to the user's longitudinal personal workspace. A payroll slip is evidence. A spreadsheet is a tool. An accountant provides professional expertise. A bank records movements. PTL models the person's tax situation. These elements are complementary.

### Canonical problem statement

> **People generate tax-relevant information throughout the year but lack a persistent, comprehensible personal workspace that lets them organize it, understand how it fits together and prepare before the annual tax moment arrives.**

### HYPOTHESIS

“Arrive prepared instead of reconstructing everything in April” will resonate more strongly than “calculate your annual tax.”

### TO VALIDATE

Determine whether the strongest perceived pain is:

1. uncertainty about payment/refund;
2. fragmentation;
3. lack of preparation;
4. difficulty understanding calculations.

---

## 2. Initial ICP

Cycle 01 must avoid trying to address every Chilean taxpayer. The initial audience must combine a recognizable problem, sufficient complexity, ability to understand the value proposition and the ability to use the current product without depending on future integrations.

### P1 — Mixed-income taxpayer

Someone combining salary, fee receipts, freelance or contract work, or other multiple income sources. This is primary because the product aligns strongly with the need to see these elements as one annual tax situation rather than isolated pieces.

### P1 — Independent worker / honorarios

Repeated tax events, recurring uncertainty, withholding/PPM relevance and a stronger reason to project year-end consequences make this a primary segment.

### P1 — Freelance professional

Income variation and multiple work arrangements make annual projection, scenarios and preparation relevant.

### P1 — Historically unprepared taxpayer

This behavioral segment repeatedly starts organizing in March or April and maps directly to the continuous-readiness narrative.

### P2 — Advanced Excel/manual tracker

This user already recognizes the problem and has built a workaround. They are strategically valuable because they can evaluate whether PTL improves domain modeling, explainability, repeatability and maintenance versus their current method.

### Not primary in Cycle 01

- Simple dependent employee with one employer and no meaningful additional complexity.
- Investment-heavy taxpayers until support is sufficiently complete and evidenced.
- Property/rental taxpayers until support is sufficiently complete and evidenced.

### Channel / influencer

**Accountants** are not the principal ICP. They can become validators, recommenders, referral channels, professional reviewers and future collaborators. PTL must not present itself as replacing them.

### DECIDED PRIORITY

1. **P1:** mixed income.
2. **P1:** independent / honorarios.
3. **P1:** freelance professionals.
4. **P1:** historically unprepared taxpayers.
5. **P2:** advanced spreadsheet/manual users.
6. **Channel/influencer:** accountants.
7. **Later:** investments, property/rental complexity, broad simple-dependent audience.

---

## 3. Jobs To Be Done

### Functional

**JTBD-F01**  
When during the year I have income or tax-relevant information from different sources, I want to bring it into one personal view so I can understand my tax situation as a whole.

**JTBD-F02**  
When my situation changes during the year, I want to project how it could affect my annual result so I can anticipate rather than discover it only at the end.

**JTBD-F03**  
When I obtain a tax result, I want to understand where it came from so I can trust the calculation and detect incorrect assumptions.

**JTBD-F04**  
When I evaluate alternatives, I want to compare scenarios without altering my base situation so I can understand consequences before making a decision.

### Informational

**JTBD-I01** — When I see a projected annual balance, I want to know which components explain it so I do not treat it as a black box.  
**JTBD-I02** — When I have different income sources, I want to know how they interact for tax purposes instead of analyzing them independently.  
**JTBD-I03** — When I revisit information months later, I want enough context to understand what I had considered.

### Control

**JTBD-C01** — When I register personal tax information, I want to maintain control over my data and understand where it is stored and how it is used.  
**JTBD-C02** — When I model alternatives, I want to distinguish clearly between real data and simulations.  
**JTBD-C03** — When a number changes, I want to be able to explain why.

### Preparation

**JTBD-P01** — When Operación Renta approaches, I want to arrive with my situation already understood instead of reconstructing the year under pressure.  
**JTBD-P02** — While there is still time in the year, I want to detect possible tax consequences so I can prepare.

### Emotional

**JTBD-E01** — I want to feel that I understand my tax situation instead of depending on a number that appears once a year.  
**JTBD-E02** — I want to reduce the uncertainty of not knowing what result to expect.

---

## 4. Value Proposition

### Extended canonical definition

Personal Tax Ledger is a **local-first personal tax management application for people in Chile who want to understand and prepare their tax situation throughout the year**.

It lets users model relevant personal tax information, combine different income circumstances, project annual outcomes, compare scenarios and inspect how calculations were produced.

Rather than treating Operación Renta as the first moment to understand the year, PTL creates a persistent personal workspace from which the user can organize, analyze and progressively build tax readiness.

It does not replace the SII, an accountant or professional tax advice.

Its differentiation lies in giving the individual their own understandable, persistent and privacy-conscious tax model.

### Primary Value Proposition

> **Organiza y entiende tu situación tributaria personal durante el año, proyecta tu resultado y llega mejor preparado a Operación Renta.**

### ~50 words

> Personal Tax Ledger te ayuda a organizar y comprender tu situación tributaria personal durante el año. Reúne tus antecedentes relevantes, modela distintas fuentes de ingreso, proyecta resultados, compara escenarios y explica los cálculos para que Operación Renta no sea la primera vez que descubres cómo viene tu año.

### ~25 words

> Organiza tu información tributaria, proyecta tu resultado anual y entiende cómo se calcula, para llegar mejor preparado a Operación Renta.

### Canonical one-line proposition

> **Tu situación tributaria, organizada y comprensible durante todo el año.**

---

## 5. Category and Positioning

### Alternative A — Personal tax calculator

**Strength:** immediately understandable.  
**Weakness:** severely underrepresents PTL and commoditizes it around one calculation.  
**Decision:** **REJECTED as canonical category**; acceptable only as a capability descriptor.

### Alternative B — Personal tax organizer

**Strength:** easy to understand and fits fragmentation/preparation.  
**Weakness:** can sound like a document folder and undercommunicates projection, modeling and explainability.  
**Decision:** useful acquisition language, insufficient as the strategic category.

### Alternative C — Personal Tax Management / Gestión tributaria personal

**Strength:** broad enough for organization, projection, historical traceability, reconciliation, readiness, evidence and future SII integration without implying enterprise accounting.  
**Weakness:** requires explanation because users may not naturally search for this category.  
**Decision:** **canonical strategic category**.

### User-facing descriptor

> **Un espacio personal para organizar, entender y preparar tu situación tributaria.**

### Positioning Statement

> **Para personas en Chile cuya situación tributaria requiere más que esperar a Operación Renta, Personal Tax Ledger es una herramienta de gestión tributaria personal que permite organizar antecedentes, proyectar resultados, comparar escenarios y entender los cálculos durante el año. A diferencia de una calculadora puntual, una planilla aislada o la simple consulta de fuentes externas, PTL mantiene una visión personal persistente y local-first de la situación tributaria del usuario.**

---

## 6. “Tu memoria tributaria personal”

### Strengths

- memorable;
- human;
- differentiated;
- compatible with history and traceability;
- powerful for future Tax Ledger/Timeline;
- useful for communicating persistence across years.

### Weaknesses

- does not immediately explain what the application does;
- “memory” can sound passive or archival;
- undercommunicates projection, scenarios, analysis and readiness.

### Decision

**STRONG HYPOTHESIS**, not final tagline and not the sole category definition.

Recommended architecture:

- **Category:** Gestión tributaria personal.
- **Functional descriptor:** Organiza, proyecta y entiende tu situación tributaria.
- **Brand metaphor:** Tu memoria tributaria personal.

---

## 7. Differentiation

### AVAILABLE NOW

- personal rather than enterprise tax modeling;
- annual projection;
- modeling of relevant personal tax inputs including remunerations, multiple employers, fee receipts, PPM, expenses, APV and mortgage tax treatment;
- scenario comparison;
- explainable calculations;
- local-first desktop architecture;
- Microsoft Store availability and validated installation/launch on Windows.

Current differentiation:

1. PTL is designed around a person's tax situation rather than company bookkeeping.
2. The user can reason about an annual outcome rather than exclusively isolated monthly data.
3. Several relevant personal tax inputs can participate in the model.
4. Scenarios can be compared without overwriting the base situation.
5. Calculations are explainable rather than returning only an unexplained final number.
6. Local-first architecture creates a meaningful trust position for personal tax information.

### PLANNED / DIRECTION

- richer Annual Tax Workspace;
- deeper Tax Ledger / Timeline;
- Tax Data Acquisition;
- Tax Evidence Vault;
- Tax Reconciliation;
- Tax Readiness;
- Annual Tax Health;
- Tax Year Closure;
- stronger historical organization;
- SII information acquisition;
- local-vs-SII reconciliation;
- continuous monitoring;
- reserve planning;
- optimization;
- document intelligence;
- optional managed cloud capabilities.

These are product direction and **must not appear as implemented current functionality**.

### NOT A CLAIM

PTL must not currently claim that it:

- automatically obtains all information from SII;
- reconciles the user's ledger against SII automatically;
- declares taxes;
- files Form 22;
- guarantees the result;
- replaces an accountant;
- provides personalized professional tax advice;
- automatically discovers every relevant deduction;
- automatically optimizes taxes;
- continuously monitors SII;
- eliminates tax errors;
- supports every Chilean taxpayer scenario;
- provides complete investment taxation;
- provides complete rental/property tax management;
- automatically reads every document;
- provides AI tax advice;
- synchronizes all data across devices.

---

## 8. Messaging House

### Master message

> **Entiende tu situación tributaria antes de que llegue abril.**

This is a messaging device, not necessarily the final tagline.

### Pillar 1 — ORGANIZE

**Message:** Tu información tributaria deja de ser piezas aisladas.  
**Explanation:** PTL gives the user a personal workspace where relevant information forms part of one annual model.  
**Benefit:** “Puedo mirar mi situación como un todo.”

### Pillar 2 — ANTICIPATE

**Message:** No esperes a Operación Renta para saber cómo viene tu año.  
**Explanation:** annual projection and scenarios bring possible future consequences into the present.  
**Benefit:** “Puedo detectar antes un resultado que de otro modo conocería demasiado tarde.”

### Pillar 3 — UNDERSTAND

**Message:** No te quedes sólo con el número. Entiende cómo se obtuvo.  
**Explanation:** explainability is a real product differentiator.  
**Benefit:** “Puedo revisar los supuestos y entender qué afecta el resultado.”

### Pillar 4 — EXPLORE

**Message:** Compara escenarios antes de tomar decisiones.  
**Explanation:** PTL separates current information from modeled alternatives.  
**Benefit:** “Puedo evaluar consecuencias sin perder mi situación base.”

### Pillar 5 — CONTROL

**Message:** Tu información tributaria personal puede mantenerse bajo tu control.  
**Explanation:** local-first has direct trust implications.  
**Benefit:** “No necesito entregar automáticamente toda mi información a un servicio cloud para utilizar la aplicación.”

**Safety:** do not state that data never leaves the device unless every relevant feature, telemetry and network boundary has been technically verified for that exact claim.

---

## 9. Objection handling

### “Ya tengo el SII.”

Correct. PTL does not replace it. SII is an authoritative tax platform and data source. PTL addresses a different problem: maintaining your own understandable working view of your tax situation, projections and scenarios throughout the year.

**Principle:** complement, never compete semantically with the SII.

### “Mi contador ve eso.”

A professional accountant provides expertise PTL does not attempt to replace. PTL gives the individual their own organized context before, during and after that interaction. A better-informed user can also have a better conversation with an accountant.

### “Sólo hago la Operación Renta una vez al año.”

Exactly. The declaration is annual; the events that determine it are not. This asymmetry is one of the principal reasons PTL exists.

### “Lo puedo llevar en Excel.”

Yes. Excel is a highly capable general-purpose tool. PTL's value is not that spreadsheets cannot store numbers. Its value is a product model designed specifically around personal tax concepts, scenarios and explainable annual calculations. Excel should never be attacked; advanced spreadsheet users are valuable early adopters.

### “No quiero ingresar información tributaria en una aplicación.”

This concern is legitimate. The strongest current response is the local-first design. Public trust material should explain factually what is stored, where it is stored, whether an account is required, whether information is transmitted externally and how any future cloud features would be opt-in. Trust comes from architecture and documentation, not adjectives.

### “¿Esto declara mis impuestos?”

> **No. Personal Tax Ledger no presenta tu declaración ni reemplaza el SII. Te ayuda a organizar, proyectar y comprender tu situación tributaria.**

### “¿Por qué necesito esto durante el año?”

> **Porque la declaración ocurre una vez, pero los hechos que determinan tu situación tributaria ocurren durante todo el año.**

---

## 10. Message-market matrix

| Segment | Primary pain | Message | Benefit | Initial CTA concept |
|---|---|---|---|---|
| Independent / honorarios | Uncertainty about annual result | No esperes a abril para saber cómo viene tu año. | Anticipate annual result | Proyecta tu año tributario |
| Mixed income | Sources analyzed separately | Sueldo, honorarios y otros antecedentes forman una sola situación tributaria. | Unified view | Construye tu visión anual |
| Freelancer | Income varies through the year | Entiende el efecto anual de lo que estás ganando hoy. | Better anticipation | Revisa tu proyección |
| Historically unprepared | Last-minute reconstruction | Llega a Operación Renta con el año ya entendido. | Preparation | Empieza a ordenar tu año |
| Advanced Excel user | Manual model maintenance | Pasa de una planilla genérica a un modelo tributario explicable. | Domain structure + explainability | Compara PTL con tu método actual |
| Accountant / influencer | Clients arrive without context | Una herramienta para que la persona mantenga su propia información tributaria más ordenada. | Better-informed client | Evalúa PTL con un caso real |

CTA selection is not closed in Block 1. Later blocks must test acquisition and activation CTAs without redefining the core value proposition.

---

## 11. Anti-messaging

Avoid claims such as:

- “Haz tu Operación Renta con PTL.”
- “Declara tus impuestos fácilmente.”
- “Calcula exactamente cuánto pagarás.”
- “Nunca más tendrás problemas con el SII.”
- “Optimiza automáticamente tus impuestos.”
- “Paga menos impuestos.”
- “Encuentra todas tus deducciones.”
- “Reemplaza a tu contador.”
- “Todo lo que el SII sabe sobre ti en un solo lugar.”
- “PTL se conecta con el SII.”

Avoid front-loading technical language such as ledger, canonical data, reconciliation, provenance, idempotency, tax semantics, composition root, rules engine and bounded context in acquisition copy. These concepts may remain appropriate in technical documentation.

Avoid unnecessary accounting jargon in introductory messaging. Prefer **resultado anual proyectado** when accuracy allows it. Prefer **cómo se obtuvo el cálculo** over implementation-heavy terminology.

Avoid ambiguity around professional advice. PTL is informational/calculation software and does not constitute personalized tax advice or replace professional advice where circumstances require it.

Avoid tax fear. Do not manufacture acquisition pressure around audits, sanctions, penalties or threats from SII. PTL's narrative is understanding and preparation.

---

## 12. Foundational product narrative

Most people's tax situation does not suddenly appear in April. It is formed throughout the year. A salary changes. A new employer appears. Fee receipts are issued. Income changes. Payments, deductions and other relevant circumstances accumulate. But the information describing that year usually remains fragmented across systems, documents, spreadsheets and memories. Then Operación Renta arrives and people try to reconstruct what already happened.

Personal Tax Ledger exists because a person should not have to wait until that moment to understand their own tax situation. There should be a personal space where tax-relevant information can progressively become an understandable model of the year: one that can be reviewed, projected, compared and explained.

Today PTL is a local-first Windows application focused on building that personal view through tax modeling, annual projections, scenarios and explainable calculations.

Over time, that foundation can evolve toward a richer personal tax record: more history, evidence, readiness, data acquisition and reconciliation.

The destination is not simply better tax calculation. It is giving people a more continuous, understandable and controlled relationship with their own tax information.

---

## 13. Tagline shortlist

### Candidate A — “Tu situación tributaria, bajo control.”

**Strength:** simple and benefit-oriented.  
**Weakness:** “control” may overpromise completeness.  
**Status:** TO VALIDATE.

### Candidate B — “Entiende hoy cómo viene tu año.”

**Strength:** excellent anticipation message.  
**Weakness:** tax category is not explicit without context.  
**Status:** TO VALIDATE.

### Candidate C — “Tu memoria tributaria personal.”

**Strength:** strongest differentiated brand territory and excellent fit with long-term history/ledger direction.  
**Weakness:** requires a functional descriptor and can sound passive.  
**Status:** STRONG HYPOTHESIS.

### Candidate D — “Tu año tributario, más claro.”

**Strength:** accessible and credible.  
**Weakness:** less distinctive.  
**Status:** TO VALIDATE.

No final tagline is selected in Block 1.

**Provisional downstream pair**

- Functional proposition: **Tu situación tributaria, organizada y comprensible durante todo el año.**
- Brand territory: **Tu memoria tributaria personal.**

---

## 14. Critical positioning review

The product was at risk of becoming too centered on **taxes as the benefit**. The correction is not to remove tax from PTL. It is to distinguish domain, category, job, moat and moment of truth.

- **Domain:** Tax.
- **Category:** Personal Tax Management.
- **Jobs:** organize + understand + project + prepare.
- **Long-term moat:** history + traceability + reconciliation + explainability.
- **Moment of truth:** Operación Renta.

This avoids two opposite mistakes:

1. **“PTL is a tax calculator.”** Too narrow.
2. **“PTL helps organize your financial life.”** Too broad and undifferentiated.

PTL should deepen vertically in taxation rather than expand horizontally into generic personal finance.

---

## 15. Early-adopter validation hypotheses

| ID | Hypothesis | Status |
|---|---|---|
| H01 | Users with mixed income perceive enough recurring tax uncertainty to justify interacting with PTL outside Operación Renta season. | TO VALIDATE |
| H02 | “No esperes hasta abril” is more compelling than “calcula tu impuesto anual.” | TO VALIDATE — expected high |
| H03 | “Tu memoria tributaria personal” creates differentiation without making the product sound like a passive archive. | TO VALIDATE |
| H04 | Local-first materially improves willingness to try PTL. | TO VALIDATE |
| H05 | Explainability influences adoption, not only satisfaction after adoption. | TO VALIDATE |
| H06 | Scenario comparison creates repeated usage beyond a once-a-year calculation. | TO VALIDATE |
| H07 | Advanced spreadsheet users perceive PTL as an upgrade rather than duplication. | TO VALIDATE |
| H08 | Accountants perceive PTL as complementary rather than threatening or redundant. | TO VALIDATE |
| H09 | Users understand “gestión tributaria personal” without excessive explanation. | TO VALIDATE |
| H10 | Operación Renta is a strong acquisition hook while year-round readiness remains the stronger long-term positioning. | TO VALIDATE |

Fallback acquisition language for H09: **organiza y proyecta tu situación tributaria**.

---

## 16. Closed decisions for Blocks 2–8

- **D01.** PTL is not marketed as a generic personal-finance application.
- **D02.** PTL is not primarily positioned as a tax calculator.
- **D03.** Strategic category: Personal Tax Management / Gestión tributaria personal.
- **D04.** Principal product promise: organize + understand + project + prepare.
- **D05.** Canonical compact value proposition: **Tu situación tributaria, organizada y comprensible durante todo el año.**
- **D06.** Operación Renta is an important moment of truth and acquisition hook, but not the complete product definition.
- **D07.** Primary Cycle 01 ICP: people with independent, freelance or mixed income, plus taxpayers with recurring preparation problems.
- **D08.** Simple dependent taxpayers are not the primary early-adoption target.
- **D09.** Accountants are primarily influencer / validator / possible channel, not the main product user.
- **D10.** PTL will not position itself against SII, accountants or Excel. Positioning is complementary.
- **D11.** Local-first is a meaningful trust pillar and must be communicated factually rather than through unverifiable privacy superlatives.
- **D12.** Explainability is a core differentiator, not an implementation detail.
- **D13.** Future SII acquisition and reconciliation belong to strategic product direction but are excluded from present-tense claims.
- **D14.** Future automation, cloud intelligence, continuous monitoring and optimization cannot appear in current-feature messaging.
- **D15.** “Tu memoria tributaria personal” remains a strong brand territory/hypothesis, not yet the final tagline or category.
- **D16.** All later surfaces derive messaging from the canonical hierarchy below rather than independently redefining PTL.

---

## 17. Canonical Messaging Stack

### Level 1 — Category

> **Gestión tributaria personal**

### Level 2 — One-line promise

> **Tu situación tributaria, organizada y comprensible durante todo el año.**

### Level 3 — Problem

> Los hechos que determinan tu situación tributaria ocurren durante todo el año, aunque normalmente sólo la revises cuando llega Operación Renta.

### Level 4 — Solution

> PTL te permite construir una visión personal de esos antecedentes, proyectar resultados, comparar escenarios y entender los cálculos.

### Level 5 — Differentiation

> No es sólo una calculadora: mantiene un modelo tributario personal persistente, explicable y local-first.

### Level 6 — Boundary

> No declara impuestos, no reemplaza al SII y no sustituye asesoría tributaria profesional.

### Level 7 — Long-term vision

> Evolucionar desde la comprensión y proyección actual hacia una memoria tributaria personal más completa, trazable y reconciliable.

---

## 18. Definition of Done — Block 1

Block 1 is considered **v1 CLOSED** when downstream work accepts the following constraints:

- one canonical product category exists;
- one canonical value proposition exists;
- P1/P2 ICPs are known;
- current capabilities and roadmap claims are separated;
- messaging pillars are defined;
- objections have canonical responses;
- anti-messaging is explicit;
- future SII capabilities cannot leak into present-tense claims;
- Operación Renta is a hook rather than the category;
- local-first is part of the trust model;
- the personal-tax-memory concept remains available as a brand hypothesis;
- Blocks 2–8 consume this foundation instead of independently redefining PTL.

## Final status

**PREPARE / BLOCK 01 — GTM FOUNDATION v1: CLOSED WITH VALIDATION HYPOTHESES**

No early-adopter hypothesis has been promoted to fact. No future capability is represented as currently available. No downstream campaign execution belongs to this document.
