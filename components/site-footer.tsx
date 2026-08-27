import Link from "next/link";
import { primaryNavigation, SITE, trustNavigation } from "../lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__statement">
          <Link className="brand brand--footer" href="/" aria-label={`${SITE.name} home`} prefetch={false}>
            <span className="brand__mark" aria-hidden="true">C</span><span>{SITE.name}</span>
          </Link>
          <p>Transparent financial calculators for education and estimation. No account is required, and calculator inputs stay in your browser.</p>
          <p>Results are illustrations, not financial, investment, tax, or legal advice.</p>
        </div>
        <nav aria-label="Footer navigation" className="footer-nav">
          <div><h2>Explore</h2>{primaryNavigation.map((item) => <Link href={item.href} key={item.href} prefetch={false}>{item.label}</Link>)}</div>
          <div><h2>Trust and legal</h2>{trustNavigation.map((item) => <Link href={item.href} key={item.href} prefetch={false}>{item.label}</Link>)}</div>
        </nav>
        <p className="site-footer__updated"><strong>Content updated:</strong> {SITE.lastUpdated}</p>
      </div>
    </footer>
  );
}
