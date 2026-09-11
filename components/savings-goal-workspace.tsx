"use client";

import React, { useState, useMemo } from "react";
import { NumericField } from "./ui/numeric-field.js";
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

              <div className="field-grid field-grid--two">
                <div className="field">
                  <label htmlFor="currency">Currency</label>
                  <div className="control-wrap">
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <p className="field__help">Changes currency symbols only.</p>
                </div>

                <div className="field">
                  <label htmlFor="locale">Number format</label>
                  <div className="control-wrap">
                    <select
                      id="locale"
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                    >
                      {LOCALE_OPTIONS.map((loc) => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="field__help">Changes number formatting only.</p>
                </div>

                <NumericField
                  id="targetAmount"
                  name="targetAmount"
                  label="Savings Target ($)"
                  value={form.targetAmount}
                  prefix={currency}
                  step={1000}
                  min={1}
                  helpText="The final accumulated amount you are targeting."
                  errorText={validation.errors.targetAmount}
                  onChange={(val) => handleChange("targetAmount", val)}
                />

                <NumericField
                  id="initialBalance"
                  name="initialBalance"
                  label="Initial Starting Balance ($)"
                  value={form.initialBalance}
                  prefix={currency}
                  step={500}
                  min={0}
                  helpText="Amount already saved before recurring deposits."
                  errorText={validation.errors.initialBalance}
                  onChange={(val) => handleChange("initialBalance", val)}
                />
              </div>
            </fieldset>

            <fieldset className="form-step">
              <legend><span>2</span> Timeline &amp; returns</legend>

              <div className="field-grid field-grid--two">
                <NumericField
                  id="years"
                  name="years"
                  label="Years"
                  value={form.years}
                  step={1}
                  min={0}
                  helpText="Time horizon years."
                  onChange={(val) => handleChange("years", val)}
                />

                <NumericField
                  id="months"
                  name="months"
                  label="Months"
                  value={form.months}
                  step={1}
                  min={0}
                  helpText="Additional months."
                  onChange={(val) => handleChange("months", val)}
                />

                <NumericField
                  id="annualReturnRate"
                  name="annualReturnRate"
                  label="Estimated Annual Return (%)"
                  value={form.annualReturnRatePct}
                  suffix="%"
                  step={0.1}
                  min={0}
                  decimals={1}
                  helpText="Expected annual rate of return or yield."
                  errorText={validation.errors.annualReturnRatePct}
                  onChange={(val) => handleChange("annualReturnRatePct", val)}
                />
              </div>
              {validation.errors.duration && (
                <p className="field__error" role="alert" style={{ marginTop: "0.5rem" }}>
                  {validation.errors.duration}
                </p>
              )}
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
