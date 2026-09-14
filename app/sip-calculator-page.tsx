import React from "react";
import { SipCalculatorWorkspace } from "../components/sip-calculator-workspace";
import { CalculatorPageTemplate } from "../components/templates/CalculatorPageTemplate";
import { getRequiredCalculator } from "../lib/calculators/catalog";

const SIP_FAQS: readonly (readonly [string, string])[] = [
  [
    "What is a Systematic Investment Plan (SIP) or DCA?",
    "A Systematic Investment Plan (SIP) or Dollar-Cost Averaging (DCA) is an investment approach where you consistently invest a fixed sum of money at regular intervals (usually monthly), regardless of market highs or lows. This disciplined strategy reduces the emotional stress of market timing and smooths out purchase prices over time.",
  ],
  [
    "How does compounding benefit regular monthly contributions?",
    "Every periodic contribution starts earning returns immediately. In subsequent periods, not only does your original principal grow, but previous earnings also generate additional returns. Over a 10 to 30-year horizon, compounding often accounts for the vast majority of your total ending balance.",
  ],
  [
    "Are projected investment returns guaranteed?",
    "No. All market investments in equities, index funds, and mutual funds involve volatility and risk of capital loss. The rate of return entered in this planner serves solely as a hypothetical compounding model for long-term financial planning purposes.",
  ],
  [
    "Can I adjust my monthly deposit over time?",
    "This standard planner assumes a constant monthly deposit amount. If your income increases, stepping up your monthly contribution each year can substantially accelerate your target achievement.",
  ],
];

const REFERENCES = [
  {
    href: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator",
    label: "Investor.gov: Compound Interest & Periodic Investment Calculator (U.S. SEC)",
    external: true,
  },
  {
    href: "https://www.consumerfinance.gov/consumer-tools/save-invest/",
    label: "CFPB: Consumer tools and guidance for saving and investing",
    external: true,
  },
  {
    href: "/methodology",
    label: "Our calculation methodology and limitations",
    external: false,
  },
];

export function SipCalculatorPage() {
  const calculator = getRequiredCalculator("sip-calculator");

  return (
    <CalculatorPageTemplate
      slug="sip-calculator"
      title={calculator.name}
      description={calculator.metadata.description}
      workspace={<SipCalculatorWorkspace />}
      faqs={SIP_FAQS}
      references={REFERENCES}
    >
      <section className="content-section educational-section" aria-labelledby="how-sip-works">
        <div className="section-heading">
          <p className="eyebrow">Mathematical Model</p>
          <h2 id="how-sip-works">How Systematic Investment Planning Works</h2>
        </div>
        <p>
          The SIP calculation employs standard ordinary annuity compound interest formulas. When you deposit an initial amount <em>P</em> and add monthly contributions <em>M</em> at an annual interest rate <em>r</em> (monthly rate <em>i = r / 12</em>) over <em>n</em> months:
        </p>
        <blockquote>
          <strong>Future Value = P × (1 + i)ⁿ + M × [((1 + i)ⁿ - 1) / i]</strong>
        </blockquote>
      </section>
    </CalculatorPageTemplate>
  );
}
