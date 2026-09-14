# Block 02 — Enablers, Spikes & Dependencies

**Status:** `IMPLEMENTING / DOMESTIC+FACTUAL SLICES CLOSED / SPIKE-IL-002 DECISION_PROPOSED`

## Spikes

### PTL-SPIKE-IL-001 — Ledger authority and persistence model

**Status:** DONE

Decision: TAX-04 is a canonical projection over aggregate-owned facts; no duplicate generic ledger store is introduced.

Evidence: [`spike-il-001-ledger-authority.md`](spike-il-001-ledger-authority.md).

---

### PTL-SPIKE-IL-002 — Foreign-service recognition and FX provenance

**Status:** DECISION_PROPOSED  
**Priority:** P1

The spike now closes the previously open dimensions with an explicit two-path model:

```text
foreign payer
  -> service source jurisdiction
     -> CHILE
        -> canonical BHE / fee_receipts fact
        -> FX payment is settlement provenance only
     -> FOREIGN
        -> foreign_service_income
        -> perception-based recognition
        -> frozen CLP conversion snapshot with BCCh provenance
```

Key proposed decisions:

- `foreign payer != foreign-source income`;
- source jurisdiction and payer country are separate fields;
- genuine foreign-source honoraria are recognized on perception;
- original amount/currency are immutable factual identity;
- CLP conversion uses an auditable conversion snapshot rather than live revaluation;
- BCCh is the initial official FX authority;
- no silent weekend/holiday previous-business-day assumption;
- unresolved conversion remains `PENDING / NEEDS_REVIEW`;
- manual FX is allowed only with explicit source/reference/reason;
- corrections preserve append-only conversion provenance;
- a CLP BHE plus foreign-currency payment never produces two ledger income facts;
- foreign tax paid/withheld may be captured factually, but article 41 A credit calculation is outside Block 02.

Decision evidence: [`spike-il-002-foreign-service-recognition-fx.md`](spike-il-002-foreign-service-recognition-fx.md).

The spike becomes `DONE` when these decisions are accepted and the dependent story/design/task contracts are reconciled.

## Enabling Tasks

### PTL-TASK-IL-001 — TaxLedgerEntry projection contract

**Status:** DONE  
Evidence: [`task-il-001-evidence.md`](task-il-001-evidence.md).

---

### PTL-TASK-IL-002 — Aggregate projection providers

**Status:** DONE  
Evidence: [`task-il-002-evidence.md`](task-il-002-evidence.md).

---

### PTL-TASK-IL-003 — Annual ledger query/read model

**Status:** DONE  
Evidence: [`task-il-003-evidence.md`](task-il-003-evidence.md).

---

### PTL-TASK-IL-004 — Ledger HTTP/client surface

**Type:** Task  
**Role:** ENABLER  
**Priority:** P0  
**Size:** S  
**Status:** DONE

Closed implementation preserves a read-only annual ledger surface and no generic mutation authority.

Evidence: [`task-il-004-evidence.md`](task-il-004-evidence.md).

---

### PTL-TASK-IL-005 — Foreign-service provider/value contract implementation

**Type:** Task  
**Role:** ENABLER  
**Priority:** P1  
**Size:** L  
**Status:** BLOCKED_BY_SPIKE_DECISION_ACCEPTANCE

Target implementation after spike acceptance:

- dedicated `foreign_service_income` aggregate for genuinely foreign-source honoraria;
- append-only `foreign_service_fx_conversions` provenance;
- BCCh-backed conversion provider contract;
- `FOREIGN_SERVICE_INCOME` ledger projection only for the genuine foreign-source path;
- BHE-linked foreign settlement remains attached to `fee_receipts` and does not create a second ledger row;
- explicit `PENDING / NEEDS_REVIEW` when conversion cannot be safely resolved.

---

### PTL-TASK-IL-006 — Block-level regression suite

**Type:** Task  
**Role:** QUALITY_ENABLER  
**Priority:** P0  
**Size:** M  
**Status:** NOT_READY_FOR_CLOSURE

Terminal Block 02 regression gate. It must prove projection-only ledger semantics, stable owner identity, annual isolation/stale protection, non-duplicated salary/APV semantics, preserved BHE recognition semantics, traceable totals, and the accepted foreign-service behavior.

## Dependency graph

```mermaid
flowchart LR
  S1[SPIKE-IL-001\nDONE] --> T1[TASK-IL-001\nDONE]
  T1 --> T2[TASK-IL-002\nDONE]
  T2 --> T3[TASK-IL-003\nDONE]
  T3 --> T4[TASK-IL-004\nDONE]
  T4 --> U1[US-IL-001\nDONE]
  U1 --> U2[US-IL-002\nDONE]
  U1 --> U3[US-IL-003\nDONE]
  U1 --> U6[US-IL-006\nDONE]
  T3 --> U5[US-IL-005\nDONE]
  S2[SPIKE-IL-002\nDECISION_PROPOSED] --> T5[TASK-IL-005]
  T5 --> U4[US-IL-004]
  U1 --> T6[TASK-IL-006]
  U2 --> T6
  U3 --> T6
  U4 --> T6
  U5 --> T6
  U6 --> T6
```

## Current critical path

```text
PTL-SPIKE-IL-002 decision acceptance
  -> PTL-TASK-IL-005 foreign-service provider/value contract
  -> PTL-US-IL-004 foreign payer / foreign-source flow
  -> PTL-TASK-IL-006 terminal regression / DoD
  -> Block 02 CLOSED
```
