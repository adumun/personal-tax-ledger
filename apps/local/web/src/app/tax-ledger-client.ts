export type TaxLedgerFilters = {
  entryKind?: string;
  ownerAggregate?: string;
  recognitionState?: string;
};

export type TaxLedgerAmountTotal = {
  amount: number;
  presentCount: number;
  missingCount: number;
};

export type AnnualTaxLedgerResult = {
  annualWorkspaceId: string;
  commercialYear: number;
  filters: {
    entryKind: string | null;
    ownerAggregate: string | null;
    recognitionState: string | null;
  };
  entries: unknown[];
  factualSummary: {
    entryCount: number;
    recognitionCounts: Record<string, number>;
    totalsByCurrency: Record<string, Record<'gross' | 'withholding' | 'ppm' | 'net', TaxLedgerAmountTotal>>;
  };
};

function queryString(filters: TaxLedgerFilters) {
  const query = new URLSearchParams();
  if (filters.entryKind) query.set('entryKind', filters.entryKind);
  if (filters.ownerAggregate) query.set('ownerAggregate', filters.ownerAggregate);
  if (filters.recognitionState) query.set('recognitionState', filters.recognitionState);
  const encoded = query.toString();
  return encoded ? `?${encoded}` : '';
}

async function parse(response: Response): Promise<AnnualTaxLedgerResult> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw Object.assign(new Error(payload?.message || 'No se pudo leer el ledger tributario anual'), {
      code: payload?.code || 'tax_ledger_request_failed'
    });
  }
  return payload as AnnualTaxLedgerResult;
}

export const taxLedgerClient = Object.freeze({
  async list(filters: TaxLedgerFilters = {}) {
    return parse(await fetch(`/api/tax-ledger${queryString(filters)}`));
  }
});
