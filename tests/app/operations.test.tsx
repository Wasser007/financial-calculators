// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ErrorPage from "../../app/error";
import { GET as getHealth } from "../../app/healthz/route";
import NotFound from "../../app/not-found";
import { CommercialPlacement } from "../../components/commercial-placement";
import { DEPLOYMENT_READINESS_INPUT, getDeploymentReadiness, type DeploymentReadinessInput } from "../../lib/deployment/readiness.js";
import { COMPOUND_INTEREST_EDITORIAL } from "../../lib/editorial/model.js";
import { DEFAULT_INTERNATIONALIZATION_PROFILE, getNonEssentialProcessingPolicy } from "../../lib/internationalization/model.js";
import { ANALYTICS_POLICY, COMMERCIAL_POLICY, MONITORING_POLICY, mayLoadNonEssentialScript } from "../../lib/operations/policy.js";
import { PERFORMANCE_BUDGETS, PRODUCTION_RESPONSE_BASELINE, median } from "../../lib/operations/performance.js";
import { buildSitemapEntries, getRobotsMetadata } from "../../lib/seo/publication.js";
import { buildCompoundInterestSchema } from "../../lib/seo/schema.js";

const ready: DeploymentReadinessInput = {
  approvedPublicName: "Approved Tools", legalOperator: "Example Operator Ltd", canonicalOrigin: "https://example.com",
  feedbackAddress: "feedback@example.com", feedbackAddressVerified: true, publicationStatus: "ready-for-publication",
  policyApprovals: { privacy: true, terms: true, disclaimer: true },
  editorial: { ...COMPOUND_INTEREST_EDITORIAL, author: "A. Author", reviewer: "R. Reviewer", reviewedAt: "2026-08-25", reviewStatus: "reviewed", reviewEvidence: ["review-record-1"] },
};

describe("deployment readiness and production safety", () => {
  afterEach(cleanup);

  it("keeps current deployment readiness false with every missing fact listed", () => {
    const result = getDeploymentReadiness();
    expect(result.ready).toBe(false);
    for (const blocker of ["approved public product name", "legal operator", "verified HTTPS canonical origin", "verified feedback address", "Privacy approval", "Terms approval", "Disclaimer approval", "assigned author", "documented reviewer approval", "publication status"]) expect(result.blockers).toContain(blocker);
    expect(DEPLOYMENT_READINESS_INPUT.publicationStatus).toBe("prelaunch");
  });

  it("requires every independent readiness field", () => {
    expect(getDeploymentReadiness(ready).ready).toBe(true);
    const variants: DeploymentReadinessInput[] = [
      { ...ready, approvedPublicName: null }, { ...ready, legalOperator: null }, { ...ready, canonicalOrigin: "http://example.com" },
      { ...ready, feedbackAddressVerified: false }, { ...ready, policyApprovals: { ...ready.policyApprovals, privacy: false } },
      { ...ready, policyApprovals: { ...ready.policyApprovals, terms: false } }, { ...ready, policyApprovals: { ...ready.policyApprovals, disclaimer: false } },
      { ...ready, editorial: { ...ready.editorial, author: null } }, { ...ready, editorial: { ...ready.editorial, reviewEvidence: [] } },
      { ...ready, publicationStatus: "prelaunch" },
    ];
    expect(variants.every((variant) => !getDeploymentReadiness(variant).ready)).toBe(true);
  });

  it("returns a minimal non-cacheable health response", async () => {
    const response = getHealth();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("keeps error experiences useful without exposing an error or calculator input", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: /could not find/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Return home" })).toBeTruthy();
    cleanup();
    render(<ErrorPage error={new Error("secret calculator input 1234")} reset={() => undefined} />);
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(document.body.textContent).not.toContain("secret calculator input 1234");
    expect(document.body.textContent).not.toMatch(/stack|digest/i);
  });

  it("configures approved response headers without HSTS or a weak CSP", () => {
    const source = readFileSync("next.config.ts", "utf8");
    for (const header of ["X-Content-Type-Options", "Referrer-Policy", "X-Frame-Options", "Permissions-Policy", "Cross-Origin-Opener-Policy"]) expect(source).toContain(header);
    expect(source).not.toContain("Strict-Transport-Security");
    expect(source).not.toContain("Content-Security-Policy");
    expect(source).not.toContain("unsafe-eval");
    expect(source).toContain('output: "export"');
    expect(source).toContain("poweredByHeader: false");
  });

  it("keeps prelaunch SEO publication surfaces closed", () => {
    expect(getRobotsMetadata()).toEqual({ index: false, follow: false });
    expect(buildSitemapEntries()).toEqual([]);
    expect(buildCompoundInterestSchema()).toEqual([]);
  });
});

describe("monitoring, consent, and commercial foundations", () => {
  it("keeps monitoring and analytics closed with no field-data claim", () => {
    expect(MONITORING_POLICY).toMatchObject({ provider: null, enabled: false, networkTransmission: false, fieldDataAvailable: false });
    expect(ANALYTICS_POLICY).toMatchObject({ provider: null, enabled: false, consentState: "unknown", consentRegion: "unknown" });
    expect(PERFORMANCE_BUDGETS.fieldDataClaim).toBe(false);
  });

  it("never loads a nonessential script for missing provider, unknown region, or missing consent", () => {
    expect(mayLoadNonEssentialScript(ANALYTICS_POLICY)).toBe(false);
    expect(mayLoadNonEssentialScript({ provider: "future", enabled: true, consentRequired: true, consentState: "granted", consentRegion: "unknown" })).toBe(false);
    expect(mayLoadNonEssentialScript({ provider: "future", enabled: true, consentRequired: true, consentState: "denied", consentRegion: "eu-eea" })).toBe(false);
    expect(mayLoadNonEssentialScript({ provider: null, enabled: true, consentRequired: false, consentState: "not-required", consentRegion: "other" })).toBe(false);
  });

  it("preserves the consent default and disables processing in every region", () => {
    expect(DEFAULT_INTERNATIONALIZATION_PROFILE.consentRegion).toBe("unknown");
    for (const region of ["unknown", "eu-eea", "uk", "us-california", "us-other", "other"] as const) expect(getNonEssentialProcessingPolicy(region)).toEqual({ analytics: false, advertising: false, personalization: false });
  });

  it("keeps advertising and affiliate output closed without blank slots", () => {
    expect(COMMERCIAL_POLICY.advertising).toMatchObject({ enabled: false, provider: null });
    expect(COMMERCIAL_POLICY.affiliate).toMatchObject({ enabled: false, provider: null });
    expect(COMMERCIAL_POLICY.thirdPartyScriptBudget).toBe(0);
    const { container } = render(<CommercialPlacement kind="advertising" />);
    expect(container.innerHTML).toBe("");
  });

  it("records lab and field targets without calling TBT field INP", () => {
    expect(PERFORMANCE_BUDGETS.lab).toEqual({ lcpMs: 2500, cls: 0.1, tbtMs: 200 });
    expect(PERFORMANCE_BUDGETS.fieldTarget).toEqual({ percentile: 75, lcpMs: 2500, inpMs: 200, cls: 0.1 });
    expect(median([30, 10, 20])).toBe(20);
  });

  it("keeps the measured production response baseline inside the asset budgets", () => {
    for (const baseline of Object.values(PRODUCTION_RESPONSE_BASELINE.routes)) {
      expect(baseline.htmlBytes).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.assets.initialHtmlTransferBytes);
      expect(baseline.javascriptBytes).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.assets.javascriptTransferBytes);
      expect(baseline.cssBytes).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.assets.cssTransferBytes);
      expect(baseline.requests).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.assets.requestCount);
      expect(baseline.totalBytes).toBeLessThanOrEqual(PERFORMANCE_BUDGETS.assets.totalTransferBytes);
    }
  });
});
