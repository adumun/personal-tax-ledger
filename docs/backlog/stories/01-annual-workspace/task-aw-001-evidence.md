# PTL-TASK-AW-001 — Validation Evidence

**Type:** Task  
**Status:** IN_REVIEW  
**Date:** 2026-09-12  
**Branch:** `feat/block-01-annual-workspace-foundation`  
**PR:** `#11`

## Output delivered

- pure `AnnualTaxWorkspace` domain contract in `@personal-tax-ledger/core`;
- canonical `commercialYear` with derived `AT{commercialYear + 1}` label;
- minimal lifecycle vocabulary limited to `PREPARING` for Block 01;
- optional `ruleVersionRef` without coupling to SQLite/HTTP/UI;
- repository port in `@personal-tax-ledger/contracts`;
- port-neutral application use cases in `@personal-tax-ledger/application`;
- focused contract tests.

## Architecture review

Reviewed against the repository's real `scripts/architecture-check.mjs` policy.

Relevant boundary:

```text
application -> contracts/core allowed by architecture
application -> sqlite-adapter forbidden
core/contracts -> no internal package dependencies
```

The implementation keeps `core` free from SQLite/UI/HTTP details. Application coordination currently depends only on `contracts`; domain construction/validation remains in `core`.

## Targeted validation

Executed an isolated Node 24-compatible module harness containing the exact new Block 01 domain/port/application contracts and the focused test scenarios.

Result:

```text
TAP version 13
1..4
# tests 4
# pass 4
# fail 0
```

Validated:

1. `2026 -> AT2027` derivation;
2. derived AT cannot become an independently accepted year value;
3. application use cases delegate a validated workspace through the repository port;
4. future lifecycle state `CLOSED` is rejected rather than invented in Block 01.

A first targeted run exposed a test/architecture mismatch after removing an unnecessary application-to-core construction dependency. The test was corrected to validate the intended boundary instead of reintroducing coupling. The second run passed 4/4.

## Canonical repository gate

The repository defines `make validate` as the canonical aggregate validation entrypoint (`typecheck`, tests, desktop check and architecture check).

No GitHub Actions workflow run was available for PR `#11`, and the current execution environment does not have a complete repository checkout, so the full repository-wide `make validate` has **not** been claimed as executed.

This is why `PTL-TASK-AW-001` remains `IN_REVIEW`, not `DONE`, despite the focused tests passing.

## Remaining closure condition

Before clean closure/merge:

```text
make validate
```

must pass from a complete checkout (or equivalent repository execution environment), with any resulting regression fixed in the same PR.

## Scope deviations

None from `design-contract.md` or the Block 01 domain boundary.

One implementation refinement was made during review: application stopped constructing the core aggregate directly and now coordinates through the repository port, preserving the existing package boundary and avoiding an unnecessary package dependency change.

## Next nodes

- `PTL-TASK-AW-007` remains READY and can proceed in parallel inside Wave A.
- `PTL-TASK-AW-002` remains blocked on clean closure of `PTL-TASK-AW-001`; its migration analysis is already PASS and its current size is M.
- Critical safety chain after AW-001: `TASK-AW-005 -> US-AW-006 -> TASK-AW-008`.