# Personal Tax Ledger — Repository Site Public Surface Decisions

**Status:** Accepted decision record; implementation deferred  
**Date:** 2026-09-07  
**Scope:** Repository website / UAT public surface  
**Implementation owner:** PTL only for product-specific facts; shared publication behavior belongs to `adumun/standard-repo-website-builder`

## Context

An external review of the Personal Tax Ledger website identified useful gaps in product trust, UX, accessibility, SEO and distribution. A subsequent internal review identified additional issues that are more structural and, in several cases, should not be solved as PTL-specific handcrafted fixes.

The purpose of this record is to preserve the accepted decisions before implementation and to establish the ownership boundary between PTL and the shared repository-site publication capability.

## Decision 1 — The repository website is a curated public projection, not a repository mirror

The published PTL website is a derived, audience-oriented public surface. It must represent the current product truth needed by its intended readers without attempting to reproduce the complete repository history, engineering journey, experiments, build evidence or internal governance mechanics.

The repository remains the canonical place for exact source files, implementation history, detailed evidence, experiments, retrospectives, decision trails and contribution work.

The website should expose the **current synthesis produced by that knowledge**, not necessarily the complete process that produced it.

Stable rule:

> Public Surface != Repository Projection

A public website must be deliberately curated from canonical repository knowledge according to audience, purpose and disclosure policy.

## Decision 2 — PTL audience priority remains user/tester first

PTL is currently a product/UAT website.

Primary public audience:

- user / external tester.

Secondary public audience:

- technically interested reader or potential contributor.

The maintainer's own engineering journey is not a public-site audience requirement.

The existing internal editorial ratio or similar implementation metadata must not be shown to the visitor. Labels such as:

- `Colaboración · 10% técnico y dominio`

are considered internal composition/governance information and must not be exposed as user-facing copy.

The public label should communicate the reader outcome only, for example `Colaboración`, `Para colaboradores` or another domain-appropriate title.

## Decision 3 — Internal composition and governance mechanics are not public content by default

Internal metadata may guide generation but must not leak into the generated user interface unless it is explicitly useful to the reader.

Examples of information that should remain internal or repository-only unless a specific public purpose exists:

- audience percentages;
- generator composition rules;
- internal publication classifications;
- build-wave terminology;
- implementation checkpoints;
- experiment identifiers;
- intermediate technical failures and workarounds;
- detailed engineering chronology.

This does not reduce traceability. It separates traceability from public communication.

## Decision 4 — Technical content may remain public when it describes the current product

Technical information is not prohibited from the PTL site. It is appropriate when it helps a reader understand the current product, its trust model, architecture, distribution or contribution path.

Examples that may remain publicly represented in synthesized form:

- local-first architecture;
- Electron boundary;
- current persistence model;
- privacy-relevant design decisions;
- current distribution model;
- high-level architecture diagrams;
- supported platform and runtime requirements;
- current contribution entry points.

The public website does **not** need to reproduce the complete implementation journey behind those conclusions.

Detailed items such as packaging retrospectives, Wine/7-Zip/Squirrel investigations, build evidence, historical alternatives, experiment logs and step-by-step engineering archaeology belong in the repository unless deliberately promoted for a specific audience need.

## Decision 5 — Public content classification will use an explicit projection class

PTL site content should eventually be classified using the following conceptual categories:

- `PUBLIC_REQUIRED` — essential to the intended public reader task;
- `PUBLIC_OPTIONAL` — useful public context, exposed when it adds value;
- `REPOSITORY_ONLY` — canonical and available to specialists in the repository, but not part of the public website projection;
- `INTERNAL_ONLY` — governance/generation metadata that must not be published.

Initial examples:

| Information | Classification |
| --- | --- |
| What PTL is and does | PUBLIC_REQUIRED |
| Product scope and non-claims | PUBLIC_REQUIRED |
| Privacy | PUBLIC_REQUIRED |
| Windows requirements and installation expectations | PUBLIC_REQUIRED |
| Current high-level architecture | PUBLIC_OPTIONAL |
| Current distribution model | PUBLIC_REQUIRED |
| Contribution entry point | PUBLIC_OPTIONAL |
| Audience percentages / editorial ratio | INTERNAL_ONLY |
| Full implementation history | REPOSITORY_ONLY |
| Packaging experiments and retrospectives | REPOSITORY_ONLY |
| Detailed build evidence | REPOSITORY_ONLY |
| Maintainer checkpoints / internal waves | INTERNAL_ONLY or REPOSITORY_ONLY depending on purpose |

## Decision 6 — Site shell consistency is a shared publication concern

The current observation that the footer is not homogeneous across pages is accepted as a real site defect.

However, the long-term correction should not be solved by repeatedly hand-editing every PTL page. Header, navigation, footer, content frame and other shared shell components are responsibilities that should be governed and rendered consistently by the repository-site builder.

PTL may provide product-specific footer facts, but the builder should own structural consistency and conformance.

Candidate conformance concern:

`WEB-LAYOUT-FOOTER-001` — all generated public pages conform to the declared footer contract.

The same principle should eventually cover shared header/navigation structure, page framing, common notices and responsive behavior.

## Decision 7 — Product-specific trust gaps remain PTL responsibilities

Some review findings are not builder responsibilities because they depend on PTL product truth and distribution decisions.

PTL remains responsible for declaring and maintaining:

- privacy truth;
- supported Windows versions / architectures;
- UAT data-handling guidance;
- canonical download/distribution channel;
- release/version information;
- SmartScreen/signing expectations;
- product screenshots and product evidence;
- accurate scope and non-claims;
- current capabilities and limitations.

The builder may validate presence and render these facts, but it must not invent them.

## Decision 8 — No implementation is authorized by this record

This record intentionally does not modify the current website.

The next activity is design and allocation of implementation responsibilities between:

1. PTL product-owned information;
2. repository-site content metadata/contracts;
3. `standard-repo-website-builder` rendering and validation behavior;
4. platform standards / conformance rules where the requirement is truly normative.

Only after that allocation is stable should PTL implementation be changed.

## Deferred implementation backlog

The following findings remain accepted but intentionally deferred until responsibility is allocated:

- homogeneous footer and common shell;
- removal of leaked editorial percentages from user-facing copy;
- curated public/repository-only technical content boundary;
- privacy publication and footer linkage;
- canonical download source and README/site consistency;
- requirements and SmartScreen guidance;
- product screenshots and explainability evidence;
- accessibility baseline improvements;
- metadata/SEO hygiene;
- eventual productization concerns such as signed installer, Microsoft Store and custom domain.

## Cross-project dependency

PTL is a reference consumer / dogfood case for `adumun/standard-repo-website-builder`.

Findings that are generic across repository websites should be implemented once in the shared capability and then adopted by PTL, rather than encoded as PTL-specific site conventions.

This record is therefore intentionally paired with the builder decision record `docs/governance/public-surface-contract-and-projection-boundaries.md` in `adumun/standard-repo-website-builder`.
