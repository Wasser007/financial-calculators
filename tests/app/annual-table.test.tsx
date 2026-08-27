// @vitest-environment jsdom

import { cleanup, render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { AnnualTable } from "../../app/annual-table";
import type { AnnualScheduleEntry } from "../../lib/calculator/types";

const headings = [
  "Year", "Opening balance", "Contributions", "Gross growth", "Fees", "Ending balance",
  "Cumulative contributions", "Cumulative gross growth", "Cumulative fees",
];

function rows(count: number): AnnualScheduleEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    year: index + 1,
    startMonth: index * 12 + 1,
    endMonth: (index + 1) * 12,
    openingBalance: index === 1 ? -2 : index,
    contributions: 0,
    grossGrowth: index === 1 ? -1 : 0,
    fees: 0,
    closingBalance: index,
    cumulativeContributions: 0,
    cumulativeGrossGrowth: 0,
    cumulativeFees: 0,
  }));
}

function displayedRowCount() {
  return within(screen.getByRole("table")).getAllByRole("row").length;
}

describe("AnnualTable", () => {
  afterEach(cleanup);

  it("uses the supplied presentation locale for authoritative and mobile table amounts", () => {
    const data = rows(1);
    data[0] = { ...data[0], openingBalance: 1234.5, closingBalance: 1234.5 };
    render(<AnnualTable rows={data} currency="USD" stale={false} presentationLocale="de-DE" />);
    expect(screen.getAllByText((_, element) => element?.textContent === "1.234,50 $").length).toBeGreaterThan(0);
  });

  it("formats the authoritative annual table cells with the supplied locale", () => {
    const data = rows(1);
    data[0] = { ...data[0], openingBalance: 1234.5 };
    render(<AnnualTable rows={data} currency="USD" stale={false} presentationLocale="de-DE" />);
    const authoritativeRow = within(screen.getByRole("table")).getAllByRole("row")[1];
    if (!authoritativeRow) throw new Error("expected one authoritative data row");
    const openingBalanceCell = within(authoritativeRow).getAllByRole("cell")[1];
    if (!openingBalanceCell) throw new Error("expected the opening-balance cell");
    const expected = new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD" }).format(1234.5);
    expect(openingBalanceCell.textContent).toBe(expected);
    expect(Array.from(openingBalanceCell.textContent ?? "", (character) => character.codePointAt(0))).toEqual(
      Array.from(expected, (character) => character.codePointAt(0)),
    );
  });

  it("formats the distinct compact mobile annual summary with the supplied locale", () => {
    const data = rows(1);
    data[0] = { ...data[0], closingBalance: 1234.5 };
    const { container } = render(<AnnualTable rows={data} currency="USD" stale={false} presentationLocale="de-DE" />);
    const compact = container.querySelector("div.md\\:hidden");
    expect(compact?.getAttribute("aria-hidden")).toBe("true");
    expect(compact?.textContent).toContain("Year 1: 1.234,50 $");
  });

  it("renders the exact authoritative columns, caption, currency association, and no source-month fields", () => {
    render(<AnnualTable rows={rows(1)} currency="USD" stale={false} />);
    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual(headings);
    expect(screen.getByText("Annual calculation detail.")).toBeTruthy();
    expect(screen.getByRole("table").getAttribute("aria-describedby")).toBe("annual-table-currency");
    expect(screen.getByText("Amounts shown in USD.")).toBeTruthy();
    expect(screen.queryByText("startMonth")).toBeNull();
    expect(screen.queryByText("endMonth")).toBeNull();
  });

  it("formats positive, zero, and negative values without mutating annualSchedule", () => {
    const data = rows(2);
    data[0] = { ...data[0], openingBalance: 12.5, contributions: 3, closingBalance: 15.5 };
    const before = JSON.stringify(data);
    render(<AnnualTable rows={data} currency="EUR" stale={false} />);
    expect(screen.getByText("€12.50")).toBeTruthy();
    expect(screen.getAllByText("€0.00").length).toBeGreaterThan(0);
    expect(screen.getByText("-€2.00")).toBeTruthy();
    expect(JSON.stringify(data)).toBe(before);
  });

  it("keeps the semantic table authoritative and exposes only an aria-hidden mobile summary", () => {
    render(<AnnualTable rows={rows(1)} currency="USD" stale={false} />);
    const scrollHint = screen.getByText("Scroll the table horizontally to see every column.");
    expect(scrollHint.hasAttribute("hidden")).toBe(false);
    expect(scrollHint.getAttribute("aria-hidden")).toBeNull();
    expect(scrollHint.querySelector("[aria-hidden=\"true\"]")?.textContent).toBe("↔");
    expect(screen.getByTestId("annual-table-scroll").className).toContain("overflow-x-auto");
    const summary = screen.getByText(/Year 1:/).parentElement;
    expect(summary?.getAttribute("aria-hidden")).toBe("true");
    expect(summary?.className).toContain("md:hidden");
    expect(screen.getByRole("table")).toBeTruthy();
  });

  it("keeps readable columns inside the component scroll boundary", () => {
    render(<AnnualTable rows={rows(1)} currency="USD" stale={false} />);
    const table = screen.getByRole("table");
    expect(table.classList.contains("min-w-full")).toBe(true);
    expect(table.classList.contains("w-max")).toBe(true);

    for (const header of screen.getAllByRole("columnheader")) {
      for (const token of ["px-3", "py-2", "whitespace-nowrap"]) {
        expect(header.classList.contains(token)).toBe(true);
      }
    }

    const cells = within(table).getAllByRole("cell");
    for (const token of ["px-3", "py-2", "whitespace-nowrap"]) {
      expect(cells[0]?.classList.contains(token)).toBe(true);
    }
    expect(cells[0]?.classList.contains("text-right")).toBe(false);
    expect(cells[0]?.classList.contains("tabular-nums")).toBe(false);

    for (const cell of cells.slice(1)) {
      for (const token of ["px-3", "py-2", "whitespace-nowrap", "text-right", "tabular-nums"]) {
        expect(cell.classList.contains(token)).toBe(true);
      }
    }
    expect(screen.getByTestId("annual-table-scroll").classList.contains("overflow-x-auto")).toBe(true);
  });

  it("handles empty, fewer-than-ten, and exactly-ten rows without a pagination button", () => {
    for (const count of [0, 9, 10]) {
      const { unmount } = render(<AnnualTable rows={rows(count)} currency="USD" stale={false} />);
      expect(screen.queryByRole("button", { name: "Show 10 more" })).toBeNull();
      unmount();
    }
  });

  it("activates pagination through native Enter and Space without a synthetic click", async () => {
    const user = userEvent.setup();
    render(<AnnualTable rows={rows(21)} currency="USD" stale={false} />);
    expect(displayedRowCount()).toBe(11);
    const button = screen.getByRole("button", { name: "Show 10 more" });
    expect(button.getAttribute("type")).toBe("button");
    button.focus();
    await user.keyboard("{Enter}");
    expect(displayedRowCount()).toBe(21);
    await user.keyboard(" ");
    expect(displayedRowCount()).toBe(22);
    expect(screen.queryByRole("button", { name: "Show 10 more" })).toBeNull();
  });

  it("preserves a partial final year exactly as supplied and never surfaces its month bounds", () => {
    const partial: AnnualScheduleEntry = {
      ...rows(1)[0],
      year: 2,
      startMonth: 13,
      endMonth: 18,
      openingBalance: 100,
      contributions: 25,
      grossGrowth: -5,
      fees: 2,
      closingBalance: 118,
      cumulativeContributions: 25,
      cumulativeGrossGrowth: -5,
      cumulativeFees: 2,
    };
    render(<AnnualTable rows={[partial]} currency="USD" stale={false} />);
    expect(screen.getByText("2")).toBeTruthy();
    for (const amount of ["$100.00", "$25.00", "-$5.00", "$2.00", "$118.00"]) {
      expect(screen.getAllByText(amount).length).toBeGreaterThan(0);
    }
    expect(screen.queryByText("13")).toBeNull();
    expect(screen.queryByText("18")).toBeNull();
  });

  it("reaches the final row of a 100-year schedule without exceeding its bounds", async () => {
    const user = userEvent.setup();
    render(<AnnualTable rows={rows(100)} currency="USD" stale={false} />);
    for (let expected = 21; expected <= 101; expected += 10) {
      await user.click(screen.getByRole("button", { name: "Show 10 more" }));
      expect(displayedRowCount()).toBe(expected);
    }
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Show 10 more" })).toBeNull();
  });

  it("resets pagination only when a new result rows reference arrives", async () => {
    const twelve = rows(12);
    const { rerender } = render(<AnnualTable rows={twelve} currency="USD" stale={false} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Show 10 more" }));
    expect(displayedRowCount()).toBe(13);
    rerender(<AnnualTable rows={twelve} currency="EUR" stale />);
    expect(displayedRowCount()).toBe(13);
    rerender(<AnnualTable rows={twelve.map((row) => ({ ...row }))} currency="EUR" stale={false} />);
    await waitFor(() => expect(displayedRowCount()).toBe(11));
  });
});
