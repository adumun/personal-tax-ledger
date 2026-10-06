import {
  WorkspaceContextMismatchError,
  assertAnnualWorkspaceContext
} from '@personal-tax-ledger/contracts';

export function createActiveWorkspaceGuard(resolveActiveContext) {
  return async function assertContextStillActive(context, operation) {
    const candidate = assertAnnualWorkspaceContext(context);
    if (!resolveActiveContext) return candidate;

    const active = assertAnnualWorkspaceContext(await resolveActiveContext());
    if (
      Number(active.commercialYear) !== Number(candidate.commercialYear)
      || active.annualWorkspaceId !== candidate.annualWorkspaceId
    ) {
      throw new WorkspaceContextMismatchError({
        expectedCommercialYear: Number(active.commercialYear),
        actualCommercialYear: Number(candidate.commercialYear),
        operation
      });
    }
    return candidate;
  };
}
