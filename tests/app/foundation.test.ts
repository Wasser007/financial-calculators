import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(new URL("../../app/layout.tsx", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
const workspaceSource = readFileSync(new URL("../../app/calculator-workspace.tsx", import.meta.url), "utf8");
const globalStyles = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

describe("App Router foundation contract", () => {
  it("uses the exact frozen metadata title and description", () => {
    expect(layoutSource).toContain('title: "Compound Interest Calculator with Contributions, Fees & Inflation"');
    expect(layoutSource).toContain('description: "Estimate how a starting balance and regular contributions may grow under your chosen return, compounding, fee, and inflation assumptions."');
  });

  it("has one Compound Interest Calculator H1", () => {
    expect((pageSource.match(/<h1\b/g) ?? [])).toHaveLength(1);
    expect(pageSource).toContain(">Compound Interest Calculator</h1>");
  });

  it("provides a skip link whose target is the main landmark", () => {
    expect(layoutSource).toContain('href="#main-content">Skip to main content</a>');
    expect(pageSource).toContain('<main id="main-content"');
    expect(globalStyles).toContain(".skip-link:focus-visible");
    expect(globalStyles).toContain("outline: 2px solid #155EEF");
    expect(globalStyles).toContain("outline-offset: 2px");
  });

  it("keeps the skeleton free of form controls and client-component directives", () => {
    expect(pageSource).not.toMatch(/<(form|input|select)\b/);
    expect(pageSource).not.toContain('"use client"');
    expect(layoutSource).not.toContain('"use client"');
  });

  it("uses the frozen canvas and white workspace surface", () => {
    expect(pageSource).toContain("bg-[#F7F8FA]");
    expect(workspaceSource).toContain('id="calculator-workspace"');
    expect(workspaceSource).toContain("bg-white p-6");
  });
});
