// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
  if (vi.isFakeTimers()) {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  }
});

const evaluateCalls = vi.hoisted(() => [] as Array<Parameters<typeof import("../../lib/calculator/engine.js").evaluateCalculator>[0]>);
const chartBuildCalls = vi.hoisted(() => [] as Array<Parameters<typeof import("../../lib/presentation/chart-model.js").buildChartModels>[0]>);
const chartBuildLocales = vi.hoisted(() => [] as Array<Parameters<typeof import("../../lib/presentation/chart-model.js").buildChartModels>[1]>);
const chartBuildControl = vi.hoisted(() => ({
  failNext: false,
  nextInitial: null as null | { composition: number; annual: number },
}));

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

vi.mock("../../lib/presentation/chart-model", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/presentation/chart-model")>();
  return {
    ...actual,
    buildChartModels: (last: Parameters<typeof actual.buildChartModels>[0], locale?: Parameters<typeof actual.buildChartModels>[1]) => {
      chartBuildCalls.push(last);
      chartBuildLocales.push(locale);
      const built = actual.buildChartModels(last, locale);
      if (chartBuildControl.failNext) {
        chartBuildControl.failNext = false;
        const malformed = { inputs: { ...last.inputs }, result: last.result };
        delete (malformed.inputs as Partial<typeof malformed.inputs>).currency;
        return actual.buildChartModels(malformed as typeof last, locale);
      }
      const override = chartBuildControl.nextInitial;
      chartBuildControl.nextInitial = null;
      if (!built.ok || override === null) return built;
      return {
        ...built,
        initialSelections: {
          composition: { committedIndex: override.composition, hoverPreviewIndex: null, visibleIndex: override.composition },
          annualGrowth: { committedIndex: override.annual, hoverPreviewIndex: null, visibleIndex: override.annual },
        },
      } as unknown as typeof built;
    },
  };
});

vi.mock("../../app/chart-figures", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../app/chart-figures")>();
  return {
    ...actual,
    ChartFigures: (props: Parameters<typeof actual.ChartFigures>[0]) => (
      <>
        <span hidden data-testid="workspace-chart-selection">{JSON.stringify(props.selection)}</span>
        <actual.ChartFigures {...props} />
      </>
    ),
  };
});

import { CalculatorWorkspace } from "../../app/calculator-workspace";

function setup(fakeTimers = false) {
  const user = fakeTimers
    ? userEvent.setup({ advanceTimers: (milliseconds) => vi.advanceTimersByTime(milliseconds) })
    : userEvent.setup();
  const view = render(<CalculatorWorkspace />);
  return { user, ...view };
}

it("rebuilds the current presentation in Number format without recalculating or changing committed chart selections", async () => {
  const { user } = setup();
  await screen.findByRole("group", { name: "Balance composition" });
  const compositionBefore = compositionSelectedValue().textContent;
  const annualBefore = annualSelectedValue().textContent;
  expect(screen.getByText("Final balance").nextElementSibling?.textContent).toContain("$");
  evaluateCalls.splice(0);
  chartBuildCalls.splice(0);
  chartBuildLocales.splice(0);
  await user.selectOptions(screen.getByLabelText("Number format"), "de-DE");
  expect(evaluateCalls).toHaveLength(0);
  expect(chartBuildCalls).toHaveLength(1);
  expect(chartBuildLocales).toEqual(["de-DE"]);
  expect(screen.getByText("Final balance").nextElementSibling?.textContent).toContain(",");
  expect(compositionSelectedValue().textContent).not.toBe(compositionBefore);
  expect(annualSelectedValue().textContent).not.toBe(annualBefore);
});

it("uses explicit en-US for the initial and Reset chart-model paths", async () => {
  const { user } = setup();
  expect(chartBuildLocales.at(-1)).toBe("en-US");
  await user.selectOptions(screen.getByLabelText("Number format"), "de-DE");
  expect(chartBuildLocales.at(-1)).toBe("de-DE");
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect((screen.getByLabelText("Number format") as HTMLSelectElement).value).toBe("en-US");
  expect(chartBuildLocales.at(-1)).toBe("en-US");
});

it("uses the current presentation locale when a new valid result is accepted", async () => {
  const { user } = setup();
  await user.selectOptions(screen.getByLabelText("Number format"), "de-DE");
  chartBuildCalls.splice(0);
  chartBuildLocales.splice(0);
  replace(/Starting balance/i, "12000");
  fireEvent.click(screen.getByRole("button", { name: "Recalculate" }));
  expect(chartBuildCalls).toHaveLength(1);
  expect(chartBuildLocales).toEqual(["de-DE"]);
});

it("keeps last-valid financial state, selections, announcement, URL, storage, and timers unchanged for a locale-only rebuild", async () => {
  vi.useFakeTimers();
  setup(true);
  const selectionBefore = screen.getByTestId("workspace-chart-selection").textContent;
  const announcementBefore = announcementCarrier().textContent;
  const currencyBefore = (screen.getByLabelText(/Currency/i) as HTMLSelectElement).value;
  const urlBefore = window.location.href;
  const pushState = vi.spyOn(window.history, "pushState");
  const replaceState = vi.spyOn(window.history, "replaceState");
  const localGet = vi.spyOn(Storage.prototype, "getItem");
  const localSet = vi.spyOn(Storage.prototype, "setItem");
  const sessionGet = vi.spyOn(Storage.prototype, "getItem");
  const sessionSet = vi.spyOn(Storage.prototype, "setItem");
  evaluateCalls.splice(0);
  chartBuildCalls.splice(0);
  chartBuildLocales.splice(0);
  fireEvent.change(screen.getByLabelText("Number format"), { target: { value: "de-DE" } });
  expect(evaluateCalls).toHaveLength(0);
  expect(chartBuildCalls).toHaveLength(1);
  expect(chartBuildLocales).toEqual(["de-DE"]);
  expect(screen.getByTestId("workspace-chart-selection").textContent).toBe(selectionBefore);
  expect((screen.getByLabelText(/Currency/i) as HTMLSelectElement).value).toBe(currencyBefore);
  expect(announcementCarrier().textContent).toBe(announcementBefore);
  expect(window.location.href).toBe(urlBefore);
  expect(pushState).not.toHaveBeenCalled();
  expect(replaceState).not.toHaveBeenCalled();
  expect(localGet).not.toHaveBeenCalled();
  expect(localSet).not.toHaveBeenCalled();
  expect(sessionGet).not.toHaveBeenCalled();
  expect(sessionSet).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it("renders the exact Number format help relationship and ordered frozen options", () => {
  setup();
  const select = screen.getByLabelText("Number format") as HTMLSelectElement;
  expect(select.getAttribute("aria-describedby")).toBe("presentation-locale-help");
  expect(screen.getByText("Changes number formatting only. It does not change the currency, content language, or calculation.").id).toBe("presentation-locale-help");
  expect(within(select).getAllByRole("option").map((option) => [option.getAttribute("value"), option.textContent])).toEqual([
    ["en-US", "United States (en-US)"],
    ["en-GB", "United Kingdom (en-GB)"],
    ["de-DE", "Germany (de-DE)"],
    ["fr-FR", "France (fr-FR)"],
  ]);
});

it("ignores an invalid Number format UI value and retains the prior valid locale", async () => {
  const { user } = setup();
  const select = screen.getByLabelText("Number format") as HTMLSelectElement;
  await user.selectOptions(select, "de-DE");
  const selectionBefore = screen.getByTestId("workspace-chart-selection").textContent;
  evaluateCalls.splice(0);
  chartBuildCalls.splice(0);
  chartBuildLocales.splice(0);
  fireEvent.change(select, { target: { value: "es-ES" } });
  expect(select.value).toBe("de-DE");
  expect(evaluateCalls).toHaveLength(0);
  expect(chartBuildCalls).toHaveLength(0);
  expect(chartBuildLocales).toHaveLength(0);
  expect(screen.getByTestId("workspace-chart-selection").textContent).toBe(selectionBefore);
});

it("reformats all six headline values while preserving the same last-valid raw result", async () => {
  const { user } = setup();
  const labels = ["Final balance", "Total contributions", "Gross growth", "Total fees", "Nominal investment gain", "Inflation-adjusted ending balance"];
  const results = screen.getByLabelText("Calculation results");
  const valueFor = (label: string) => within(results).getByText(label).nextElementSibling?.textContent;
  const before = labels.map(valueFor);
  const rawBefore = chartBuildCalls.at(-1);
  chartBuildCalls.splice(0);
  await user.selectOptions(screen.getByLabelText("Number format"), "de-DE");
  const after = labels.map(valueFor);
  expect(after).toHaveLength(6);
  expect(after.every((value, index) => value !== before[index] && value?.includes(","))).toBe(true);
  expect(chartBuildCalls).toHaveLength(1);
  expect(chartBuildCalls[0]).toBe(rawBefore);
});

it("keeps the selected presentation locale when currency changes independently", async () => {
  const { user } = setup();
  const locale = screen.getByLabelText("Number format") as HTMLSelectElement;
  await user.selectOptions(locale, "de-DE");
  fireEvent.change(screen.getByLabelText(/Currency/i), { target: { value: "EUR" } });
  expect(locale.value).toBe("de-DE");
  expect((screen.getByLabelText(/Currency/i) as HTMLSelectElement).value).toBe("EUR");
  expect(screen.getByText("Changes labels and symbols only. Changing currency does not convert values.")).toBeTruthy();
  expect(screen.getByText("Changes number formatting only. It does not change the currency, content language, or calculation.")).toBeTruthy();
});

it("does not treat an ordinary rerender as a locale event", async () => {
  const { user, rerender } = setup();
  await user.selectOptions(screen.getByLabelText("Number format"), "de-DE");
  chartBuildCalls.splice(0);
  chartBuildLocales.splice(0);
  rerender(<CalculatorWorkspace />);
  expect((screen.getByLabelText("Number format") as HTMLSelectElement).value).toBe("de-DE");
  expect(chartBuildCalls).toHaveLength(0);
  expect(chartBuildLocales).toHaveLength(0);
});

it("does not treat a viewport change as a locale event", async () => {
  const { user } = setup();
  await user.selectOptions(screen.getByLabelText("Number format"), "de-DE");
  chartBuildCalls.splice(0);
  chartBuildLocales.splice(0);
  window.dispatchEvent(new Event("resize"));
  expect((screen.getByLabelText("Number format") as HTMLSelectElement).value).toBe("de-DE");
  expect(chartBuildCalls).toHaveLength(0);
  expect(chartBuildLocales).toHaveLength(0);
});

it("reformats stale last-valid surfaces without calculation, selection, currency, or timer changes", () => {
  vi.useFakeTimers();
  setup(true);
  fireEvent.click(compositionButtons()[1]!);
  fireEvent.click(annualButtons()[1]!);
  replace(/Starting balance/i, "");
  expect(screen.getByText("Results reflect the last valid calculation.")).toBeTruthy();
  const selectionBefore = screen.getByTestId("workspace-chart-selection").textContent;
  const currencyBefore = (screen.getByLabelText(/Currency/i) as HTMLSelectElement).value;
  const finalBefore = screen.getByText("Final balance").nextElementSibling?.textContent;
  const timersBefore = vi.getTimerCount();
  evaluateCalls.splice(0);
  chartBuildCalls.splice(0);
  fireEvent.change(screen.getByLabelText("Number format"), { target: { value: "de-DE" } });
  expect(screen.getByText("Results reflect the last valid calculation.")).toBeTruthy();
  expect(screen.getByText("Final balance").nextElementSibling?.textContent).not.toBe(finalBefore);
  expect(screen.getByTestId("workspace-chart-selection").textContent).toBe(selectionBefore);
  expect((screen.getByLabelText(/Currency/i) as HTMLSelectElement).value).toBe(currencyBefore);
  expect(evaluateCalls).toHaveLength(0);
  expect(chartBuildCalls).toHaveLength(1);
  expect(vi.getTimerCount()).toBe(timersBefore);
});

function replace(label: RegExp, value: string) {
  const input = screen.getByRole("textbox", { name: label });
  fireEvent.change(input, { target: { value } });
  return input;
}

function compositionButtons() {
  return within(screen.getByRole("list", { name: "Balance composition values" })).getAllByRole("button");
}

function annualButtons() {
  return within(screen.getByRole("list", { name: "Annual ending balance values" })).getAllByRole("button");
}

function annualSelectedValue() {
  const figure = screen.getByRole("group", { name: "Annual ending balance" }).closest("figure");
  const carrier = figure?.querySelector("p.chart-selected");
  if (!(carrier instanceof HTMLParagraphElement)) throw new Error("expected visible annual selected-value carrier");
  return carrier;
}

function compositionSelectedValue() {
  const figure = screen.getByRole("group", { name: "Balance composition" }).closest("figure");
  const carrier = figure?.querySelector("p.chart-selected");
  if (!(carrier instanceof HTMLParagraphElement)) throw new Error("expected visible composition selected-value carrier");
  return carrier;
}

function chartSvg(name: "Balance composition" | "Annual ending balance") {
  return within(screen.getByRole("group", { name })).getByRole("img") as unknown as SVGSVGElement;
}

function mockChartGeometry(svg: SVGSVGElement) {
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

function hoverAt(svg: SVGSVGElement, x: number, y: number) {
  const event = new MouseEvent("pointermove", {
    bubbles: true,
    cancelable: true,
    clientX: 100 + x * 2,
    clientY: 50 + y * 2,
  });
  Object.defineProperty(event, "pointerType", { value: "mouse" });
  fireEvent(svg, event);
}

function pointerUpAt(svg: SVGSVGElement, pointerType: "mouse" | "touch", x: number, y: number) {
  const event = new MouseEvent("pointerup", {
    bubbles: true,
    cancelable: true,
    clientX: 100 + x * 2,
    clientY: 50 + y * 2,
  });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(svg, event);
}

function announcementCarrier() {
  const carriers = screen.getAllByRole("status");
  if (carriers.length !== 1 || !(carriers[0] instanceof HTMLParagraphElement)) {
    throw new Error("expected one stable chart announcement carrier");
  }
  return carriers[0];
}

function observeAnnouncement(carrier: HTMLElement) {
  const transitions: string[] = [];
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((batch) => {
    records.push(...batch);
    for (const record of batch) {
      transitions.push(record.type === "characterData"
        ? (record.target as CharacterData).data
        : carrier.textContent ?? "");
    }
  });
  observer.observe(carrier, {
    childList: true,
    characterData: true,
    characterDataOldValue: true,
    subtree: true,
  });
  return { observer, records, transitions };
}

async function flushAnnouncementObserver() {
  await Promise.resolve();
}

function announcementSnapshot() {
  return [...document.querySelectorAll('[role="status"], [aria-live]')].map((carrier) => carrier.outerHTML);
}

function expectOneStableAnnouncement(
  observed: ReturnType<typeof observeAnnouncement>,
  text: Text,
  oldValue: string,
  finalValue: string,
) {
  expect(observed.records).toHaveLength(1);
  expect(observed.records[0]?.type).toBe("characterData");
  expect(observed.records[0]?.target).toBe(text);
  expect(observed.records[0]?.oldValue).toBe(oldValue);
  expect(observed.transitions).toEqual([finalValue]);
  expect(observed.transitions).not.toContain("");
}

function expectUnpollutedCarrier(carrier: HTMLParagraphElement, text: Text, message: string) {
  expect(announcementCarrier()).toBe(carrier);
  expect(carrier.textContent).toBe(message);
  expect(carrier.childNodes).toHaveLength(1);
  expect(carrier.firstChild).toBe(text);
  expect(text.data).toBe(message);
  expect([...carrier.attributes].map(({ name, value }) => [name, value])).toEqual([
    ["class", "sr-only"],
    ["role", "status"],
    ["aria-atomic", "true"],
  ]);
  expect(document.querySelectorAll('[role="status"], [aria-live]')).toHaveLength(1);
}

describe("CalculatorWorkspace behavior", () => {
  beforeEach(() => {
    evaluateCalls.splice(0);
    chartBuildCalls.splice(0);
    chartBuildControl.failNext = false;
    chartBuildControl.nextInitial = null;
    if (window.CSS === undefined) {
      Object.defineProperty(window, "CSS", {
        configurable: true,
        value: { escape: (value: string) => value },
      });
    }
  });

  afterEach(() => {
    cleanup();
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  it("calculates defaults once and does not recalculate on rerender", () => {
    const { rerender } = setup();
    expect(evaluateCalls).toHaveLength(1);
    rerender(<CalculatorWorkspace />);
    expect(evaluateCalls).toHaveLength(1);
  });

  it("I08.R001/R002 initializes committed composition at Ending and annual selection at the final point", () => {
    setup();
    const composition = compositionButtons();
    const annual = annualButtons();
    expect(composition[4]?.getAttribute("aria-current")).toBe("true");
    expect(composition.slice(0, 4).every((button) => button.getAttribute("aria-current") !== "true")).toBe(true);
    expect(annual.at(-1)?.getAttribute("aria-current")).toBe("true");
    expect(annual.slice(0, -1).every((button) => button.getAttribute("aria-current") !== "true")).toBe(true);
  });

  it("I08 authority chain consumes successful builder initialSelections without reconstructing indexes", () => {
    chartBuildControl.nextInitial = { composition: 1, annual: 2 };
    setup();
    expect(compositionButtons()[1]?.getAttribute("aria-current")).toBe("true");
    expect(annualButtons()[2]?.getAttribute("aria-current")).toBe("true");
    expect(screen.getByTestId("workspace-chart-selection").textContent)
      .toBe(JSON.stringify({ composition: 1, annual: 2 }));
  });

  it("I02.R010/I10.R002 keeps keyboard selection in Workspace across an ordinary rerender without calculation", () => {
    const { rerender } = setup();
    evaluateCalls.splice(0);
    fireEvent.keyDown(screen.getByRole("group", { name: "Balance composition" }), { key: "Home" });
    fireEvent.keyDown(screen.getByRole("group", { name: "Annual ending balance" }), { key: "Home" });
    expect(compositionButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(annualButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(evaluateCalls).toHaveLength(0);

    rerender(<CalculatorWorkspace />);
    expect(compositionButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(annualButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(evaluateCalls).toHaveLength(0);
  });

  it("I10.R001 preserves committed selection for an invalid draft and performs no calculation", () => {
    vi.useFakeTimers();
    setup(true);
    fireEvent.keyDown(screen.getByRole("group", { name: "Balance composition" }), { key: "Home" });
    fireEvent.keyDown(screen.getByRole("group", { name: "Annual ending balance" }), { key: "Home" });
    expect(compositionButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(annualButtons()[0]?.getAttribute("aria-current")).toBe("true");
    evaluateCalls.splice(0);

    replace(/Starting balance/i, "bad");
    act(() => vi.advanceTimersByTime(500));
    expect(compositionButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(annualButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(evaluateCalls).toHaveLength(0);
  });

  it("preserves Workspace committed selection when a new calculator result cannot build chart models", () => {
    vi.useFakeTimers();
    setup(true);
    fireEvent.keyDown(screen.getByRole("group", { name: "Balance composition" }), { key: "ArrowLeft" });
    fireEvent.keyDown(screen.getByRole("group", { name: "Annual ending balance" }), { key: "Home" });
    const preserved = JSON.stringify({ composition: 3, annual: 0 });
    expect(screen.getByTestId("workspace-chart-selection").textContent).toBe(preserved);
    evaluateCalls.splice(0);

    chartBuildControl.failNext = true;
    replace(/Starting balance/i, "12000");
    act(() => vi.advanceTimersByTime(300));
    expect(evaluateCalls).toHaveLength(1);
    expect(screen.queryByRole("list", { name: "Balance composition values" })).toBeNull();
    expect(screen.getByTestId("workspace-chart-selection").textContent).toBe(preserved);
  });

  it("I11.R001/R005 resets a new accepted result to Ending and preserves it on ordinary rerender", () => {
    vi.useFakeTimers();
    const { rerender } = setup(true);
    fireEvent.keyDown(screen.getByRole("group", { name: "Balance composition" }), { key: "Home" });
    expect(compositionButtons()[0]?.getAttribute("aria-current")).toBe("true");
    evaluateCalls.splice(0);

    replace(/Starting balance/i, "12000");
    act(() => vi.advanceTimersByTime(300));
    expect(evaluateCalls).toHaveLength(1);
    expect(compositionButtons()[4]?.getAttribute("aria-current")).toBe("true");

    rerender(<CalculatorWorkspace />);
    expect(compositionButtons()[4]?.getAttribute("aria-current")).toBe("true");
    expect(evaluateCalls).toHaveLength(1);
  });

  it("I11.R003 updates the dedicated visible selected-value carrier to Ending for a new accepted result", () => {
    vi.useFakeTimers();
    const { rerender } = setup(true);
    const selectedValue = () => {
      const figure = screen.getByRole("group", { name: "Balance composition" }).closest("figure");
      const carrier = figure?.querySelector("p.chart-selected");
      if (!(carrier instanceof HTMLParagraphElement)) throw new Error("expected visible composition selected-value carrier");
      return carrier;
    };

    fireEvent.keyDown(screen.getByRole("group", { name: "Balance composition" }), { key: "Home" });
    expect(selectedValue().textContent).toMatch(/^Starting balance:/);
    evaluateCalls.splice(0);

    replace(/Starting balance/i, "12000");
    act(() => vi.advanceTimersByTime(300));
    expect(evaluateCalls).toHaveLength(1);
    expect(selectedValue().textContent).toMatch(/^Ending balance:/);

    rerender(<CalculatorWorkspace />);
    expect(selectedValue().textContent).toMatch(/^Ending balance:/);
    expect(evaluateCalls).toHaveLength(1);
  });

  it("I11.R002 clears composition hover preview synchronously for a newly accepted result and stays silent", () => {
    setup();
    const compositionSvg = chartSvg("Balance composition");
    mockChartGeometry(compositionSvg);
    const announcements = announcementSnapshot();
    const committedBefore = screen.getByTestId("workspace-chart-selection").textContent;
    hoverAt(compositionSvg, 52, 80);
    expect(compositionSelectedValue().textContent).toMatch(/^Starting balance:/);
    expect(screen.getByTestId("workspace-chart-selection").textContent).toBe(committedBefore);
    expect(announcementSnapshot()).toEqual(announcements);
    evaluateCalls.splice(0);

    replace(/Starting balance/i, "12000");
    fireEvent.click(screen.getByRole("button", { name: "Recalculate" }));

    expect(evaluateCalls).toHaveLength(1);
    expect(compositionButtons()[4]?.getAttribute("aria-current")).toBe("true");
    expect(compositionSelectedValue().textContent).toBe(compositionButtons()[4]?.textContent);
    expect(compositionSelectedValue().textContent).toMatch(/^Ending balance:/);
    expect(announcementSnapshot()).toEqual(announcements);
  });

  it("I11 new-result path consumes that successful builder's initialSelections and preserves them on rerender", () => {
    vi.useFakeTimers();
    const { rerender } = setup(true);
    fireEvent.keyDown(screen.getByRole("group", { name: "Balance composition" }), { key: "Home" });
    fireEvent.keyDown(screen.getByRole("group", { name: "Annual ending balance" }), { key: "Home" });
    expect(compositionButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(annualButtons()[0]?.getAttribute("aria-current")).toBe("true");
    evaluateCalls.splice(0);

    chartBuildControl.nextInitial = { composition: 2, annual: 3 };
    replace(/Starting balance/i, "12000");
    act(() => vi.advanceTimersByTime(300));

    expect(evaluateCalls).toHaveLength(1);
    expect(compositionButtons()[2]?.getAttribute("aria-current")).toBe("true");
    expect(annualButtons()[3]?.getAttribute("aria-current")).toBe("true");
    expect(screen.getByTestId("workspace-chart-selection").textContent)
      .toBe(JSON.stringify({ composition: 2, annual: 3 }));

    rerender(<CalculatorWorkspace />);
    expect(compositionButtons()[2]?.getAttribute("aria-current")).toBe("true");
    expect(annualButtons()[3]?.getAttribute("aria-current")).toBe("true");
    expect(evaluateCalls).toHaveLength(1);
  });

  it("I09.R001 resets an accepted annual result from 100 points to its single point at index 0", () => {
    setup();
    replace(/Investment length/i, "1200");
    fireEvent.click(screen.getByRole("button", { name: "Recalculate" }));
    expect(annualButtons()).toHaveLength(100);

    const annualSurface = screen.getByRole("group", { name: "Annual ending balance" });
    fireEvent.keyDown(annualSurface, { key: "Home" });
    fireEvent.keyDown(annualSurface, { key: "End" });
    expect(annualButtons()[99]?.getAttribute("aria-current")).toBe("true");
    const oldSelectedText = annualSelectedValue().textContent;
    expect(oldSelectedText).toMatch(/^Year 100:/);
    evaluateCalls.splice(0);

    replace(/Investment length/i, "12");
    fireEvent.click(screen.getByRole("button", { name: "Recalculate" }));

    const singlePoint = annualButtons();
    expect(evaluateCalls).toHaveLength(1);
    expect(singlePoint).toHaveLength(1);
    expect(singlePoint[0]?.getAttribute("aria-current")).toBe("true");
    expect(screen.getByTestId("workspace-chart-selection").textContent)
      .toBe(JSON.stringify({ composition: 4, annual: 0 }));
    expect(annualSelectedValue().textContent).toBe(singlePoint[0]?.textContent);
    expect(annualSelectedValue().textContent).toMatch(/^Year 1:/);
    expect(annualSelectedValue().textContent).not.toBe(oldSelectedText);
  });

  it("I09.R003 resets an accepted annual result from 1 point to the actual final point at index 99", () => {
    setup();
    replace(/Investment length/i, "12");
    fireEvent.click(screen.getByRole("button", { name: "Recalculate" }));
    expect(annualButtons()).toHaveLength(1);

    fireEvent.keyDown(screen.getByRole("group", { name: "Annual ending balance" }), { key: "Home" });
    expect(annualButtons()[0]?.getAttribute("aria-current")).toBe("true");
    const oldSelectedText = annualSelectedValue().textContent;
    expect(oldSelectedText).toMatch(/^Year 1:/);
    evaluateCalls.splice(0);

    replace(/Investment length/i, "1200");
    fireEvent.click(screen.getByRole("button", { name: "Recalculate" }));

    const hundredPoints = annualButtons();
    expect(evaluateCalls).toHaveLength(1);
    expect(hundredPoints).toHaveLength(100);
    expect(hundredPoints[0]?.getAttribute("aria-current")).not.toBe("true");
    expect(hundredPoints[99]?.getAttribute("aria-current")).toBe("true");
    expect(screen.getByTestId("workspace-chart-selection").textContent)
      .toBe(JSON.stringify({ composition: 4, annual: 99 }));
    expect(annualSelectedValue().textContent).toBe(hundredPoints[99]?.textContent);
    expect(annualSelectedValue().textContent).toMatch(/^Year 100:/);
    expect(annualSelectedValue().textContent).not.toBe(oldSelectedText);
  });

  it("I09.R006 displays the newly accepted result's final annual item instead of stale selected content", () => {
    setup();
    const annualSurface = screen.getByRole("group", { name: "Annual ending balance" });
    fireEvent.keyDown(annualSurface, { key: "Home" });
    expect(annualButtons()[0]?.getAttribute("aria-current")).toBe("true");
    const oldSelectedText = annualSelectedValue().textContent;
    expect(oldSelectedText).toMatch(/^Year 1:/);
    evaluateCalls.splice(0);

    replace(/Starting balance/i, "12000");
    fireEvent.click(screen.getByRole("button", { name: "Recalculate" }));

    const newAnnualPoints = annualButtons();
    const newFinalIndex = newAnnualPoints.length - 1;
    expect(evaluateCalls).toHaveLength(1);
    expect(newAnnualPoints).toHaveLength(10);
    expect(newAnnualPoints[0]?.getAttribute("aria-current")).not.toBe("true");
    expect(newAnnualPoints[newFinalIndex]?.getAttribute("aria-current")).toBe("true");
    expect(annualSelectedValue().textContent).toBe(newAnnualPoints[newFinalIndex]?.textContent);
    expect(annualSelectedValue().textContent).toMatch(/^Year 10:/);
    expect(annualSelectedValue().textContent).not.toBe(oldSelectedText);
  });

  it("I09.R005 clears annual hover preview synchronously for a newly accepted result and stays silent", () => {
    setup();
    const annualSvg = chartSvg("Annual ending balance");
    mockChartGeometry(annualSvg);
    const announcements = announcementSnapshot();
    const committedBefore = screen.getByTestId("workspace-chart-selection").textContent;
    hoverAt(annualSvg, 30, 90);
    expect(annualSelectedValue().textContent).toMatch(/^Year 1:/);
    expect(screen.getByTestId("workspace-chart-selection").textContent).toBe(committedBefore);
    expect(announcementSnapshot()).toEqual(announcements);
    evaluateCalls.splice(0);

    replace(/Starting balance/i, "12000");
    fireEvent.click(screen.getByRole("button", { name: "Recalculate" }));

    const finalIndex = annualButtons().length - 1;
    expect(evaluateCalls).toHaveLength(1);
    expect(annualButtons()[finalIndex]?.getAttribute("aria-current")).toBe("true");
    expect(annualSelectedValue().textContent).toBe(annualButtons()[finalIndex]?.textContent);
    expect(annualSelectedValue().textContent).toMatch(/^Year 10:/);
    expect(announcementSnapshot()).toEqual(announcements);
  });

  it("I07.R001 announces each changed keyboard commitment exactly once and keeps same-index boundaries silent", async () => {
    setup();
    const carrier = announcementCarrier();
    expect(carrier.textContent).toBe("");
    expect(carrier.classList.contains("sr-only")).toBe(true);
    expect(carrier.getAttribute("role")).toBe("status");
    expect(carrier.getAttribute("aria-live")).toBeNull();
    expect(carrier.getAttribute("aria-atomic")).toBe("true");
    expect(carrier.getAttribute("aria-hidden")).toBeNull();
    expect(carrier.getAttribute("style")).toBeNull();
    const observed = observeAnnouncement(carrier);
    const url = window.location.href;
    evaluateCalls.splice(0);

    const composition = screen.getByRole("group", { name: "Balance composition" });
    composition.focus();
    const starting = compositionButtons()[0]!.textContent!;
    fireEvent.keyDown(composition, { key: "Home" });
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([starting]);
    expect(carrier.textContent).toBe(starting);
    expect(compositionButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(document.activeElement).toBe(composition);
    expect(screen.getAllByRole("status")).toEqual([carrier]);

    observed.transitions.splice(0);
    observed.records.splice(0);
    fireEvent.keyDown(composition, { key: "Home" });
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);

    const annual = screen.getByRole("group", { name: "Annual ending balance" });
    annual.focus();
    const yearOne = annualButtons()[0]!.textContent!;
    fireEvent.keyDown(annual, { key: "Home" });
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([yearOne]);
    expect(carrier.textContent).toBe(yearOne);
    expect(document.activeElement).toBe(annual);

    observed.transitions.splice(0);
    observed.records.splice(0);
    const ending = compositionButtons()[4]!.textContent!;
    fireEvent.keyDown(composition, { key: "End" });
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([ending]);
    expect(carrier.textContent).toBe(ending);
    expect(evaluateCalls).toHaveLength(0);
    expect(window.location.href).toBe(url);
    observed.observer.disconnect();
  });

  it("I07.R002 announces changed mouse commitments once after silent hover and keeps same/outside actions silent", async () => {
    setup();
    const carrier = announcementCarrier();
    const observed = observeAnnouncement(carrier);
    const compositionSvg = chartSvg("Balance composition");
    const annualSvg = chartSvg("Annual ending balance");
    mockChartGeometry(compositionSvg);
    mockChartGeometry(annualSvg);
    const url = window.location.href;
    const focus = document.activeElement;
    evaluateCalls.splice(0);

    hoverAt(compositionSvg, 147, 80);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);
    const contributions = compositionButtons()[1]!.textContent!;
    pointerUpAt(compositionSvg, "mouse", 147, 80);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([contributions]);
    expect(carrier.textContent).toBe(contributions);
    expect(compositionButtons()[1]?.getAttribute("aria-current")).toBe("true");

    observed.transitions.splice(0);
    observed.records.splice(0);
    pointerUpAt(compositionSvg, "mouse", 147, 80);
    pointerUpAt(compositionSvg, "mouse", 19, 80);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);

    hoverAt(annualSvg, 127.78, 90);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);
    const annualValue = annualButtons()[2]!.textContent!;
    pointerUpAt(annualSvg, "mouse", 127.78, 90);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([annualValue]);
    expect(carrier.textContent).toBe(annualValue);
    expect(annualButtons()[2]?.getAttribute("aria-current")).toBe("true");
    expect(screen.getAllByRole("status")).toEqual([carrier]);
    expect(evaluateCalls).toHaveLength(0);
    expect(window.location.href).toBe(url);
    expect(document.activeElement).toBe(focus);
    observed.observer.disconnect();
  });

  it("I07.R003 announces changed touch commitments once without preview and keeps same/outside taps silent", async () => {
    setup();
    const carrier = announcementCarrier();
    const observed = observeAnnouncement(carrier);
    const compositionSvg = chartSvg("Balance composition");
    const annualSvg = chartSvg("Annual ending balance");
    mockChartGeometry(compositionSvg);
    mockChartGeometry(annualSvg);
    const url = window.location.href;
    const focus = document.activeElement;
    evaluateCalls.splice(0);

    const touchMove = new MouseEvent("pointermove", { bubbles: true, clientX: 100 + 242 * 2, clientY: 50 + 80 * 2 });
    Object.defineProperty(touchMove, "pointerType", { value: "touch" });
    fireEvent(compositionSvg, touchMove);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);
    expect(compositionSelectedValue().textContent).toMatch(/^Ending balance:/);

    const grossGrowth = compositionButtons()[2]!.textContent!;
    pointerUpAt(compositionSvg, "touch", 242, 80);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([grossGrowth]);
    expect(carrier.textContent).toBe(grossGrowth);
    expect(compositionSelectedValue().textContent).toBe(grossGrowth);

    observed.transitions.splice(0);
    observed.records.splice(0);
    pointerUpAt(compositionSvg, "touch", 242, 80);
    pointerUpAt(compositionSvg, "touch", 465, 80);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);

    const annualValue = annualButtons()[3]!.textContent!;
    pointerUpAt(annualSvg, "touch", 176.67, 90);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([annualValue]);
    expect(carrier.textContent).toBe(annualValue);
    expect(annualSelectedValue().textContent).toBe(annualValue);
    expect(screen.getAllByRole("status")).toEqual([carrier]);
    expect(evaluateCalls).toHaveLength(0);
    expect(window.location.href).toBe(url);
    expect(document.activeElement).toBe(focus);
    observed.observer.disconnect();
  });

  it("I07.R003 commits an AT-focused annual-value button once and deduplicates its following activation", async () => {
    setup();
    const carrier = announcementCarrier();
    const observed = observeAnnouncement(carrier);
    const target = annualButtons()[4]!;
    const message = target.textContent!;
    evaluateCalls.splice(0);

    target.focus();
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([message]);
    expect(carrier.textContent).toBe(message);
    expect(target.getAttribute("aria-current")).toBe("true");

    observed.transitions.splice(0);
    observed.records.splice(0);
    fireEvent.click(target);
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);
    expect(evaluateCalls).toHaveLength(0);
    observed.observer.disconnect();
  });

  it("I07.R001 S-R1 reannounces an identical composition label once after a silent Reset using keyboard", async () => {
    setup();
    const carrier = announcementCarrier();
    const text = carrier.firstChild;
    if (!(text instanceof Text)) throw new Error("expected the stable announcement text node");
    const composition = screen.getByRole("group", { name: "Balance composition" });
    const messageA = compositionButtons()[0]!.textContent!;
    const url = window.location.href;
    composition.focus();
    const first = observeAnnouncement(carrier);
    evaluateCalls.splice(0);
    chartBuildCalls.splice(0);

    fireEvent.keyDown(composition, { key: "Home" });
    await flushAnnouncementObserver();
    expectOneStableAnnouncement(first, text, "", messageA);
    expect(compositionButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(document.activeElement).toBe(composition);
    expect(evaluateCalls).toHaveLength(0);
    expect(chartBuildCalls).toHaveLength(0);
    first.observer.disconnect();

    const programmatic = observeAnnouncement(carrier);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await flushAnnouncementObserver();
    expect(programmatic.records).toEqual([]);
    expect(programmatic.transitions).toEqual([]);
    expect(compositionButtons()[4]?.getAttribute("aria-current")).toBe("true");
    expect(compositionButtons()[0]?.getAttribute("aria-current")).not.toBe("true");
    expectUnpollutedCarrier(carrier, text, messageA);
    programmatic.observer.disconnect();

    composition.focus();
    const repeated = observeAnnouncement(carrier);
    evaluateCalls.splice(0);
    chartBuildCalls.splice(0);
    fireEvent.keyDown(composition, { key: "Home" });
    await flushAnnouncementObserver();
    expectOneStableAnnouncement(repeated, text, messageA, messageA);
    expect(compositionButtons()[0]?.getAttribute("aria-current")).toBe("true");
    expect(document.activeElement).toBe(composition);
    expectUnpollutedCarrier(carrier, text, messageA);
    expect(evaluateCalls).toHaveLength(0);
    expect(chartBuildCalls).toHaveLength(0);
    expect(window.location.href).toBe(url);

    repeated.records.splice(0);
    repeated.transitions.splice(0);
    fireEvent.keyDown(composition, { key: "Home" });
    await flushAnnouncementObserver();
    expect(repeated.records).toEqual([]);
    expect(repeated.transitions).toEqual([]);
    repeated.observer.disconnect();
  });

  it("I07.R002 S-R1 reannounces an identical annual label once after silent hover and Reset using mouse", async () => {
    setup();
    const carrier = announcementCarrier();
    const text = carrier.firstChild;
    if (!(text instanceof Text)) throw new Error("expected the stable announcement text node");
    const annualSvg = chartSvg("Annual ending balance");
    mockChartGeometry(annualSvg);
    const messageA = annualButtons()[2]!.textContent!;
    const url = window.location.href;
    const focus = document.activeElement;
    const first = observeAnnouncement(carrier);
    evaluateCalls.splice(0);
    chartBuildCalls.splice(0);

    hoverAt(annualSvg, 127.78, 90);
    await flushAnnouncementObserver();
    expect(first.records).toEqual([]);
    pointerUpAt(annualSvg, "mouse", 127.78, 90);
    await flushAnnouncementObserver();
    expectOneStableAnnouncement(first, text, "", messageA);
    expect(annualButtons()[2]?.getAttribute("aria-current")).toBe("true");
    expect(document.activeElement).toBe(focus);
    expect(evaluateCalls).toHaveLength(0);
    expect(chartBuildCalls).toHaveLength(0);
    first.observer.disconnect();

    const programmatic = observeAnnouncement(carrier);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await flushAnnouncementObserver();
    expect(programmatic.records).toEqual([]);
    expect(annualButtons().at(-1)?.getAttribute("aria-current")).toBe("true");
    expect(annualButtons()[2]?.getAttribute("aria-current")).not.toBe("true");
    expectUnpollutedCarrier(carrier, text, messageA);
    programmatic.observer.disconnect();

    const repeated = observeAnnouncement(carrier);
    evaluateCalls.splice(0);
    chartBuildCalls.splice(0);
    hoverAt(annualSvg, 127.78, 90);
    await flushAnnouncementObserver();
    expect(repeated.records).toEqual([]);
    pointerUpAt(annualSvg, "mouse", 127.78, 90);
    await flushAnnouncementObserver();
    expectOneStableAnnouncement(repeated, text, messageA, messageA);
    expect(annualButtons()[2]?.getAttribute("aria-current")).toBe("true");
    expectUnpollutedCarrier(carrier, text, messageA);
    expect(document.activeElement).toBe(focus);
    expect(evaluateCalls).toHaveLength(0);
    expect(chartBuildCalls).toHaveLength(0);
    expect(window.location.href).toBe(url);

    repeated.records.splice(0);
    repeated.transitions.splice(0);
    pointerUpAt(annualSvg, "mouse", 127.78, 90);
    await flushAnnouncementObserver();
    expect(repeated.records).toEqual([]);
    expect(repeated.transitions).toEqual([]);
    repeated.observer.disconnect();
  });

  it("I07.R003 S-R1 reannounces an identical composition label once after silent touch movement and Reset", async () => {
    setup();
    const carrier = announcementCarrier();
    const text = carrier.firstChild;
    if (!(text instanceof Text)) throw new Error("expected the stable announcement text node");
    const compositionSvg = chartSvg("Balance composition");
    mockChartGeometry(compositionSvg);
    const messageA = compositionButtons()[2]!.textContent!;
    const url = window.location.href;
    const focus = document.activeElement;
    const touchMove = () => {
      const event = new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 100 + 242 * 2,
        clientY: 50 + 80 * 2,
      });
      Object.defineProperty(event, "pointerType", { value: "touch" });
      fireEvent(compositionSvg, event);
    };
    const first = observeAnnouncement(carrier);
    evaluateCalls.splice(0);
    chartBuildCalls.splice(0);

    touchMove();
    await flushAnnouncementObserver();
    expect(first.records).toEqual([]);
    pointerUpAt(compositionSvg, "touch", 242, 80);
    await flushAnnouncementObserver();
    expectOneStableAnnouncement(first, text, "", messageA);
    expect(compositionButtons()[2]?.getAttribute("aria-current")).toBe("true");
    expect(document.activeElement).toBe(focus);
    expect(evaluateCalls).toHaveLength(0);
    expect(chartBuildCalls).toHaveLength(0);
    first.observer.disconnect();

    const programmatic = observeAnnouncement(carrier);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await flushAnnouncementObserver();
    expect(programmatic.records).toEqual([]);
    expect(compositionButtons()[4]?.getAttribute("aria-current")).toBe("true");
    expect(compositionButtons()[2]?.getAttribute("aria-current")).not.toBe("true");
    expectUnpollutedCarrier(carrier, text, messageA);
    programmatic.observer.disconnect();

    const repeated = observeAnnouncement(carrier);
    evaluateCalls.splice(0);
    chartBuildCalls.splice(0);
    touchMove();
    await flushAnnouncementObserver();
    expect(repeated.records).toEqual([]);
    pointerUpAt(compositionSvg, "touch", 242, 80);
    await flushAnnouncementObserver();
    expectOneStableAnnouncement(repeated, text, messageA, messageA);
    expect(compositionButtons()[2]?.getAttribute("aria-current")).toBe("true");
    expectUnpollutedCarrier(carrier, text, messageA);
    expect(document.activeElement).toBe(focus);
    expect(evaluateCalls).toHaveLength(0);
    expect(chartBuildCalls).toHaveLength(0);
    expect(window.location.href).toBe(url);

    repeated.records.splice(0);
    repeated.transitions.splice(0);
    pointerUpAt(compositionSvg, "touch", 242, 80);
    await flushAnnouncementObserver();
    expect(repeated.records).toEqual([]);
    expect(repeated.transitions).toEqual([]);
    repeated.observer.disconnect();
  });

  it("preserves the stable announcement unchanged for hover, leave, stale drafts, accepted results, and reset", async () => {
    vi.useFakeTimers();
    setup(true);
    const carrier = announcementCarrier();
    const composition = screen.getByRole("group", { name: "Balance composition" });
    fireEvent.keyDown(composition, { key: "Home" });
    await flushAnnouncementObserver();
    const committedAnnouncement = carrier.textContent;
    expect(committedAnnouncement).toMatch(/^Starting balance:/);
    const observed = observeAnnouncement(carrier);
    const compositionSvg = chartSvg("Balance composition");
    mockChartGeometry(compositionSvg);

    hoverAt(compositionSvg, 242, 80);
    fireEvent.pointerLeave(compositionSvg, { pointerType: "mouse" });
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);
    expect(carrier.textContent).toBe(committedAnnouncement);

    replace(/Starting balance/i, "bad");
    act(() => vi.advanceTimersByTime(500));
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);
    expect(carrier.textContent).toBe(committedAnnouncement);

    replace(/Starting balance/i, "12000");
    act(() => vi.advanceTimersByTime(300));
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);
    expect(carrier.textContent).toBe(committedAnnouncement);
    expect(screen.getAllByRole("status")).toEqual([carrier]);

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await flushAnnouncementObserver();
    expect(observed.transitions).toEqual([]);
    expect(carrier.textContent).toBe(committedAnnouncement);
    expect(screen.getAllByRole("status")).toEqual([carrier]);
    observed.observer.disconnect();
  });

  it("debounces valid edits at 300ms and evaluates only the final draft", () => {
    vi.useFakeTimers();
    setup(true);
    evaluateCalls.splice(0);
    replace(/Starting balance/i, "12000");
    replace(/Starting balance/i, "13000");
    expect(evaluateCalls).toHaveLength(0);
    act(() => vi.advanceTimersByTime(299));
    expect(evaluateCalls).toHaveLength(0);
    act(() => vi.advanceTimersByTime(1));
    expect(evaluateCalls).toHaveLength(1);
    expect(evaluateCalls[0]?.initialPrincipal).toBe(13000);
  });

  it("submits valid input immediately and cancels the pending debounce", async () => {
    vi.useFakeTimers();
    setup(true);
    evaluateCalls.splice(0);
    replace(/Starting balance/i, "12000");
    fireEvent.click(screen.getByRole("button", { name: /Recalculate/i }));
    expect(evaluateCalls).toHaveLength(1);
    act(() => vi.advanceTimersByTime(300));
    expect(evaluateCalls).toHaveLength(1);
  });

  it("keeps old results stale for invalid edits, reveals one error on blur, and never evaluates", async () => {
    vi.useFakeTimers();
    setup(true);
    const summaryLabels = ["Final balance", "Total contributions", "Gross growth", "Total fees", "Nominal investment gain", "Inflation-adjusted ending balance"];
    const summary = document.querySelector('dl[aria-label="Calculation results"]');
    if (!summary) throw new Error("Calculation results summary was not rendered");
    const summaryValue = (label: string) => within(summary).getByText(label).nextElementSibling?.textContent;
    const oldSummary = summaryLabels.map(summaryValue);
    const oldTable = screen.getByRole("table").textContent;
    evaluateCalls.splice(0);
    const principal = replace(/Starting balance/i, "bad");
    const staleNotice = screen.getByText("Results reflect the last valid calculation.");
    expect(staleNotice.getAttribute("role")).toBeNull();
    expect(staleNotice.getAttribute("aria-live")).toBeNull();
    expect(screen.queryByText(/Enter a finite amount\/percentage/i)).toBeNull();
    fireEvent.blur(principal);
    expect(principal.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText(/Enter a finite amount\/percentage/i)).not.toBeNull();
    expect(summaryLabels.map(summaryValue)).toEqual(oldSummary);
    expect(screen.getByRole("table").textContent).toBe(oldTable);
    expect(screen.getByText("Amounts shown in USD.")).toBeTruthy();
    expect(screen.getByRole("region", { name: /Annual calculation detail/i }).getAttribute("data-stale")).toBe("true");
    expect(announcementCarrier().textContent).toBe("");
    expect(document.querySelector("[aria-live]")).toBeNull();
    act(() => vi.advanceTimersByTime(500));
    expect(evaluateCalls).toHaveLength(0);
  });

  it("invalid submit cancels pending work, lists every error, and refocuses on repeat", async () => {
    vi.useFakeTimers();
    setup(true);
    evaluateCalls.splice(0);
    replace(/Starting balance/i, "");
    replace(/Regular contribution/i, "$");
    fireEvent.click(screen.getByRole("button", { name: /Recalculate/i }));
    const alert = screen.getByRole("alert");
    expect(within(alert).getAllByRole("link")).toHaveLength(2);
    expect(document.activeElement).toBe(alert);
    screen.getByRole("button", { name: /Reset/i }).focus();
    fireEvent.click(screen.getByRole("button", { name: /Recalculate/i }));
    expect(document.activeElement).toBe(alert);
    act(() => vi.advanceTimersByTime(500));
    expect(evaluateCalls).toHaveLength(0);
  });

  it("binds stale results to the last valid currency and clears stale after a valid calculation", async () => {
    vi.useFakeTimers();
    setup(true);
    expect(screen.getByText("Final balance").nextElementSibling?.textContent).toContain("$");
    expect(screen.getByRole("table").getAttribute("aria-describedby")).toBe("annual-table-currency");
    fireEvent.change(screen.getByLabelText(/Currency/i), { target: { value: "EUR" } });
    replace(/Starting balance/i, "bad");
    expect(screen.getByText("Final balance").nextElementSibling?.textContent).toContain("$");
    expect(screen.getByText("Amounts shown in USD.")).toBeTruthy();
    expect(screen.getByRole("region", { name: /Annual calculation detail/i }).getAttribute("data-stale")).toBe("true");
    const staleNotice = screen.getByText("Results reflect the last valid calculation.");
    expect(staleNotice.getAttribute("role")).toBeNull();
    expect(staleNotice.getAttribute("aria-live")).toBeNull();
    expect(announcementCarrier().textContent).toBe("");
    replace(/Starting balance/i, "12000");
    act(() => vi.advanceTimersByTime(300));
    expect(announcementCarrier().textContent).toBe("");
    expect(screen.queryByText("Results reflect the last valid calculation.")).toBeNull();
    expect(screen.getByText("Final balance").nextElementSibling?.textContent).toContain("€");
    expect(screen.getByText("Amounts shown in EUR.")).toBeTruthy();
    expect(screen.getByRole("region", { name: /Annual calculation detail/i }).getAttribute("data-stale")).toBeNull();
  });

  it("resets all ten defaults and calculates exactly once", async () => {
    const { user } = setup();
    replace(/Starting balance/i, "12000");
    await user.selectOptions(screen.getByLabelText(/Currency/i), "EUR");
    evaluateCalls.splice(0);
    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
    expect(evaluateCalls).toHaveLength(1);
    expect((screen.getByLabelText(/Currency/i) as HTMLSelectElement).value).toBe("USD");
    expect((screen.getByRole("textbox", { name: /Starting balance/i }) as HTMLInputElement).value).toBe("10000.00");
    expect((screen.getByRole("textbox", { name: /Regular contribution/i }) as HTMLInputElement).value).toBe("500.00");
    expect((screen.getByRole("combobox", { name: /Contribution frequency/i }) as HTMLSelectElement).value).toBe("monthly");
    expect((screen.getByRole("textbox", { name: /Investment length/i }) as HTMLInputElement).value).toBe("120");
    expect((screen.getByRole("textbox", { name: /Estimated annual return/i }) as HTMLInputElement).value).toBe("7.00");
    await user.click(screen.getByText(/Advanced assumptions/i));
    expect((screen.getByRole("radio", { name: /end/i }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText(/Compounding frequency/i) as HTMLSelectElement).value).toBe("monthly");
    expect((screen.getByLabelText(/Annual fee/i) as HTMLInputElement).value).toBe("0.00");
    expect((screen.getByLabelText(/Annual inflation rate/i) as HTMLInputElement).value).toBe("3.00");
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });

  it("groups Recalculate and Reset in a wrapping, spaced control row", () => {
    setup();
    const recalculate = screen.getByRole("button", { name: "Recalculate" });
    const reset = screen.getByRole("button", { name: "Reset" });
    expect(recalculate.parentElement).toBe(reset.parentElement);
    const controls = recalculate.parentElement;
    if (!controls) throw new Error("Calculator action controls were not rendered");
    for (const token of ["flex", "flex-wrap", "gap-2"]) {
      expect(controls.classList.contains(token)).toBe(true);
    }
    expect(recalculate.getAttribute("type")).toBe("submit");
    expect(reset.getAttribute("type")).toBe("button");
  });

  it("keeps the annual table on the same last-valid result as the final balance", () => {
    setup();
    const finalBalance = screen.getByText("Final balance").nextElementSibling?.textContent;
    const tableRows = within(screen.getByRole("table")).getAllByRole("row");
    const finalAnnualEndingBalance = tableRows.at(-1)?.querySelectorAll("td")[5]?.textContent;
    expect(finalAnnualEndingBalance).toBe(finalBalance);
  });

  it("preserves expanded annual pagination for stale drafts and resets it for a new valid result", () => {
    vi.useFakeTimers();
    setup(true);
    replace(/Investment length/i, "132");
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole("button", { name: "Show 10 more" }));
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(12);
    replace(/Starting balance/i, "bad");
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(12);
    replace(/Starting balance/i, "12000");
    act(() => vi.advanceTimersByTime(300));
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(11);
  });

  it("resets an expanded annual table to the default USD result", () => {
    vi.useFakeTimers();
    setup(true);
    replace(/Investment length/i, "132");
    act(() => vi.advanceTimersByTime(300));
    fireEvent.click(screen.getByRole("button", { name: "Show 10 more" }));
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(12);
    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
    expect((screen.getByLabelText(/Currency/i) as HTMLSelectElement).value).toBe("USD");
    expect(announcementCarrier().textContent).toBe("");
    expect(screen.queryByText("Results reflect the last valid calculation.")).toBeNull();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(11);
  });

  it("exposes all simple and advanced controls without calculating on details toggle", async () => {
    const { user } = setup();
    evaluateCalls.splice(0);
    for (const label of [
      /Starting balance/i,
      /Regular contribution/i,
      /Investment length/i,
      /Estimated annual return/i,
    ]) expect(screen.getByRole("textbox", { name: label })).not.toBeNull();
    expect(screen.getByRole("combobox", { name: /Currency/i })).not.toBeNull();
    expect(screen.getByRole("combobox", { name: /Contribution frequency/i })).not.toBeNull();
    await user.click(screen.getByText(/Advanced assumptions/i));
    replace(/Annual fee/i, "1.00");
    for (const label of [/Compounding frequency/i, /Annual fee/i, /Annual inflation rate/i]) {
      expect(screen.getByLabelText(label)).not.toBeNull();
    }
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    await user.click(screen.getByText(/Advanced assumptions/i));
    await user.click(screen.getByText(/Advanced assumptions/i));
    expect((screen.getByLabelText(/Annual fee/i) as HTMLInputElement).value).toBe("1.00");
    expect(evaluateCalls).toHaveLength(0);
  });

  it("groups contribution timing radios and supports keyboard selection", async () => {
    const { user } = setup();
    await user.click(screen.getByText(/Advanced assumptions/i));
    const end = screen.getByRole("radio", { name: /^end$/i });
    end.focus();
    evaluateCalls.splice(0);
    await user.keyboard("{ArrowLeft}");
    expect((screen.getByRole("radio", { name: /^beginning$/i }) as HTMLInputElement).checked).toBe(true);
    expect(screen.getAllByRole("radio").map((radio) => radio.getAttribute("name")))
      .toEqual(["contributionTiming", "contributionTiming"]);
  });

  it("associates help and visible errors with every text field", async () => {
    const { user } = setup();
    await user.click(screen.getByText(/Advanced assumptions/i));
    const fee = replace(/Annual fee/i, "bad");
    fee.focus();
    await user.tab();
    expect(fee.getAttribute("aria-invalid")).toBe("true");
    expect(fee.getAttribute("aria-describedby")).toContain("nominalAnnualFeeRate-help");
    expect(fee.getAttribute("aria-describedby")).toContain("nominalAnnualFeeRate-error");
    expect(screen.getByText("10 years.").getAttribute("id")).toBe("durationMonths-help");
  });
});
