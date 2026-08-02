// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

import { CalculatorWorkspace } from "../../app/calculator-workspace";

function setup(fakeTimers = false) {
  const user = fakeTimers
    ? userEvent.setup({ advanceTimers: (milliseconds) => vi.advanceTimersByTime(milliseconds) })
    : userEvent.setup();
  const view = render(<CalculatorWorkspace />);
  return { user, ...view };
}

function replace(label: RegExp, value: string) {
  const input = screen.getByRole("textbox", { name: label });
  fireEvent.change(input, { target: { value } });
  return input;
}

describe("CalculatorWorkspace behavior", () => {
  beforeEach(() => {
    evaluateCalls.splice(0);
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
    expect(screen.getByRole("status").textContent).toMatch(/last valid calculation/i);
    expect(screen.queryByText(/Enter a finite amount\/percentage/i)).toBeNull();
    fireEvent.blur(principal);
    expect(principal.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText(/Enter a finite amount\/percentage/i)).not.toBeNull();
    expect(summaryLabels.map(summaryValue)).toEqual(oldSummary);
    expect(screen.getByRole("table").textContent).toBe(oldTable);
    expect(screen.getByText("Amounts shown in USD.")).toBeTruthy();
    expect(screen.getByRole("region", { name: /Annual calculation detail/i }).getAttribute("data-stale")).toBe("true");
    expect(screen.getAllByRole("status")).toHaveLength(1);
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
    expect(screen.getAllByRole("status")).toHaveLength(1);
    replace(/Starting balance/i, "12000");
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByRole("status")).toBeNull();
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
    expect((screen.getByLabelText(/Starting balance/i) as HTMLInputElement).value).toBe("10000.00");
    expect((screen.getByLabelText(/Regular contribution/i) as HTMLInputElement).value).toBe("500.00");
    expect((screen.getByLabelText(/Contribution frequency/i) as HTMLSelectElement).value).toBe("monthly");
    expect((screen.getByLabelText(/Investment length/i) as HTMLInputElement).value).toBe("120");
    expect((screen.getByLabelText(/Estimated annual return/i) as HTMLInputElement).value).toBe("7.00");
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
    expect(screen.queryByRole("status")).toBeNull();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(11);
  });

  it("exposes all simple and advanced controls without calculating on details toggle", async () => {
    const { user } = setup();
    evaluateCalls.splice(0);
    for (const label of [
      /Currency/i,
      /Starting balance/i,
      /Regular contribution/i,
      /Contribution frequency/i,
      /Investment length/i,
      /Estimated annual return/i,
    ]) expect(screen.getByLabelText(label)).not.toBeNull();
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
