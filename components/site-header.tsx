"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { isCurrentSection, primaryNavigation, SITE } from "../lib/site";

function NavigationLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return primaryNavigation.map(({ href, label }) => (
    <Link aria-current={isCurrentSection(pathname, href) ? "page" : undefined} href={href} key={href} prefetch={false} {...(onNavigate ? { onClick: onNavigate } : {})}>
      {label}
    </Link>
  ));
}

export function SiteHeader() {
  const pathname = usePathname();
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label={`${SITE.name} home`} prefetch={false}>
          <span className="brand__mark" aria-hidden="true">C</span>
          <span>{SITE.name}</span>
        </Link>
        <nav aria-label="Primary navigation" className="site-nav site-nav--desktop">
          <NavigationLinks pathname={pathname} />
        </nav>
        <details className="mobile-nav" ref={mobileMenu}>
          <summary aria-label="Site navigation"><span>Menu</span><span aria-hidden="true">＋</span></summary>
          <nav aria-label="Mobile navigation" className="mobile-nav__panel">
            <NavigationLinks pathname={pathname} onNavigate={() => { if (mobileMenu.current) mobileMenu.current.open = false; }} />
          </nav>
        </details>
      </div>
    </header>
  );
}
