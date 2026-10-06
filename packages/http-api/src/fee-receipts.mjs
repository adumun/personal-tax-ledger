import { apiError as respondError, json as respond } from './http-errors.mjs';
import { readJsonBody } from './read-json-body.mjs';

async function resolveRequestContext(context, resolveContext) {
  return resolveContext ? resolveContext() : context;
}

export function createFeeReceiptRouter({ useCases, context, resolveContext, readBody = readJsonBody, json = respond, apiError = respondError }) {
  return async function routeFeeReceipts({ req, res, path, url }) {
    const requestContext = await resolveRequestContext(context, resolveContext);
    if (path === '/api/fee-receipts' && req.method === 'GET') {
      const filters = {
        taxYear: url.searchParams.get('taxYear'),
        clientName: url.searchParams.get('clientName'),
        status: url.searchParams.get('status'),
        paymentStatus: url.searchParams.get('paymentStatus'),
        withholdingMode: url.searchParams.get('withholdingMode')
      };
      json(res, 200, await useCases.listFeeReceipts(requestContext, filters));
      return true;
    }
    if (path === '/api/fee-receipts' && req.method === 'POST') {
      const body = await readBody(req);
      json(res, 201, await useCases.createFeeReceipt(requestContext, body));
      return true;
    }
    const feeMatch = path.match(/^\/api\/fee-receipts\/([^/]+)$/);
    if (feeMatch && req.method === 'GET') {
      const r = await useCases.getFeeReceipt(requestContext, feeMatch[1]);
      if (r) json(res, 200, r); else apiError(res, 404, 'not_found', 'Boleta no encontrada');
      return true;
    }
    if (feeMatch && req.method === 'PUT') {
      const updated = await useCases.updateFeeReceipt(requestContext, feeMatch[1], await readBody(req));
      if (updated) json(res, 200, updated); else apiError(res, 404, 'not_found', 'Boleta no encontrada');
      return true;
    }
    if (feeMatch && req.method === 'DELETE') {
      if (await useCases.deleteFeeReceipt(requestContext, feeMatch[1])) json(res, 204, {});
      else apiError(res, 404, 'not_found', 'Boleta no encontrada');
      return true;
    }
    const feeDupMatch = path.match(/^\/api\/fee-receipts\/([^/]+)\/duplicate$/);
    if (feeDupMatch && req.method === 'POST') {
      const r = await useCases.duplicateFeeReceipt(requestContext, feeDupMatch[1]);
      if (r) json(res, 201, r); else apiError(res, 404, 'not_found', 'Boleta no encontrada');
      return true;
    }
    return false;
  };
}

export function createFeeExpenseSettingsRouter({ useCases, context, resolveContext, readBody = readJsonBody, json = respond, apiError = respondError }) {
  return async function routeFeeExpenseSettings({ req, res, path }) {
    const requestContext = await resolveRequestContext(context, resolveContext);
    if (path === '/api/fee-expense-settings' && req.method === 'GET') {
      json(res, 200, await useCases.listFeeExpenseSettings(requestContext));
      return true;
    }
    if (path === '/api/fee-expense-settings' && req.method === 'PUT') {
      const body = await readBody(req);
      json(res, 200, await useCases.upsertFeeExpenseSettings(requestContext, body.taxYear, body));
      return true;
    }
    const feeExpMatch = path.match(/^\/api\/fee-expense-settings\/(\d+)$/);
    if (feeExpMatch && req.method === 'GET') {
      const r = await useCases.getFeeExpenseSettings(requestContext, feeExpMatch[1]);
      if (r) json(res, 200, r); else apiError(res, 404, 'not_found', 'Configuración de gastos no encontrada');
      return true;
    }
    return false;
  };
}
