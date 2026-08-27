import { SITE } from "./site.js";

export const FEEDBACK_CATEGORIES = [
  { id: "calculation", label: "Calculation or result" },
  { id: "content", label: "Explanation or content" },
  { id: "accessibility", label: "Accessibility or usability" },
  { id: "other", label: "Other feedback" },
] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["id"];

export function buildFeedbackHref(category: FeedbackCategory, pathname: string): string | null {
  if (!SITE.feedbackAddress || !SITE.feedbackAddressVerified) return null;
  const item = FEEDBACK_CATEGORIES.find(({ id }) => id === category)!;
  const subject = encodeURIComponent(`${item.label}: ${pathname}`);
  return `mailto:${SITE.feedbackAddress}?subject=${subject}`;
}
