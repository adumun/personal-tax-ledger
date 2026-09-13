# PTL-TASK-AW-003 — TaxApplicabilityProfile schema and repository — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** IN_REVIEW  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-tax-applicability-profile`

## Objective

Persist the Block 01 annual applicability declaration without duplicating or mutating canonical tax facts.

Canonical invariant:

```text
Applicability profile != actual tax facts
```

## Domain contract

The profile is anchored to `annualWorkspaceId` and carries the workspace `commercialYear` for traceability. It is versioned from inception with:

```text
profileVersion = 1
```

The only accepted dimensions are the five closed by `PTL-SPIKE-AW-001`:

- `DEPENDENT_INCOME`;
- `DOMESTIC_FEE_INCOME`;
- `FOREIGN_SERVICE_INCOME`;
- `APV_CONTRIBUTIONS`;
- `MORTGAGE_INTEREST`.

Each dimension accepts only:

```text
YES | NO | UNKNOWN
```

Missing declarations normalize to `UNKNOWN`. Unknown dimensions and unsupported values are rejected rather than inferred.

## Explicit exclusions

The schema does not contain:

- amounts;
- evidence state;
- reconciliation state;
- calculated tax results;
- actual-vs-presumed expense election;
- AFP/health applicability flags.

Those concepts remain owned by their canonical downstream capabilities.

## Persistence

SQLite table:

```text
tax_applicability_profiles
  annual_workspace_id PK
  commercial_year
  profile_version
  answers_json
  updated_at
```

The record is keyed by first-class AnnualTaxWorkspace identity, not by a free-floating UI year. `answers_json` stores the versioned domain document; the allowed dimensions remain controlled by Core rather than table shape.

## Application boundary

`createTaxApplicabilityProfileUseCases(...)` provides:

- `getTaxApplicabilityProfile(context)`;
- `saveTaxApplicabilityProfile(context, answers)`.

Reads of an undeclared profile return an in-memory all-`UNKNOWN` projection without creating facts or silently persisting a profile.

Writes:

- require trusted `AnnualWorkspaceContext`;
- revalidate that the context is still active immediately before persistence when a resolver is supplied;
- persist only the applicability document.

The use case has no dependency on income, BHE, mortgage, APV or evidence repositories. Therefore setting a dimension to `NO` cannot delete or rewrite facts.

## Automated evidence

`test/tax-applicability-profile.test.mjs` covers:

1. exact five-dimension allowlist and tri-state normalization;
2. rejection of unversioned dimensions / invalid values / unsupported profile versions;
3. all-`UNKNOWN` projection for an absent profile without persistence;
4. `NO` persists declaration only and has no fact-repository dependency;
5. stale annual context blocks mutation before repository access;
6. real SQLite persistence/reload keyed by `annualWorkspaceId`.

## Boundary to PTL-US-AW-004

AW-003 intentionally does **not** implement `NEEDS_REVIEW` conflict discovery against actual facts or the user-facing tri-state editor. Those are observable Story behavior for `PTL-US-AW-004` and will consume this schema/repository.

## Closure gate

Canonical validation remains:

```text
make validate
```

Until that passes, `PTL-TASK-AW-003` remains **IN_REVIEW**.
