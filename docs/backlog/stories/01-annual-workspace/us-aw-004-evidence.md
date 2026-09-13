# PTL-US-AW-004 — Applicability Profile — Evidence

**Type:** Story  
**Capability:** TAX-01  
**Priority:** P0  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-applicability-profile-ui`

## User outcome implemented

The active Annual Workspace exposes the five-dimension applicability profile defined by `PTL-SPIKE-AW-001` with explicit tri-state answers:

```text
YES | NO | UNKNOWN
```

Visible copy renders these as `Sí | No | Aún no sé`. The editor states explicitly that the profile does not register amounts and does not prove that a situation occurred.

## Acceptance evidence

- **AC-01:** all five accepted dimensions render accessible `Sí`, `No`, `Aún no sé` controls.
- **AC-02:** `UNKNOWN` projects to `PENDING`; it is not validation failure and is never inferred to YES/NO.
- **AC-03:** profile edits persist only the declaration document and never delete canonical facts.
- **AC-04:** a dimension projects `NEEDS_REVIEW` only when `profile answer = NO` and canonical fact presence is `PRESENT`. The saved profile remains `NO`; facts remain untouched.
- **AC-05:** the persisted versioned profile remains reusable as a future prior-year proposal; AW-004 itself performs no copying.
- **AC-06:** declarations and canonical fact presence remain separate fields, so downstream consumers cannot treat profile answers as proof of occurrence.

Current conservative presence providers:

- `DEPENDENT_INCOME` — persisted salary source;
- `DOMESTIC_FEE_INCOME` — persisted BHE/fee receipt;
- `APV_CONTRIBUTIONS` — positive persisted APV A/B contribution on income source;
- `MORTGAGE_INTEREST` — persisted mortgage;
- `FOREIGN_SERVICE_INCOME` — `UNAVAILABLE` until a canonical provider exists.

`UNAVAILABLE` never invents a conflict.

## Architecture

Conflict detection is a separate application projection: `createTaxApplicabilityProfileReviewUseCases(...)`. AW-003 persistence remains independent from income/BHE/mortgage/APV repositories.

HTTP contract:

```text
GET /api/annual-workspace/applicability-profile
PUT /api/annual-workspace/applicability-profile
```

The web surface is `ApplicabilityProfileSection` under active Annual Workspace context and reloads whenever `commercialYear` changes.

## Canonical validation

`make validate` executed from a complete local checkout on 2026-09-13:

- typecheck: PASS;
- tests: **164/164 PASS, 0 fail**;
- `desktop:check`: PASS;
- `architecture:check`: PASS.

AW-004-specific tests validated exact tri-state copy, no monetary inputs, explicit `NEEDS_REVIEW`, annual-context reload, explicit annual profile endpoint, `UNKNOWN -> PENDING`, `NO + PRESENT -> NEEDS_REVIEW`, `UNAVAILABLE` without invented conflict, and conflict recalculation after save.

`PTL-US-AW-004` is **DONE**. Next P0 slice: `PTL-TASK-AW-006 + PTL-US-AW-005 — Annual Workspace Overview`.
