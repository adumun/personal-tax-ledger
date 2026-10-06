# PTL-US-AW-006 — Strict Year Isolation — Evidence

**Type:** Story  
**Capability:** TAX-01  
**Priority:** P0  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-strict-year-isolation`

## User outcome

Every create, edit, delete and calculation that is scoped to a commercial year remains unequivocally bound to the active annual workspace. A stale form/request cannot silently mutate a newly selected year.

## Acceptance evidence

### AC-01 — stale form cannot silently save into a new year

The trusted application context delivered by `PTL-TASK-AW-005` rejects a payload/entity whose year differs from the active `AnnualWorkspaceContext` before persistence.

The frontend additionally requires explicit confirmation before changing from one active commercial year to another. Because the current shell does not yet maintain a single cross-module dirty-form registry, confirmation is deliberately conservative: every real year transition warns that unsaved forms/changes from the current year will be discarded.

Cancelling leaves the current year active and the transition is not started.

### AC-02 — API/application reject mismatched identity

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

Automated isolation evidence explicitly covers:

- income source stale create/update/delete;
- BHE/fee receipt stale create;
- mortgage persisted in 2025 cannot be rebound through an incidental 2026 update;
- active-year tax parameter editing as an additional annual surface.

Rejected cross-year mutations do not reach their repository mutation method.

### AC-05 — material operations identify commercial year

Execution-log application behavior centrally enriches audit messages with:

```text
annualWorkspaceId=<id>
commercialYear=<year>
```

## UX contract

`DESIGN-AW-006` forbids silent rebinding of open year-scoped forms. Current safe behavior is:

```text
request switch 2025 -> 2026
  -> explicit confirmation explains unsaved changes will be discarded
  -> cancel: remain in 2025
  -> confirm: begin annual transition, increment generation, persist active year, load 2026
```

A future shell-level dirty registry may reduce confirmation frequency, but must preserve the same safety semantics.

## Automated coverage

- `test/annual-workspace-context.test.mjs`
  - income stale/race/context coverage;
  - BHE cross-year create rejection;
  - mortgage cross-year update/rebinding rejection.
- `test/strict-year-isolation-frontend.test.mjs`
  - explicit transition confirmation contract;
  - stale workspace generation suppression contract.

## Canonical validation

Executed from a complete checkout of `feat/block-01-strict-year-isolation`:

```text
make validate
  -> typecheck PASS
  -> tests 131/131 PASS
  -> fail 0
  -> desktop:check PASS
  -> architecture:check PASS
```

Architecture verification remains clean: 10 internal packages, no cycles, no legacy server/web roots, core/contracts preserve their dependency boundary, and application does not access `sqlite-adapter`.

`PTL-US-AW-006` is therefore **DONE**.

## Next block-level gate

The mandatory safety chain now reaches `PTL-TASK-AW-008 — Block-level automated regression suite`. However, AW-008 is the final block-level quality gate and cannot be declared ready for closure until its still-unimplemented inputs exist: select/create workspace, supported-year policy, applicability profile, prior-year initialization, and workspace overview.
