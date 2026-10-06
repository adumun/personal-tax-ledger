import {
  assertTaxParameterRepositoryContract,
  assertTaxRuleSourceRepositoryContract
} from '@personal-tax-ledger/contracts';
import {
  evaluateTaxYearSupport,
  REQUIRED_TAX_PARAMETER_KEYS
} from '@personal-tax-ledger/core';

export function createSupportedYearPolicyUseCases({
  taxParameterRepository,
  taxRuleSourceRepository,
  requiredRuleKeys = REQUIRED_TAX_PARAMETER_KEYS
}) {
  assertTaxParameterRepositoryContract(taxParameterRepository);
  assertTaxRuleSourceRepositoryContract(taxRuleSourceRepository);

  return {
    async getSupportedYearState(commercialYear) {
      const year = Number(commercialYear);
      const [parameters, sources] = await Promise.all([
        taxParameterRepository.list(null, year),
        taxRuleSourceRepository.list(null, undefined, year)
      ]);

      return evaluateTaxYearSupport({
        commercialYear: year,
        parameterRuleKeys: parameters.map(item => item.ruleKey),
        sourceCount: sources.length,
        requiredRuleKeys
      });
    }
  };
}
