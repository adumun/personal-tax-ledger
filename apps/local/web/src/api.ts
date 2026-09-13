import type { IncomeSource, Settings, Reference, FeeReceipt, FeeExpenseSettings, MortgageLoan, MortgageAnnualRecord, TaxParameter, TaxRuleSource, Simulation, ExecutionLog, ExecutionLogPage } from './types';
import { apiErrorResponse, bootstrapResponse, executionLogFilters, executionLogPageResponse, executionLogRequest, feeExpenseSettingsRequest, feeReceiptFilters, feeReceiptRequest, incomeSourceRequest, mortgageAnnualRecordFilters, mortgageAnnualRecordRequest, mortgageLoanFilters, mortgageLoanRequest, scenariosResponse, settingsRequest, snapshotRequest, snapshotResponse, taxParametersFilters, taxParametersRequest, taxRuleSourceFilters, taxRuleSourceRequest, yearsResponse } from '@personal-tax-ledger/api-contracts';
import { createIncomeService } from '@personal-tax-ledger/frontend-application';

type FeeReceiptComputed = Pick<FeeReceipt, 'grossAmount' | 'netAmount' | 'withheldAmount' | 'ppmPaidAmount' | 'withholdingRate'>;

export type TaxYearSupportState = 'SUPPORTED' | 'SUPPORTED_WITH_WARNINGS' | 'UNSUPPORTED';
export type AnnualWorkspace = {
  id: string;
  commercialYear: number;
  derivedTaxYearLabel: string;
  lifecycleState: 'PREPARING';
  createdAt: string;
  updatedAt: string;
  ruleVersionRef: string | null;
};
export type AnnualWorkspaceSupport = {
  commercialYear: number;
  state: TaxYearSupportState;
  missingRuleKeys: string[];
  warnings: string[];
};
export type AnnualWorkspaceOption = { workspace: AnnualWorkspace; support: AnnualWorkspaceSupport };
export type AnnualWorkspaceList = { activeCommercialYear: number; workspaces: AnnualWorkspaceOption[] };
export type AnnualWorkspaceTransitionResult = { workspace: AnnualWorkspace; support: AnnualWorkspaceSupport; activeCommercialYear: number };

export type ApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
};

export class ApiRequestError extends Error {
  code: string;
  fieldErrors?: Record<string, string>;
  constructor(body: ApiError) {
    super(body.message);
    this.code = body.code;
    this.fieldErrors = body.fieldErrors;
  }
}

export class StaleWorkspaceResponseError extends Error {
  readonly code = 'stale_workspace_response';
  constructor(
    readonly requestGeneration: number,
    readonly activeGeneration: number,
    readonly url: string
  ) {
    super('Se descartó una respuesta perteneciente a un workspace anual anterior');
    this.name = 'StaleWorkspaceResponseError';
  }
}

export class WorkspaceTransitionCancelledError extends Error {
  readonly code = 'workspace_transition_cancelled';
  constructor(readonly fromCommercialYear: number, readonly toCommercialYear: number) {
    super(`Cambio de año cancelado. Continúas trabajando en ${fromCommercialYear}.`);
    this.name = 'WorkspaceTransitionCancelledError';
  }
}

let workspaceGeneration = 0;
let activeCommercialYear: number | null = null;

function normalizeCommercialYear(value: unknown): number | null {
  const year = Number(value);
  return Number.isSafeInteger(year) && year > 0 ? year : null;
}

function observeActiveCommercialYear(value: unknown) {
  const year = normalizeCommercialYear(value);
  if (year == null) return;
  if (activeCommercialYear == null) {
    activeCommercialYear = year;
    return;
  }
  if (activeCommercialYear !== year) {
    activeCommercialYear = year;
    workspaceGeneration += 1;
  }
}

function confirmWorkspaceTransition(targetYear: number | null) {
  if (targetYear == null || activeCommercialYear == null || targetYear === activeCommercialYear) return;
  const fromYear = activeCommercialYear;
  const confirmed = typeof window === 'undefined' || window.confirm(
    `Cambiar de año de ${fromYear} a ${targetYear} descartará cualquier formulario o cambio no guardado del año ${fromYear}.\n\n¿Descartar y cambiar?`
  );
  if (!confirmed) throw new WorkspaceTransitionCancelledError(fromYear, targetYear);
}

function beginWorkspaceTransition(value: unknown) {
  const targetYear = normalizeCommercialYear(value);
  confirmWorkspaceTransition(targetYear);
  const previous = { year: activeCommercialYear, generation: workspaceGeneration };
  if (targetYear != null && targetYear !== activeCommercialYear) {
    activeCommercialYear = targetYear;
    workspaceGeneration += 1;
  }
  return { ...previous, targetYear, transitionGeneration: workspaceGeneration };
}

function rollbackWorkspaceTransition(transition: ReturnType<typeof beginWorkspaceTransition>) {
  if (
    transition.targetYear != null
    && activeCommercialYear === transition.targetYear
    && workspaceGeneration === transition.transitionGeneration
  ) {
    activeCommercialYear = transition.year;
    workspaceGeneration += 1;
  }
}

async function request<T>(url: string, options?: RequestInit, guardWorkspaceGeneration = true): Promise<T> {
  const requestGeneration = workspaceGeneration;
  const response = await fetch(url, { headers: { 'content-type': 'application/json', ...(options?.headers || {}) }, ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ code: 'unexpected', message: response.statusText }));
    throw new ApiRequestError(apiErrorResponse(body as ApiError));
  }
  const result = response.status === 204 ? undefined as T : await response.json() as T;
  if (guardWorkspaceGeneration && requestGeneration !== workspaceGeneration) {
    throw new StaleWorkspaceResponseError(requestGeneration, workspaceGeneration, url);
  }
  return result;
}

function qs(params: Record<string, string | number | undefined | null>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '') continue;
    u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : '';
}

async function annualWorkspaceTransition(
  commercialYear: number,
  operation: () => Promise<AnnualWorkspaceTransitionResult>
) {
  const transition = beginWorkspaceTransition(commercialYear);
  try {
    const result = await operation();
    observeActiveCommercialYear(result.activeCommercialYear);
    return result;
  } catch (error) {
    rollbackWorkspaceTransition(transition);
    throw error;
  }
}

export const api = {
  bootstrap: async () => {
    const data = bootstrapResponse(await request<{ settings: Settings; sources: IncomeSource[]; references: Reference[] }>('/api/bootstrap')) as unknown as { settings: Settings; sources: IncomeSource[]; references: Reference[] };
    observeActiveCommercialYear(data.settings.year);
    return data;
  },
  listAnnualWorkspaces: () => request<AnnualWorkspaceList>('/api/annual-workspaces', undefined, false),
  selectAnnualWorkspace: (commercialYear: number, acceptWarnings = false) => annualWorkspaceTransition(
    commercialYear,
    () => request<AnnualWorkspaceTransitionResult>('/api/annual-workspaces/select', {
      method: 'POST', body: JSON.stringify({ commercialYear, acceptWarnings })
    }, false)
  ),
  createAnnualWorkspace: (commercialYear: number, acceptWarnings = false) => annualWorkspaceTransition(
    commercialYear,
    () => request<AnnualWorkspaceTransitionResult>('/api/annual-workspaces', {
      method: 'POST', body: JSON.stringify({ commercialYear, mode: 'EMPTY', acceptWarnings })
    }, false)
  ),
  listYears: async () => yearsResponse(await request<unknown>('/api/years', undefined, false)),
  listIncomes: (taxYear?: number) => request<IncomeSource[]>(`/api/incomes${qs({ taxYear })}`),
  createIncome: (source: IncomeSource) => request<IncomeSource>('/api/incomes', { method: 'POST', body: JSON.stringify(incomeSourceRequest(source)) }),
  updateIncome: (source: IncomeSource) => request<IncomeSource>(`/api/incomes/${source.id}`, { method: 'PUT', body: JSON.stringify(incomeSourceRequest(source)) }),
  deleteIncome: (id: number) => request<void>(`/api/incomes/${id}`, { method: 'DELETE' }),
  copyIncomes: (fromTaxYear: number, toTaxYear: number) => request<IncomeSource[]>('/api/incomes/copy', { method: 'POST', body: JSON.stringify({ fromTaxYear, toTaxYear }) }),
  updateSettings: async (settings: Settings) => {
    const transition = beginWorkspaceTransition(settings.year);
    try {
      const updated = await request<Settings>('/api/settings', { method: 'PUT', body: JSON.stringify(settingsRequest(settings)) });
      observeActiveCommercialYear(updated.year);
      return updated;
    } catch (error) {
      rollbackWorkspaceTransition(transition);
      throw error;
    }
  },

  listFeeReceipts: (filters: { taxYear?: number | string; clientName?: string; status?: string; paymentStatus?: string; withholdingMode?: string } = {}) =>
    request<FeeReceipt[]>(`/api/fee-receipts${qs(feeReceiptFilters(filters))}`),
  createFeeReceipt: (receipt: FeeReceipt) => request<FeeReceipt>('/api/fee-receipts', { method: 'POST', body: JSON.stringify(feeReceiptRequest(receipt)) }),
  updateFeeReceipt: (receipt: FeeReceipt) => request<FeeReceipt>(`/api/fee-receipts/${receipt.id}`, { method: 'PUT', body: JSON.stringify(feeReceiptRequest(receipt)) }),
  deleteFeeReceipt: (id: string) => request<void>(`/api/fee-receipts/${id}`, { method: 'DELETE' }),
  duplicateFeeReceipt: (id: string) => request<FeeReceipt>(`/api/fee-receipts/${id}/duplicate`, { method: 'POST' }),
  computeFeeReceipt: (receipt: Partial<FeeReceipt>, settings?: Partial<Settings>) => request<FeeReceiptComputed>('/api/fee-receipt-calc', { method: 'POST', body: JSON.stringify({ receipt, settings }) }),

  listFeeExpenseSettings: () => request<FeeExpenseSettings[]>('/api/fee-expense-settings'),
  upsertFeeExpenseSettings: (settings: FeeExpenseSettings) => request<FeeExpenseSettings>('/api/fee-expense-settings', { method: 'PUT', body: JSON.stringify(feeExpenseSettingsRequest(settings)) }),
  getFeeExpenseSettings: (taxYear: number) => request<FeeExpenseSettings>(`/api/fee-expense-settings/${taxYear}`),

  listMortgages: (filters: { taxYear?: number | string; institutionName?: string; propertyAlias?: string } = {}) =>
    request<MortgageLoan[]>(`/api/mortgages${qs(mortgageLoanFilters(filters))}`),
  createMortgage: (loan: MortgageLoan) => request<MortgageLoan>('/api/mortgages', { method: 'POST', body: JSON.stringify(mortgageLoanRequest(loan)) }),
  updateMortgage: (loan: MortgageLoan) => request<MortgageLoan>(`/api/mortgages/${loan.id}`, { method: 'PUT', body: JSON.stringify(mortgageLoanRequest(loan)) }),
  deleteMortgage: (id: string) => request<void>(`/api/mortgages/${id}`, { method: 'DELETE' }),

  listAnnualRecords: (loanId: string, filters: { taxYear?: number | string } = {}) =>
    request<MortgageAnnualRecord[]>(`/api/mortgages/${loanId}/annual-records${qs(mortgageAnnualRecordFilters(filters))}`),
  createAnnualRecord: (loanId: string, record: MortgageAnnualRecord) =>
    request<MortgageAnnualRecord>(`/api/mortgages/${loanId}/annual-records`, { method: 'POST', body: JSON.stringify(mortgageAnnualRecordRequest(record)) }),
  updateAnnualRecord: (record: MortgageAnnualRecord) =>
    request<MortgageAnnualRecord>(`/api/mortgage-annual-records/${record.id}`, { method: 'PUT', body: JSON.stringify(mortgageAnnualRecordRequest(record)) }),
  deleteAnnualRecord: (id: string) => request<void>(`/api/mortgage-annual-records/${id}`, { method: 'DELETE' }),

  listTaxParameters: (taxYear: number) => request<TaxParameter[]>(`/api/tax-parameters${qs(taxParametersFilters({ taxYear }))}`),
  updateTaxParameters: (taxYear: number, values: Record<string, number | string>) =>
    request<Record<string, TaxParameter>>('/api/tax-parameters', { method: 'PUT', body: JSON.stringify(taxParametersRequest({ taxYear, values })) }),

  listTaxRuleSources: (filters: { ruleKey?: string; taxYear?: number } = {}) =>
    request<TaxRuleSource[]>(`/api/tax-rule-sources${qs(taxRuleSourceFilters(filters))}`, undefined, false),
  createTaxRuleSource: (s: TaxRuleSource) => request<TaxRuleSource>('/api/tax-rule-sources', { method: 'POST', body: JSON.stringify(taxRuleSourceRequest(s)) }, false),
  deleteTaxRuleSource: (id: string) => request<void>(`/api/tax-rule-sources/${id}`, { method: 'DELETE' }, false),

  listExecutionLogs: (filters: { kind?: string; status?: string; operation?: string; q?: string; page?: number; pageSize?: number } = {}) =>
    request<ExecutionLogPage>(`/api/logs${qs(executionLogFilters(filters))}`, undefined, false).then(value => executionLogPageResponse(value as unknown as Partial<import('@personal-tax-ledger/api-contracts').ExecutionLogPageResponse>) as unknown as ExecutionLogPage),
  createExecutionLog: (entry: { kind: 'SYNC' | 'ASYNC'; operation: string; status: 'OK' | 'ERROR'; message?: string | null; auditMessage?: string | null; durationMs?: number }) =>
    request<ExecutionLog>('/api/logs', { method: 'POST', body: JSON.stringify(executionLogRequest(entry)) }, false),

  simulate: (payload: { sources?: IncomeSource[]; settings?: Partial<Settings>; extraApv?: { annualAmount: number; regime: 'A' | 'B' | 'NONE' }; feeReceipts?: FeeReceipt[]; mortgages?: MortgageLoan[]; annualRecords?: MortgageAnnualRecord[] }) =>
    request<Simulation>('/api/simulate', { method: 'POST', body: JSON.stringify(payload) }),
  compareApv: (annualContribution: number, sources?: IncomeSource[], settings?: Partial<Settings>, modules?: { feeReceipts?: FeeReceipt[]; mortgages?: MortgageLoan[]; annualRecords?: MortgageAnnualRecord[] }) =>
    request<any>('/api/compare-apv', { method: 'POST', body: JSON.stringify({ annualContribution, sources, settings, ...modules }) }),
  buildScenarios: (payload: { sources?: IncomeSource[]; settings?: Partial<Settings>; feeReceipts?: FeeReceipt[]; mortgages?: MortgageLoan[]; annualRecords?: MortgageAnnualRecord[] }) =>
    request<unknown[]>('/api/scenarios', { method: 'POST', body: JSON.stringify(payload) }).then(value => scenariosResponse(value) as any),
  saveSnapshot: (name: string, payload: Record<string, unknown>) => request<{ id: number; result: unknown }>('/api/snapshots', { method: 'POST', body: JSON.stringify(snapshotRequest({ name, payload })) }).then(snapshotResponse),
  article55Bis: (payload: { mortgages: MortgageLoan[]; annualRecords: MortgageAnnualRecord[]; incomeEstimate: number; settings?: Partial<Settings> }) =>
    request<any>('/api/article-55-bis', { method: 'POST', body: JSON.stringify(payload) })
};

export const incomeService = createIncomeService(api);
