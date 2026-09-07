SHELL := /bin/bash

MODE ?= store
VERSION := $(shell node -p "require('./package.json').version")
DIST_ROOT := out/distribution
STORE_OUT := $(DIST_ROOT)/store
UAT_OUT := $(DIST_ROOT)/uat
WIN_REPO := $(shell wslpath -w "$(CURDIR)" 2>/dev/null || true)
WIN_STORE_OUT := $(shell wslpath -w "$(CURDIR)/$(STORE_OUT)" 2>/dev/null || true)

.PHONY: build build-store build-uat run-web validate clean-distribution help

# Canonical distribution entrypoint.
# - make build            -> Microsoft Store candidate (.msix)
# - make build MODE=uat   -> local UAT installer (.exe)
build:
ifeq ($(MODE),uat)
	@$(MAKE) --no-print-directory build-uat
else ifeq ($(MODE),store)
	@$(MAKE) --no-print-directory build-store
else
	@echo "Unsupported MODE='$(MODE)'. Use MODE=store or MODE=uat." >&2
	@exit 2
endif

# Public distribution lane. Microsoft Store accepts the MSIX candidate, not Setup.exe.
build-store: validate
	@echo "==> PTL Store build $(VERSION)"
	@rm -rf "$(STORE_OUT)"
	@mkdir -p "$(STORE_OUT)"
	@PTL_MSIX_MODE=store npm run desktop:msix:prepare
	@if [[ -z "$(WIN_REPO)" ]]; then \
		echo "Unable to resolve the repository as a Windows path. Store packaging requires WSL2 + Windows SDK." >&2; \
		exit 3; \
	fi
	@powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(WIN_REPO)\\scripts\\build-msix-store-submission.ps1" -RepoRoot "$(WIN_REPO)" -OutputDirectory "$(WIN_STORE_OUT)"
	@node scripts/write-distribution-manifest.mjs store "$(STORE_OUT)"
	@echo
	@echo "STORE CANDIDATE READY: $(STORE_OUT)"
	@find "$(STORE_OUT)" -maxdepth 1 -type f -printf '  %f\n' | sort

# Local human UAT lane. Produces an installable Squirrel Setup.exe.
# This artifact is intentionally NOT a Microsoft Store submission artifact.
build-uat: validate
	@echo "==> PTL local UAT build $(VERSION)"
	@rm -rf "$(UAT_OUT)"
	@PTL_REQUIRE_WINDOWS_SIGNING=0 PTL_WINDOWS_SIGNING_MODE=off npm run desktop:installer:win
	@mkdir -p "$(UAT_OUT)"
	@cp "out/installer-win32-x64/PersonalTaxLedger-$(VERSION)-Setup.exe" "$(UAT_OUT)/PersonalTaxLedger-$(VERSION)-UAT-Setup.exe"
	@node scripts/write-distribution-manifest.mjs uat "$(UAT_OUT)"
	@echo
	@echo "UAT INSTALLER READY: $(UAT_OUT)/PersonalTaxLedger-$(VERSION)-UAT-Setup.exe"
	@echo "WARNING: this UAT EXE is not Store-signed and may be blocked by Smart App Control on some Windows devices."

# Run the local web application without Electron.
# Builds the frontend first, then starts the local HTTP composition root.
run-web:
	@npm run build
	@npm start

validate:
	@npm run typecheck
	@npm test
	@npm run desktop:check
	@npm run architecture:check

clean-distribution:
	@rm -rf "$(DIST_ROOT)"

help:
	@echo "Personal Tax Ledger distribution targets"
	@echo
	@echo "  make build             Build the Microsoft Store MSIX candidate (default)"
	@echo "  make build MODE=uat    Build the local UAT Setup.exe"
	@echo "  make build-uat         Alias for local UAT Setup.exe"
	@echo "  make build-store       Alias for Microsoft Store MSIX candidate"
	@echo "  make run-web           Build and run the local web application"
	@echo "  make validate          Run the distribution preflight gate"
	@echo "  make clean-distribution"
