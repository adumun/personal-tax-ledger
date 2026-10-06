export const ANNUAL_TAX_WORKSPACE_LIFECYCLE = Object.freeze({
  PREPARING: 'PREPARING'
});

export function normalizeCommercialYear(value) {
  const commercialYear = Number(value);
  if (!Number.isSafeInteger(commercialYear) || commercialYear <= 0 || commercialYear >= Number.MAX_SAFE_INTEGER) {
    throw new TypeError('AnnualTaxWorkspace requiere commercialYear entero positivo válido');
  }
  return commercialYear;
}

export function deriveTaxYearLabel(commercialYear) {
  const year = normalizeCommercialYear(commercialYear);
  return `AT${year + 1}`;
}

function normalizeOptionalRef(value, fieldName) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') throw new TypeError(`AnnualTaxWorkspace requiere ${fieldName} string o null`);
  return value;
}

function normalizeTimestamp(value, fieldName) {
  if (typeof value !== 'string' || !value || Number.isNaN(Date.parse(value))) {
    throw new TypeError(`AnnualTaxWorkspace requiere ${fieldName} ISO-8601 válido`);
  }
  return value;
}

export function createAnnualTaxWorkspace({
  id,
  commercialYear,
  lifecycleState = ANNUAL_TAX_WORKSPACE_LIFECYCLE.PREPARING,
  createdAt,
  updatedAt = createdAt,
  ruleVersionRef = null
}) {
  if (typeof id !== 'string' || !id.trim()) throw new TypeError('AnnualTaxWorkspace requiere id');
  const year = normalizeCommercialYear(commercialYear);
  if (!Object.values(ANNUAL_TAX_WORKSPACE_LIFECYCLE).includes(lifecycleState)) {
    throw new TypeError(`AnnualTaxWorkspace lifecycleState no soportado: ${lifecycleState}`);
  }

  return Object.freeze({
    id: id.trim(),
    commercialYear: year,
    derivedTaxYearLabel: deriveTaxYearLabel(year),
    lifecycleState,
    createdAt: normalizeTimestamp(createdAt, 'createdAt'),
    updatedAt: normalizeTimestamp(updatedAt, 'updatedAt'),
    ruleVersionRef: normalizeOptionalRef(ruleVersionRef, 'ruleVersionRef')
  });
}

export function assertAnnualTaxWorkspace(workspace) {
  const normalized = createAnnualTaxWorkspace(workspace);
  if (workspace.derivedTaxYearLabel != null && workspace.derivedTaxYearLabel !== normalized.derivedTaxYearLabel) {
    throw new TypeError('derivedTaxYearLabel debe derivarse de commercialYear');
  }
  return normalized;
}
