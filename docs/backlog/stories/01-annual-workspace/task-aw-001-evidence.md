# PTL-TASK-AW-001 — Validation Evidence

**Type:** Task  
**Status:** DONE  
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

## Focused validation

An isolated Node 24-compatible module harness containing the exact new Block 01 domain/port/application contracts and the focused test scenarios passed 4/4.

Validated:

1. `2026 -> AT2027` derivation;
2. derived AT cannot become an independently accepted year value;
3. application use cases delegate a validated workspace through the repository port;
4. future lifecycle state `CLOSED` is rejected rather than invented in Block 01.

A first targeted run exposed a test/architecture mismatch after removing an unnecessary application-to-core construction dependency. The test was corrected to validate the intended boundary instead of reintroducing coupling. The corrected focused run passed 4/4.

## Canonical repository gate

The repository defines `make validate` as the canonical aggregate validation entrypoint.

A complete local checkout executed the gate successfully after fetching and switching to `feat/block-01-annual-workspace-foundation`.

Observed result:

```text
npm run typecheck --workspaces --if-present     PASS
node --test test/*.test.mjs                     PASS — 115 tests / 115 pass / 0 fail
npm run desktop:check                           PASS
npm run architecture:check                      PASS
```

Architecture output confirmed 10 internal packages, no cycles, no legacy server/web roots, core/contracts without internal dependencies, application without sqlite-adapter access, and reusable packages without legacy-root imports.

This closes the remaining validation condition. `PTL-TASK-AW-001` is therefore `DONE`.

## Scope deviations

None from `design-contract.md` or the Block 01 domain boundary.

One implementation refinement was made during review: application stopped constructing the core aggregate directly and now coordinates through the repository port, preserving the existing package boundary and avoiding an unnecessary package dependency change.

## Closure decision

`DONE`.

Closure basis:

- promised contract output delivered;
- focused behavior tests pass;
- canonical repository validation passes;
- architecture boundaries pass;
- no unresolved AW-001 implementation uncertainty remains.

## Next nodes

- `PTL-TASK-AW-002` is now READY; its SQLite migration analysis is PASS and current size is M.
- `PTL-TASK-AW-007` remains READY and can proceed in parallel.
- Critical safety chain continues with `TASK-AW-005 -> US-AW-006 -> TASK-AW-008`.