## Covered Issues

<!-- Use closing semantics only for Issues fully completed by this PR. -->
- Closes #
- Refs #

## Initiative Repository Set

<!-- Declare every repository genuinely involved in or required by this execution slice. Do not narrow this set to evade the open-PR gate. -->
- `owner/repo`

## Dependency Preflight

- Status: `PASS | BLOCKED_BY_OPEN_PR | BLOCKED_BY_DEPENDENCY_STATE`
- Fresh preflight evidence:
  - `owner/repo` — open PRs: `0` or links
- Previously blocking PRs resolved by owner: `N/A` or links

`PASS` is valid only when every repository in the declared initiative repository set has zero open Pull Requests. Any open PR in any repository in the set requires `BLOCKED_BY_OPEN_PR`, regardless of semantic relevance.

## Scope

Describe the bounded change integrated by this PR.

## Out of Scope

List intentionally excluded work. Material follow-up work should become Issues rather than remain implicit PR debt.

## Validation / Evidence

- [ ] repository-defined validation executed as applicable
- [ ] tests/type/build/static checks executed as applicable
- [ ] material visual/runtime/operational evidence persisted when applicable

Evidence / commands / artifacts:

```text
<evidence>
```

## Compatibility / Migration

Describe breaking changes, migrations, version/provenance implications, or state `None`.

## Residual Debt / Follow-up

- None, or
- Refs #<follow-up-issue>

## Lifecycle / Merge Readiness

- [ ] planning Issue exists for material work
- [ ] initiative repository set is explicit and complete for this slice
- [ ] fresh preflight verified zero open PRs in every repository in the set before implementation
- [ ] commits reference Issue IDs
- [ ] closing/non-closing Issue relationships above are accurate
- [ ] scope is coherently integrated
- [ ] residual future work is represented by Issues, not by keeping this PR open

Status: `READY_TO_MERGE | NEEDS_OWNER_DECISION | BLOCKED`

---

Governed by `STD-ENG-WFM-001 — Work Planning, Dependency Preflight & Traceability Standard`.
