import {
  assertAnnualWorkspaceContext,
  assertContextCommercialYear,
  assertForeignServiceIncomeRepositoryContract,
  assertForeignExchangeProviderContract
} from '@personal-tax-ledger/contracts';
import { createActiveWorkspaceGuard } from '../../shared/active-workspace-guard.mjs';

function ensureForeignSource(input) {
  if (input?.serviceSourceJurisdiction !== 'FOREIGN') {
    throw new TypeError('foreign service income use cases only accept FOREIGN source jurisdiction');
  }
}

function commercialYearFromReceivedAt(receivedAt) {
  if (!receivedAt) return null;
  const year = Number(String(receivedAt).slice(0, 4));
  return Number.isSafeInteger(year) ? year : null;
}

export function createForeignServiceIncomeUseCases({ repository, fxProvider, resolveActiveContext }) {
  assertForeignServiceIncomeRepositoryContract(repository);
  if (fxProvider) assertForeignExchangeProviderContract(fxProvider);
  const assertContextStillActive = createActiveWorkspaceGuard(resolveActiveContext);

  return {
    async listForeignServiceIncome(context) {
      assertAnnualWorkspaceContext(context);
      return repository.list(context, { taxYear: context.commercialYear });
    },

    async getForeignServiceIncome(context, id) {
      assertAnnualWorkspaceContext(context);
      const record = await repository.get(context, id);
      if (!record) return null;
      assertContextCommercialYear(context, record.taxYear, 'getForeignServiceIncome');
      return record;
    },

    async createForeignServiceIncome(context, input) {
      assertAnnualWorkspaceContext(context);
      ensureForeignSource(input);
      const receivedYear = commercialYearFromReceivedAt(input?.receivedAt);
      const year = receivedYear ?? Number(input?.taxYear);
      assertContextCommercialYear(context, year, 'createForeignServiceIncome');
      await assertContextStillActive(context, 'createForeignServiceIncome');
      return repository.create(context, { ...input, taxYear: year });
    },

    async correctForeignServiceEconomicFact(context, id, input) {
      assertAnnualWorkspaceContext(context);
      const current = await repository.get(context, id);
      if (!current) return null;
      assertContextCommercialYear(context, current.taxYear, 'correctForeignServiceEconomicFact');
      ensureForeignSource({ ...current, ...input });
      const receivedYear = commercialYearFromReceivedAt(input?.receivedAt ?? current.receivedAt);
      const year = receivedYear ?? Number(input?.taxYear ?? current.taxYear);
      assertContextCommercialYear(context, year, 'correctForeignServiceEconomicFact');
      await assertContextStillActive(context, 'correctForeignServiceEconomicFact');
      return repository.updateEconomicFact(context, id, { ...input, taxYear: year });
    },

    async resolveOfficialConversion(context, id) {
      assertAnnualWorkspaceContext(context);
      if (!fxProvider) throw new TypeError('fxProvider is required for official conversion');
      const current = await repository.get(context, id);
      if (!current) return null;
      assertContextCommercialYear(context, current.taxYear, 'resolveOfficialConversion');
      if (!current.receivedAt) return { status: 'NEEDS_REVIEW', reason: 'MISSING_RECEIVED_AT' };
      await assertContextStillActive(context, 'resolveOfficialConversion');
      const rate = await fxProvider.resolveRate({
        currency: current.originalCurrency,
        date: current.receivedAt,
        targetCurrency: 'CLP'
      });
      if (!rate || rate.status !== 'RESOLVED') {
        return { status: 'NEEDS_REVIEW', reason: rate?.reason ?? 'RATE_UNAVAILABLE' };
      }
      const conversion = await repository.appendConversion(context, id, {
        fxRate: rate.rate,
        fxRateDate: rate.rateDate,
        fxSource: 'BCCH',
        fxSourceReference: rate.sourceReference,
        conversionStatus: 'RESOLVED'
      });
      return { status: 'RESOLVED', conversion };
    },

    async appendManualConversion(context, id, input) {
      assertAnnualWorkspaceContext(context);
      const current = await repository.get(context, id);
      if (!current) return null;
      assertContextCommercialYear(context, current.taxYear, 'appendManualConversion');
      await assertContextStillActive(context, 'appendManualConversion');
      return repository.appendConversion(context, id, {
        ...input,
        fxSource: 'MANUAL',
        conversionStatus: input?.conversionStatus ?? 'RESOLVED'
      });
    },

    async listForeignServiceConversions(context, id) {
      assertAnnualWorkspaceContext(context);
      const current = await repository.get(context, id);
      if (!current) return [];
      assertContextCommercialYear(context, current.taxYear, 'listForeignServiceConversions');
      return repository.listConversions(context, id);
    }
  };
}
