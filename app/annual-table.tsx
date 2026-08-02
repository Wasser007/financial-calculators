"use client";

import { useEffect, useState } from "react";
import type { AnnualScheduleEntry, CurrencyCode } from "../lib/calculator/types";
import { formatCurrencyDisplay } from "../lib/presentation/currency";

const columns: readonly [string, keyof AnnualScheduleEntry][] = [
  ["Year", "year"], ["Opening balance", "openingBalance"], ["Contributions", "contributions"],
  ["Gross growth", "grossGrowth"], ["Fees", "fees"], ["Ending balance", "closingBalance"],
  ["Cumulative contributions", "cumulativeContributions"], ["Cumulative gross growth", "cumulativeGrossGrowth"], ["Cumulative fees", "cumulativeFees"],
];

export function AnnualTable({ rows, currency, stale }: { rows: readonly AnnualScheduleEntry[]; currency: CurrencyCode; stale: boolean }) {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(10, rows.length));
  useEffect(() => setVisibleCount(Math.min(10, rows.length)), [rows]);
  const currencyDescriptionId = "annual-table-currency";
  const shown = rows.slice(0, visibleCount);
  return <section aria-labelledby="annual-table-heading" className="mt-8" data-stale={stale || undefined}>
    <h2 id="annual-table-heading">Annual calculation detail</h2>
    <p id={currencyDescriptionId}>Amounts shown in {currency}.</p>
    <div className="overflow-x-auto" data-testid="annual-table-scroll">
      <table aria-describedby={currencyDescriptionId} className="min-w-full w-max">
        <caption>Annual calculation detail.</caption>
        <thead><tr>{columns.map(([label]) => <th className="px-3 py-2 whitespace-nowrap" scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{shown.map((row) => <tr key={row.year}>{columns.map(([label, key]) => <td className={key === "year" ? "px-3 py-2 whitespace-nowrap" : "px-3 py-2 whitespace-nowrap text-right tabular-nums"} key={label}>{key === "year" ? row.year : formatCurrencyDisplay(row[key] as number, currency)}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <div aria-hidden="true" className="md:hidden">{shown.map((row) => <p key={row.year}>Year {row.year}: {formatCurrencyDisplay(row.closingBalance, currency)}</p>)}</div>
    {visibleCount < rows.length && <button type="button" onClick={() => setVisibleCount((count) => Math.min(count + 10, rows.length))}>Show 10 more</button>}
  </section>;
}
