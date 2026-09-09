SHELL := /bin/bash

MODE ?= store
VERSION := $(shell node -p "require('./package.json').version")
DIST_ROOT := out/distribution
UAT_OUT := $(DIST_ROOT)/uat

.PHONY: bootstrap deps up down test doctor validate build build-store store-artifact build-uat run-web lint clean clean-distribution help

bootstrap:
	@npm ci

deps:
	@command -v node >/dev/null || { echo "Missing dependency: node" >&2; exit 2; }
	@command -v npm >/dev/null || { echo "Missing dependency: npm" >&2; exit 2; }
	@node -e "const major=Number(process.versions.node.split('.')[0]); if (major !== 24) { console.error('Expected Node 24.x, got '+process.version); process.exit(2); }"
	@echo "Node: $$(node --version)"
	@echo "npm:  $$(npm --version)"

up: run-web

down:
	@echo "PTL local runtime runs in the foreground; stop it with Ctrl-C. No persistent local service is managed by Make."

test:
	@npm test

doctor: deps
	@test -f package.json || { echo "Missing package.json" >&2; exit 2; }
	@test -f package-lock.json || { echo "Missing package-lock.json" >&2; exit 2; }
	@test -f scripts/build-store-msix.sh || { echo "Missing Store artifact script" >&2; exit 2; }
	@test -f scripts/package-msix.ps1 || { echo "Missing Windows SDK MSIX bridge" >&2; exit 2; }
	@echo "Repository health: PASS"

validate:
	@npm run typecheck
	@$(MAKE) --no-print-directory test
	@npm run desktop:check
	@npm run architecture:check

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

# Microsoft Store release-artifact lane.
# Complex/native tooling remains encapsulated in scripts/build-store-msix.sh.
build-store:
	@bash scripts/build-store-msix.sh

# Explicit domain alias for the exact artifact uploaded to Partner Center.
store-artifact: build-store

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

run-web:
	@npm run build
	@npm start

lint:
	@npm run lint

clean: clean-distribution
	@rm -rf out/msix

clean-distribution:
	@rm -rf "$(DIST_ROOT)"

help:
	@echo "Personal Tax Ledger — canonical Make interface"
	@echo
	@echo "Baseline (STD-ENG-DEV-001):"
	@echo "  make bootstrap          Install locked dependencies"
	@echo "  make deps               Validate required toolchain"
	@echo "  make up                 Build and run local web application"
	@echo "  make down               Explain foreground shutdown semantics"
	@echo "  make test               Run canonical automated test suite"
	@echo "  make doctor             Run non-destructive repository health checks"
	@echo "  make validate           Run deeper repository validation"
	@echo "  make lint               Run lint/static checks"
	@echo "  make clean              Remove generated distribution/MSIX output"
	@echo
	@echo "Distribution:"
	@echo "  make build              Build Microsoft Store artifact (default MODE=store)"
	@echo "  make build MODE=uat     Build local UAT Setup.exe"
	@echo "  make build-store        Build and validate Partner Center MSIX"
	@echo "  make store-artifact     Explicit alias for build-store"
	@echo "  make build-uat          Build local UAT Setup.exe"
