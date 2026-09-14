# React Shared-UI Dogfood — Current State

Status: **DOGFOOD_CONSUMED / VISUAL_VALIDATION_PENDING**

## Authority boundaries

- `platform-standards` owns `PROFILE-ENG-REACT-001` normative semantics.
- `adumun/react-components` owns canonical reusable React implementation.
- PTL owns tax/fiscal domain semantics, annual-workspace semantics, information architecture, copy, routes and product-specific styling.

PTL is the first proving consumer. It is not normative authority for the shared package.

## Current canonical consumption

The current PR head consumes an exact `@adumun/react-components` Git commit and uses shared primitives in the touched annual workspace surfaces.

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

This closes the source-level double-shell defect for the touched slice. It does not by itself satisfy visual acceptance.

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

The previous PR description stating that local `sub-tabs` were still pending is obsolete for the current head.

Both current WorkspaceView sub-navigation cases now consume canonical `Tabs`:

- annual estimation views;
- income-management views.

This changes Tabs from `IMPLEMENTED` to `DOGFOOD_CONSUMED` for the first consumer. It remains **not visually accepted** and **not stable**.

## Technical gate state

No fresh remote CI run is associated with the current PR head. Existing comments explicitly require fresh Make-wrapped validation before a green claim.

Additionally, dependency provenance must be reconciled before closure: `apps/local/web/package.json` declares the exact Git dependency on `@adumun/react-components`, while the current committed root `package-lock.json` does not yet represent that dependency in the web workspace importer. A fresh canonical bootstrap must update/verify the lockfile and the resulting change must be committed if npm resolves it differently.

Required technical gate for the exact final head:

```text
make bootstrap
make typecheck
make test-ledger-ui
make test
make build-web
make validate
```

The exact canonical targets may be consolidated, but successful execution must correspond to the final committed dependency graph.

## Mandatory visual gate

The current head remains `VISUAL_VALIDATION_PENDING`.

Required representative verification:

- desktop shell + primary navigation;
- desktop annual context/header hierarchy;
- annual overview and income surfaces using shared Tabs;
- ledger/profile sections using shared page/section/status/action primitives;
- responsive/mobile shell and key annual surfaces;
- keyboard/focus and active/current states where materially visible;
- no duplicate shell, navigation or annual-context chrome.

Persist screenshots/evidence tied to the exact accepted head. Browser-capture mechanics may use `artifact-toolkit` when convenient, but artifact-toolkit does not own React/profile semantics and cannot turn an unreviewed screenshot into acceptance.

## Stability rule

PTL can prove first-consumer adoption and visual acceptance. PTL alone cannot make a shared primitive stable.

A second independent canonical-package consumer is still required before `STABLE`. Auto-IG Posting is the recommended minimum second proof because it already supplied executable cross-consumer evidence; only a small shared slice is needed.

## Non-blocking debt

The current dogfood does not require:

- migrating every PTL control to shared UI;
- implementing a canonical Toaster/Dialog system;
- creating a generic ThemeProvider framework;
- extracting tax-domain components;
- migrating Auto-IG or KeyGo wholesale;
- inventing future capability wrappers without evidence.

Those remain follow-on work and must not be pulled into this slice merely to increase abstraction coverage.