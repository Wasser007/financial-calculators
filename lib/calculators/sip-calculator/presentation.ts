import { calculateSip } from "./math.js";
import type { SipCalculatorInputs, SipCalculatorResult } from "./schema.js";

export interface SipPresentationKPI {
  label: string;
  value: string;
  subtext: string;
}

export interface SipPresentationScheduleRow {
  year: number;
  totalInvested: string;
  totalReturns: string;
  futureValue: string;
}

export interface SipPresentation {
  raw: SipCalculatorResult;
  kpis: SipPresentationKPI[];
  schedule: SipPresentationScheduleRow[];
}

export function buildSipPresentation(
  inputs: SipCalculatorInputs,
  formatCurrency: (val: number) => string
): SipPresentation {
  const result = calculateSip(inputs);

  const kpis: SipPresentationKPI[] = [
    {
      label: "Expected Future Value",
      value: formatCurrency(result.futureValue),
      subtext: "Over " + inputs.investmentPeriodYears + " years of disciplined investing",
    },
    {
      label: "Total Principal Invested",
      value: formatCurrency(result.totalInvested),
      subtext: "Total out-of-pocket contributions",
    },
    {
      label: "Total Wealth Gained",
      value: formatCurrency(result.totalReturns),
      subtext: "Returns generated from compound growth",
    },
  ];

  const schedule: SipPresentationScheduleRow[] = result.yearlySchedule.map((row) => ({
    year: row.year,
    totalInvested: formatCurrency(row.totalInvested),
    totalReturns: formatCurrency(row.totalReturns),
    futureValue: formatCurrency(row.futureValue),
  }));

  return {
    raw: result,
    kpis,
    schedule,
  };
}
