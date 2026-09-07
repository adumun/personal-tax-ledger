# Microsoft Store MSIX 0.1.5 — Windows App Certification Kit evidence

Date: 2026-09-06

Status: `PASS_WITH_OPTIONAL_DIAGNOSTIC_FAILURE`

## Scope

Windows App Certification Kit (WACK) validation of the Store-targeted MSIX package:

- package identity: `Admn.PersonalTaxLedger`
- package version: `0.1.5.0`
- architecture: `x64`
- app type: `Centennial`
- validation type: command line

## Result

The authoritative XML report declares:

```text
OVERALL_RESULT="PASS"
APP_NAME="Admn.PersonalTaxLedger"
APP_VERSION="0.1.5.0"
PARTIAL_RUN="FALSE"
```

The WACK process completed with exit code `0`, generated the XML report, and the runner recorded:

```text
PTL WACK EXECUTION: PASS
```

## Notable diagnostic

One optional test, `Blocked executables` (test index 88), reported `FAIL` while the overall WACK result remained `PASS`.

The messages are heuristic/static detections over Electron/Chromium runtime files and the application binary, including references such as `CreateProcessW`, `cmd`, `reg`, `bash`, and short byte/string matches inside `.pak`, `.dll`, and `app.asar` files.

This does **not** convert the certification result into a WACK failure because the test is marked `OPTIONAL="TRUE"` and the authoritative report still declares `OVERALL_RESULT="PASS"`.

This diagnostic remains relevant for Store certification review and must not be silently discarded. If Partner Center flags it, preserve the report and review the exact certification message before changing packaging/runtime behavior.

## Additional passed gates

The report records PASS for, among others:

- digitally signed file test;
- UAC run level;
- package compliance / manifest;
- registry checks;
- enterprise features;
- banned file analyzer;
- private code signing;
- branding;
- debug configuration;
- special-use capabilities test;
- Windows Runtime metadata validation;
- platform appropriate files;
- DPI awareness.

## Decision

The local WACK gate for the first Microsoft Store submission candidate `0.1.5.0` is considered **PASS**.

Next gate: create and complete the Partner Center submission, including package upload, listing metadata, age rating, privacy policy, and justification for the restricted `runFullTrust` capability.
