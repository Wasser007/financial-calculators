import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GET as getFavicon } from "../../app/favicon.ico/route.js";

const layoutSource = readFileSync(new URL("../../app/layout.tsx", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
const compoundPageSource = readFileSync(new URL("../../app/compound-interest-page.tsx", import.meta.url), "utf8");
const deferredWorkspaceSource = readFileSync(new URL("../../app/deferred-calculator-workspace.tsx", import.meta.url), "utf8");
const printSnapshotSource = readFileSync(new URL("../../app/print-calculator-snapshot.tsx", import.meta.url), "utf8");
const workspaceSource = readFileSync(new URL("../../app/calculator-workspace.tsx", import.meta.url), "utf8");
const globalStyles = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

describe("App Router foundation contract", () => {
  it("defines site-wide metadata and route-specific compound calculator metadata", () => {
    expect(layoutSource).toContain("robots: getRobotsMetadata()");
    expect(readFileSync(new URL("../../app/calculators/compound-interest/page.tsx", import.meta.url), "utf8")).toContain('createPageMetadata("/calculators/compound-interest")');
  });

  it("serves the neutral working mark at the conventional favicon URL", async () => {
    const response = getFavicon();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/svg+xml; charset=utf-8");
    expect(body).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(body).toContain(">C</text>");
  });

  it("keeps one Compound Interest Calculator H1 on its dedicated route", () => {
    expect((compoundPageSource.match(/<h1\b/g) ?? [])).toHaveLength(1);
    expect(compoundPageSource).toContain("<h1>{calculator.name}</h1>");
  });

  it("provides a skip link whose target is the main landmark", () => {
    expect(layoutSource).toContain('href="#main-content">Skip to main content</a>');
    expect(pageSource).toContain('<main id="main-content"');
    expect(compoundPageSource).toContain('<main id="main-content"');
    expect(globalStyles).toContain(".skip-link:focus-visible");
    expect(globalStyles).toContain("outline: 2px solid #155EEF");
    expect(globalStyles).toContain("outline-offset: 2px");
  });

  it("keeps the home-page skeleton free of form controls and client-component directives", () => {
    expect(pageSource).not.toMatch(/<(form|input|select)\b/);
    expect(pageSource).not.toContain('"use client"');
    expect(layoutSource).not.toContain('"use client"');
  });

  it("sources the root document language and text direction from the published language model", () => {
    expect(layoutSource).toContain('import { DEFAULT_PUBLISHED_CONTENT_LANGUAGE } from "../lib/internationalization/model"');
    expect(layoutSource).toContain('<html lang={DEFAULT_PUBLISHED_CONTENT_LANGUAGE.tag} dir={DEFAULT_PUBLISHED_CONTENT_LANGUAGE.direction}>');
  });

  it("keeps the calculator workspace and its white surface class", () => {
    expect(compoundPageSource).toContain("<DeferredCalculatorWorkspace />");
    expect(workspaceSource).toContain('id="calculator-workspace"');
    expect(workspaceSource).toContain("bg-white p-6");
  });

  it("loads the deferred calculator before printing", () => {
    expect(deferredWorkspaceSource).toContain('window.addEventListener("beforeprint", finish)');
    expect(deferredWorkspaceSource).toContain('window.removeEventListener("beforeprint", finish)');
  });

  it("keeps a server-rendered default print fallback while the interactive workspace is deferred", () => {
    expect(compoundPageSource).toContain("<PrintCalculatorSnapshot />");
    expect(printSnapshotSource).toContain("evaluateDrafts(defaultDrafts())");
    expect(globalStyles).toContain(".compound-page:has(#calculator-workspace) > .print-calculator-snapshot");
  });

  it("does not impose a 320px minimum width on the page", () => {
    expect(globalStyles).not.toMatch(/min-width\s*:\s*320px\s*;?/i);
  });

  it("keeps default and supporting copy black at a readable size", () => {
    expect(globalStyles).toContain("--ink: #000000");
    expect(globalStyles).toContain("--ink-soft: #000000");
    expect(globalStyles).toContain("--muted: #000000");
    expect(globalStyles).toContain(":root { --ink: #000; --ink-soft: #000; --muted: #000; --line: #aaa; }");
    expect(globalStyles).toMatch(/\.field__help, \.field__error \{[^}]*font-size: \.875rem/);
    expect(globalStyles).toMatch(/\.chart-instruction \{[^}]*font-size: \.875rem/);
    expect(globalStyles).toMatch(/\.table-scroll-hint \{[^}]*font-size: \.875rem/);
  });
});
