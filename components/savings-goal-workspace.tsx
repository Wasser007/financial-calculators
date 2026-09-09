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
      <div className="calculator-layout">
        {/* 左栏：输入参数表单 */}
        <section className="content-card input-card" aria-labelledby="savings-form-heading">
          <h2 id="savings-form-heading" className="card-heading">
            Savings Goal Parameters
          </h2>

          <div className="form-step">
            <div className="field-grid">
              {/* 目标金额 */}
              <div className="field">
                <label htmlFor="targetAmount">Savings Target ($)</label>
                <div className="control-wrap has-prefix">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">$</span>
                  <input
                    id="targetAmount"
                    type="number"
                    min="1"
                    step="any"
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
                <div className="control-wrap has-prefix">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">$</span>
                  <input
                    id="initialBalance"
                    type="number"
                    min="0"
                    step="any"
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

              {/* 期限：年数与月数 */}
              <div className="field-grid field-grid--two">
                <div className="field">
                  <label htmlFor="years">Years</label>
                  <div className="control-wrap">
                    <input
                      id="years"
                      type="number"
                      min="0"
                      max="80"
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
                      type="number"
                      min="0"
                      max="11"
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
                <div className="control-wrap has-suffix">
                  <input
                    id="annualReturnRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
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
              <fieldset className="timing-fieldset">
                <legend>Deposit Timing</legend>
                <div className="segmented-control" role="radiogroup">
                  <label>
                    <input
                      type="radio"
                      name="depositTiming"
                      value="beginning"
                      checked={form.depositTiming === "beginning"}
                      onChange={(e) => handleChange("depositTiming", e.target.value)}
                    />
                    <span>Beginning of Month</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="depositTiming"
                      value="end"
                      checked={form.depositTiming === "end"}
                      onChange={(e) => handleChange("depositTiming", e.target.value)}
                    />
                    <span>End of Month</span>
                  </label>
                </div>
              </fieldset>
            </div>
          </div>
        </section>

        {/* 右栏：结果展示卡片 */}
        <section className="content-card results-card" aria-labelledby="savings-results-heading">
          <div className="results-card__header">
            <h2 id="savings-results-heading" className="card-heading">
              Required Contribution Plan
            </h2>
            <span className="currency-badge">USD ($)</span>
          </div>

          {presentation ? (
            <div className="results-grid">
              <div className="result-metric result-metric--primary">
                <span className="eyebrow">Required Monthly Deposit</span>
                <p className="result-value">
                  {formatMoney(presentation.requiredDeposit)}
                </p>
                <span className="metric-caption">per month to reach goal</span>
              </div>

              <div className="result-metric">
                <span className="eyebrow">Total Contributions</span>
                <p className="result-value">
                  {formatMoney(presentation.totalContributions)}
                </p>
              </div>

              <div className="result-metric">
                <span className="eyebrow">Total Interest Earned</span>
                <p className="result-value">
                  {formatMoney(presentation.totalInterestEarned)}
                </p>
              </div>

              <div className="result-metric">
                <span className="eyebrow">Target Achieved</span>
                <p className="result-value">
                  {formatMoney(presentation.finalBalance)}
                </p>
              </div>

              <div className="result-metric">
                <span className="eyebrow">Portfolio Breakdown</span>
                <p className="metric-caption">
                  Initial: {presentation.breakdown.startingBalancePct.toFixed(1)}% | Deposits: {presentation.breakdown.depositsPct.toFixed(1)}% | Interest: {presentation.breakdown.interestPct.toFixed(1)}%
                </p>
              </div>
            </div>
          ) : (
            <div className="empty-results">
              <p className="field__error" style={{ marginTop: "1rem" }}>
                Please fix the errors in the form to recalculate your savings goal.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* 底部全宽卡片：年度进度明细表 */}
      {presentation && presentation.annualRows.length > 0 && (
        <section className="content-card" style={{ marginTop: "1.5rem" }} aria-labelledby="schedule-heading">
          <h3 id="schedule-heading" className="card-heading">
            Annual Savings Progression
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table className="annual-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "0.75rem 0.5rem" }}>Year</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Starting Balance</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Annual Deposits</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Interest Earned</th>
                  <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Ending Balance</th>
                </tr>
              </thead>
              <tbody>
                {presentation.annualRows.map((row) => (
                  <tr key={row.year} style={{ borderBottom: "1px solid #edf2f7" }}>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Year {row.year}</td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>{formatMoney(row.startingBalance)}</td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>{formatMoney(row.annualDeposits)}</td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#16a34a" }}>+{formatMoney(row.annualInterest)}</td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600 }}>{formatMoney(row.endingBalance)}</td>
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
