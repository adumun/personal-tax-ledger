# PTL-TASK-AW-005 — Trusted Workspace Context Propagation — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-trusted-workspace-context`

## Objective

Bind every mutable year-scoped operation to a trusted `AnnualTaxWorkspace` identity and prevent stale reads/writes from crossing commercial-year boundaries.

Representative failure prevented:

```text
open form in 2025
  -> switch active workspace to 2026
  -> save stale 2025 form
  -> mutation is rejected before persistence
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

Delivered behavior:

- `assertAnnualWorkspaceContext` validates annual identity;
- `createAnnualWorkspaceContext` binds an `AnnualTaxWorkspace` to the owner/local context;
- `assertContextCommercialYear` rejects requested/input years that do not match the active annual context;
- `WorkspaceContextMismatchError` exposes stable code `workspace_year_mismatch` and expected/actual years;
- `createActiveAnnualWorkspaceContextResolver` resolves the current annual workspace from `settings.year` + persisted workspace metadata on demand;
- mutations re-resolve the active context immediately before persistence, closing request races;
- HTTP exposes mismatches as `409 workspace_year_mismatch` rather than generic validation failures;
- frontend workspace generation suppresses stale async responses from an earlier active year;
- execution-log creation centrally enriches material operations with `annualWorkspaceId` and `commercialYear`;
- legacy `settings.year` switching remains compatible through idempotent metadata rematerialization without copying tax facts.

## Application-boundary isolation

Covered mutable annual domains:

- income sources;
- fee receipts;
- fee expense settings;
- mortgage loans;
- mortgage annual records;
- active-year tax parameters.

Update/delete operations load the persisted entity and verify that its existing year belongs to the active workspace. Income copy may read a prior source year, but its destination must be the active year.

`tax_rule_sources` intentionally remains outside annual-workspace ownership because it is a provider/rule catalog.

## Automated evidence

`test/annual-workspace-context.test.mjs` covers:

1. AnnualWorkspaceContext construction;
2. active context resolver observing `settings.year` changes;
3. stale 2025 input rejected under active 2026;
4. request-race revalidation before persistence;
5. update/delete of an entity belonging to another year;
6. active-year `tax_parameters` isolation;
7. execution-log annual identity enrichment;
8. HTTP 409 conflict semantics.

`test/annual-tax-workspace-sqlite.test.mjs` additionally covers compatibility materialization after a legacy `settings.year` switch on the same repository instance.

## Canonical validation

Executed from a complete local checkout of `feat/block-01-trusted-workspace-context`:

```text
make validate
  -> typecheck PASS
  -> tests 127/127 PASS
  -> failures 0
  -> desktop:check PASS
  -> architecture:check PASS
```

The architecture checker confirms 10 internal packages, no cycles, no legacy root imports, `core/contracts` free of internal dependencies, and `application` free of `sqlite-adapter` access.

## Closure verdict

`PTL-TASK-AW-005` is **DONE**.

The trusted context and stale-write/stale-response defenses are now the canonical mechanism for downstream annual isolation. `PTL-US-AW-006 — Strict year isolation` is the next mandatory node and must consume this mechanism rather than introduce another isolation path. `PTL-TASK-AW-008` remains the final block-level regression gate.
