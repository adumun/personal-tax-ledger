import { apiError as respondError, json as respond, readJsonBody } from './index.mjs';

export function createPriorYearInitializationRouter({
  useCases,
  context,
  readBody = readJsonBody,
  json = respond,
  apiError = respondError
}) {
  return async function routePriorYearInitialization({ req, res, path, url }) {
    if (path !== '/api/annual-workspace/prior-year-initialization') return false;
    try {
      if (req.method === 'GET') {
        const sourceCommercialYear = Number(url.searchParams.get('sourceCommercialYear'));
        const targetCommercialYear = Number(url.searchParams.get('targetCommercialYear'));
        json(res, 200, await useCases.previewPriorYearInitialization(context, { sourceCommercialYear, targetCommercialYear }));
        return true;
      }
      if (req.method === 'POST') {
        const body = await readBody(req);
        json(res, 201, await useCases.initializeFromPriorYear(context, body));
        return true;
      }
      return false;
    } catch (error) {
      const code = error?.code || 'invalid_prior_year_initialization';
      const status = ['annual_workspace_already_exists', 'unsupported_tax_year', 'tax_year_support_warning_confirmation_required'].includes(code) ? 409 : 400;
      apiError(res, status, code, error instanceof Error ? error.message : 'Inicialización desde año anterior inválida');
      return true;
    }
  };
}
