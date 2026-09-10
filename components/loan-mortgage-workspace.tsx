"use client";

import { useMemo, useState } from "react";
import { calculateLoan } from "../lib/calculators/loan-amortization/math";
import { DEFAULT_LOAN_INPUTS } from "../lib/calculators/loan-amortization/schema.js";
import type {
  LoanCalculatorInputs,
  RepaymentMethod,
} from "../lib/calculators/loan-amortization/schema.js";
import {
  formatCurrency,
  formatCurrencyDetailed,
} from "../lib/calculators/loan-amortization/presentation.js";

interface FormState {
  loanAmount: string;
  annualInterestRate: string;
  loanTermYears: string;
  repaymentMethod: RepaymentMethod;
  extraMonthlyPayment: string;
}

export function LoanMortgageWorkspace() {
  const [form, setForm] = useState<FormState>({
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
  }, [form]);

  const result = useMemo(() => calculateLoan(parsedInputs), [parsedInputs]);

  const scheduleRows = useMemo(() => {
    return showFullSchedule ? result.schedule : result.schedule.slice(0, 12);
  }, [result.schedule, showFullSchedule]);

  const handleReset = () => {
    setForm({
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
          <p className="eyebrow">Debt & Mortgage Model</p>
          <h2 id="calculator-heading">Amortization Schedule Parameters</h2>
        </div>
        <p>Model monthly installments, compare fixed vs equal principal methods, and estimate interest savings with accelerated payments.</p>
      </div>

      <div className="calculator-layout">
        <div className="input-card">
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <fieldset className="form-step">
              <legend><span>1</span> Loan Details</legend>

              <div className="field">
                <label htmlFor="loanAmount">Loan Amount ($)</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">$</span>
                  <input
                    id="loanAmount"
                    name="loanAmount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-prefix"
                    value={form.loanAmount}
                    onChange={(e) => setForm((prev) => ({ ...prev, loanAmount: e.target.value }))}
                    aria-describedby="loanAmount-help"
                  />
                </div>
                <p className="field__help" id="loanAmount-help">Total principal borrowed.</p>
              </div>

              <div className="field">
                <label htmlFor="annualInterestRate">Annual Interest Rate (%)</label>
                <div className="control-wrap">
                  <input
                    id="annualInterestRate"
                    name="annualInterestRate"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-suffix"
                    value={form.annualInterestRate}
                    onChange={(e) => setForm((prev) => ({ ...prev, annualInterestRate: e.target.value }))}
                    aria-describedby="rate-help"
                  />
                  <span className="control-adornment control-adornment--suffix" aria-hidden="true">%</span>
                </div>
                <p className="field__help" id="rate-help">Fixed nominal annual borrowing rate (APR).</p>
              </div>

              <div className="field">
                <label htmlFor="loanTermYears">Loan Term (Years)</label>
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
            </fieldset>

            <fieldset className="form-step">
              <legend><span>2</span> Repayment Strategy</legend>

              <div className="field">
                <label>Amortization Structure</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, repaymentMethod: "fixed-payment" }))}
                    className={`button ${form.repaymentMethod === "fixed-payment" ? "button--primary" : "button--ghost"}`}
                    style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                  >
                    Fixed Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, repaymentMethod: "equal-principal" }))}
                    className={`button ${form.repaymentMethod === "equal-principal" ? "button--primary" : "button--ghost"}`}
                    style={{ fontSize: "0.85rem", padding: "0.5rem" }}
                  >
                    Equal Principal
                  </button>
                </div>
                <p className="field__help">Equal payments keep installments identical; equal principal reduces interest quicker.</p>
              </div>

              <div className="field">
                <label htmlFor="extraMonthlyPayment">Extra Monthly Payment ($)</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">$</span>
                  <input
                    id="extraMonthlyPayment"
                    name="extraMonthlyPayment"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-prefix"
                    value={form.extraMonthlyPayment}
                    onChange={(e) => setForm((prev) => ({ ...prev, extraMonthlyPayment: e.target.value }))}
                    aria-describedby="extra-help"
                  />
                </div>
                <p className="field__help" id="extra-help">Additional amount paid directly toward principal each month.</p>
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="submit" className="button button--primary">Calculate</button>
              <button type="button" className="button button--ghost" onClick={handleReset}>Reset Defaults</button>
            </div>
          </form>
        </div>

        <div className="results-card" aria-live="polite">
          <div className="results-card__header">
            <div>
              <p className="eyebrow">YOUR ILLUSTRATION</p>
              <h2>Summary Results</h2>
            </div>
            <span className="currency-badge">USD · En</span>
          </div>

          <div>
            <dl className="result-metric result-metric--primary">
              <dt>{parsedInputs.repaymentMethod === "fixed-payment" ? "Estimated Monthly Installment" : "First Month Installment"}</dt>
              <dd>{formatCurrencyDetailed(result.monthlyPayment)}</dd>
            </dl>

            <div className="results-grid" style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
              <dl className="result-metric">
                <dt>Total Interest Paid</dt>
                <dd>{formatCurrency(result.totalInterestPaid)}</dd>
              </dl>
              <dl className="result-metric">
                <dt>Total Lifetime Cost</dt>
                <dd>{formatCurrency(result.totalPayment)}</dd>
              </dl>
              <dl className="result-metric">
                <dt>Payoff Duration</dt>
                <dd>{Math.floor(result.actualMonths / 12)} yrs {result.actualMonths % 12 > 0 ? `${result.actualMonths % 12} mos` : ""}</dd>
              </dl>
              {result.interestSaved > 0 && (
                <dl className="result-metric" style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.5rem 0.75rem", borderRadius: "8px" }}>
                  <dt style={{ color: "#065f46" }}>Total Interest Saved</dt>
                  <dd style={{ color: "#047857" }}>{formatCurrency(result.interestSaved)}</dd>
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
            <p className="eyebrow">SCHEDULE</p>
            <h2>Amortization Schedule {showFullSchedule ? `(${result.schedule.length} Months)` : "(First Year)"}</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowFullSchedule((prev) => !prev)}
            className="button button--ghost"
            style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
          >
            {showFullSchedule ? "Show 1 Year Only" : "Expand All Months"}
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
                  <td>{formatCurrencyDetailed(row.beginningBalance)}</td>
                  <td style={{ color: "#047857", fontWeight: 500 }}>{formatCurrencyDetailed(row.principalPayment + row.extraPayment)}</td>
                  <td style={{ color: "#b45309" }}>{formatCurrencyDetailed(row.interestPayment)}</td>
                  <td>{formatCurrencyDetailed(row.totalMonthlyPayment)}</td>
                  <td>{formatCurrencyDetailed(row.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
