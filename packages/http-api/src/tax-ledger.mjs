function optionalFilter(url, key) {
  const value = url.searchParams.get(key);
  return value == null || value === '' ? undefined : value;
}

export function createTaxLedgerRouter({ readModel, resolveContext, json, apiError }) {
  if (typeof readModel?.query !== 'function') throw new TypeError('readModel.query is required');
  if (typeof resolveContext !== 'function') throw new TypeError('resolveContext is required');

  return async function routeTaxLedger({ req, res, path, url }) {
    if (path !== '/api/tax-ledger') return false;
    if (req.method !== 'GET') {
      apiError(res, 405, 'method_not_allowed', 'El ledger tributario es una superficie de solo lectura');
      return true;
    }

    try {
      const context = await resolveContext();
      const filters = {
        entryKind: optionalFilter(url, 'entryKind'),
        ownerAggregate: optionalFilter(url, 'ownerAggregate'),
        recognitionState: optionalFilter(url, 'recognitionState')
      };
      json(res, 200, await readModel.query(context, filters));
      return true;
    } catch (error) {
      const code = error?.code || 'invalid_tax_ledger_query';
      const status = code === 'active_workspace_not_found' ? 409 : 400;
      apiError(res, status, code, error instanceof Error ? error.message : 'Error inesperado');
      return true;
    }
  };
}
