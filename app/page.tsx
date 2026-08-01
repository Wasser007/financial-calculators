import { CalculatorWorkspace } from "./calculator-workspace";
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#132033]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a className="font-semibold" href="#calculator-workspace">Compound Interest Calculator</a>
          <nav aria-label="Page sections" className="text-sm">
            <a className="text-[#526174] underline-offset-4 hover:underline" href="#methodology">Methodology</a>
          </nav>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <section aria-labelledby="page-title" className="max-w-3xl">
          <p className="mb-3 text-sm font-medium text-[#526174]">English (United States)</p>
          <h1 id="page-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">Compound Interest Calculator</h1>
          <p className="mt-5 text-lg leading-8 text-[#526174]">Understand how starting capital, recurring contributions, investment returns, fees, and inflation can affect long-term growth.</p>
          <p className="mt-4 text-sm leading-6 text-[#526174]">For education only. This calculator will not provide investment advice or guarantee returns.</p>
        </section>
        <CalculatorWorkspace />
        <section id="methodology" aria-labelledby="methodology-heading" className="mt-12 max-w-3xl">
          <h2 id="methodology-heading" className="text-2xl font-semibold">How the calculator works</h2>
          <p className="mt-3 leading-7 text-[#526174]">The completed tool will explain its assumptions, formulas, data presentation, and limitations alongside every calculation.</p>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <section aria-labelledby="disclaimer-heading" className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#526174] sm:px-6">
          <h2 id="disclaimer-heading" className="font-semibold text-[#132033]">Important disclaimer</h2>
          <p className="mt-2">Educational information only; not financial, tax, or investment advice.</p>
        </section>
      </footer>
    </div>
  );
}
