import type { ConsentRegion } from "../internationalization/model.js";

export type ConsentState = "unknown" | "not-required" | "denied" | "granted";

export const MONITORING_POLICY = Object.freeze({
  provider: null as string | null,
  enabled: false,
  networkTransmission: false,
  fieldDataAvailable: false,
  allowedData: ["route template", "performance metric", "time bucket", "coarse device category"] as const,
  forbiddenData: ["calculator input", "query string", "IP address", "visitor identifier", "browser fingerprint", "personal data"] as const,
});

export interface ScriptActivationInput {
  provider: string | null;
  enabled: boolean;
  consentRequired: boolean;
  consentState: ConsentState;
  consentRegion: ConsentRegion;
}

export function mayLoadNonEssentialScript(input: ScriptActivationInput): boolean {
  if (!input.provider || !input.enabled || input.consentRegion === "unknown") return false;
  if (input.consentRequired && input.consentState !== "granted") return false;
  return input.consentState === "granted" || input.consentState === "not-required";
}

export const ANALYTICS_POLICY: ScriptActivationInput = Object.freeze({ provider: null, enabled: false, consentRequired: true, consentState: "unknown", consentRegion: "unknown" });

export const COMMERCIAL_POLICY = Object.freeze({
  advertising: { enabled: false, provider: null as string | null, consentRequired: true },
  affiliate: { enabled: false, provider: null as string | null, disclosureRequired: true },
  thirdPartyScriptBudget: 0,
  allowedPlacementZones: ["after complete results and required explanation", "between independent educational sections", "near the page footer"] as const,
  forbiddenPlacementZones: ["calculator inputs", "recalculate or reset controls", "validation errors", "result summary", "charts", "annual table", "between formula and method", "mobile sticky overlay"] as const,
});

export function isCommercialPlacementEnabled(kind: "advertising" | "affiliate"): boolean {
  const policy = COMMERCIAL_POLICY[kind];
  return policy.enabled && policy.provider !== null;
}
