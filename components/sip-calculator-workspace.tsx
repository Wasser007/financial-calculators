"use client";

import { useId, useMemo, useState } from "react";
import { NumericField } from "./ui/numeric-field.js";
import {
  DEFAULT_SIP_INPUTS,
  type SipCalculatorInputs,
} from "../lib/calculators/sip-calculator/schema.js";
import { buildSipPresentation } from "../lib/calculators/sip-calculator/presentation.js";

interface FormState {
  currency: string;
  numberFormat: string;
  initialInvestment: string;
  monthlyContribution: string;
  annualReturnRate: string;
  investmentPeriodYears: string;
}

const CURRENCIES: Record<string, { symbol: string; label: string }> = {
  USD: { symbol: "$", label: "USD" },
  EUR: { symbol: "€", label: "EUR" },
  GBP: { symbol: "£", label: "GBP" },
  CAD: { symbol: "$", label: "CAD" },
  AUD: { symbol: "$", label: "AUD" },
};

const FORMATS: Record<string, { label: string }> = {
  "en-US": { label: "United States (en-US)" },
  "en-GB": { label: "United Kingdom (en-GB)" },
  "de-DE": { label: "Germany (de-DE)" },
  "fr-FR": { label: "France (fr-FR)" },
};

const DEFAULT_FORM: FormState = {
  currency: "USD",
  numberFormat: "en-US",
  initialInvestment: String(DEFAULT_SIP_INPUTS.initialInvestment),
  monthlyContribution: String(DEFAULT_SIP_INPUTS.monthlyContribution),
  annualReturnRate: String(DEFAULT_SIP_INPUTS.annualReturnRate),
  investmentPeriodYears: String(DEFAULT_SIP_INPUTS.investmentPeriodYears),
};

export function SipCalculatorWorkspace() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const initialId = useId();
  const monthlyId = useId();
  const rateId = useId();
  const yearsId = useId();
  const currencyId = useId();
  const formatId = useId();

  const currentCurrency = CURRENCIES[form.currency] ?? { symbol: "$", label: "USD" };

  const formatCurrency = useMemo(() => {
    return (val: number) => {
      try {
        return new Intl.NumberFormat(form.numberFormat, {
          style: "currency",
          currency: form.currency,
          maximumFractionDigits: 0,
        }).format(val);
      } catch {
        return `${currentCurrency.symbol}${Math.round(val).toLocaleString()}`;
      }
    };
  }, [form.currency, form.numberFormat, currentCurrency.symbol]);

  const presentation = useMemo(() => {
    const inputs: SipCalculatorInputs = {
      initialInvestment: parseFloat(form.initialInvestment) || 0,
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      annualReturnRate: parseFloat(form.annualReturnRate) || 0,
      investmentPeriodYears: parseFloat(form.investmentPeriodYears) || 1,
    };
    return buildSipPresentation(inputs, formatCurrency);
  }, [form, formatCurrency]);

  const handleReset = () => {
    setForm(DEFAULT_FORM);
  };

  return (
    <section className="calculator-workspace" aria-labelledby="calculator-heading">
      <div className="calculator-heading">
        <div>
          <p className="eyebrow">SAVINGS &amp; INVESTING</p>
          <h2 id="calculator-heading">SIP / DCA Growth Planner</h2>
        </div>
      </div>

      <div className="calculator-layout">
        <div className="input-card">
          {/* Step 1: Currency & Format */}
          <fieldset className="form-step">
            <legend><span>1</span> Currency &amp; Format</legend>
            <div className="field-grid field-grid--two">
              <div className="field">
                <label htmlFor={currencyId}>Currency</label>
                <div className="control-wrap">
                  <select
                    id={currencyId}
                    value={form.currency}
                    onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                  >
                    {Object.entries(CURRENCIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label} ({v.symbol})</option>
                    ))}
                  </select>
                </div>
                <p className="field__help">Display currency for results and inputs.</p>
              </div>

              <div className="field">
                <label htmlFor={formatId}>Number format</label>
                <div className="control-wrap">
                  <select
                    id={formatId}
                    value={form.numberFormat}
                    onChange={(e) => setForm((prev) => ({ ...prev, numberFormat: e.target.value }))}
                  >
                    {Object.entries(FORMATS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <p className="field__help">Formatting locale for numeric separators.</p>
              </div>
            </div>
          </fieldset>

          {/* Step 2: Regular Contributions */}
          <fieldset className="form-step">
            <legend><span>2</span> Contributions</legend>
            <div className="field-grid field-grid--two">
              <NumericField
                id={initialId}
                name="initialInvestment"
                label={`Starting Balance (${currentCurrency.symbol})`}
                value={form.initialInvestment}
                prefix={currentCurrency.symbol}
                step={500}
                min={0}
                decimals={0}
                helpText="Initial amount in your investment portfolio."
                onChange={(val) => setForm((prev) => ({ ...prev, initialInvestment: val }))}
              />
              <NumericField
                id={monthlyId}
                name="monthlyContribution"
                label={`Monthly Deposit (${currentCurrency.symbol})`}
                value={form.monthlyContribution}
                prefix={currentCurrency.symbol}
                step={50}
                min={1}
                decimals={0}
                helpText="Regular amount added every month."
                onChange={(val) => setForm((prev) => ({ ...prev, monthlyContribution: val }))}
              />
            </div>
          </fieldset>

          {/* Step 3: Returns & Horizon */}
          <fieldset className="form-step">
            <legend><span>3</span> Growth &amp; Timeline</legend>
            <div className="field-grid field-grid--two">
              <NumericField
                id={rateId}
                name="annualReturnRate"
                label="Expected Annual Return (%)"
                value={form.annualReturnRate}
                suffix="%"
                step={0.5}
                min={0}
                decimals={1}
                helpText="Estimated annualized rate of return."
                onChange={(val) => setForm((prev) => ({ ...prev, annualReturnRate: val }))}
              />
              <NumericField
                id={yearsId}
                name="investmentPeriodYears"
                label="Investment Horizon (Years)"
                value={form.investmentPeriodYears}
                step={1}
                min={1}
                decimals={0}
                helpText="Number of years you plan to contribute."
                onChange={(val) => setForm((prev) => ({ ...prev, investmentPeriodYears: val }))}
              />
            </div>
          </fieldset>

          <div style={{ marginTop: "1.25rem" }}>
            <button type="button" onClick={handleReset} className="button button--secondary">
              Reset inputs
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="results-card" aria-live="polite">
          <div className="kpi-group">
            {presentation.kpis.map((kpi, idx) => (
              <div key={idx} className="metric-card">
                <span className="metric-card__label">{kpi.label}</span>
                <span className="metric-card__value">{kpi.value}</span>
                <span className="metric-card__subtext">{kpi.subtext}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2rem" }}>
            <h3>Annual Growth Schedule</h3>
            <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "right" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border, #e2e8f0)", color: "var(--muted, #64748b)" }}>
                    <th style={{ textAlign: "left", padding: "0.5rem" }}>Year</th>
                    <th style={{ padding: "0.5rem" }}>Total Invested</th>
                    <th style={{ padding: "0.5rem" }}>Total Returns</th>
                    <th style={{ padding: "0.5rem" }}>Future Value</th>
                  </tr>
                </thead>
                <tbody>
                  {presentation.schedule.map((row) => (
                    <tr key={row.year} style={{ borderBottom: "1px solid var(--border-light, #f1f5f9)" }}>
                      <td style={{ textAlign: "left", padding: "0.5rem", fontWeight: 500 }}>Year {row.year}</td>
                      <td style={{ padding: "0.5rem" }}>{row.totalInvested}</td>
                      <td style={{ padding: "0.5rem", color: "#16a34a" }}>+{row.totalReturns}</td>
                      <td style={{ padding: "0.5rem", fontWeight: 600 }}>{row.futureValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
