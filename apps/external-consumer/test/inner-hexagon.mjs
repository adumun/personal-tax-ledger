import assert from 'node:assert/strict';
import { simulatePortfolio, defaultSettings, monthlySalaryFromGross } from '@personal-tax-ledger/core';
import { LOCAL_WORKSPACE_CONTEXT, createAnnualWorkspaceContext } from '@personal-tax-ledger/contracts';
import { createIncomeUseCases, createSystemUseCases } from '@personal-tax-ledger/application';

function createInMemoryIncomeRepository() {
  let nextId = 1;
  const records = new Map();
  return {
    async list(context, taxYear) {
      assert.equal(context.workspaceId, LOCAL_WORKSPACE_CONTEXT.workspaceId);
      const all = [...records.values()];
      return taxYear == null ? all : all.filter(record => Number(record.taxYear) === Number(taxYear));
    },
    async get(context, id) {
      assert.equal(context.workspaceId, LOCAL_WORKSPACE_CONTEXT.workspaceId);
      return records.get(Number(id)) || null;
    },
    async create(context, input) {
      assert.equal(context.workspaceId, LOCAL_WORKSPACE_CONTEXT.workspaceId);
      const id = nextId++;
      const record = { ...input, id, taxYear: Number(input.taxYear) };
      records.set(id, record);
      return record;
    },
    async update(context, id, input) {
      assert.equal(context.workspaceId, LOCAL_WORKSPACE_CONTEXT.workspaceId);
      if (!records.has(Number(id))) return null;
      const record = { ...input, id: Number(id), taxYear: Number(input.taxYear) };
      records.set(Number(id), record);
      return record;
    },
    async remove(context, id) {
      assert.equal(context.workspaceId, LOCAL_WORKSPACE_CONTEXT.workspaceId);
      return records.delete(Number(id));
    },
    async copy(context, fromTaxYear, toTaxYear) {
      assert.equal(context.workspaceId, LOCAL_WORKSPACE_CONTEXT.workspaceId);
      const from = Number(fromTaxYear);
      const to = Number(toTaxYear);
      const destExists = [...records.values()].some(record => Number(record.taxYear) === to);
      if (destExists) return null;
      const copiedRecords = [];
      for (const record of records.values()) {
        if (Number(record.taxYear) !== from) continue;
        const id = nextId++;
        const copiedRecord = { ...record, id, taxYear: to };
        records.set(id, copiedRecord);
        copiedRecords.push(copiedRecord);
      }
      return copiedRecords;
    }
  };
}

function annualWorkspace(year) {
  return {
    id: `annual-tax-workspace-${year}`,
    commercialYear: year,
    lifecycleState: 'PREPARING',
    createdAt: '2026-09-13T00:00:00.000Z',
    updatedAt: '2026-09-13T00:00:00.000Z',
    ruleVersionRef: null
  };
}

export async function runInnerHexagonSmoke() {
  const incomeRepository = createInMemoryIncomeRepository();
  const incomeUseCases = createIncomeUseCases({ repository: incomeRepository });
  const context2026 = createAnnualWorkspaceContext(LOCAL_WORKSPACE_CONTEXT, annualWorkspace(2026));
  const context2027 = createAnnualWorkspaceContext(LOCAL_WORKSPACE_CONTEXT, annualWorkspace(2027));

  const salary = await incomeUseCases.createIncomeSource(context2026, {
    name: 'Sueldo',
    kind: 'SALARY',
    amount: monthlySalaryFromGross(2500000),
    frequency: 'MONTHLY',
    months: 12,
    taxYear: 2026
  });
  assert.equal(salary.id, 1);

  const sources = await incomeUseCases.listIncomeSources(context2026, 2026);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].name, 'Sueldo');

  const simulation = simulatePortfolio(sources, defaultSettings);
  assert.equal(typeof simulation.totals.annualTax, 'number');
  assert.equal(simulation.totals.annualTax, 0);

  const copied = await incomeUseCases.copyIncomeSources(context2027, 2026, 2027);
  assert.equal(copied.length, 1);
  assert.equal(copied[0].taxYear, 2027);

  const systemUseCases = createSystemUseCases({
    context: LOCAL_WORKSPACE_CONTEXT,
    resolveAnnualContext: async () => context2026,
    settingsUseCases: { getSettings: async () => ({ year: 2026 }) },
    incomeUseCases,
    referenceUseCases: { listReferences: async () => [] },
    yearUseCases: { listYears: async () => [2026, 2027] },
    taxParameterUseCases: { listTaxParameters: async () => [] },
    simulatePortfolio,
    compareApv: async () => ({}),
    buildScenarios: async () => [],
    computeArticle55BisBenefit: async () => 0,
    computeFeeReceiptAmounts: async () => ({}),
    defaultSettings
  });
  const bootstrap = await systemUseCases.bootstrap();
  assert.equal(bootstrap.settings.year, 2026);
  assert.deepEqual(bootstrap.references, []);
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).pathname.endsWith('/inner-hexagon.mjs')) {
  runInnerHexagonSmoke()
    .then(() => console.log('inner hexagon smoke ok'))
    .catch(error => {
      console.error(error);
      process.exitCode = 1;
    });
}
