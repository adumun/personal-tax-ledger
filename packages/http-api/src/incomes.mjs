import { apiError as respondError, json as respond } from './http-errors.mjs';
import { readJsonBody } from './read-json-body.mjs';
import { queryYear as parseQueryYear } from './query-params.mjs';

async function resolveRequestContext(context, resolveContext) {
  return resolveContext ? resolveContext() : context;
}

export function createIncomeRouter({ useCases, context, resolveContext, getSettings, queryYear = parseQueryYear, readBody = readJsonBody, json = respond, apiError = respondError, validateSource }) {
  return async function routeIncomes({ req, res, path, url }) {
    const requestContext = await resolveRequestContext(context, resolveContext);
    if (path === '/api/incomes' && req.method === 'GET') {
      const settings = await getSettings();
      json(res, 200, await useCases.listIncomeSources(requestContext, queryYear(url, settings.year)));
      return true;
    }
    if (path === '/api/incomes' && req.method === 'POST') {
      const body = await readBody(req);
      json(res, 201, await useCases.createIncomeSource(requestContext, await validateSource(body)));
      return true;
    }
    if (path === '/api/incomes/copy' && req.method === 'POST') {
      const body = await readBody(req);
      const copied = await useCases.copyIncomeSources(requestContext, body.fromTaxYear, body.toTaxYear);
      if (copied) json(res, 201, copied);
      else apiError(res, 409, 'already_exists', 'El año destino ya tiene ingresos guardados');
      return true;
    }
    const incomeMatch = path.match(/^\/api\/incomes\/(\d+)$/);
    if (incomeMatch && req.method === 'PUT') {
      const body = await readBody(req);
      const updated = await useCases.updateIncomeSource(requestContext, Number(incomeMatch[1]), await validateSource(body));
      if (updated) json(res, 200, updated);
      else apiError(res, 404, 'not_found', 'Ingreso no encontrado');
      return true;
    }
    if (incomeMatch && req.method === 'DELETE') {
      if (await useCases.deleteIncomeSource(requestContext, Number(incomeMatch[1]))) json(res, 204, {});
      else apiError(res, 404, 'not_found', 'Ingreso no encontrado');
      return true;
    }
    return false;
  };
}
