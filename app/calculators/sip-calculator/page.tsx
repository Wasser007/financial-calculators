import type { Metadata } from "next";
import Link from "next/link";
import { SipCalculatorWorkspace } from "../../../components/sip-calculator-workspace.js";

export const metadata: Metadata = {
  title: "SIP / DCA Calculator - Systematic Investment Plan & Dollar-Cost Averaging Growth",
  description: "Calculate the long-term future value of your systematic investment plan (SIP) or dollar-cost averaging (DCA) strategy with regular contributions and compound interest.",
  alternates: {
    canonical: "/calculators/sip-calculator",
  },
  openGraph: {
    title: "SIP / DCA Calculator - Systematic Investment Planner",
    description: "Visualize compounding wealth and portfolio growth through disciplined recurring monthly investments.",
    url: "/calculators/sip-calculator",
    type: "website",
  },
};

const FAQS = [
  {
    q: "What is a Systematic Investment Plan (SIP) or DCA?",
    a: "A Systematic Investment Plan (SIP) or Dollar-Cost Averaging (DCA) is an investment approach where you consistently invest a fixed sum of money at regular intervals (usually monthly), regardless of market highs or lows. This disciplined strategy reduces the emotional stress of market timing and smooths out purchase prices over time.",
  },
  {
    q: "How does compounding benefit regular monthly contributions?",
    a: "Every periodic contribution starts earning returns immediately. In subsequent periods, not only does your original principal grow, but previous earnings also generate additional returns. Over a 10 to 30-year horizon, compounding often accounts for the vast majority of your total ending balance.",
  },
  {
    q: "Are the projected returns guaranteed?",
    a: "No. The calculation assumes a constant annual rate of return compounded monthly for mathematical modeling. In real-world stock or index funds, market performance fluctuates year over year. Use this tool as a benchmark for baseline goal planning rather than a guaranteed projection.",
  },
];

export default function SipCalculatorPage() {
  return (
    <main className="content-container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/#calculators">Calculators</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">SIP / DCA Calculator</span>
      </nav>

      <header className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">SIP / DCA Investment Calculator</h1>
        <p className="page-description">
          Forecast the future balance of your investment portfolio by contributing fixed monthly installments into index funds or mutual funds.
        </p>
      </header>

      <SipCalculatorWorkspace />

      <section className="info-section" style={{ marginTop: "3rem" }}>
        <h2>How Systematic Investment Planning Works</h2>
        <p>
          The SIP calculation employs standard ordinary annuity compound interest formulas. When you deposit an initial amount <em>P</em> and add monthly contributions <em>M</em> at an annual interest rate <em>r</em> (monthly rate <em>i = r / 12</em>) over <em>n</em> months:
        </p>
        <blockquote style={{ margin: "1rem 0", padding: "1rem", background: "var(--surface-subtle, #f8fafc)", borderRadius: "8px" }}>
          <strong>Future Value = P &times; (1 + i)<sup>n</sup> + M &times; [((1 + i)<sup>n</sup> - 1) / i]</strong>
        </blockquote>
      </section>

      <section className="faq-section" style={{ marginTop: "2.5rem" }}>
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {FAQS.map((faq, idx) => (
            <article key={idx} className="faq-item" style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>{faq.q}</h3>
              <p style={{ color: "var(--muted, #64748b)" }}>{faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
