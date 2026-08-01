import type { CalculatorInputs } from './types.js';

export const DEFAULT_INPUTS: Readonly<CalculatorInputs> = Object.freeze({
  currency: 'USD',
  initialPrincipal: 10000,
  contributionAmount: 500,
  contributionFrequency: 'monthly',
  contributionTiming: 'end',
  durationMonths: 120,
  nominalAnnualRate: 0.07,
  compoundingFrequency: 'monthly',
  nominalAnnualFeeRate: 0,
  inflationRate: 0.03,
});
