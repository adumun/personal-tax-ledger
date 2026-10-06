---
name: Research / Spike
description: Time-box investigation, discovery or feasibility work before committing to implementation.
title: ""
labels: []
assignees: []
---

## Question / Hypothesis

State what must be learned, verified or disproved.

## Decision This Research Enables

Describe the concrete decision or planning outcome expected from the spike.

## Scope / Timebox

Define the investigation boundary and stopping condition.

## Initiative Repository Set

Declare every repository genuinely involved in or required by this research slice. Do not narrow the set to evade the open-PR gate.

- `owner/repo`

## Repository / Dependency Preflight

- Status: `PASS | BLOCKED_BY_OPEN_PR | BLOCKED_BY_DEPENDENCY_STATE`
- Fresh open-PR state:
  - `owner/repo` — open PRs: `0` or links

`PASS` requires zero open Pull Requests in every repository in the declared initiative repository set. Any open PR inside the set requires `BLOCKED_BY_OPEN_PR`, regardless of semantic relevance.

## Evidence Required

List experiments, source inspection, benchmarks, prototypes, external verification or other evidence required.

## Deliverables

- [ ] Findings recorded durably.
- [ ] Decision/recommendation stated.
- [ ] Unknowns and rejected assumptions listed.
- [ ] Material implementation work, if approved, is represented by a follow-up Issue rather than silently continuing this spike.

## Out of Scope

List production implementation or other work excluded from this investigation.

---

Governed by `STD-ENG-WFM-001`.
