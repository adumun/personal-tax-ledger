# Personal Tax Ledger — Early Activation v1

**Initiative:** PTL Early Adoption & Go-To-Market — Cycle 01  
**Block:** 03 — Early Activation  
**Macrostate:** ACTIVATE  
**Status:** OPEN / EXECUTION READY  
**Date:** 2026-09-14  
**Input authority:** `docs/product/gtm/gtm-foundation-v1.md`, `docs/product/gtm/block-02-execution-status.md`

---

## 0. Executive decision

Block 03 is not a broad marketing campaign. Its purpose is to obtain the first qualified external usage signals with the smallest reasonable cohort and to learn whether the current positioning, product surface and install path are sufficient to move a relevant person from awareness to actual use.

The block therefore optimizes for **qualified contact, install attempt, first-use evidence and qualitative learning**, not reach, impressions or follower counts.

> **Activation begins when a relevant person moves from understanding PTL to trying it with enough intent to form an opinion.**

Partner Center Listing v2 optimization remains `DEFERRED_BY_PRIORITY / READY_TO_RESUME` and is not a gate for this block.

---

## 1. Objective

Create and observe a small initial cohort of users who match the Cycle 01 ICP closely enough to answer four questions:

1. Does the current message make PTL immediately understandable?
2. Is the value proposition strong enough to justify an install?
3. Can the person reach a meaningful first-use moment without founder intervention becoming the product?
4. Which problem, capability or objection most strongly predicts continued interest?

The block is successful when there is enough direct evidence to choose the next activation/message/product-learning move without guessing.

---

## 2. Scope

### IN SCOPE

- founder-led warm outreach;
- highly targeted professional outreach;
- targeted community participation where rules permit;
- accountant/professional validation as an influencer lane;
- sending qualified prospects to the canonical public landing and Microsoft Store;
- recording acquisition source manually;
- observing install attempts and first-use outcomes through explicit user confirmation/interview;
- collecting structured qualitative feedback;
- identifying friction in message → landing → Store → install → first meaningful use;
- maintaining a canonical activation evidence log.

### OUT OF SCOPE

- paid acquisition;
- broad social-media campaign calendars;
- vanity reach goals;
- influencer sponsorships;
- product redesign merely to increase campaign output;
- deep analytics infrastructure;
- invasive telemetry;
- new cloud/backend capabilities solely for marketing measurement;
- new Partner Center submission;
- claims based on future SII, cloud or AI capabilities;
- declaring product-market fit from a tiny cohort.

---

## 3. Activation model

Canonical early funnel:

```text
Qualified exposure
  → understands what PTL is
  → expresses relevance/interest
  → visits canonical landing
  → opens Microsoft Store
  → attempts install
  → launches PTL
  → reaches a meaningful product surface
  → provides observable feedback
  → optionally returns/recommends
```

### Meaningful first-use moment

For Block 03, a first-use moment is not simply launching the executable.

A user has reached meaningful first use when they have done enough to form an evidence-based opinion about at least one core PTL value pillar, for example:

- annual workspace / consolidated view;
- honorarios or mixed-income modeling;
- scenario comparison;
- calculation explainability;
- local-first/privacy value.

This can initially be confirmed by user report rather than telemetry.

---

## 4. Initial cohort

### Primary cohort

Prioritize people matching one or more of these profiles:

1. salary + honorarios / mixed income;
2. independent worker issuing fee receipts;
3. freelance professional with variable income;
4. person who repeatedly reaches Operación Renta without having organized the year;
5. advanced spreadsheet/manual tracker who can compare PTL against an existing workaround.

### Validator cohort

A smaller lane may include:

- accountants;
- tax-aware professionals;
- software/product peers capable of identifying onboarding or trust friction.

Validators must not be counted as primary-user validation unless they also match a primary ICP.

### Avoid for initial learning

Do not use close friends/family as the sole evidence base when their main motivation is helping the founder. They can test mechanics, but the activation conclusion requires people with genuine domain relevance.

---

## 5. Cycle thresholds

These are **working validation thresholds**, not growth KPIs and not claims of statistical significance.

### Minimum evidence target

- **10 qualified prospects contacted** with source recorded;
- **5 explicit install attempts**;
- **3 meaningful first-use sessions**;
- **3 structured feedback records** from primary-ICP users;
- **2 users who show continued intent**, defined as one of:
  - returning to PTL within approximately 7 days;
  - asking a substantive follow-up question;
  - importing/registering more real-like data;
  - recommending PTL to another relevant person;
  - explicitly stating they intend to keep using it.

### Interpretation

These thresholds are gates for learning quality, not success vanity metrics.

A miss is still useful if the reason is observed and attributable. For example, `5/10 understand PTL but 0 install` points to a different problem than `2/10 understand the proposition`.

---

## 6. Measurement model

No new telemetry stack is required for Block 03.

Use a manual canonical record per prospect/session.

### Required fields

- activation ID;
- date;
- acquisition source/channel;
- ICP classification;
- relationship strength: warm / professional / community / validator;
- message variant used;
- landing shared?;
- Store opened?;
- install attempted?;
- install completed?;
- launch confirmed?;
- meaningful first use reached?;
- strongest perceived value;
- primary confusion/objection;
- friction point;
- evidence type: message / call / screen share / direct observation / self-report;
- follow-up intent;
- free-form notes;
- privacy-safe evidence reference if retained.

### Derived funnel metrics

Only calculate ratios when the denominator is explicit:

- relevance rate = interested or relevant / qualified contacts;
- Store-intent rate = Store opens / qualified contacts;
- install-attempt rate = install attempts / qualified contacts;
- install-completion rate = completed installs / install attempts;
- meaningful-first-use rate = meaningful sessions / completed installs;
- feedback capture rate = structured feedback / meaningful sessions;
- continued-intent rate = continued-intent users / meaningful sessions.

Do not report conversion percentages from unknown or mixed denominators.

---

## 7. Channel priority

### A1 — Founder warm network

**Priority:** highest for speed.  
**Purpose:** obtain the first real sessions quickly from domain-relevant people.  
**Rule:** select by ICP relevance, not closeness alone.

Recommended ask:

- not “download my app to support me”;
- instead: “this is designed for people with X situation; does that describe you, and would you be willing to try it and tell me where it stops making sense?”

### A2 — Professional network

Use founder professional channels to reach mixed-income professionals, independent workers and freelancers.

The post/message should lead with the user problem, not the engineering story or Store publication milestone.

### A3 — Targeted communities

Potential communities include Chilean freelancer, independent-worker, personal-finance and tax-oriented spaces where product sharing is permitted.

Rules:

- check each community's self-promotion policy before posting;
- disclose founder relationship;
- ask for relevant testers/feedback rather than pretending to be a neutral recommendation;
- do not spam multiple communities with identical copy;
- do not make SII/accuracy/optimization claims beyond current evidence.

### A4 — Accountant / tax-professional validators

Purpose:

- validate terminology;
- identify misleading interpretations;
- identify missing context in real user workflows;
- potentially become a later referral channel.

Do not position PTL as replacing professional advice.

### A5 — Organic Microsoft Store

Treat current Store presence as ambient distribution, not a controllable Block 03 channel because Listing v2 optimization is deferred and Store traffic attribution is not currently available in the canonical measurement loop.

---

## 8. Message variants to validate

Do not invent new positioning from scratch. Validate the existing GTM hypotheses.

### M1 — Temporal readiness

> Entiende tu situación tributaria antes de que llegue abril.

Primary hypothesis: strongest general acquisition message.

### M2 — Mixed income

> Si tienes sueldo y además emites boletas, PTL te ayuda a mirar ambas cosas como una sola situación tributaria anual.

Primary hypothesis: strongest concrete ICP message.

### M3 — Explainability

> No te quedes sólo con el número: revisa cómo se construyó tu proyección tributaria.

Primary hypothesis: trust/differentiation message for analytically minded users.

### M4 — Preparation / reconstruction

> Llega a Operación Renta con el año entendido, no reconstruyéndolo a última hora.

Primary hypothesis: strongest message for historically unprepared taxpayers.

### M5 — Local-first control

> Trabaja con tu información tributaria desde una aplicación de escritorio y mantén tu workspace local bajo tu control.

Primary hypothesis: useful trust support, unlikely to be the sole acquisition hook.

---

## 9. Structured feedback protocol

After meaningful first use, capture the same core questions whenever possible:

1. Antes de probarlo, ¿qué pensabas que hacía PTL?
2. ¿Qué parte de tu propia situación hizo que te pareciera relevante —o irrelevante—?
3. ¿Qué fue lo primero que te hizo sentido dentro de la app?
4. ¿Dónde dudaste, te confundiste o sentiste que faltaba algo?
5. ¿Qué resultado o explicación te gustaría revisar durante el año?
6. Si PTL desapareciera mañana, ¿qué volverías a hacer en Excel/SII/notas/contador?
7. ¿Lo volverías a abrir? ¿Para qué y cuándo?
8. ¿A quién le dirías que PTL le puede servir?

Avoid leading questions such as “¿te gustó?” as the primary evidence.

---

## 10. Learning taxonomy

Every meaningful observation should map to one primary category:

- **MSG** — messaging/category comprehension;
- **REL** — ICP relevance;
- **TRUST** — privacy, credibility, tax-risk concerns;
- **INSTALL** — Store/download/install friction;
- **ONBOARD** — first-use/navigation/data-entry friction;
- **VALUE** — perceived product value;
- **MODEL** — missing/unclear domain modeling;
- **EXPLAIN** — calculation explainability;
- **RETENTION** — reason to return or not return;
- **REFERRAL** — willingness/reason to recommend;
- **OTHER** — uncategorized evidence requiring review.

Do not turn one person's request directly into a roadmap item. Aggregate patterns first unless the issue is a critical correctness, trust or safety defect.

---

## 11. Execution batches

### Batch A — Instrument the learning loop

- create canonical activation log structure;
- freeze fields and evidence vocabulary;
- define message IDs M1–M5;
- define ICP and learning taxonomy;
- ensure no personal tax data is copied into public GitHub issues.

### Batch B — First five qualified contacts

- select five ICP-relevant people;
- use at least two message variants;
- record reaction before helping them install;
- observe at least two sessions directly if possible.

### Batch C — Expand to ten qualified contacts

- use early evidence to choose which message/channel deserves more exposure;
- avoid changing the product after every individual comment;
- reach the minimum 10-contact evidence target.

### Batch D — Synthesis

Produce a short activation learning report containing:

- funnel counts with explicit denominators;
- strongest/weakest message signals;
- most common friction;
- top value signal;
- top trust objection;
- retention intent;
- product/backlog candidates separated from GTM fixes;
- recommendation for next block.

---

## 12. P0 execution items

| ID | Item | State |
|---|---|---|
| A3-01 | Canonical early-activation strategy | DONE SPEC |
| A3-02 | Activation evidence schema | DONE SPEC |
| A3-03 | Message variants M1–M5 | DONE SPEC |
| A3-04 | First 5 qualified prospects selected | PENDING EXECUTION |
| A3-05 | First 5 contact attempts completed | PENDING EXECUTION |
| A3-06 | First 2 observed meaningful sessions | PENDING EXECUTION |
| A3-07 | Cohort expanded to 10 qualified prospects | PENDING EXECUTION |
| A3-08 | At least 3 structured primary-ICP feedback records | PENDING EXECUTION |
| A3-09 | Continued-intent evidence for at least 2 users | PENDING EXECUTION |
| A3-10 | Activation learning synthesis | PENDING EXECUTION |

---

## 13. Block closure rule

Block 03 closes when either:

### Normal closure

The minimum evidence target is reached and an activation synthesis identifies a defensible next action.

### Learning closure

The minimum target cannot be reached, but the dominant blocker has been observed clearly enough that continuing the same activation approach would add little new information.

In both cases, the output must distinguish:

- factual evidence;
- interpretation;
- hypothesis;
- product backlog candidate;
- GTM change candidate.

---

## 14. Current state

`ACTIVATE / BLOCK_03_OPEN / STRATEGY_READY / FIRST_COHORT_PENDING`
