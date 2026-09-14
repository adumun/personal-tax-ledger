# PTL GTM Cycle 01 — Block 03 Execution Status

**Block:** 03 — Early Activation  
**Macrostate:** ACTIVATE  
**Status:** OPEN / BATCH B QUALIFICATION IN PROGRESS  
**Date:** 2026-09-14

## Block entry condition

Block 02 is closed for the active cycle. Microsoft Partner Center Listing v2 optimization is intentionally deferred by product-owner priority and is not a gate for Block 03.

Canonical strategy:

```text
docs/product/gtm/early-activation-v1.md
```

## Objective

Obtain the first qualified external usage signals and determine whether current positioning, conversion surface and product experience can move relevant users from awareness to meaningful first use.

## Minimum evidence target

- 10 qualified prospects contacted;
- 5 explicit install attempts;
- 3 meaningful first-use sessions;
- 3 structured feedback records from primary-ICP users;
- 2 users showing continued intent.

These are learning thresholds, not growth KPIs.

## Batch A — Instrument the learning loop: CLOSED

Completed:

- activation funnel defined;
- meaningful-first-use definition established;
- initial cohort/validator cohort separated;
- manual evidence schema defined;
- derived metrics defined with explicit denominators;
- channel priority A1–A5 defined;
- message variants M1–M5 defined;
- structured feedback protocol defined;
- learning taxonomy defined;
- execution batches A–D defined;
- Block 03 closure rules defined;
- native Drive strategy document created: `10 - Early Activation v1 - Personal Tax Ledger`;
- native Drive activation tracker created: `11 - Early Activation Log - Personal Tax Ledger`;
- activation tracker contains `Activation Log`, `Summary` and `Lists` tabs;
- summary formulas initialize the five Block 03 evidence thresholds at zero and update from the activation log;
- GitHub execution issue created: `PTL-3 — Early Activation Cohort` (#27).

## Batch B — Qualification progress

### Validator lane seeded

Two previous UAT participants were found with explicit consent for follow-up and sufficient prior product exposure to be useful validator candidates.

They are recorded as `VAL-01` and `VAL-02` in the private Drive activation tracker.

Important boundary:

- both are classified as `VALIDATOR` only;
- they are **not** counted toward the primary ICP cohort unless explicit evidence confirms that their own tax situation matches one of the primary ICP profiles;
- no identifying information or private tax data is copied into public GitHub artifacts.

### Warm-network candidate pool discovered

Connected contacts contain a usable professional-network pool, including several known professional contacts. However, contact metadata alone does not establish salary + honorarios, independent/freelance status, recurring Operación Renta preparation pain or advanced manual-tracker behavior.

Therefore the first five primary prospects are **not yet canonically selected**. Qualification must be explicit rather than inferred from employer, profession or relationship.

### Qualification rule for A3-04

A person qualifies for the first-five primary cohort when at least one of the following is explicitly known or confirmed:

1. salary + honorarios / mixed income;
2. independent worker issuing fee receipts;
3. freelance professional with variable income;
4. repeatedly reaches Operación Renta without having organized the year;
5. advanced spreadsheet/manual tax tracker.

Reachability alone is insufficient.

## Next execution — Batch B

1. confirm five people who satisfy at least one primary ICP rule;
2. assign message variants across the five, with at least two variants represented;
3. only then count A3-04 as DONE;
4. execute A3-05 founder-led outreach and capture reaction before installation assistance;
5. keep `VAL-01` and `VAL-02` as a parallel professional-validation lane.

## P0 status

| ID | Item | State |
|---|---|---|
| A3-01 | Canonical early-activation strategy | DONE |
| A3-02 | Activation evidence schema + tracker | DONE / IMPLEMENTED |
| A3-03 | Message variants M1–M5 | DONE |
| A3-04 | First 5 qualified prospects selected | IN PROGRESS / EXPLICIT ICP CONFIRMATION REQUIRED |
| A3-05 | First 5 contact attempts completed | PENDING |
| A3-06 | First 2 observed meaningful sessions | PENDING |
| A3-07 | Cohort expanded to 10 qualified prospects | PENDING |
| A3-08 | At least 3 structured primary-ICP feedback records | PENDING |
| A3-09 | Continued-intent evidence for at least 2 users | PENDING |
| A3-10 | Activation learning synthesis | PENDING |

## Current state

`ACTIVATE / BLOCK_03_OPEN / BATCH_B_QUALIFICATION_IN_PROGRESS / VALIDATOR_POOL_SEEDED / PRIMARY_5_PENDING_CONFIRMATION`
