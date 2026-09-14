import { CalculatorPageTemplate } from "../../../components/templates/CalculatorPageTemplate.js";
import { LoanPayoffWorkspace } from "../../../components/loan-payoff-workspace.js";
import { createPageMetadata } from "../../../lib/seo/publication.js";

export const metadata = createPageMetadata("/calculators/loan-payoff");

const FAQS: [string, string][] = [
  [
    "How does paying extra each month shorten loan payoff time?",
    "Every dollar paid beyond the required monthly interest and scheduled principal goes 100% toward reducing your remaining balance. With a lower principal, subsequent monthly interest charges shrink, compounding your savings and cutting years off the term.",
  ],
  [
    "What happens if my payment is less than the monthly interest?",
    "If your monthly payment cannot cover the interest accrued in that month, negative amortization occurs and the balance grows. The calculator prevents this by requiring a payment sufficient to actively reduce principal.",
  ],
  [
    "Does this calculator account for prepayment penalties?",
    "Most standard consumer loans and mortgages allow fee-free prepayments, but you should verify with your lender that extra payments are directly applied to the loan principal without penalty.",
  ],
];

export default function LoanPayoffPage() {
  return (
    <CalculatorPageTemplate
      slug="loan-payoff"
      title="Loan Payoff Calculator"
      description="Estimate how extra monthly payments shorten your repayment horizon and slash total borrowing costs."
      trustPoints={[
        "Instant acceleration timeline",
        "Exact interest savings breakdown",
        "Multi-currency & locale formatting",
        "100% private in-browser computation",
      ]}
      faqs={FAQS}
      workspace={<LoanPayoffWorkspace />}
    >
      <section className="content-section" aria-labelledby="method-heading">
        <div className="section-heading">
          <p className="eyebrow">MATHEMATICAL MODEL</p>
          <h2 id="method-heading">How Loan Payoff Acceleration Works</h2>
        </div>
        <p>
          Each monthly cycle calculates periodic interest as <code>Principal × (Annual Rate ÷ 12)</code>.
          The remaining payment after interest is subtracted directly from the balance. Extra payments reduce
          the principal immediately, permanently lowering future interest and shrinking the total payoff duration.
        </p>
      </section>
    </CalculatorPageTemplate>
  );
}
