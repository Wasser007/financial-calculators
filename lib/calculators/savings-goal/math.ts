export type DepositTiming = "beginning" | "end";

export interface SavingsGoalInput {
  targetAmount: number; // FV
  initialBalance: number; // PV
  annualReturnRatePct: number;
  years: number;
  months?: number;
  compoundsPerYear?: number;
  depositTiming?: DepositTiming;
}

export interface SavingsSchedulePeriod {
  period: number;
  year: number;
  startingBalance: number;
  deposit: number;
  interestEarned: number;
  endingBalance: number;
}

export interface SavingsGoalResult {
  requiredDepositPerPeriod: number;
  totalPeriods: number;
  totalContributions: number;
  totalInterestEarned: number;
  finalBalance: number;
  schedule: SavingsSchedulePeriod[];
}

export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calculateSavingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const target = Math.max(0, input.targetAmount);
  const initial = Math.max(0, input.initialBalance);
  const years = Math.max(0, input.years || 0);
  const months = Math.max(0, input.months || 0);
  const timing = input.depositTiming ?? "beginning";
  const m = input.compoundsPerYear ?? 12;

  const totalYears = years + months / 12;
  const n = Math.round(totalYears * m);

  if (n === 0 || target === 0) {
    return {
      requiredDepositPerPeriod: 0,
      totalPeriods: 0,
      totalContributions: initial,
      totalInterestEarned: 0,
      finalBalance: initial,
      schedule: [],
    };
  }

  const annualRate = Math.max(0, input.annualReturnRatePct) / 100;
  const i = annualRate / m;
  const isBeginning = timing === "beginning";

  const futureValueOfInitial = initial * Math.pow(1 + i, n);
  if (futureValueOfInitial >= target) {
    return {
      requiredDepositPerPeriod: 0,
      totalPeriods: n,
      totalContributions: roundToCents(initial),
      totalInterestEarned: roundToCents(futureValueOfInitial - initial),
      finalBalance: roundToCents(futureValueOfInitial),
      schedule: generateSchedule(initial, 0, i, n, isBeginning),
    };
  }

  const remainingTarget = target - futureValueOfInitial;
  let pmt = 0;

  if (i === 0) {
    pmt = remainingTarget / n;
  } else {
    const annuityFactor = ((Math.pow(1 + i, n) - 1) / i) * (isBeginning ? 1 + i : 1);
    pmt = remainingTarget / annuityFactor;
  }

  pmt = roundToCents(pmt);

  const schedule = generateSchedule(initial, pmt, i, n, isBeginning);
  const lastPeriod = schedule[schedule.length - 1];
  const finalBalance = lastPeriod ? lastPeriod.endingBalance : initial;
  const totalDeposited = roundToCents(initial + pmt * n);
  const totalInterest = roundToCents(finalBalance - totalDeposited);

  return {
    requiredDepositPerPeriod: pmt,
    totalPeriods: n,
    totalContributions: totalDeposited,
    totalInterestEarned: totalInterest,
    finalBalance,
    schedule,
  };
}

function generateSchedule(
  initial: number,
  pmt: number,
  ratePerPeriod: number,
  totalPeriods: number,
  isBeginning: boolean
): SavingsSchedulePeriod[] {
  const schedule: SavingsSchedulePeriod[] = [];
  let currentBalance = initial;

  for (let period = 1; period <= totalPeriods; period++) {
    const startBal = currentBalance;
    let interest = 0;

    if (isBeginning) {
      interest = (startBal + pmt) * ratePerPeriod;
      currentBalance = startBal + pmt + interest;
    } else {
      interest = startBal * ratePerPeriod;
      currentBalance = startBal + pmt + interest;
    }

    schedule.push({
      period,
      year: Math.ceil(period / 12),
      startingBalance: roundToCents(startBal),
      deposit: pmt,
      interestEarned: roundToCents(interest),
      endingBalance: roundToCents(currentBalance),
    });
  }

  return schedule;
}
