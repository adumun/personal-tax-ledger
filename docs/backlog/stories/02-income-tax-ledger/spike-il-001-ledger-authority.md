# PTL-SPIKE-IL-001 — Ledger authority and persistence model

**Status:** `DONE`  
**Decision date:** 2026-09-13  
**Question:** Should TAX-04 create a new canonical ledger store, or project canonical facts from aggregate-owned stores?

## Existing facts

Current PTL persistence already separates at least:

- `income_sources.tax_year`;
- `fee_receipts.tax_year`;
- aggregate-specific CRUD/use cases and calculations.

Block 01 established trusted annual context and explicit fact authority. Duplicating those facts into a generic ledger table would introduce dual-write consistency, migration and conflict-resolution problems before TAX-05 reconciliation even exists.

## Decision

TAX-04 uses a **canonical projection model**.

A `TaxLedgerEntry` is an immutable read projection with, at minimum:

```text
ledgerEntryId
annualWorkspaceId
commercialYear
entryKind
ownerAggregate
ownerRecordId
occurredOn / periodRef
recognitionState
amounts
counterpartySummary
provenanceSummary
updatedAt
```

The exact type-specific payload remains owned by the aggregate. The projection exposes only fields needed for unified ledger behavior.

## Ownership

Initial provider mapping:

```text
DEPENDENT_INCOME / OTHER_INCOME_SOURCE -> income_sources
DOMESTIC_FEE_INCOME                    -> fee_receipts
FOREIGN_SERVICE_INCOME                 -> pending explicit provider after IL-002 spike
```

The ledger does not own write CRUD. Actions route back to the provider/aggregate.

## Why not a generic ledger table now

Rejected for Block 02:

- duplicating salary and BHE facts;
- event-sourcing retrofit;
- replacing existing aggregate repositories with a generic row model;
- table-driven inference of tax meaning.

Those approaches would increase migration risk and blur domain ownership without improving current user value.

## Consequences

Positive:

- no dual-write source of truth;
- Block 01 year isolation remains reusable;
- specialized calculators keep their domain inputs;
- later TAX-02/TAX-03/TAX-05 can enrich provenance/status without taking fact ownership;
- ledger can grow provider-by-provider.

Constraints:

- each provider must define stable ledger identity and normalized recognition semantics;
- cross-provider totals must not erase type-specific meaning;
- generic UI actions must resolve to owning aggregate flows.

## Closed invariant

```text
ledger entry != duplicate tax fact
ledger projection -> owner aggregate
owner aggregate -> canonical mutation authority
```

Any future move to independent ledger persistence requires an explicit migration/architecture decision and cannot emerge incrementally from UI convenience.
