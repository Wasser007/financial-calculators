"use client";

import { useId, useMemo, useState } from "react";
import { buildLoanPayoffPresentation } from "../lib/calculators/loan-payoff-presentation.js";
import { StepperButtons } from "./stepper-buttons.js";

interface FormState {
  currency: string;
  numberFormat: string;
  balance: string;
  annualInterestRate: string;
  monthlyPayment: string;
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

const DEFAULT_STATE: FormState = {
  currency: "USD",
  numberFormat: "en-US",
  balance: "150000",
  annualInterestRate: "6.5",
  monthlyPayment: "1200",
  extraMonthlyPayment: "200",
};

export function LoanPayoffWorkspace() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);

  const balanceId = useId();
  const rateId = useId();
  const paymentId = useId();
  const extraId = useId();
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
    return buildLoanPayoffPresentation(
      {
        balance: parseFloat(form.balance) || 0,
        annualInterestRate: parseFloat(form.annualInterestRate) || 0,
        monthlyPayment: parseFloat(form.monthlyPayment) || 0,
        extraMonthlyPayment: parseFloat(form.extraMonthlyPayment) || 0,
      },
      formatCurrency
    );
  }, [form.balance, form.annualInterestRate, form.monthlyPayment, form.extraMonthlyPayment, formatCurrency]);

  const handleReset = () => {
    setForm(DEFAULT_STATE);
  };

  const adjustNumericField = (field: keyof FormState, delta: number, min: number = 0, stepDecimals: number = 0) => {
    const currentVal = parseFloat(form[field]) || 0;
    const nextVal = Math.max(min, currentVal + delta);
    const formatted = stepDecimals > 0 ? nextVal.toFixed(stepDecimals) : String(Math.round(nextVal));
    setForm((prev) => ({ ...prev, [field]: formatted }));
  };

  return (
    <section className="calculator-workspace" aria-labelledby="calculator-heading">
      <div className="calculator-heading">
        <div>
          <p className="eyebrow">YOUR CALCULATION</p>
          <h2 id="calculator-heading">Loan Payoff Inputs</h2>
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
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    {Object.entries(CURRENCIES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label} ({v.symbol})</option>
                    ))}
                  </select>
                </div>
                <p className="field__help">Changes labels and symbols only. Changing currency does not convert values.</p>
              </div>

              <div className="field">
                <label htmlFor={formatId}>Number format</label>
                <div className="control-wrap">
                  <select
                    id={formatId}
                    value={form.numberFormat}
                    onChange={(e) => setForm({ ...form, numberFormat: e.target.value })}
                  >
                    {Object.entries(FORMATS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <p className="field__help">Changes number formatting only. It does not change content language or calculation.</p>
              </div>
            </div>
          </fieldset>

          {/* Step 2: Balance & Rate */}
          <fieldset className="form-step">
            <legend><span>2</span> Balance &amp; Rate</legend>
            <div className="field-grid field-grid--two">
              <div className="field">
                <label htmlFor={balanceId}>Current Loan Balance ({currentCurrency.symbol})</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">
                    {currentCurrency.symbol}
                  </span>
                  <input
                    id={balanceId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.balance}
                    onChange={(e) => setForm({ ...form, balance: e.target.value })}
                    className="has-prefix has-stepper"
                  />
                  <StepperButtons
                    onStepUp={() => adjustNumericField("balance", 1000, 1)}
                    onStepDown={() => adjustNumericField("balance", -1000, 1)}
                  />
                </div>
                <p className="field__help">Remaining unpaid balance on the loan.</p>
              </div>

              <div className="field">
                <label htmlFor={rateId}>Annual Interest Rate (%)</label>
                <div className="control-wrap">
                  <input
                    id={rateId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.annualInterestRate}
                    onChange={(e) => setForm({ ...form, annualInterestRate: e.target.value })}
                    className="has-suffix has-stepper"
                  />
                  <StepperButtons
                    onStepUp={() => adjustNumericField("annualInterestRate", 0.1, 0.1, 1)}
                    onStepDown={() => adjustNumericField("annualInterestRate", -0.1, 0.1, 1)}
                  />
                  <span className="control-adornment control-adornment--suffix" aria-hidden="true">
                    %
                  </span>
                </div>
                <p className="field__help">Nominal annual interest rate (APR).</p>
              </div>
            </div>
          </fieldset>

          {/* Step 3: Payments & Acceleration */}
          <fieldset className="form-step">
            <legend><span>3</span> Payments &amp; Acceleration</legend>
            <div className="field-grid field-grid--two">
              <div className="field">
                <label htmlFor={paymentId}>Standard Monthly Payment ({currentCurrency.symbol})</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">
                    {currentCurrency.symbol}
                  </span>
                  <input
                    id={paymentId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.monthlyPayment}
                    onChange={(e) => setForm({ ...form, monthlyPayment: e.target.value })}
                    className="has-prefix has-stepper"
                  />
                  <StepperButtons
                    onStepUp={() => adjustNumericField("monthlyPayment", 50, 1)}
                    onStepDown={() => adjustNumericField("monthlyPayment", -50, 1)}
                  />
                </div>
                <p className="field__help">Regular required monthly payment.</p>
              </div>

              <div className="field">
                <label htmlFor={extraId}>Extra Monthly Payment ({currentCurrency.symbol})</label>
                <div className="control-wrap">
                  <span className="control-adornment control-adornment--prefix" aria-hidden="true">
                    {currentCurrency.symbol}
                  </span>
                  <input
                    id={extraId}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form.extraMonthlyPayment}
                    onChange={(e) => setForm({ ...form, extraMonthlyPayment: e.target.value })}
                    className="has-prefix has-stepper"
                  />
                  <StepperButtons
                    onStepUp={() => adjustNumericField("extraMonthlyPayment", 25, 0)}
                    onStepDown={() => adjustNumericField("extraMonthlyPayment", -25, 0)}
                  />
                </div>
                <p className="field__help">Additional principal paid each month.</p>
              </div>
            </div>
          </fieldset>

          <div style={{ marginTop: "1.25rem" }}>
            <button type="button" onClick={handleReset} className="button button--secondary">
              Reset inputs
            </button>
          </div>
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
              <dt>Time Saved</dt>
              <dd className="result-metric__number">{presentation.formattedMetrics.timeSaved}</dd>
            </dl>

            <div className="results-grid" style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line-subtle, #f1f5f9)", paddingTop: "1.25rem" }}>
              <dl className="result-metric" style={{ background: "rgba(16, 185, 129, 0.08)", padding: "0.5rem 0.75rem", borderRadius: "8px" }}>
                <dt style={{ color: "#065f46" }}>Interest Saved</dt>
                <dd className="result-metric__number" style={{ color: "#047857" }}>{presentation.formattedMetrics.interestSaved}</dd>
              </dl>
              <dl className="result-metric">
                <dt>Accelerated Payoff</dt>
                <dd className="result-metric__number">{presentation.formattedMetrics.acceleratedTime}</dd>
              </dl>
              <dl className="result-metric">
                <dt>Baseline Payoff</dt>
                <dd className="result-metric__number">{presentation.formattedMetrics.baselineTime}</dd>
              </dl>
              <dl className="result-metric">
                <dt>New Total Interest</dt>
                <dd className="result-metric__number">{presentation.formattedMetrics.totalInterestAccelerated}</dd>
              </dl>
            </div>

            <p style={{ marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-muted, #64748b)" }}>
              {presentation.statusMessage}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
