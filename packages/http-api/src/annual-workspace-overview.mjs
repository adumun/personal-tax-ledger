export function createAnnualWorkspaceOverviewRouter({ useCases, resolveContext, json, apiError }) {
  return async function routeAnnualWorkspaceOverview({ req, res, path }) {
    if (path !== '/api/annual-workspace/overview' || req.method !== 'GET') return false;
    try {
      const context = await resolveContext();
      json(res, 200, await useCases.getAnnualWorkspaceOverview(context));
      return true;
    } catch (error) {
      const code = error?.code || 'unexpected';
      const status = code === 'active_workspace_not_found' ? 409 : 400;
      apiError(res, status, code, error instanceof Error ? error.message : 'Error inesperado');
      return true;
    }
  };
}
