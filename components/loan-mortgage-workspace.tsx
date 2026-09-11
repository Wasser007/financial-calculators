"use client";
import { StepperButtons } from "./stepper-buttons.js";

import { useMemo, useState } from "react";
import { calculateLoan } from "../lib/calculators/loan-amortization/math";
import { DEFAULT_LOAN_INPUTS } from "../lib/calculators/loan-amortization/schema.js";
import type {
  LoanCalculatorInputs,
  RepaymentMethod,
} from "../lib/calculators/loan-amortization/schema.js";

interface FormState {
  currency: string;
  numberFormat: string;
  loanAmount: string;
  annualInterestRate: string;
  loanTermYears: string;
  repaymentMethod: RepaymentMethod;
  extraMonthlyPayment: string;
}

const CURRENCIES: Record<string, { symbol: string; label: string }> = {
  USD: { symbol: "$", label: "USD" },
  EUR: { symbol: "€", label: "EUR" },
  GBP: { symbol: "£", label: "GBP" },
  CAD: { symbol: "$", label: "CAD" },
  AUD: { symbol: "$", label: "AUD" },
};

const FORMATS: Record<string, { locale: string; label: string }> = {
  "en-US": { locale: "en-US", label: "United States (en-US)" },
  "en-GB": { locale: "en-GB", label: "United Kingdom (en-GB)" },
  "de-DE": { locale: "de-DE", label: "Germany (de-DE)" },
  "fr-FR": { locale: "fr-FR", label: "France (fr-FR)" },
};

export function LoanMortgageWorkspace() {
  const [form, setForm] = useState<FormState>({
    currency: "USD",
    numberFormat: "en-US",
    loanAmount: String(DEFAULT_LOAN_INPUTS.loanAmount),
    annualInterestRate: String(DEFAULT_LOAN_INPUTS.annualInterestRate),
    loanTermYears: String(DEFAULT_LOAN_INPUTS.loanTermYears),
    repaymentMethod: DEFAULT_LOAN_INPUTS.repaymentMethod,
    extraMonthlyPayment: String(DEFAULT_LOAN_INPUTS.extraMonthlyPayment),
  });

  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const parsedInputs = useMemo<LoanCalculatorInputs>(() => {
    return {
      loanAmount: Math.max(1000, Number(form.loanAmount) || 0),
      annualInterestRate: Math.max(0, Number(form.annualInterestRate) || 0),
      loanTermYears: Math.max(1, Number(form.loanTermYears) || 30),
      repaymentMethod: form.repaymentMethod,
      extraMonthlyPayment: Math.max(0, Number(form.extraMonthlyPayment) || 0),
    };
  }, [form.loanAmount, form.annualInterestRate, form.loanTermYears, form.repaymentMethod, form.extraMonthlyPayment]);

  const result = useMemo(() => calculateLoan(parsedInputs), [parsedInputs]);

  const defaultCurrency = { symbol: "$", label: "USD" };
  const currentCurrency = CURRENCIES[form.currency] ?? defaultCurrency;
  const currentLocale = FORMATS[form.numberFormat]?.locale || "en-US";

  const formatMoney = (val: number, decimals = 2) => {
    return new Intl.NumberFormat(currentLocale, {
      style: "currency",
      currency: form.currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val);
  };

  const scheduleRows = useMemo(() => {
    return showFullSchedule ? result.schedule : result.schedule.slice(0, 12);
  }, [result.schedule, showFullSchedule]);

    const adjustField = (field: keyof FormState, delta: number, min: number = 0, decimals: number = 0) => {
    const current = parseFloat(form[field]) || 0;
    const nextVal = Math.max(min, current + delta);
    const formatted = decimals > 0 ? nextVal.toFixed(decimals) : String(Math.round(nextVal));
    setForm((prev) => ({ ...prev, [field]: formatted }));
  };

  const handleReset = () => {
    setForm({
      currency: "USD",
      numberFormat: "en-US",
      loanAmount: String(DEFAULT_LOAN_INPUTS.loanAmount),
      annualInterestRate: String(DEFAULT_LOAN_INPUTS.annualInterestRate),
      loanTermYears: String(DEFAULT_LOAN_INPUTS.loanTermYears),
      repaymentMethod: DEFAULT_LOAN_INPUTS.repaymentMethod,
      extraMonthlyPayment: String(DEFAULT_LOAN_INPUTS.extraMonthlyPayment),
    });
  };

  return (
    <section className="calculator-workspace" aria-labelledby="calculator-heading">
      <div className="calculator-heading">
        <div>
          <p className="eyebrow">YOUR CALCULATION</p>
          <h2 id="calculator-heading">Estimate your loan payments</h2>
        </div>
        <p>Complete all steps on one page. Results update after a short pause, or when you select Recalculate.</p>
      </div>

      <div className="calculator-layout">
        <div className="input-card">
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <fieldset className="form-step">
              <legend><span>1</span> Starting details</legend>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field">
                  <label htmlFor="currency">Currency</label>
                  <div className="control-wrap">
                    <select
                      id="currency"
                      name="currency"
                      value={form.currency}
                      onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                    >
                      {Object.entries(CURRENCIES).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="field__help">Changes labels and symbols only. Changing currency does not convert values.</p>
                </div>

                <div className="field">
                  <label htmlFor="numberFormat">Number format</label>
                  <div className="control-wrap">
                    <select
                      id="numberFormat"
                      name="numberFormat"
                      value={form.numberFormat}
                      onChange={(e) => setForm((prev) => ({ ...prev, numberFormat: e.target.value }))}
                    >
                      {Object.entries(FORMATS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="field__help">Changes number formatting only. It does not change content language or calculation.</p>
                </div>
              </div>

              <div className="field">
                <label htmlFor="loanAmount">Loan Amount ({currentCurrency.symbol})</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">{currentCurrency.symbol}</span>
                  <input
                    id="loanAmount"
                    name="loanAmount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-prefix has-stepper"
                    value={form.loanAmount}
                    onChange={(e) => setForm((prev) => ({ ...prev, loanAmount: e.target.value }))}
                    aria-describedby="loanAmount-help"
                  />
                  <StepperButtons onStepUp={() => adjustField("loanAmount", 5000, 1000)} onStepDown={() => adjustField("loanAmount", -5000, 1000)} />
                </div>
                <p className="field__help" id="loanAmount-help">Total principal borrowed.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="field">
                  <label htmlFor="annualInterestRate">Annual interest rate (%)</label>
                  <div className="control-wrap">
                    <input
                      id="annualInterestRate"
                      name="annualInterestRate"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      className="has-suffix has-stepper"
                      value={form.annualInterestRate}
                      onChange={(e) => setForm((prev) => ({ ...prev, annualInterestRate: e.target.value }))}
                      aria-describedby="rate-help"
                    />
                    <StepperButtons onStepUp={() => adjustField("annualInterestRate", 0.1, 0.1, 1)} onStepDown={() => adjustField("annualInterestRate", -0.1, 0.1, 1)} />
                    <span className="control-adornment control-adornment--suffix" aria-hidden="true">%</span>
                  </div>
                  <p className="field__help" id="rate-help">Fixed nominal annual borrowing rate (APR).</p>
                </div>

                <div className="field">
                  <label htmlFor="loanTermYears">Loan term</label>
                  <div className="control-wrap">
                    <select
                      id="loanTermYears"
                      name="loanTermYears"
                      value={form.loanTermYears}
                      onChange={(e) => setForm((prev) => ({ ...prev, loanTermYears: e.target.value }))}
                      aria-describedby="term-help"
                    >
                      <option value="10">10 Years (120 Months)</option>
                      <option value="15">15 Years (180 Months)</option>
                      <option value="20">20 Years (240 Months)</option>
                      <option value="25">25 Years (300 Months)</option>
                      <option value="30">30 Years (360 Months)</option>
                    </select>
                  </div>
                  <p className="field__help" id="term-help">Total contractual duration of the loan.</p>
                </div>
              </div>
            </fieldset>

            <fieldset className="form-step">
              <legend><span>2</span> Repayment strategy</legend>

              <div className="field">
                <label>Amortization structure</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.35rem" }}>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, repaymentMethod: "fixed-payment" }))}
                    className={`button ${form.repaymentMethod === "fixed-payment" ? "button--primary" : "button--ghost"}`}
                    style={{ padding: "0.55rem 0.75rem", fontSize: "0.875rem" }}
                  >
                    Fixed Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, repaymentMethod: "equal-principal" }))}
                    className={`button ${form.repaymentMethod === "equal-principal" ? "button--primary" : "button--ghost"}`}
                    style={{ padding: "0.55rem 0.75rem", fontSize: "0.875rem" }}
                  >
                    Equal Principal
                  </button>
                </div>
                <p className="field__help">Fixed payment keeps monthly installments constant; equal principal pays down principal quicker.</p>
              </div>

              <div className="field">
                <label htmlFor="extraMonthlyPayment">Extra monthly payment ({currentCurrency.symbol})</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">{currentCurrency.symbol}</span>
                  <input
                    id="extraMonthlyPayment"
                    name="extraMonthlyPayment"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-prefix has-stepper"
                    value={form.extraMonthlyPayment}
                    onChange={(e) => setForm((prev) => ({ ...prev, extraMonthlyPayment: e.target.value }))}
                    aria-describedby="extra-help"
                  />
                  <StepperButtons onStepUp={() => adjustField("extraMonthlyPayment", 50, 0)} onStepDown={() => adjustField("extraMonthlyPayment", -50, 0)} />
                </div>
                <p className="field__help" id="extra-help">Additional amount paid directly toward principal each month.</p>
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="submit" className="button button--primary">Recalculate</button>
              <button type="button" className="button button--secondary" onClick={handleReset}>Reset</button>
            </div>
          </form>
        </div>

        <div className="results-card" aria-live="polite">
          <div className="results-card__header">
            <div>
              <p className="eyebrow">YOUR ILLUSTRATION</p>
              <h2>Estimated result</h2>
            </div>
            <span className="currency-badge">{form.currency} · {form.numberFormat}</span>
          </div>

          <div className="results-content">
            <dl className="result-metric result-metric--primary">
              <dt>{parsedInputs.repaymentMethod === "fixed-payment" ? "Estimated monthly installment" : "Initial monthly installment"}</dt>
              <dd className="result-metric__number">{formatMoney(result.monthlyPayment)}</dd>
            </dl>

            <div className="results-grid" style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line-subtle, #f1f5f9)", paddingTop: "1.25rem" }}>
              <dl className="result-metric">
                <dt>Total interest paid</dt>
                <dd className="result-metric__number" style={{ color: "#0f766e" }}>{formatMoney(result.totalInterestPaid, 0)}</dd>
              </dl>
              <dl className="result-metric">
                <dt>Total lifetime cost</dt>
                <dd className="result-metric__number">{formatMoney(result.totalPayment, 0)}</dd>
              </dl>
              <dl className="result-metric">
                <dt>Payoff duration</dt>
                <dd className="result-metric__number">
                  {Math.floor(result.actualMonths / 12)} yrs {result.actualMonths % 12 > 0 ? `${result.actualMonths % 12} mos` : ""}
                </dd>
              </dl>
              {result.interestSaved > 0 && (
                <dl className="result-metric" style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.5rem 0.75rem", borderRadius: "8px" }}>
                  <dt style={{ color: "#065f46" }}>Total interest saved</dt>
                  <dd className="result-metric__number" style={{ color: "#047857" }}>{formatMoney(result.interestSaved, 0)}</dd>
                </dl>
              )}
            </div>
          </div>

          <aside className="illustration-note" aria-label="Illustration disclaimer">
            <p>
              <strong>Illustration only.</strong> Does not factor in property taxes, hazard insurance, escrow, or lender closing fees. Real amortizations may differ slightly due to rounding.
            </p>
          </aside>
        </div>
      </div>

      <section className="annual-card" style={{ marginTop: "2rem" }}>
        <div className="card-heading">
          <div>
            <p className="eyebrow">AMORTIZATION SCHEDULE</p>
            <h2>Payment breakdown {showFullSchedule ? `(${result.schedule.length} Months)` : "(First 12 Months)"}</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowFullSchedule((prev) => !prev)}
            className="button button--ghost"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem" }}
          >
            {showFullSchedule ? "Show First Year Only" : "Expand All Months"}
          </button>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.5rem 0 1rem" }}>
          ← Scroll the table horizontally to see every column.
        </p>
        <div className="annual-table-scroll" style={{ overflowX: "auto" }}>
          <table className="annual-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Beginning Balance</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Total Payment</th>
                <th>Ending Balance</th>
              </tr>
            </thead>
            <tbody>
              {scheduleRows.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{formatMoney(row.beginningBalance)}</td>
                  <td style={{ color: "#047857", fontWeight: 500 }}>{formatMoney(row.principalPayment + row.extraPayment)}</td>
                  <td style={{ color: "#b45309" }}>{formatMoney(row.interestPayment)}</td>
                  <td>{formatMoney(row.totalMonthlyPayment)}</td>
                  <td>{formatMoney(row.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
