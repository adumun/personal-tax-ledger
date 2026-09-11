# External UAT public distribution — Personal Tax Ledger

**Status:** current external UAT distribution record  
**UAT version:** `0.1.6`  
**Date verified:** 2026-09-11

## Purpose

This document records the public distribution truth for the current external UAT lane. It intentionally separates the external UAT artifact from the independent Microsoft Store publication lane.

## Canonical external UAT artifact

Current artifact:

```text
PersonalTaxLedger-0.1.6-Setup.zip
```

Current canonical UAT channel:

```text
Google Drive controlled public UAT file
```

Drive file ID:

```text
1QfG8qbe2EEaGfLathshNKYVWoSRi28OA
```

Observed ZIP size:

```text
153,616,171 bytes
```

Observed ZIP contents:

```text
PersonalTaxLedger-0.1.6-Setup.exe
```

SHA-256 of the ZIP verified on 2026-09-08:

```text
613505df917b89d6014c9c5ab36e054ceba7e67b589e618f45f9713fcfdcfb45
```

The checksum applies to the ZIP file, not to a separately extracted executable.

## GitHub Releases status

As of this verification, the repository has no GitHub Releases. Therefore documentation or website copy must not claim that GitHub Releases is already the canonical public UAT channel.

A future migration to GitHub Releases is desirable for artifact provenance and release discoverability, but it becomes canonical only after a real release exists, its artifact is validated, and public documentation is switched consistently.

## Microsoft Store lane

The Store lane is separate from external UAT `0.1.6`.

Current canonical repository evidence records:

```text
Store submission lineage: PersonalTaxLedger-0.1.5.0-x64-store.msix
Version: 0.1.5.0
Architecture: x64
Minimum Windows version: 10.0.19041.0
Microsoft-side publication: CONFIRMED 2026-09-11
Lifecycle state: STORE_PUBLICATION_CONFIRMED_NATIVE_RUNTIME_VALIDATION_PENDING
```

Partner Center shows Personal Tax Ledger as **In Microsoft Store** and states that the product is currently available in Microsoft Store according to the discoverability configured in the Availability module.

This closes the Microsoft certification/publication gate. It does not, by itself, close native runtime validation of the Store-delivered build on the target Windows host.

The UAT ZIP must not be presented as the Store build, and the Store package must not replace UAT evidence or version semantics.

## Tester trust guidance

The external UAT package is intended for Windows desktop validation by invited/external testers.

Before running it, testers should verify:

1. the downloaded filename is `PersonalTaxLedger-0.1.6-Setup.zip`;
2. the ZIP SHA-256 matches the value published above;
3. the ZIP contains `PersonalTaxLedger-0.1.6-Setup.exe`;
4. the download came from the currently declared UAT channel.

The current external UAT lane is not the Microsoft Store-signed distribution lane. Windows may therefore display a SmartScreen/reputation warning. The website should explain this before download rather than forcing testers to discover it during installation.

## Data guidance for external UAT

External testers should prefer fictitious/test tax data unless a specific test requires otherwise.

PTL is currently local-first and does not require an online PTL account for its local capabilities. Personal tax data must not be copied into GitHub issues, public website content or broad evidence surfaces.

See also:

- `site/privacy.html`
- `docs/desktop/uat-evidence-2026-09-04.md`
- `docs/desktop/microsoft-store-publication-confirmed-2026-09-11.md`
- `docs/desktop/microsoft-store-submission-in-certification-2026-09-06.md` (historical checkpoint)
- GitHub issue #1 — PTL-1 UAT Trust Closure

## Transition rule

When a new canonical UAT distribution channel is adopted, update this document first or in the same controlled change as every public reference. Do not leave README, website and distribution evidence pointing to different channels.
