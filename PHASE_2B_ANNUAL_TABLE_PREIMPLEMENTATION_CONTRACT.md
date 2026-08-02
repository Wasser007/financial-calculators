# Phase 2B Annual Table Pre-implementation Contract

**Status: ANNUAL TABLE PHASE — PRE-IMPLEMENTATION AUDIT COMPLETE — AWAITING INDEPENDENT REVIEW**

## Sole data source and permitted fields

The table consumes only `EvaluationResult.result.annualSchedule` from the existing Phase 1B public API. It must not derive annual values from the monthly ledger or recompute interest, fees, contributions, inflation, cumulative amounts, or balances.

| Column, exact order | `AnnualScheduleEntry` source |
| --- | --- |
| Year | `year` |
| Opening balance | `openingBalance` |
| Contributions | `contributions` |
| Gross growth | `grossGrowth` |
| Fees | `fees` |
| Ending balance | `closingBalance` |
| Cumulative contributions | `cumulativeContributions` |
| Cumulative gross growth | `cumulativeGrossGrowth` |
| Cumulative fees | `cumulativeFees` |

Caption must be **“Annual calculation detail.”** There is no permitted annual inflation-adjusted column: inflation adjustment remains a final summary metric only.

## Display contract

- Use existing `formatCurrencyDisplay(value, lastValidInputs.currency)` for every monetary cell; locale remains `en-US` and currencies remain USD/EUR/GBP/CAD/AUD. Keep the caption exactly **“Annual calculation detail.”** and add visible stable text such as **“Amounts shown in USD.”**, with a stable id referenced by the table's `aria-describedby`. Currency always comes from last-valid inputs.
- Formatting is presentation-only, uses two decimal places, and never writes a rounded/display string back to the core, draft, result, or URL.
- Signed gross growth is truthful: negative values retain their minus sign and cannot rely solely on color. Zero displays the adapter's currency zero. Fees use their Phase 1B returned value without a UI sign inversion.
- The final annual entry may be partial because `endMonth` can end before month 12. Render it as its returned one-based calculation year; do not fabricate months, prorate, or append a partial-year label/value not supplied by the core.
- Valid core input always has an annual schedule. Empty/failure handling is therefore limited to no last-valid result: render no table and no invented zero rows.
- Long durations support up to 100 annual rows. Initial `visibleCount` is `min(10, rowCount)`; Show 10 more increases it by 10 without exceeding `rowCount`, and the native button exists only while rows remain hidden. Tab, Enter, and Space are the only required pagination keyboard behavior. Each new last-valid calculation resets to 10; an invalid/stale draft does not reset it.

## Lifecycle integration

- The current frozen `CalculatorWorkspace` stores only `{ inputs, result }`; it does not retain or render `evaluation.warnings`. This annual-table phase will not expand that state model or implement warnings UI. The table reads the same last-valid result and currency as the six-result summary, using only `result.annualSchedule`.
- On invalid/incomplete drafts, preserve and label the stale last-valid table consistently with the existing summary; do not recalculate or reformat rows using a current invalid draft currency.
- On a new valid calculation, replace the table from that single evaluation result and reset visible-row pagination deterministically.
- The table must not alter, fabricate, reorder, or swallow Phase 1B warnings. Warnings UI is a separately unimplemented Phase 2A Frozen item and requires its own audit and authorization; warning/result/table synchronization is excluded from this phase.

## Responsive and accessibility contract

- Desktop/tablet: semantic HTML `table`, `caption`, `thead`, `tbody`, `th scope="col"`, and readable numeric alignment.
- Mobile: the complete semantic nine-column table remains the sole authoritative data source inside a component-level horizontal scroll container. An optional year/ending-balance compact visual summary appears only below 768px and is `aria-hidden="true"`; it never replaces the table or duplicates its screen-reader output.
- jsdom/Testing Library prove semantic DOM, scroll-container structure, stable associations, keyboard activation, and data behavior only. Real 320px overflow and 200% zoom require existing browser capability or manual visual-viewport evidence; no dependency may be added and jsdom must not be claimed to prove layout.
- Provide currency context through table context/accessible name; CAD and AUD distinguish via `Intl` output.
- No chart, SVG, URL/share, CSV, ad, affiliate, analytics, CMP, storage, or commercial UI is in this phase.

## Required tests

Model tests must verify: the exact nine-column mapping/order; partial-final-year pass-through; signed/zero/large values; 1-year and 100-year schedules; pagination slices; no annual inflation calculation; currency binding to last valid inputs; and no mutation of `annualSchedule`.

DOM tests must verify: caption/header/scope semantics; currency-description association; first 10 rows; Show-10-more progression and keyboard activation; scroll-container/compact-summary structure; stale-table persistence after invalid edit; currency preservation; and negative/zero text visibility. Browser/manual acceptance must verify 320px overflow and 200% zoom.

## Expected implementation scope

- Add a small presentational annual-table component and focused tests under `app/` and `tests/app/`.
- Modify `app/calculator-workspace.tsx` only to pass its last-valid annual schedule/currency/stale state to that component.
- No Phase 1B, frozen document, dependency, configuration, SVG-chart, URL-share, or commercial file changes are authorized.
