---
name: Bug / Incident
description: Record and remediate a defect, regression or operational incident.
title: ""
labels: []
assignees: []
---

## Observed Problem

Describe the defect/incident, impact and affected behavior.

## Expected Behavior

Describe the expected state.

## Reproduction / Evidence

Provide steps, logs, screenshots, failing evidence or operational observations as applicable.

## Scope

Define the bounded remediation planned by this Issue.

## Acceptance Criteria

- [ ] Root cause or bounded cause is identified sufficiently for the chosen remediation.
- [ ] Fix/remediation is implemented.
- [ ] Regression/verification evidence is recorded.

## Initiative Repository Set

Declare every repository genuinely involved in or required by this remediation slice. Do not narrow the set to evade the open-PR gate.

- `owner/repo`

## Repository / Dependency Preflight

- Status: `PASS | BLOCKED_BY_OPEN_PR | BLOCKED_BY_DEPENDENCY_STATE`
- Fresh open-PR state:
  - `owner/repo` — open PRs: `0` or links

`PASS` requires zero open Pull Requests in every repository in the declared initiative repository set. Any open PR inside the set requires `BLOCKED_BY_OPEN_PR`, regardless of semantic relevance.

## Validation / Evidence Expected

Describe the evidence required to accept the remediation.

## Out of Scope

List excluded refactors, follow-ups or unrelated defects.

## Severity / Operational Notes

State severity, workaround, urgency or recovery constraints when applicable.

---

Governed by `STD-ENG-WFM-001`.
