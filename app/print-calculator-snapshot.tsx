import type { AnnualScheduleEntry, CalculatorSummary } from "../lib/calculator/types";
import { defaultDrafts, evaluateDrafts } from "../lib/presentation/form-model";
import { formatCurrencyDisplay } from "../lib/presentation/currency";

const metrics: readonly [string, keyof CalculatorSummary][] = [
  ["Final balance", "finalBalance"],
  ["Total contributions", "totalContributions"],
  ["Gross growth", "grossGrowth"],
  ["Total fees", "totalFees"],
  ["Nominal investment gain", "nominalInvestmentGain"],
  ["Inflation-adjusted ending balance", "inflationAdjustedFinalBalance"],
];

const columns: readonly [string, keyof AnnualScheduleEntry][] = [
  ["Year", "year"], ["Opening balance", "openingBalance"], ["Contributions", "contributions"],
  ["Gross growth", "grossGrowth"], ["Fees", "fees"], ["Ending balance", "closingBalance"],
  ["Cumulative contributions", "cumulativeContributions"], ["Cumulative gross growth", "cumulativeGrossGrowth"],
  ["Cumulative fees", "cumulativeFees"],
];

function defaultResult() {
  const evaluated = evaluateDrafts(defaultDrafts());
  if (evaluated.inputs === undefined || evaluated.evaluation?.result === undefined) {
    throw new Error("Frozen calculator defaults must produce a valid print result.");
  }
  return { inputs: evaluated.inputs, result: evaluated.evaluation.result };
}

export function PrintCalculatorSnapshot() {
  const { inputs, result } = defaultResult();
  const money = (value: number) => formatCurrencyDisplay(value, inputs.currency, "en-US");
  const rows = result.annualSchedule;
  const maxClosing = Math.max(...rows.map((row) => row.closingBalance), 1);
  const linePoints = rows.map((row, index) => {
    const x = 24 + index * (452 / Math.max(1, rows.length - 1));
    const y = 150 - (row.closingBalance / maxClosing) * 112;
    return `${x},${y}`;
  }).join(" ");
  const composition = [
    ["Starting balance", inputs.initialPrincipal],
    ["Contributions", result.totalContributions],
    ["Gross growth", result.grossGrowth],
    ["Fees", result.totalFees],
  ] as const;
  const maxComposition = Math.max(...composition.map(([, value]) => Math.abs(value)), 1);

  return <div className="print-calculator-snapshot">
    <section className="results-card" aria-labelledby="print-results-heading">
      <div className="results-card__header"><div><p className="eyebrow">Your illustration</p><h2 id="print-results-heading">Estimated result</h2></div><span className="currency-badge">{inputs.currency} · en-US</span></div>
      <dl aria-label="Calculation results" className="results-grid">{metrics.map(([label, key]) => <div className="result-metric" key={key}><dt>{label}</dt><dd>{money(result[key])}</dd></div>)}</dl>
      <div className="illustration-note"><span aria-hidden="true">i</span><p><strong>Illustration only.</strong> Not investment, tax, or financial advice. Returns, fees, inflation, and outcomes can differ.</p></div>
    </section>

    <section className="charts-section" aria-labelledby="print-charts-heading">
      <div className="section-heading"><p className="eyebrow">Visual breakdown</p><h2 id="print-charts-heading">Your result visualised</h2><p>Charts illustrate the supplied calculation; they are not an account statement or guarantee.</p></div>
      <div className="chart-grid">
        <figure className="chart-card"><figcaption><h3>Balance composition</h3></figcaption><svg aria-label="Balance composition chart" role="img" viewBox="0 0 500 190">{composition.map(([label, value], index) => { const height = Math.max(2, Math.abs(value) / maxComposition * 100); const x = 35 + index * 116; return <g key={label}><rect x={x} y={135 - height} width="64" height={height} rx="4" /><text x={x + 32} y="158" textAnchor="middle">{label}</text></g>; })}</svg><p>Starting balance: {money(inputs.initialPrincipal)}. Contributions: {money(result.totalContributions)}. Gross growth: {money(result.grossGrowth)}. Fees: {money(result.totalFees)}.</p><p><strong>Ending balance: {money(result.finalBalance)}.</strong></p></figure>
        <figure className="chart-card"><figcaption><h3>Annual ending balance</h3></figcaption><svg aria-label="Annual ending balance chart" role="img" viewBox="0 0 500 190"><polyline fill="none" points={linePoints} stroke="currentColor" strokeWidth="4" />{rows.map((row, index) => { const x = 24 + index * (452 / Math.max(1, rows.length - 1)); const y = 150 - (row.closingBalance / maxClosing) * 112; return <circle cx={x} cy={y} key={row.year} r="4" />; })}</svg><p>Year 1: {money(rows[0]?.closingBalance ?? 0)}. Year {rows.at(-1)?.year}: {money(rows.at(-1)?.closingBalance ?? 0)}.</p></figure>
      </div>
    </section>

    <section className="annual-card" aria-labelledby="print-annual-heading"><div className="card-heading"><div><p className="eyebrow">Year by year</p><h2 id="print-annual-heading">Annual calculation detail</h2></div><p>Amounts shown in {inputs.currency}.</p></div><table><caption>Annual calculation detail.</caption><thead><tr>{columns.map(([label]) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.year}>{columns.map(([label, key]) => <td key={label}>{key === "year" ? row.year : money(row[key] as number)}</td>)}</tr>)}</tbody></table></section>
  </div>;
}
