import Link from "next/link";

export default function NotFound() {
  return <main id="main-content" className="page-container error-page">
    <p className="eyebrow">Page not found</p>
    <h1>We could not find that page.</h1>
    <p>The address may be incorrect or the page may have moved. No calculator input was sent or stored.</p>
    <div className="hero-actions"><Link className="button button--primary" href="/" prefetch={false}>Return home</Link><Link className="button button--secondary" href="/calculators/" prefetch={false}>Browse calculators</Link></div>
  </main>;
}
