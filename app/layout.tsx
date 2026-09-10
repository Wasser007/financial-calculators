import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { DEFAULT_PUBLISHED_CONTENT_LANGUAGE } from "../lib/internationalization/model";
import { SITE } from "../lib/site";
import { getRobotsMetadata } from "../lib/seo/publication";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Transparent financial calculators`,
    template: `%s | ${SITE.name}`,
  },
  description: "Use transparent financial calculators with visible assumptions, clear limitations, and no account required.",
  robots: getRobotsMetadata(),
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={DEFAULT_PUBLISHED_CONTENT_LANGUAGE.tag} dir={DEFAULT_PUBLISHED_CONTENT_LANGUAGE.direction}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2772154244281806"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
