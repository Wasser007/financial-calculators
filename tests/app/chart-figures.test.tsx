// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChartFigures } from "../../app/chart-figures";
import { defaultDrafts, evaluateDrafts } from "../../lib/presentation/form-model";
import { buildChartModels } from "../../lib/presentation/chart-model";

const evaluateCalls = vi.hoisted(() => [] as Array<Parameters<typeof import("../../lib/calculator/engine.js").evaluateCalculator>[0]>);

vi.mock("../../lib/calculator/engine.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/calculator/engine.js")>();
  return {
    ...actual,
    evaluateCalculator: (inputs: Parameters<typeof actual.evaluateCalculator>[0]) => {
      evaluateCalls.push(inputs);
      return actual.evaluateCalculator(inputs);
    },
  };
});

function last(durationMonths = "120") {
  const value = evaluateDrafts({ ...defaultDrafts(), durationMonths });
  if (value.inputs === undefined || value.evaluation?.result === undefined) throw new Error("expected defaults");
  return { inputs: value.inputs, result: value.evaluation.result };
}

function successfulBuild(supplied: ReturnType<typeof last>, locale?: Parameters<typeof buildChartModels>[1]) {
  const built = buildChartModels(supplied, locale);
  if (!built.ok) throw new Error("expected successful chart model");
  return built;
}

type N05Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

function largeValueLast(currency: N05Currency) {
  const value = evaluateDrafts({
    ...defaultDrafts(),
    currency,
    initialPrincipal: "1234567.89",
    contributionAmount: "0.00",
    durationMonths: "12",
    nominalAnnualRate: "0.00",
    nominalAnnualFeeRate: "0.00",
    inflationRate: "0.00",
  });
  if (value.inputs === undefined || value.evaluation?.result === undefined) throw new Error("expected legal N05 fixture");
  return { inputs: value.inputs, result: value.evaluation.result };
}

function expectN05FullValueDom(currency: N05Currency, expected: string, compactAlternative: string) {
  const supplied = largeValueLast(currency);
  const built = successfulBuild(supplied);
  expect(supplied.result.finalBalance).toBe(1_234_567.89);
  expect(built.annualGrowth.points).toHaveLength(1);

  const view = render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: 0 }} onSelectionChange={() => undefined} />);
  const surfaces = chartSurfaces();
  const compositionFigure = surfaces.composition.closest("figure");
  const annualFigure = surfaces.annual.closest("figure");
  if (!compositionFigure || !annualFigure) throw new Error("expected both N05 figures");

  const compositionList = within(compositionFigure).getByRole("list", { name: "Balance composition values" });
  const annualList = within(annualFigure).getByRole("list", { name: "Annual ending balance values" });
  const compositionSelected = compositionFigure.querySelector("p.chart-selected");
  const annualSelected = annualFigure.querySelector("p.chart-selected");
  const compositionSummary = [...compositionFigure.querySelectorAll("p")].at(-1);
  const annualSummary = [...annualFigure.querySelectorAll("p")].at(-1);
  if (!compositionSelected || !annualSelected || !compositionSummary || !annualSummary) throw new Error("expected N05 monetary carriers");

  expect(within(compositionList).getByRole("button", { name: `Starting balance: ${expected}.` })).toBeTruthy();
  expect(within(compositionList).getByRole("button", { name: `Ending balance: ${expected}.` })).toBeTruthy();
  expect(within(annualList).getByRole("button", { name: `Year 1: ${expected}.` })).toBeTruthy();
  expect(compositionSelected.textContent).toBe(`Ending balance: ${expected}.`);
  expect(annualSelected.textContent).toBe(`Year 1: ${expected}.`);
  expect(compositionSummary.textContent).toContain(expected);
  expect(annualSummary.textContent).toContain(expected);

  const carriers = [compositionList, annualList, compositionSelected, annualSelected, compositionSummary, annualSummary];
  for (const carrier of carriers) {
    expect(carrier.textContent).not.toContain(compactAlternative);
    expect(carrier.textContent).not.toMatch(/\b\d+(?:\.\d)?[KMBT]\b/);
  }

  view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={() => undefined} />);
  expect(compositionSelected.textContent).toBe(`Starting balance: ${expected}.`);
  expect(annualSelected.textContent).toBe(`Year 1: ${expected}.`);
}

function chartSurfaces() {
  return {
    composition: screen.getByRole("group", { name: "Balance composition" }),
    annual: screen.getByRole("group", { name: "Annual ending balance" }),
  };
}

function expectSelectedIndex(surface: HTMLElement, index: number) {
  const figure = surface.closest("figure");
  if (!figure) throw new Error("expected chart figure");
  const values = within(figure).getAllByRole("button");
  expect(values[index]?.getAttribute("aria-current")).toBe("true");
  expect(values.filter((value) => value.getAttribute("aria-current") === "true")).toHaveLength(1);
}

function cancelableKeyDown(surface: HTMLElement, key: "ArrowLeft" | "ArrowRight" | "Home" | "End") {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key });
  fireEvent(surface, event);
  return event;
}

function chartSvgs() {
  return {
    composition: within(chartSurfaces().composition).getByRole("img") as unknown as SVGSVGElement,
    annual: within(chartSurfaces().annual).getByRole("img") as unknown as SVGSVGElement,
  };
}

function mockSvgGeometry(svg: SVGSVGElement) {
  vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
    x: 100,
    y: 50,
    left: 100,
    top: 50,
    right: 1100,
    bottom: 410,
    width: 1000,
    height: 360,
    toJSON: () => ({}),
  } as DOMRect);
}

function spatialClientPoint(target: Element, x: number, y: number) {
  const svg = target instanceof SVGSVGElement ? target : target.closest("svg");
  if (!(svg instanceof SVGSVGElement)) throw new Error("spatial target must belong to exactly one SVG");
  const rawViewBox = svg.getAttribute("viewBox");
  if (rawViewBox === null) throw new Error("spatial SVG must declare a viewBox");
  const values = rawViewBox.trim().split(/[\s,]+/).map(Number);
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    throw new Error("spatial SVG viewBox must contain four finite numbers");
  }
  const [minX, minY, width, height] = values as [number, number, number, number];
  if (width <= 0 || height <= 0) throw new Error("spatial SVG viewBox dimensions must be positive");
  const rect = svg.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) throw new Error("spatial SVG client dimensions must be positive");
  return {
    clientX: rect.left + ((x - minX) / width) * rect.width,
    clientY: rect.top + ((y - minY) / height) * rect.height,
  };
}

function spatialPointerUp(target: Element, pointerType: "mouse" | "touch", x: number, y: number) {
  const client = spatialClientPoint(target, x, y);
  const event = new MouseEvent("pointerup", {
    bubbles: true,
    cancelable: true,
    ...client,
  });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(target, event);
}

function spatialPointerMove(target: Element, pointerType: "mouse" | "touch", x: number, y: number) {
  const client = spatialClientPoint(target, x, y);
  const event = new MouseEvent("pointermove", {
    bubbles: true,
    cancelable: true,
    ...client,
  });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(target, event);
}

function selectedValue(surface: HTMLElement) {
  const carrier = surface.closest("figure")?.querySelector("p.chart-selected");
  if (!(carrier instanceof HTMLParagraphElement)) throw new Error("expected visible selected-value carrier");
  return carrier;
}

function announcementSnapshot() {
  return [...document.querySelectorAll('[role="status"], [aria-live]')].map((carrier) => carrier.outerHTML);
}

function compositionRenderedX(svg: SVGSVGElement) {
  return [...svg.querySelectorAll<SVGRectElement>("rect.chart-bar")].map((bar) =>
    Number(bar.getAttribute("x")) + Number(bar.getAttribute("width")) / 2,
  );
}

function annualRenderedX(svg: SVGSVGElement) {
  return [...svg.querySelectorAll<SVGCircleElement>("circle.chart-point")].map((point) =>
    Number(point.getAttribute("cx")),
  );
}

describe("ChartFigures", () => {
  afterEach(cleanup);
  it("renders the two chart surfaces with ordered full-value fallbacks", () => {
    const supplied = last();
    const built = successfulBuild(supplied);
    render(<ChartFigures built={built} stale={false} selection={{ composition: built.initialSelections.composition.committedIndex, annual: built.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    expect(screen.getByRole("heading", { name: "Your result visualised" })).toBeTruthy();
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(screen.getByRole("list", { name: "Balance composition values" })).toBeTruthy();
    expect(screen.getByRole("list", { name: "Annual ending balance values" })).toBeTruthy();
  });

  it("V01 staggers all five composition labels across two deterministic SVG rows", () => {
    const built = successfulBuild(last());
    render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: 0 }} onSelectionChange={() => undefined} />);
    const svg = chartSvgs().composition;
    const labels = [...svg.querySelectorAll<SVGTextElement>("text")];

    expect(labels.map((label) => label.textContent)).toEqual([
      "Starting balance",
      "Contributions",
      "Gross growth",
      "Fees",
      "Ending balance",
    ]);
    expect(labels.map((label) => label.getAttribute("y"))).toEqual(["142", "174", "142", "174", "142"]);
    expect(new Set(labels.map((label) => label.getAttribute("y")))).toEqual(new Set(["142", "174"]));
    expect(labels.every((label) => label.getAttribute("text-anchor") === "middle")).toBe(true);
    expect(svg.getAttribute("viewBox")).toBe("-18 0 536 200");
    expect(chartSvgs().annual.getAttribute("viewBox")).toBe("0 0 500 180");
    expect(svg.querySelectorAll('rect[data-chart-hit-region="composition"]')).toHaveLength(5);
    const bars = [...svg.querySelectorAll<SVGRectElement>("rect.chart-bar")];
    expect(bars.map((bar) => bar.getAttribute("x"))).toEqual(["20", "115", "210", "305", "400"]);
    expect(bars.map((bar) => bar.getAttribute("width"))).toEqual(["64", "64", "64", "64", "64"]);
    expect(labels.map((label) => label.getAttribute("x"))).toEqual(["52", "147", "242", "337", "432"]);
    const valueToY = (value: number) => 120 - ((value - built.composition.domain.min) / (built.composition.domain.max - built.composition.domain.min)) * 100;
    const expectedBars = built.composition.steps.map((step) => {
      const startY = valueToY(step.startAnchor.value);
      const endY = valueToY(step.endAnchor.value);
      return { y: Math.min(startY, endY), height: Math.abs(startY - endY) };
    });
    expect(bars.map((bar) => Number(bar.getAttribute("y")))).toEqual(expectedBars.map((bar) => bar.y));
    expect(bars.map((bar) => Number(bar.getAttribute("height")))).toEqual(expectedBars.map((bar) => bar.height));
    const compositionHits = [...svg.querySelectorAll<SVGRectElement>('rect[data-chart-hit-region="composition"]')];
    expect(compositionHits.map((hit) => [Number(hit.getAttribute("x")), Number(hit.getAttribute("y")), Number(hit.getAttribute("width")), Number(hit.getAttribute("height"))])).toEqual([[20, 20, 79.5, 100], [99.5, 20, 95, 100], [194.5, 20, 95, 100], [289.5, 20, 95, 100], [384.5, 20, 79.5, 100]]);
    const annual = chartSvgs().annual;
    const annualHit = annual.querySelector<SVGRectElement>('rect[data-chart-hit-region="annual"]');
    expect(annualHit && [annualHit.getAttribute("x"), annualHit.getAttribute("y"), annualHit.getAttribute("width"), annualHit.getAttribute("height")]).toEqual(["30", "40", "440", "100"]);
    const annualPoints = [...annual.querySelectorAll<SVGCircleElement>("circle.chart-point")];
    expect(annualPoints).toHaveLength(built.annualGrowth.points.length);
    expect(annualPoints[0]?.getAttribute("cx")).toBe("30");
    expect(annualPoints.at(-1)?.getAttribute("cx")).toBe("470");
  });

  it("renders locale-formatted labels, selected values, fallback lists, summaries, and accessible names from the supplied chart models", () => {
    const built = successfulBuild(last(), "de-DE");
    render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: built.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    const composition = chartSurfaces().composition.closest("figure");
    const annual = chartSurfaces().annual.closest("figure");
    if (!composition || !annual) throw new Error("expected chart figures");

    const compositionAmount = built.composition.steps[4]!.formattedValue;
    const annualAmount = built.annualGrowth.points.at(-1)!.formattedClosingBalance;
    expect(compositionAmount).toContain(",");
    expect(annualAmount).toContain(",");
    expect(within(composition).getByRole("button", { name: built.composition.steps[4]!.accessibleLabel })).toBeTruthy();
    expect(within(annual).getByRole("button", { name: built.annualGrowth.points.at(-1)!.accessibleLabel })).toBeTruthy();
    expect(composition.querySelector("p.chart-selected")?.textContent).toBe(built.composition.steps[4]!.accessibleLabel);
    expect(annual.querySelector("p.chart-selected")?.textContent).toBe(built.annualGrowth.points.at(-1)!.accessibleLabel);
    expect(composition.textContent).toContain(built.composition.staticSummary.visibleText);
    expect(annual.textContent).toContain(built.annualGrowth.classification.staticSummary.visibleText);
  });

  it("renders locale-formatted composition labels from the supplied model", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: de.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    const figure = chartSurfaces().composition.closest("figure");
    if (!figure) throw new Error("expected composition figure");
    expect(de.composition.steps[4]!.formattedValue).not.toBe(us.composition.steps[4]!.formattedValue);
    expect(figure.textContent).toContain(de.composition.steps[4]!.formattedValue);
  });

  it("renders the locale-formatted composition selected value from the supplied model", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: de.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    expect(de.composition.steps[4]!.accessibleLabel).not.toBe(us.composition.steps[4]!.accessibleLabel);
    expect(selectedValue(chartSurfaces().composition).textContent).toBe(de.composition.steps[4]!.accessibleLabel);
  });

  it("renders the locale-formatted composition fallback list from the supplied model", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: de.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    const list = screen.getByRole("list", { name: "Balance composition values" });
    expect(de.composition.steps[0]!.accessibleLabel).not.toBe(us.composition.steps[0]!.accessibleLabel);
    expect(within(list).getByRole("button", { name: de.composition.steps[0]!.accessibleLabel })).toBeTruthy();
  });

  it("renders the locale-formatted composition static summary from the supplied model", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: de.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    const figure = chartSurfaces().composition.closest("figure");
    if (!figure) throw new Error("expected composition figure");
    expect(de.composition.staticSummary.visibleText).not.toBe(us.composition.staticSummary.visibleText);
    expect(figure.textContent).toContain(de.composition.staticSummary.visibleText);
  });

  it("renders locale-formatted composition accessible amount strings", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: de.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    const label = de.composition.steps[4]!.accessibleLabel;
    expect(label).not.toBe(us.composition.steps[4]!.accessibleLabel);
    expect(within(chartSurfaces().composition.closest("figure")!).getByRole("button", { name: label })).toBeTruthy();
  });

  it("renders locale-formatted annual labels from the supplied model", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    const finalIndex = de.annualGrowth.points.length - 1;
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: finalIndex }} onSelectionChange={() => undefined} />);
    const point = de.annualGrowth.points[finalIndex]!;
    expect(point.formattedClosingBalance).not.toBe(us.annualGrowth.points[finalIndex]!.formattedClosingBalance);
    expect(chartSurfaces().annual.closest("figure")?.textContent).toContain(point.formattedClosingBalance);
  });

  it("renders the locale-formatted annual selected value from the supplied model", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    const finalIndex = de.annualGrowth.points.length - 1;
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: finalIndex }} onSelectionChange={() => undefined} />);
    expect(de.annualGrowth.points[finalIndex]!.accessibleLabel).not.toBe(us.annualGrowth.points[finalIndex]!.accessibleLabel);
    expect(selectedValue(chartSurfaces().annual).textContent).toBe(de.annualGrowth.points[finalIndex]!.accessibleLabel);
  });

  it("renders the locale-formatted annual fallback list from the supplied model", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: de.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    const list = screen.getByRole("list", { name: "Annual ending balance values" });
    expect(de.annualGrowth.points[0]!.accessibleLabel).not.toBe(us.annualGrowth.points[0]!.accessibleLabel);
    expect(within(list).getByRole("button", { name: de.annualGrowth.points[0]!.accessibleLabel })).toBeTruthy();
  });

  it("renders the locale-formatted annual static summary from the supplied model", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: de.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    const summary = de.annualGrowth.classification.staticSummary.visibleText;
    const firstRaw = de.annualGrowth.points[0]!.rawClosingBalance;
    const lastRaw = de.annualGrowth.points.at(-1)!.rawClosingBalance;
    const deFirst = new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD" }).format(firstRaw);
    const deLast = new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD" }).format(lastRaw);
    const usFirst = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(firstRaw);
    const usLast = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(lastRaw);
    expect(summary).toBe(`The illustrated annual ending balance moves from ${deFirst} at Year 1. The first recorded annual ending balance is ${deFirst} and the final recorded annual ending balance is ${deLast}.`);
    expect(us.annualGrowth.classification.staticSummary.visibleText).toBe(`The illustrated annual ending balance moves from ${usFirst} at Year 1. The first recorded annual ending balance is ${usFirst} and the final recorded annual ending balance is ${usLast}.`);
    expect(chartSurfaces().annual.closest("figure")?.textContent).toContain(summary);
  });

  it("renders locale-formatted annual accessible amount strings", () => {
    const us = successfulBuild(last(), "en-US");
    const de = successfulBuild(last(), "de-DE");
    const point = de.annualGrowth.points.at(-1)!;
    render(<ChartFigures built={de} stale={false} selection={{ composition: 4, annual: de.annualGrowth.points.length - 1 }} onSelectionChange={() => undefined} />);
    expect(point.accessibleLabel).not.toBe(us.annualGrowth.points.at(-1)!.accessibleLabel);
    expect(within(chartSurfaces().annual.closest("figure")!).getByRole("button", { name: point.accessibleLabel })).toBeTruthy();
  });

  it("W06.R001 renders Ending as the supplied A0-to-A5 total geometry instead of an A4-to-A5 increment", () => {
    const built = successfulBuild(last());
    render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: built.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    const composition = screen.getByRole("group", { name: "Balance composition" });
    const svg = within(composition).getByRole("img");
    const rects = [...svg.querySelectorAll("rect.chart-bar")];
    const endingRect = rects[4];
    if (endingRect === undefined) throw new Error("expected rendered Ending rect");

    const ending = built.composition.steps[4];
    const fees = built.composition.steps[3];
    const { min, max } = built.composition.domain;
    const expectedY = (value: number) => 120 - ((value - min) / (max - min)) * 100;
    const expectedStartY = expectedY(ending.startAnchor.value);
    const expectedEndY = expectedY(ending.endAnchor.value);
    const renderedY = Number(endingRect.getAttribute("y"));
    const renderedHeight = Number(endingRect.getAttribute("height"));

    expect(ending.id).toBe("ending-balance");
    expect(ending.startAnchor.id).toBe("A0");
    expect(ending.endAnchor.id).toBe("A5");
    expect(fees.endAnchor.id).toBe("A4");
    expect(fees.endAnchor.value).toBe(ending.endAnchor.value);
    expect(ending.endAnchor.value).not.toBe(0);
    expect(endingRect.classList.contains("chart-total")).toBe(true);
    expect(renderedY).toBeCloseTo(Math.min(expectedStartY, expectedEndY), 12);
    expect(renderedHeight).toBeCloseTo(Math.abs(expectedStartY - expectedEndY), 12);
    expect(renderedHeight).toBeGreaterThan(0);
    expect(renderedHeight).not.toBe(Math.abs(expectedY(fees.endAnchor.value) - expectedEndY));

    for (const rect of rects) {
      const y = Number(rect.getAttribute("y"));
      const height = Number(rect.getAttribute("height"));
      expect(Number.isFinite(y)).toBe(true);
      expect(Number.isFinite(height)).toBe(true);
      expect(height).toBeGreaterThanOrEqual(0);
    }
  });

  it("W06.R002 renders exactly the frozen five composition bars in order with no A4-to-A5 artifact", () => {
    const built = successfulBuild(last());
    render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: built.initialSelections.annualGrowth.committedIndex }} onSelectionChange={() => undefined} />);
    const composition = screen.getByRole("group", { name: "Balance composition" });
    const svg = within(composition).getByRole("img");
    const bars = [...svg.querySelectorAll("g > rect.chart-bar")];
    const labels = [...svg.querySelectorAll("g > text")].map((label) => label.textContent);

    expect(bars).toHaveLength(5);
    expect(labels).toEqual(["Starting balance", "Contributions", "Gross growth", "Fees", "Ending balance"]);
    expect(bars.filter((bar) => bar.classList.contains("chart-total"))).toHaveLength(1);
    expect(labels.filter((label) => label === "Ending balance")).toHaveLength(1);
    expect(svg.querySelectorAll("g:nth-of-type(n+6) > rect.chart-bar")).toHaveLength(0);
  });

  it("N05.R001 renders full non-compact USD values in chart monetary carriers", () => {
    expectN05FullValueDom("USD", "$1,234,567.89", "$1.2M");
  });

  it("N05.R002 renders full non-compact EUR values in chart monetary carriers", () => {
    expectN05FullValueDom("EUR", "€1,234,567.89", "€1.2M");
  });

  it("N05.R003 renders full non-compact GBP values in chart monetary carriers", () => {
    expectN05FullValueDom("GBP", "£1,234,567.89", "£1.2M");
  });

  it("N05.R004 renders full non-compact CAD values in chart monetary carriers", () => {
    expectN05FullValueDom("CAD", "CA$1,234,567.89", "CA$1.2M");
  });

  it("N05.R005 renders full non-compact AUD values in chart monetary carriers", () => {
    expectN05FullValueDom("AUD", "A$1,234,567.89", "A$1.2M");
  });

  it("requests controlled keyboard selection without creating divergent committed state", () => {
    const supplied = last();
    const built = successfulBuild(supplied);
    const ending = { composition: built.initialSelections.composition.committedIndex, annual: built.initialSelections.annualGrowth.committedIndex };
    const onSelectionChange = vi.fn();
    const view = render(<ChartFigures built={built} stale={false} selection={ending} onSelectionChange={onSelectionChange} />);
    const composition = screen.getByRole("group", { name: "Balance composition" });
    expect(composition.getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(composition, { key: "Home" });
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 0, annual: ending.annual });
    expect(screen.getByRole("button", { name: /Ending balance/i }).getAttribute("aria-current")).toBe("true");

    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: ending.annual }} onSelectionChange={onSelectionChange} />);
    expect(screen.getByRole("button", { name: /Starting balance/i }).getAttribute("aria-current")).toBe("true");
    expect(fireEvent.keyDown(composition, { key: "End" })).toBe(false);
    expect(onSelectionChange).toHaveBeenLastCalledWith(ending);
  });

  it("I02.R001 ArrowLeft commits the preceding item on both chart surfaces", () => {
    const built = successfulBuild(last());
    const initial = { composition: 2, annual: 2 };
    const onSelectionChange = vi.fn();
    const view = render(<ChartFigures built={built} stale={false} selection={initial} onSelectionChange={onSelectionChange} />);
    const surfaces = chartSurfaces();

    fireEvent.keyDown(surfaces.composition, { key: "ArrowLeft" });
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 1, annual: 2 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 1, annual: 2 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(surfaces.composition, 1);

    fireEvent.keyDown(surfaces.annual, { key: "ArrowLeft" });
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 1, annual: 1 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 1, annual: 1 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(surfaces.annual, 1);
  });

  it("I02.R002 ArrowLeft prevents page scrolling on both chart surfaces", () => {
    const built = successfulBuild(last());
    render(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 2 }} onSelectionChange={() => undefined} />);
    const surfaces = chartSurfaces();
    expect(cancelableKeyDown(surfaces.composition, "ArrowLeft").defaultPrevented).toBe(true);
    expect(cancelableKeyDown(surfaces.annual, "ArrowLeft").defaultPrevented).toBe(true);
  });

  it("I02.R003 ArrowRight commits the following item on both chart surfaces", () => {
    const built = successfulBuild(last());
    const initial = { composition: 1, annual: 1 };
    const onSelectionChange = vi.fn();
    const view = render(<ChartFigures built={built} stale={false} selection={initial} onSelectionChange={onSelectionChange} />);
    const surfaces = chartSurfaces();

    fireEvent.keyDown(surfaces.composition, { key: "ArrowRight" });
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 2, annual: 1 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 1 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(surfaces.composition, 2);

    fireEvent.keyDown(surfaces.annual, { key: "ArrowRight" });
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 2, annual: 2 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 2 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(surfaces.annual, 2);
  });

  it("I02.R004 ArrowRight prevents page scrolling on both chart surfaces", () => {
    const built = successfulBuild(last());
    render(<ChartFigures built={built} stale={false} selection={{ composition: 1, annual: 1 }} onSelectionChange={() => undefined} />);
    const surfaces = chartSurfaces();
    expect(cancelableKeyDown(surfaces.composition, "ArrowRight").defaultPrevented).toBe(true);
    expect(cancelableKeyDown(surfaces.annual, "ArrowRight").defaultPrevented).toBe(true);
  });

  it("I02.R005 Home commits the first item on both chart surfaces", () => {
    const built = successfulBuild(last());
    const initial = { composition: 3, annual: 3 };
    const onSelectionChange = vi.fn();
    const view = render(<ChartFigures built={built} stale={false} selection={initial} onSelectionChange={onSelectionChange} />);
    const surfaces = chartSurfaces();

    fireEvent.keyDown(surfaces.composition, { key: "Home" });
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 0, annual: 3 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 3 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(surfaces.composition, 0);

    fireEvent.keyDown(surfaces.annual, { key: "Home" });
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 0, annual: 0 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(surfaces.annual, 0);
  });

  it("I02.R006 Home prevents page scrolling on both chart surfaces", () => {
    const built = successfulBuild(last());
    render(<ChartFigures built={built} stale={false} selection={{ composition: 3, annual: 3 }} onSelectionChange={() => undefined} />);
    const surfaces = chartSurfaces();
    expect(cancelableKeyDown(surfaces.composition, "Home").defaultPrevented).toBe(true);
    expect(cancelableKeyDown(surfaces.annual, "Home").defaultPrevented).toBe(true);
  });

  it("I02.R007 End derives and commits each successful model's actual final item", () => {
    for (const durationMonths of ["12", "120"]) {
      const built = successfulBuild(last(durationMonths));
      const annualFinal = built.annualGrowth.points.length - 1;
      const onSelectionChange = vi.fn();
      const view = render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={onSelectionChange} />);
      const surfaces = chartSurfaces();

      fireEvent.keyDown(surfaces.composition, { key: "End" });
      expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: built.composition.steps.length - 1, annual: 0 });
      view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: built.composition.steps.length - 1, annual: 0 }} onSelectionChange={onSelectionChange} />);
      expectSelectedIndex(surfaces.composition, built.composition.steps.length - 1);

      fireEvent.keyDown(surfaces.annual, { key: "End" });
      expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: built.composition.steps.length - 1, annual: annualFinal });
      view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: built.composition.steps.length - 1, annual: annualFinal }} onSelectionChange={onSelectionChange} />);
      expectSelectedIndex(surfaces.annual, annualFinal);
      view.unmount();
    }
  });

  it("I02.R008 End prevents page scrolling on both chart surfaces", () => {
    const built = successfulBuild(last());
    render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={() => undefined} />);
    const surfaces = chartSurfaces();
    expect(cancelableKeyDown(surfaces.composition, "End").defaultPrevented).toBe(true);
    expect(cancelableKeyDown(surfaces.annual, "End").defaultPrevented).toBe(true);
  });

  it("I02.R009 clamps both chart surfaces at first and actual-final boundaries without an out-of-range selection", () => {
    const built = successfulBuild(last());
    const final = { composition: built.composition.steps.length - 1, annual: built.annualGrowth.points.length - 1 };
    const onSelectionChange = vi.fn();
    const view = render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={onSelectionChange} />);
    let surfaces = chartSurfaces();

    fireEvent.keyDown(surfaces.composition, { key: "ArrowLeft" });
    expect(onSelectionChange).not.toHaveBeenCalled();
    fireEvent.keyDown(surfaces.annual, { key: "ArrowLeft" });
    expect(onSelectionChange).not.toHaveBeenCalled();
    expectSelectedIndex(surfaces.composition, 0);
    expectSelectedIndex(surfaces.annual, 0);

    view.rerender(<ChartFigures built={built} stale={false} selection={final} onSelectionChange={onSelectionChange} />);
    surfaces = chartSurfaces();
    fireEvent.keyDown(surfaces.composition, { key: "ArrowRight" });
    expect(onSelectionChange).not.toHaveBeenCalled();
    fireEvent.keyDown(surfaces.annual, { key: "ArrowRight" });
    expect(onSelectionChange).not.toHaveBeenCalled();
    expectSelectedIndex(surfaces.composition, final.composition);
    expectSelectedIndex(surfaces.annual, final.annual);

    for (const call of onSelectionChange.mock.calls) {
      const selection = call[0];
      expect(selection.composition).toBeGreaterThanOrEqual(0);
      expect(selection.composition).toBeLessThan(built.composition.steps.length);
      expect(selection.annual).toBeGreaterThanOrEqual(0);
      expect(selection.annual).toBeLessThan(built.annualGrowth.points.length);
    }
  });

  it("I01.R001/R002 exposes exactly one named and described chart Tab stop per figure", async () => {
    const supplied = last();
    const built = successfulBuild(supplied);
    const selection = {
      composition: built.initialSelections.composition.committedIndex,
      annual: built.initialSelections.annualGrowth.committedIndex,
    };
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();
    render(<ChartFigures built={built} stale={false} selection={selection} onSelectionChange={onSelectionChange} />);

    const exactInstruction = "Use Left and Right Arrow to review chart values. Home selects the first value. End selects the last value.";
    const composition = screen.getByRole("group", { name: "Balance composition" });
    const annual = screen.getByRole("group", { name: "Annual ending balance" });
    const compositionFigure = composition.closest("figure");
    const annualFigure = annual.closest("figure");
    if (!compositionFigure || !annualFigure) throw new Error("expected both chart figures");

    for (const [surface, figure, title] of [
      [composition, compositionFigure, "Balance composition"],
      [annual, annualFigure, "Annual ending balance"],
    ] as const) {
      expect(surface.getAttribute("tabindex")).toBe("0");
      const titleId = surface.getAttribute("aria-labelledby");
      const descriptionId = surface.getAttribute("aria-describedby");
      expect(titleId).not.toBeNull();
      expect(descriptionId).not.toBeNull();
      const visibleTitle = document.getElementById(titleId!);
      const visibleDescription = document.getElementById(descriptionId!);
      expect(visibleTitle?.textContent).toBe(title);
      expect(visibleDescription?.textContent).toBe(exactInstruction);
      expect(visibleTitle?.hidden).toBe(false);
      expect(visibleDescription?.hidden).toBe(false);
      expect(figure.querySelectorAll('[role="group"][tabindex="0"]')).toHaveLength(1);
      for (const datum of within(figure).getAllByRole("button")) {
        expect(datum.tabIndex).toBe(-1);
      }
    }

    await user.tab();
    expect(document.activeElement).toBe(composition);
    await user.tab();
    expect(document.activeElement).toBe(annual);

    fireEvent.keyDown(composition, { key: "Home" });
    expect(onSelectionChange).toHaveBeenCalledWith({ composition: 0, annual: selection.annual });
    fireEvent.keyDown(annual, { key: "Home" });
    expect(onSelectionChange).toHaveBeenCalledWith({ composition: selection.composition, annual: 0 });
  });

  it("I01.R004 exposes non-focusable pointer hit regions without adding chart Tab stops", async () => {
    const built = successfulBuild(last());
    const user = userEvent.setup();
    render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={() => undefined} />);
    const surfaces = chartSurfaces();
    const svgs = chartSvgs();
    const compositionHits = [...svgs.composition.querySelectorAll('[data-chart-hit-region="composition"]')];
    const annualHits = [...svgs.annual.querySelectorAll('[data-chart-hit-region="annual"]')];

    expect(compositionHits).toHaveLength(5);
    expect(annualHits).toHaveLength(1);
    for (const hit of [...compositionHits, ...annualHits]) {
      expect(hit.hasAttribute("tabindex")).toBe(false);
      expect(hit.getAttribute("focusable")).toBe("false");
    }
    await user.tab();
    expect(document.activeElement).toBe(surfaces.composition);
    await user.tab();
    expect(document.activeElement).toBe(surfaces.annual);
  });

  it("I03.R001 commits the nearest rendered item for mouse pointerup on both figures", () => {
    const built = successfulBuild(last());
    const onSelectionChange = vi.fn();
    const view = render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={onSelectionChange} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    const compositionXs = compositionRenderedX(svgs.composition);
    const annualXs = annualRenderedX(svgs.annual);
    const compositionHit = svgs.composition.querySelectorAll('[data-chart-hit-region="composition"]')[2];
    const annualHit = svgs.annual.querySelector('[data-chart-hit-region="annual"]');
    if (!compositionHit || !annualHit) throw new Error("expected spatial hit regions");

    spatialPointerUp(compositionHit, "mouse", compositionXs[2]!, 80);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 2, annual: 0 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 0 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(chartSurfaces().composition, 2);
    expect(chartSurfaces().composition.closest("figure")?.querySelector("p.chart-selected")?.textContent).toBe(built.composition.steps[2]!.accessibleLabel);

    spatialPointerUp(annualHit, "mouse", annualXs[3]!, 90);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 2, annual: 3 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 3 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(chartSurfaces().annual, 3);
    expect(chartSurfaces().annual.closest("figure")?.querySelector("p.chart-selected")?.textContent).toBe(built.annualGrowth.points[3]!.accessibleLabel);
  });

  it("I03.R002 uses the same nearest-x rule for touch pointerup on both figures", () => {
    const built = successfulBuild(last());
    const onSelectionChange = vi.fn();
    const view = render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={onSelectionChange} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    const compositionXs = compositionRenderedX(svgs.composition);
    const annualXs = annualRenderedX(svgs.annual);
    const compositionHit = svgs.composition.querySelectorAll('[data-chart-hit-region="composition"]')[2];
    const annualHit = svgs.annual.querySelector('[data-chart-hit-region="annual"]');
    if (!compositionHit || !annualHit) throw new Error("expected spatial hit regions");

    spatialPointerUp(compositionHit, "touch", compositionXs[2]!, 80);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 2, annual: 0 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 0 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(chartSurfaces().composition, 2);

    spatialPointerUp(annualHit, "touch", annualXs[3]!, 90);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 2, annual: 3 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 3 }} onSelectionChange={onSelectionChange} />);
    expectSelectedIndex(chartSurfaces().annual, 3);
  });

  it("I03.R003 resolves exact nearest-x ties to the earlier rendered item on both figures", () => {
    const built = successfulBuild(last());
    const onSelectionChange = vi.fn();
    render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: 5 }} onSelectionChange={onSelectionChange} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    const compositionXs = compositionRenderedX(svgs.composition);
    const annualXs = annualRenderedX(svgs.annual);
    const compositionHit = svgs.composition.querySelectorAll('[data-chart-hit-region="composition"]')[0];
    const annualHit = svgs.annual.querySelector('[data-chart-hit-region="annual"]');
    if (!compositionHit || !annualHit) throw new Error("expected spatial hit regions");
    const compositionMidpoint = (compositionXs[0]! + compositionXs[1]!) / 2;
    const annualMidpoint = (annualXs[0]! + annualXs[1]!) / 2;

    spatialPointerUp(compositionHit, "mouse", compositionMidpoint, 80);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 0, annual: 5 });
    spatialPointerUp(compositionHit, "mouse", compositionMidpoint - 0.01, 80);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 0, annual: 5 });
    spatialPointerUp(compositionHit, "mouse", compositionMidpoint + 0.01, 80);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 1, annual: 5 });

    spatialPointerUp(annualHit, "touch", annualMidpoint, 90);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 4, annual: 0 });
    spatialPointerUp(annualHit, "touch", annualMidpoint - 0.01, 90);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 4, annual: 0 });
    spatialPointerUp(annualHit, "touch", annualMidpoint + 0.01, 90);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 4, annual: 1 });
  });

  it("I03.R004 ignores pointer coordinates outside each eligible plot boundary", () => {
    const built = successfulBuild(last());
    const selection = { composition: 2, annual: 2 };
    const onSelectionChange = vi.fn();
    render(<ChartFigures built={built} stale={false} selection={selection} onSelectionChange={onSelectionChange} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    evaluateCalls.splice(0);

    for (const [x, y] of [[19, 80], [465, 80], [100, 19], [100, 121]] as const) spatialPointerUp(svgs.composition, "mouse", x, y);
    for (const [x, y] of [[29, 90], [471, 90], [100, 39], [100, 141]] as const) spatialPointerUp(svgs.annual, "touch", x, y);

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(evaluateCalls).toHaveLength(0);
    expectSelectedIndex(chartSurfaces().composition, selection.composition);
    expectSelectedIndex(chartSurfaces().annual, selection.annual);
  });

  it("I03.R005 preserves supplied model identity while controlled pointer selection updates visible state", () => {
    const built = successfulBuild(last());
    const compositionModel = built.composition;
    const annualModel = built.annualGrowth;
    const before = JSON.stringify(built);
    const onSelectionChange = vi.fn();
    const view = render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={onSelectionChange} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    const compositionHit = svgs.composition.querySelectorAll('[data-chart-hit-region="composition"]')[2];
    const annualHit = svgs.annual.querySelector('[data-chart-hit-region="annual"]');
    if (!compositionHit || !annualHit) throw new Error("expected spatial hit regions");

    spatialPointerUp(compositionHit, "mouse", compositionRenderedX(svgs.composition)[2]!, 80);
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 0 }} onSelectionChange={onSelectionChange} />);
    expect(built.composition).toBe(compositionModel);
    expect(built.annualGrowth).toBe(annualModel);
    expect(JSON.stringify(built)).toBe(before);
    expectSelectedIndex(chartSurfaces().composition, 2);

    spatialPointerUp(annualHit, "touch", annualRenderedX(svgs.annual)[3]!, 90);
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 3 }} onSelectionChange={onSelectionChange} />);
    expect(built.composition).toBe(compositionModel);
    expect(built.annualGrowth).toBe(annualModel);
    expect(JSON.stringify(built)).toBe(before);
    expectSelectedIndex(chartSurfaces().annual, 3);
  });

  it("I03.R006 performs zero financial calculation for mouse and touch pointer paths", () => {
    const built = successfulBuild(last());
    const onSelectionChange = vi.fn();
    render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={onSelectionChange} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    const compositionHit = svgs.composition.querySelectorAll('[data-chart-hit-region="composition"]')[1];
    const annualHit = svgs.annual.querySelector('[data-chart-hit-region="annual"]');
    if (!compositionHit || !annualHit) throw new Error("expected spatial hit regions");
    evaluateCalls.splice(0);

    spatialPointerUp(compositionHit, "mouse", compositionRenderedX(svgs.composition)[1]!, 80);
    spatialPointerUp(annualHit, "touch", annualRenderedX(svgs.annual)[2]!, 90);
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(evaluateCalls).toHaveLength(0);
  });

  it("B02.R004 makes same-index, outside, and synthesized-click paths no-op without recalculation or duplicate commitment", () => {
    const built = successfulBuild(last());
    const selection = { composition: 2, annual: 3 };
    const onSelectionChange = vi.fn();
    render(<ChartFigures built={built} stale={false} selection={selection} onSelectionChange={onSelectionChange} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    const compositionHits = svgs.composition.querySelectorAll('[data-chart-hit-region="composition"]');
    const annualHit = svgs.annual.querySelector('[data-chart-hit-region="annual"]');
    if (!compositionHits[1] || !compositionHits[2] || !annualHit) throw new Error("expected spatial hit regions");
    const compositionXs = compositionRenderedX(svgs.composition);
    const annualXs = annualRenderedX(svgs.annual);
    evaluateCalls.splice(0);

    spatialPointerUp(compositionHits[2], "mouse", compositionXs[2]!, 80);
    spatialPointerUp(svgs.composition, "mouse", 19, 80);
    spatialPointerUp(annualHit, "touch", annualXs[3]!, 90);
    spatialPointerUp(svgs.annual, "touch", 471, 90);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(evaluateCalls).toHaveLength(0);

    spatialPointerUp(compositionHits[1], "mouse", compositionXs[1]!, 80);
    fireEvent.click(compositionHits[1], spatialClientPoint(compositionHits[1], compositionXs[1]!, 80));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 1, annual: 3 });

    onSelectionChange.mockClear();
    spatialPointerUp(annualHit, "touch", annualXs[4]!, 90);
    fireEvent.click(annualHit, spatialClientPoint(annualHit, annualXs[4]!, 90));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 2, annual: 4 });
    expect(evaluateCalls).toHaveLength(0);
  });

  it("A06.R001 renders the exact supplied partial-period model label in the annual list", () => {
    const built = successfulBuild(last("13"));
    const point = built.annualGrowth.points[1]!;
    expect(point).toMatchObject({
      year: 2,
      startMonth: 13,
      endMonth: 13,
      isPartialPeriod: true,
      label: "Year 2 — partial period, months 13–13",
    });
    render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: 1 }} onSelectionChange={() => undefined} />);
    const annualFigure = chartSurfaces().annual.closest("figure");
    if (!annualFigure) throw new Error("expected annual figure");
    const list = within(annualFigure).getByRole("list", { name: "Annual ending balance values" });
    expect(within(list).getByRole("button", {
      name: `Year 2 — partial period, months 13–13: ${point.formattedClosingBalance}.`,
    })).toBeTruthy();
  });

  it("A06.R002 appends the exact final-partial sentence once in the annual summary carrier", () => {
    const built = successfulBuild(last("25"));
    render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: 2 }} onSelectionChange={() => undefined} />);
    const annualFigure = chartSurfaces().annual.closest("figure");
    if (!annualFigure) throw new Error("expected annual figure");
    const summary = [...annualFigure.querySelectorAll("p")].at(-1);
    if (!summary) throw new Error("expected annual summary");
    const sentence = "The final recorded period covers months 25–25.";
    const first = built.annualGrowth.points[0]!;
    const final = built.annualGrowth.points.at(-1)!;
    const expectedBase = `The illustrated annual ending balance moves from ${first.formattedClosingBalance} at ${first.label}. The first recorded annual ending balance is ${first.formattedClosingBalance} and the final recorded annual ending balance is ${final.formattedClosingBalance}.`;
    expect(summary.textContent).toBe(`${expectedBase} ${sentence}`);
    expect(summary.textContent).toContain(first.formattedClosingBalance);
    expect(summary.textContent).toContain(final.formattedClosingBalance);
    expect(summary.textContent?.split(sentence)).toHaveLength(2);
    expect(summary.textContent?.endsWith(sentence)).toBe(true);
  });

  it("A06.R003 uses the canonical partial label and full amount in the selected carrier", () => {
    const built = successfulBuild(last("13"));
    const point = built.annualGrowth.points[1]!;
    render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: 1 }} onSelectionChange={() => undefined} />);
    const annualFigure = chartSurfaces().annual.closest("figure");
    const selected = annualFigure?.querySelector("p.chart-selected");
    expect(selected?.textContent).toBe(`Year 2 — partial period, months 13–13: ${point.formattedClosingBalance}.`);
  });

  it("A06.R004 keeps 12- and 24-month point, list, and selected labels non-partial", () => {
    for (const durationMonths of ["12", "24"]) {
      const built = successfulBuild(last(durationMonths));
      const finalIndex = built.annualGrowth.points.length - 1;
      const finalPoint = built.annualGrowth.points[finalIndex]!;
      expect(finalPoint.label).toBe(`Year ${finalPoint.year}`);
      expect(finalPoint.isPartialPeriod).toBe(false);
      const view = render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: finalIndex }} onSelectionChange={() => undefined} />);
      const annualFigure = chartSurfaces().annual.closest("figure");
      if (!annualFigure) throw new Error("expected annual figure");
      const list = within(annualFigure).getByRole("list", { name: "Annual ending balance values" });
      expect(within(list).getByRole("button", {
        name: `Year ${finalPoint.year}: ${finalPoint.formattedClosingBalance}.`,
      })).toBeTruthy();
      expect(annualFigure.querySelector("p.chart-selected")?.textContent).toBe(
        `Year ${finalPoint.year}: ${finalPoint.formattedClosingBalance}.`,
      );
      expect(annualFigure.textContent).not.toContain("partial period");
      view.unmount();
    }
  });

  it("A06.R005 emits no partial-period sentence for a full final period", () => {
    const built = successfulBuild(last("24"));
    render(<ChartFigures built={built} stale={false} selection={{ composition: 4, annual: 1 }} onSelectionChange={() => undefined} />);
    const annualFigure = chartSurfaces().annual.closest("figure");
    if (!annualFigure) throw new Error("expected annual figure");
    const summary = [...annualFigure.querySelectorAll("p")].at(-1);
    const first = built.annualGrowth.points[0]!;
    const final = built.annualGrowth.points.at(-1)!;
    const expectedBase = `The illustrated annual ending balance moves from ${first.formattedClosingBalance} at ${first.label}. The first recorded annual ending balance is ${first.formattedClosingBalance} and the final recorded annual ending balance is ${final.formattedClosingBalance}.`;
    expect(summary?.textContent).toBe(expectedBase);
    expect(summary?.textContent).toContain(first.formattedClosingBalance);
    expect(summary?.textContent).toContain(final.formattedClosingBalance);
    expect(summary?.textContent).not.toContain("The final recorded period covers months");
  });

  it("I05.R001 previews both charts without committing, changing model identity, or coupling previews", () => {
    const built = successfulBuild(last());
    const selection = { composition: 0, annual: 0 };
    const compositionModel = built.composition;
    const annualModel = built.annualGrowth;
    const onSelectionChange = vi.fn();
    render(<ChartFigures built={built} stale={false} selection={selection} onSelectionChange={onSelectionChange} />);
    const surfaces = chartSurfaces();
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);

    spatialPointerMove(svgs.composition, "mouse", compositionRenderedX(svgs.composition)[1]!, 80);
    expect(selectedValue(surfaces.composition).textContent).toBe(built.composition.steps[1]!.accessibleLabel);
    expectSelectedIndex(surfaces.composition, selection.composition);
    expect(selectedValue(surfaces.annual).textContent).toBe(built.annualGrowth.points[selection.annual]!.accessibleLabel);

    spatialPointerMove(svgs.composition, "mouse", compositionRenderedX(svgs.composition)[2]!, 80);
    expect(selectedValue(surfaces.composition).textContent).toBe(built.composition.steps[2]!.accessibleLabel);
    spatialPointerMove(svgs.annual, "mouse", annualRenderedX(svgs.annual)[3]!, 90);
    expect(selectedValue(surfaces.annual).textContent).toBe(built.annualGrowth.points[3]!.accessibleLabel);
    expect(selectedValue(surfaces.composition).textContent).toBe(built.composition.steps[2]!.accessibleLabel);
    expectSelectedIndex(surfaces.annual, selection.annual);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(built.composition).toBe(compositionModel);
    expect(built.annualGrowth).toBe(annualModel);
  });

  it("I05.R002 clears only the chart surface that is left and restores its committed selection", () => {
    const built = successfulBuild(last());
    const selection = { composition: 0, annual: 0 };
    const onSelectionChange = vi.fn();
    render(<ChartFigures built={built} stale={false} selection={selection} onSelectionChange={onSelectionChange} />);
    const surfaces = chartSurfaces();
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);

    spatialPointerMove(svgs.composition, "mouse", compositionRenderedX(svgs.composition)[2]!, 80);
    spatialPointerMove(svgs.annual, "mouse", annualRenderedX(svgs.annual)[3]!, 90);
    fireEvent.pointerLeave(svgs.composition, { pointerType: "mouse" });
    expect(selectedValue(surfaces.composition).textContent).toBe(built.composition.steps[0]!.accessibleLabel);
    expect(selectedValue(surfaces.annual).textContent).toBe(built.annualGrowth.points[3]!.accessibleLabel);

    fireEvent.pointerLeave(svgs.annual, { pointerType: "mouse" });
    expect(selectedValue(surfaces.annual).textContent).toBe(built.annualGrowth.points[0]!.accessibleLabel);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("I05.R003 leaves the complete announcement carrier state unchanged through repeated previews", () => {
    const built = successfulBuild(last());
    render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={() => undefined} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    const before = announcementSnapshot();

    spatialPointerMove(svgs.composition, "mouse", compositionRenderedX(svgs.composition)[1]!, 80);
    expect(announcementSnapshot()).toEqual(before);
    spatialPointerMove(svgs.composition, "mouse", compositionRenderedX(svgs.composition)[3]!, 80);
    expect(announcementSnapshot()).toEqual(before);
    spatialPointerMove(svgs.annual, "mouse", annualRenderedX(svgs.annual)[4]!, 90);
    expect(announcementSnapshot()).toEqual(before);
  });

  it("I05.R004 leaves the complete announcement carrier state unchanged during leave restoration", () => {
    const built = successfulBuild(last());
    render(<ChartFigures built={built} stale={false} selection={{ composition: 0, annual: 0 }} onSelectionChange={() => undefined} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    spatialPointerMove(svgs.composition, "mouse", compositionRenderedX(svgs.composition)[2]!, 80);
    spatialPointerMove(svgs.annual, "mouse", annualRenderedX(svgs.annual)[2]!, 90);
    const beforeLeave = announcementSnapshot();

    fireEvent.pointerLeave(svgs.composition, { pointerType: "mouse" });
    expect(announcementSnapshot()).toEqual(beforeLeave);
    fireEvent.pointerLeave(svgs.annual, { pointerType: "mouse" });
    expect(announcementSnapshot()).toEqual(beforeLeave);
  });

  it("B02.R005 keeps hover and restoration outside calculation, commitment, and URL boundaries", () => {
    const built = successfulBuild(last());
    const selection = { composition: 0, annual: 0 };
    const onSelectionChange = vi.fn();
    render(<ChartFigures built={built} stale={false} selection={selection} onSelectionChange={onSelectionChange} />);
    const svgs = chartSvgs();
    mockSvgGeometry(svgs.composition);
    mockSvgGeometry(svgs.annual);
    const calculationCount = evaluateCalls.length;
    const url = window.location.href;

    spatialPointerMove(svgs.composition, "mouse", compositionRenderedX(svgs.composition)[1]!, 80);
    spatialPointerMove(svgs.composition, "mouse", compositionRenderedX(svgs.composition)[3]!, 80);
    fireEvent.pointerLeave(svgs.composition, { pointerType: "mouse" });
    spatialPointerMove(svgs.annual, "mouse", annualRenderedX(svgs.annual)[2]!, 90);
    spatialPointerMove(svgs.annual, "mouse", annualRenderedX(svgs.annual)[4]!, 90);
    fireEvent.pointerLeave(svgs.annual, { pointerType: "mouse" });

    expect(evaluateCalls).toHaveLength(calculationCount);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(window.location.href).toBe(url);
  });

  it("keeps touch on the existing commit path without creating a stranded hover preview", () => {
    const built = successfulBuild(last());
    const selection = { composition: 0, annual: 0 };
    const onSelectionChange = vi.fn();
    const view = render(<ChartFigures built={built} stale={false} selection={selection} onSelectionChange={onSelectionChange} />);
    const surfaces = chartSurfaces();
    const svg = chartSvgs().composition;
    mockSvgGeometry(svg);
    const targetX = compositionRenderedX(svg)[2]!;

    spatialPointerMove(svg, "touch", targetX, 80);
    expect(selectedValue(surfaces.composition).textContent).toBe(built.composition.steps[0]!.accessibleLabel);
    spatialPointerUp(svg, "touch", targetX, 80);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith({ composition: 2, annual: 0 });
    view.rerender(<ChartFigures built={built} stale={false} selection={{ composition: 2, annual: 0 }} onSelectionChange={onSelectionChange} />);
    expect(selectedValue(chartSurfaces().composition).textContent).toBe(built.composition.steps[2]!.accessibleLabel);
  });

  it("does not mutate owner selection when chart-model building is unavailable", () => {
    const supplied = last();
    const built = successfulBuild(supplied);
    const selection = { composition: 0, annual: 0 };
    const onSelectionChange = vi.fn();
    const malformed = { inputs: { ...supplied.inputs }, result: supplied.result };
    delete (malformed.inputs as Partial<typeof malformed.inputs>).currency;
    const view = render(
      <ChartFigures
        built={buildChartModels(malformed as unknown as typeof supplied)}
        stale
        selection={selection}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.queryByRole("list", { name: "Balance composition values" })).toBeNull();
    expect(onSelectionChange).not.toHaveBeenCalled();

    view.rerender(
      <ChartFigures
        built={built}
        stale={false}
        selection={selection}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.getByRole("button", { name: /Starting balance/i }).getAttribute("aria-current")).toBe("true");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
