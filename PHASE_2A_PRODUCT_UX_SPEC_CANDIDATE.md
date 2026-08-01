# Compound Interest Calculator
## Phase 2A Product, UX and Visual Specification — Candidate

**Status: PHASE 2A CANDIDATE COMPLETE — AWAITING HUMAN REVIEW — NOT FROZEN**  
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

