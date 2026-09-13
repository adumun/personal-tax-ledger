# PTL-TASK-AW-008 — Block-Level Automated Regression Suite — Evidence

**Type:** Task  
**Role:** QUALITY_ENABLER  
**Priority:** P0  
**Status:** IN_REVIEW  
**Date:** 2026-09-13  
**Branch:** `chore/block-01-terminal-regression-gate`

## Objective

Close Block 01 with an explicit cross-feature regression gate after every functional Story and enabling Task has been implemented and independently validated.

AW-008 adds no feature semantics. It verifies that the contracts established by AW-001 through AW-007 and US-AW-001 through US-AW-006 continue to compose safely.

## Consolidated regression suite

`test/block-01-regression.test.mjs` adds five cross-feature terminal scenarios:

1. **Annual authority / support / duplicate safety**
   - missing workspace is not materialized by selection;
   - duplicate creation is rejected;
   - unsupported exact year cannot become active.

2. **Strict stale-write isolation**
   - a mutation opened under 2025 is rejected if 2026 became active;
   - stale mutation never reaches persistence.

3. **Applicability profile vs canonical facts**
   - `NO + PRESENT => NEEDS_REVIEW`;
   - the saved declaration remains `NO` and does not override facts.

4. **Overview hard boundary**
   - period/profile/information/rules remain structural;
   - absent data remains structural zero-count state;
   - refund/payment/liability/readiness/Tax Health/SII/optimization semantics are absent.

5. **Prior-year initialization safety**
   - only `APPLICABILITY_PROFILE` is reusable in Block 01;
   - forbidden fact/evidence categories remain explicit;
   - copied proposal is rebound to target workspace/year;
   - provenance is persisted;
   - identical repeat is idempotent.

## Existing specialized coverage retained

The terminal suite complements rather than replaces specialized tests already covering:

- SQLite implicit-year materialization/migration;
- frontend generation/stale response suppression;
- duplicate/unsupported/warning workspace behavior;
- SQLite profile persistence;
- conflict projection providers;
- overview UI copy and annual reload;
- prior-year rollback after partial failure;
- SQLite initialization provenance;
- architecture boundaries and desktop syntax checks.

## DoD review

At implementation time:

- all functional Stories `PTL-US-AW-001..006` are DONE;
- all enabling Tasks `PTL-TASK-AW-001..007` are DONE;
- the Block 01 dependency graph has no remaining functional blocker;
- `commercialYear` remains canonical and Operación Renta derived;
- no cross-year rebinding path is intentionally permitted;
- prior-year reuse remains explicit/allowlisted and non-transactional;
- overview remains outside tax outcome/readiness/reconciliation semantics.

## Closure gate

Canonical closure still requires a fresh full run from this branch:

```text
make validate
```

Until that gate is green, `PTL-TASK-AW-008` and Block 01 remain **IN_REVIEW**.
