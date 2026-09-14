import Link from "next/link";
import React from "react";
import { EditorialStatus } from "../editorial-status";
import { FeedbackOptions } from "../feedback-options";
import { RelatedCalculators } from "../related-calculators";

export interface CalculatorPageTemplateProps {
  // 基础信息
  slug: string; // 例如: "compound-interest"
  title: string;
  description: string;
  categoryName?: string;
  trustPoints?: string[];

  // 核心计算交互插槽
  workspace: React.ReactNode;
  snapshot?: React.ReactNode;

  // 定制化内容区块插槽
  children?: React.ReactNode;

  // FAQ 统一数据
  faqs?: readonly (readonly [string, string])[];

  // 专属参考资料与外部链接
  references?: Array<{ href: string; label: string; external?: boolean }>;
}

export function CalculatorPageTemplate({
  slug,
  title,
  description,
  categoryName = "Calculators",
  trustPoints = [
    "Transparent assumptions",
    "Detailed annual table",
    "No account required",
  ],
  workspace,
  snapshot,
  children,
  faqs,
  references,
}: CalculatorPageTemplateProps) {
  const currentPath = `/calculators/${slug}`;

  return (
    <main id="main-content" className={`page-container calculator-page page-${slug}`}>
      {/* 1. 统一面包屑 */}
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <Link href="/calculators/" prefetch={false}>
          {categoryName}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>

      {/* 2. 统一 Hero 头部 */}
      <header className="hero">
        <p className="eyebrow">Calculator</p>
        <h1>{title}</h1>
        <p className="hero__lede">{description}</p>
        {trustPoints.length > 0 && (
          <ul className="trust-list" aria-label="Calculator characteristics">
            {trustPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        )}
      </header>

      {/* 3. 核心计算区与打印快照 */}
      {workspace}
      {snapshot}

      {/* 4. 每个计算器的自定义内容区（公式、案例、限制等） */}
      {children}

      {/* 5. 统一 FAQ 模块 */}
      {faqs && faqs.length > 0 && (
        <section className="content-section" aria-labelledby="faq-heading">
          <div className="section-heading">
            <p className="eyebrow">Common questions</p>
            <h2 id="faq-heading">Frequently asked questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 6. 统一参考链接模块 */}
      {references && references.length > 0 && (
        <section className="content-section references" aria-labelledby="references-heading">
          <h2 id="references-heading">References and further reading</h2>
          <ul>
            {references.map((ref) => (
              <li key={ref.href}>
                {ref.external ? (
                  <a href={ref.href} target="_blank" rel="noopener noreferrer">
                    {ref.label}
                  </a>
                ) : (
                  <Link href={ref.href} prefetch={false}>
                    {ref.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 7. 统一底部合规与相关工具 */}
      <EditorialStatus />
      <FeedbackOptions pathname={currentPath} />

      <section className="related-section" aria-labelledby="related-heading">
        <h2 id="related-heading">Understand the boundaries</h2>
        <div className="related-links">
          <Link href="/methodology/" prefetch={false}>
            Calculation methodology <span aria-hidden="true">→</span>
          </Link>
          <Link href="/disclaimer/" prefetch={false}>
            Financial disclaimer <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <RelatedCalculators calculatorSlug={slug} />
    </main>
  );
}
