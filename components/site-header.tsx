"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { isCurrentSection, SITE } from "../lib/site";
import { getLiveCalculators } from "../lib/calculators/catalog";

export function SiteHeader() {
  const pathname = usePathname();
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const liveCalculators = getLiveCalculators();

  const isCalculatorsActive = pathname.startsWith("/calculators");
  const isMethodologyActive = pathname.startsWith("/methodology");

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* 左侧主群组：Logo + 靠左对齐的桌面导航 */}
        <div className="site-header__left">
          <Link className="brand" href="/" aria-label={`${SITE.name} home`} prefetch={false}>
            <span className="brand__mark" aria-hidden="true">C</span>
            <span>{SITE.name}</span>
          </Link>

          <nav aria-label="Primary navigation" className="site-nav site-nav--desktop">
            {/* 1. Calculators 带有 3D 浮雕效果的下拉菜单 */}
            <div className="nav-item-dropdown">
              <Link
                href="/calculators"
                className={`nav-dropdown-trigger ${isCalculatorsActive ? "nav-dropdown-trigger--active" : ""}`}
                aria-current={isCalculatorsActive ? "page" : undefined}
                prefetch={false}
              >
                <span>Calculators</span>
                <span className="dropdown-arrow" aria-hidden="true">▾</span>
              </Link>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-menu__header">Live Tools</div>
                {liveCalculators.map((calc) => (
                  <Link
                    key={calc.slug}
                    href={calc.route ?? "/calculators"}
                    className={`nav-dropdown-item ${pathname === calc.route ? "nav-dropdown-item--active" : ""}`}
                    prefetch={false}
                  >
                    <span className="item-title">{calc.name}</span>
                    <span className="item-desc">{calc.shortDescription}</span>
                  </Link>
                ))}
                <div className="nav-dropdown-menu__footer">
                  <Link href="/calculators" className="all-tools-link" prefetch={false}>
                    View all tools & directory →
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Methodology 下拉菜单 */}
            <div className="nav-item-dropdown">
              <Link
                href="/methodology"
                className={`nav-dropdown-trigger ${isMethodologyActive ? "nav-dropdown-trigger--active" : ""}`}
                aria-current={isMethodologyActive ? "page" : undefined}
                prefetch={false}
              >
                <span>Methodology</span>
                <span className="dropdown-arrow" aria-hidden="true">▾</span>
              </Link>
              <div className="nav-dropdown-menu">
                <Link href="/methodology" className="nav-dropdown-item" prefetch={false}>
                  <span className="item-title">Calculation Methodology</span>
                  <span className="item-desc">Core financial formulas, order of operations, and math standards</span>
                </Link>
                <Link href="/editorial-policy" className="nav-dropdown-item" prefetch={false}>
                  <span className="item-title">Editorial Policy</span>
                  <span className="item-desc">Transparency criteria and independence guidelines</span>
                </Link>
              </div>
            </div>

            {/* 3. 普通导航项 */}
            <Link
              href="/about"
              className="nav-plain-link"
              aria-current={isCurrentSection(pathname, "/about") ? "page" : undefined}
              prefetch={false}
            >
              About
            </Link>
          </nav>
        </div>

        {/* 移动端菜单 */}
        <details className="mobile-nav" ref={mobileMenu}>
          <summary aria-label="Site navigation"><span>Menu</span><span aria-hidden="true">＋</span></summary>
          <nav aria-label="Mobile navigation" className="mobile-nav__panel">
            <Link
              href="/calculators"
              aria-current={isCalculatorsActive ? "page" : undefined}
              prefetch={false}
              onClick={() => { if (mobileMenu.current) mobileMenu.current.open = false; }}
            >
              Calculators
            </Link>
            <Link
              href="/methodology"
              aria-current={isMethodologyActive ? "page" : undefined}
              prefetch={false}
              onClick={() => { if (mobileMenu.current) mobileMenu.current.open = false; }}
            >
              Methodology
            </Link>
            <Link
              href="/about"
              aria-current={isCurrentSection(pathname, "/about") ? "page" : undefined}
              prefetch={false}
              onClick={() => { if (mobileMenu.current) mobileMenu.current.open = false; }}
            >
              About
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
