# Microsoft Store native runtime smoke — PASS (2026-09-11)

## Status

The Microsoft Store-delivered Personal Tax Ledger build was downloaded, installed and launched successfully on native Windows on 2026-09-11.

Observed human evidence shows the complete user path:

```text
Microsoft Store download                  PASS
Microsoft Store installation              PASS
Windows application registration/search   PASS
Native launch                              PASS
Main UI render                             PASS
Application usable after launch            PASS
```

The user explicitly reported that the Store-installed application **works without problems** after installation.

## Evidence observed

The supplied screenshots show:

1. Microsoft Store downloading PTL (`Descargando`).
2. Microsoft Store extracting/installing PTL (`Instalando`).
3. `Personal Tax Ledger` registered as an installed Windows application and discoverable from Windows Search.
4. PTL running natively and rendering the annual estimated summary UI with populated product data.

This is sufficient to close the Store installation + native launch smoke gate.

## Lifecycle transition

Previous state:

```text
STORE_PUBLICATION_CONFIRMED_NATIVE_RUNTIME_VALIDATION_PENDING
```

Current state:

```text
STORE_PUBLICATION_CONFIRMED_NATIVE_RUNTIME_SMOKE_PASS
```

## Scope of closure

Closed by this checkpoint:

- Store-delivered package can be downloaded;
- Store-delivered package can be installed;
- Windows registers the application correctly;
- the application launches from the installed Store package;
- the product UI reaches an operational state;
- no blocking Store/Smart App Control failure was observed in this installation path.

## Deep technical invariants still separate

The screenshots and user-level smoke result do not independently prove every internal runtime invariant. Keep the following as engineering verification items if strict closure evidence is required:

- explicit loopback-only listener inspection;
- explicit confirmation that the loaded workspace/profile is the intended historical one;
- explicit SQLite path/state inspection;
- explicit verification that no duplicate database state was created;
- controlled removal of any legacy Squirrel installation, if still present.

These are no longer blockers for stating that **the Microsoft Store build installs and runs successfully for the user**. They remain optional/deep post-publication validation items rather than Store publication blockers.

## Evidence classification

Evidence type: human/native runtime evidence.

Source: screenshots supplied from the native Windows host plus explicit user confirmation of successful operation.

The screenshots themselves are conversation evidence and are not embedded into the repository in this checkpoint; this document records the evidence-backed outcome and its scope.
