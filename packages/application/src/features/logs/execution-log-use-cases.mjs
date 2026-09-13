import { assertExecutionLogRepositoryContract, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createExecutionLogUseCases({ repository, resolveActiveContext }) {
  assertExecutionLogRepositoryContract(repository);
  return {
    async createExecutionLog(context, entry) {
      assertWorkspaceContext(context);
      const effectiveContext = resolveActiveContext ? await resolveActiveContext() : context;
      const annualAudit = effectiveContext?.annualWorkspaceId && effectiveContext?.commercialYear
        ? `annualWorkspaceId=${effectiveContext.annualWorkspaceId} commercialYear=${effectiveContext.commercialYear}`
        : null;
      const auditMessage = [entry.auditMessage, annualAudit].filter(Boolean).join(' | ') || null;
      return repository.create(effectiveContext, { ...entry, auditMessage });
    },
    async listExecutionLogs(context, filters) {
      assertWorkspaceContext(context);
      return repository.list(context, filters);
    }
  };
}
