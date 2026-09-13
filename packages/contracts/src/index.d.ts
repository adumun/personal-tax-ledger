export type WorkspaceContext = { workspaceId: string; actorId: string };
export type AnnualWorkspaceContext = WorkspaceContext & { annualWorkspaceId: string; commercialYear: number };
export class WorkspaceContextMismatchError extends Error {
  code: 'workspace_year_mismatch';
  operation: string;
  expectedCommercialYear: number;
  actualCommercialYear: number;
}
export function assertWorkspaceContext(context: unknown): WorkspaceContext;
export function assertAnnualWorkspaceContext(context: unknown): AnnualWorkspaceContext;
export function createAnnualWorkspaceContext(baseContext: WorkspaceContext, annualWorkspace: { id: string; commercialYear: number }): AnnualWorkspaceContext;
export function assertContextCommercialYear(context: AnnualWorkspaceContext, commercialYear: number, operation?: string): number;
export const LOCAL_WORKSPACE_CONTEXT: WorkspaceContext;

export type IncomeSourceRecord = Record<string, unknown> & { id?: number; taxYear: number; name: string; kind: string; amount: number };
export interface IncomeSourceRepository {
  list(context: WorkspaceContext, taxYear?: number): Promise<IncomeSourceRecord[]>;
  get(context: WorkspaceContext, id: number): Promise<IncomeSourceRecord | null>;
  create(context: WorkspaceContext, input: IncomeSourceRecord): Promise<IncomeSourceRecord>;
  update(context: WorkspaceContext, id: number, input: IncomeSourceRecord): Promise<IncomeSourceRecord | null>;
  remove(context: WorkspaceContext, id: number): Promise<boolean>;
  copy(context: WorkspaceContext, fromTaxYear: number, toTaxYear: number): Promise<IncomeSourceRecord[] | null>;
}
export const INCOME_REPOSITORY_METHODS: readonly string[];
export function assertIncomeRepositoryContract(repository: unknown): IncomeSourceRepository;

export type SettingsRecord = Record<string, unknown> & { year: number };
export interface SettingsRepository {
  get(context: WorkspaceContext): Promise<SettingsRecord>;
  update(context: WorkspaceContext, data: SettingsRecord): Promise<SettingsRecord>;
}
export const SETTINGS_REPOSITORY_METHODS: readonly string[];
export function assertSettingsRepositoryContract(repository: unknown): SettingsRepository;

export type ExecutionLogEntry = {
  kind: 'SYNC' | 'ASYNC';
  operation: string;
  status: 'OK' | 'ERROR';
  message?: string | null;
  auditMessage?: string | null;
  durationMs?: number;
};
export type ExecutionLogRecord = ExecutionLogEntry & { id: number; createdAt: string };
export type ExecutionLogFilters = { kind?: string; status?: string; operation?: string; q?: string; page?: number | string; pageSize?: number | string };
export type ExecutionLogPage = { items: ExecutionLogRecord[]; total: number; page: number; pageSize: number };
export interface ExecutionLogRepository {
  create(context: WorkspaceContext, entry: ExecutionLogEntry): Promise<ExecutionLogRecord>;
  list(context: WorkspaceContext, filters?: ExecutionLogFilters): Promise<ExecutionLogPage>;
}
export const EXECUTION_LOG_REPOSITORY_METHODS: readonly string[];
export function assertExecutionLogRepositoryContract(repository: unknown): ExecutionLogRepository;

export type FeeReceiptRecord = Record<string, unknown> & { id?: string; taxYear: number; clientName: string };
export type FeeReceiptFilters = { taxYear?: number | string; clientName?: string; status?: string; paymentStatus?: string; withholdingMode?: string };
export interface FeeReceiptRepository {
  list(context: WorkspaceContext, filters?: FeeReceiptFilters): Promise<FeeReceiptRecord[]>;
  get(context: WorkspaceContext, id: string): Promise<FeeReceiptRecord | null>;
  create(context: WorkspaceContext, input: FeeReceiptRecord): Promise<FeeReceiptRecord>;
  update(context: WorkspaceContext, id: string, input: FeeReceiptRecord): Promise<FeeReceiptRecord | null>;
  remove(context: WorkspaceContext, id: string): Promise<boolean>;
  duplicate(context: WorkspaceContext, id: string): Promise<FeeReceiptRecord | null>;
}
export const FEE_RECEIPT_REPOSITORY_METHODS: readonly string[];
export function assertFeeReceiptRepositoryContract(repository: unknown): FeeReceiptRepository;

export type FeeExpenseSettingsRecord = Record<string, unknown> & { id?: string; taxYear: number };
export interface FeeExpenseSettingsRepository {
  list(context: WorkspaceContext): Promise<FeeExpenseSettingsRecord[]>;
  get(context: WorkspaceContext, taxYear: number): Promise<FeeExpenseSettingsRecord | null>;
  upsert(context: WorkspaceContext, taxYear: number, data: FeeExpenseSettingsRecord): Promise<FeeExpenseSettingsRecord>;
}
export const FEE_EXPENSE_SETTINGS_REPOSITORY_METHODS: readonly string[];
export function assertFeeExpenseSettingsRepositoryContract(repository: unknown): FeeExpenseSettingsRepository;

export type MortgageLoanRecord = Record<string, unknown> & { id?: string; taxYear: number; institutionName: string; propertyAlias: string };
export type MortgageLoanFilters = { taxYear?: number | string; institutionName?: string; propertyAlias?: string };
export interface MortgageRepository {
  list(context: WorkspaceContext, filters?: MortgageLoanFilters): Promise<MortgageLoanRecord[]>;
  get(context: WorkspaceContext, id: string): Promise<MortgageLoanRecord | null>;
  create(context: WorkspaceContext, input: MortgageLoanRecord): Promise<MortgageLoanRecord>;
  update(context: WorkspaceContext, id: string, input: MortgageLoanRecord): Promise<MortgageLoanRecord | null>;
  remove(context: WorkspaceContext, id: string): Promise<boolean>;
}
export const MORTGAGE_REPOSITORY_METHODS: readonly string[];
export function assertMortgageRepositoryContract(repository: unknown): MortgageRepository;

export type MortgageAnnualRecordRecord = Record<string, unknown> & { id?: string; mortgageLoanId: string; taxYear: number };
export interface MortgageAnnualRecordRepository {
  listByLoan(context: WorkspaceContext, mortgageLoanId: string, filters?: { taxYear?: number | string }): Promise<MortgageAnnualRecordRecord[]>;
  listByYear(context: WorkspaceContext, taxYear: number): Promise<MortgageAnnualRecordRecord[]>;
  get(context: WorkspaceContext, id: string): Promise<MortgageAnnualRecordRecord | null>;
  create(context: WorkspaceContext, mortgageLoanId: string, input: MortgageAnnualRecordRecord): Promise<MortgageAnnualRecordRecord>;
  update(context: WorkspaceContext, id: string, input: MortgageAnnualRecordRecord): Promise<MortgageAnnualRecordRecord | null>;
  remove(context: WorkspaceContext, id: string): Promise<boolean>;
}
export const MORTGAGE_ANNUAL_RECORD_REPOSITORY_METHODS: readonly string[];
export function assertMortgageAnnualRecordRepositoryContract(repository: unknown): MortgageAnnualRecordRepository;

export type TaxParameterRecord = { ruleKey: string; value: number | string; type: string; description?: string; updatedAt?: string };
export interface TaxParameterRepository {
  list(context: null, taxYear: number): Promise<TaxParameterRecord[]>;
  get(context: null, taxYear: number, ruleKey: string): Promise<TaxParameterRecord | null>;
  upsert(context: null, taxYear: number, ruleKey: string, value: number | string, type?: string, description?: string): Promise<TaxParameterRecord | null>;
}
export const TAX_PARAMETER_REPOSITORY_METHODS: readonly string[];
export function assertTaxParameterRepositoryContract(repository: unknown): TaxParameterRepository;

export type TaxRuleSourceRecord = { id: string; ruleKey: string; taxYear: number; institution: string; title: string; sourceUrl: string; retrievedAt: string; notes?: string };
export interface TaxRuleSourceRepository {
  list(context: null, ruleKey?: string, taxYear?: number): Promise<TaxRuleSourceRecord[]>;
  upsert(context: null, source: TaxRuleSourceRecord): Promise<TaxRuleSourceRecord | undefined>;
  remove(context: null, id: string): Promise<boolean>;
}
export const TAX_RULE_SOURCE_REPOSITORY_METHODS: readonly string[];
export function assertTaxRuleSourceRepositoryContract(repository: unknown): TaxRuleSourceRepository;

export type AnnualTaxWorkspaceRecord = {
  id: string;
  commercialYear: number;
  derivedTaxYearLabel: string;
  lifecycleState: 'PREPARING';
  createdAt: string;
  updatedAt: string;
  ruleVersionRef: string | null;
};
export interface AnnualTaxWorkspaceRepository {
  list(context?: WorkspaceContext | null): Promise<AnnualTaxWorkspaceRecord[]>;
  getByCommercialYear(context: WorkspaceContext | null, commercialYear: number): Promise<AnnualTaxWorkspaceRecord | null>;
  create(context: WorkspaceContext | null, workspace: AnnualTaxWorkspaceRecord): Promise<AnnualTaxWorkspaceRecord>;
  remove(context: WorkspaceContext | null, commercialYear: number): Promise<boolean>;
}
export const ANNUAL_TAX_WORKSPACE_REPOSITORY_METHODS: readonly string[];
export function assertAnnualTaxWorkspaceRepositoryContract(repository: unknown): AnnualTaxWorkspaceRepository;

export type TaxApplicabilityValue = 'YES' | 'NO' | 'UNKNOWN';
export type TaxApplicabilityDimension = 'DEPENDENT_INCOME' | 'DOMESTIC_FEE_INCOME' | 'FOREIGN_SERVICE_INCOME' | 'APV_CONTRIBUTIONS' | 'MORTGAGE_INTEREST';
export type TaxApplicabilityProfileRecord = {
  annualWorkspaceId: string;
  commercialYear: number;
  profileVersion: 1;
  answers: Record<TaxApplicabilityDimension, TaxApplicabilityValue>;
  updatedAt: string;
};
export interface TaxApplicabilityProfileRepository {
  get(context: AnnualWorkspaceContext, annualWorkspaceId: string): Promise<TaxApplicabilityProfileRecord | null>;
  upsert(context: AnnualWorkspaceContext, profile: TaxApplicabilityProfileRecord): Promise<TaxApplicabilityProfileRecord>;
}
export const TAX_APPLICABILITY_PROFILE_REPOSITORY_METHODS: readonly string[];
export function assertTaxApplicabilityProfileRepositoryContract(repository: unknown): TaxApplicabilityProfileRepository;
