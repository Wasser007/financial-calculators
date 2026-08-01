# Compound Interest Calculator
## Phase 2A Product, UX and Visual Specification — Candidate Revision 1

**Status: PHASE 2A CANDIDATE REVISION 1 COMPLETE — AWAITING HUMAN REVIEW — NOT FROZEN**  
Prepared: 2026-07-30. This document authorizes no product implementation, deployment, analytics, advertising, CMP, affiliate activity, commit, push, or Phase 2B work.

## 1. Governance and verified baseline

This is an independent English-language product. It must not read, copy, depend on, or modify SchengenProfi. Phase 1A is the normative mathematical and URL contract; UI must call its single public evaluation API and never recreate formulas.

| Artifact | Verification |
|---|---|
| `PHASE_1A_REVISION_4_FROZEN.md` | 34,246 bytes; SHA-256 `2bc9ef28d6b768fcff130d757d20cb772c0cb9facbf38d545289de5e00b167bb` — match |
| `compound-interest-calculator-phase-1b.zip` | SHA-256 `b3fd26d4ed66ab3a93fb5947ef11e200c8fabff74829b3cea6a6c95163ed63e1` — match |
| Phase 1B gates | 75 tests passed; typecheck and build passed; V8 coverage 99.06% statements / 96.87% branches / 100% functions; `npm audit`: 0 vulnerabilities |

## 2. Research method and findings

Reviewed 2026-07-30: public pages in their published language; no copy, screenshots, source code, or visual assets will be reused. Findings below are design inferences, not endorsements.

| Market / source | What was examined | Useful lesson / adoption rationale |
|---|---|---|
| US, official — [Investor.gov, “Compound Interest Calculator”](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator) | Required initial investment, monthly contribution, time, estimated rate, variance and compounding inputs | Clear input grouping and plain explanations reduce ambiguity. Do not add its rate-variance scenario: Revision 4 defines one deterministic rate. |
| US, official — [Investor.gov, “Small Savings Add Up to Big Money”](https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/small-savings-add-big-money) | Education links compound growth to interest earned on prior interest | Put explanation after results; do not imply an estimate is a return promise. |
| US, commercial — [Bankrate, “Compound Savings Calculator”](https://www.bankrate.com/banking/savings/compound-savings-calculator/) | Calculator-led search page with savings education | Match result-first intent, but avoid product comparison, rate promotion, and ad-like result cards. |
| UK, public — [FCA, “Savings calculator”](https://www.fca.org.uk/consumers/savings-calculator) | Simple money and rate inputs, reference-only and tax caveat | Use a visible non-advice boundary and link users to neutral educational material later; tax remains out of scope. |
| UK, public — [MoneyHelper, “Tools and calculators”](https://www.moneyhelper.org.uk/en/tools-and-calculators) | Task-oriented grouping of free calculators and impartial guidance | Future content should extend by user task, not keyword-only pages. No UK-specific tax/pension model in this calculator. |
| Germany, consumer — [Verbraucherzentrale, “Rendite-Rechner”](https://www.verbraucherzentrale.de/renditerechner) | Return comparison with stated data assumptions and allocation caveats | Surface assumptions and methodology beside, not behind, results. German localization is deferred. |
| Accessibility — [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Labels/instructions, text error identification, focus, reflow, 24px minimum target size | Freeze semantic form, textual errors, visible focus, non-color status, responsive reflow and keyboard behavior. |
| Search — [Google Search Central, SoftwareApplication structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app) | Structured data must describe information presented in the body | Evaluate only truthful WebApplication/FAQ/Breadcrumb markup in Phase 3; no fabricated ratings, FinanceProduct, or rich-result expectation. |
| Ads — [Google AdSense, Ad placement policies](https://support.google.com/adsense/answer/1346295/ad-placement-policies?hl=en-GB) | Ads must not be mistaken for navigation or prompt accidental clicks | Reserve non-interactive content zones only; no ad near calculation, sharing, table or chart controls. |

**Competitive conclusion.** The market commonly prioritizes a small input set and an answer; the differentiated product should retain that clarity while making fees, inflation, deposit timing, compounding assumptions, annual ledger and deterministic sharing inspectable. It must not present investments as savings accounts, offer advice, recommend products, or assert actual future performance.

## 3. Product position, users, and boundary

**Working name:** Compound Interest Calculator. **Primary user:** an English-speaking individual comparing a long-term, fixed-assumption growth scenario before acting elsewhere. **Job:** “Show me what these stated assumptions produce, what I contributed, what growth and fees account for, and what the result means in today’s purchasing power.”

Primary launch scenarios: a recurring monthly investment plan, a one-off deposit, or a savings illustration. It differs from a simple savings calculator by explicitly modelling frequency, beginning/end contribution timing, annual fee and inflation, and showing a ledger-derived annual audit trail.

The model is appropriate only for deterministic, constant-rate illustrations. It does not model taxes, market volatility, deposits at arbitrary dates, changing contributions/rates/fees, withdrawals, account rules, inflation uncertainty, exchange rates, debt, suitability, or financial advice. Every results region carries: **“Illustration only — not investment, tax, or financial advice. Returns, fees, inflation, and outcomes can differ.”**

## 4. User journey and information architecture

1. **Header:** working-name wordmark; Methodology and Disclaimer anchors; no account, pricing, or ad UI.
2. **Hero:** H1, one-sentence value, compact non-advice note; results are not delayed by explanatory content.
3. **Calculator workspace:** inputs left / results right on desktop; results immediately below inputs on mobile.
4. **Result summary:** primary final balance, then the five supporting metrics.
5. **Balance composition chart:** visual explanation of principal, contributions, growth and fees.
6. **Annual growth chart:** ledger-derived ending balance over years.
7. **Annual detail table:** accessible audit surface.
8. **Assumptions and warnings:** fixed order from Phase 1B; link to method anchors.
9. **Share:** copy deterministic URL.
10. **Education:** compound interest, timing, fees, inflation.
11. **FAQ, methodology, disclaimer, footer.**

### Wireframes

```text
Desktop (>= 1024px)
Header
Hero + disclaimer
┌ Inputs / Simple + advanced ───┐ ┌ Results summary + Share ──────┐
│ fields; reset; Calculate       │ │ final balance; six metrics    │
└────────────────────────────────┘ └──────────────────────────────┘
Composition chart | Annual growth chart
Annual table  | Assumptions/warnings
Education → FAQ → Methodology/disclaimer → Footer

Mobile (< 768px)
Header → Hero → Inputs → Calculate → Results → Share
Composition chart (stacked) → Growth chart (scroll-safe) → Table (horizontal scroll)
Assumptions → Education → FAQ → Legal footer
```

Tablet uses a single workspace column until each control and result card remains at least 280px wide. No sticky element may obscure focused controls.

## 5. Input, validation, and calculation interaction

**Chosen trigger: hybrid.** Inputs are locally edited without calculation while text is incomplete. On blur, Enter, preset/select change, or **Calculate** press, validate and calculate if valid. After the first successful calculation, a valid completed change recomputes with a 250ms debounce; invalid/incomplete text leaves the last valid result visibly labelled “Results reflect the last valid calculation.” This avoids error flicker and keeps feedback timely. Reset immediately restores the frozen defaults and computes them. URL recovery computes once after parsing.

| Field | Control and English label | Default / format / help | Mode; accessibility and mobile |
|---|---|---|---|
| `currency` | select, “Currency” | USD; USD/EUR/GBP/CAD/AUD. “Changes display currency only; it does not convert money.” | Simple; native select; label, description, 44px target. |
| `initialPrincipal` | currency numeric input, “Starting balance” | `$10,000.00`; 0–1,000,000,000; max 2 decimals. “Amount invested today.” | Simple; `inputMode=decimal`; prefix is announced in label/description, not a sole cue. |
| `contributionAmount` | currency numeric input, “Regular contribution” | `$500.00`; 0–100,000,000; max 2 decimals. “Amount added on the selected schedule.” | Simple; decimal keypad. |
| `contributionFrequency` | select, “Contribution frequency” | Monthly; Monthly / Quarterly / Annually | Simple; native select. |
| `durationMonths` | numeric input, “Investment length” | 120 months; 1–1200 integer. Display companion “10 years.” | Simple; numeric keypad; no spinner-only interaction. |
| `nominalAnnualRate` | percent numeric input, “Estimated annual return” | 7.0000%; -99.99%–200%; max 4 decimals | Simple; decimal keypad; “constant annual assumption, not a prediction.” |
| `contributionTiming` | segmented radios, “When is each contribution added?” | End; Beginning / End | Advanced; fieldset/legend and keyboard arrow behavior. |
| `compoundingFrequency` | select, “Compounding frequency” | Monthly; Daily, Monthly, Quarterly, Semi-annually, Annually | Advanced; describe 365-day convention for Daily. |
| `nominalAnnualFeeRate` | percent numeric input, “Annual fee” | 0.0000%; 0–20%; max 4 decimals | Advanced; “modelled monthly after interest.” |
| `inflationRate` | percent numeric input, “Annual inflation rate” | 3.0000%; -99.99%–50%; max 4 decimals | Advanced; “used only for today’s-purchasing-power result.” |

Simple mode is default and contains currency, starting balance, contribution, frequency, length, and return. Advanced remains a native disclosure (not a modal); it preserves state. Each error is placed below its exact control, linked with `aria-describedby`, named in an error summary after Calculate, and uses the full Phase 1B field name mapping internally. Errors block calculation; warnings do not. Inputs restore parsed URL values or their per-field defaults; URL warnings are announced once in a status region.

## 6. Results hierarchy and wording

All raw calculation follows Revision 4; display is locale-aware (`en-US` initially), currency-aware and uses tested half-expand rounding to two decimals. Negative money is `-$1,234.56`; never render `-0.00`. On narrow screens, label and amount stack; amounts never truncate.

| Priority | Label | Meaning / state |
|---|---|---|
| 1 | **Estimated ending balance** | `finalBalance`; largest card. “Under the assumptions above after [duration].” Negative is shown truthfully, without red-only meaning. |
| 2 | Your starting balance | `initialPrincipal`; explanatory contribution, not a new calculation. |
| 3 | Total regular contributions | `totalContributions`; “Money added after the starting balance.” |
| 4 | Gross investment growth | `grossGrowth`; signed; tooltip: “Interest before modelled fees.” |
| 5 | Total fees | `totalFees`; “Fees deducted by this model.” Zero displays `$0.00`. |
| 6 | Net investment gain | `nominalInvestmentGain`; signed; “Gross growth minus modelled fees.” |
| 7 | Value in today’s dollars | `inflationAdjustedFinalBalance`; visually secondary, with “Uses the stated constant inflation assumption; not a forecast of future purchasing power.” |

The first three form a “where the balance came from” group; gross growth, fees and net gain expose effects; the real-value figure is an interpretation, never a promise.

## 7. Chart and annual-table specification

**Composition chart:** accessible horizontal stacked bar / corresponding four-row data list: starting balance, regular contributions, gross growth, fees. Fees are visually an offset/reduction, not a positive contribution. Use signed tooltip/data labels and an adjacent text sentence.

**Growth chart:** one SVG line/area series: annual ending balance from `annualSchedule`; x = completed year, y = currency. A secondary toggle is out of scope. At 100 years, retain all points but label at sensible intervals (1, 5, 10, 25 years); tooltip/focus list exposes every annual point. Never interpolate or recalculate. Negative axes include a zero baseline and a pattern/label, not color alone.

**Table:** data source is the same `annualSchedule` derived from the monthly ledger. Caption: “Annual calculation detail.” Columns: Year, Opening balance, Contributions, Gross growth, Fees, Ending balance, Cumulative contributions, Value in today’s dollars. First 10 years are visible; later years use “Show 10 more” (not a hidden data loss). At 100 years the user may reveal all. Mobile permits a labelled horizontal scroll container plus a compact year/end-balance summary; no forced tiny text. CSV download is **not in Phase 2B**; reconsider after the ledger/table experience is tested. If chart JS fails or is unavailable, retain the summary and annual table plus a text statement that the chart is unavailable.

## 8. States, warnings, and sharing

| State | Required behavior |
|---|---|
| Initial | Frozen defaults displayed; calculate button enabled; no fake loading. |
| Valid | Results, charts and table update from one evaluation result. |
| Field errors | Preserve entered text; textual per-field error; results remain last valid and are labelled stale. Focus summary only after explicit Calculate. |
| Calculation warnings | Show in Phase 1B order only: LONG_HORIZON, LARGE_AMOUNT, HIGH_RETURN_ASSUMPTION, HIGH_FEE, DEFLATION_ASSUMPTION. Yellow/amber icon plus text; never blocks. |
| URL fallback | Brief dismissible “Some link values were reset to safe defaults” status; disclose affected fields where available, without form errors. |
| Negative/large/long | Signed labels and zero baseline; no celebratory color; long/large warning rules exactly Phase 1B. |
| Copy link | Success: “Link copied.” Failure: select URL in an accessible readonly field with “Copy manually.” |
| Rendering failure | Preserve editable fields and plain summary/table fallback; “Try again” reruns evaluation; do not claim data was saved. |

Share sits in the result header and below the table. On successful, valid calculation, use `history.replaceState` after debounce (never push per keystroke). Serialize only Revision 4’s ordered non-default `v, cur, p, c, cf, ct, m, r, cmp, f, i`; default state has no query. Copy the canonical current calculator pathname plus valid query, no identity, analytics, referral or local-storage data. Canonical SEO URL excludes query; parameterized result URLs are `noindex,follow` in Phase 3. Invalid version resets all business fields; individual invalid values reset only that field and surface Phase 1B URL warnings.

## 9. English UI copy candidates

- H1: “Compound Interest Calculator”
- Value line: “See how starting money, regular contributions, fees, and inflation shape a long-term illustration.”
- Primary action: “Calculate growth”; reset: “Reset to defaults”; share: “Copy shareable link”.
- Advanced disclosure: “Advanced assumptions”.
- Method link: “See how this calculation works”.
- Non-advice note: “For illustration only. This tool does not provide investment, tax, or financial advice.”

## 10. Visual system

Original direction: **Quiet Ledger** — calm, editorial, numerical, and evidence-led. No neon gradients, coins, rocket imagery, price-ticker motifs, or green-only success semantics.

| Token role | Candidate |
|---|---|
| Canvas / surface | `#F7F8FA` / `#FFFFFF` |
| Ink / muted | `#132033` / `#526174` |
| Primary action / focus | `#155EEF`; focus ring `#84ADFF` on white (verify 3:1 non-text contrast) |
| Growth / contribution / fees | `#126B5A` / `#2E6FCE` / `#A34B18`; labels/patterns accompany color |
| Warning / error | `#8A5A00` / `#B42318`; icon plus text |
| Type | System-first sans (`ui-sans-serif`, Inter fallback only if licensed/loaded); tabular numerals for results |
| Spacing / geometry | 4px base; 16/24/32/48 section rhythm; 12px controls, 16px cards; 1px neutral borders; restrained 0 4px 16px shadow |

Controls are at least 44px high (exceeds WCAG AA 24px target minimum), have visible labels and a 2px focus outline. Result cards use size and placement rather than color for priority. Breakpoints: 0–767 one column; 768–1023 adaptable two-column results; 1024+ two-column workspace. Phase 2B is **light mode only**; dark mode is deferred until tokens, chart contrast and QA are approved.

## 11. WCAG 2.2 AA acceptance checklist

- One H1; logical H2/H3 sequence, landmarks, skip link, page language `en`.
- Every input has a programmatic label, instructions, required/allowed format, and text error identification/suggestion.
- Keyboard order follows visual task order; all controls, disclosure, chart data alternative, table reveal, copy and reset work without pointer.
- Focus is visible, sufficiently contrasted, and not obscured by sticky UI; no focus-on-input navigation change.
- Status changes use restrained `aria-live=polite`; field errors are not announced on every keystroke.
- Color is never the sole indicator; charts provide legend, patterns/data list and table alternative.
- Table uses caption, `th`, scope and responsive horizontal access; charts have concise text alternative.
- At 200% zoom and 320 CSS px, no loss of content/function; respects `prefers-reduced-motion`; no essential hover-only content.
- 44px targets are the product target; at minimum meet WCAG 2.2 AA 24px target sizing and contrast requirements.

## 12. SEO, education, privacy, ads, and performance

**Search intent:** calculate a compound-interest / regular-contribution illustration and understand assumptions. Candidate metadata: title `Compound Interest Calculator with Contributions, Fees & Inflation`; description `Estimate how a starting balance and regular contributions may grow under your chosen return, compounding, fee, and inflation assumptions.` H1 above. Canonical = actual production origin + calculator pathname, never a hard-coded domain. Phase 3 defines robots/sitemap/Open Graph and only schema matching visible content (likely BreadcrumbList and carefully evaluated WebApplication; FAQ only if visible FAQs exist). No ratings, testimonials, expertise claims, FinancialProduct, or promised rich results.

Education hierarchy: H2 “How compound interest works”; H2 “Why contribution timing matters”; H2 “How fees and inflation affect an illustration”; H2 “Frequently asked questions”; H2 “Methodology and limitations.” Future content routes: fee calculator, inflation calculator, FIRE calculator, mortgage calculator—only after independent specifications.

No advertising, affiliate, analytics, CMP, cookies or third parties in Phase 2B without a separate gate. Future ad safe zones: after the complete results/chart/table interaction and between education sections, with reserved fixed height only when enabled. Never adjacent to Calculate, Reset, Copy, selects, table pagination, chart controls, or result cards; label only “Advertisement”/“Sponsored links” where policy permits. US launch requires independent privacy review before tracking. EEA/UK/Swiss advertising requires a separate legal/CMP gate; no tag loads before the required consent decision.

Phase 2B budgets: no third-party scripts by default; initial calculator route JS <= 90 KB gzip application code excluding framework; no chart package unless separately approved; SVG chart must be lazy-rendered after summary; CLS <= 0.05; LCP <= 2.5s p75 on a mid-tier mobile profile; INP <= 200ms p75; initial request count and fonts minimized; system font baseline avoids render blocking.

## 13. Phase 2B technical architecture and test matrix

Use a small client workspace that imports Phase 1B public functions only: input draft state → validation/evaluation → one `CalculationResult` view model → results/chart/table. Keep page shell and educational content server-rendered. Use native controls, SVG and progressively disclosed HTML table. Do not add a state-management or chart library by default. Locale and currency are presentation arguments; engine is locale-free.

| Test area | Acceptance |
|---|---|
| Contract | UI defaults, ranges, enums, warning order, URL parsing/serialization match Revision 4; no duplicate calculation. |
| Interaction | incomplete input does not flicker errors; blur/Calculate/debounce semantics; stale-result label; reset; URL restore; copy success/failure. |
| Results | six metrics format correctly including negative and near-zero; charts/table equal the ledger-derived annual data. |
| Responsive | 320, 375, 768, 1024, 1440px; no overflow or clipped controls; table usable. |
| Accessibility | keyboard, focus, screen-reader labels/errors/status, contrast, zoom/reflow, reduced motion, chart alternative. |
| Performance | budget checks, no unexpected third-party requests, no hydration/console error, no material CLS. |

## 14. Explicit exclusions and risks

Excluded: implementation, accounts, saved scenarios, CSV, PDF, tax, withdrawals, changing cash flows, Monte Carlo, live rates/exchange, advice, localization pages, dark mode, ads, affiliates, GA4, CMP, legal publishing, deployment and release claims.

Risks: users may misread a deterministic rate as a forecast; mitigate with labels, method and signed results. Chart rendering can add weight or inaccessible interaction; prefer SVG/table fallback. Parameter URLs can create crawl duplication; Phase 3 must apply canonical/noindex policy. Legal identity, reviewer, domain, privacy text and content ownership remain undecided.

## 15. HUMAN DECISIONS REQUIRED BEFORE PHASE 2A FREEZE

| Decision | Recommended option / alternative | User and development impact | SEO / commercial impact and rationale |
|---|---|---|---|
| Name | Keep working name through Phase 2B / decide branded name now | Avoids premature trademark/domain work | Neutral; recommendation preserves flexibility. |
| Modes | Simple + native Advanced disclosure / one long form | Faster first calculation while retaining transparency | Better task completion; no hidden assumptions. |
| Trigger | Hybrid specified above / Calculate-only | Hybrid is responsive without input-error flicker | Stronger tool experience; calculation remains explicit. |
| Default chart | Annual ending-balance growth plus composition bar / composition only | Two complementary explanations, no new math | Supports education and differentiated transparency. |
| CSV | Exclude from Phase 2B / include | Keeps scope controlled; annual table covers audit need | Defer until user need validates added surface. |
| Dark mode | Defer / include | Avoids duplicate contrast/chart QA now | No material initial SEO benefit; defer. |
| Locale skeleton | Engine/formatter-ready, English UI only / build locale routes now | Keeps Europe-compatible without localization scope | Avoids thin translated pages; defer routes. |
| Launch content | Calculator, method, fee/inflation/timing sections, FAQ, disclaimer / full content hub | Defines minimum trust content | Recommend minimum truthful content before monetization; hub later. |

## 16. Source register

All sources accessed 2026-07-30. English: Investor.gov (2), FCA, MoneyHelper, Bankrate, Google Search Central, Google AdSense, W3C. German: Verbraucherzentrale. URLs and titles are recorded in Section 2. Sources are used for product research and policy interpretation only; final legal/compliance decisions require specialist review.

## 17. Revision 1 normative corrections

This section supersedes any conflicting wording in Sections 2 and 5–13. It is the governing Phase 2B design contract if this candidate is later frozen. It does not amend Phase 1A or Phase 1B.

### 17.1 Complete field, parsing, and validation contract

All amount controls use `type="text"` with `inputMode="decimal"`, `autocomplete="off"`, and an input pattern appropriate to decimal entry. This permits a deliberate draft such as `-` or `7.` without browser spinner coercion. While editing, values contain **no thousands separators**; result and blur-normalized presentation is locale/currency formatted. Inputs accept only an optional leading minus sign, ASCII digits, and one decimal point; commas, spaces, currency symbols, scientific notation, `NaN`, Infinity, and duplicate signs are invalid. The UI never passes a formatted amount string into the engine.

| Phase 1B field | UI label / placeholder | UI entry → core value | Core range / UI error codes and user-facing copy | Semantics and behavior |
|---|---|---|---|---|
| `currency` | Currency / — | enum unchanged | `UNSUPPORTED_ENUM`: “Choose a supported currency.” | Native select. Result symbol, separators and negative placement come from `Intl.NumberFormat(locale,{style:'currency',currency})`; USD `$`, EUR `€`, GBP `£`, CAD `CA$`/locale form, AUD `A$`/locale form are never hard-coded by the engine. |
| `initialPrincipal` | Starting balance / `10000.00` | plain decimal → number | 0–1,000,000,000, max 2 decimals. `NOT_FINITE`: “Enter a finite amount.” `OUT_OF_RANGE`: “Enter an amount from 0 to 1,000,000,000.” `TOO_MANY_DECIMALS`: “Use no more than 2 decimal places.” | “Amount invested today.” Decimal keypad. |
| `contributionAmount` | Regular contribution / `500.00` | plain decimal → number | 0–100,000,000, max 2 decimals; same finite/precision copy, range copy ends “0 and 100,000,000.” | “Amount added on the schedule below.” |
| `contributionFrequency` | Contribution frequency / — | enum unchanged | `UNSUPPORTED_ENUM`: “Choose a contribution frequency.” | Monthly, Quarterly, Annually. |
| `durationMonths` | Investment length / `120` | integer months → number | 1–1200 whole months. `INTEGER_REQUIRED`: “Enter a whole number of months.” `OUT_OF_RANGE`: “Enter 1 to 1,200 months.” | Companion text shows years/months; no secondary duration source. |
| `nominalAnnualRate` | Estimated annual return / `7.00` | **percent ÷ 100**: `7.12` → `0.0712` | -99.99%–200.00%; UI max **2** decimal places. `NOT_FINITE`: “Enter a finite percentage.” `OUT_OF_RANGE`: “Enter a percentage from -99.99% to 200.00%.” `TOO_MANY_DECIMALS`: “Use no more than 2 decimal places.” | Default `7.00%`. A fixed assumption, not a forecast. The two-decimal UI cap guarantees an at-most-four-decimal core value. |
| `contributionTiming` | When is each contribution added? / — | enum unchanged | `UNSUPPORTED_ENUM`: “Choose beginning or end of period.” | Fieldset/radio: Beginning, End; arrow-key operable. |
| `compoundingFrequency` | Compounding frequency / — | enum unchanged | `UNSUPPORTED_ENUM`: “Choose a compounding frequency.” | Daily means **365-period nominal-rate conversion to an equivalent monthly rate**, not a daily ledger. |
| `nominalAnnualFeeRate` | Annual fee / `0.00` | **percent ÷ 100**: `0.00` → `0` | 0.00%–20.00%; UI max 2 decimals; finite/range/precision messages follow the return pattern. | Default `0.00%`; in every modelled month, fee is deducted **after interest and before end-of-period contribution**. |
| `inflationRate` | Annual inflation rate / `3.00` | **percent ÷ 100**: `3.00` → `0.03` | -99.99%–50.00%; UI max 2 decimals; finite/range/precision messages follow the return pattern. | Default `3.00%`; only supports the final inflation-adjusted balance. |

`-0` is normalized to ordinary zero before evaluation. Empty/incomplete drafts have no engine error until blur or Calculate; a completed invalid value shows the mapped text error. Phase 1B error precedence, warning order, full field names, URL rules and default values remain authoritative. URL values remain core decimal values (`r=0.0712`), never display percent values.

### 17.2 Results and ledger-only annual table

There are exactly **six Phase 1B result metrics**: Estimated ending balance (`finalBalance`); Total regular contributions (`totalContributions`); Gross investment growth (`grossGrowth`); Total fees (`totalFees`); Net investment gain (`nominalInvestmentGain`); and **Inflation-adjusted ending balance** (`inflationAdjustedFinalBalance`). `initialPrincipal` is an input recap and composition component, not a seventh result. The primary card is Estimated ending balance. The copy “Value in today’s dollars” is retired because currency is not always USD.

The annual table is strictly a projection of Phase 1B `annualSchedule`, with no UI-side financial calculation. Its columns are: Year; Opening balance; Contributions; Gross growth; Fees; Ending balance; Cumulative contributions; Cumulative gross growth; Cumulative fees. Inflation-adjusted money appears only in the final six-metric result region. If a required cumulative field is not currently exposed by Phase 1B, Phase 2B must request an explicit Phase 1B contract amendment rather than calculate it in the UI.

### 17.3 Negative-growth composition chart

Replace the proposed horizontal stacked composition with an accessible **waterfall/diverging composition**: Starting balance → Contributions → signed Gross growth → negative Fees → Ending balance. Gross growth extends right/up when positive and left/down when negative; fees always reduce. Each bar has a text label, sign, value, patterned fill and ordered companion data list. A zero baseline is always visible. This uses the one calculation result only and correctly represents a negative return without treating it as a positive stack segment. The separate annual ending-balance line chart remains ledger-derived.

### 17.4 Verified visual accessibility tokens

The previous `#84ADFF` focus-ring candidate is rejected. Use **`#155EEF`** as the focus outline against `#FFFFFF`; its computed sRGB relative-luminance contrast is approximately **5.1:1**, exceeding the WCAG 2.2 non-text 3:1 threshold. Focus is a 2px solid outer outline plus 2px offset; it must remain visible on every surface. For non-white surfaces, Phase 2B must test the actual adjacent pixels and use a contrasting token rather than assume this ratio. Body text/controls still require their own WCAG AA contrast checks; focus color does not substitute for textual errors.

### 17.5 Expanded competitive-product matrix

| Product | First-screen / inputs and modes | Results, chart/table, errors, mobile/share | Content, SEO and commercial pattern | Adopt / reject / differentiation |
|---|---|---|---|---|
| [Investor.gov](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator) (US public) | Stepwise required inputs: initial investment, monthly contribution, time, rate, compounding; no fee/inflation mode exposed in reviewed page | Calculator-first; result visualization; public-page validation not treated as our contract | Educational context from a government investor-education site; no affiliate pattern | Adopt grouped plain labels and education-after-task. Reject rate variance because it is outside Revision 4. Differentiate with fees, timing, inflation and ledger. |
| [Bankrate](https://www.bankrate.com/banking/savings/compound-savings-calculator/) (US commercial) | Above-fold savings framing; balance, years, return, contribution/frequencies, Calculate; a compact single mode | Prioritizes estimated savings, total contributed, total interest; 11-point line chart in reviewed result; mobile page is calculator-led; no audited annual schedule observed | Formula/how-to/next steps plus high-yield account commercial context | Adopt result-first and concise labels. Reject product-promotion adjacency and savings-account framing; differentiate with assumptions and waterfall. |
| [NerdWallet](https://www.nerdwallet.com/calculator/interest-calculator) (US commercial) | Starting balance, time, rate, compounding, contribution/frequency; Calculate; compact default mode | Result is interest-account-oriented; reviewed page provides field explainers; share behavior not established from public read | Explicit advertiser disclosure, fact-check/writer metadata, account recommendations | Adopt clear field explainers and transparent disclosure model. Reject product recommendations in result flow; do not infer advice. |
| [Calculator.net](https://www.calculator.net/interest-calculator.html) (US/global commercial) | Broad form including initial, annual/monthly contribution, beginning/end timing, rate, compounding, tax, inflation | Detailed result rows; broad form can be cognitively dense; schedule/chart behavior is not our normative model | Formula-heavy calculator page | Adopt timing and inflation discoverability. Reject tax, multiple contribution amount sources and dense single form; keep simple/advanced split. |
| [MoneyHelper/FCA](https://www.fca.org.uk/consumers/savings-calculator) (UK public) | FCA reviewed simple pounds/rate example and reference-only boundary; MoneyHelper offers task-based calculator hub | Minimal answer and explanatory context; do not assume implementation details not visible in reviewed source | Free, impartial guidance with contextual next steps | Adopt neutral, reference-only language and task content. Reject UK tax/product assumptions from a US-first generic tool. |
| [Verbraucherzentrale Rendite-Rechner](https://www.verbraucherzentrale.de/renditerechner) (DE consumer) | Return/asset-allocation explainer with explicit historical-data assumptions, rather than simple fixed-rate calculator | Reviewed page supports sharing/printing affordances and emphasizes assumptions; it is a different return model | Consumer-protection education and methodology context | Adopt provenance/assumption transparency. Reject historical allocation simulation; keep one deterministic engine, locale-ready only. |

### 17.6 Policy and SEO matrix

| Policy / source | Frozen rule adopted |
|---|---|
| [W3C WCAG 2.2: Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast), labels, error identification and target-size criteria | Verified focus token; 2px visible outline; labels/instructions; textual per-field errors; non-color charts; 44px product targets. |
| [Google AdSense Ad placement policies](https://support.google.com/adsense/answer/1346295/ad-placement-policies?hl=en-GB) | Ads cannot resemble controls/navigation or cause accidental clicks; reserve only separated noninteractive content zones, disabled by default. |
| [Google SoftwareApplication structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app) | **Do not use SoftwareApplication markup at launch.** It requires truthful app properties such as price and aggregate rating/reviews for eligibility; this product has no authentic rating/review set and will not fabricate one. |

### 17.7 Frozen SEO and content rules

- Main calculator URL: `index,follow`; canonical is the actual production origin plus the no-query calculator pathname.
- Valid parameter-result URLs: `noindex,follow` with canonical pointing to the no-query main calculator page. Unknown/invalid parameters follow Revision 4 recovery rules and must not produce indexable duplicate states.
- Candidate title: `Compound Interest Calculator with Contributions, Fees & Inflation`.
- Candidate description: `Estimate how a starting balance and regular contributions may grow under your chosen return, compounding, fee, and inflation assumptions.`
- Open Graph: same truthful title/description; original 1200×630 editorial graphic direction is a calm ledger/chart abstraction with no currency claim, performance claim, celebrity, logo borrowing or fake output. Image implementation is deferred.
- Frozen heading outline: H1 Compound Interest Calculator; H2 Estimate your growth; H2 Your results; H2 How compound interest works; H2 How contribution timing affects the result; H2 How fees affect an illustration; H2 Inflation and today’s money; H2 Frequently asked questions; H2 Methodology and limitations. Each educational H2 may contain descriptive H3s only where needed.
- FAQ scope: assumptions vs actual returns; nominal rate vs compounding frequency; beginning vs end contribution timing; why fees lower the result; what inflation-adjusted means; whether results include tax; whether the tool saves data. Answers must match visible method and disclaimers. No FAQ-rich-result promise.
- Schema Phase 3 evaluation: BreadcrumbList only if visible breadcrumbs exist; FAQPage only if those exact FAQs are visible; Organization/WebSite only after real legal identity/domain are available. No SoftwareApplication, FinancialProduct, ratings, review, author credentials or claims not represented truthfully on-page.

### 17.8 Revised Phase 2B acceptance additions

1. UI percentage tests prove `7.12%` converts to `0.0712`; `7.123%` is rejected before engine evaluation; defaults show `7.00%`, `0.00%`, `3.00%`.
2. Table tests prove every displayed annual field is supplied by `annualSchedule`; no annual inflation field or UI recomputation exists.
3. Waterfall tests cover positive, zero and negative gross growth; fees always reduce and the companion data list matches results.
4. Visual test verifies `#155EEF` focus outline at >=3:1 against white plus focus-not-obscured behavior.
5. Formatter tests cover USD, EUR, GBP, CAD and AUD presentation for `en-US`; the engine receives no locale/currency formatting artifacts.
6. Metadata tests assert main `index,follow`, parameter `noindex,follow`, no-query canonical, and absence of SoftwareApplication markup.
