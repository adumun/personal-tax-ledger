# PTL as React Dogfood / Extraction Driver

## Status

ACTIVE — Personal Tax Ledger is the first dogfood consumer and extraction driver for the ADÜMÜN React profile and canonical shared React component implementation.

## Authority model

This document defines PTL's operating role; it does not redefine corporate standards.

- Normative authority: `adumun/platform-standards`, especially `PROFILE-ENG-REACT-001` and its parent Experience standards.
- Canonical shared React implementation: `adumun/react-components`.
- First dogfood / extraction driver: `adumun/personal-tax-ledger`.
- PTL domain authority remains local to PTL.

PTL MUST NOT treat local implementation convenience as authority over the shared package. Conversely, `react-components` MUST NOT absorb PTL-specific tax/domain semantics merely because PTL is the first consumer.

## Purpose

PTL is intentionally used to force shared React contracts through a real product with non-trivial navigation, annual context, forms, collections, desktop delivery and domain workflows. When PTL needs a transversal React responsibility, that need triggers cross-product discovery before a new local implementation is accepted.

This makes PTL both:

1. a consumer of canonical React components; and
2. an evidence-producing driver for extracting or refining those components.

It is not a source of truth for corporate semantics by itself.

## Mandatory operating cycle

For every material React need:

```text
PTL need
  -> classify hierarchy/responsibility
  -> search adumun/react-components
  -> if missing/incomplete, inspect relevant React implementations
  -> reconcile cross-consumer use cases
  -> define/adjust shared contract
  -> implement in adumun/react-components when transversal
  -> consume from PTL
  -> technical validation
  -> visual validation when user-facing
  -> stabilize/promote only after evidence
```

### 1. Classify responsibility

Every material component MUST be classifiable under the ADÜMÜN hierarchy:

```text
Layout -> Page -> Section -> Component -> Sub -> Micro -> Nano
```

The level is determined by responsibility, not DOM depth or visual size.

### 2. Search canonical implementation first

Before creating a local equivalent, check `adumun/react-components`.

If an existing component/capability covers the responsibility, PTL MUST consume or compose it rather than create a parallel implementation solely for styling convenience.

### 3. Cross-repository discovery before extraction

When the canonical component does not exist or is insufficient, inspect relevant React evidence before designing the new shared API.

Current priority evidence sources include, as applicable:

- Auto-IG Posting — strongest executable React seed for shared primitives, shell, routing, runtime states and responsive behavior;
- KeyGo — feature-first architecture, routing/layout boundaries, server-state and form conventions;
- Starborne Voyager — feature/shared separation in another domain;
- Project Pulse / Powerful Brain design contracts — accepted target contracts where executable React is absent;
- PTL — current consumer use case and dogfood evidence;
- any newer ADÜMÜN React product that materially exercises the same responsibility.

Discovery MUST focus on behavior and use cases, not just visual similarity.

### 4. Reconcile the contract

Before implementation, record the relevant dimensions:

- hierarchy level;
- semantic responsibility;
- public actions/props/options;
- default, loading, empty, pending, error, disabled, read-only and other material states;
- keyboard/focus/accessibility behavior;
- responsive capability preservation;
- theming/customization needs;
- product-specific content that must remain outside the shared component;
- capability-composition opportunities;
- differences or conflicts across existing consumers.

A shared component MUST be shaped by the reconciled contract, not by the JSX currently present in PTL alone.

## Shared versus local decision

### Shared in `adumun/react-components`

Use the canonical repository when the responsibility is transversal, for example:

- `AppShell`;
- navigation primitives;
- `PageHeader` / `SectionHeader`;
- `Button`, `Card`, `Dialog`, `Tabs`;
- form primitives;
- `Toaster`, alerts and state surfaces;
- `EmptyState`, `ErrorState`, retry/loading primitives;
- `FilterBar`, pagination and generic collection mechanics;
- transversal behavioral capabilities such as feedback, confirmation, permission/availability, retry or save-state semantics when their contracts stabilize.

### Local to PTL

Keep local when the responsibility carries tax/product semantics, for example:

- `IncomeLedgerPage` composition;
- tax-specific rows/forms;
- annual-workspace domain interpretation;
- SII/tax copy and rules;
- owner-aggregate actions and workflows;
- tax-specific view models.

A local component MAY compose canonical shared primitives.

## Capability composition

PTL SHOULD prefer reusable transversal capabilities over duplicated state/interaction machinery.

Illustrative capabilities include:

- `Feedbackable`;
- `Confirmable`;
- `PermissionAware`;
- `Retryable`;
- `SaveAware`;
- `ContextHelp`.

The exact implementation may be a wrapper, hook, provider, headless controller or another compositional technique. Wrapper pyramids, meaningless DOM nesting and accessibility/focus regressions are not acceptable consequences of composition.

## Visual acceptance rule

Any material user-facing change remains `VISUAL_VALIDATION_PENDING` until it is run in the user's development environment and visually reviewed.

This applies at minimum to:

- new screens/pages;
- shell/layout changes;
- new sections;
- material component or navigation changes;
- responsive changes;
- flow/state changes that alter what the user sees or does.

Automated validation is necessary but not sufficient for those changes.

## Two-repository validation for shared components

A new/refined shared component is not considered stable solely because it passes tests in `adumun/react-components`.

For PTL-driven extraction, evidence should include:

1. canonical component validation in `adumun/react-components`;
2. integrated PTL validation;
3. visual validation in PTL when material;
4. recorded known gaps or consumer-specific deviations.

## No copy/paste reuse

Copying a reusable component from Auto-IG, KeyGo, PTL or another product into PTL is not an accepted long-term reuse mechanism.

Existing product code is evidence/seed material. Shared behavior must be reconciled and implemented under `adumun/react-components` before becoming canonical.

## Current first extraction sequence

The initial PTL shell reconciliation drives this sequence:

```text
AppShell
  -> PrimaryNav
  -> ContextHeader
  -> GlobalFeedbackRegion / feedback primitives
  -> Page / Section composition
```

The purpose is to replace PTL's competing shell compositions with one authoritative application shell while preserving product-owned annual/tax context and feature routes.

## References

- `adumun/platform-standards` — `PROFILE-ENG-REACT-001`
- `adumun/react-components`
- `AGENTS.md` in this repository
- `STD-EXP-DS-001`
- `STD-EXP-UX-001`
- `STD-EXP-A11Y-001`
- `STD-EXP-UIDEF-001`
