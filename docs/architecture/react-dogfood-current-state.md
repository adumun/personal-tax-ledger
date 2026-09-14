# React Shared-UI Dogfood — Current State

Status: **DOGFOOD_CONSUMED / MERGEABLE BASELINE / PRE-STABLE**

## Authority boundaries

- `platform-standards` owns `PROFILE-ENG-REACT-001` normative semantics.
- `adumun/react-components` owns canonical reusable React implementation.
- PTL owns tax/fiscal domain semantics, annual-workspace semantics, information architecture, copy, routes and product-specific styling.

PTL is the first proving consumer. It is not normative authority for the shared package.

## Current canonical consumption

The current PR head consumes the merged canonical `@adumun/react-components` baseline from exact commit `e9dff2fba8fcf3ec7d352a7c40d5d4d749bc999e` and uses shared primitives in the touched annual workspace surfaces.

Proven source-level adoption:

- `AppShell` — single application shell for the touched runtime surface;
- `PrimaryNav` — application-level navigation;
- `ContextHeader` — active annual context presentation;
- `PageHeader` — page hierarchy, including legacy workspace surfaces touched by this slice;
- `SectionCard` — shared section hierarchy;
- `StatusBadge` — shared status semantics in touched surfaces;
- `Tabs` — Estimación anual and Ingresos laborales; local `nav.sub-tabs` ownership removed;
- `Button`, `Select`, `RadioGroup`, `FormActions` — shared action/form primitives in touched annual surfaces.

`Field` exists canonically but PTL does not claim shared consumption as completed evidence until the integrated source/gate explicitly proves it.

## Double-shell and context reconciliation

`WorkspaceView` no longer owns an application shell or global sidebar. It renders as a feature/workspace surface inside the authoritative shell.

The duplicate year selector and duplicated annual-context presentation were removed from `WorkspaceView`. The active annual workspace remains the annual-context authority; settings now treats the year as context-managed rather than exposing another independent selector.

This closes the source-level double-shell defect for the touched slice.

## What intentionally stays local

- fiscal/tax concepts and labels;
- annual-workspace semantics and domain behavior;
- PTL information architecture and routes;
- ledger/profile domain composition;
- product-specific copy;
- product theme and layout styling;
- tax-domain validation and persistence consequences.

No shared primitive should gain PTL-specific props to absorb these responsibilities.

## Tabs reconciliation

Both current WorkspaceView sub-navigation cases consume canonical `Tabs`:

- annual estimation views;
- income-management views.

This establishes `Tabs` as `DOGFOOD_CONSUMED` for the first consumer. It remains **PRE-STABLE** until independent cross-consumer package adoption and compatibility review exist.

## Technical evidence and merge boundary

The canonical PTL bootstrap is `make bootstrap`, which runs `npm install`; therefore the repository can resolve the exact Git dependency declared by the web workspace and regenerate package-lock state locally.

The currently committed root `package-lock.json` predates the shared dependency and does not yet represent `@adumun/react-components` in the `apps/local/web` importer. This is a reproducibility debt for strict clean-tree / `npm ci` workflows, but it is not treated as a blocker to merging this dogfood baseline because:

1. the canonical bootstrap path is `npm install`, not `npm ci`;
2. the dependency is now pinned to an exact merged canonical commit;
3. merge does not claim package or consumer stability;
4. the lockfile must be refreshed on the next executable local bootstrap and committed before strict reproducible-install conformance is claimed.

No fresh remote CI run exists for this exact head. The ChatGPT execution environment used for this reconciliation cannot resolve GitHub/npm over the network, so local build/test commands cannot be independently executed here. This limitation is recorded explicitly and is not converted into a false PASS.

Canonical executable gate for a concrete local head remains:

```text
make bootstrap
make typecheck
make test-ledger-ui
make test
make build-web
make validate
```

## Visual evidence boundary

Source-level shell/context duplication is reconciled. Representative desktop/mobile visual acceptance remains maturity evidence, not a prerequisite for merging this pre-stable implementation baseline.

Future stability promotion should retain evidence for:

- desktop shell + primary navigation;
- annual context/header hierarchy;
- annual overview and income surfaces using shared Tabs;
- ledger/profile sections using shared page/section/status/action primitives;
- responsive/mobile shell and key annual surfaces;
- keyboard/focus and active/current states where materially visible;
- absence of duplicate shell, navigation or annual-context chrome.

## Stability rule

PTL proves first-consumer source adoption. PTL alone cannot make a shared primitive stable.

A second independent canonical-package consumer is still required before `STABLE`. Auto-IG Posting remains the recommended minimum second proof because it already supplied executable cross-consumer evidence; only a small shared slice is needed.

## Non-blocking debt

The current baseline does not require:

- migrating every PTL control to shared UI;
- implementing a canonical Toaster/Dialog system;
- creating a generic ThemeProvider framework;
- extracting tax-domain components;
- migrating Auto-IG or KeyGo wholesale;
- inventing future capability wrappers without evidence.

These remain follow-on maturity work. They do not require keeping the implementation PR open.