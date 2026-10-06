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

Historical state before publication:

```text
NATIVE_MSIX_VALIDATED_STORE_SUBMITTED_CERTIFICATION_PENDING
```

Publication checkpoint:

```text
STORE_PUBLICATION_CONFIRMED_NATIVE_RUNTIME_VALIDATION_PENDING
```

Post-installation checkpoint observed later on 2026-09-11:

```text
STORE_PUBLICATION_CONFIRMED_NATIVE_RUNTIME_SMOKE_PASS
```

The Microsoft-side certification/publishing gate is therefore **PASS**, and the Store-delivered application has also passed a native Windows installation/launch smoke test.

## What publication evidence proves

The Partner Center evidence confirms that:

- the product passed the Microsoft Store publication path sufficiently to become available in Store;
- the current Store presence is active;
- Partner Center exposes analytics for the published product;
- subsequent product changes must use the normal update submission flow;
- discoverability remains governed by the Availability module configuration.

## Post-publication native smoke result

On 2026-09-11 the Store-delivered PTL build was downloaded, installed and launched successfully on native Windows. Windows registered the application and exposed it through application search, and the application reached its operational UI without a blocking Store/Smart App Control failure. The user explicitly reported that it works without problems.

Canonical smoke record:

- `docs/desktop/microsoft-store-native-runtime-smoke-2026-09-11.md`

## Deep validation items kept separate

The successful Store installation/runtime smoke does not independently prove every internal invariant. The following remain engineering-level verification items only if strict evidence is required:

1. explicit loopback-only listener inspection;
2. explicit confirmation of the intended historical profile/workspace reuse;
3. explicit SQLite path/state inspection;
4. explicit verification that no duplicate database state was created;
5. controlled removal of any legacy Squirrel installation, if still present.

These are no longer blockers for stating that the Microsoft Store build **is published, installs successfully and runs successfully** for the user.

## Distribution model after publication

PTL continues to maintain two distinct Windows distribution lanes:

1. **Microsoft Store lane** — public Store distribution. Publication is confirmed for the existing `0.1.5.0` submission lineage and native install/launch smoke is PASS.
2. **Controlled UAT lane** — external tester distribution through the separately governed `0.1.6` Squirrel package.

The UAT package must not be represented as the Store package, and Store publication must not erase the historical UAT evidence.

## Canonical references

Historical submission evidence remains immutable and useful for provenance:

- `docs/desktop/microsoft-store-submission-in-certification-2026-09-06.md`
- `docs/desktop/microsoft-store-publication-evidence-2026-09-06.md`
- `docs/desktop/microsoft-store-publication-evidence-manifest-2026-09-06.json`

Current publication/runtime state is established by:

- `docs/desktop/microsoft-store-publication-confirmed-2026-09-11.md`
- `docs/desktop/microsoft-store-native-runtime-smoke-2026-09-11.md`

and must be reflected by current-state surfaces such as repository `README.md`, desktop documentation, the public site read model and complementary Drive lifecycle/project records.

## Evidence policy

The Partner Center screenshot and native Windows screenshots are human evidence. No claim is made about Store search ranking or universal discoverability beyond the explicit Partner Center availability statement; discoverability depends on the configured Availability policy.
