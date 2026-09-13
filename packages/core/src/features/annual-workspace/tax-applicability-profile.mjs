import { normalizeCommercialYear } from './annual-tax-workspace.mjs';

export const TAX_APPLICABILITY_PROFILE_VERSION = 1;

export const TAX_APPLICABILITY_VALUE = Object.freeze({
  YES: 'YES',
  NO: 'NO',
  UNKNOWN: 'UNKNOWN'
});

export const TAX_APPLICABILITY_DIMENSION = Object.freeze({
  DEPENDENT_INCOME: 'DEPENDENT_INCOME',
  DOMESTIC_FEE_INCOME: 'DOMESTIC_FEE_INCOME',
  FOREIGN_SERVICE_INCOME: 'FOREIGN_SERVICE_INCOME',
  APV_CONTRIBUTIONS: 'APV_CONTRIBUTIONS',
  MORTGAGE_INTEREST: 'MORTGAGE_INTEREST'
});

export const TAX_APPLICABILITY_DIMENSIONS = Object.freeze(Object.values(TAX_APPLICABILITY_DIMENSION));

export function normalizeTaxApplicabilityValue(value) {
  const normalized = String(value || '').toUpperCase();
  if (!Object.values(TAX_APPLICABILITY_VALUE).includes(normalized)) {
    throw new TypeError(`TaxApplicabilityProfile valor no soportado: ${value}`);
  }
  return normalized;
}

export function createEmptyTaxApplicabilityAnswers() {
  return Object.freeze(Object.fromEntries(
    TAX_APPLICABILITY_DIMENSIONS.map(dimension => [dimension, TAX_APPLICABILITY_VALUE.UNKNOWN])
  ));
}

export function normalizeTaxApplicabilityAnswers(answers = {}) {
  const unknownKeys = Object.keys(answers).filter(key => !TAX_APPLICABILITY_DIMENSIONS.includes(key));
  if (unknownKeys.length > 0) {
    throw new TypeError(`TaxApplicabilityProfile dimensión no soportada: ${unknownKeys.join(', ')}`);
  }
  return Object.freeze(Object.fromEntries(
    TAX_APPLICABILITY_DIMENSIONS.map(dimension => [
      dimension,
      answers[dimension] == null
        ? TAX_APPLICABILITY_VALUE.UNKNOWN
        : normalizeTaxApplicabilityValue(answers[dimension])
    ])
  ));
}

export function createTaxApplicabilityProfile({
  annualWorkspaceId,
  commercialYear,
  answers = {},
  profileVersion = TAX_APPLICABILITY_PROFILE_VERSION,
  updatedAt
}) {
  if (typeof annualWorkspaceId !== 'string' || !annualWorkspaceId.trim()) {
    throw new TypeError('TaxApplicabilityProfile requiere annualWorkspaceId');
  }
  if (Number(profileVersion) !== TAX_APPLICABILITY_PROFILE_VERSION) {
    throw new TypeError(`TaxApplicabilityProfile profileVersion no soportado: ${profileVersion}`);
  }
  if (typeof updatedAt !== 'string' || !updatedAt || Number.isNaN(Date.parse(updatedAt))) {
    throw new TypeError('TaxApplicabilityProfile requiere updatedAt ISO-8601 válido');
  }

  return Object.freeze({
    annualWorkspaceId: annualWorkspaceId.trim(),
    commercialYear: normalizeCommercialYear(commercialYear),
    profileVersion: TAX_APPLICABILITY_PROFILE_VERSION,
    answers: normalizeTaxApplicabilityAnswers(answers),
    updatedAt
  });
}
