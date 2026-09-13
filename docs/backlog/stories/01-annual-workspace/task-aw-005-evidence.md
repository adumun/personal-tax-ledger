# PTL-TASK-AW-005 — Trusted Workspace Context Propagation — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** IN_REVIEW  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-trusted-workspace-context`

## Objective

Bind every mutable year-scoped operation to a trusted `AnnualTaxWorkspace` identity and prevent stale reads/writes from crossing commercial-year boundaries.

The representative failure that this Task must prevent is:

```text
open form in 2025
  -> switch active workspace to 2026
  -> save stale 2025 form
  -> record is accidentally written into 2026
```

## Delivered contract

The generic product workspace remains separate from the annual tax workspace.

```text
WorkspaceContext
  workspaceId
  actorId

AnnualWorkspaceContext
  workspaceId
  actorId
  annualWorkspaceId
  commercialYear
```

`commercialYear` is the trusted annual identity. It is not inferred from request payload data.

### New contract behavior

- `assertAnnualWorkspaceContext` validates annual identity;
- `createAnnualWorkspaceContext` binds an `AnnualTaxWorkspace` to the owner/local context;
- `assertContextCommercialYear` rejects a year that does not match the active annual context;
- `WorkspaceContextMismatchError` exposes stable code `workspace_year_mismatch` and expected/actual years.

## Active context resolution

`createActiveAnnualWorkspaceContextResolver` resolves the active annual workspace on demand using:

```text
settings.year
  -> AnnualTaxWorkspaceRepository.getByCommercialYear(...)
  -> AnnualWorkspaceContext
```

The resolver is invoked per request rather than captured once at process startup. Therefore a legitimate year switch is observable by subsequent requests.

During Block 01 compatibility, `AnnualTaxWorkspaceRepository` reruns its additive/idempotent materialization on access. A legacy `settings.year` change can therefore materialize the new active workspace metadata without restarting the process and without copying any tax facts.

## Application-boundary isolation

Year isolation is enforced in application services, not only in React or HTTP routers.

Covered mutable annual domains:

- income sources;
- fee receipts;
- fee expense settings;
- mortgage loans;
- mortgage annual records;
- active-year tax parameters.

Rules:

1. requested/input year must equal `AnnualWorkspaceContext.commercialYear`;
2. update/delete operations also load the persisted entity and verify that its existing year belongs to the active workspace;
3. income copy may read a prior source year, but its destination must be the active year;
4. before the final mutation, application re-resolves the current active context and rejects the operation if the active workspace changed after the request began.

This second validation closes the race where a request starts under 2025 and reaches persistence only after another request switches the active year to 2026.

`tax_rule_sources` intentionally remains outside this ownership rule because it represents a provider/rule catalog, not user annual-workspace ownership.

## HTTP conflict semantics

Annual context mismatch is exposed as:

```text
HTTP 409
code = workspace_year_mismatch
fieldErrors.expectedCommercialYear
fieldErrors.actualCommercialYear
```

An unresolved active annual workspace is also an HTTP 409 using `active_workspace_not_found`.

These are conflict/recovery states, not generic validation failures.

## Stale response suppression in the frontend

The local web API client now tracks:

```text
activeCommercialYear
workspaceGeneration
```

Workspace-scoped requests capture the generation at start. When the active year changes, the generation increments immediately. A response from an older generation throws `StaleWorkspaceResponseError` instead of being returned to React state setters.

This prevents a slow 2025 response from overwriting 2026 state after a year transition.

Global/non-ownership operations such as execution-log access, supported-year listing and tax-rule-source catalog access are deliberately not generation-bound.

## Material operation traceability

Execution-log creation resolves the current AnnualWorkspaceContext and appends:

```text
annualWorkspaceId=<id>
commercialYear=<year>
```

to the audit message centrally. Call sites no longer need to remember to add the active year individually for the annual context to be traceable.

## Automated evidence added

`test/annual-workspace-context.test.mjs` covers:

1. AnnualWorkspaceContext construction;
2. active context resolver observing `settings.year` changes;
3. direct stale 2025 input rejected under active 2026;
4. request-race revalidation: request starts with 2025 context, active becomes 2026 before mutation, repository is never called;
5. update/delete of an entity belonging to another year is blocked;
6. active-year `tax_parameters` cannot be edited across workspace boundaries;
7. execution logs include annual workspace identity/year;
8. `workspace_year_mismatch` maps to HTTP 409.

`test/annual-tax-workspace-sqlite.test.mjs` additionally covers compatibility materialization after a legacy `settings.year` switch on the same repository instance.

Existing application/package/consumer smoke tests were updated to use explicit annual context where they directly exercise year-scoped application use cases.

## Architecture boundary

The implementation preserves the established package direction:

```text
contracts
  -> context/error semantics only

application
  -> year/workspace validation and active-context revalidation

http-api
  -> per-request context resolution + conflict mapping

sqlite-adapter
  -> annual metadata persistence/materialization

local web
  -> stale-response generation suppression
```

Tax Core remains free of HTTP, SQLite and UI concerns.

## Validation state

The code and focused evidence are persisted on the feature branch, but canonical repository validation has **not yet been claimed**.

Closure gate:

```text
make validate
```

from a complete checkout of `feat/block-01-trusted-workspace-context`.

Until that passes, `PTL-TASK-AW-005` remains **IN_REVIEW**, not `DONE`.

## Next node after clean closure

`PTL-US-AW-006 — Strict year isolation`.

AW-006 should consume this trusted context rather than invent a second isolation mechanism. `PTL-TASK-AW-008` remains the final block-level regression gate.
