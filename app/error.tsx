"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="page-container error-page">
    <p className="eyebrow">Page error</p>
    <h1>This page could not be displayed.</h1>
    <p>Try the page again or return to a safe starting point. Error details and calculator inputs are not displayed or transmitted.</p>
    <div className="hero-actions"><button className="button button--primary" type="button" onClick={reset}>Try again</button><Link className="button button--secondary" href="/" prefetch={false}>Return home</Link><Link className="button button--secondary" href="/calculators/" prefetch={false}>Browse calculators</Link></div>
  </main>;
}
