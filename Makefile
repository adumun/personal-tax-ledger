SHELL := /bin/bash

MODE ?= store
VERSION := $(shell node -p "require('./package.json').version" 2>/dev/null || echo unknown)
DIST_ROOT := out/distribution
STORE_OUT := $(DIST_ROOT)/store
UAT_OUT := $(DIST_ROOT)/uat
WIN_REPO := $(shell wslpath -w "$(CURDIR)" 2>/dev/null || true)
WIN_STORE_OUT := $(shell wslpath -w "$(CURDIR)/$(STORE_OUT)" 2>/dev/null || true)

.PHONY: bootstrap deps prepare-shared-ui up down test test-ledger-ui typecheck doctor validate build build-web build-store build-uat run-web clean clean-distribution help

# Canonical ADÜMÜN developer façade (STD-ENG-DEV-001).
bootstrap:
	@echo "==> Bootstrapping PTL dependencies"
	@npm install
	@$(MAKE) --no-print-directory prepare-shared-ui

# The local web app consumes @personal-tax-ledger/shared-ui through its compiled dist/ export.
# Rebuild it before development so source and effective runtime artifact cannot drift.
prepare-shared-ui:
	@echo "==> Building shared UI runtime artifact"
	@npm run build --workspace @personal-tax-ledger/shared-ui

deps:
	@echo "==> Checking PTL development toolchain"
	@command -v node >/dev/null || { echo "node is required" >&2; exit 2; }
	@command -v npm >/dev/null || { echo "npm is required" >&2; exit 2; }
	@command -v make >/dev/null || { echo "make is required" >&2; exit 2; }
	@node --version
	@npm --version
	@$(MAKE) --version | head -n 1

# Foreground development runtime. Stop it with Ctrl+C in the owning terminal.
up: deps prepare-shared-ui
	@npm run dev

# PTL does not daemonize the development runtime; this target documents that fact
# rather than killing unrelated Node processes heuristically.
down:
	@echo "PTL local development runs in the foreground; stop the owning 'make up' process with Ctrl+C."

test:
	@npm test

# Focused visual-slice regression gate used while dogfooding the shared React shell.
test-ledger-ui:
	@node --test test/annual-income-ledger-frontend.test.mjs test/tax-ledger-http-client.test.mjs

typecheck:
	@npm run typecheck

doctor: deps
	@echo "==> Checking dependency graph"
	@npm ls --depth=0 >/dev/null
	@echo "==> Checking repository patch hygiene"
	@git diff --check
	@echo "DOCTOR-PASS"

validate: typecheck test
	@npm run desktop:check
	@npm run architecture:check

# Canonical distribution entrypoint retained for PTL release lanes.
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

# Build only the React/web application, without producing a distribution artifact.
build-web: prepare-shared-ui
	@npm run build

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

# Compatibility alias for the pre-existing static-web execution path.
run-web: build-web
	@npm start

clean: clean-distribution
	@rm -rf apps/local/web/dist

clean-distribution:
	@rm -rf "$(DIST_ROOT)"

help:
	@echo "Personal Tax Ledger canonical repository commands"
	@echo
	@echo "Development (STD-ENG-DEV-001):"
	@echo "  make bootstrap         Install/refresh dependencies and rebuild shared UI runtime"
	@echo "  make deps              Verify required local toolchain"
	@echo "  make prepare-shared-ui Rebuild @personal-tax-ledger/shared-ui dist export"
	@echo "  make up                Build shared UI and start API + Vite development runtime"
	@echo "  make down              Explain foreground-runtime shutdown semantics"
	@echo "  make test              Run canonical automated test suite"
	@echo "  make test-ledger-ui    Run focused ledger/shared-shell regression tests"
	@echo "  make typecheck         Run workspace TypeScript checks"
	@echo "  make doctor            Fast, side-effect-safe repository health check"
	@echo "  make validate          Run canonical PTL validation gate"
	@echo "  make build-web         Build shared UI and React/web application"
	@echo
	@echo "Distribution:"
	@echo "  make build             Build Microsoft Store MSIX candidate (default)"
	@echo "  make build MODE=uat    Build local UAT Setup.exe"
	@echo "  make build-uat         Explicit local UAT Setup.exe lane"
	@echo "  make build-store       Explicit Microsoft Store lane"
	@echo "  make clean             Remove local build/distribution outputs"
