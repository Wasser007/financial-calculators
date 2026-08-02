"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type {
  CalculatorInputs,
  CalculatorResult,
  CalculatorSummary,
  ValidationIssue,
} from "../lib/calculator/types";
import {
  defaultDrafts,
  draftsToInputs,
  evaluateDrafts,
  type Drafts,
} from "../lib/presentation/form-model";
import { formatCurrencyDisplay } from "../lib/presentation/currency";
import { AnnualTable } from "./annual-table";

const metrics: readonly [string, keyof CalculatorSummary][] = [
  ["Final balance", "finalBalance"],
  ["Total contributions", "totalContributions"],
  ["Gross growth", "grossGrowth"],
  ["Total fees", "totalFees"],
  ["Nominal investment gain", "nominalInvestmentGain"],
  ["Inflation-adjusted ending balance", "inflationAdjustedFinalBalance"],
];

type TextField = Extract<
  keyof Drafts,
  | "initialPrincipal"
  | "contributionAmount"
  | "durationMonths"
  | "nominalAnnualRate"
  | "nominalAnnualFeeRate"
  | "inflationRate"
>;

type LastValidResult = {
  inputs: CalculatorInputs;
  result: CalculatorResult;
};

function evaluateRequiredDefaults(): LastValidResult {
  const evaluated = evaluateDrafts(defaultDrafts());
  if (evaluated.inputs === undefined || evaluated.evaluation?.result === undefined) {
    throw new Error("Frozen calculator defaults must produce a valid result.");
  }
  return { inputs: evaluated.inputs, result: evaluated.evaluation.result };
}

function issueFor(errors: ValidationIssue[], field: keyof Drafts): ValidationIssue | undefined {
  return errors.find((issue) => issue.field === field);
}

function describedBy(field: keyof Drafts, visibleError: boolean): string {
  return visibleError ? `${field}-help ${field}-error` : `${field}-help`;
}

export function CalculatorWorkspace() {
  const [drafts, setDrafts] = useState<Drafts>(defaultDrafts);
  const [blurred, setBlurred] = useState<Set<keyof Drafts>>(() => new Set());
  const [submitted, setSubmitted] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [last, setLast] = useState<LastValidResult>(evaluateRequiredDefaults);
  const [stale, setStale] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorSummary = useRef<HTMLDivElement>(null);

  const parsed = draftsToInputs(drafts);
  const errors = parsed.errors;

  const cancelPendingCalculation = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const commitCalculation = useCallback((candidate: Drafts): boolean => {
    const evaluated = evaluateDrafts(candidate);
    if (evaluated.inputs === undefined || evaluated.evaluation?.result === undefined) {
      return false;
    }
    setLast({ inputs: evaluated.inputs, result: evaluated.evaluation.result });
    setStale(false);
    return true;
  }, []);

  useEffect(() => {
    if (!stale || errors.length > 0) {
      cancelPendingCalculation();
      return;
    }
    cancelPendingCalculation();
    const candidate = drafts;
    timer.current = setTimeout(() => {
      timer.current = null;
      commitCalculation(candidate);
    }, 300);
    return cancelPendingCalculation;
  }, [cancelPendingCalculation, commitCalculation, drafts, errors.length, stale]);

  useEffect(() => cancelPendingCalculation, [cancelPendingCalculation]);

  useEffect(() => {
    if (submitAttempt > 0) {
      errorSummary.current?.focus();
    }
  }, [submitAttempt]);

  const change = (field: keyof Drafts, value: string) => {
    setDrafts((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
    setStale(true);
  };

  const blur = (field: keyof Drafts) => {
    setBlurred((current) => {
      const next = new Set(current);
      next.add(field);
      return next;
    });
  };

  const isErrorVisible = (field: keyof Drafts) =>
    issueFor(errors, field) !== undefined && (submitted || blurred.has(field));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    cancelPendingCalculation();
    setSubmitted(true);
    if (errors.length > 0) {
      setSubmitAttempt((attempt) => attempt + 1);
      return;
    }
    commitCalculation(drafts);
  };

  const reset = () => {
    cancelPendingCalculation();
    const defaults = defaultDrafts();
    const evaluated = evaluateDrafts(defaults);
    if (evaluated.inputs === undefined || evaluated.evaluation?.result === undefined) {
      throw new Error("Frozen calculator defaults must produce a valid result.");
    }
    setDrafts(defaults);
    setBlurred(new Set());
    setSubmitted(false);
    setLast({ inputs: evaluated.inputs, result: evaluated.evaluation.result });
    setStale(false);
  };

  const textInput = (field: TextField, label: string, help: string) => {
    const issue = issueFor(errors, field);
    const visibleError = issue !== undefined && (submitted || blurred.has(field));
    return (
      <div key={field}>
        <label htmlFor={field}>{label}</label>
        <input
          id={field}
          name={field}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={drafts[field]}
          aria-invalid={visibleError || undefined}
          aria-describedby={describedBy(field, visibleError)}
          onBlur={() => blur(field)}
          onChange={(event) => change(field, event.target.value)}
        />
        <p id={`${field}-help`}>{help}</p>
        {visibleError && issue !== undefined && <p id={`${field}-error`}>{issue.message}</p>}
      </div>
    );
  };

  const duration = Number(drafts.durationMonths);
  const durationHelp = Number.isInteger(duration) && duration >= 0
    ? `${Number((duration / 12).toFixed(2))} years.`
    : "Enter a whole number of months.";

  return (
    <section
      id="calculator-workspace"
      aria-labelledby="calculator-heading"
      className="mt-10 rounded-2xl bg-white p-6 shadow-sm"
    >
      <h2 id="calculator-heading">Estimate your growth</h2>
      <form onSubmit={submit} noValidate>
        {submitted && errors.length > 0 && (
          <div ref={errorSummary} tabIndex={-1} role="alert" id="error-summary">
            <h3>Check your inputs</h3>
            <ul>
              {errors.map((issue, index) => (
                <li key={`${issue.field ?? "form"}-${issue.code}-${index}`}>
                  {issue.field === undefined
                    ? issue.message
                    : <a href={`#${issue.field}`}>{issue.message}</a>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={drafts.currency}
            aria-invalid={isErrorVisible("currency") || undefined}
            aria-describedby={describedBy("currency", isErrorVisible("currency"))}
            onBlur={() => blur("currency")}
            onChange={(event) => change("currency", event.target.value)}
          >
            {["USD", "EUR", "GBP", "CAD", "AUD"].map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          <p id="currency-help">Choose the currency used for inputs and results.</p>
          {isErrorVisible("currency") && <p id="currency-error">{issueFor(errors, "currency")?.message}</p>}
        </div>

        {textInput("initialPrincipal", "Starting balance", "Amount invested before recurring contributions.")}
        {textInput("contributionAmount", "Regular contribution", "Amount added at the selected frequency.")}

        <div>
          <label htmlFor="contributionFrequency">Contribution frequency</label>
          <select
            id="contributionFrequency"
            name="contributionFrequency"
            value={drafts.contributionFrequency}
            aria-invalid={isErrorVisible("contributionFrequency") || undefined}
            aria-describedby={describedBy("contributionFrequency", isErrorVisible("contributionFrequency"))}
            onBlur={() => blur("contributionFrequency")}
            onChange={(event) => change("contributionFrequency", event.target.value)}
          >
            {["monthly", "quarterly", "annually"].map((frequency) => (
              <option key={frequency} value={frequency}>{frequency}</option>
            ))}
          </select>
          <p id="contributionFrequency-help">How often the regular contribution is added.</p>
          {isErrorVisible("contributionFrequency") && <p id="contributionFrequency-error">{issueFor(errors, "contributionFrequency")?.message}</p>}
        </div>

        {textInput("durationMonths", "Investment length", durationHelp)}
        {textInput("nominalAnnualRate", "Estimated annual return", "Enter a percentage, before fees and inflation.")}

        <details>
          <summary>Advanced assumptions</summary>
          <fieldset aria-describedby={describedBy("contributionTiming", isErrorVisible("contributionTiming"))}>
            <legend>When is each contribution added?</legend>
            {["beginning", "end"].map((timing) => (
              <label key={timing}>
                <input
                  type="radio"
                  name="contributionTiming"
                  value={timing}
                  checked={drafts.contributionTiming === timing}
                  onBlur={() => blur("contributionTiming")}
                  onChange={(event) => change("contributionTiming", event.target.value)}
                />
                {timing}
              </label>
            ))}
            <p id="contributionTiming-help">Choose whether contributions are added before or after monthly growth.</p>
            {isErrorVisible("contributionTiming") && <p id="contributionTiming-error">{issueFor(errors, "contributionTiming")?.message}</p>}
          </fieldset>

          <div>
            <label htmlFor="compoundingFrequency">Compounding frequency</label>
            <select
              id="compoundingFrequency"
              name="compoundingFrequency"
              value={drafts.compoundingFrequency}
              aria-invalid={isErrorVisible("compoundingFrequency") || undefined}
              aria-describedby={describedBy("compoundingFrequency", isErrorVisible("compoundingFrequency"))}
              onBlur={() => blur("compoundingFrequency")}
              onChange={(event) => change("compoundingFrequency", event.target.value)}
            >
              {["daily", "monthly", "quarterly", "semi-annually", "annually"].map((frequency) => (
                <option key={frequency} value={frequency}>{frequency}</option>
              ))}
            </select>
            <p id="compoundingFrequency-help">How often the nominal annual return compounds.</p>
            {isErrorVisible("compoundingFrequency") && <p id="compoundingFrequency-error">{issueFor(errors, "compoundingFrequency")?.message}</p>}
          </div>

          {textInput("nominalAnnualFeeRate", "Annual fee", "Enter the annual fee percentage.")}
          {textInput("inflationRate", "Annual inflation rate", "Enter the assumed annual inflation percentage.")}
        </details>

        <div className="flex flex-wrap gap-2">
          <button type="submit">Recalculate</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
      </form>

      {stale && <p role="status">Results reflect the last valid calculation.</p>}
      <p>Illustration only — not investment, tax, or financial advice. Returns, fees, inflation, and outcomes can differ.</p>
      <dl aria-label="Calculation results">
        {metrics.map(([label, key]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{formatCurrencyDisplay(last.result[key], last.inputs.currency)}</dd>
          </div>
        ))}
      </dl>
      <AnnualTable rows={last.result.annualSchedule} currency={last.inputs.currency} stale={stale} />
    </section>
  );
}
