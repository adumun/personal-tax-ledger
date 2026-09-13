# PTL-TASK-IL-001 — TaxLedgerEntry Projection Contract — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** IN_REVIEW  
**Date:** 2026-09-13  
**Branch:** `docs/block-02-income-tax-ledger-refinement`

## Objective

Establish the provider-neutral, read-only canonical projection contract that allows TAX-04 to compose aggregate-owned facts without creating a second source of truth.

## Core contract

Added `packages/core/src/features/ledger/tax-ledger-entry.mjs`.

Initial closed enums:

```text
entryKind
  DEPENDENT_INCOME
  DOMESTIC_FEE_INCOME
  OTHER_INCOME_SOURCE

ownerAggregate
  INCOME_SOURCE
  FEE_RECEIPT

recognitionState
  RECOGNIZED
  PENDING
  EXCLUDED
```

`FOREIGN_SERVICE_INCOME` is intentionally absent from the executable enum until `PTL-SPIKE-IL-002` closes recognition/FX provenance.

## Entry identity and projection fields

`TaxLedgerEntry` normalizes:

- `ledgerEntryId`;
- `annualWorkspaceId`;
- `commercialYear`;
- `entryKind`;
- `ownerAggregate`;
- `ownerRecordId`;
- optional `occurredOn` plus required `periodRef`;
- factual `recognitionState`;
- amounts with explicit currency and nullable gross/withholding/ppm/net;
- counterparty summary;
- provenance summary hook;
- `updatedAt`.

The projection is immutable.

## Read-only provider port

Added `TaxLedgerProvider` contract with exactly one required operation:

```text
list(context)
```

No generic ledger create/update/remove contract exists. Mutation authority remains with owner aggregates.

## Safety boundaries

- no infrastructure dependency in Core;
- no generic ledger persistence introduced;
- no readiness/reconciliation state vocabulary in recognition state;
- no negative projected amounts;
- no foreign-service support silently inferred;
- missing amounts remain `null`, not invented as zero.

## Automated evidence

`test/tax-ledger-entry.test.mjs` verifies:

1. annual/owner identity and immutability;
2. exact supported initial kinds/owners;
3. amount/currency normalization with nullable absence;
4. factual recognition vocabulary excludes readiness/reconciliation;
5. provider contract is read-only and requires `list`.

## Closure gate

Canonical `make validate` remains mandatory. Until it passes, `PTL-TASK-IL-001` remains **IN_REVIEW**.
