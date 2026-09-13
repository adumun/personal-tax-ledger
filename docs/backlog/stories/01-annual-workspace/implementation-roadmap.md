# Block 01 — Annual Workspace — Implementation Roadmap

**Status:** `GO / TERMINAL REGRESSION GATE IN REVIEW`  
**Date:** 2026-09-13  
**Scope:** `Block 01 — Annual Workspace & Tax Profile`

## Objective

Replace the implicit/global year setting with a first-class `AnnualTaxWorkspace` that becomes the visible, persistent and safe parent context for later TAX capabilities while preserving current behavior.

## Current validated baseline

- `PTL-SPIKE-AW-001` — DONE; five-dimension applicability allowlist closed.
- `PTL-TASK-AW-001` — DONE; `make validate` 115/115.
- `PTL-TASK-AW-002` — DONE; `make validate` 118/118.
- `PTL-TASK-AW-005` — DONE; `make validate` 127/127.
- `PTL-US-AW-006` — DONE; `make validate` 131/131.
- `PTL-TASK-AW-007` — DONE; `make validate` 136/136.
- `PTL-US-AW-001 + PTL-US-AW-002` — DONE; `make validate` 149/149.
- `PTL-TASK-AW-003` — DONE; `make validate` 155/155.
- `PTL-US-AW-004` — DONE; `make validate` 164/164.
- `PTL-TASK-AW-006 + PTL-US-AW-005` — DONE; `make validate` 169/169, desktop/architecture PASS.
- `PTL-TASK-AW-004 + PTL-US-AW-003` — DONE; canonical rerun PASS after reconciling the obsolete AW-002 frontend assertion.

## Terminal Block 01 gate — AW-008

`PTL-TASK-AW-008` is implemented on `chore/block-01-terminal-regression-gate` and remains **IN_REVIEW** until a fresh canonical `make validate` passes.

The new `test/block-01-regression.test.mjs` is intentionally cross-feature rather than a duplicate of every Story suite. It verifies the composition-level invariants most likely to regress across feature boundaries:

1. explicit AnnualWorkspace authority, duplicate protection and unsupported-year blocking;
2. stale mutation rejection after active year changes;
3. applicability declaration remains subordinate to canonical facts (`NO + PRESENT => NEEDS_REVIEW`);
4. Annual Workspace Overview remains structural and excludes tax-result/readiness/SII/optimization semantics;
5. prior-year initialization stays allowlisted, auditable and idempotent.

Specialized suites remain responsible for SQLite migration/materialization, frontend stale-response suppression, rollback failure paths, adapter persistence and UI-specific contracts.

## Critical safety chain

```text
PTL-TASK-AW-001 [DONE]
        ↓
PTL-TASK-AW-005 [DONE]
        ↓
PTL-US-AW-006   [DONE]
        ↓
PTL-TASK-AW-008 [IN REVIEW / TERMINAL QUALITY GATE]
```

## Established technical invariants

- `commercialYear` is canonical; AT/Operación Renta is derived.
- `settings.year` remains a compatibility active-year pointer, not the visible workspace catalog.
- `AnnualTaxWorkspace` metadata is first-class and persistent.
- mutable annual operations consume trusted `AnnualWorkspaceContext` and revalidate active context before persistence.
- frontend generation suppresses stale annual responses.
- exact-year rule availability governs workspace selection/creation support.
- empty workspace creation copies no transactional facts.
- `TaxApplicabilityProfile` is expectation/applicability only and is versioned independently of canonical facts.
- `NO + canonical fact PRESENT => NEEDS_REVIEW`; facts remain authoritative.
- Annual Workspace Overview is structural only and contains no tax outcome/readiness/SII/optimization semantics.
- prior-year initialization is explicit, allowlisted, auditable and non-transactional.

## Canonical evidence

- [`spike-aw-001-applicability-profile.md`](spike-aw-001-applicability-profile.md)
- [`sqlite-migration-assessment.md`](sqlite-migration-assessment.md)
- [`task-aw-001-evidence.md`](task-aw-001-evidence.md)
- [`task-aw-002-evidence.md`](task-aw-002-evidence.md)
- [`task-aw-003-evidence.md`](task-aw-003-evidence.md)
- [`task-aw-004-evidence.md`](task-aw-004-evidence.md)
- [`task-aw-005-evidence.md`](task-aw-005-evidence.md)
- [`task-aw-006-evidence.md`](task-aw-006-evidence.md)
- [`task-aw-007-evidence.md`](task-aw-007-evidence.md)
- [`task-aw-008-evidence.md`](task-aw-008-evidence.md)
- [`us-aw-001-evidence.md`](us-aw-001-evidence.md)
- [`us-aw-002-evidence.md`](us-aw-002-evidence.md)
- [`us-aw-003-evidence.md`](us-aw-003-evidence.md)
- [`us-aw-004-evidence.md`](us-aw-004-evidence.md)
- [`us-aw-005-evidence.md`](us-aw-005-evidence.md)
- [`us-aw-006-evidence.md`](us-aw-006-evidence.md)
- [`enablers-and-dependencies.md`](enablers-and-dependencies.md)

## Decision

`GO / IN_REVIEW` for `PTL-TASK-AW-008`. A green canonical validation is now the only remaining requirement to close Block 01.
