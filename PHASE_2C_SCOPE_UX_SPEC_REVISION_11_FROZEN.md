# Phase 2C Scope & UX Specification — Revision 11 Frozen

**Status: PHASE 2C REVISION 11 FROZEN — IMPLEMENTATION NOT AUTHORIZED**

Prepared: 2026-08-02
Frozen: 2026-08-02
Project: Compound Interest Calculator
Phase: Result Visualization & Explainability

```text
Independent freeze review: PASSED
Specification frozen: YES
Implementation authorized: NO
Phase 2C implementation started: NO
```

This is the complete, self-contained, human-approved frozen Phase 2C contract. An implementer needs this document and the already-frozen upstream product and calculation contracts, but no other Phase 2C candidate. Its candidate source was independently reviewed and then explicitly authorized for freeze on 2026-08-02. This frozen document is the separate frozen evidence required by the candidate gate. Revision 11 closes the four independent-review findings recorded against Revision 10 without expanding product scope. Freeze does not authorize implementation.

## 1. Authority, purpose, goal, and non-goals

The authority order is: Phase 1A calculation specification → Phase 1B public calculation contract → Phase 2A product/UX specification → Phase 2B annual-table baseline → this frozen Phase 2C specification. A higher authority wins if a conflict is discovered. Such a conflict invalidates implementation readiness and requires explicit resolution; it is not silently resolved here.

Phase 2C is a presentation-only explanation of an existing last-valid calculation. It lets a user understand:

1. which supplied components reconcile to the illustrated ending balance; and
2. how the supplied annual closing balances progress.

It does not predict an account outcome, promise a return, recommend an investment, or add financial arithmetic.

In scope:

- a native-SVG signed balance-composition waterfall;
- a native-SVG annual ending-balance line chart;
- exact visible text, an ordered data list, deterministic summaries, selection text, and accessible announcements;
- pure chart-model, domain, tick, label, summary, selection, and geometry adapters over the existing last-valid result;
- keyboard, pointer, touch, hover, stale-result, no-JS, SVG-failure, print, forced-colors, reduced-motion, zoom, responsive, privacy, dependency, performance, and test contracts.

Out of scope:

- new inputs, financial formulas, ledger reconstruction, validation rules, or calculation-core/API changes;
- scenarios, probability ranges, tax, withdrawals, variable cash flows, simulation, forecasts, benchmarks, or recommendations;
- inflation/today-money annual series, CSV/PDF export, sharing changes, account data, persistence, localization implementation, dark mode, editorial expansion, ads, affiliates, analytics, CMP, or cookies;
- implementing, reconstructing, suppressing, or reordering warnings;
- a third-party chart library, third-party script, new network request, dependency change, URL change, commit, tag, push, PR, deployment, or SchengenProfi work.

Any expansion requires a separate human decision. Phase 2C succeeds only when the six existing result metrics remain before the figures, exact values are available without hover, the figures and annual table share the same last-valid data/currency/stale lifecycle, and no chart causes page-level horizontal overflow at 320 CSS px, 200% zoom, or 400% zoom.

## 2. Inherited data and calculation boundary

The chart builder may consume only:

```ts
last.inputs.currency
last.inputs.initialPrincipal
last.inputs.durationMonths
last.result.finalBalance
last.result.totalContributions
last.result.grossGrowth
last.result.totalFees
last.result.annualSchedule
stale
```

Each annual row contributes only `year`, `startMonth`, `endMonth`, and `closingBalance` to the line chart. The builder may not call `evaluateCalculator`, `validateInputs`, or any equivalent financial function; read a monthly ledger; derive interest, fees, contributions, or balances; mutate upstream objects; write drafts; or change the URL.

The supplied reconciliation identity is:

```text
initialPrincipal + totalContributions + grossGrowth - totalFees = finalBalance
```

`totalContributions` excludes `initialPrincipal`. The chart layer observes and validates this identity exactly in the upstream numeric representation. It never solves for a missing component, adds a balancing remainder, rounds components into agreement, or modifies an upstream result. Interaction changes only selection state and never invokes the calculation core.

All authoritative full amounts use the existing presentation adapter:

```ts
formatCurrencyDisplay(value, last.inputs.currency)
```

The supported presentation currencies are USD, EUR, GBP, CAD, and AUD under the existing `en-US` display contract. Raw numbers and formatted strings remain separate. Classification, IDs, anchors, domains, ticks, and selection indexes derive from finite raw values, never formatted strings, pixels, colors, locale output, or container width.

## 3. Information architecture and lifecycle

The page order is:

1. existing title, limitation text, calculator form, and six-result summary;
2. `Your result visualised` heading and concise illustration limitation;
3. `Balance composition` figure, ordered five-value list, selected-value text, and static summary;
4. `Annual ending balance` figure, selected-value text, static summary, and reference/link to `Annual calculation detail`;
5. the existing annual table;
6. existing education and footer.

At widths of at least 1024 CSS px, figures may share a row only when each remains readable. Otherwise they stack. Below 768 CSS px the fixed order is composition, annual line, then table. Charts never scroll horizontally; only the unchanged annual-table component may retain its own horizontal scrolling behavior.

Initial valid defaults display the result summary, figures, and table from one last-valid result. A valid committed calculation replaces all of them together. An incomplete or invalid draft does not run the core and does not replace the prior result, currency, charts, committed selection, annual table, or stale label. A failed chart-model build leaves the six-result summary and table intact and shows the two unavailable carriers defined below. It does not erase or alter the last-valid result.

There is no remote chart fetch or loading state. If JavaScript is absent, SVG enhancement fails, or SVG is unsupported, the server/static HTML still exposes the section headings, illustration limitation, composition ordered list, static explanatory text, and annual table. If a stale result is displayed, the figures use that same stale result; stale rendering never triggers an announcement.

## 4. Annual schedule and annual-table authority

`annualSchedule` supplies chart metadata and closing balances. The existing HTML table remains authoritative for exactly these nine displayed fields and their existing order:

1. Year
2. Opening balance
3. Contributions
4. Gross growth
5. Fees
6. Ending balance
7. Cumulative contributions
8. Cumulative gross growth
9. Cumulative fees

No `startMonth` or `endMonth` column is added. Chart disclosure of supplied month boundaries is a display transformation, not a financial calculation and not an extension of the table's nine-field audit surface.

### 4.1 Three separate partial-period carriers

A row is partial when `endMonth - startMonth + 1 < 12`. The exact en dash is U+2013.

| Carrier | Exact template | Use |
| --- | --- | --- |
| Annual point/period label | `Year {year} — partial period, months {startMonth}–{endMonth}` | Replaces `Year {year}` for that point only. It includes `Year`, the year, an em dash U+2014 around spaces, and the month range joined by an en dash. |
| Static summary addition | `The final recorded period covers months {startMonth}–{endMonth}.` | Appended only when the final supplied point is partial. It does not repeat the point label or the word `Year`. |
| Visible selected-value/announcement label | `Year {year} — partial period, months {startMonth}–{endMonth}` | Used as `{label}` when the selected point is partial. |

For a non-partial point, both point label and selected-value label are exactly `Year {year}`, and no partial static-summary sentence is emitted. `{year}`, `{startMonth}`, and `{endMonth}` are the supplied integers without grouping. These carriers must never be concatenated into a duplicated construction such as a point label followed by a second copy of its months.

## 5. Figure semantics and visual encoding

### 5.1 Balance composition

The figure answers only: **“What components lead to this illustrated ending balance?”** It is a reconciliation under assumptions, never an account statement or guarantee.

The visible ordered list and fixed step order are:

1. Starting balance
2. Contributions
3. Gross growth, or `Gross growth (loss)` when negative
4. Fees
5. Ending balance

The canonical anchors are:

```text
A0 = 0
A1 = initialPrincipal
A2 = A1 + totalContributions
A3 = A2 + grossGrowth
A4 = A3 - totalFees
A5 = finalBalance
```

The sole mapping is:

| Step | Start | End | Meaning |
| --- | --- | --- | --- |
| Starting balance | A0 | A1 | increment |
| Contributions | A1 | A2 | increment |
| Gross growth | A2 | A3 | signed increment/decrement/flat |
| Fees | A3 | A4 | non-negative fee deduction or flat |
| Ending balance | A0 | A5 | total bar |

Ending balance is always the A0→A5 total bar. It is never A4→A5 and never a fifth incremental adjustment. Even when A4 equals A5, its total bar spans A0→A5 and is not rendered as a zero-height increment.

The contribution treatment uses `#2E6FCE`, growth `#126B5A`, fees `#A34B18`, ink `#132033`, muted text `#526174`, and focus `#155EEF`. Color is always paired with label, sign, and frozen pattern. Positive growth uses the growth pattern, negative growth uses loss pattern, and zero growth uses flat pattern. Fees use the fee pattern and their downward geometry comes from A3→A4; `totalFees < 0` is a build failure. The ending bar uses total pattern. A stacked composition/area representation is forbidden.

### 5.2 Annual ending balance

The figure answers only: **“What was the illustrated ending balance at each recorded annual schedule point?”** It renders one marker for each supplied annual `closingBalance` and a straight native-SVG line between consecutive supplied points. It adds no monthly point, interpolation, area, stack, bar, smoothing, inflation series, or second financial series. A single point renders one marker and no invented segment.

Every point remains selectable even when its x-axis text label is omitted. The chart discloses its ISO currency in nearby axis/context text; compact y ticks do not contain a currency symbol.

### 5.3 Common figure and resilience rules

Each chart uses `figure`, a visible `figcaption`, an SVG `title` and `desc`, a visible static summary, and the visible selected-value carrier. Composition also has the ordered full-value list; annual has the annual-table link/reference. A tooltip is optional enhancement and never the sole carrier of a value or limitation.

Text and non-text contrast are verified during implementation. Focus is a 2 CSS px `#155EEF` outline with 2 CSS px offset. At narrow widths, label density may decrease only according to the deterministic labelled-index algorithm; points and data do not disappear. Font size is not reduced without bound to evade overflow. Forced colors preserve labels, focus, baseline, line/step differentiation, and patterns. There is no animation by default; any later cosmetic motion must obey `prefers-reduced-motion`. Print retains figure titles, limitation, summary, composition list, the default or committed selected value, and annual table; hover-only UI is omitted.

## 6. Normative TypeScript contract

This is the only normative TypeScript type set. Type aliases are not declaration-merged. All helper types referenced here are defined here.

```ts
type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD";
type ChartSign = "positive" | "negative" | "zero";
type ChartAnchorId = "A0" | "A1" | "A2" | "A3" | "A4" | "A5";
type WaterfallStepId =
  | "starting-balance"
  | "contributions"
  | "gross-growth"
  | "fees"
  | "ending-balance";
type AnnualPointId = `annual-growth-point-${number}`;
type AnnualTickId =
  | "annual-y-tick-0"
  | "annual-y-tick-1"
  | "annual-y-tick-2"
  | "annual-y-tick-3"
  | "annual-y-tick-4";
type WaterfallTickId =
  | "waterfall-y-tick-0"
  | "waterfall-y-tick-1"
  | "waterfall-y-tick-2"
  | "waterfall-y-tick-3"
  | "waterfall-y-tick-4";
type ChartTickId = AnnualTickId | WaterfallTickId;
type IncrementPattern = "solid";
type GrowthPattern = "growth" | "loss" | "flat";
type FeePattern = "fees";
type TotalPattern = "total";

type ChartAnchor<TId extends ChartAnchorId> = {
  readonly id: TId;
  readonly value: TId extends "A0" ? 0 : number;
};

type ChartDomain = {
  readonly min: number;
  readonly max: number;
  readonly includesZero: true;
  readonly tickFractions: readonly [0, 0.25, 0.5, 0.75, 1];
};

type ChartTick<TId extends ChartTickId> = {
  readonly id: TId;
  readonly value: number;
  readonly compactLabel: string;
};

type StartingBalanceStep = {
  readonly kind: "starting-balance-step";
  readonly id: Extract<WaterfallStepId, "starting-balance">;
  readonly barKind: "increment";
  readonly label: "Starting balance";
  readonly rawValue: number;
  readonly formattedValue: string;
  readonly sign: ChartSign;
  readonly startAnchor: ChartAnchor<"A0">;
  readonly endAnchor: ChartAnchor<"A1">;
  readonly accessibleLabel: string;
  readonly pattern: IncrementPattern;
};

type ContributionStep = {
  readonly kind: "contribution-step";
  readonly id: Extract<WaterfallStepId, "contributions">;
  readonly barKind: "increment";
  readonly label: "Contributions";
  readonly rawValue: number;
  readonly formattedValue: string;
  readonly sign: ChartSign;
  readonly startAnchor: ChartAnchor<"A1">;
  readonly endAnchor: ChartAnchor<"A2">;
  readonly accessibleLabel: string;
  readonly pattern: IncrementPattern;
};

type PositiveGrossGrowthStep = {
  readonly kind: "gross-growth-step";
  readonly id: Extract<WaterfallStepId, "gross-growth">;
  readonly barKind: "signed-increment";
  readonly label: "Gross growth";
  readonly rawValue: number;
  readonly formattedValue: string;
  readonly sign: "positive";
  readonly startAnchor: ChartAnchor<"A2">;
  readonly endAnchor: ChartAnchor<"A3">;
  readonly accessibleLabel: string;
  readonly pattern: "growth";
};

type NegativeGrossGrowthStep = {
  readonly kind: "gross-growth-step";
  readonly id: Extract<WaterfallStepId, "gross-growth">;
  readonly barKind: "signed-increment";
  readonly label: "Gross growth (loss)";
  readonly rawValue: number;
  readonly formattedValue: string;
  readonly sign: "negative";
  readonly startAnchor: ChartAnchor<"A2">;
  readonly endAnchor: ChartAnchor<"A3">;
  readonly accessibleLabel: string;
  readonly pattern: "loss";
};

type ZeroGrossGrowthStep = {
  readonly kind: "gross-growth-step";
  readonly id: Extract<WaterfallStepId, "gross-growth">;
  readonly barKind: "signed-increment";
  readonly label: "Gross growth";
  readonly rawValue: 0;
  readonly formattedValue: string;
  readonly sign: "zero";
  readonly startAnchor: ChartAnchor<"A2">;
  readonly endAnchor: ChartAnchor<"A3">;
  readonly accessibleLabel: string;
  readonly pattern: "flat";
};

type GrossGrowthStep =
  | PositiveGrossGrowthStep
  | NegativeGrossGrowthStep
  | ZeroGrossGrowthStep;

type FeeStep = {
  readonly kind: "fee-step";
  readonly id: Extract<WaterfallStepId, "fees">;
  readonly barKind: "deduction";
  readonly label: "Fees";
  readonly rawValue: number;
  readonly formattedValue: string;
  readonly sign: "negative" | "zero";
  readonly startAnchor: ChartAnchor<"A3">;
  readonly endAnchor: ChartAnchor<"A4">;
  readonly accessibleLabel: string;
  readonly pattern: FeePattern;
};

type EndingBalanceStep = {
  readonly kind: "ending-balance-step";
  readonly id: Extract<WaterfallStepId, "ending-balance">;
  readonly barKind: "total";
  readonly label: "Ending balance";
  readonly rawValue: number;
  readonly formattedValue: string;
  readonly sign: ChartSign;
  readonly startAnchor: ChartAnchor<"A0">;
  readonly endAnchor: ChartAnchor<"A5">;
  readonly accessibleLabel: string;
  readonly pattern: TotalPattern;
};

type BalanceCompositionSteps = readonly [
  StartingBalanceStep,
  ContributionStep,
  GrossGrowthStep,
  FeeStep,
  EndingBalanceStep
];

type BalanceCompositionSummaryClassificationId =
  | "composition-unavailable"
  | "composition-final-negative"
  | "composition-final-zero"
  | "composition-negative-growth"
  | "composition-zero-growth"
  | "composition-fees-exceed-positive-growth"
  | "composition-positive-growth-with-fees"
  | "composition-positive-growth-without-fees";

type SuccessfulCompositionClassificationId = Exclude<
  BalanceCompositionSummaryClassificationId,
  "composition-unavailable"
>;

type CompositionChartTextSummary = {
  readonly kind: "composition-summary";
  readonly chart: "composition";
  readonly classificationId: SuccessfulCompositionClassificationId;
  readonly visibleText: string;
  readonly selectedValueTemplate: "{label}: {fullAmount}.";
  readonly announcementTemplate: "{label}: {fullAmount}.";
};

type BalanceCompositionChartModel = {
  readonly kind: "balance-composition";
  readonly currency: CurrencyCode;
  readonly domain: ChartDomain;
  readonly ticks: readonly [
    ChartTick<"waterfall-y-tick-0">,
    ChartTick<"waterfall-y-tick-1">,
    ChartTick<"waterfall-y-tick-2">,
    ChartTick<"waterfall-y-tick-3">,
    ChartTick<"waterfall-y-tick-4">
  ];
  readonly steps: BalanceCompositionSteps;
  readonly staticSummary: CompositionChartTextSummary;
};

type AnnualGrowthPoint = {
  readonly id: AnnualPointId;
  readonly scheduleIndex: number;
  readonly year: number;
  readonly startMonth: number;
  readonly endMonth: number;
  readonly isPartialPeriod: boolean;
  readonly label: string;
  readonly rawClosingBalance: number;
  readonly formattedClosingBalance: string;
  readonly sign: ChartSign;
  readonly accessibleLabel: string;
};

type AnnualPathClassification =
  | "all-equal"
  | "monotonic-or-flat"
  | "starts-up-ends-down"
  | "starts-down-ends-up"
  | "changes-direction";

type AnnualEndpointClassification = "up" | "down" | "neutral";
type AnnualZeroClassification =
  | "crosses-zero"
  | "touches-zero"
  | "does-not-touch-zero";

type AnnualMultiPointSummaryClassificationId =
  | "annual:all-equal:neutral:touches-zero"
  | "annual:all-equal:neutral:does-not-touch-zero"
  | `annual:monotonic-or-flat:up:${AnnualZeroClassification}`
  | `annual:monotonic-or-flat:down:${AnnualZeroClassification}`
  | `annual:starts-up-ends-down:${AnnualEndpointClassification}:${AnnualZeroClassification}`
  | `annual:starts-down-ends-up:${AnnualEndpointClassification}:${AnnualZeroClassification}`
  | `annual:changes-direction:${AnnualEndpointClassification}:${AnnualZeroClassification}`;

type AnnualGrowthSummaryClassificationId =
  | "annual-unavailable"
  | "annual-single-point"
  | AnnualMultiPointSummaryClassificationId;

type ChartSummaryClassificationId =
  | BalanceCompositionSummaryClassificationId
  | AnnualGrowthSummaryClassificationId;

type AnnualChartTextSummary<
  TId extends Exclude<AnnualGrowthSummaryClassificationId, "annual-unavailable">
> = {
  readonly kind: "annual-summary";
  readonly chart: "annual-growth";
  readonly classificationId: TId;
  readonly visibleText: string;
  readonly selectedValueTemplate: "{label}: {fullAmount}.";
  readonly announcementTemplate: "{label}: {fullAmount}.";
};

type AnnualClassificationFor<
  TPath extends AnnualPathClassification,
  TEndpoint extends AnnualEndpointClassification,
  TZero extends AnnualZeroClassification,
  TId extends `annual:${TPath}:${TEndpoint}:${TZero}`
> = {
  readonly classificationKind: "multi-point";
  readonly pathClassification: TPath;
  readonly endpointClassification: TEndpoint;
  readonly zeroClassification: TZero;
  readonly classificationId: TId;
  readonly staticSummary: AnnualChartTextSummary<TId>;
};

type AnnualAllEqualClassification = {
  [TZero in Exclude<AnnualZeroClassification, "crosses-zero">]:
    AnnualClassificationFor<
      "all-equal",
      "neutral",
      TZero,
      `annual:all-equal:neutral:${TZero}`
    >;
}[Exclude<AnnualZeroClassification, "crosses-zero">];

type AnnualMonotonicClassification = {
  [TEndpoint in Exclude<AnnualEndpointClassification, "neutral">]: {
    [TZero in AnnualZeroClassification]: AnnualClassificationFor<
      "monotonic-or-flat",
      TEndpoint,
      TZero,
      `annual:monotonic-or-flat:${TEndpoint}:${TZero}`
    >;
  }[AnnualZeroClassification];
}[Exclude<AnnualEndpointClassification, "neutral">];

type AnnualReversalClassification<
  TPath extends
    | "starts-up-ends-down"
    | "starts-down-ends-up"
    | "changes-direction"
> = {
  [TEndpoint in AnnualEndpointClassification]: {
    [TZero in AnnualZeroClassification]: AnnualClassificationFor<
      TPath,
      TEndpoint,
      TZero,
      `annual:${TPath}:${TEndpoint}:${TZero}`
    >;
  }[AnnualZeroClassification];
}[AnnualEndpointClassification];

type AnnualMultiPointClassification =
  | AnnualAllEqualClassification
  | AnnualMonotonicClassification
  | AnnualReversalClassification<"starts-up-ends-down">
  | AnnualReversalClassification<"starts-down-ends-up">
  | AnnualReversalClassification<"changes-direction">;

type AnnualSinglePointClassification = {
  readonly classificationKind: "single-point";
  readonly classificationId: "annual-single-point";
  readonly staticSummary: AnnualChartTextSummary<"annual-single-point">;
};

type AnnualSinglePointTuple = readonly [AnnualGrowthPoint];
type AnnualMultiPointTuple = readonly [
  AnnualGrowthPoint,
  AnnualGrowthPoint,
  ...AnnualGrowthPoint[]
];

type AnnualChartCommon = {
  readonly kind: "annual-growth";
  readonly currency: CurrencyCode;
  readonly domain: ChartDomain;
  readonly ticks: readonly [
    ChartTick<"annual-y-tick-0">,
    ChartTick<"annual-y-tick-1">,
    ChartTick<"annual-y-tick-2">,
    ChartTick<"annual-y-tick-3">,
    ChartTick<"annual-y-tick-4">
  ];
  readonly labelledPointIndexes: readonly number[];
};

type AnnualSinglePointChartModel = AnnualChartCommon & {
  readonly ok: true;
  readonly modelKind: "single-point";
  readonly points: AnnualSinglePointTuple;
  readonly classification: AnnualSinglePointClassification;
};

type AnnualMultiPointChartModel = AnnualChartCommon & {
  readonly ok: true;
  readonly modelKind: "multi-point";
  readonly points: AnnualMultiPointTuple;
  readonly classification: AnnualMultiPointClassification;
};

type AnnualGrowthChartModel =
  | AnnualSinglePointChartModel
  | AnnualMultiPointChartModel;

type ChartSelectionState = {
  readonly committedIndex: number;
  readonly hoverPreviewIndex: number | null;
  readonly visibleIndex: number;
};

type InitialChartSelections = {
  readonly composition: ChartSelectionState;
  readonly annualGrowth: ChartSelectionState;
};

type CompositionChartUnavailable = {
  readonly kind: "chart-unavailable";
  readonly chart: "composition";
  readonly classificationId: "composition-unavailable";
  readonly fallbackText: "Balance composition is unavailable. Review the result summary and annual calculation detail.";
};

type AnnualChartUnavailable = {
  readonly kind: "chart-unavailable";
  readonly chart: "annual-growth";
  readonly classificationId: "annual-unavailable";
  readonly fallbackText: "Annual ending balance chart is unavailable. Review the result summary and annual calculation detail.";
};

type ChartModelBuildFailureReason =
  | "missing-data"
  | "non-finite-data"
  | "contract-mismatch";

type ChartModelBuildResult =
  | {
      readonly ok: true;
      readonly composition: BalanceCompositionChartModel;
      readonly annualGrowth: AnnualGrowthChartModel;
      readonly initialSelections: InitialChartSelections;
    }
  | {
      readonly ok: false;
      readonly reason: ChartModelBuildFailureReason;
      readonly unavailable: readonly [
        CompositionChartUnavailable,
        AnnualChartUnavailable
      ];
    };
```

The annual successful model is a discriminated union. A one-point model has `modelKind:"single-point"`, exactly one point, and `AnnualSinglePointClassification`; a two-or-more-point model has `modelKind:"multi-point"`, `AnnualMultiPointTuple`, and `AnnualMultiPointClassification`. Its path, endpoint, zero classification, `classificationId`, and `classification.staticSummary.classificationId` arise from one branch. TypeScript therefore rejects a mismatched summary ID, an all-equal/crosses-zero state, an all-equal non-neutral endpoint, a monotonic neutral endpoint, a single point disguised as a multi-point path, a multi-point model disguised as single-point, an annual summary inside composition, and a composition summary inside annual. `annual-single-point` is a stable, independently constructible successful branch. `annual-unavailable` exists only in the failed tuple. On success, `ChartModelBuildResult.initialSelections` is the sole builder-owned output for initial selection; no model independently owns selection state.

The named anchor IDs make tuple order and structural mappings unconstructable in any other order. Ordinary TypeScript `number` types cannot prove that two runtime values are equal. Therefore the builder validations in the next section—not an exaggerated type claim—guarantee A1 through A5 numeric values, `EndingBalanceStep.endAnchor.value === finalBalance`, sign/pattern consistency, and the supplied identity.

### 6.1 Stable identity algorithms

Stable ID generation is runtime behavior over validated indexes; a plain TypeScript `string` is not claimed to prove the template. The sole generators are:

```ts
function annualPointId(zeroBasedIndex: number): AnnualPointId {
  if (!Number.isInteger(zeroBasedIndex) || zeroBasedIndex < 0 || zeroBasedIndex > 99) {
    throw new RangeError("annual point index must be 0..99");
  }
  return `annual-growth-point-${zeroBasedIndex}` as AnnualPointId;
}

function annualTickId(zeroBasedTickIndex: number): AnnualTickId {
  if (!Number.isInteger(zeroBasedTickIndex) || zeroBasedTickIndex < 0 || zeroBasedTickIndex > 4) {
    throw new RangeError("annual tick index must be 0..4");
  }
  return `annual-y-tick-${zeroBasedTickIndex}` as AnnualTickId;
}

function waterfallTickId(zeroBasedTickIndex: number): WaterfallTickId {
  if (!Number.isInteger(zeroBasedTickIndex) || zeroBasedTickIndex < 0 || zeroBasedTickIndex > 4) {
    throw new RangeError("waterfall tick index must be 0..4");
  }
  return `waterfall-y-tick-${zeroBasedTickIndex}` as WaterfallTickId;
}
```

For annual points, the index is the verified `scheduleIndex` in supplied array order. For either y axis, the index is the final sorted five-tick array position. The five waterfall step IDs are the fixed `WaterfallStepId` literals in the fixed tuple order. The builder verifies point IDs are unique, tick IDs are unique within their axis, and the five step IDs are each present once in their fixed tuple order. Locale, formatted amount, viewport, device pixel ratio, color, hover, focus, pointer position, selection, and rerender do not enter any generator and cannot alter IDs.

## 7. Sole builder path and validation priority

`buildChartModels(last)` is a deterministic pure function with one successful return site and one failed return helper. The helper always returns the same frozen unavailable tuple, in composition-then-annual order, plus the directly assertable reason. All required validation completes before anchors, classification, summary, domain, ticks, labels, or selection are constructed.

The exact priority is:

1. If `last`, a required nested object, a required scalar, or a non-empty `annualSchedule` is absent, return `ok:false`, reason `missing-data`.
2. If any required numeric scalar or required numeric field in any annual row is `NaN`, `Infinity`, `-Infinity`, or otherwise fails `Number.isFinite`, return reason `non-finite-data`.
3. If data exists and is finite but violates an upstream or chart contract, return reason `contract-mismatch`.
4. Only after those checks pass, build A0–A5, five typed steps, classification, summaries, domains, ticks, labelled indexes, points, and `initialSelections`, then return the sole `ok:true` result. `annualSchedule.length === 1` builds only `AnnualSinglePointChartModel`; `annualSchedule.length >= 2` builds only `AnnualMultiPointChartModel`; length zero was already `missing-data` and cannot produce success. The builder returns `initialSelections.composition={ committedIndex:4, hoverPreviewIndex:null, visibleIndex:4 }` and `initialSelections.annualGrowth={ committedIndex:annualGrowth.points.length-1, hoverPreviewIndex:null, visibleIndex:annualGrowth.points.length-1 }`.

Contract mismatch includes at least:

- `totalFees < 0`;
- `totalContributions < 0` or an otherwise invalid supplied contribution aggregate;
- the exact identity does not hold;
- an empty, malformed, out-of-order, or structurally inconsistent annual schedule after presence/finite checks;
- row `scheduleIndex`/array order disagreement in the constructed point model;
- an annual point ID, annual tick ID, waterfall tick ID, or fixed waterfall step ID that differs from Section 6.1, is duplicated within its required scope, or is generated from display or interaction state;
- a non-integer year/month field, a month interval outside its supplied schedule contract, `startMonth > endMonth`, or a year order that is not strictly increasing;
- any anchor ID/value mapping other than A0=0, A1=initial principal, A2=A1+contributions, A3=A2+growth, A4=A3-fees, A5=final balance;
- `A4 !== A5`, since both must equal the supplied reconciled final balance;
- a growth sign/pattern/label mismatch, fee sign/geometry mismatch, or ending value unequal to `finalBalance`.

The builder does not round before identity comparison. If upstream types later use an exact integer minor-unit representation, it compares those integers. If the frozen upstream public values are numbers, it uses their frozen exact equality semantics; Phase 2C may not invent a tolerance.

These checks dominate normal predicates. For example, `finalBalance < 0` together with `totalFees < 0` returns `contract-mismatch`, never a final-negative summary. A failed build does not run the core, mutate last-valid state, fabricate values, silently repair data, or update the live region.

## 8. Deterministic composition classification and literal text

After all Section 7 validation succeeds, evaluate exactly one primary predicate in this order:

| Priority | Raw condition | Classification ID | Exact primary template |
| --- | --- | --- | --- |
| 1 | `finalBalance < 0` | `composition-final-negative` | `The supplied illustration ends at {final}. Review the listed starting balance, contributions, gross growth, and fees.` |
| 2 | `finalBalance === 0` | `composition-final-zero` | `The supplied illustration ends at {final}. Review the listed starting balance, contributions, gross growth, and fees.` |
| 3 | `grossGrowth < 0` | `composition-negative-growth` | `Under these assumptions, gross growth is {signedGrowth}; after fees of {fees}, the illustration ends at {final}.` |
| 4 | `grossGrowth === 0` | `composition-zero-growth` | `Under these assumptions, gross growth is {signedGrowth}; the illustration shows starting balance, contributions, fees, and an ending balance of {final}.` |
| 5 | `grossGrowth > 0 && totalFees > grossGrowth` | `composition-fees-exceed-positive-growth` | `Gross growth of {growth} is smaller than fees of {fees}; the illustration ends at {final}.` |
| 6 | `grossGrowth > 0 && totalFees > 0` | `composition-positive-growth-with-fees` | `This illustration starts with {starting}, adds {contributions} in contributions, shows {growth} in gross growth before {fees} in fees, and ends at {final}.` |
| 7 | `grossGrowth > 0 && totalFees === 0` | `composition-positive-growth-without-fees` | `This illustration starts with {starting}, adds {contributions} in contributions, shows {growth} in gross growth, and ends at {final}.` |

The conditions are mutually exhaustive after validation. Equality belongs to the explicit zero branches. Every template variable is a full formatted amount. `{signedGrowth}` is already signed by the currency formatter; templates add no minus sign and cannot create a double negative.

Append exactly one contribution sentence, separated by one space:

- if `totalContributions === 0`: `No regular contributions are included in this illustration.`
- if `totalContributions > 0`: `Regular contributions total {contributions} in this illustration.`

Then, if the maximum of the absolute raw values of initial principal, contributions, growth, fees, and final balance is at least `1_000_000_000`, append one space plus: `Full amounts are shown in the data list and selected-value text.`

## 9. Deterministic annual classification and literal text

Let closing balances be `p[0]` through `p[n-1]` in supplied order. For `n===1`, use only `annual-single-point`. For `n>=2`, calculate `delta[i]=p[i+1]-p[i]`. Map positive delta to `up`, negative delta to `down`, and omit zero deltas to form `directions` in original order. `switchCount` is the number of adjacent unequal pairs in `directions`.

Evaluate this ordered classification exactly once:

1. `directions.length === 0` → `all-equal`.
2. `switchCount === 0 && directions[0] === "up"` → `monotonic-or-flat` with endpoint `up`.
3. `switchCount === 0 && directions[0] === "down"` → `monotonic-or-flat` with endpoint `down`.
4. `switchCount === 1 && directions[0] === "up" && directions.at(-1) === "down"` → `starts-up-ends-down`.
5. `switchCount === 1 && directions[0] === "down" && directions.at(-1) === "up"` → `starts-down-ends-up`.
6. `switchCount >= 2` → `changes-direction`.

The builder treats an otherwise unclassified finite multi-point sequence as `contract-mismatch`; it may not choose a nearest category. Thus a direction sequence with two or more reversals can never be labelled as either single-reversal path merely because its first and last directions happen to match that path.

Endpoint compares only last to first: greater=`up`, less=`down`, equal=`neutral`. Zero classification is `crosses-zero` only when at least one point is strictly positive and another strictly negative; it is `touches-zero` when at least one point equals zero without both signs; otherwise `does-not-touch-zero`.

Reachability is closed as follows: all-equal permits only neutral and cannot cross zero; monotonic-or-flat with movement permits only up or down; each reversal path permits up, down, or neutral; single point has no artificial path/endpoint/zero fields. Every multi-point ID is exactly `annual:{path}:{endpoint}:{zero}`.

The following raw closing-balance sequences are normative classification examples: `[0]` → single-point; `[0,0,0]` → all-equal/neutral; `[0,1,2]` → monotonic-or-flat/up; `[2,1,0]` → monotonic-or-flat/down; `[0,2,1]` → starts-up-ends-down/up; `[2,0,1]` → starts-down-ends-up/down; `[0,1,0,1,0]` → changes-direction/neutral; `[0,1,0]` → starts-up-ends-down/neutral; and `[0,1,1,2]` → monotonic-or-flat/up. Each still receives the independently calculated zero classification.

Annual static text is assembled in this order: path sentence, zero sentence when applicable, endpoint sentence, final-partial sentence when applicable. Unavailable and single-point stand alone.

| Item | Exact text |
| --- | --- |
| unavailable | `Annual ending balance chart is unavailable. Review the result summary and annual calculation detail.` |
| single point | `One annual point: {pointLabel}, {amount}.` |
| all-equal | `The illustrated annual ending balance remains {firstAmount} across the recorded annual points.` |
| starts-up-ends-down | `The illustrated annual ending balance starts by rising and later declines.` |
| starts-down-ends-up | `The illustrated annual ending balance starts by declining and later rises.` |
| changes-direction | `The illustrated annual ending balance changes direction during the recorded annual points.` |
| monotonic-or-flat | `The illustrated annual ending balance moves from {firstAmount} at {firstLabel}.` |
| crosses-zero | `The recorded annual ending balances cross zero.` |
| touches-zero | `A recorded annual ending balance touches zero.` |
| endpoint up or down | `The first recorded annual ending balance is {firstAmount} and the final recorded annual ending balance is {lastAmount}.` |
| endpoint neutral | `The first and final recorded annual ending balances are both {firstAmount}.` |
| final partial | `The final recorded period covers months {startMonth}–{endMonth}.` |

No zero sentence is emitted for `does-not-touch-zero`. Full formatted amounts populate every amount template variable. Hover, committed selection, color, formatting locale, chart width, and localization do not change classification or static text selection.

## 10. Deterministic domains, ticks, and x-label indexes

### 10.1 Domain and five tick values

For waterfall, values are A0 through A5. For annual, values are all supplied closing balances. Finite validation occurs first. For either set:

```text
rawMin = min(values)
rawMax = max(values)
lower = min(0, rawMin)
upper = max(0, rawMax)
span = upper - lower

if span === 0:
  domainMin = -1
  domainMax = 1
else:
  pad = max(span * 0.05, 1)
  domainMin = lower - pad
  domainMax = upper + pad
```

This covers all zero, a single value, all-positive, all-negative, touches-zero, and crosses-zero inputs and always includes zero. `ChartDomain.includesZero` is true. Let `domainSpan=domainMax-domainMin`; the five tick values are `domainMin + domainSpan*f` for exact fractions `[0,0.25,0.5,0.75,1]`. No log scale, broken axis, crop, width-driven domain, or alternative padding is allowed. Identical raw values produce identical domains and raw ticks.

### 10.2 Compact tick reference algorithm

Compact labels orient the axis only. They have no currency symbol and never appear as a full amount, predicate input, summary amount, selected value, announcement, list value, or table value.

```ts
function roundHalfUpNonNegative(value: number): number {
  return Math.floor(value + 0.5);
}

function roundOneDecimalHalfUp(value: number): number {
  return roundHalfUpNonNegative(value * 10) / 10;
}

function compactTick(value: number): string {
  if (!Number.isFinite(value)) throw new TypeError("finite tick required");
  if (Object.is(value, -0) || value === 0) return "0";

  const sign = value < 0 ? "−" : "";
  const magnitude = Math.abs(value);
  const scales = [
    { scale: 1_000_000_000_000, suffix: "T" },
    { scale: 1_000_000_000, suffix: "B" },
    { scale: 1_000_000, suffix: "M" },
    { scale: 1_000, suffix: "K" },
    { scale: 1, suffix: "" },
  ] as const;

  let index = scales.findIndex(({ scale }) => magnitude >= scale);
  if (index < 0) index = scales.length - 1;

  if (scales[index].scale === 1) {
    const integer = roundHalfUpNonNegative(magnitude);
    return sign + new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(integer);
  }

  let rounded = roundOneDecimalHalfUp(magnitude / scales[index].scale);
  if (index > 0 && rounded >= 1000) {
    index -= 1;
    rounded = roundOneDecimalHalfUp(magnitude / scales[index].scale);
  }

  const numericText = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
  return sign + numericText + scales[index].suffix;
}
```

`.5` rounds toward the larger non-negative magnitude before the sign is restored. Integer compact results omit `.0`; non-integers retain exactly one decimal. Promotion is permitted once from K to M, M to B, or B to T. Examples: `0→0`, `999→999`, `1_250→1.3K`, `999_950→1M`, `-1_250→−1.3K`, `1_000_000_000→1B`, and negative zero→`0`.

### 10.3 Labelled annual point indexes

The result is a read-only, ascending, duplicate-free integer array:

```ts
function labelledPointIndexes(count: number): readonly number[] {
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    throw new RangeError("annual point count must be 1..100");
  }
  if (count <= 6) return Array.from({ length: count }, (_, index) => index);

  const candidates = [0, count - 1];
  for (const i of [1, 2, 3] as const) {
    candidates.push(Math.floor((i * (count - 1)) / 4 + 0.5));
  }
  return [...new Set(candidates)].sort((a, b) => a - b);
}
```

Thus `roundHalfUp(x)=floor(x+0.5)` for non-negative indexes, and an exact `.5` selects the larger integer. First and last are always included. For one through six points all are labelled; for seven through 100, the three quarter candidates are added, duplicates removed, and results sorted. Width, CSS, device pixel ratio, and localization cannot change the result.

## 11. Selection, pointer, keyboard, and assistive technology

Each figure has exactly one chart surface in the Tab sequence, with `role="group"`, named by its visible figure title and described by the exact visible instruction: `Use Left and Right Arrow to review chart values. Home selects the first value. End selects the last value.` Data points, bars, connectors, baselines, and hit regions are not focusable and create no transparent focus target.

The calculator workspace is the sole mutable owner of current chart selection state. It initializes that state only from the successful `ChartModelBuildResult.initialSelections`; composition uses its final tuple member (Ending balance, index `4`) and annual uses `points.length - 1` (the final supplied annual point). A successful builder creates these indexes only after its non-empty successful point branch is selected. `-1` is never a normal selection value.

The lifecycle event `new valid result accepted` occurs only when the existing calculator workspace accepts a successful Phase 1B evaluation as its new last-valid result, after complete valid input and calculation acceptance. It is not inferred from object reference identity, rerender count, locale, viewport, color, hover, focus, pointer state, or formatting. On that event, both charts unconditionally reset their committed selection to the new model's final index, clear hover preview, update visible selected-value text to that final item, and do not write to the announcement region. The old index is neither retained nor clamped, and no label, year, or ID restoration is attempted.

Without that event, ordinary rerender, locale/viewport/color change, hover/focus/pointer state, and an invalid or incomplete draft preserve the committed index. A stale invalid draft continues to use the old last-valid model, currency, selection, summary, and table without announcement.

Left/Right commits the adjacent index and clamps at the boundary; Home commits index 0; End commits the final index. Every handled key calls `preventDefault()` to prevent page scrolling. A same-index command or boundary clamp changes nothing and does not announce. Only a keyboard, click, or tap commitment to a different index changes committed selection and announces it.

The annual plotting rectangle is one spatial pointer/touch target. Click or tap inside it commits the nearest rendered x coordinate; an exact tie commits the earlier index. An action outside the plotting rectangle changes nothing. The plot is at least 24×24 CSS px. Each waterfall step has a non-focusable pointer hit region at least 24×24 CSS px. Keyboard can reach every annual point, including all 100 points, through the one surface.

`ChartSelectionState.visibleIndex` is the hover preview when non-null and otherwise the committed index. Hover only previews and updates visible selected-value text; it does not commit or announce. Pointer leave clears preview and restores committed text without announcement.

### 11.1 Three text carriers

The static summary describes the complete chart and is selected solely by the stable classification. It never changes for hover or committed selection and is not live.

The visible selected-value region is always present, uses a full formatted amount, contains the current step or annual period, and has neither `aria-live` nor `role="status"`. Its exact template is `{label}: {fullAmount}.`. Keyboard, click, tap, and hover may update it; pointer leave restores committed selection.

The dedicated announcement region exists with empty text on first render. It is visually hidden but remains in the accessibility tree, has `role="status"`, implicit `aria-live="polite"`, and explicit `aria-atomic="true"`. It is never dynamically added, removed, `display:none`, `visibility:hidden`, or `aria-hidden`. It receives `{label}: {fullAmount}.` only when keyboard, click, or tap truly changes the committed index. It stays unchanged for initial render, stale render, hover, programmatic restoration/reset, a same-index selection, and a boundary clamp.

Screen-reader verification must confirm one useful figure name/description, one Tab stop per chart, full values reachable through keyboard selection, no duplicate status speech, meaningful list/table fallback, and no reliance on color or SVG shape alone.

## 12. Privacy, dependencies, warnings, and system boundaries

Native SVG and local React/TypeScript are the approved implementation. No third-party chart library is approved. A dependency change is a separate HUMAN DECISION. Phase 2C adds no third-party script or asset, network request, analytics, tracking, cookie, CMP, local/session storage, account state, database, or URL mutation. It remains pure front-end and stateless. Model conversion is deterministic and pure; hover, keyboard, click, tap, and build failures never run financial calculation.

**Inherited baseline gap — outside Phase 2C implementation scope.** Phase 2A requires Phase 1B warnings in their frozen order, while the current Phase 2B workspace does not retain or render warnings. Phase 2C must not implement, reconstruct, fabricate, suppress, reorder, or claim to fix them. Correcting the gap requires separate authorization.

**The gate is no new conflict, not a claim that history has no gap.**

## 13. Reproducible performance gate

```ts
type PerformanceGateStatus = "PASS" | "FAIL" | "NOT_RUN_NOT_VERIFIED";
```

Route-JS and CLS gates both use this sole status union. No unmeasured result may be reported as PASS. Measurements run from a clean checkout of the implementation commit with no untracked build output, the lockfile unchanged, `npm ci`, and the frozen production command `npm run build:app` (which invokes the project's Next.js Webpack production build). Record OS, Node, npm, Next.js, and Chrome/Chromium versions and the commit SHA. Failure to obtain any required tool or artifact yields `NOT_RUN_NOT_VERIFIED`, not PASS.

### 13.1 Route JavaScript budget

The calculator pathname is `/`. The locked Next.js version is `16.2.11`. A route-file name is never used to guess whether a chunk is framework, runtime, or application code. The fixed 90 KiB (`90 * 1024`) budget measures the exact set difference between calculator and empty-shell route chunk sets from one measurement-only production build.

The measurement harness creates a disposable copy of the implementation commit outside the repository. It uses the same checked-out commit, unchanged `package-lock.json`, Node/npm/Next environment, and `npm ci`. Before one `next build --webpack`, it injects exactly this measurement-only file into that disposable copy:

```tsx
// app/phase2c-performance-control/page.tsx
export const dynamic = "force-static";

export default function Phase2CPerformanceControlPage() {
  return <main aria-label="Phase 2C performance control" />;
}
```

The fixture exists only in the disposable measurement copy; it is not committed, linked, deployed, indexed, or treated as a product URL. The calculator route key is `/page`; the control route key is `/phase2c-performance-control/page`. A missing key yields `NOT_RUN_NOT_VERIFIED`.

After that one production build, read exactly `.next/build-manifest.json` and the two client-reference files. For route key `/<segments>`, the client-reference path is exactly `.next/server/app/<segments>_client-reference-manifest.js`, where `<segments>` removes only the first `/`; therefore `/page` maps to `.next/server/app/page_client-reference-manifest.js` and `/phase2c-performance-control/page` maps to `.next/server/app/phase2c-performance-control/page_client-reference-manifest.js`. The client-reference manifest is evaluated only as JSON-equivalent data assigned to `globalThis.__RSC_MANIFEST`; no project code is executed.

The only permitted `build-manifest.json` fields are `polyfillFiles` and `rootMainFiles`. Both must exist and each must be an array whose every member is a non-empty string. Both arrays enter **both** route sets. `pages`, `devFiles`, `lowPriorityFiles`, `rootMainFilesTree`, and every other build-manifest field are never read and contribute no path. For each route, `clientModules` must exist as an object. Enumerate all own `clientModules` values; every value must have a `chunks` array, and every chunk member must be a non-empty string. Every member of that array enters that route's set. A missing required field, wrong container type, empty string, non-string member, or unresolved normalized file is `NOT_RUN_NOT_VERIFIED`; no member is silently skipped.

A path is JavaScript only if it ends in `.js`; CSS and every non-JavaScript path are ignored after type validation. Normalize each included path by converting `\\` to `/`, removing exactly one leading `/_next/` or `./` when present, rejecting absolute paths, `..` segments, empty final paths, and paths resolving outside `.next/`. De-duplicate with a case-sensitive set and sort using Unicode code-point order.

```text
calculatorRouteFiles = normalized JavaScript set for /page
emptyShellFiles      = normalized JavaScript set for /phase2c-performance-control/page
routeOwnedFiles      = calculatorRouteFiles - emptyShellFiles
routeOwnedGzipBytes  = Σ gzipBytes(file) for file in sorted(routeOwnedFiles)
```

The control route and calculator route are therefore from the same dependency lock, same disposable source copy, same production build, and same build environment. No filename keyword, manually selected exclusion, framework guess, or artifact from an older `.next` directory is allowed. A dynamic chart chunk used by `/` when frozen default valid input makes charts available must appear in `calculatorRouteFiles`; otherwise the measurement is `NOT_RUN_NOT_VERIFIED`.

Each owned file is read from `.next/`, compressed independently with GNU gzip `gzip -9 -n -c`, and counted as its byte length. Record the implementation commit, full lockfile SHA-256, fixture file bytes/SHA-256, OS, Node, npm, Next, and gzip versions; both manifest SHA-256 values; both normalized sorted sets; the exact set difference; every raw and gzip byte count; command lines; total; and status. Missing manifest, route key, chunk, gzip, fixture injection, clean build, an empty `routeOwnedFiles` set, or any chunk-resolution failure yields `NOT_RUN_NOT_VERIFIED`, never PASS. A completed measurement passes only when `routeOwnedGzipBytes <= 92160`; otherwise it is `FAIL`.

### 13.2 CLS budget

Use the recorded stable Chrome or Chromium version in a fresh profile with extensions disabled, default 1× device scale, local production server, cache disabled, and no network throttling because all assets are local. Use viewport 390×844 CSS px. Start on `/` with its frozen default valid inputs, six-result summary visible, and charts becoming available through the normal first-render/lazy path; do not click, scroll, or resize.

Capture layout-shift entries with `PerformanceObserver({type:"layout-shift", buffered:true})`, excluding entries with recent user input, from navigation start until network idle plus two animation frames after both charts are visible. Run five independent cold navigations. Record every run and use the maximum CLS as the gate value. `PASS` requires all five valid measurements and maximum CLS at most 0.05. Any run that cannot confirm chart availability, observer coverage, or final state makes the result `NOT_RUN_NOT_VERIFIED`; a valid maximum above 0.05 is `FAIL`.

## 14. Traceable acceptance matrix

`F` means required before freeze approval as a specification testability check; `I` means required during implementation before implementation acceptance. Type-negative cases use `tsc --noEmit` fixtures with `@ts-expect-error`; pure cases use unit tests; interaction uses DOM tests; layout/accessibility/performance use the stated manual/browser evidence.

| ID | Contract source | Test level | Expected result | Gate |
| --- | --- | --- | --- | --- |
| T01 | §6 | Type negative | Composition rejects annual summary | F/I |
| T02 | §6 | Type negative | Annual rejects composition summary | F/I |
| T03 | §6 | Type negative | Annual classification ID and summary ID mismatch fails compilation | F/I |
| T04 | §6 | Type positive | Single-point model constructs without path fields | F/I |
| T05 | §6,§9 | Type/model | Neutral endpoint constructs for all-equal and reversal models | F/I |
| T06 | §6,§9 | Type negative | all-equal/crosses-zero and monotonic/neutral cannot construct | F/I |
| T07 | §6,§9 | Generated model | Every reachable ID is produced by a real raw balance sequence | I |
| T08 | §6 | Type negative | `ok:false` without reason or with arbitrary reason fails | F/I |
| T09 | §6 | Type negative | Unavailable tuple cannot be empty, resized, reordered, or duplicated by chart kind | F/I |
| T10 | §6 | Type positive | One-point annual successful model constructs only as `modelKind:"single-point"` | F/I |
| T11 | §6 | Type positive | Two-or-more-point annual successful model constructs only as `modelKind:"multi-point"` | F/I |
| T12 | §6 | Type negative | One point with multi-point model/classification and two points with single-point model/classification fail compilation | F/I |
| T13 | §6–7 | Type/unit | Empty point sequence cannot construct a success model and follows `missing-data` failure | F/I |
| F01 | §7 | Unit | Missing structure returns `missing-data` and fixed tuple | I |
| F02 | §7 | Unit | NaN and both infinities return `non-finite-data` | I |
| F03 | §7 | Unit | Negative fees and malformed annual structure return `contract-mismatch` | I |
| F04 | §7–8 | Unit | Contract validation precedes final-negative/zero/growth predicates | I |
| F05 | §7 | Unit | Identity mismatch is not rounded, repaired, or balanced | I |
| W01 | §5–7 | Unit | Starting step is A0→A1 | I |
| W02 | §5–7 | Unit | Contribution step is A1→A2 and excludes principal | I |
| W03 | §5–7 | Unit | Growth step is A2→A3 | I |
| W04 | §5–7 | Unit | Fee step is A3→A4 | I |
| W05 | §5–7 | Unit | Ending is A0→A5 and equals final balance | I |
| W06 | §5–7 | Unit/render | A4=A5 still renders A0→A5 total, never fifth increment | I |
| W07 | §5–8 | Unit | Positive/negative/zero growth matches growth/loss/flat pattern | I |
| W08 | §5–8 | Unit | Fee-over-growth stays two separate steps | I |
| C01 | §8 | Unit | Every composition predicate, equality boundary, ID, template, and precedence is exact | I |
| C02 | §8 | Unit | Principal-only and contributions-present suffixes are exact | I |
| C03 | §8 | Unit | Extreme amount suffix and full-value carrier are exact | I |
| C04 | §8 | Unit | Signed negative growth has no double minus | I |
| A01 | §9 | Unit | Single, all-equal, monotonic up/down sequences classify exactly | I |
| A02 | §9 | Unit | Starts-up-ends-down and starts-down-ends-up classify exactly | I |
| A03 | §9 | Unit | Multiple reversal classifies changes-direction | I |
| A04 | §9 | Unit | Endpoint up, down, neutral, including first=last after movement | I |
| A05 | §9 | Unit | Crosses, touches, and does-not-touch zero remain distinct | I |
| A06 | §4,§9 | Unit/DOM | Partial point, static sentence, and selected label use separate exact templates | I |
| A07 | §9 | Unit | `switchCount` zero, one, and two-or-more follow the exact ordered algorithm | I |
| A08 | §9 | Unit | `[0,1,0,1,0]` is `changes-direction`; `[0,1,0]` is starts-up-ends-down; flat deltas do not add switches | I |
| N01 | §10.1 | Unit | All-zero, single-value, positive, negative, touching, crossing domains exact | I |
| N02 | §10.1 | Unit | Same raw values give stable domain and ticks independent of width | I |
| N03 | §10.2 | Unit | 999950 promotes to 1M; suffix thresholds and promotion exact | I |
| N04 | §10.2 | Unit | Negative, zero, negative-zero, half-up, and `.0` deletion exact | I |
| N05 | §10.2 | Unit/DOM | Full USD/EUR/GBP/CAD/AUD values never use compact text | I |
| N06 | §10.3 | Unit | Counts 1–6 label all; 7–100 use exact quarter formula | I |
| N07 | §10.3 | Unit | Exact `.5` rounds upward; indexes de-duplicate and sort | I |
| S01 | §6,§9–10 | Unit | Same raw model yields stable IDs, summary, domain, ticks | I |
| S02 | §6,§9–10 | Unit | Hover, width, color, formatter, and localization do not change IDs | I |
| S03 | §6.1 | Unit | Annual point and annual/waterfall tick IDs use exact fixed templates and are unique in scope | I |
| S04 | §6.1 | Unit | Five waterfall step IDs are fixed literals in fixed tuple order and remain unique | I |
| S05 | §6.1 | Unit | Focus and committed selection changes leave all point, tick, and step IDs byte-identical | I |
| S06 | §6.1 | Unit | Ordinary rerender without a new accepted result leaves all IDs byte-identical | I |
| S07 | §6.1 | Unit | Hover, locale, viewport, color, formatter, focus, selection, and rerender each preserve IDs | I |
| I01 | §11 | DOM | One Tab stop per chart; points/hit regions not focusable | I |
| I02 | §11 | DOM | arrows/Home/End reach all items and prevent scroll | I |
| I03 | §11 | DOM | click/tap nearest x; tie chooses earlier; outside does nothing | I |
| I04 | §11 | DOM/manual | Pointer hit regions are at least 24×24 CSS px | I |
| I05 | §11 | DOM | Hover previews, leave restores committed selection, neither announces | I |
| I06 | §11 | DOM | Initial, stale, same-index, clamp, and programmatic restore do not announce | I |
| I07 | §11 | DOM | Changed keyboard/click/tap commitment announces once | I |
| I08 | §11 | DOM | Initial composition selects Ending index 4 and initial annual selects its final point without announcement | I |
| I09 | §11 | DOM | New accepted result resets 100→1 to index 0 and 1→100 to index 99 without announcement | I |
| I10 | §11 | DOM | Invalid draft and ordinary rerender retain committed selection; locale/viewport changes do not reset it | I |
| I11 | §6–7,§11 | DOM | New accepted result resets composition to Ending index 4 without announcement; rerender does not | I |
| R01 | §3,§5 | SSR/manual | no-JS and SVG failure retain text/list/table fallback | I |
| R02 | §3,§11 | DOM | Invalid draft preserves last-valid result/currency/selection/table | I |
| L01 | §3,§5,§11 | Browser | 320 px has no chart-originated page overflow or clipped endpoint | I |
| L02 | §5,§11 | Browser | 200% and 400% zoom preserve order, controls, text, and access | I |
| L03 | §5,§11 | Manual AT | Screen reader names/describes charts and avoids duplicate speech | I |
| L04 | §5 | Browser | Forced colors preserves non-color meaning and focus | I |
| L05 | §5 | Browser | Reduced motion has no required animation | I |
| L06 | §5 | Print | Titles, summary/list, selection context, and table print | I |
| B01 | §2–4 | Unit | 1 year, long duration, and 100 points use supplied schedule only | I |
| B02 | §2,§12 | Spy test | Financial calculation call count does not increase | I |
| B03 | §12 | Integration | No dependency, third-party request, analytics, tracking, cookie, or storage | I |
| B04 | §2,§12 | Integration | URL remains unchanged through render and interaction | I |
| B05 | §4 | Unit/DOM | Nine-field annual-table authority and column order remain unchanged | I |
| B06 | §12 | Review | Warnings gap is neither changed nor claimed fixed | F/I |
| P01 | §13.1 | Build evidence | Route JS status is only `PASS`, `FAIL`, or `NOT_RUN_NOT_VERIFIED` | I |
| P02 | §13.2 | Browser evidence | CLS status is only `PASS`, `FAIL`, or `NOT_RUN_NOT_VERIFIED` | I |
| P03 | §13.1 | Build fixture | `/page` and injected control-route path sets are normalized, sorted, de-duplicated, and exact-differenced | I |
| P04 | §13.1 | Build negative | Missing manifest/key/chunk/gzip, empty owned set, malformed permitted field, or fixture failure is `NOT_RUN_NOT_VERIFIED` | I |
| P05 | §13.1 | Build evidence | Raw manifests, fixture/hash, path sets, gzip version/commands, per-file bytes, total, and budget disposition are preserved | I |

Freeze review must verify that every row has a source, level, expected result, and gate. Implementation acceptance requires evidence for every `I` row; prose assertion alone is not evidence.

## 15. Issues, freeze status, and implementation gate

- **BLOCKER: 0**
- **MUST FIX BEFORE FREEZE: 0**
- **SHOULD FIX BEFORE IMPLEMENTATION: 0**
- **HUMAN DECISION REQUIRED: 0**

This accounting was independently reviewed and passed before the human freeze authorization. It must not hide a later finding. Any newly discovered open contract issue invalidates implementation readiness and requires resolution in a new candidate followed by independent review and explicit freeze authorization.

Revision 11 is frozen. The candidate identity independently reviewed and authorized for freeze was 64,213 bytes with SHA-256 `1c8d66494aba508d95757f0b7ff4f8ce9ecc8f51aa51076a40d776efe5ba01b7`. The five gates remain separate:

1. independent Revision 11 freeze review: **PASSED**;
2. candidate file size and SHA-256 fixed: **COMPLETE**;
3. human freeze approval: **GRANTED**;
4. separate frozen evidence: **THIS DOCUMENT**;
5. separate Phase 2C implementation authorization: **NOT GRANTED**.

Freeze grants no authority to implement. Phase 2C implementation may begin only after a separate explicit authorization.

### 15.1 Revision 10 mandatory counterexamples

| Counterexample | Required result |
| --- | --- |
| one annual point plus multi-point classification | Cannot compile; only the single-point branch accepts one point. |
| two annual points plus single-point classification | Cannot compile; only the multi-point branch accepts two or more points. |
| `[0,1,0,1,0]` | `switchCount=3`; `changes-direction`; endpoint neutral. |
| `[0,1,0]` | `switchCount=1`; starts-up-ends-down; endpoint neutral. |
| `[0,1,1,2]` | Zero delta omitted; `switchCount=0`; monotonic-or-flat/up. |
| same raw model under two locales | Point/tick/step IDs are byte-identical. |
| viewport, focus, committed selection, hover, or ordinary rerender | Point/tick/step IDs are byte-identical; selection alone never changes IDs. |
| 100-point index 99 replaced by one-point valid result | Accepted-result lifecycle resets annual committed index to 0 without announcement. |
| one-point index 0 replaced by 100-point valid result | Accepted-result lifecycle resets annual committed index to 99 without announcement. |
| stale invalid draft | Old last-valid model, currency, selection, summary, and table remain; no announcement. |
| manifest lacks route key | `NOT_RUN_NOT_VERIFIED`. |
| a required route chunk is absent | `NOT_RUN_NOT_VERIFIED`. |
| calculator and empty-shell sets are equal | Empty owned set; `NOT_RUN_NOT_VERIFIED`. |
| owned gzip total exceeds 92160 | FAIL. |
| gzip unavailable | `NOT_RUN_NOT_VERIFIED`. |

## Appendix A. Revision trace

This frozen specification incorporates the full accepted Phase 2C scope, the deterministic template/classification/domain/compact-display corrections, the separated partial-period carriers, exact quarter-index and half-up rules, closed model/failure types, correlated annual classification/summary branches, fixed anchor tuple, validation priority, reproducible performance method, and traceable acceptance rows. Revision 11 additionally closes selection-return ownership, exact manifest parsing, unified performance status, and complete stable-ID evidence findings. Earlier candidates are provenance only and are not normative dependencies.

## Appendix B. Required status declaration

```text
Independent freeze review: PASSED
Specification frozen: YES
Implementation authorized: NO
Phase 2C implementation started: NO
```

**PHASE 2C REVISION 11 — FROZEN AFTER INDEPENDENT REVIEW AND EXPLICIT HUMAN APPROVAL**

**FROZEN — IMPLEMENTATION NOT AUTHORIZED — IMPLEMENTATION NOT STARTED**
