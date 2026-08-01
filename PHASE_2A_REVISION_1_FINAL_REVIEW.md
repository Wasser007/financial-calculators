# Phase 2A Candidate Revision 1 — Final Pre-Freeze Review

**Status: PHASE 2A REVISION 1 FINAL REVIEW COMPLETE — CHANGES REQUIRED — NOT FROZEN**  
Review date: 2026-07-30. This is a read-only contract review; it does not approve freezing or Phase 2B.

## 1. Baseline verification

| File | Required bytes / SHA-256 | Actual | Result |
|---|---|---|---|
| `PHASE_1A_REVISION_4_FROZEN.md` | 34,246 / `2bc9ef28d6b768fcff130d757d20cb772c0cb9facbf38d545289de5e00b167bb` | 34,246 / same | VERIFIED |
| `compound-interest-calculator-phase-1b.zip` | 35,154 / `b3fd26d4ed66ab3a93fb5947ef11e200c8fabff74829b3cea6a6c95163ed63e1` | 35,154 / same | VERIFIED |
| `PHASE_2A_PRODUCT_UX_SPEC_CANDIDATE_REVISION_1.md` | 38,159 / `b106f4505f474a6269a89ca0d81185d1a573fbafefd26f1c87e80fb1ad752c8a` | 38,159 / same | VERIFIED |

Phase 1B source, tests, completion report, README, `package.json`, and `package-lock.json` are present. No gate was rerun, as instructed.

## 2. Scope and method

Read the entire Revision 1, performed keyword and semantic conflict searches, and compared its data/UI claims against the actual Phase 1B public types, `evaluateCalculator`, URL parser/serializer, validation, defaults, engine, and formatter. Revision 4 and the actual Phase 1B contract—not a later document’s “supersedes” statement—are the authority.

## 3. Phase 1A/1B contract verification

### VERIFIED CONSISTENT

- `CalculatorInputs` contains exactly the specified ten fields and five currencies; defaults are USD, 10000, 500, monthly/end, 120, 0.07, monthly, 0, 0.03.
- `CalculatorSummary` contains exactly six result fields: `finalBalance`, `totalContributions`, `grossGrowth`, `totalFees`, `nominalInvestmentGain`, `inflationAdjustedFinalBalance`.
- `AnnualScheduleEntry` actually exposes: `year`, `startMonth`, `endMonth`, `openingBalance`, `contributions`, `grossGrowth`, `fees`, `closingBalance`, `cumulativeContributions`, `cumulativeGrossGrowth`, `cumulativeFees`. Thus Revision 1 §17.2’s corrected annual columns are sourceable without UI financial calculation.
- The engine aggregates annual entries from `monthlyLedger`; its order is beginning contribution → interest → fee → end contribution. Daily compounding is converted using 365 periods into the monthly equivalent rate, while the ledger remains monthly.
- Warning order is exactly LONG_HORIZON, LARGE_AMOUNT, HIGH_RETURN_ASSUMPTION, HIGH_FEE, DEFLATION_ASSUMPTION. Errors block `evaluateCalculator` from returning a result.
- URL serializer order is `v, cur, p, c, cf, ct, m, r, cmp, f, i`; defaults serialize to no query; parser uses last duplicate, rejects scientific notation, normalizes negative zero, and uses MISSING_VERSION / UNSUPPORTED_VERSION / URL_VALUE_IGNORED warnings as applicable.
- Revision 1 §17.1’s percent UI policy (two UI decimal places, divide by 100, URLs retain core decimal values), §17.2’s six-result rule, and §17.3 waterfall rule are internally sound and compatible with the calculation engine.

### Contract issue discovered

Phase 1B `formatAmount(value, {currency, locale})` explicitly discards currency (`void options.currency`) and returns a grouped **number without a currency symbol**. Its `en-US` output is `-1,234.56`, not `-$1,234.56`; its non-`en-US` path also uses decimal formatting rather than `style: 'currency'`. Revision 1 §17.1/§17.8 promises currency-symbol presentation and currency formatter tests. That promise is not presently supplied by the Phase 1B public formatting API.

## 4. Known residual-risk review

| # | Finding and evidence | Classification | Required outcome |
|---|---|---|---|
| 1 | §5 still specifies `7.0000%`, `0.0000%`, `3.0000%`, and “max 4 decimals”; §17.1 specifies two UI decimals. | MUST FIX BEFORE FREEZE | Replace the §5 rows, not merely supersede them: text controls, `7.00%`/`0.00%`/`3.00%`, max two UI decimals, and percent-to-core conversion. |
| 2 | §7 table still includes “Value in today’s dollars”; §17.2 removes it and adds cumulative growth/fees. | MUST FIX BEFORE FREEZE | Replace §7 columns with exactly the nine §17.2 columns. Retain inflation-adjusted money only in the final summary. |
| 3 | §10 still says focus ring `#84ADFF` and “verify 3:1”; §17.4 rejects it. | MUST FIX BEFORE FREEZE | Replace §10 token with `#155EEF`, 2px outline/offset, and the verified white-background contrast statement. |
| 4 | §7 still mandates a horizontal stacked composition bar; §17.3 mandates waterfall/diverging. | MUST FIX BEFORE FREEZE | Replace §7 composition definition with the signed waterfall/diverging design, zero baseline and companion data list. |
| 5 | §4 says “primary final balance, then five supporting metrics”; wireframe says “final balance; six metrics”; §6 lists seven rows including starting balance; §17.2 says six results. | MUST FIX BEFORE FREEZE | Rewrite all three locations: six summary metrics only; starting balance is an input recap/composition item; inflation metric label is currency-neutral. |
| 6 | “Value in today’s dollars” remains in §§6–7 despite §17.2 retirement. | MUST FIX BEFORE FREEZE | Replace all user-facing variants with “Inflation-adjusted ending balance”; keep explanatory copy currency-neutral. |
| 7 | §§8, 12, 14 still defer noindex/canonical and SEO implementation to Phase 3; §17.7 freezes them now. §12 also proposes WebApplication evaluation while §17.6 says no SoftwareApplication. | MUST FIX BEFORE FREEZE | Replace all Phase-3 deferrals with §17.7 rules: main index/follow, parameter noindex/follow, no-query canonical, title/description/OG/H1–H3/FAQ scope, and explicit no SoftwareApplication at launch. Leave implementation timing to Phase 3, not the rule itself. |
| 8 | §15 records recommendations and alternatives for all eight choices. Revision 1 does not evidence a project-owner decision adopting them. | HUMAN DECISION REQUIRED | The project owner must explicitly approve/reject name deferral, simple/advanced, hybrid trigger, dual chart/waterfall, CSV deferral, dark-mode deferral, English/en-US locale-ready scope, and minimum content set. Recommendations are not approvals. |
| 9 | §17.2 annual fields do exist in `AnnualScheduleEntry`; no UI recomputation is necessary. | VERIFIED CONSISTENT | Preserve the corrected annual table after replacing §7. |
| 10 | Full-text search confirms the old terms listed in findings 1–7, while §17 contains the corrected rules. The document relies on “supersedes” rather than a single rule. | MUST FIX BEFORE FREEZE | Revision 2 must physically remove/replace obsolete statements throughout, then run a residual-term search before freeze. |

## 5. Additional findings

### MUST FIX BEFORE FREEZE — formatter ownership conflict

- **Location:** §5 money fields, §6 `-$1,234.56`, §17.1 currency-symbol statement, §17.8 formatter acceptance item.
- **Current rule:** UI is required to show localized currency symbols via `Intl.NumberFormat`; Phase 1B formatting API is treated as currency-aware.
- **Authority conflict:** actual `formatAmount` ignores `currency` and supplies only a formatted numeric string. Phase 2B cannot meet the candidate’s symbol promise merely by using the public Phase 1B formatter.
- **User impact:** USD/EUR/GBP/CAD/AUD labels may be misleading or inconsistent, especially negative values and currency ambiguity.
- **Development impact:** a developer must guess whether to bypass/reimplement Phase 1B formatting, concatenate a symbol, or seek a core change.
- **Recommended unique rule:** Revision 2 must choose one explicit boundary: (A) request and obtain a separate Phase 1B amendment adding a tested `formatCurrencyAmount` API before Phase 2B; or (B) freeze a Phase 2B presentation-only adapter contract, with exact `Intl.NumberFormat` currency options and cross-locale tests, while declaring `formatAmount` numeric-only. Option B does not alter financial calculation but needs explicit owner approval because it adds a second formatting boundary. Do not claim the existing Phase 1B formatter produces currency symbols.

### NON-BLOCKING IMPROVEMENT

- §17.4 says `#155EEF` is “approximately 5.1:1”; standard sRGB calculation against white is about 5.2:1. The conservative “>=3:1” acceptance criterion is correct. Exact rounded ratio wording can be normalized in Revision 2 but does not block implementation once §10 is corrected.

## 6. BLOCKERS

**Count: 0.** No mathematical or annual-ledger data field is missing from Phase 1B. The identified issues are document-rule conflicts and one unresolved presentation ownership boundary; these are mandatory cleanup/approval matters, not a need to change the frozen engine.

## 7. MUST FIX BEFORE FREEZE

**Count: 8.**

1. Remove old percentage precision/default rules in §5.
2. Remove old annual inflation column and install annualSchedule-only table columns in §7.
3. Remove old focus token/unverified contrast language in §10.
4. Replace stacked composition chart wording in §7.
5. Unify results count and remove starting balance as a result in §§4, 6 and wireframe.
6. Remove “today’s dollars” wording throughout.
7. Unify SEO/schema rules and remove Phase-3 rule deferrals throughout §§8, 12 and 14.
8. Resolve and state the currency-symbol formatting ownership/API boundary.

## 8. VERIFIED CONSISTENT

- All three supplied baseline artifacts hash-match.
- Revision 1’s corrected percentage conversion, annualSchedule column list, warning order, URL ordered mapping, daily-equivalent-month statement, and post-interest/pre-end-contribution fee timing match Phase 1B.
- The proposed waterfall/diverging behavior correctly handles signed gross growth and fees while preserving one-source data flow.
- The revised `#155EEF` focus token satisfies the stated >=3:1 white-background requirement.
- The main/parameter indexing, canonical, FAQ scope and no-SoftwareApplication rules in §17.7 are viable policy decisions when relocated into the primary sections.

## 9. HUMAN DECISIONS REQUIRED BEFORE PHASE 2A FREEZE

**Count: 9.** The eight §15 choices remain unapproved recommendations, plus the formatting-boundary decision below.

1. Keep working name or select a brand.
2. Approve simple mode plus native Advanced disclosure or a single long form.
3. Approve hybrid calculation semantics, including immediate first-default result versus the earlier “Calculate” initial state.
4. Approve annual line plus signed waterfall/diverging composition.
5. Approve CSV deferral.
6. Approve dark-mode deferral.
7. Approve English/en-US launch with locale-ready presentation boundary only.
8. Approve the minimum trusted education/disclaimer/FAQ content set.
9. Approve format option A (core API amendment) or B (specified UI presentation adapter) from §5; this is necessary for a unique multi-currency implementation.

## 10. Freeze readiness conclusion

**Not ready to freeze.** Phase 1B’s financial computation and annual data contract are sufficient. Revision 1, however, leaves incompatible old primary rules in place and leaves the currency-formatting ownership boundary unspecified. A narrowly scoped Revision 2 cleanup plus the recorded human decisions is required. Phase 2B must remain unauthorized.

## 11. Workspace changes

Created only this report: `PHASE_2A_REVISION_1_FINAL_REVIEW.md`. No source, test, README, dependency, lockfile, candidate, baseline, or SchengenProfi file was modified. No dependencies were installed in this review.

