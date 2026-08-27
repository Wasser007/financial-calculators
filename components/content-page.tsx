import type { ReactNode } from "react";

export function ContentPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <main id="main-content" className="page-container site-page">
      <header className="page-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <div className="prose-layout">{children}</div>
    </main>
  );
}

export function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="prose-section"><h2>{title}</h2>{children}</section>;
}
