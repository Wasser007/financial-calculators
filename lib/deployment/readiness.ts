import { COMPOUND_INTEREST_EDITORIAL, type EditorialRecord } from "../editorial/model.js";
import { SITE, type PublicationStatus } from "../site.js";

export interface DeploymentReadinessInput {
  approvedPublicName: string | null;
  legalOperator: string | null;
  canonicalOrigin: string | null;
  feedbackAddress: string | null;
  feedbackAddressVerified: boolean;
  publicationStatus: PublicationStatus;
  policyApprovals: { privacy: boolean; terms: boolean; disclaimer: boolean };
  editorial: EditorialRecord;
}

export const DEPLOYMENT_READINESS_INPUT: DeploymentReadinessInput = Object.freeze({
  approvedPublicName: SITE.approvedPublicName,
  legalOperator: SITE.legalOperator,
  canonicalOrigin: SITE.canonicalOrigin,
  feedbackAddress: SITE.feedbackAddress,
  feedbackAddressVerified: SITE.feedbackAddressVerified,
  publicationStatus: SITE.publicationStatus,
  policyApprovals: SITE.policyApprovals,
  editorial: COMPOUND_INTEREST_EDITORIAL,
});

function isApprovedHttpsOrigin(value: string | null): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === value.replace(/\/$/, "") && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}

export function getDeploymentReadiness(input: DeploymentReadinessInput = DEPLOYMENT_READINESS_INPUT) {
  const blockers: string[] = [];
  if (!input.approvedPublicName?.trim()) blockers.push("approved public product name");
  if (!input.legalOperator?.trim()) blockers.push("legal operator");
  if (!isApprovedHttpsOrigin(input.canonicalOrigin)) blockers.push("verified HTTPS canonical origin");
  if (!input.feedbackAddress?.trim() || !input.feedbackAddressVerified) blockers.push("verified feedback address");
  if (!input.policyApprovals.privacy) blockers.push("Privacy approval");
  if (!input.policyApprovals.terms) blockers.push("Terms approval");
  if (!input.policyApprovals.disclaimer) blockers.push("Disclaimer approval");
  if (!input.editorial.author) blockers.push("assigned author");
  if (input.editorial.reviewStatus !== "reviewed" || !input.editorial.reviewer || !input.editorial.reviewedAt || input.editorial.reviewEvidence.length === 0) blockers.push("documented reviewer approval");
  if (input.publicationStatus !== "ready-for-publication") blockers.push("publication status");
  return { ready: blockers.length === 0, blockers } as const;
}
