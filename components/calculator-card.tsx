import Link from "next/link";
import { calculatorHref, type CalculatorDefinition } from "../lib/calculators/catalog";

export function CalculatorCard({ calculator }: { calculator: CalculatorDefinition }) {
  const href = calculatorHref(calculator);
  return <article className={`tool-card tool-card--${calculator.availability}`}><div><span className={href ? "availability-badge" : "planned-badge"}>{href ? "Live tool" : "Planned"}</span><h3>{calculator.name}</h3><p>{calculator.shortDescription}</p></div>{href ? <Link className="button button--primary" href={href} prefetch={false}>Open calculator</Link> : <p className="availability-note">Not yet available</p>}</article>;
}
