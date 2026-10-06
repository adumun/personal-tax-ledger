import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  evaluateTaxYearSupport,
  REQUIRED_TAX_PARAMETER_KEYS,
  TAX_YEAR_SUPPORT
} from '@personal-tax-ledger/core';
import { createSupportedYearPolicyUseCases } from '@personal-tax-ledger/application';
import {
  createSqliteDatabase,
  createSqliteTaxParameterRepository,
  createSqliteTaxRuleSourceRepository
} from '@personal-tax-ledger/sqlite-adapter';

function parameterRows(keys = REQUIRED_TAX_PARAMETER_KEYS) {
  return keys.map(ruleKey => ({ ruleKey, value: 1, type: 'number' }));
}

test('AW-007: reglas completas con provenance oficial producen SUPPORTED', () => {
  const result = evaluateTaxYearSupport({
    commercialYear: 2026,
    parameterRuleKeys: REQUIRED_TAX_PARAMETER_KEYS,
    sourceCount: 1
  });
  assert.equal(result.state, TAX_YEAR_SUPPORT.SUPPORTED);
  assert.deepEqual(result.missingRuleKeys, []);
  assert.deepEqual(result.warnings, []);
});

test('AW-007: reglas completas sin provenance producen SUPPORTED_WITH_WARNINGS', () => {
  const result = evaluateTaxYearSupport({
    commercialYear: 2026,
    parameterRuleKeys: REQUIRED_TAX_PARAMETER_KEYS,
    sourceCount: 0
  });
  assert.equal(result.state, TAX_YEAR_SUPPORT.SUPPORTED_WITH_WARNINGS);
  assert.deepEqual(result.warnings, ['missing_rule_provenance']);
});

test('AW-007: una regla requerida ausente produce UNSUPPORTED y explicita el gap', () => {
  const missing = REQUIRED_TAX_PARAMETER_KEYS.at(-1);
  const result = evaluateTaxYearSupport({
    commercialYear: 2027,
    parameterRuleKeys: REQUIRED_TAX_PARAMETER_KEYS.filter(key => key !== missing),
    sourceCount: 3
  });
  assert.equal(result.state, TAX_YEAR_SUPPORT.UNSUPPORTED);
  assert.deepEqual(result.missingRuleKeys, [missing]);
  assert.deepEqual(result.warnings, ['missing_required_tax_rules']);
});

test('AW-007: la política real distingue 2026 soportado de un año sin rule set exacto', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'ptl-supported-year-'));
  const database = createSqliteDatabase({ path: join(directory, 'policy.sqlite') });
  try {
    const useCases = createSupportedYearPolicyUseCases({
      taxParameterRepository: createSqliteTaxParameterRepository(undefined, database),
      taxRuleSourceRepository: createSqliteTaxRuleSourceRepository(undefined, database)
    });

    const supported = await useCases.getSupportedYearState(2026);
    const unsupported = await useCases.getSupportedYearState(2027);

    assert.equal(supported.state, TAX_YEAR_SUPPORT.SUPPORTED);
    assert.equal(unsupported.state, TAX_YEAR_SUPPORT.UNSUPPORTED);
    assert.equal(unsupported.missingRuleKeys.length, REQUIRED_TAX_PARAMETER_KEYS.length);
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('AW-007: application policy is provider-neutral and can report warnings with injected repositories', async () => {
  const useCases = createSupportedYearPolicyUseCases({
    taxParameterRepository: {
      list: async () => parameterRows(), get: async () => null, upsert: async () => null
    },
    taxRuleSourceRepository: {
      list: async () => [], upsert: async () => undefined, remove: async () => false
    }
  });
  const result = await useCases.getSupportedYearState(2030);
  assert.equal(result.state, TAX_YEAR_SUPPORT.SUPPORTED_WITH_WARNINGS);
  assert.equal(result.commercialYear, 2030);
});
