export type EditorialReviewStatus = "draft" | "review-pending" | "reviewed";
export type FactCheckStatus = "not-claimed" | "completed";

export interface EditorialRecord {
  author: string | null;
  reviewer: string | null;
  publishedAt: string | null;
  updatedAt: string;
  reviewedAt: string | null;
  reviewStatus: EditorialReviewStatus;
  reviewEvidence: readonly string[];
  factCheckStatus: FactCheckStatus;
}

export const COMPOUND_INTEREST_EDITORIAL: EditorialRecord = Object.freeze({
  author: null,
  reviewer: null,
  publishedAt: null,
  updatedAt: "2026-08-25",
  reviewedAt: null,
  reviewStatus: "review-pending",
  reviewEvidence: [],
  factCheckStatus: "not-claimed",
});

export function getPublicEditorialState(record: EditorialRecord) {
  const reviewSupported = record.reviewStatus === "reviewed" && Boolean(record.reviewer && record.reviewedAt && record.reviewEvidence.length);
  const factCheckSupported = record.factCheckStatus === "completed" && reviewSupported;
  return {
    updated: record.updatedAt,
    author: record.author ?? "Unassigned",
    reviewer: reviewSupported ? record.reviewer! : "No formal review recorded",
    factCheck: factCheckSupported ? "Completed" : "Not claimed",
  } as const;
}
