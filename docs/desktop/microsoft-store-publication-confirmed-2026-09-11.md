# Microsoft Store publication confirmed (2026-09-11)

## Status

Personal Tax Ledger is **published and currently available in Microsoft Store** as of 2026-09-11.

Observed evidence from Microsoft Partner Center:

```text
Product: Personal Tax Ledger
Product badge/state: In Microsoft Store
Store presence: active/read-only for the current submission
Availability message: Your product is currently available in the Microsoft Store based on the discoverability configured in the Availability module.
Analytics: available
Product update flow: available via Start update
```

This closes the previous certification/publication uncertainty recorded for the `0.1.5.0` Store submission.

## Lifecycle transition

Previous canonical state:

```text
NATIVE_MSIX_VALIDATED_STORE_SUBMITTED_CERTIFICATION_PENDING
```

Current evidence-backed state:

```text
STORE_PUBLICATION_CONFIRMED_NATIVE_RUNTIME_VALIDATION_PENDING
```

The Microsoft-side certification/publishing gate is therefore considered **PASS**. The product must no longer be described as `submitted`, `in certification`, or `publication pending` in current-state documentation.

## What this evidence proves

The Partner Center evidence confirms that:

- the product passed the Microsoft Store publication path sufficiently to become available in Store;
- the current Store presence is active;
- Partner Center exposes analytics for the published product;
- subsequent product changes must use the normal update submission flow;
- discoverability remains governed by the Availability module configuration.

## What this evidence does not prove

This evidence does **not** by itself prove the post-publication native runtime gates that were intentionally kept separate from Microsoft certification:

1. installation of the Store-delivered, Store-signed build on the target Windows host;
2. loopback-only listener verification in the Store-installed runtime;
3. reuse of the historical profile/workspace;
4. SQLite persistence and absence of duplicate database state;
5. controlled removal of any legacy Squirrel installation after the Store build is proven stable.

Those checks should remain open until native execution evidence is recorded. Store publication itself is already closed.

## Distribution model after publication

PTL continues to maintain two distinct Windows distribution lanes:

1. **Microsoft Store lane** — public Store distribution. Publication is confirmed for the existing `0.1.5.0` submission lineage.
2. **Controlled UAT lane** — external tester distribution through the separately governed `0.1.6` Squirrel package.

The UAT package must not be represented as the Store package, and Store publication must not erase the historical UAT evidence.

## Canonical references

Historical submission evidence remains immutable and useful for provenance:

- `docs/desktop/microsoft-store-submission-in-certification-2026-09-06.md`
- `docs/desktop/microsoft-store-publication-evidence-2026-09-06.md`
- `docs/desktop/microsoft-store-publication-evidence-manifest-2026-09-06.json`

Current publication state is established by this document and must be reflected in:

- repository root `README.md`;
- `docs/desktop/README.md`;
- `docs/desktop/distribution-build-modes.md`;
- `site/README.md`;
- complementary Drive lifecycle/project records.

## Evidence policy

The Partner Center screenshot used for this checkpoint is human evidence. No claim is made here about Store search ranking or universal discoverability beyond the explicit Partner Center availability statement; discoverability depends on the configured Availability policy.
