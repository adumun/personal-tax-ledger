# PTL-US-AW-006 — Strict Year Isolation — Evidence

**Type:** Story  
**Capability:** TAX-01  
**Priority:** P0  
**Status:** IN_REVIEW  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-strict-year-isolation`

## User outcome

Every create, edit, delete and calculation that is scoped to a commercial year remains unequivocally bound to the active annual workspace. A stale form/request cannot silently mutate a newly selected year.

## Acceptance evidence

### AC-01 — stale form cannot silently save into a new year

The trusted application context delivered by `PTL-TASK-AW-005` rejects a payload/entity whose year differs from the active `AnnualWorkspaceContext` before persistence.

The frontend now also requires explicit confirmation before changing from one active commercial year to another. Because the current shell does not yet maintain a single cross-module dirty-form registry, the confirmation is deliberately conservative: every real year transition warns that unsaved forms/changes from the current year will be discarded.

Cancelling raises the local `workspace_transition_cancelled` state and the transition is not started.

### AC-02 — API/application reject mismatched identity

Existing AW-005 enforcement remains canonical:

```text
AnnualWorkspaceContext.commercialYear
  != requested/input/persisted entity taxYear
  -> workspace_year_mismatch
  -> HTTP 409 when crossing HTTP boundary
  -> repository mutation is not invoked
```

### AC-03 — stale background refresh cannot replace newer state

The local web API client captures `workspaceGeneration` for workspace-scoped requests. A valid year transition increments the generation. Responses from an older generation raise `StaleWorkspaceResponseError` before React state setters receive the result.

### AC-04 — representative aggregates covered

Automated isolation evidence now explicitly covers:

- income source stale create/update/delete;
- BHE/fee receipt stale create;
- mortgage persisted in 2025 cannot be rebound through an incidental 2026 update;
- active-year tax parameter editing as an additional annual surface.

The invariant under test is that rejected cross-year mutations do not reach their repository mutation method.

### AC-05 — material operations identify commercial year

Execution-log application behavior centrally enriches audit messages with:

```text
annualWorkspaceId=<id>
commercialYear=<year>
```

This was implemented and validated under AW-005 and is reused unchanged by this Story.

## UX contract

`DESIGN-AW-006` forbids silent rebinding of open year-scoped forms. The current implementation chooses the safe conservative behavior:

```text
request switch 2025 -> 2026
  -> explicit confirmation explains unsaved changes will be discarded
  -> cancel: remain in 2025
  -> confirm: begin annual transition, increment generation, persist active year, load 2026
```

A future shell-level dirty registry may reduce confirmation frequency, but it must preserve the same safety semantics and may not reintroduce silent rebinding.

## Automated coverage added in this Story

- `test/annual-workspace-context.test.mjs`
  - BHE cross-year create rejection;
  - mortgage cross-year update/rebinding rejection;
  - existing income/race/context coverage retained.
- `test/strict-year-isolation-frontend.test.mjs`
  - explicit transition confirmation contract;
  - stale workspace generation suppression contract.

## Closure gate

Canonical repository validation remains mandatory:

```text
make validate
```

Until full validation passes, `PTL-US-AW-006` remains **IN_REVIEW**, not `DONE`.

After clean closure, the mandatory safety chain advances to `PTL-TASK-AW-008 — Block-level automated regression suite`.
