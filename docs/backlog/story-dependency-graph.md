# PTL — Cross-Block Story Dependency Graph

**Status:** `DERIVED / BLOCKS 01-02`  
**Date:** 2026-09-13

This view derives dependencies across refined blocks. Canonical definitions remain in each block directory.

## Current graph

```mermaid
flowchart LR
  subgraph B01[Block 01 — Annual Workspace & Tax Profile — CLOSED]
    AW1[US-AW-001\nSelect workspace]
    AW2[US-AW-002\nCreate workspace]
    AW3[US-AW-003\nPrior-year init]
    AW4[US-AW-004\nApplicability profile]
    AW5[US-AW-005\nWorkspace overview]
    AW6[US-AW-006\nYear isolation]
  end

  subgraph B02[Block 02 — Income & Tax Ledger — REFINED]
    IL1[US-IL-001\nUnified annual ledger]
    IL2[US-IL-002\nDependent income]
    IL3[US-IL-003\nDomestic BHE]
    IL4[US-IL-004\nForeign service income]
    IL5[US-IL-005\nFactual annual position]
    IL6[US-IL-006\nTraceability / authority]
  end

  AW1 --> IL1
  AW6 --> IL1
  AW6 --> IL2
  AW6 --> IL3
  AW4 --> IL1
  IL1 --> IL2
  IL1 --> IL3
  IL1 --> IL5
  IL1 --> IL6
  IL6 --> IL4
```

## Material cross-block contracts

### Block 01 -> Block 02

Block 02 consumes, and must not redefine:

- `AnnualTaxWorkspace` identity;
- `commercialYear` as canonical year;
- derived Operación Renta label;
- trusted `AnnualWorkspaceContext`;
- stale/cross-year mutation rejection;
- applicability profile semantics where profile remains distinct from facts.

### Block 02 -> later blocks

Block 02 will become the factual input surface for:

- Block 03 evidence/acquisition attachment and candidate-to-fact workflows;
- Block 06 calculation/explainability;
- Block 07 projection/optimization;
- Block 08 SII reconciliation;
- Block 09 readiness/annual health/closure.

Those edges remain prospective until their destination blocks are refined.

## Current executable dependency path

```text
Block 01 CLOSED
 -> SPIKE-IL-001 DONE
 -> TASK-IL-001 READY
 -> TASK-IL-002
 -> TASK-IL-003
 -> TASK-IL-004
 -> US-IL-001 + US-IL-006
```

No temporal critical-path duration is asserted yet because comparable estimates do not exist across all active nodes.
