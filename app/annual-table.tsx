"use client";

import { useEffect, useState } from "react";
import type { AnnualScheduleEntry, CurrencyCode } from "../lib/calculator/types";
import { DEFAULT_PRESENTATION_LOCALE, formatCurrencyDisplay, type PresentationLocale } from "../lib/presentation/currency";

const columns: readonly [string, keyof AnnualScheduleEntry][] = [
  ["Year", "year"], ["Opening balance", "openingBalance"], ["Contributions", "contributions"],
  ["Gross growth", "grossGrowth"], ["Fees", "fees"], ["Ending balance", "closingBalance"],
  ["Cumulative contributions", "cumulativeContributions"], ["Cumulative gross growth", "cumulativeGrossGrowth"], ["Cumulative fees", "cumulativeFees"],
];

function headingLines(label: string): readonly string[] {
  const words = label.split(" ");
  if (!label.startsWith("Cumulative ") && words.length <= 2) return [label];
  const splitAt = Math.floor(words.length / 2);
  return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")];
}

export function AnnualTable({ rows, currency, stale, presentationLocale = DEFAULT_PRESENTATION_LOCALE }: { rows: readonly AnnualScheduleEntry[]; currency: CurrencyCode; stale: boolean; presentationLocale?: PresentationLocale }) {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(10, rows.length));
  useEffect(() => setVisibleCount(Math.min(10, rows.length)), [rows]);
  const currencyDescriptionId = "annual-table-currency";
  const shown = rows.slice(0, visibleCount);
  return <section aria-labelledby="annual-table-heading" className="annual-card" data-stale={stale || undefined}>
    <div className="card-heading">
      <div><p className="eyebrow">Year by year</p><h2 id="annual-table-heading">Annual calculation detail</h2></div>
      <p id={currencyDescriptionId}>Amounts shown in {currency}.</p>
    </div>
    <p className="table-scroll-hint"><span aria-hidden="true">↔</span> Scroll the table horizontally to see every column.</p>
    <div className="annual-table-scroll overflow-x-auto" tabIndex={0} data-testid="annual-table-scroll">
      <table aria-describedby={currencyDescriptionId} className="min-w-full w-max">
        <caption>Annual calculation detail.</caption>
        <thead><tr>{columns.map(([label]) => {
          const lines = headingLines(label);
          return <th aria-label={label} className="annual-table-heading-cell px-3 py-2" scope="col" key={label}>
            <span aria-hidden="true" className={lines.length > 1 ? "annual-table-header-label annual-table-header-label--multiline" : "annual-table-header-label"}>
              {lines.map((line, index) => <span key={line}>{line}{index < lines.length - 1 ? " " : ""}</span>)}
            </span>
          </th>;
        })}</tr></thead>
        <tbody>{rows.map((row, index) => <tr hidden={index >= visibleCount} key={row.year}>{columns.map(([label, key]) => <td className={key === "year" ? "year-cell px-3 py-2 whitespace-nowrap text-center tabular-nums" : "numeric-cell px-3 py-2 whitespace-nowrap text-center tabular-nums"} key={label}>{key === "year" ? row.year : formatCurrencyDisplay(row[key] as number, currency, presentationLocale)}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <div aria-hidden="true" className="annual-mobile-summary md:hidden">{shown.map((row) => <p key={row.year}>Year {row.year}: {formatCurrencyDisplay(row.closingBalance, currency, presentationLocale)}</p>)}</div>
    {visibleCount < rows.length && <button className="button button--secondary table-more" type="button" onClick={() => setVisibleCount((count) => Math.min(count + 10, rows.length))}>Show 10 more</button>}
  </section>;
}
