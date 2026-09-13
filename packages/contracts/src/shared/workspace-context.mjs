export class WorkspaceContextMismatchError extends Error {
  constructor({ expectedCommercialYear, actualCommercialYear, operation = 'year-scoped operation' }) {
    super(`El contexto anual activo (${expectedCommercialYear}) no coincide con el año de la operación (${actualCommercialYear})`);
    this.name = 'WorkspaceContextMismatchError';
    this.code = 'workspace_year_mismatch';
    this.operation = operation;
    this.expectedCommercialYear = expectedCommercialYear;
    this.actualCommercialYear = actualCommercialYear;
  }
}

export function assertWorkspaceContext(context) {
  if (!context || typeof context.workspaceId !== 'string' || !context.workspaceId || typeof context.actorId !== 'string' || !context.actorId) {
    throw new TypeError('WorkspaceContext requiere workspaceId y actorId');
  }
  return context;
}

export function assertAnnualWorkspaceContext(context) {
  assertWorkspaceContext(context);
  if (typeof context.annualWorkspaceId !== 'string' || !context.annualWorkspaceId) {
    throw new TypeError('AnnualWorkspaceContext requiere annualWorkspaceId');
  }
  if (!Number.isSafeInteger(Number(context.commercialYear)) || Number(context.commercialYear) <= 0) {
    throw new TypeError('AnnualWorkspaceContext requiere commercialYear entero positivo');
  }
  return context;
}

export function createAnnualWorkspaceContext(baseContext, annualWorkspace) {
  assertWorkspaceContext(baseContext);
  if (!annualWorkspace || typeof annualWorkspace.id !== 'string' || !annualWorkspace.id) {
    throw new TypeError('AnnualWorkspaceContext requiere AnnualTaxWorkspace válido');
  }
  const commercialYear = Number(annualWorkspace.commercialYear);
  if (!Number.isSafeInteger(commercialYear) || commercialYear <= 0) {
    throw new TypeError('AnnualWorkspaceContext requiere commercialYear entero positivo');
  }
  return Object.freeze({
    ...baseContext,
    annualWorkspaceId: annualWorkspace.id,
    commercialYear
  });
}

export function assertContextCommercialYear(context, commercialYear, operation) {
  const annualContext = assertAnnualWorkspaceContext(context);
  const actualCommercialYear = Number(commercialYear);
  if (!Number.isSafeInteger(actualCommercialYear) || actualCommercialYear <= 0) {
    throw new TypeError('La operación anual requiere commercialYear entero positivo');
  }
  if (actualCommercialYear !== Number(annualContext.commercialYear)) {
    throw new WorkspaceContextMismatchError({
      expectedCommercialYear: Number(annualContext.commercialYear),
      actualCommercialYear,
      operation
    });
  }
  return actualCommercialYear;
}

export const LOCAL_WORKSPACE_CONTEXT = Object.freeze({ workspaceId: 'local-workspace', actorId: 'local-user' });
