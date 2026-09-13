import { apiError as respondError, json as respond, readJsonBody } from './index.mjs';

export function createAnnualWorkspaceRouter({
  useCases,
  context,
  readBody = readJsonBody,
  json = respond,
  apiError = respondError
}) {
  return async function routeAnnualWorkspaces({ req, res, path }) {
    try {
      if (path === '/api/annual-workspaces' && req.method === 'GET') {
        json(res, 200, await useCases.listWorkspaceOptions(context));
        return true;
      }

      if (path === '/api/annual-workspaces/select' && req.method === 'POST') {
        const body = await readBody(req);
        json(res, 200, await useCases.selectWorkspace(context, body.commercialYear, {
          acceptWarnings: body.acceptWarnings === true
        }));
        return true;
      }

      if (path === '/api/annual-workspaces' && req.method === 'POST') {
        const body = await readBody(req);
        if (body.mode != null && body.mode !== 'EMPTY') {
          apiError(res, 400, 'unsupported_workspace_initialization_mode', 'Block 01 sólo permite Empezar vacío en este flujo');
          return true;
        }
        json(res, 201, await useCases.createEmptyWorkspace(context, body.commercialYear, {
          acceptWarnings: body.acceptWarnings === true
        }));
        return true;
      }

      return false;
    } catch (error) {
      if (error?.code === 'annual_workspace_not_found') {
        apiError(res, 404, error.code, error.message);
        return true;
      }
      if (error?.code === 'annual_workspace_already_exists') {
        apiError(res, 409, error.code, error.message);
        return true;
      }
      if (error?.code === 'tax_year_support_warning_confirmation_required') {
        apiError(res, 409, error.code, error.message);
        return true;
      }
      if (error?.code === 'unsupported_tax_year') {
        apiError(res, 422, error.code, error.message);
        return true;
      }
      throw error;
    }
  };
}
