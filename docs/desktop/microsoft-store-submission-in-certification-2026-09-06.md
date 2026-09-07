# Microsoft Store submission — in certification (2026-09-06)

## Status

Personal Tax Ledger `0.1.5.0` was submitted to Microsoft Partner Center for Store certification on 2026-09-06 local time (Partner Center displayed the submission as last modified on 2026-09-07).

Observed Partner Center state immediately after submission:

```text
Product: Personal Tax Ledger
Product state: In certification
Submission: accepted
Current stage: Pre-processing
Next stages: Certification -> Publishing
Publishing policy: publish as soon as certification passes
```

## Pre-submission gates

The submitted candidate had already passed the following local gates:

```text
Store MSIX build                     PASS
Store package identity               PASS
MSIX round-trip validation           PASS
Windows App Certification Kit       PASS
Partner Center package validation    PASS
Pricing and availability             COMPLETE
Properties                           COMPLETE
Age ratings                          COMPLETE
Packages                             COMPLETE / VALIDATED
Store listing                        COMPLETE
Submission options                   COMPLETE
```

Submitted package:

```text
PersonalTaxLedger-0.1.5.0-x64-store.msix
Version: 0.1.5.0
Architecture: x64
Device family: Windows.Desktop
Minimum Windows version: 10.0.19041.0
```

Store identity:

```text
Package/Identity/Name:      Admn.PersonalTaxLedger
Package/Identity/Publisher: CN=5D12CBCA-3417-412D-81A4-21E062DB93F5
PublisherDisplayName:       Adümün
PFN:                        Admn.PersonalTaxLedger_eraxmwbat6msg
Store ID:                   9N8NR29965DS
```

## Restricted capability

The package declares `runFullTrust`, required by the packaged Electron/Win32 desktop application model. Partner Center accepted the submission after receiving the required justification. Final approval of the restricted capability remains part of Microsoft certification.

## Remaining gates

This document does **not** claim Store publication or Microsoft certification completion.

Pending:

1. Partner Center pre-processing completion.
2. Microsoft certification result.
3. Restricted capability approval as part of certification.
4. Store publishing completion.
5. Installation of the Microsoft Store-signed build on the Smart App Control-enabled Windows host.
6. Native runtime verification for `0.1.5.0`, including loopback-only listener validation, historical profile/workspace reuse, persistence, and absence of duplicate database state.
7. Controlled removal of the legacy Squirrel installation after the Store-signed MSIX is proven stable.

## Evidence interpretation

At this checkpoint the correct lifecycle state is:

```text
NATIVE_MSIX_VALIDATED_STORE_SUBMITTED_CERTIFICATION_PENDING
```

Do not promote the Store distribution lane to DONE until Microsoft certification and publishing complete and the Store-signed package passes the native runtime gates on the target Windows host.
