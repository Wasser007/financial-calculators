"use client";

import React, { useState, useMemo } from "react";
import {
  MONEY_DURATION_DEFAULTS,
  validateMoneyDurationForm,
  type MoneyDurationFormValues,
} from "../lib/calculators/money-duration/schema.js";
import { NumericField } from "./ui/numeric-field.js";
import { buildMoneyDurationPresentation } from "../lib/calculators/money-duration/presentation.js";

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
const LOCALE_OPTIONS = [
  { value: "en-US", label: "United States (en-US)" },
  { value: "en-GB", label: "United Kingdom (en-GB)" },
  { value: "de-DE", label: "Germany (de-DE)" },
  { value: "fr-FR", label: "France (fr-FR)" },
];

export function MoneyDurationWorkspace() {
  const [form, setForm] = useState<MoneyDurationFormValues>(MONEY_DURATION_DEFAULTS);
  const [currency, setCurrency] = useState("USD");
  const [locale, setLocale] = useState("en-US");

  const validation = useMemo(() => validateMoneyDurationForm(form), [form]);
  const presentation = useMemo(() => {
    if (!validation.isValid || !validation.sanitized) return null;
    return buildMoneyDurationPresentation(validation.sanitized);
  }, [validation]);

  const handleChange = (field: keyof MoneyDurationFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };


  const handleReset = () => {
    setForm(MONEY_DURATION_DEFAULTS);
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
          <h2 id="calculator-heading">Retirement & Withdrawal Longevity</h2>
        </div>
        <p>
          Determine how long your savings portfolio will sustain a recurring withdrawal plan under chosen return, inflation, and timing assumptions.
        </p>
      </div>

      <div className="calculator-layout">
        {/* 左栏：输入卡片 */}
        <div className="input-card">
          <form noValidate onSubmit={(e) => e.preventDefault()}>
            <fieldset className="form-step">
              <legend><span>1</span> Balance & withdrawal</legend>

              {/* 币种与数字格式 */}
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

              <NumericField
                id="initialBalance"
                name="initialBalance"
                label="Starting Portfolio Balance"
                value={form.initialBalance}
                prefix={currency}
                step={5000}
                min={1}
                decimals={0}
                helpText="Total current capital available before distributions begin."
                errorText={validation.errors.initialBalance || undefined}
                onChange={(val) => handleChange("initialBalance", val)}
              />

              <NumericField
                id="monthlyWithdrawal"
                name="monthlyWithdrawal"
                label="Monthly Withdrawal Amount"
                value={form.monthlyWithdrawal}
                prefix={currency}
                step={100}
                min={1}
                decimals={0}
                helpText="Target cash withdrawal expected each month."
                errorText={validation.errors.monthlyWithdrawal || undefined}
                onChange={(val) => handleChange("monthlyWithdrawal", val)}
              />
            </fieldset>

            <fieldset className="form-step">
              <legend><span>2</span> Return & inflation assumptions</legend>

              <NumericField
                id="annualReturnRatePct"
                name="annualReturnRatePct"
                label="Estimated Annual Return (%)"
                value={form.annualReturnRatePct}
                suffix="%"
                step={0.1}
                min={0}
                decimals={1}
                helpText="Expected annual nominal investment yield or portfolio return."
                errorText={validation.errors.annualReturnRatePct || undefined}
                onChange={(val) => handleChange("annualReturnRatePct", val)}
              />

              <NumericField
                id="annualInflationRatePct"
                name="annualInflationRatePct"
                label="Annual Inflation Adjustment (%)"
                value={form.annualInflationRatePct}
                suffix="%"
                step={0.1}
                min={0}
                decimals={1}
                helpText="Annual escalation applied to monthly withdrawals to maintain purchasing power."
                errorText={validation.errors.annualInflationRatePct || undefined}
                onChange={(val) => handleChange("annualInflationRatePct", val)}
              />

              {/* 支取时点 */}
              <fieldset className="timing-fieldset">
                <legend>Withdrawal Timing</legend>
                <div className="segmented-control" role="radiogroup">
                  <label>
                    <input
                      type="radio"
                      name="withdrawalTiming"
                      value="beginning"
                      checked={form.withdrawalTiming === "beginning"}
                      onChange={(e) => handleChange("withdrawalTiming", e.target.value)}
                    />
                    <span>Beginning of month</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="withdrawalTiming"
                      value="end"
                      checked={form.withdrawalTiming === "end"}
                      onChange={(e) => handleChange("withdrawalTiming", e.target.value)}
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
              <h2>Estimated Longevity</h2>
            </div>
            <span className="currency-badge">{currency} · {locale}</span>
          </div>

          {presentation ? (
            <div>
              {/* 主指标：可持续年限与月数 */}
              <dl className="result-metric result-metric--primary">
                <dt>Money Lasts For</dt>
                <dd style={{ fontSize: "clamp(2rem, 3.8vw, 2.75rem)" }}>
                  {presentation.headlineDurationText}
                </dd>
              </dl>

              {/* 次级指标横向双列对齐 */}
              <div className="results-grid" style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
                <dl className="result-metric">
                  <dt>Total Withdrawn</dt>
                  <dd>{formatMoney(presentation.totalWithdrawals)}</dd>
                </dl>

                <dl className="result-metric">
                  <dt>Total Interest Earned</dt>
                  <dd style={{ color: "#16a34a" }}>+{formatMoney(presentation.totalInterestEarned)}</dd>
                </dl>

                <dl className="result-metric">
                  <dt>Portfolio Depletion Status</dt>
                  <dd style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    {presentation.isPerpetual ? "Perpetual Surplus" : "Fully Depleted"}
                  </dd>
                </dl>

                <dl className="result-metric">
                  <dt>Ending Balance</dt>
                  <dd>{formatMoney(presentation.finalBalance)}</dd>
                </dl>
              </div>
            </div>
          ) : (
            <div style={{ padding: "1.5rem 0" }}>
              <p className="field__error">
                Please resolve input errors to calculate portfolio duration.
              </p>
            </div>
          )}

          {/* 免责提示卡片 */}
          <aside className="illustration-note" aria-label="Illustration disclaimer">
            <p>
              <strong>Illustration only.</strong> Not investment, tax, or financial advice. Market fluctuations, sequencing risk, and taxation can alter real-world durability.
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
              <h2>Annual Depletion Progression</h2>
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
                  <th scope="col" style={{ textAlign: "right" }}>Annual withdrawals</th>
                  <th scope="col" style={{ textAlign: "right" }}>Interest earned</th>
                  <th scope="col" style={{ textAlign: "right" }}>Ending balance</th>
                </tr>
              </thead>
              <tbody>
                {presentation.annualRows.map((row) => (
                  <tr key={row.year}>
                    <td style={{ textAlign: "left" }}>Year {row.year}</td>
                    <td style={{ textAlign: "right" }}>{formatMoney(row.startingBalance)}</td>
                    <td style={{ textAlign: "right", color: "#dc2626" }}>-{formatMoney(row.annualWithdrawal)}</td>
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
