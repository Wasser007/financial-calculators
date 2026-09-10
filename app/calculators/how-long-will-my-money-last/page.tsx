import type { Metadata } from "next";
import { CalculatorPageTemplate } from "../../../components/templates/CalculatorPageTemplate.js";
import { MoneyDurationWorkspace } from "../../../components/money-duration-workspace.js";

export const metadata: Metadata = {
  title: "How Long Will My Money Last? - Longevity Calculator",
  description:
    "Free retirement and savings longevity calculator. Calculate how many years your savings portfolio will sustain recurring withdrawals under return and inflation assumptions.",
};

const FAQS: [string, string][] = [
  [
    "How does the calculator determine how long money will last?",
    "The calculator applies periodic compounding returns to your remaining capital while subtracting monthly withdrawals. If inflation is included, your monthly withdrawal amount scales annually to preserve purchasing power.",
  ],
  [
    "What is the difference between beginning and end of month withdrawals?",
    "Beginning of month withdrawals reduce your principal balance before that month's interest is generated. End of month withdrawals allow the full starting balance of that month to earn interest before funds are disbursed.",
  ],
  [
    "What does 'Perpetual Surplus' mean?",
    "Perpetual surplus indicates that your investment returns equal or exceed the total monthly withdrawals, meaning your starting principal remains intact or continues to grow indefinitely over the simulated horizon.",
  ],
  [
    "Does this model account for market volatility or sequencing risk?",
    "This illustration models a steady annual rate of return. In real markets, sequence of returns risk (poor market performance in early retirement years) can accelerate capital depletion even if long-term averages match your assumptions.",
  ],
];

export default function MoneyDurationPage() {
  return (
    <CalculatorPageTemplate
      slug="how-long-will-my-money-last"
      title="How Long Will My Money Last?"
      description="Calculate how many years and months your nest egg will sustain regular withdrawals under selected return, inflation, and timing assumptions."
      trustPoints={[
        "Inflation-adjusted withdrawals",
        "Full yearly depletion progression",
        "Perpetual surplus detection",
        "100% private browser calculations",
      ]}
      faqs={FAQS}
      workspace={<MoneyDurationWorkspace />}
    >
      <section className="content-section" aria-labelledby="method-heading">
        <div className="section-heading">
          <p className="eyebrow">MATHEMATICAL MODEL</p>
          <h2 id="method-heading">Understanding Portfolio Depletion Mechanics</h2>
        </div>
        <p>
          Capital longevity depends on the interaction between withdrawal velocity and compounding investment yields. Each month, the remaining balance is updated according to:
        </p>
        <blockquote style={{ margin: "1.25rem 0", padding: "1rem 1.25rem", background: "#f8fafc", borderLeft: "4px solid #0f766e" }}>
          <strong>Ending Balance</strong> = (Starting Balance − Withdrawal) × (1 + Monthly Return)
        </blockquote>
        <p>
          When an inflation rate is entered, the monthly distribution scales at the compounding monthly inflation rate, reflecting the increased nominal income required to match rising cost of living over extended retirement horizons.
        </p>
      </section>
    </CalculatorPageTemplate>
  );
}
