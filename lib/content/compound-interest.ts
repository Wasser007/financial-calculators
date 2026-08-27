import { calculate } from "../calculator/engine.js";
import type { CalculatorInputs } from "../calculator/types.js";

export const WORKED_EXAMPLE_INPUTS: CalculatorInputs = {
  currency: "USD", initialPrincipal: 1000, contributionAmount: 0, contributionFrequency: "monthly", contributionTiming: "end", durationMonths: 24,
  nominalAnnualRate: 0.05, compoundingFrequency: "annually", nominalAnnualFeeRate: 0, inflationRate: 0,
};

export const CONTRIBUTION_EXAMPLE_INPUTS: CalculatorInputs = { ...WORKED_EXAMPLE_INPUTS, contributionAmount: 100 };
export const WORKED_EXAMPLE_RESULT = calculate(WORKED_EXAMPLE_INPUTS);
export const CONTRIBUTION_EXAMPLE_RESULT = calculate(CONTRIBUTION_EXAMPLE_INPUTS);

export const COMPOUND_INTEREST_FAQS = [
  ["Is this result a forecast?", "No. It is an illustration using constant inputs. Real returns, fees, inflation, taxes, and cash flows can change."],
  ["What does compounding frequency change?", "It changes how the nominal annual rate is converted to the monthly rate used by the ledger."],
  ["When are contributions added?", "A contribution can be added at the beginning or end of a due month. That choice changes how soon it can earn modeled growth."],
  ["How are fees handled?", "The entered annual fee rate is divided by twelve and deducted each month after interest, before any end-of-period contribution."],
  ["What is the inflation-adjusted balance?", "It expresses the modeled final balance in present-value terms using your constant annual inflation assumption."],
  ["Does this include tax?", "No. Tax rules vary by person, product, account, market, and jurisdiction, so tax is outside this calculator."],
  ["Does the site retain my inputs?", "The current calculator runs in your browser. It has no account system and does not send inputs to an application database."],
] as const;
