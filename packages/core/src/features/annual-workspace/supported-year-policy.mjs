import { TAX_PARAMETER_KEYS } from '../../tax-parameters.mjs';

export const TAX_YEAR_SUPPORT = Object.freeze({
  SUPPORTED: 'SUPPORTED',
  SUPPORTED_WITH_WARNINGS: 'SUPPORTED_WITH_WARNINGS',
  UNSUPPORTED: 'UNSUPPORTED'
});

export const REQUIRED_TAX_PARAMETER_KEYS = Object.freeze(Object.values(TAX_PARAMETER_KEYS));

function normalizeYear(value) {
  const year = Number(value);
  if (!Number.isSafeInteger(year) || year < 1900 || year > 9999) {
    throw new TypeError('commercialYear debe ser un año válido');
  }
  return year;
}

export function evaluateTaxYearSupport({
  commercialYear,
  parameterRuleKeys = [],
  sourceCount = 0,
  requiredRuleKeys = REQUIRED_TAX_PARAMETER_KEYS
}) {
  const year = normalizeYear(commercialYear);
  const available = new Set(parameterRuleKeys.map(String));
  const required = [...requiredRuleKeys].map(String);
  const missingRuleKeys = required.filter(key => !available.has(key));
  const hasCompleteRuleSet = missingRuleKeys.length === 0;
  const hasProvenance = Number(sourceCount) > 0;

  if (!hasCompleteRuleSet) {
    return Object.freeze({
      commercialYear: year,
      state: TAX_YEAR_SUPPORT.UNSUPPORTED,
      missingRuleKeys,
      warnings: ['missing_required_tax_rules'],
      hasProvenance
    });
  }

  if (!hasProvenance) {
    return Object.freeze({
      commercialYear: year,
      state: TAX_YEAR_SUPPORT.SUPPORTED_WITH_WARNINGS,
      missingRuleKeys: [],
      warnings: ['missing_rule_provenance'],
      hasProvenance: false
    });
  }

  return Object.freeze({
    commercialYear: year,
    state: TAX_YEAR_SUPPORT.SUPPORTED,
    missingRuleKeys: [],
    warnings: [],
    hasProvenance: true
  });
}
