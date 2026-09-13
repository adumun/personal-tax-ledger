# PTL-TASK-AW-007 — Supported-Year and Rule-Availability Policy — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** DONE  
**Date:** 2026-09-13  
**Branch:** `feat/block-01-supported-year-policy`

## Objective

Provide a provider-neutral policy that tells annual-workspace creation/opening whether PTL has sufficient tax-rule capability for a requested commercial year.

The policy does not infer support from UI year ranges, current calendar year, or the existence of rule-catalog seed years alone.

## States

```text
SUPPORTED
SUPPORTED_WITH_WARNINGS
UNSUPPORTED
```

### SUPPORTED

All required tax parameter keys are available for the exact commercial year and at least one rule-source/provenance record exists for that exact year.

### SUPPORTED_WITH_WARNINGS

All required operational tax parameter keys are available for the exact year, but rule provenance is absent. The application can explicitly warn instead of pretending that verification exists.

### UNSUPPORTED

One or more required tax parameter keys are absent for the exact commercial year. The result reports `missingRuleKeys`; callers must not silently substitute another year's rule set when deciding whether the year is supported.

## Important compatibility finding

`defaultTaxParameters(taxYear)` historically falls back to the 2026 seed when the requested year has no exact seed. That fallback remains an existing calculation compatibility behavior, but **AW-007 does not treat it as rule availability**.

For AnnualTaxWorkspace creation/opening, support is evaluated from exact-year persisted/configured capabilities.

With the repository's current seed data:

```text
2026 -> SUPPORTED
2027 -> UNSUPPORTED
```

This is derived from configured rule coverage, not hard-coded as a year allowlist.

## Implementation

### Core

`packages/core/src/features/annual-workspace/supported-year-policy.mjs`

- defines `TAX_YEAR_SUPPORT`;
- defines the required parameter-key allowlist from canonical `TAX_PARAMETER_KEYS`;
- evaluates availability from a provider-neutral snapshot;
- returns missing rules and warning codes suitable for later UI/API consumers.

### Application

`createSupportedYearPolicyUseCases(...)` consumes only repository contracts:

```text
TaxParameterRepository
TaxRuleSourceRepository
```

For a requested `commercialYear`, it reads exact-year parameters and source provenance, then delegates classification to Core. No SQLite/UI dependency is introduced.

## Automated evidence

`test/supported-year-policy.test.mjs` covers:

1. complete rules + provenance -> `SUPPORTED`;
2. complete rules without provenance -> `SUPPORTED_WITH_WARNINGS`;
3. missing required rule -> `UNSUPPORTED` with explicit gap;
4. real SQLite seed state distinguishes 2026 from a year with no exact rules;
5. injected repositories prove the application policy is provider-neutral.

## Canonical validation

`make validate` passed from a complete local checkout on 2026-09-13:

```text
typecheck            PASS
tests                136/136 PASS
fail                 0
desktop:check        PASS
architecture:check   PASS
```

AW-007-specific tests all passed, including the real SQLite policy distinction and the provider-neutral injected-repository scenario.

Architecture remained clean: 10 internal packages, no cycles, no legacy server/web roots, core/contracts free of internal infrastructure dependencies, application without sqlite-adapter access, and packages without legacy-root imports.

## Explicit non-goals

AW-007 does not:

- create a workspace;
- change `settings.year`;
- fetch or scrape rules at runtime;
- define an arbitrary supported year range;
- declare a year supported because `defaultTaxParameters()` can fall back to another year.

## Closure verdict

`PTL-TASK-AW-007` is **DONE**.

The policy is now a resolved input for `PTL-US-AW-002 — Create annual workspace` and may also be consumed when opening/selecting a workspace so unsupported rule capability is never hidden from the user.
