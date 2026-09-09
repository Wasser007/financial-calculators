"use client";

import React, { useState, useMemo } from "react";
import {
  SAVINGS_GOAL_DEFAULTS,
  validateSavingsGoalForm,
  type SavingsGoalFormValues,
} from "../lib/calculators/savings-goal/schema.js";
import { buildSavingsGoalPresentation } from "../lib/calculators/savings-goal/presentation.js";

function formatMoney(val: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

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
      {/* 顶部标题栏，保证两边卡片顶部基准线平齐 */}
      <div className="calculator-heading">
        <span className="eyebrow">YOUR CALCULATION</span>
        <h2>Savings Goal Parameters</h2>
        <p>Set your savings target, initial deposit, and timeline to calculate the required monthly savings.</p>
      </div>

      <div className="calculator-layout">
        {/* 左栏：输入卡片 */}
        <div className="input-card">
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <fieldset className="form-step">
              <legend><span>1</span> Starting amount</legend>

              {/* 目标金额 */}
              <div className="field">
                <label htmlFor="targetAmount">Savings Target ($)</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">USD</span>
                  <input
                    id="targetAmount"
                    name="targetAmount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-prefix"
                    value={form.targetAmount}
                    onChange={(e) => handleChange("targetAmount", e.target.value)}
                    aria-describedby={validation.errors.targetAmount ? "targetAmount-error" : undefined}
                  />
                </div>
                {validation.errors.targetAmount && (
                  <p id="targetAmount-error" className="field__error">
                    {validation.errors.targetAmount}
                  </p>
                )}
              </div>

              {/* 初始本金 */}
              <div className="field">
                <label htmlFor="initialBalance">Initial Starting Balance ($)</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">USD</span>
                  <input
                    id="initialBalance"
                    name="initialBalance"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-prefix"
                    value={form.initialBalance}
                    onChange={(e) => handleChange("initialBalance", e.target.value)}
                    aria-describedby={validation.errors.initialBalance ? "initialBalance-error" : undefined}
                  />
                </div>
                {validation.errors.initialBalance && (
                  <p id="initialBalance-error" className="field__error">
                    {validation.errors.initialBalance}
                  </p>
                )}
              </div>
            </fieldset>

            <fieldset className="form-step">
              <legend><span>2</span> Timeline & returns</legend>

              {/* 期限：年与月 */}
              <div className="field-grid field-grid--two">
                <div className="field">
                  <label htmlFor="years">Years</label>
                  <div className="control-wrap">
                    <input
                      id="years"
                      name="years"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={form.years}
                      onChange={(e) => handleChange("years", e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="months">Months</label>
                  <div className="control-wrap">
                    <input
                      id="months"
                      name="months"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={form.months}
                      onChange={(e) => handleChange("months", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {validation.errors.duration && (
                <p className="field__error" role="alert">
                  {validation.errors.duration}
                </p>
              )}

              {/* 预期年化收益率 */}
              <div className="field">
                <label htmlFor="annualReturnRate">Estimated Annual Return (%)</label>
                <div className="control-wrap">
                  <input
                    id="annualReturnRate"
                    name="annualReturnRate"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-suffix"
                    value={form.annualReturnRatePct}
                    onChange={(e) => handleChange("annualReturnRatePct", e.target.value)}
                    aria-describedby={validation.errors.annualReturnRatePct ? "annualReturnRate-error" : undefined}
                  />
                  <span className="control-adornment control-adornment--suffix" aria-hidden="true">%</span>
                </div>
                {validation.errors.annualReturnRatePct && (
                  <p id="annualReturnRate-error" className="field__error">
                    {validation.errors.annualReturnRatePct}
                  </p>
                )}
              </div>

              {/* 存款时点 */}
              <fieldset className="timing-fieldset" style={{ marginTop: "1rem" }}>
                <legend style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink-soft)", marginBottom: "0.5rem" }}>
                  Deposit Timing
                </legend>
                <div className="segmented-control" role="radiogroup">
                  <label>
                    <input
                      type="radio"
                      name="depositTiming"
                      value="beginning"
                      checked={form.depositTiming === "beginning"}
                      onChange={(e) => handleChange("depositTiming", e.target.value)}
                    />
                    <span>Beginning of month</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="depositTiming"
                      value="end"
                      checked={form.depositTiming === "end"}
                      onChange={(e) => handleChange("depositTiming", e.target.value)}
                    />
                    <span>End of month</span>
                  </label>
                </div>
              </fieldset>
            </fieldset>
          </form>
        </div>

        {/* 右栏：结果展示卡片 */}
        <div className="results-card" aria-live="polite">
          <div className="results-card__header">
            <div>
              <span className="eyebrow">YOUR ILLUSTRATION</span>
              <h2>Required Contribution Plan</h2>
            </div>
            <span className="currency-badge">USD · en-US</span>
          </div>

          {presentation ? (
            <div className="results-grid">
              <dl className="result-metric result-metric--primary">
                <dt>Required Monthly Deposit</dt>
                <dd>{formatMoney(presentation.requiredDeposit)}</dd>
                <p className="illustration-note">per month to reach goal</p>
              </dl>

              <dl className="result-metric">
                <dt>Total Contributions</dt>
                <dd>{formatMoney(presentation.totalContributions)}</dd>
              </dl>

              <dl className="result-metric">
                <dt>Total Interest Earned</dt>
                <dd style={{ color: "#16a34a" }}>+{formatMoney(presentation.totalInterestEarned)}</dd>
              </dl>

              <dl className="result-metric">
                <dt>Target Achieved</dt>
                <dd>{formatMoney(presentation.finalBalance)}</dd>
              </dl>

              <dl className="result-metric">
                <dt>Portfolio Breakdown</dt>
                <dd style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                  {presentation.breakdown.startingBalancePct.toFixed(1)}% initial · {presentation.breakdown.depositsPct.toFixed(1)}% deposits · {presentation.breakdown.interestPct.toFixed(1)}% interest
                </dd>
              </dl>
            </div>
          ) : (
            <div style={{ padding: "1.5rem 0" }}>
              <p className="field__error">
                Please fix the errors in the form to recalculate your savings goal.
              </p>
            </div>
          )}

          <div className="illustration-note" style={{ marginTop: "1.5rem", padding: "0.85rem", background: "#f8fafc", borderRadius: "8px" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink-soft)" }}>
              Calculation assumes constant monthly contributions and fixed compound growth. Actual yields and market returns may fluctuate.
            </p>
          </div>
        </div>
      </div>

      {/* 底部明细表格卡片 */}
      {presentation && presentation.annualRows.length > 0 && (
        <div className="annual-card" style={{ marginTop: "2rem" }}>
          <div className="card-heading" style={{ marginBottom: "1rem" }}>
            <span className="eyebrow">SCHEDULE</span>
            <h2>Annual Savings Progression</h2>
          </div>
          <div className="annual-table-scroll" style={{ overflowX: "auto" }}>
            <table className="annual-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th scope="col" style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Year</th>
                  <th scope="col" style={{ textAlign: "right", padding: "0.75rem 1rem" }}>Starting balance</th>
                  <th scope="col" style={{ textAlign: "right", padding: "0.75rem 1rem" }}>Annual deposits</th>
                  <th scope="col" style={{ textAlign: "right", padding: "0.75rem 1rem" }}>Interest earned</th>
                  <th scope="col" style={{ textAlign: "right", padding: "0.75rem 1rem" }}>Ending balance</th>
                </tr>
              </thead>
              <tbody>
                {presentation.annualRows.map((row) => (
                  <tr key={row.year}>
                    <td style={{ textAlign: "left", padding: "0.75rem 1rem", borderTop: "1px solid #e2e8f0" }}>Year {row.year}</td>
                    <td style={{ textAlign: "right", padding: "0.75rem 1rem", borderTop: "1px solid #e2e8f0" }}>{formatMoney(row.startingBalance)}</td>
                    <td style={{ textAlign: "right", padding: "0.75rem 1rem", borderTop: "1px solid #e2e8f0" }}>{formatMoney(row.annualDeposits)}</td>
                    <td style={{ textAlign: "right", padding: "0.75rem 1rem", borderTop: "1px solid #e2e8f0", color: "#16a34a" }}>+{formatMoney(row.annualInterest)}</td>
                    <td style={{ textAlign: "right", padding: "0.75rem 1rem", borderTop: "1px solid #e2e8f0", fontWeight: 600 }}>{formatMoney(row.endingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
