---
name: Feature / Change
description: Plan a material product, engineering or documentation change.
title: ""
labels: []
assignees: []
---

## Objective / Problem

Describe the user, product, engineering or operational outcome.

## Scope

Define what this Issue plans to change.

## Acceptance Criteria

- [ ]

## Initiative Repository Set

Declare every repository genuinely involved in or required by this execution slice. Do not narrow the set to evade the open-PR gate.

- `owner/repo`

## Repository / Dependency Preflight

- Status: `PASS | BLOCKED_BY_OPEN_PR | BLOCKED_BY_DEPENDENCY_STATE`
- Fresh open-PR state:
  - `owner/repo` — open PRs: `0` or links

`PASS` requires zero open Pull Requests in every repository in the declared initiative repository set. Any open PR inside the set requires `BLOCKED_BY_OPEN_PR`, regardless of semantic relevance.

## Validation / Evidence Expected

Describe tests, build/type/static checks, runtime proof, visual evidence, operational evidence, or other acceptance evidence.

## Out of Scope

List explicitly excluded work.

## Owner / Notes

Owner or responsible party when known.

---

Governed by `STD-ENG-WFM-001`.
