import type { Metadata } from "next";
import { LoanMortgageWorkspace } from "../../../components/loan-mortgage-workspace";
import { LOAN_FAQ_ITEMS } from "../../../lib/calculators/loan-amortization/presentation";
import { AdSlot } from "../../../components/ad-slot";

export const metadata: Metadata = {
  title: "Loan & Mortgage Amortization Calculator — ClearCash Calc",
  description: "Calculate monthly mortgage installments, principal & interest breakdown, and payoff timelines with extra payments.",
};

export default function LoanCalculatorPage() {
  return (
    <main id="main-content">
      <div className="content-section">
        <div style={{ marginBottom: "1.5rem" }}>
          <AdSlot slot="loan-top-slot" format="auto" />
        </div>

        <LoanMortgageWorkspace />

        <div style={{ margin: "2.5rem 0 1.5rem" }}>
          <AdSlot slot="loan-bottom-slot" format="auto" />
        </div>

        <section style={{ marginTop: "2.5rem", borderTop: "1px solid var(--border-soft)", paddingTop: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.25rem" }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {LOAN_FAQ_ITEMS.map((item, idx) => (
              <details key={idx} style={{ background: "white", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-soft)" }}>
                <summary style={{ fontWeight: 600, cursor: "pointer", color: "var(--ink)" }}>{item.q}</summary>
                <p style={{ margin: "0.75rem 0 0", fontSize: "0.925rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
