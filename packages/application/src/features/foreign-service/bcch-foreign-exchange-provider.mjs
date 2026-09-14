import { assertForeignExchangeProviderContract } from '@personal-tax-ledger/contracts';

function requiredFunction(value, name) {
  if (typeof value !== 'function') throw new TypeError(`${name} is required`);
  return value;
}

export function createBcchForeignExchangeProvider({ lookupRate }) {
  const resolveExactRate = requiredFunction(lookupRate, 'lookupRate');

  return assertForeignExchangeProviderContract({
    async resolveRate({ currency, date, targetCurrency = 'CLP' }) {
      const sourceCurrency = String(currency ?? '').trim().toUpperCase();
      const target = String(targetCurrency ?? '').trim().toUpperCase();
      const rateDate = String(date ?? '').slice(0, 10);

      if (!/^[A-Z]{3}$/.test(sourceCurrency)) throw new TypeError('currency must be an ISO 4217 code');
      if (target !== 'CLP') throw new TypeError('BCCh provider currently supports CLP as targetCurrency only');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rateDate)) throw new TypeError('date must use YYYY-MM-DD');

      if (sourceCurrency === 'CLP') {
        return {
          status: 'RESOLVED',
          rate: 1,
          rateDate,
          source: 'BCCH',
          sourceReference: 'CLP identity conversion'
        };
      }

      const result = await resolveExactRate({ currency: sourceCurrency, date: rateDate, targetCurrency: 'CLP' });
      const rate = Number(result?.rate);
      if (!result || result.status === 'NOT_FOUND' || !Number.isFinite(rate) || rate <= 0) {
        return {
          status: 'NEEDS_REVIEW',
          reason: result?.reason ?? 'EXACT_BCCH_RATE_UNAVAILABLE',
          requestedDate: rateDate,
          currency: sourceCurrency
        };
      }

      const resolvedDate = String(result.rateDate ?? rateDate).slice(0, 10);
      if (resolvedDate !== rateDate) {
        return {
          status: 'NEEDS_REVIEW',
          reason: 'BCCH_RATE_DATE_MISMATCH',
          requestedDate: rateDate,
          resolvedDate,
          currency: sourceCurrency
        };
      }

      const sourceReference = String(result.sourceReference ?? '').trim();
      if (!sourceReference) throw new TypeError('BCCh resolved rates require sourceReference');

      return {
        status: 'RESOLVED',
        rate,
        rateDate,
        source: 'BCCH',
        sourceReference
      };
    }
  });
}
