import Link from "next/link";
import { calculatorHref, getFeaturedCalculator } from "../lib/calculators/catalog";
import { createPageMetadata } from "../lib/seo/publication";

export const metadata = createPageMetadata("/");

const principles = [
  ["Explainable by design", "Inputs, assumptions, modeled results, and limitations stay visible so you can understand what changed."],
  ["Private by default", "No registration is required. Calculator inputs are processed in your browser and are not saved by this site."],
  ["Built for comparison", "Use the tools to explore scenarios—not as a prediction, recommendation, or promise of returns."],
] as const;

export default function HomePage() {
  const featured = getFeaturedCalculator();
  const featuredHref = calculatorHref(featured);
  if (!featuredHref) throw new Error("The featured calculator must be live.");
  return (
    <main id="main-content" className="page-container home-page">
      <section aria-labelledby="home-title" className="home-hero">
        <div>
          <p className="eyebrow">Financial tools, clearly explained</p>
          <h1 id="home-title">Plan with numbers you can understand.</h1>
          <p className="home-hero__lede">ClearMoney Tools provides focused calculators for exploring financial scenarios, with transparent assumptions and plain-language limitations.</p>
          <div className="hero-actions">
            <Link className="button button--primary" href={featuredHref} prefetch={false}>Use the {featured.name.toLowerCase()}</Link>
            <Link className="button button--secondary" href="/calculators" prefetch={false}>Browse calculators</Link>
          </div>
          <ul className="trust-list" aria-label="Site trust information"><li>No sign-up</li><li>Inputs stay in your browser</li><li>Transparent methodology</li></ul>
        </div>
        <aside className="home-hero__note" aria-labelledby="illustration-boundary">
          <p className="eyebrow">A useful boundary</p>
          <h2 id="illustration-boundary">Explore a scenario—not a forecast.</h2>
          <p>Results depend entirely on your inputs and the model’s assumptions. Actual returns, costs, taxes, inflation, and personal circumstances can differ.</p>
          <Link href="/disclaimer" prefetch={false}>Read the full disclaimer</Link>
        </aside>
      </section>

      <section aria-labelledby="available-tool" className="home-section flagship-section">
        <div className="section-heading"><p className="eyebrow">Available now</p><h2 id="available-tool">{featured.name}</h2><p>{featured.shortDescription}</p></div>
        <div className="flagship-card">
          <div><span className="availability-badge">Live tool</span><h3>See how contributions and assumptions shape a balance over time.</h3><p>Review a result summary, interactive charts, and a complete annual table. Change currency and number format independently without changing the calculation.</p></div>
          <Link className="text-link text-link--prominent" href={featuredHref} prefetch={false}>Open the calculator <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section aria-labelledby="principles-heading" className="home-section">
        <div className="section-heading"><p className="eyebrow">How we build</p><h2 id="principles-heading">Useful without pretending to know the future.</h2></div>
        <div className="principle-grid">{principles.map(([title, copy]) => <article className="principle-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <section aria-labelledby="trust-links-heading" className="home-section trust-paths">
        <div><p className="eyebrow">Before you rely on a result</p><h2 id="trust-links-heading">Check the method and the boundaries.</h2></div>
        <div className="trust-paths__links">
          <Link href="/methodology" prefetch={false}><strong>Methodology</strong><span>Calculation order, fees, inflation, rounding, and limitations.</span></Link>
          <Link href="/privacy" prefetch={false}><strong>Privacy</strong><span>What the current site does—and does not—collect or retain.</span></Link>
          <Link href="/about" prefetch={false}><strong>About</strong><span>Who these tools are for and the standards guiding them.</span></Link>
        </div>
      </section>
    </main>
  );
}
