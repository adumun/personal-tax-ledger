# PTL GTM Cycle 01 — Block 03 Execution Status

**Block:** 03 — Early Activation  
**Macrostate:** ACTIVATE  
**Status:** OPEN / BATCH B QUALIFICATION DRAFTS READY  
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

### Alternative qualification path selected

Instead of assuming tax profile from profession, employer or relationship, the founder selected a **qualification-first outreach** path.

Five reachable warm/professional contacts were prepared as `QUAL-01` through `QUAL-05` in the private activation tracker. Each has a Gmail draft that asks only whether one or more primary ICP situations applies to them.

The qualification message explicitly covers:

1. salary + fee receipts / mixed income;
2. independent or freelance work;
3. reaching Operación Renta and only then organizing/reconstructing the year;
4. using Excel, notes or another self-built system to track tax situation.

No PTL install request is included at this stage.

### Qualification semantics

- a qualification draft is **not** a qualified prospect;
- a sent qualification message is **not** counted as an activation contact toward the 10 qualified-prospect threshold until a qualifying ICP signal is confirmed;
- negative responses are useful evidence but do not enter the primary activation cohort;
- only after qualification will message variants M1–M5 and the PTL landing/install ask be assigned.

### Prepared cohort

Private tracker records:

- `QUAL-01` — qualification draft ready;
- `QUAL-02` — qualification draft ready;
- `QUAL-03` — qualification draft ready;
- `QUAL-04` — qualification draft ready;
- `QUAL-05` — qualification draft ready.

All five remain `UNQUALIFIED / QUALIFICATION_DRAFT` until responses are received.

## Next execution — Batch B

1. review the five Gmail qualification drafts;
2. send the qualification batch after explicit founder approval;
3. capture responses in the activation tracker;
4. promote qualifying respondents into the primary ICP cohort;
5. assign at least two M1–M5 message variants across qualified respondents;
6. begin installation/meaningful-use activation only after qualification.

## P0 status

| ID | Item | State |
|---|---|---|
| A3-01 | Canonical early-activation strategy | DONE |
| A3-02 | Activation evidence schema + tracker | DONE / IMPLEMENTED |
| A3-03 | Message variants M1–M5 | DONE |
| A3-04 | First 5 qualified prospects selected | IN PROGRESS / QUALIFICATION DRAFTS READY |
| A3-05 | First 5 contact attempts completed | BLOCKED ON QUALIFICATION RESPONSES |
| A3-06 | First 2 observed meaningful sessions | PENDING |
| A3-07 | Cohort expanded to 10 qualified prospects | PENDING |
| A3-08 | At least 3 structured primary-ICP feedback records | PENDING |
| A3-09 | Continued-intent evidence for at least 2 users | PENDING |
| A3-10 | Activation learning synthesis | PENDING |

## Current state

`ACTIVATE / BLOCK_03_OPEN / BATCH_B_QUALIFICATION_DRAFTS_READY / SEND_APPROVAL_NEXT`
