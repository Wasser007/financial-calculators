"use client";

import React, { useState, useMemo } from "react";
import { SAVINGS_GOAL_DEFAULTS, validateSavingsGoalForm, type SavingsGoalFormValues } from "../lib/calculators/savings-goal/schema";
import { buildSavingsGoalPresentation } from "../lib/calculators/savings-goal/presentation";

export function SavingsGoalWorkspace() {
  const [form, setForm] = useState<SavingsGoalFormValues>(SAVINGS_GOAL_DEFAULTS);
  const validation = useMemo(() => validateSavingsGoalForm(form), [form]);
  const presentation = useMemo(() => {
    if (!validation.isValid || !validation.sanitized) return null;
    return buildSavingsGoalPresentation(validation.sanitized);
  }, [validation]);

  const handleChange = (field: keyof SavingsGoalFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="calculator-workspace">
      <div className="calculator-grid">
        <section className="calculator-card form-panel" aria-labelledby="savings-form-heading">
          <h2 id="savings-form-heading" className="section-title">Savings Goal Parameters</h2>
          <div className="input-group">
            <label htmlFor="targetAmount">Savings Target ($)</label>
            <input id="targetAmount" type="number" min="1" value={form.targetAmount} onChange={(e) => handleChange("targetAmount", e.target.value)} className="calculator-input" />
            {validation.errors.targetAmount && <p className="error-text">{validation.errors.targetAmount}</p>}
          </div>
          <div className="input-group">
            <label htmlFor="initialBalance">Initial Starting Balance ($)</label>
            <input id="initialBalance" type="number" min="0" value={form.initialBalance} onChange={(e) => handleChange("initialBalance", e.target.value)} className="calculator-input" />
            {validation.errors.initialBalance && <p className="error-text">{validation.errors.initialBalance}</p>}
          </div>
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="years">Years</label>
              <input id="years" type="number" min="0" max="80" value={form.years} onChange={(e) => handleChange("years", e.target.value)} className="calculator-input" />
            </div>
            <div className="input-group">
              <label htmlFor="months">Months</label>
              <input id="months" type="number" min="0" max="11" value={form.months} onChange={(e) => handleChange("months", e.target.value)} className="calculator-input" />
            </div>
          </div>
          {validation.errors.duration && <p className="error-text">{validation.errors.duration}</p>}
          <div className="input-group">
            <label htmlFor="annualReturnRatePct">Estimated Annual Return (%)</label>
            <input id="annualReturnRatePct" type="number" step="0.1" min="0" max="50" value={form.annualReturnRatePct} onChange={(e) => handleChange("annualReturnRatePct", e.target.value)} className="calculator-input" />
            {validation.errors.annualReturnRatePct && <p className="error-text">{validation.errors.annualReturnRatePct}</p>}
          </div>
          <div className="input-group">
            <label>Deposit Timing</label>
            <div className="timing-options">
              <label className="radio-label"><input type="radio" name="depositTiming" value="beginning" checked={form.depositTiming === "beginning"} onChange={() => handleChange("depositTiming", "beginning")} /> Beginning of Month</label>
              <label className="radio-label"><input type="radio" name="depositTiming" value="end" checked={form.depositTiming === "end"} onChange={() => handleChange("depositTiming", "end")} /> End of Month</label>
            </div>
          </div>
        </section>
        <section className="calculator-card results-panel" aria-labelledby="savings-results-heading">
          <h2 id="savings-results-heading" className="section-title">Required Contribution Plan</h2>
          {presentation ? (
            <div className="results-container">
              <div className="metric-card metric-card--primary">
                <span className="metric-label">Required Monthly Deposit</span>
                <span className="metric-value">${presentation.requiredDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="metric-subtext">per month to reach goal</span>
              </div>
              <div className="secondary-metrics-grid">
                <div className="metric-card">
                  <span className="metric-label">Total Contributions</span>
                  <span className="metric-value">${presentation.totalContributions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Total Interest Earned</span>
                  <span className="metric-value text-emerald">+${presentation.totalInterestEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Target Achieved</span>
                  <span className="metric-value">${presentation.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="breakdown-bar-container">
                <div className="breakdown-bar">
                  <div className="bar-segment bar-segment--initial" style={{ width: `${presentation.breakdown.startingBalancePct}%` }} title={`Initial: ${presentation.breakdown.startingBalancePct}%`} />
                  <div className="bar-segment bar-segment--deposits" style={{ width: `${presentation.breakdown.depositsPct}%` }} title={`Deposits: ${presentation.breakdown.depositsPct}%`} />
                  <div className="bar-segment bar-segment--interest" style={{ width: `${presentation.breakdown.interestPct}%` }} title={`Interest: ${presentation.breakdown.interestPct}%`} />
                </div>
                <div className="breakdown-legend">
                  <span>Initial: {presentation.breakdown.startingBalancePct}%</span>
                  <span>Deposits: {presentation.breakdown.depositsPct}%</span>
                  <span>Interest: {presentation.breakdown.interestPct}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="invalid-placeholder"><p>Please fix the errors in the form to recalculate your savings goal.</p></div>
          )}
        </section>
      </div>
      {presentation && presentation.annualRows.length > 0 && (
        <section className="calculator-card schedule-panel" aria-labelledby="schedule-heading">
          <h2 id="schedule-heading" className="section-title">Annual Savings Progression</h2>
          <div className="table-responsive">
            <table className="schedule-table">
              <thead>
                <tr><th>Year</th><th>Starting Balance</th><th>Annual Deposits</th><th>Interest Earned</th><th>Ending Balance</th></tr>
              </thead>
              <tbody>
                {presentation.annualRows.map((row) => (
                  <tr key={row.year}>
                    <td>Year {row.year}</td>
                    <td>${row.startingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>${row.annualDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="text-emerald">+${row.annualInterest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>${row.endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
