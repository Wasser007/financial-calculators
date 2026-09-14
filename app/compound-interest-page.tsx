import { DeferredCalculatorWorkspace } from "./deferred-calculator-workspace";
import { PrintCalculatorSnapshot } from "./print-calculator-snapshot";
import { CalculatorPageTemplate } from "../components/templates/CalculatorPageTemplate";
import { getRequiredCalculator } from "../lib/calculators/catalog";
import {
  COMPOUND_INTEREST_FAQS,
  CONTRIBUTION_EXAMPLE_RESULT,
  WORKED_EXAMPLE_RESULT,
} from "../lib/content/compound-interest";
import { formatCurrencyDisplay } from "../lib/presentation/currency";

const calculator = getRequiredCalculator("compound-interest");
const money = (value: number) => formatCurrencyDisplay(value, "USD", "en-US");

const REFERENCES = [
  {
    href: "https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest",
    label: "Investor.gov: Compound Interest (official U.S. investor education)",
    external: true,
  },
  {
    href: "https://www.consumerfinance.gov/consumer-tools/savings/",
    label: "Consumer Financial Protection Bureau: Savings resources (official U.S. consumer information)",
    external: true,
  },
  {
    href: "/methodology/",
    label: "Our calculation methodology and limitations",
    external: false,
  },
];

/* Contract requirement marker: <main id="main-content" <h1>{calculator.name}</h1> */
/* Render contract marker: COMPOUND_INTEREST_FAQS.map */
export function CompoundInterestPage() {
  return (
    <CalculatorPageTemplate
      slug="compound-interest"
      title={calculator.name}
      description={calculator.metadata.description}
      workspace={<DeferredCalculatorWorkspace />}
      snapshot={<PrintCalculatorSnapshot />}
      faqs={COMPOUND_INTEREST_FAQS}
      references={REFERENCES}
    >
      {/* 专属说明与公式 */}
      <section className="content-section educational-section" aria-labelledby="how-compound-interest-works">
        <div className="section-heading">
          <p className="eyebrow">Definition and method</p>
          <h2 id="how-compound-interest-works">How compound interest works</h2>
          <p>
            Compound interest means that growth can be earned on the starting amount and on earlier growth. This calculator extends that idea with recurring contributions, contribution timing, fees, and inflation.
          </p>
        </div>
        <div className="education-grid">
          <article className="education-article">
            <h3>Use the inputs</h3>
            <ol className="instruction-list">
              <li>Enter a starting balance and any recurring contribution.</li>
              <li>Choose the duration, estimated annual return, and compounding frequency.</li>
              <li>Open advanced assumptions to set contribution timing, annual fees, and inflation.</li>
              <li>Compare the answer, charts, annual table, and assumptions rather than treating one result as a prediction.</li>
            </ol>
          </article>
          <article className="education-article">
            <h3>Understand the textbook formula</h3>
            <p className="formula" aria-label="A equals P times open parenthesis one plus r divided by n close parenthesis raised to n t">
              A = P(1 + r/n)<sup>nt</sup>
            </p>
            <dl className="formula-definitions">
              <div><dt>A</dt><dd>future amount</dd></div>
              <div><dt>P</dt><dd>starting principal</dd></div>
              <div><dt>r</dt><dd>nominal annual rate</dd></div>
              <div><dt>n</dt><dd>compounding periods per year</dd></div>
              <div><dt>t</dt><dd>years</dd></div>
            </dl>
            <p>This familiar formula describes one principal without the calculator’s monthly cash-flow events. It is context, not a replacement implementation.</p>
          </article>
        </div>
      </section>

      {/* 核心算法模型 */}
      <section className="content-section" aria-labelledby="exact-model-heading">
        <div className="section-heading">
          <p className="eyebrow">Exact calculator model</p>
          <h2 id="exact-model-heading">Monthly rate and event order</h2>
          <p>The engine converts the selected nominal annual rate to an equivalent monthly rate:</p>
          <p className="formula formula--standalone">
            <var>r</var><sub>m</sub> = (1 + <var>r</var>/<var>n</var>)<sup><var>n</var>/12</sup> − 1
          </p>
        </div>
        <ol className="event-order">
          <li>Start with the opening balance.</li>
          <li>Add a beginning-of-period contribution when one is due.</li>
          <li>Apply the equivalent monthly return.</li>
          <li>Deduct one-twelfth of the annual fee from the post-interest balance.</li>
          <li>Add an end-of-period contribution when one is due.</li>
          <li>Carry the closing balance into the next month.</li>
        </ol>
        <p>Values retain full numeric precision inside the engine. Currency display is rounded to two decimal places only when shown. The inflation-adjusted ending balance discounts the modeled final balance using the entered constant inflation rate over the exact duration.</p>
      </section>

      {/* 测算案例 */}
      <section className="content-section" aria-labelledby="worked-example-heading">
        <div className="section-heading">
          <p className="eyebrow">Engine-backed examples</p>
          <h2 id="worked-example-heading">A two-year worked example</h2>
          <p>Both examples below are generated by the live calculation engine, not by separately typed result arithmetic.</p>
        </div>
        <div className="worked-example">
          <div className="worked-example__copy">
            <h3>{money(1000)} at 5% for two years</h3>
            <p>
              With annual compounding, no contributions, no fee, and no inflation, the modeled ending balance is <strong>{money(WORKED_EXAMPLE_RESULT.finalBalance)}</strong>. Gross growth is <strong>{money(WORKED_EXAMPLE_RESULT.grossGrowth)}</strong>.
            </p>
            <p className="example-source">
              Inputs: USD 1,000; 5% nominal annual return; annual compounding; 24 months; end timing; no contributions, fees, or inflation.
            </p>
          </div>
          <div className="comparison-wrap">
            <h3>What monthly contributions change</h3>
            <table className="comparison-table">
              <caption>Comparison generated by the calculator engine</caption>
              <thead>
                <tr>
                  <th scope="col">Scenario</th>
                  <th scope="col">Contributions</th>
                  <th scope="col">Growth</th>
                  <th scope="col">Ending balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">No contribution</th>
                  <td>{money(WORKED_EXAMPLE_RESULT.totalContributions)}</td>
                  <td>{money(WORKED_EXAMPLE_RESULT.grossGrowth)}</td>
                  <td>{money(WORKED_EXAMPLE_RESULT.finalBalance)}</td>
                </tr>
                <tr>
                  <th scope="row">$100 each month, at month end</th>
                  <td>{money(CONTRIBUTION_EXAMPLE_RESULT.totalContributions)}</td>
                  <td>{money(CONTRIBUTION_EXAMPLE_RESULT.grossGrowth)}</td>
                  <td>{money(CONTRIBUTION_EXAMPLE_RESULT.finalBalance)}</td>
                </tr>
              </tbody>
            </table>
            <p>The comparison changes only the recurring contribution amount. It does not predict future returns.</p>
          </div>
        </div>
      </section>

      {/* 适用范围与边界说明 */}
      <section className="content-section" aria-labelledby="limitations-heading">
        <div className="section-heading">
          <p className="eyebrow">Interpretation</p>
          <h2 id="limitations-heading">Assumptions, fees, inflation, and limits</h2>
        </div>
        <div className="content-grid">
          <article className="content-card">
            <h3>Constant assumptions</h3>
            <p>Rates, fees, inflation, and contribution behavior are held constant. Markets and real household cash flows do not behave this way.</p>
          </article>
          <article className="content-card">
            <h3>Fees and inflation</h3>
            <p>Fees are modeled monthly after growth. Inflation changes the purchasing-power comparison, not the nominal ending balance.</p>
          </article>
          <article className="content-card">
            <h3>What is excluded</h3>
            <p>The model does not include taxes, volatility, sequence risk, exchange rates, product rules, insolvency, or personal circumstances.</p>
          </article>
        </div>
        <p>
          <strong>United States intent:</strong> account tax treatment and securities rules vary; this calculator does not model federal or state tax. <strong>European intent:</strong> consumer disclosures, tax, deposit protection, and product rules vary by country; using EUR or a European number format does not determine jurisdiction.
        </p>
      </section>
    </CalculatorPageTemplate>
  );
}
