import { describe, it, expect } from "vitest";
import { buildSipPresentation } from "../../lib/calculators/sip-calculator/presentation.js";
import { DEFAULT_SIP_INPUTS } from "../../lib/calculators/sip-calculator/schema.js";

describe("SIP Presentation", () => {
  it("formats KPIs and schedule using the supplied currency formatter", () => {
    const format = (v: number) => "$" + Math.round(v).toLocaleString();
    const pres = buildSipPresentation(DEFAULT_SIP_INPUTS, format);

    expect(pres.kpis).toHaveLength(3);
    const firstKpi = pres.kpis[0];
    const firstRow = pres.schedule[0];

    expect(firstKpi).toBeDefined();
    expect(firstKpi?.value).toContain("$");

    expect(pres.schedule).toHaveLength(10);
    expect(firstRow).toBeDefined();
    expect(firstRow?.year).toBe(1);
  });
});
