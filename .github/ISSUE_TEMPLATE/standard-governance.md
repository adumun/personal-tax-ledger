---
name: Standard / Governance
description: Propose or change a normative ADÜMÜN standard, profile or governance contract.
title: ""
labels: []
assignees: []
---

## Governance Problem / Need

Describe the inconsistency, risk or missing authority boundary.

## Normative Direction

State the intended rule or governance outcome without prematurely prescribing implementation details unless they are normative.

## Scope

Define the standard/profile/governance surface being changed.

## Acceptance Criteria

- [ ] Normative authority is explicit.
- [ ] Existing related standards/profiles are reconciled.
- [ ] Machine-readable/conformance implications are identified where applicable.
- [ ] Adoption/propagation implications are identified without conflating them with this slice unless explicitly in scope.

## Initiative Repository Set

Declare every repository genuinely involved in or required by this governance slice. Do not narrow the set to evade the open-PR gate.

- `owner/repo`

## Repository / Dependency Preflight

- Status: `PASS | BLOCKED_BY_OPEN_PR | BLOCKED_BY_DEPENDENCY_STATE`
- Fresh open-PR state:
  - `owner/repo` — open PRs: `0` or links

`PASS` requires zero open Pull Requests in every repository in the declared initiative repository set. Any open PR inside the set requires `BLOCKED_BY_OPEN_PR`, regardless of semantic relevance.

## Evidence / Reconciliation Base

List proving repositories, incidents, products, prior standards, accepted decisions or other evidence.

## Out of Scope

List downstream implementation/adoption work not included in this Issue.

## Follow-on Candidates

List likely conformance, adoption or migration Issues that should be created separately if material.

---

Governed by `STD-ENG-WFM-001`.
