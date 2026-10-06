export type AnnualWorkspaceOverview = {
  period: { commercialYear: number; derivedTaxYearLabel: string; lifecycleState: string; updatedAt: string | null };
  profile: { answeredCount: number; totalCount: number; pendingCount: number; needsReviewCount: number };
  information: {
    dependentIncomeSources: number;
    feeReceipts: number;
    mortgages: number;
    evidence: { state: 'UNAVAILABLE'; label: string };
  };
  rules: { state: 'SUPPORTED' | 'SUPPORTED_WITH_WARNINGS' | 'UNSUPPORTED'; missingRuleKeys: string[]; warnings: string[] };
};

export async function getAnnualWorkspaceOverview(): Promise<AnnualWorkspaceOverview> {
  const response = await fetch('/api/annual-workspace/overview');
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || 'No se pudo cargar el resumen del año tributario');
  return payload as AnnualWorkspaceOverview;
}
