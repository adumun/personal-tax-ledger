import { apiError as respondError, json as respond } from './http-errors.mjs';
import { readJsonBody } from './read-json-body.mjs';

async function resolveRequestContext(context, resolveContext) {
  return resolveContext ? resolveContext() : context;
}

export function createForeignServiceRouter({
  foreignServiceUseCases,
  settlementUseCases,
  context,
  resolveContext,
  readBody = readJsonBody,
  json = respond,
  apiError = respondError
}) {
  return async function routeForeignService({ req, res, path }) {
    const requestContext = await resolveRequestContext(context, resolveContext);

    if (path === '/api/foreign-service-income' && req.method === 'GET') {
      json(res, 200, await foreignServiceUseCases.listForeignServiceIncome(requestContext));
      return true;
    }

    if (path === '/api/foreign-service-income' && req.method === 'POST') {
      json(res, 201, await foreignServiceUseCases.createForeignServiceIncome(requestContext, await readBody(req)));
      return true;
    }

    const conversionListMatch = path.match(/^\/api\/foreign-service-income\/([^/]+)\/conversions$/);
    if (conversionListMatch && req.method === 'GET') {
      json(res, 200, await foreignServiceUseCases.listForeignServiceConversions(requestContext, conversionListMatch[1]));
      return true;
    }

    const manualConversionMatch = path.match(/^\/api\/foreign-service-income\/([^/]+)\/conversions\/manual$/);
    if (manualConversionMatch && req.method === 'POST') {
      const conversion = await foreignServiceUseCases.appendManualConversion(requestContext, manualConversionMatch[1], await readBody(req));
      if (conversion) json(res, 201, conversion);
      else apiError(res, 404, 'not_found', 'Ingreso de fuente extranjera no encontrado');
      return true;
    }

    const officialConversionMatch = path.match(/^\/api\/foreign-service-income\/([^/]+)\/conversions\/official$/);
    if (officialConversionMatch && req.method === 'POST') {
      const result = await foreignServiceUseCases.resolveOfficialConversion(requestContext, officialConversionMatch[1]);
      if (result) json(res, 200, result);
      else apiError(res, 404, 'not_found', 'Ingreso de fuente extranjera no encontrado');
      return true;
    }

    const incomeMatch = path.match(/^\/api\/foreign-service-income\/([^/]+)$/);
    if (incomeMatch && req.method === 'GET') {
      const record = await foreignServiceUseCases.getForeignServiceIncome(requestContext, incomeMatch[1]);
      if (record) json(res, 200, record);
      else apiError(res, 404, 'not_found', 'Ingreso de fuente extranjera no encontrado');
      return true;
    }

    if (incomeMatch && req.method === 'PUT') {
      const record = await foreignServiceUseCases.correctForeignServiceEconomicFact(requestContext, incomeMatch[1], await readBody(req));
      if (record) json(res, 200, record);
      else apiError(res, 404, 'not_found', 'Ingreso de fuente extranjera no encontrado');
      return true;
    }

    const settlementMatch = path.match(/^\/api\/fee-receipts\/([^/]+)\/foreign-settlement$/);
    if (settlementMatch && req.method === 'GET') {
      const settlement = await settlementUseCases.getFeeReceiptForeignSettlement(requestContext, settlementMatch[1]);
      if (settlement) json(res, 200, settlement);
      else apiError(res, 404, 'not_found', 'Settlement extranjero no registrado para esta BHE');
      return true;
    }

    if (settlementMatch && req.method === 'PUT') {
      const settlement = await settlementUseCases.upsertFeeReceiptForeignSettlement(requestContext, settlementMatch[1], await readBody(req));
      if (settlement) json(res, 200, settlement);
      else apiError(res, 404, 'not_found', 'Boleta de honorarios no encontrada');
      return true;
    }

    return false;
  };
}
