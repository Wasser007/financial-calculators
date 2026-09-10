"use client";

import React, { useState, useMemo } from "react";
import {
  SAVINGS_GOAL_DEFAULTS,
  validateSavingsGoalForm,
  type SavingsGoalFormValues,
} from "../lib/calculators/savings-goal/schema.js";
import { buildSavingsGoalPresentation } from "../lib/calculators/savings-goal/presentation.js";

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
const LOCALE_OPTIONS = [
  { value: "en-US", label: "United States (en-US)" },
  { value: "en-GB", label: "United Kingdom (en-GB)" },
  { value: "de-DE", label: "Germany (de-DE)" },
  { value: "fr-FR", label: "France (fr-FR)" },
];

export function SavingsGoalWorkspace() {
  const [form, setForm] = useState<SavingsGoalFormValues>(SAVINGS_GOAL_DEFAULTS);
  const [currency, setCurrency] = useState("USD");
  const [locale, setLocale] = useState("en-US");

  const validation = useMemo(() => validateSavingsGoalForm(form), [form]);
  const presentation = useMemo(() => {
    if (!validation.isValid || !validation.sanitized) return null;
    return buildSavingsGoalPresentation(validation.sanitized);
  }, [validation]);

  const handleChange = (field: keyof SavingsGoalFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setForm(SAVINGS_GOAL_DEFAULTS);
  };

  const formatMoney = (val: number): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <section className="calculator-workspace" aria-labelledby="calculator-heading">
      {/* 顶部标题区 */}
      <div className="calculator-heading">
        <div>
          <p className="eyebrow">Your calculation</p>
          <h2 id="calculator-heading">Savings Goal Parameters</h2>
        </div>
        <p>Complete the inputs below to calculate your required savings schedule. Results update automatically.</p>
      </div>

      <div className="calculator-layout">
        {/* 左栏：输入卡片 */}
        <div className="input-card">
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <fieldset className="form-step">
              <legend><span>1</span> Starting amount</legend>

              {/* 第一步：币种与数字格式 */}
              <div className="field-grid field-grid--two">
                <div className="field">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <p className="field__help">Changes currency symbols only.</p>
                </div>

                <div className="field">
                  <label htmlFor="locale">Number format</label>
                  <select
                    id="locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                  >
                    {LOCALE_OPTIONS.map((loc) => (
                      <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                  </select>
                  <p className="field__help">Changes number formatting only.</p>
                </div>
              </div>

              {/* 目标金额 */}
              <div className="field">
                <label htmlFor="targetAmount">Savings Target ($)</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">{currency}</span>
                  <input
                    id="targetAmount"
                    name="targetAmount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-prefix"
                    value={form.targetAmount}
                    onChange={(e) => handleChange("targetAmount", e.target.value)}
                    aria-describedby={validation.errors.targetAmount ? "targetAmount-error" : "targetAmount-help"}
                  />
                </div>
                <p className="field__help" id="targetAmount-help">The final accumulated amount you are targeting.</p>
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
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">{currency}</span>
                  <input
                    id="initialBalance"
                    name="initialBalance"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className="has-prefix"
                    value={form.initialBalance}
                    onChange={(e) => handleChange("initialBalance", e.target.value)}
                    aria-describedby={validation.errors.initialBalance ? "initialBalance-error" : "initialBalance-help"}
                  />
                </div>
                <p className="field__help" id="initialBalance-help">Amount already saved before recurring deposits.</p>
                {validation.errors.initialBalance && (
                  <p id="initialBalance-error" className="field__error">
                    {validation.errors.initialBalance}
                  </p>
                )}
              </div>
            </fieldset>

            <fieldset className="form-step">
              <legend><span>2</span> Timeline & returns</legend>

              {/* 期限：年数与月数 */}
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
              <p className="field__help">Time horizon to reach your target savings goal.</p>
              {validation.errors.duration && (
                <p className="field__error" role="alert">
                  {validation.errors.duration}
                </p>
              )}

              {/* 预估年化收益率 */}
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
                    aria-describedby={validation.errors.annualReturnRatePct ? "annualReturnRate-error" : "annualReturnRate-help"}
                  />
                  <span className="control-adornment control-adornment--suffix" aria-hidden="true">%</span>
                </div>
                <p className="field__help" id="annualReturnRate-help">Expected annual rate of return or yield.</p>
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

            {/* 操作栏 */}
            <div className="form-actions">
              <button type="submit" className="button button--primary">
                Recalculate
              </button>
              <button type="button" className="button button--secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* 右栏：结果卡片 */}
        <div className="results-card" aria-live="polite">
          <div className="results-card__header">
            <div>
              <p className="eyebrow">YOUR ILLUSTRATION</p>
              <h2>Required Contribution Plan</h2>
            </div>
            <span className="currency-badge">{currency} · {locale}</span>
          </div>

          {presentation ? (
            <div>
              {/* 主指标 */}
              <dl className="result-metric result-metric--primary">
                <dt>Required Monthly Deposit</dt>
                <dd>{formatMoney(presentation.requiredDeposit)}</dd>
              </dl>

              {/* 次级指标横向对齐双列 */}
              <div className="results-grid" style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
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
                  <dd style={{ fontSize: "0.85rem", fontWeight: 500, lineHeight: 1.4 }}>
                    {presentation.breakdown.startingBalancePct.toFixed(1)}% initial<br />
                    {presentation.breakdown.depositsPct.toFixed(1)}% deposits<br />
                    {presentation.breakdown.interestPct.toFixed(1)}% interest
                  </dd>
                </dl>
              </div>
            </div>
          ) : (
            <div style={{ padding: "1.5rem 0" }}>
              <p className="field__error">
                Please fix the errors in the form to recalculate your savings goal.
              </p>
            </div>
          )}

          {/* 免责提示 */}
          <aside className="illustration-note" aria-label="Illustration disclaimer">
            <p>
              <strong>Illustration only.</strong> Not investment, tax, or financial advice. Returns, fees, inflation, and outcomes can differ.
            </p>
          </aside>
        </div>
      </div>

      {/* 底部年度进度明细表 */}
      {presentation && presentation.annualRows.length > 0 && (
        <section className="annual-card" style={{ marginTop: "2rem" }}>
          <div className="card-heading">
            <div>
              <p className="eyebrow">SCHEDULE</p>
              <h2>Annual Savings Progression</h2>
            </div>
            <p style={{ textAlign: "right", margin: 0 }}>Amounts shown in {currency}.</p>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.5rem 0 1rem" }}>
            ← Scroll the table horizontally to see every column.
          </p>
          <div className="annual-table-scroll" style={{ overflowX: "auto" }}>
            <table className="annual-table">
              <thead>
                <tr>
                  <th scope="col" style={{ textAlign: "left" }}>Year</th>
                  <th scope="col" style={{ textAlign: "right" }}>Starting balance</th>
                  <th scope="col" style={{ textAlign: "right" }}>Annual deposits</th>
                  <th scope="col" style={{ textAlign: "right" }}>Interest earned</th>
                  <th scope="col" style={{ textAlign: "right" }}>Ending balance</th>
                </tr>
              </thead>
              <tbody>
                {presentation.annualRows.map((row) => (
                  <tr key={row.year}>
                    <td style={{ textAlign: "left" }}>Year {row.year}</td>
                    <td style={{ textAlign: "right" }}>{formatMoney(row.startingBalance)}</td>
                    <td style={{ textAlign: "right" }}>{formatMoney(row.annualDeposits)}</td>
                    <td style={{ textAlign: "right", color: "#16a34a" }}>+{formatMoney(row.annualInterest)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{formatMoney(row.endingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}
