import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compound Interest Calculator with Contributions, Fees & Inflation",
  description: "Estimate how a starting balance and regular contributions may grow under your chosen return, compounding, fee, and inflation assumptions.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-US">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
