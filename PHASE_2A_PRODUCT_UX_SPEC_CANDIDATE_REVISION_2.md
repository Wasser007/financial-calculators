# Compound Interest Calculator
## Phase 2A Product, UX and Visual Specification — Candidate Revision 2

**Status: PHASE 2A CANDIDATE REVISION 2 COMPLETE — AWAITING FINAL FREEZE REVIEW — NOT FROZEN**  
Prepared 2026-07-30. This is a self-contained Phase 2A specification. It authorizes neither Phase 2B nor code, dependencies, deployment, tracking, advertising, CMP, affiliate activity, commit, push, or release.

## 1. Governance, scope, and verified baseline

This is an independent product. It must not read, copy, depend on, or modify SchengenProfi. Revision 4 and the actual Phase 1B public contract are the sole financial, validation, ledger, warning, and URL authorities. The interface consumes one Phase 1B evaluation result and does not implement financial formulas.

| Artifact | Verification |
|---|---|
| `PHASE_1A_REVISION_4_FROZEN.md` | 34,246 bytes; SHA-256 `2bc9ef28d6b768fcff130d757d20cb772c0cb9facbf38d545289de5e00b167bb` |
| `compound-interest-calculator-phase-1b.zip` | 35,154 bytes; SHA-256 `b3fd26d4ed66ab3a93fb5947ef11e200c8fabff74829b3cea6a6c95163ed63e1` |
| Revision 1 candidate | 38,159 bytes; SHA-256 `b106f4505f474a6269a89ca0d81185d1a573fbafefd26f1c87e80fb1ad752c8a` |
| Revision 1 final review | 11,496 bytes; SHA-256 `035afbe12fc7777c9e4eece89e0711b063df76eea413a6b1e92d4d94023601d4` |

Approved scope: English / `en-US`, default USD, USD/EUR/GBP/CAD/AUD presentation support, one deterministic calculation model, calculator, explanation, annual detail, accessible charts, and privacy-safe share links. Excluded: accounts, saved data, tax, withdrawals, changing cash flows, live rates, advice, localization routes, CSV, dark mode, ads, affiliate links, GA4, CMP, legal publication, deployment and launch claims.

## 2. Research evidence and product conclusion

Reviewed 2026-07-30, using public pages in their original language; no copy, design asset, code, or wording is reused.

| Product research | First-screen experience and data view | Lesson adopted / rejected |
|---|---|---|
| [Investor.gov Compound Interest Calculator](https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator) (US official) | Groups starting investment, monthly contribution, time, rate and compounding; explains compound growth | Adopt clear grouped fields and education after the task. Reject rate-variance scenarios outside the frozen engine. |
| [Bankrate Compound Interest Calculator](https://www.bankrate.com/banking/savings/compound-savings-calculator/) (US commercial) | Calculator-led result, contribution/frequency inputs, ending balance/contributions/interest and line chart | Adopt concise answer-first hierarchy. Reject product promotion adjacent to calculation results and non-auditable summaries. |
| [NerdWallet Interest Calculator](https://www.nerdwallet.com/calculator/interest-calculator) (US commercial) | Compact savings form, field explanations, editorial and advertiser disclosure | Adopt clear help text and transparent disclosure. Reject account recommendations in calculator workflow. |
| [Calculator.net Interest Calculator](https://www.calculator.net/interest-calculator.html) (US/global commercial) | Broad initial/contribution/timing/rate/compounding/tax/inflation form | Adopt discoverability of timing and inflation. Reject tax scope, duplicate annual/monthly contribution inputs, and dense default form. |
| [FCA Savings Calculator](https://www.fca.org.uk/consumers/savings-calculator) and [MoneyHelper tools](https://www.moneyhelper.org.uk/en/tools-and-calculators) (UK public) | Simple reference-only calculation within impartial task guidance | Adopt non-advice/reference boundary and task-led education. Reject UK-specific tax/pension assumptions. |
| [Verbraucherzentrale Rendite-Rechner](https://www.verbraucherzentrale.de/renditerechner) (Germany) | Method/assumption transparency around a different historical allocation model | Adopt visible assumptions and methodology. Reject historical simulation/asset allocation. |

| Policy evidence | Frozen product rule |
|---|---|
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Labels, textual errors, visible focus, non-color information, reflow and keyboard access are acceptance requirements. |
| [Google Ad placement policies](https://support.google.com/adsense/answer/1346295/ad-placement-policies?hl=en-GB) | Future ads cannot resemble content/controls or trigger accidental clicks; no ad integration is authorized. |
| [Google SoftwareApplication documentation](https://developers.google.com/search/docs/appearance/structured-data/software-app) | Launch does not use SoftwareApplication structured data: there are no authentic price/rating/review properties to expose, and none will be invented. |

**Position:** A transparent fixed-assumption growth illustration, not a savings-account recommendation or investment forecast. Core job: “Show what my stated starting balance, recurring deposits, return, fee and inflation assumptions produce—and where the result comes from.” Difference: timing, fees, inflation-adjusted end balance, ledger-derived annual audit trail and deterministic sharing. Every result region states: **“Illustration only — not investment, tax, or financial advice. Returns, fees, inflation, and outcomes can differ.”**

## 3. Approved product and interaction decisions

The launch name is **Compound Interest Calculator**; branding is deliberately deferred and does not block this phase. Default form is Simple mode plus an accessible native **Advanced assumptions** disclosure. Its open state changes no values. Keyboard and screen readers can operate it.

On first load, frozen defaults immediately produce and display a valid result. When a completed draft becomes valid, it recalculates after a **300 ms debounce**. Enter or Calculate/Recalculate evaluates immediately. Editing an incomplete or invalid draft does not clear/flicker the last valid result; it is labelled “Results reflect the last valid calculation.” Blur or explicit submit reveals field errors. Errors prevent a new result; warnings never prevent a calculation and stay in Phase 1B order: LONG_HORIZON, LARGE_AMOUNT, HIGH_RETURN_ASSUMPTION, HIGH_FEE, DEFLATION_ASSUMPTION.

Launch language and formatting environment are English / `en-US`. The calculation core, URL decimal values, and display strings remain separate. There is no locale switcher, translation system, or translated page in Phase 2B.

CSV and dark mode are deferred. The launch content is limited to compound growth, recurring contributions/timing, fee effect, inflation-adjusted meaning, fixed-assumption warning, methodology/disclaimer, and FAQs matching the visible calculator.

## 4. Information architecture and responsive layout

1. Header: working-name wordmark; Methodology and Disclaimer anchors.
2. Hero: H1 “Compound Interest Calculator”, value line, non-advice notice.
3. Workspace: Simple inputs, Advanced disclosure, Calculate/Recalculate, Reset.
4. Results: six metrics and Copy shareable link.
5. Signed waterfall/diverging composition and annual balance-growth line chart.
6. Ledger-derived annual detail table and assumptions/warnings.
7. Educational sections, FAQ, methodology/disclaimer, footer.

```text
Desktop >=1024px:  Inputs / Advanced             | Results / Copy link
                   signed waterfall              | annual growth line
                   annual table → education → FAQ → method/footer

Mobile <768px:     Header → hero → inputs → results → Copy link
                   waterfall → line chart → horizontal table → education/footer
```

At 768–1023px, collapse to one workspace column unless both panes can retain 280px minimum. Charts stack on mobile. No sticky component may obscure keyboard focus.

## 5. Input, parsing, validation, and URL contract

Every amount/percentage control uses `type="text"`, `inputMode="decimal"`, `autocomplete="off"`; input drafts contain no currency symbol or thousands separator. Allowed completed grammar is optional leading minus, digits and one decimal point. Currency signs, commas, spaces, scientific notation, `NaN`, Infinity and duplicate signs are rejected. A formatted display string never goes into the engine.

| Core field | Label / placeholder / default | UI-to-core conversion, validation and help | Mode |
|---|---|---|---|
| `currency` | Currency / — / USD | native select USD, EUR, GBP, CAD, AUD; `UNSUPPORTED_ENUM`: “Choose a supported currency.” | Simple |
| `initialPrincipal` | Starting balance / `10000.00` / 10000 | decimal number; 0–1,000,000,000; max 2 decimals. “Amount invested today.” | Simple |
| `contributionAmount` | Regular contribution / `500.00` / 500 | decimal number; 0–100,000,000; max 2 decimals. “Amount added on the selected schedule.” | Simple |
| `contributionFrequency` | Contribution frequency / — / Monthly | Monthly, Quarterly, Annually; enum error text. | Simple |
| `durationMonths` | Investment length / `120` / 120 | whole months 1–1200; companion says “10 years.” | Simple |
| `nominalAnnualRate` | Estimated annual return / `7.00` / 7.00% | UI percent ÷100, e.g. 7.12→0.0712; -99.99%–200.00%; UI max 2 decimals; “constant assumption, not a forecast.” | Simple |
| `contributionTiming` | When is each contribution added? / — / End | fieldset/radios Beginning/End; arrow-key operable. | Advanced |
| `compoundingFrequency` | Compounding frequency / — / Monthly | Daily, Monthly, Quarterly, Semi-annually, Annually; Daily is 365-period conversion to an equivalent monthly rate, not a daily ledger. | Advanced |
| `nominalAnnualFeeRate` | Annual fee / `0.00` / 0.00% | UI percent ÷100; 0.00%–20.00%; UI max 2 decimals; fee is after interest and before end contribution. | Advanced |
| `inflationRate` | Annual inflation rate / `3.00` / 3.00% | UI percent ÷100; -99.99%–50.00%; UI max 2 decimals; applies to final inflation-adjusted balance only. | Advanced |

Error text is linked to the control with `aria-describedby`, and an explicit submission provides an error summary. Finite/precision errors: “Enter a finite amount/percentage” and “Use no more than 2 decimal places.” Range errors identify the range; duration error says “Enter a whole number of months.” `-0` is ordinary zero. Warnings remain nonblocking and use full `CalculatorInputs` names internally.

Valid share URLs retain the core decimal mapping/order `v, cur, p, c, cf, ct, m, r, cmp, f, i`; default inputs serialize to no query. Use `history.replaceState`, not push per edit. Missing/unsupported versions and individual invalid values follow Phase 1B’s parser warnings and fallback behavior. URLs never include identity, saved data, tracking or formatted strings.

## 6. Result and money-presentation contract

The result summary has exactly six Phase 1B metrics:

1. **Final balance** (`finalBalance`) — visual primary result.
2. **Total contributions** (`totalContributions`).
3. **Gross growth** (`grossGrowth`), signed, before fees.
4. **Total fees** (`totalFees`).
5. **Nominal investment gain** (`nominalInvestmentGain`), gross growth minus fees.
6. **Inflation-adjusted ending balance** (`inflationAdjustedFinalBalance`), using the stated constant inflation assumption.

Starting balance is an input recap and waterfall component, never a seventh result. Negative values are shown truthfully, never by color alone; zero is `$0.00`-style through the adapter below. On small screens label and amount stack, without truncation.

Phase 1B `formatAmount(value,{currency,locale})` is explicitly **numeric-only**: it rounds/groups a number and does not emit a currency symbol. Phase 2B may add a pure presentation-layer `formatCurrencyAmount(value, currency, locale)` adapter, with no financial calculation, no mutation/round-trip of core values, and no URL role. It uses:

```text
Intl.NumberFormat(locale, {
  style: "currency", currency, currencyDisplay: "symbol",
  minimumFractionDigits: 2, maximumFractionDigits: 2
})
```

It is used consistently for result cards, table, chart tooltip and visible money summaries. Initial locale is `en-US`; currencies are USD, EUR, GBP, CAD, AUD. It must preserve the distinctive representation generated by Intl for CAD/AUD, never manually concatenate a symbol. Accessible name or adjacent context names the active three-letter currency. Tests cover each currency, positive, negative and zero values in `en-US`; engine values, share URL values and editable input drafts remain unformatted numerics.

## 7. Charts, table, warnings, and states

Default charts are: (1) annual ending-balance SVG line chart from `annualSchedule`, and (2) signed waterfall/diverging composition. The waterfall has Starting balance (increase), Contributions (increase), signed Gross growth (increase or decrease), Fees (decrease), Ending balance (final total), a clear zero baseline, labels/patterns and an ordered text data list. It must never use a stacked composition bar that hides negative growth. The line chart exposes every annual data point to keyboard/focus and a text/table fallback; at 100 years labels are thinned but points are retained.

Annual-table caption: “Annual calculation detail.” It receives **only** `annualSchedule` fields: Year; Opening balance; Contributions; Gross growth; Fees; Ending balance; Cumulative contributions; Cumulative gross growth; Cumulative fees. No annual inflation value exists or is calculated in the UI. First 10 rows are shown, then “Show 10 more”; mobile retains labelled horizontal access and a compact year/end-balance summary. CSV is not launch scope.

| State | Required behavior |
|---|---|
| Valid initial/updated | One Phase 1B evaluation feeds summary, charts and table. |
| Invalid/incomplete draft | Preserve last valid result and label it stale; blur/submit shows text error; no new calculation. |
| Warnings | Ordered, nonblocking, text plus icon/pattern; no celebratory color. |
| URL fallback | One polite status: “Some link values were reset to safe defaults”; where available, identify fields; no form error. |
| Copy success/failure | “Link copied.”; otherwise select readonly URL with “Copy manually.” |
| Chart/render failure | Keep editable form and plain summary/table; “Try again” reruns evaluation; never claim persistence. |

## 8. Visual and accessibility system

Direction: **Quiet Ledger**—calm, editorial, numerical, evidence-led; no neon, cryptocurrency cues, rockets, tickers, or performance promises. Canvas `#F7F8FA`, surface `#FFFFFF`, ink `#132033`, muted `#526174`, action/focus `#155EEF`, growth/contributions/fees `#126B5A`/`#2E6FCE`/`#A34B18`, warning/error `#8A5A00`/`#B42318`. Color is always accompanied by text, pattern, sign or icon.

Focus uses `#155EEF`, a 2px outline and 2px offset; against white it is about 5.2:1 and must meet >=3:1 non-text contrast on the actual adjacent surface. Controls are at least 44px high. Use 4px spacing base, 16/24/32/48 rhythm, 12px controls, 16px cards, 1px borders and restrained shadow. Light mode only.

WCAG 2.2 AA acceptance: one H1 and logical headings/landmarks/skip link; programmatic labels/instructions; text errors and corrections; keyboard path for all controls/charts/table/copy; visible non-obscured focus; restrained polite status messages; no color-only meaning; caption/header/scope table semantics; chart text alternative; 200% zoom/320px reflow; reduced motion; no hover-only or drag-only essential interaction.

## 9. SEO, educational content, privacy, ads, and performance

Search intent is a transparent compound-growth illustration. Frozen metadata: title **“Compound Interest Calculator with Contributions, Fees & Inflation”**; description **“Estimate how a starting balance and regular contributions may grow under your chosen return, compounding, fee, and inflation assumptions.”** Main no-query calculator page is `index,follow`; parameter result URLs are `noindex,follow` and canonical to the no-query calculator page. Canonical uses actual production origin/pathname, never a hard-coded domain.

Open Graph uses the same truthful title/description and a future original 1200×630 calm ledger/chart abstraction (no fake outcome, currency claim, celebrity, copied brand or performance claim). Frozen headings: H1 Compound Interest Calculator; H2 Estimate your growth; Your results; How compound interest works; How contribution timing affects the result; How fees affect an illustration; Inflation and today’s money; Frequently asked questions; Methodology and limitations. FAQ covers fixed assumptions, compounding, timing, fees, inflation-adjusted balance, tax exclusion and data retention. It must match visible calculator behavior. Launch uses no SoftwareApplication, WebApplication, FinancialProduct, ratings, reviews, price, credentials or unavailable schema claims. Actual SEO code follows the later implementation plan; these rules are already frozen here.

No ads, affiliate, analytics, CMP or third-party tags are authorized. Future safe zones only follow complete results/chart/table interaction or sit between education sections, visibly labelled and never adjacent to Calculate, Reset, Copy, controls, table pagination or chart interaction. US tracking needs separate privacy review; EEA/UK/Swiss advertising needs separate legal/CMP approval.

Performance targets: no third parties by default; <=90KB gzip route application code excluding framework; no chart library without separate approval; lazy SVG chart after summary; CLS <=0.05; LCP <=2.5s p75 on mid-tier mobile; INP <=200ms p75; system-font baseline and minimal requests.

## 10. Phase 2B architecture and acceptance matrix

Server-render the shell/content; use a small client workspace: draft input state → Phase 1B validation/evaluation → one result view model → summary/charts/table. Native controls, SVG and HTML table are default; no state or chart library by default. The display adapter is presentation-only as specified in §6.

| Area | Acceptance |
|---|---|
| Engine contract | Defaults/ranges/enums/errors/warnings/URL sequence equal Phase 1B; no formula outside the engine. |
| Interaction | Valid defaults immediately show result; 300ms valid debounce; Enter/Calculate immediate; stale result during invalid edit; Reset/URL/Copy behavior. |
| Results/data | Exactly six metrics; table fields solely from `annualSchedule`; positive/zero/negative waterfall; no annual inflation recompute. |
| Money display | Adapter covers USD/EUR/GBP/CAD/AUD, positive/negative/zero, en-US, accessible currency code; numeric-only Phase 1B formatter is not misrepresented. |
| A11y/responsive | Keyboard, focus, error/status, contrast, reduced motion, 320/375/768/1024/1440px, table/chart alternatives. |
| SEO/performance | Frozen robots/canonical/meta/schema exclusions; no third parties, no hydration/console errors, budgets pass. |

## 11. Final approved implementation decisions

All decisions are approved, not recommendations: working name retained; Simple plus Advanced disclosure; initial valid default result plus 300ms hybrid update; line plus signed waterfall/diverging chart; CSV deferred; dark mode deferred; English/en-US only with locale-ready presentation separation; minimum trusted education set; and presentation-layer currency adapter Option B. No human decision remains for Phase 2A scope.

## 12. Sources

Sources reviewed 2026-07-30: Investor.gov, Bankrate, NerdWallet, Calculator.net, FCA, MoneyHelper, Verbraucherzentrale, W3C WCAG 2.2, Google AdSense policy and Google Search Central SoftwareApplication documentation. Links and adoption analysis appear in §2. Legal, privacy and publication decisions require separate specialist approval.

