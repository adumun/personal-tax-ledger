export type PriorYearInitializationPreview = {
  sourceCommercialYear: number;
  targetCommercialYear: number;
  targetAlreadyExists: boolean;
  categories: Array<{ key: string; label: string; available: boolean; selectedByDefault: boolean }>;
  forbiddenCopy: string[];
};

async function parse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw Object.assign(new Error(payload?.message || 'No se pudo inicializar el año'), { code: payload?.code });
  return payload as T;
}

export const priorYearInitializationClient = {
  async preview(sourceCommercialYear: number, targetCommercialYear: number) {
    const query = new URLSearchParams({
      sourceCommercialYear: String(sourceCommercialYear),
      targetCommercialYear: String(targetCommercialYear)
    });
    return parse<PriorYearInitializationPreview>(await fetch(`/api/annual-workspace/prior-year-initialization?${query}`));
  },

  async initialize(input: {
    sourceCommercialYear: number;
    targetCommercialYear: number;
    categories: string[];
    acceptWarnings?: boolean;
  }) {
    return parse<any>(await fetch('/api/annual-workspace/prior-year-initialization', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input)
    }));
  }
};
