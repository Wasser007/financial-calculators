export const PERFORMANCE_BUDGETS = Object.freeze({
  lab: { lcpMs: 2500, cls: 0.1, tbtMs: 200 },
  fieldTarget: { percentile: 75, lcpMs: 2500, inpMs: 200, cls: 0.1 },
  assets: { javascriptTransferBytes: 650_000, cssTransferBytes: 50_000, initialHtmlTransferBytes: 80_000, totalTransferBytes: 800_000, requestCount: 15, thirdPartyRequests: 0 },
  fieldDataClaim: false,
});

export const PRODUCTION_RESPONSE_BASELINE = Object.freeze({
  measurement: "uncompressed referenced response bodies",
  routes: Object.freeze({
    "/": { htmlBytes: 17_830, javascriptBytes: 551_230, cssBytes: 42_339, requests: 11, totalBytes: 611_399 },
    "/calculators": { htmlBytes: 16_413, javascriptBytes: 551_230, cssBytes: 42_339, requests: 11, totalBytes: 609_982 },
    "/calculators/compound-interest": { htmlBytes: 62_905, javascriptBytes: 592_558, cssBytes: 42_339, requests: 11, totalBytes: 697_802 },
    "/editorial-policy": { htmlBytes: 14_002, javascriptBytes: 551_230, cssBytes: 42_339, requests: 11, totalBytes: 607_571 },
  }),
});

export type LabMetricName = "LCP" | "CLS" | "TBT" | "FCP" | "Speed Index";

export function median(values: readonly number[]): number {
  if (values.length === 0) throw new Error("Cannot calculate a median without values.");
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1]! + sorted[middle]!) / 2 : sorted[middle]!;
}
