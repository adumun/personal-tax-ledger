export type ForeignServiceIncome = {
  id: string;
  taxYear: number;
  payerName: string;
  payerCountry: string;
  serviceSourceJurisdiction: 'FOREIGN';
  receivedAt: string | null;
  originalAmount: number;
  originalCurrency: string;
  description: string | null;
  currentConversionId: string | null;
  foreignTaxAmountOriginal: number | null;
  foreignTaxCurrency: string | null;
  foreignTaxPaidAt: string | null;
  foreignTaxDocumentReference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ForeignServiceConversion = {
  id: string;
  foreignServiceIncomeId: string;
  originalAmount: number;
  originalCurrency: string;
  fxRate: number;
  fxRateDate: string;
  fxSource: 'BCCH' | 'MANUAL';
  fxSourceReference: string;
  fxReason: string | null;
  clpAmount: number;
  conversionStatus: 'RESOLVED' | 'NEEDS_REVIEW';
  supersedesConversionId: string | null;
  createdAt: string;
};

export type FeeReceiptForeignSettlement = {
  feeReceiptId: string;
  payerCountry: string;
  serviceSourceJurisdiction: 'CHILE';
  receivedAmount: number;
  receivedCurrency: string;
  receivedAt: string;
  providerReference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type OfficialResolution =
  | { status: 'RESOLVED'; conversion: ForeignServiceConversion }
  | { status: 'NEEDS_REVIEW'; reason: string };

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'content-type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `No se pudo completar la operación (${response.status})`);
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
}

async function requestOptional<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { headers: { 'content-type': 'application/json' } });
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `No se pudo completar la operación (${response.status})`);
  }
  return await response.json() as T;
}

export const foreignServiceClient = Object.freeze({
  list: () => request<ForeignServiceIncome[]>('/api/foreign-service-income'),
  get: (id: string) => request<ForeignServiceIncome>(`/api/foreign-service-income/${id}`),
  create: (input: Omit<ForeignServiceIncome, 'id' | 'createdAt' | 'updatedAt' | 'currentConversionId'> & { currentConversionId?: never }) =>
    request<ForeignServiceIncome>('/api/foreign-service-income', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: Partial<ForeignServiceIncome>) =>
    request<ForeignServiceIncome>(`/api/foreign-service-income/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  listConversions: (id: string) => request<ForeignServiceConversion[]>(`/api/foreign-service-income/${id}/conversions`),
  resolveOfficial: (id: string) => request<OfficialResolution>(`/api/foreign-service-income/${id}/conversions/official`, { method: 'POST' }),
  addManualConversion: (id: string, input: { fxRate: number; fxRateDate: string; fxSourceReference: string; fxReason: string }) =>
    request<ForeignServiceConversion>(`/api/foreign-service-income/${id}/conversions/manual`, { method: 'POST', body: JSON.stringify(input) }),
  getSettlement: (feeReceiptId: string) => requestOptional<FeeReceiptForeignSettlement>(`/api/fee-receipts/${feeReceiptId}/foreign-settlement`),
  saveSettlement: (feeReceiptId: string, input: Omit<FeeReceiptForeignSettlement, 'feeReceiptId' | 'serviceSourceJurisdiction' | 'createdAt' | 'updatedAt'>) =>
    request<FeeReceiptForeignSettlement>(`/api/fee-receipts/${feeReceiptId}/foreign-settlement`, {
      method: 'PUT',
      body: JSON.stringify({ ...input, serviceSourceJurisdiction: 'CHILE' })
    })
});
