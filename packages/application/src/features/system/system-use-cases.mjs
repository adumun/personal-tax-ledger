import { assertContextCommercialYear, assertWorkspaceContext } from '@personal-tax-ledger/contracts';

export function createSystemUseCases({
  context,
  resolveAnnualContext,
  settingsUseCases,
  incomeUseCases,
  referenceUseCases,
  yearUseCases,
  taxParameterUseCases,
  simulatePortfolio,
  compareApv,
  buildScenarios,
  computeArticle55BisBenefit,
  computeFeeReceiptAmounts,
  defaultSettings
}) {
  assertWorkspaceContext(context);

  async function resolveScopedContext(operation) {
    const scoped = resolveAnnualContext ? await resolveAnnualContext() : context;
    const settings = await settingsUseCases.getSettings(context);
    if (resolveAnnualContext) assertContextCommercialYear(scoped, settings.year, operation);
    return { scoped, settings };
  }

  return {
    async health() {
      const settings = await settingsUseCases.getSettings(context);
      return { status: 'ok', year: settings.year };
    },
    async bootstrap() {
      const { scoped, settings } = await resolveScopedContext('bootstrap');
      const [sources, references] = await Promise.all([
        incomeUseCases.listIncomeSources(scoped, settings.year),
        referenceUseCases.listReferences()
      ]);
      return { settings, sources, references };
    },
    async listYears() {
      return yearUseCases.listYears();
    },
    async simulate(payload = {}) {
      const { scoped, settings: baseSettings } = await resolveScopedContext('simulate');
      const settings = { ...baseSettings, ...(payload.settings || {}) };
      if (payload.settings?.year != null) assertContextCommercialYear(scoped, payload.settings.year, 'simulate.payload');
      const sources = payload.sources || await incomeUseCases.listIncomeSources(scoped, baseSettings.year);
      return simulatePortfolio(sources, settings, payload.extraApv, {
        feeReceipts: payload.feeReceipts,
        mortgages: payload.mortgages,
        annualRecords: payload.annualRecords
      });
    },
    async compareApv(payload = {}) {
      const { scoped, settings: baseSettings } = await resolveScopedContext('compareApv');
      const settings = { ...baseSettings, ...(payload.settings || {}) };
      if (payload.settings?.year != null) assertContextCommercialYear(scoped, payload.settings.year, 'compareApv.payload');
      const sources = payload.sources || await incomeUseCases.listIncomeSources(scoped, baseSettings.year);
      return compareApv(sources, settings, payload.annualContribution, {
        feeReceipts: payload.feeReceipts,
        mortgages: payload.mortgages,
        annualRecords: payload.annualRecords
      });
    },
    async scenarios(payload = {}) {
      const { scoped, settings: baseSettings } = await resolveScopedContext('scenarios');
      const settings = { ...baseSettings, ...(payload.settings || {}) };
      if (payload.settings?.year != null) assertContextCommercialYear(scoped, payload.settings.year, 'scenarios.payload');
      const sources = payload.sources || await incomeUseCases.listIncomeSources(scoped, baseSettings.year);
      return buildScenarios(sources, settings, {
        feeReceipts: payload.feeReceipts,
        mortgages: payload.mortgages,
        annualRecords: payload.annualRecords
      });
    },
    async article55Bis(payload = {}) {
      const { scoped, settings: baseSettings } = await resolveScopedContext('article55Bis');
      const settings = { ...baseSettings, ...(payload.settings || {}) };
      const year = Number(settings.year) || defaultSettings.year;
      assertContextCommercialYear(scoped, year, 'article55Bis');
      const parameters = payload.params || Object.fromEntries((await taxParameterUseCases.listTaxParameters(scoped, year)).map(item => [item.ruleKey, item.value]));
      return computeArticle55BisBenefit(payload.mortgages || [], payload.annualRecords || [], {
        incomeEstimate: Number(payload.incomeEstimate) || 0,
        utaValue: settings.utmValue * 12
      }, parameters);
    },
    async feeReceiptCalculation(payload = {}) {
      const { scoped, settings } = await resolveScopedContext('feeReceiptCalculation');
      const year = Number(settings.year) || defaultSettings.year;
      assertContextCommercialYear(scoped, year, 'feeReceiptCalculation');
      const parameters = Object.fromEntries((await taxParameterUseCases.listTaxParameters(scoped, year)).map(item => [item.ruleKey, item.value]));
      return computeFeeReceiptAmounts(payload.receipt || payload, parameters);
    }
  };
}
