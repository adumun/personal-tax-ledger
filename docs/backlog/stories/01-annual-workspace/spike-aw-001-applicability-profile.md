# PTL-SPIKE-AW-001 — Minimum Annual Applicability Profile

**Type:** Spike  
**Status:** DONE  
**Priority:** P0  
**Decision date:** 2026-09-12  
**Decision question:** What is the smallest annual applicability profile useful to TAX Readiness without duplicating facts owned by later capabilities?

## Conclusion

Use five user-declared tri-state dimensions (`YES | NO | UNKNOWN`) in Block 01:

1. `DEPENDENT_INCOME` — expects dependent/salary income during the commercial year.
2. `DOMESTIC_FEE_INCOME` — expects Chilean honorarios/BHE during the commercial year.
3. `FOREIGN_SERVICE_INCOME` — expects service/contractor income with a foreign payer.
4. `APV_CONTRIBUTIONS` — expects APV contributions requiring annual evidence/treatment.
5. `MORTGAGE_INTEREST` — expects a mortgage potentially relevant to annual tax treatment.

These values express applicability/expectation only. They are not evidence that an event occurred, do not carry amounts, and never override canonical facts.

## Rejected candidate dimensions

### `ACTUAL_EXPENSE_EVALUATION`

Rejected from `TaxApplicabilityProfile`. Presumed-vs-actual expense treatment is a tax strategy/election owned by the expense/calculation capabilities. It may consume income/applicability context but must not be duplicated as a generic annual applicability fact.

### `PENSION_HEALTH_INFORMATION`

Rejected from `TaxApplicabilityProfile`. AFP/health information requirements are derived from actual income/previsional facts and applicable rules. A user-declared flag would create a second authority that can drift from the ledger.

## Conflict rule

A profile answer never deletes or rewrites canonical facts. If a dimension is `NO` while canonical facts prove the situation exists, consumers must expose a `NEEDS_REVIEW` conflict. Facts remain authoritative for occurrence; the profile remains the user's expectation/applicability declaration.

## Extensibility rule

Dimensions are a versioned allowlist owned by the Annual Workspace domain contract. New dimensions require an explicit product/domain change and must satisfy all of the following:

- useful before the corresponding canonical facts necessarily exist;
- not an amount, calculation result, evidence state or reconciliation state;
- not deterministically derivable from already-canonical facts and rules;
- useful to readiness or workflow preparation;
- tri-state semantics remain meaningful.

Do not infer dimensions from table presence and do not add provider/UI-specific flags.

## Impact on AW-004 / design

`PTL-US-AW-004` and `DESIGN-AW-004` must use the five accepted dimensions above. The two rejected rows are removed. No change to the tri-state interaction model or `NEEDS_REVIEW` conflict behavior is required.

## Confidence and residual uncertainty

**Confidence:** HIGH for Block 01 and the current mixed-income dogfood case.

Residual uncertainty belongs to later TAX blocks: additional income classes or deductions may justify new dimensions after their domain contracts exist. That uncertainty does not block Block 01.

## Derived work

- update AW-004 and DESIGN-AW-004 to the five-dimension allowlist;
- keep `PTL-TASK-AW-003` responsible only for applicability persistence, not actual facts;
- preserve profile versionability in the domain/application contract.

## Evidence reviewed

- Block 01 README, Stories, design contract, enablers and implementation roadmap;
- TAX-01..12 / PTL extensions backlog and mixed-income direction;
- current year-scoped implementation (`settings.year`, `taxYear`, income, BHE, mortgage, tax parameters);
- `STD-WMS-001`, `STD-WMS-TYPES-001`, `STD-WMS-STORY-001`, `STD-WCT-001`, `STD-EXP-UIDEF-001`, `STD-EXP-UX-001`, `STD-ENG-DOC-001`.