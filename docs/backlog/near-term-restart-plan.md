# Personal Tax Ledger — Near-Term Restart Plan

**Snapshot:** 2026-09-19  
**Purpose:** durable handoff for the next executable work after PTL-US-IL-004 closure.

## ASAP — PTL-TASK-IL-006

Issue: #37 — Terminal regression and Block 02 Definition of Done.

Block 02 is not closed until this gate proves the complete ledger contract after the foreign-service slice.

### Required proof

- ledger is still projection-only;
- owner identity remains stable and internal routing does not leak as user data;
- AnnualWorkspace isolation and stale protection remain intact;
- salary/APV semantics are not duplicated;
- BHE recognition semantics remain unchanged;
- factual totals remain traceable;
- foreign payer and source jurisdiction remain separate;
- BHE + FX settlement remains one income fact;
- genuine foreign-source honoraria use perception recognition;
- CLP recognition requires frozen auditable FX provenance;
- unresolved FX cannot silently become recognized income.

### Execution discipline

- start from clean `master`;
- use repository Make targets;
- no GitHub Actions evidence;
- persist terminal evidence before declaring PASS;
- if any regression appears, reopen the owning story/invariant rather than weakening the terminal gate.

### Exit

`PTL-TASK-IL-006 PASS -> Block 02 CLOSED`.

## Short term — product adoption

Issue: #38 — PTL-GTM-001 Microsoft Store adoption and first-download loop.

The Store publication and native runtime smoke are already closed. The next product question is adoption, not distribution readiness.

Resume the existing daily promotion loop and persist:

- action/channel/date;
- message/positioning used;
- observed download/user signal where available;
- qualitative feedback;
- next keep/change/stop decision.

Do not reopen Store publication work simply because adoption is low.

## Medium term — distribution hardening

The repository already records these as later distribution closures:

- formal update/autoupdate policy;
- deeper runtime invariant checks when they add value;
- SmartScreen/user-trust hardening for the external UAT lane;
- eventual UAT artifact migration to a release channel with stronger provenance.

These are not prerequisites for Block 02 closure and should not preempt IL-006.

## Deferred / not pulled forward

- SII synchronization/API exploration is a future integration opportunity, not part of the current Block 02 terminal gate;
- article 41 A credit calculation remains outside IL-004/Block 02 scope;
- no new tax functionality should be opened before the Block 02 terminal gate is reconciled.
