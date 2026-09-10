export interface MoneyDurationInputs {
  initialBalance: number;
  monthlyWithdrawal: number;
  annualReturnRatePct: number;
  annualInflationRatePct?: number;
  withdrawalTiming?: "beginning" | "end";
  maxYears?: number; // 默认最大模拟 100 年
}

export interface MoneyDurationAnnualRow {
  year: number;
  startingBalance: number;
  annualWithdrawal: number;
  annualInterest: number;
  endingBalance: number;
}

export interface MoneyDurationResult {
  totalYears: number;
  remainingMonths: number;
  isPerpetual: boolean; // 如果收益大于等于提取额，本金永远耗不尽
  totalWithdrawals: number;
  totalInterestEarned: number;
  finalBalance: number;
  annualRows: MoneyDurationAnnualRow[];
}

export function calculateMoneyDuration(inputs: MoneyDurationInputs): MoneyDurationResult {
  const {
    initialBalance,
    monthlyWithdrawal,
    annualReturnRatePct,
    annualInflationRatePct = 0,
    withdrawalTiming = "beginning",
    maxYears = 100,
  } = inputs;

  if (initialBalance <= 0 || monthlyWithdrawal <= 0) {
    return {
      totalYears: 0,
      remainingMonths: 0,
      isPerpetual: false,
      totalWithdrawals: 0,
      totalInterestEarned: 0,
      finalBalance: Math.max(0, initialBalance),
      annualRows: [],
    };
  }

  // 计算月名义利率与年化通胀调整
  const monthlyRate = annualReturnRatePct / 100 / 12;
  const monthlyInflationRate = annualInflationRatePct / 100 / 12;

  // 永续资金判断（当期末提款且月收益 >= 提款，且无通胀侵蚀时）
  if (annualInflationRatePct <= 0 && monthlyRate > 0) {
    const interestFirstMonth = initialBalance * monthlyRate;
    if (withdrawalTiming === "end" && interestFirstMonth >= monthlyWithdrawal) {
      return {
        totalYears: maxYears,
        remainingMonths: 0,
        isPerpetual: true,
        totalWithdrawals: monthlyWithdrawal * 12 * maxYears,
        totalInterestEarned: monthlyWithdrawal * 12 * maxYears,
        finalBalance: initialBalance,
        annualRows: [],
      };
    }
    if (withdrawalTiming === "beginning" && (initialBalance - monthlyWithdrawal) * monthlyRate >= monthlyWithdrawal) {
      return {
        totalYears: maxYears,
        remainingMonths: 0,
        isPerpetual: true,
        totalWithdrawals: monthlyWithdrawal * 12 * maxYears,
        totalInterestEarned: monthlyWithdrawal * 12 * maxYears,
        finalBalance: initialBalance,
        annualRows: [],
      };
    }
  }

  let balance = initialBalance;
  let currentWithdrawal = monthlyWithdrawal;
  let totalMonths = 0;
  let cumulativeWithdrawal = 0;
  let cumulativeInterest = 0;
  const annualRows: MoneyDurationAnnualRow[] = [];

  const maxMonths = maxYears * 12;

  for (let y = 1; y <= maxYears; y++) {
    const yearStartBalance = balance;
    let yearWithdrawal = 0;
    let yearInterest = 0;

    for (let m = 1; m <= 12; m++) {
      if (balance <= 0) break;

      totalMonths++;

      if (withdrawalTiming === "beginning") {
        const withdraw = Math.min(balance, currentWithdrawal);
        balance -= withdraw;
        yearWithdrawal += withdraw;
        cumulativeWithdrawal += withdraw;

        const interest = balance > 0 ? balance * monthlyRate : 0;
        balance += interest;
        yearInterest += interest;
        cumulativeInterest += interest;
      } else {
        const interest = balance * monthlyRate;
        balance += interest;
        yearInterest += interest;
        cumulativeInterest += interest;

        const withdraw = Math.min(balance, currentWithdrawal);
        balance -= withdraw;
        yearWithdrawal += withdraw;
        cumulativeWithdrawal += withdraw;
      }

      if (monthlyInflationRate > 0) {
        currentWithdrawal *= (1 + monthlyInflationRate);
      }

      if (balance <= 0.005) {
        balance = 0;
        break;
      }
    }

    annualRows.push({
      year: y,
      startingBalance: yearStartBalance,
      annualWithdrawal: yearWithdrawal,
      annualInterest: yearInterest,
      endingBalance: balance,
    });

    if (balance <= 0) break;
  }

  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  return {
    totalYears: years,
    remainingMonths,
    isPerpetual: totalMonths >= maxMonths && balance > 0,
    totalWithdrawals: cumulativeWithdrawal,
    totalInterestEarned: cumulativeInterest,
    finalBalance: balance,
    annualRows,
  };
}
