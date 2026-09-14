# PTL GTM Cycle 01 — Block 03 Execution Status

**Block:** 03 — Early Activation  
**Macrostate:** ACTIVATE  
**Status:** OPEN / LINKEDIN SELF-QUALIFICATION LIVE  
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
- activation tracker contains `Activation Log`, `Summary`, `Lists` and `Channel Events` tabs;
- GitHub execution issue created: `PTL-3 — Early Activation Cohort` (#27).

## Batch B — Self-qualification path

### Decision

The founder rejected cold individual qualification as the active path and chose a LinkedIn open call instead.

The LinkedIn post has been published and now acts as the first self-qualification channel for the primary cohort.

Canonical event:

`CH-LI-01 — LinkedIn Open Call`

State:

`PUBLISHED / AWAITING_RESPONSES`

The exact LinkedIn URL has not been recorded yet; publication is based on founder confirmation.

### Why this path is preferred

The open call allows relevant people to self-identify based on their own situation rather than requiring the founder to infer tax profile from employer, profession or relationship.

A response qualifies for review when the person indicates relevance to one or more primary ICP situations, including:

1. salary + fee receipts / mixed income;
2. independent worker issuing fee receipts;
3. freelance professional with variable income;
4. repeatedly reaches Operación Renta without having organized the year;
5. advanced spreadsheet/manual tax tracker.

### Prior email qualification drafts

The five previously prepared qualification drafts are not part of the active acquisition path and must not be sent unless explicitly reactivated later.

They do not count toward activation evidence.

### Validator lane

`VAL-01` and `VAL-02` remain available as a separate professional-validation lane. They are not counted as primary-ICP validation unless their own profile is explicitly confirmed.

## Next execution — Batch B

1. observe LinkedIn comments and direct messages;
2. capture each relevant response as a new activation record;
3. confirm ICP fit before counting a person as a qualified prospect;
4. assign an activation ID and source `LinkedIn / CH-LI-01`;
5. send landing + Microsoft Store only after a qualifying signal or explicit request to try PTL;
6. record Store open, install attempt, launch and meaningful-first-use evidence;
7. review evidence after the first five qualified respondents before expanding further.

## P0 status

| ID | Item | State |
|---|---|---|
| A3-01 | Canonical early-activation strategy | DONE |
| A3-02 | Activation evidence schema + tracker | DONE / IMPLEMENTED |
| A3-03 | Message variants M1–M5 | DONE |
| A3-04 | First 5 qualified prospects selected | IN PROGRESS / LINKEDIN SELF-QUALIFICATION LIVE |
| A3-05 | First 5 contact attempts completed | WAITING ON SELF-QUALIFIED RESPONSES |
| A3-06 | First 2 observed meaningful sessions | PENDING |
| A3-07 | Cohort expanded to 10 qualified prospects | PENDING |
| A3-08 | At least 3 structured primary-ICP feedback records | PENDING |
| A3-09 | Continued-intent evidence for at least 2 users | PENDING |
| A3-10 | Activation learning synthesis | PENDING |

## Current state

`ACTIVATE / BLOCK_03_OPEN / LINKEDIN_OPEN_CALL_PUBLISHED / SELF_QUALIFIED_RESPONSES_NEXT`
