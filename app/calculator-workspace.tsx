"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import dynamic from "next/dynamic";
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
import { CURRENCY_OPTIONS } from "../lib/internationalization/model";
import { DEFAULT_PRESENTATION_LOCALE, formatCurrencyDisplay, isPresentationLocale, PRESENTATION_LOCALE_OPTIONS, type PresentationLocale } from "../lib/presentation/currency";
let resultsDetailImport: Promise<typeof import("./results-detail")> | undefined;

function importResultsDetail() {
  resultsDetailImport ??= import("./results-detail");
  return resultsDetailImport;
}

function loadResultsDetailNearViewport(): Promise<typeof import("./results-detail")["ResultsDetail"]> {
  if (typeof window === "undefined" || typeof window.IntersectionObserver === "undefined") {
    return importResultsDetail().then((module) => module.ResultsDetail);
  }
  return new Promise((resolve) => {
    let attempts = 0;
    const observe = () => {
      const target = document.getElementById("results-detail-boundary");
      if (target === null) {
        attempts += 1;
        if (attempts < 10) window.requestAnimationFrame(observe);
        else importResultsDetail().then((module) => resolve(module.ResultsDetail));
        return;
      }
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        importResultsDetail().then((module) => resolve(module.ResultsDetail));
      }, { rootMargin: "800px 0px" });
      observer.observe(target);
    };
    observe();
  });
}

const ResultsDetail = dynamic(loadResultsDetailNearViewport, {
  loading: () => <p className="detail-loading">Loading chart and annual details…</p>,
});

const metrics: readonly [string, keyof CalculatorSummary, string][] = [
  ["Final balance", "finalBalance", "result-metric--primary"],
  ["Total contributions", "totalContributions", ""],
  ["Gross growth", "grossGrowth", "result-metric--positive"],
  ["Total fees", "totalFees", ""],
  ["Nominal investment gain", "nominalInvestmentGain", ""],
  ["Inflation-adjusted ending balance", "inflationAdjustedFinalBalance", "result-metric--real"],
];

const advancedFields: readonly (keyof Drafts)[] = [
  "contributionTiming",
  "compoundingFrequency",
  "nominalAnnualFeeRate",
  "inflationRate",
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

type WorkspaceResult = { last: LastValidResult };

function evaluateRequiredDefaults(): WorkspaceResult {
  const evaluated = evaluateDrafts(defaultDrafts());
  if (evaluated.inputs === undefined || evaluated.evaluation?.result === undefined) {
    throw new Error("Frozen calculator defaults must produce a valid result.");
  }
  const last = { inputs: evaluated.inputs, result: evaluated.evaluation.result };
  return { last };
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
  const [workspaceResult, setWorkspaceResult] = useState<WorkspaceResult>(evaluateRequiredDefaults);
  const { last } = workspaceResult;
  const [calculationRevision, setCalculationRevision] = useState(0);
  const [stale, setStale] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [presentationLocale, setPresentationLocale] = useState<PresentationLocale>(DEFAULT_PRESENTATION_LOCALE);
  const presentationLocaleRef = useRef<PresentationLocale>(DEFAULT_PRESENTATION_LOCALE);
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
    const nextLast = { inputs: evaluated.inputs, result: evaluated.evaluation.result };
    setWorkspaceResult({ last: nextLast });
    setCalculationRevision((revision) => revision + 1);
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
    if (advancedFields.includes(field)) setAdvancedOpen(true);
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

  const handleControlChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.currentTarget;
    if (target.name === "presentation-locale") {
      changePresentationLocale(target.value);
      return;
    }
    if (target.name in drafts) change(target.name as keyof Drafts, target.value);
  };

  const handleFormBlur = (event: FormEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (target.name in drafts) blur(target.name as keyof Drafts);
  };

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
    setAdvancedOpen(false);
    presentationLocaleRef.current = DEFAULT_PRESENTATION_LOCALE;
    setPresentationLocale(DEFAULT_PRESENTATION_LOCALE);
    const nextLast = { inputs: evaluated.inputs, result: evaluated.evaluation.result };
    setWorkspaceResult({ last: nextLast });
    setCalculationRevision((revision) => revision + 1);
    setStale(false);
  };

  const changePresentationLocale = (value: string) => {
    if (!isPresentationLocale(value)) return;
    presentationLocaleRef.current = value;
    setPresentationLocale(value);
  };

  const textInput = (
    field: TextField,
    label: string,
    help: string,
    adornment?: Readonly<{ prefix?: string; suffix?: string; optional?: boolean }>,
  ) => {
    const issue = issueFor(errors, field);
    const visibleError = issue !== undefined && (submitted || blurred.has(field));
    return (
      <div className="field" key={field}>
        <label htmlFor={field}>{label}{adornment?.optional && <span className="field__optional">Optional</span>}</label>
        <div className="control-wrap">
          {adornment?.prefix && <span className="control-adornment control-adornment--prefix" aria-hidden="true">{adornment.prefix}</span>}
          <input
            className={adornment?.prefix ? "has-prefix" : adornment?.suffix ? "has-suffix" : undefined}
            id={field}
            name={field}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={drafts[field]}
            onChange={handleControlChange}
            aria-invalid={visibleError || undefined}
            aria-describedby={describedBy(field, visibleError)}
          />
          {adornment?.suffix && <span className="control-adornment control-adornment--suffix" aria-hidden="true">{adornment.suffix}</span>}
        </div>
        <p className="field__help" id={`${field}-help`}>{help}</p>
        {visibleError && issue !== undefined && <p className="field__error" id={`${field}-error`}>{issue.message}</p>}
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
      className="calculator-workspace bg-white p-6"
    >
      <div className="calculator-heading">
        <div>
          <p className="eyebrow">Your calculation</p>
          <h2 id="calculator-heading">Estimate your growth</h2>
        </div>
        <p>Complete all four steps on one page. Results update after a short pause, or when you select Recalculate.</p>
      </div>

      <div className="calculator-layout">
        <div className="input-card">
          <form onBlur={handleFormBlur} onSubmit={submit} noValidate>
            {submitted && errors.length > 0 && (
              <div className="error-summary" ref={errorSummary} tabIndex={-1} role="alert" id="error-summary">
                <h3>Check your inputs</h3>
                <ul>
                  {errors.map((issue, index) => (
                    <li key={`${issue.field ?? "form"}-${issue.code}-${index}`}>
                      {issue.field === undefined ? issue.message : <a href={`#${issue.field}`}>{issue.message}</a>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <fieldset className="form-step">
              <legend><span>1</span> Starting amount</legend>
              <div className="field-grid field-grid--two">
                <div className="field">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={drafts.currency}
                    onChange={handleControlChange}
                    aria-invalid={isErrorVisible("currency") || undefined}
                    aria-describedby={describedBy("currency", isErrorVisible("currency"))}
                  >
                    {CURRENCY_OPTIONS.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                  </select>
                  <p className="field__help" id="currency-help">Changes labels and symbols only. Changing currency does not convert values.</p>
                  {isErrorVisible("currency") && <p className="field__error" id="currency-error">{issueFor(errors, "currency")?.message}</p>}
                </div>
                <div className="field">
                  <label htmlFor="presentation-locale">Number format</label>
                  <select aria-describedby="presentation-locale-help" id="presentation-locale" name="presentation-locale" value={presentationLocale} onChange={handleControlChange}>
                    {PRESENTATION_LOCALE_OPTIONS.map(([locale, label]) => <option key={locale} value={locale}>{label}</option>)}
                  </select>
                  <p className="field__help" id="presentation-locale-help">Changes number formatting only. It does not change the currency, content language, or calculation.</p>
                </div>
              </div>
              {textInput("initialPrincipal", "Starting balance", "Amount invested before recurring contributions.", { prefix: drafts.currency })}
            </fieldset>

            <fieldset className="form-step">
              <legend><span>2</span> Contributions</legend>
              <div className="field-grid field-grid--two">
                {textInput("contributionAmount", "Regular contribution", "Amount added at the selected frequency.", { prefix: drafts.currency })}
                <div className="field">
                  <label htmlFor="contributionFrequency">Contribution frequency</label>
                  <select
                    id="contributionFrequency"
                    name="contributionFrequency"
                    value={drafts.contributionFrequency}
                    onChange={handleControlChange}
                    aria-invalid={isErrorVisible("contributionFrequency") || undefined}
                    aria-describedby={describedBy("contributionFrequency", isErrorVisible("contributionFrequency"))}
                  >
                    {["monthly", "quarterly", "annually"].map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                  </select>
                  <p className="field__help" id="contributionFrequency-help">How often the regular contribution is added.</p>
                  {isErrorVisible("contributionFrequency") && <p className="field__error" id="contributionFrequency-error">{issueFor(errors, "contributionFrequency")?.message}</p>}
                </div>
              </div>
            </fieldset>

            <fieldset className="form-step">
              <legend><span>3</span> Time and growth</legend>
              <div className="field-grid field-grid--two">
                {textInput("durationMonths", "Investment length", durationHelp, { suffix: "months" })}
                {textInput("nominalAnnualRate", "Estimated annual return", "Before fees and inflation.", { suffix: "%" })}
              </div>
            </fieldset>

            <details className="advanced" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
              <summary><span><span className="advanced__step">4</span> Advanced assumptions</span><span className="advanced__status">{advancedOpen ? "Expanded" : "Optional"}</span></summary>
              <div className="advanced__body">
                <fieldset className="timing-fieldset" aria-describedby={describedBy("contributionTiming", isErrorVisible("contributionTiming"))}>
                  <legend>When is each contribution added?</legend>
                  <div className="segmented-control">
                    {["beginning", "end"].map((timing) => (
                      <label key={timing}>
                        <input type="radio" name="contributionTiming" value={timing} checked={drafts.contributionTiming === timing} onChange={handleControlChange} />
                        <span>{timing}</span>
                      </label>
                    ))}
                  </div>
                  <p className="field__help" id="contributionTiming-help">Before or after monthly growth is applied.</p>
                  {isErrorVisible("contributionTiming") && <p className="field__error" id="contributionTiming-error">{issueFor(errors, "contributionTiming")?.message}</p>}
                </fieldset>
                <div className="field">
                  <label htmlFor="compoundingFrequency">Compounding frequency</label>
                  <select id="compoundingFrequency" name="compoundingFrequency" value={drafts.compoundingFrequency} onChange={handleControlChange} aria-invalid={isErrorVisible("compoundingFrequency") || undefined} aria-describedby={describedBy("compoundingFrequency", isErrorVisible("compoundingFrequency"))}>
                    {["daily", "monthly", "quarterly", "semi-annually", "annually"].map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                  </select>
                  <p className="field__help" id="compoundingFrequency-help">How often the nominal annual return compounds.</p>
                  {isErrorVisible("compoundingFrequency") && <p className="field__error" id="compoundingFrequency-error">{issueFor(errors, "compoundingFrequency")?.message}</p>}
                </div>
                <div className="field-grid field-grid--two">
                  {textInput("nominalAnnualFeeRate", "Annual fee", "Annual fee assumption.", { suffix: "%", optional: true })}
                  {textInput("inflationRate", "Annual inflation rate", "Used for the real-value estimate.", { suffix: "%", optional: true })}
                </div>
              </div>
            </details>

            <div className="form-actions flex flex-wrap gap-2">
              <button className="button button--primary" type="submit">Recalculate</button>
              <button className="button button--secondary" type="button" onClick={reset}>Reset</button>
            </div>
          </form>
        </div>

        <aside className="results-card" aria-labelledby="results-heading">
          <div className="results-card__header">
            <div>
              <p className="eyebrow">Your illustration</p>
              <h2 id="results-heading">Estimated result</h2>
            </div>
            <span className="currency-badge">{last.inputs.currency} · {presentationLocale}</span>
          </div>
          {stale && <p className="stale-notice">Results reflect the last valid calculation.</p>}
          <dl aria-label="Calculation results" className="results-grid">
            {metrics.map(([label, key, className]) => (
              <div className={`result-metric ${className}`.trim()} key={key}>
                <dt>{label}</dt>
                <dd>{formatCurrencyDisplay(last.result[key], last.inputs.currency, presentationLocale)}</dd>
              </div>
            ))}
          </dl>
          <div className="illustration-note">
            <span aria-hidden="true">i</span>
            <p><strong>Illustration only.</strong> Not investment, tax, or financial advice. Returns, fees, inflation, and outcomes can differ.</p>
          </div>
        </aside>
      </div>

      <div id="results-detail-boundary">
        <ResultsDetail last={last} stale={stale} presentationLocale={presentationLocale} calculationRevision={calculationRevision} />
      </div>
    </section>
  );
}
