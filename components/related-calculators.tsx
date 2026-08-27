import Link from "next/link";
import { calculatorHref, getRelatedCalculators } from "../lib/calculators/catalog";

export function RelatedCalculators({ calculatorSlug }: { calculatorSlug: string }) {
  const related = getRelatedCalculators(calculatorSlug);
  if (related.length === 0) return null;
  return <section className="related-tools" aria-labelledby="related-tools-heading"><div><p className="eyebrow">Your next question</p><h2 id="related-tools-heading">Related calculators</h2></div><div className="related-tools__list">{related.map((calculator) => { const href = calculatorHref(calculator); return href ? <Link href={href} key={calculator.slug} prefetch={false}><strong>{calculator.name}</strong><span>{calculator.shortDescription}</span></Link> : <div className="related-tool--planned" key={calculator.slug}><strong>{calculator.name}</strong><span>{calculator.shortDescription}</span><small>Planned — not yet available</small></div>; })}</div></section>;
}
