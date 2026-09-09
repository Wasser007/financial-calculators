import React from "react";
import { SavingsGoalWorkspace } from "../components/savings-goal-workspace";
import { CalculatorPageTemplate } from "../components/templates/CalculatorPageTemplate";
import { getRequiredCalculator } from "../lib/calculators/catalog";
import { SAVINGS_GOAL_FAQS } from "../lib/content/savings-goal";

const REFERENCES = [
  {
    href: "https://www.investor.gov/financial-tools-calculators/calculators/savings-goal-calculator",
    label: "Investor.gov: Savings Goal Calculator (official U.S. SEC investor education)",
    external: true,
  },
  {
    href: "https://www.consumerfinance.gov/consumer-tools/savings/",
    label: "Consumer Financial Protection Bureau: An essential guide to building an emergency fund",
    external: true,
  },
  {
    href: "/methodology",
    label: "Our calculation methodology and limitations",
    external: false,
  },
];

export function SavingsGoalPage() {
  const calculator = getRequiredCalculator("savings-goal");

  return (
    <CalculatorPageTemplate
      slug="savings-goal"
      title={calculator.name}
      description={calculator.metadata.description}
      workspace={<SavingsGoalWorkspace />}
      faqs={SAVINGS_GOAL_FAQS}
      references={REFERENCES}
    >
      <section className="content-section educational-section" aria-labelledby="how-savings-goals-work">
        <div className="section-heading">
          <p className="eyebrow">Mathematical Model</p>
          <h2 id="how-savings-goals-work">Understanding the Savings Goal Equation</h2>
        </div>
        <p>
          Reaching a defined savings target requires balancing initial capital, regular periodic deposits, compound interest, and investment horizon. The core formula decomposes the target into two distinct parts: compound growth of initial principal, and regular periodic annuities.
        </p>
      </section>
    </CalculatorPageTemplate>
  );
}
