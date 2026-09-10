import { CalculatorCard } from "../../components/calculator-card";
import { calculatorGoals, getListedCalculators } from "../../lib/calculators/catalog";
import { createPageMetadata } from "../../lib/seo/publication";

export const metadata = createPageMetadata("/calculators");

export default function CalculatorsPage() {
  const listed = getListedCalculators();
  const live = listed.filter((calculator) => calculator.availability === "live");
  const visibleGroups = calculatorGoals.map((goal) => ({ goal, calculators: listed.filter((calculator) => calculator.goal === goal && calculator.availability === "planned") })).filter((group) => group.calculators.length > 0);
  return (
    <main id="main-content" className="page-container directory-page">
      <header className="page-intro"><p className="eyebrow">Calculator directory</p><h1>Financial calculators</h1><p>Focused tools for exploring financial scenarios with visible assumptions, methods, and limitations.</p></header>
      <section aria-labelledby="live-tools-heading" className="directory-section"><div className="section-heading"><p className="eyebrow">Available now</p><h2 id="live-tools-heading">Live tools</h2></div><div className="live-tools-grid">{live.map((calculator) => <CalculatorCard calculator={calculator} key={calculator.slug} />)}</div></section>
      <section aria-labelledby="planned-tools-heading" className="directory-section"><div className="section-heading"><p className="eyebrow">Roadmap</p><h2 id="planned-tools-heading">Planned tools by goal</h2><p>These tools are not yet available. Only approved roadmap entries are shown, and they are status cards rather than links.</p></div><div className="goal-groups">{visibleGroups.map((group) => <section aria-labelledby={`goal-${group.goal.replaceAll(" ", "-").toLowerCase()}`} className="goal-group" key={group.goal}><h3 id={`goal-${group.goal.replaceAll(" ", "-").toLowerCase()}`}>{group.goal}</h3><div className="planned-grid">{group.calculators.map((calculator) => <CalculatorCard calculator={calculator} key={calculator.slug} />)}</div></section>)}</div></section>
    </main>
  );
}
