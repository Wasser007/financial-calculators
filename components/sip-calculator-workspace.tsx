"use client";

import React, { useState, useMemo } from "react";
import { NumericField } from "./ui/numeric-field.js";
import { DEFAULT_SIP_INPUTS, type SipCalculatorInputs } from "../lib/calculators/sip-calculator/schema.js";
import { buildSipPresentation } from "../lib/calculators/sip-calculator/presentation.js";


const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "$",
  AUD: "$",
  JPY: "¥",
};

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
const LOCALE_OPTIONS = [
  { value: "en-US", label: "United States (en-US)" },
  { value: "en-GB", label: "United Kingdom (en-GB)" },
  { value: "de-DE", label: "Germany (de-DE)" },
  { value: "fr-FR", label: "France (fr-FR)" },
];

export function SipCalculatorWorkspace() {
  const [inputs, setInputs] = useState<SipCalculatorInputs>(DEFAULT_SIP_INPUTS);
  const [currency, setCurrency] = useState("USD");
  const [locale, setLocale] = useState("en-US");

  const formatMoney = (val: number): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const presentation = useMemo(() => {
    return buildSipPresentation(inputs, formatMoney);
  }, [inputs, currency, locale]);

  const handleChange = (field: keyof SipCalculatorInputs, val: string) => {
    const num = parseFloat(val);
    setInputs((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num,
    }));
  };

  const handleReset = () => {
    setInputs(DEFAULT_SIP_INPUTS);
  };

  return (
    <section className="calculator-workspace" aria-labelledby="calculator-heading">
      <div className="calculator-heading">
        <div>
          <p className="eyebrow">YOUR CALCULATION</p>
          <h2 id="calculator-heading">SIP / DCA Growth Planner</h2>
        </div>
        <p>Complete the inputs below to calculate your investment growth schedule. Results update automatically.</p>
      </div>

      <div className="calculator-layout">
        <div className="input-card">
          <form onSubmit={(e) => e.preventDefault()} noValidate>
            <fieldset className="form-step">
              <legend><span>1</span> Currency &amp; Format</legend>
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
              </div>
            </fieldset>

            <fieldset className="form-step">
              <legend><span>2</span> Contributions</legend>
              <div className="field-grid field-grid--two">
                <NumericField
                  id="initialInvestment"
                  name="initialInvestment"
                  label="Starting Balance ($)"
                  value={String(inputs.initialInvestment)}
                  prefix={CURRENCY_SYMBOLS[currency] || "$"}
                  step={500}
                  min={0}
                  helpText="Initial starting capital before recurring deposits."
                  onChange={(val) => handleChange("initialInvestment", val)}
                />

                <NumericField
                  id="monthlyContribution"
                  name="monthlyContribution"
                  label="Monthly Deposit ($)"
                  value={String(inputs.monthlyContribution)}
                  prefix={CURRENCY_SYMBOLS[currency] || "$"}
                  step={100}
                  min={0}
                  helpText="Regular periodic amount deposited every month."
                  onChange={(val) => handleChange("monthlyContribution", val)}
                />
              </div>
            </fieldset>

            <fieldset className="form-step">
              <legend><span>3</span> Timeline &amp; returns</legend>
              <div className="field-grid field-grid--two">
                <NumericField
                  id="annualReturnRate"
                  name="annualReturnRate"
                  label="Expected Annual Return (%)"
                  value={String(inputs.annualReturnRate)}
                  suffix="%"
                  step={0.5}
                  min={0}
                  decimals={1}
                  helpText="Expected annual rate of return or yield."
                  onChange={(val) => handleChange("annualReturnRate", val)}
                />

                <NumericField
                  id="investmentPeriodYears"
                  name="investmentPeriodYears"
                  label="Years"
                  value={String(inputs.investmentPeriodYears)}
                  step={1}
                  min={1}
                  helpText="Total investment duration in years."
                  onChange={(val) => handleChange("investmentPeriodYears", val)}
                />
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="button button--secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="results-card" aria-live="polite">
          <div className="results-card__header">
            <div>
              <p className="eyebrow">YOUR ILLUSTRATION</p>
              <h2>Projected Portfolio Value</h2>
            </div>
            <span className="currency-badge">{currency} · {locale}</span>
          </div>

          <div>
            <dl className="result-metric result-metric--primary">
              <dt>Expected Future Value</dt>
              <dd>{presentation.kpis[0]?.value}</dd>
            </dl>

            <div className="results-grid" style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
              <dl className="result-metric">
                <dt>Total Principal Invested</dt>
                <dd>{presentation.kpis[1]?.value}</dd>
              </dl>
              <dl className="result-metric">
                <dt>Total Wealth Gained</dt>
                <dd style={{ color: "#059669" }}>+{presentation.kpis[2]?.value}</dd>
              </dl>
            </div>

            <p className="results-card__disclaimer" style={{ marginTop: "1.5rem", fontSize: "0.8125rem", color: "#64748b" }}>
              Illustration only. Not investment advice. Compounded monthly based on constant return expectations.
            </p>
          </div>
        </div>
      </div>

      <div className="results-card" style={{ marginTop: "2rem" }}>
        <div className="results-card__header">
          <div>
            <p className="eyebrow">ANNUAL BREAKDOWN</p>
            <h2>Year-by-Year Growth Schedule</h2>
          </div>
        </div>
        <div style={{ overflowX: "auto", marginTop: "1rem" }}>
          <table className="data-table" style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th style={{ padding: "0.75rem" }}>Year</th>
                <th style={{ padding: "0.75rem", textAlign: "right" }}>Total Invested</th>
                <th style={{ padding: "0.75rem", textAlign: "right" }}>Total Returns</th>
                <th style={{ padding: "0.75rem", textAlign: "right" }}>Future Value</th>
              </tr>
            </thead>
            <tbody>
              {presentation.schedule.map((row) => (
                <tr key={row.year} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem", fontWeight: 500 }}>Year {row.year}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>{row.totalInvested}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right", color: "#059669" }}>+{row.totalReturns}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 600 }}>{row.futureValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
