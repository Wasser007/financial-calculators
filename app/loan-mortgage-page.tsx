import React from "react";
import { LoanMortgageWorkspace } from "../components/loan-mortgage-workspace";
import { CalculatorPageTemplate } from "../components/templates/CalculatorPageTemplate";
import { LOAN_FAQ_ITEMS } from "../lib/calculators/loan-amortization/presentation.js";

const REFERENCES = [
  {
    href: "https://www.consumerfinance.gov/owning-a-home/loan-options/",
    label: "Consumer Financial Protection Bureau: Explore loan options and amortization",
    external: true,
  },
  {
    href: "/methodology",
    label: "Our calculation methodology and limitations",
    external: false,
  },
];

export function LoanMortgagePage() {
  return (
    <CalculatorPageTemplate
      slug="loan-mortgage-amortization"
      title="Loan & Mortgage Amortization Calculator"
      description="Calculate monthly payments, total interest costs, and schedule payoffs for fixed payment and equal principal loans."
      workspace={<LoanMortgageWorkspace />}
      faqs={LOAN_FAQ_ITEMS.map((item) => [item.q, item.a] as const)}
      references={REFERENCES}
    >
      <section className="content-section educational-section" aria-labelledby="how-amortization-works">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Mathematical Model</p>
            <h2 id="how-amortization-works">How Loan Amortization Works</h2>
          </div>
        </div>
        <p>
          Each scheduled payment divides into accrued interest (calculated on remaining balance) and principal reduction.
          Accelerated payments directly offset principal, compounding long-term interest savings and shortening debt duration.
        </p>
      </section>
    </CalculatorPageTemplate>
  );
}
