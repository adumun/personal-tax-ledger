# PTL-TASK-IL-002 — Aggregate Projection Providers — Evidence

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Status:** IN_REVIEW  
**Date:** 2026-09-13  
**Branch:** `feat/block-02-ledger-projection-providers`

## Objective

Project existing aggregate-owned income facts into the read-only `TaxLedgerEntry` contract without introducing duplicate persistence or a second mutation authority.

## Providers

### Income source provider

`createIncomeSourceTaxLedgerProvider` reads `incomeUseCases.listIncomeSources` for the trusted annual context.

Mapping:

- owner: `INCOME_SOURCE`;
- `SALARY -> DEPENDENT_INCOME`;
- other existing source kinds -> `OTHER_INCOME_SOURCE`;
- inactive source -> `EXCLUDED`;
- active source -> `RECOGNIZED`;
- `inputMode=GROSS` populates only `amounts.gross`;
- `inputMode=NET` populates only `amounts.net`;
- withholding/PPM remain `null` because this provider does not rerun salary/APV/tax calculation.

The projection preserves source kind, input mode, frequency and taxable flag as provenance summary.

### Fee receipt provider

`createFeeReceiptTaxLedgerProvider` reads `feeReceiptUseCases.listFeeReceipts` and the existing `settings.feeRecognitionMode`.

Recognition mapping reuses the existing fee-calculation policy:

- `CANCELLED -> EXCLUDED`;
- `ISSUE_DATE + ACTIVE -> RECOGNIZED`;
- `PAID_ONLY + ACTIVE + PAID -> RECOGNIZED`;
- `PAID_ONLY + ACTIVE + PENDING -> PENDING`.

The provider preserves the canonical persisted BHE amounts directly:

- gross;
- withheld amount;
- PPM paid;
- net.

No fee amount is recalculated in the ledger provider.

## Authority boundary

Both providers expose only:

```text
list(context)
```

They do not expose `create`, `update`, `remove`, duplicate persistence or generic ledger mutation operations.

Owner aggregates remain the only write authorities.

## Annual isolation

Both providers require `AnnualWorkspaceContext` and request only `context.commercialYear` from their owner use cases. Ledger identity carries the active `annualWorkspaceId` and `commercialYear`.

## Automated evidence

`test/tax-ledger-providers.test.mjs` verifies:

1. income owner identity and no gross/net recalculation;
2. inactive income exclusion without confusing `taxable` with recognition state;
3. exact fee `ISSUE_DATE` / `PAID_ONLY` / `CANCELLED` recognition semantics;
4. canonical BHE amount/provenance preservation;
5. both providers remain strictly read-only.

## Closure gate

Canonical `make validate` remains mandatory. Until it passes, `PTL-TASK-IL-002` remains **IN_REVIEW**.
