# PTL-TASK-IL-006 — Terminal regression evidence

**Date:** 2026-10-06  
**Branch:** `master`  
**Head:** `3357b60`  
**Result:** `PASS`

## Preconditions

- PR #10 merged and no open pull requests remained at preflight;
- `master` working tree was clean before the gate;
- PTL-US-IL-001..006 and PTL-US-IL-004 were already closed;
- the existing Block 02 contracts and implementation were not changed for this gate.

## Canonical execution

The required Make commands were executed with the repository's Node 24 Linux toolchain:

```text
make bootstrap       PASS after enabling the pre-existing npm Git dependency policy
make validate        PASS
make test-ledger-ui  PASS — 16/16
```

`make validate` passed typecheck, the complete test suite, desktop source checks and architecture checks. The complete terminal output is preserved in [`task-il-006-terminal-output-2026-10-06.txt`](task-il-006-terminal-output-2026-10-06.txt).

## Invariant evidence

The complete suite passed the tests covering projection-only ledger behavior, stable owner identity, annual isolation, stale protection, salary/APV non-duplication, BHE recognition, traceable factual totals, foreign payer/source-jurisdiction separation, BHE plus foreign-currency settlement without double counting, foreign-source perception recognition, frozen CLP conversion provenance, and unresolved FX remaining outside recognized CLP income.

No GitHub Actions evidence was used or claimed.

