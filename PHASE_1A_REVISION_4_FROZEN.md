# Compound Interest Calculator
## Phase 1A Revision 4 — Freeze Candidate

Status: **AWAITING HUMAN REVIEW — NOT FROZEN**

Prepared: 2026-07-30  
Purpose: the single, self-contained engineering baseline proposed for Phase 1B  
Supersedes: all Phase 1A Revision 3 drafts and scattered Revision 3 test results  

Revision 4 has no engineering effect until a human reviewer explicitly approves its
freeze. Phase 1B remains paused. This document does not authorize product code,
dependency installation, UI work, deployment, analytics, advertising, affiliate
links, CMP, authentication, database work, publication, or launch.

---

## 1. Product and market boundary

- New independent product; it must not read, modify, copy, depend on, or contaminate
  SchengenProfi.
- First launch market: United States.
- Second core market: Europe.
- First release language: English.
- Default currency: USD.
- Supported currencies in the first calculation contract: USD, EUR, GBP, CAD, AUD.
- One calculation engine serves every market. Locale and currency affect display,
  never mathematics.
- The engine must not depend on locale or hard-code `$`.
- The formatting boundary accepts both `currency` and `locale`.
- `en-US` is the Phase 1B display-test locale. Full European display conventions,
  translated copy, European SEO, GDPR documents and CMP behavior belong to later
  phases.
- CMP, analytics, AdSense and affiliate integrations are configuration-driven and
  default off; Phase 1B must not implement or enable them.

## 2. Normative TypeScript contracts

```ts
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
type ContributionFrequency = 'monthly' | 'quarterly' | 'annually';
type ContributionTiming = 'beginning' | 'end';
type CompoundingFrequency =
  | 'daily'
  | 'monthly'
  | 'quarterly'
  | 'semi-annually'
  | 'annually';

interface CalculatorInputs {
  currency: CurrencyCode;
  initialPrincipal: number;
  contributionAmount: number;
  contributionFrequency: ContributionFrequency;
  contributionTiming: ContributionTiming;
  durationMonths: number;
  nominalAnnualRate: number;
  compoundingFrequency: CompoundingFrequency;
  nominalAnnualFeeRate: number;
  inflationRate: number;
}

interface MonthlyLedgerEntry {
  month: number;                  // 1-based cumulative month
  year: number;                   // ceil(month / 12)
  monthOfYear: number;            // 1..12, repeating
  openingBalance: number;
  beginningContribution: number;
  interestEarned: number;         // signed
  feeCharged: number;             // non-negative for valid inputs
  endingContribution: number;
  closingBalance: number;
  cumulativeContributions: number;
  cumulativeGrossGrowth: number;  // signed algebraic sum
  cumulativeFees: number;
}

interface AnnualScheduleEntry {
  year: number;                   // 1-based calculation year
  startMonth: number;
  endMonth: number;               // may produce a partial final year
  openingBalance: number;
  contributions: number;
  grossGrowth: number;            // signed
  fees: number;
  closingBalance: number;
  cumulativeContributions: number;
  cumulativeGrossGrowth: number;
  cumulativeFees: number;
}

interface CalculatorSummary {
  finalBalance: number;
  totalContributions: number;     // excludes initialPrincipal
  grossGrowth: number;            // signed algebraic interest sum
  totalFees: number;
  nominalInvestmentGain: number;  // grossGrowth - totalFees
  inflationAdjustedFinalBalance: number;
}

interface CalculatorResult extends CalculatorSummary {
  monthlyLedger: MonthlyLedgerEntry[];
  annualSchedule: AnnualScheduleEntry[];
}

type ValidationSeverity = 'error' | 'warning';

type ValidationIssueCode =
  | 'NOT_FINITE'
  | 'OUT_OF_RANGE'
  | 'TOO_MANY_DECIMALS'
  | 'INTEGER_REQUIRED'
  | 'UNSUPPORTED_ENUM'
  | 'LONG_HORIZON'
  | 'LARGE_AMOUNT'
  | 'HIGH_RETURN_ASSUMPTION'
  | 'HIGH_FEE'
  | 'DEFLATION_ASSUMPTION'
  | 'MISSING_VERSION'
  | 'UNSUPPORTED_VERSION'
  | 'URL_VALUE_IGNORED';

interface ValidationIssue {
  code: ValidationIssueCode;
  severity: ValidationSeverity;
  field?: keyof CalculatorInputs;
  message: string; // readable English; exact wording is not frozen
}
```

Errors and warnings are separate arrays. Any error blocks calculation. Warnings
never change inputs, never change formulas and never block calculation.

## 3. Default inputs

`DEFAULT_INPUTS` is the only default-value fact source.

```ts
const DEFAULT_INPUTS: Readonly<CalculatorInputs> = Object.freeze({
  currency: 'USD',
  initialPrincipal: 10000,
  contributionAmount: 500,
  contributionFrequency: 'monthly',
  contributionTiming: 'end',
  durationMonths: 120,
  nominalAnnualRate: 0.07,
  compoundingFrequency: 'monthly',
  nominalAnnualFeeRate: 0,
  inflationRate: 0.03,
});
```

## 4. Input validation

| Field | Valid values |
|---|---|
| `currency` | exact enum whitelist |
| `initialPrincipal` | 0–1,000,000,000 inclusive; at most 2 decimal places |
| `contributionAmount` | 0–100,000,000 inclusive; at most 2 decimal places |
| `contributionFrequency` | exact enum whitelist |
| `contributionTiming` | exact enum whitelist |
| `durationMonths` | integer 1–1200 inclusive |
| `nominalAnnualRate` | −0.9999–2.0000 inclusive; at most 4 decimal places |
| `compoundingFrequency` | exact enum whitelist |
| `nominalAnnualFeeRate` | 0–0.2000 inclusive; at most 4 decimal places |
| `inflationRate` | −0.9999–0.5000 inclusive; at most 4 decimal places |

Validation precedence for a numeric field is:

1. `NOT_FINITE`;
2. `INTEGER_REQUIRED` for `durationMonths`;
3. `OUT_OF_RANGE`;
4. `TOO_MANY_DECIMALS`.

Return at most one error per field. Field order follows `CalculatorInputs` order.
`NaN` and positive or negative infinity are invalid. `-0` is valid and must be
normalized to ordinary `0` before validation output, calculation, URL output or
display. Decimal-place validation is against the canonical base-10 representation
of the supplied JavaScript number: begin with ECMAScript `String(value)` and, if
it uses exponent notation, expand it to equivalent plain decimal text without
rounding before counting fractional digits. Thus a computed input such as
`0.1 + 0.2` is judged from the number actually supplied, not from user intent.
Form-string parsing is a separate UI concern.

## 5. Deterministic calculation

### 5.1 Equivalent monthly return

For nominal annual return `r` and periods per year `n`:

```text
r_m = (1 + r / n)^(n / 12) - 1
```

| Frequency | `n` |
|---|---:|
| daily | 365 |
| monthly | 12 |
| quarterly | 4 |
| semi-annually | 2 |
| annually | 1 |

Daily compounding always uses 365 days. Valid inputs guarantee a positive power
base.

### 5.2 Monthly fee

```text
f_m = nominalAnnualFeeRate / 12
feeCharged = balanceAfterInterest × f_m
```

**Revision 4 clarification:** `balanceAfterInterest` is the opening balance plus
any beginning contribution plus that month's signed interest. This explicitly
freezes the previously unstated fee base.

### 5.3 Contribution calendar

The calendar repeats every 12 cumulative months.

| Frequency/timing | Contribution months and event |
|---|---|
| monthly/beginning | every month, beginning |
| monthly/end | every month, end |
| quarterly/beginning | months-of-year 1, 4, 7, 10, beginning |
| quarterly/end | months-of-year 3, 6, 9, 12, end |
| annually/beginning | month-of-year 1, beginning |
| annually/end | month-of-year 12, end |

No proration occurs. An annual/end contribution is therefore absent from an
11-month calculation.

### 5.4 Monthly event sequence

For each month:

```text
openingBalance
beginningContribution
interestEarned =
  (openingBalance + beginningContribution) × r_m
balanceAfterInterest =
  openingBalance + beginningContribution + interestEarned
feeCharged = balanceAfterInterest × f_m
endingContribution
closingBalance =
  balanceAfterInterest - feeCharged + endingContribution
```

No monthly currency rounding is allowed. `toFixed()` strings never enter
calculation.

### 5.5 Aggregation and identities

```text
totalContributions =
  Σ(beginningContribution + endingContribution)

grossGrowth = Σ interestEarned
totalFees = Σ feeCharged
nominalInvestmentGain = grossGrowth - totalFees

finalBalance =
  initialPrincipal
  + totalContributions
  + grossGrowth
  - totalFees

inflationAdjustedFinalBalance =
  finalBalance /
  (1 + inflationRate)^(durationMonths / 12)
```

`grossGrowth` retains its sign and must never be absolute-valued. Annual entries
are slices of `monthlyLedger` in groups of 12, including a partial final group.
They must be aggregated from ledger rows, not recalculated through a second
interest or fee loop.

Each monthly row must satisfy:

```text
closingBalance =
  openingBalance
  + beginningContribution
  + interestEarned
  - feeCharged
  + endingContribution
```

Each annual row must satisfy:

```text
closingBalance =
  openingBalance + contributions + grossGrowth - fees
```

## 6. Calculation warnings

Return warnings in this fixed order; each code appears at most once.

| Order | Code | Trigger | Field |
|---:|---|---|---|
| 1 | `LONG_HORIZON` | `durationMonths > 600` | `durationMonths` |
| 2 | `LARGE_AMOUNT` | principal > 100,000,000 or contribution > 10,000,000 | sole triggering amount field; omit if both trigger |
| 3 | `HIGH_RETURN_ASSUMPTION` | annual return > 0.5 | `nominalAnnualRate` |
| 4 | `HIGH_FEE` | annual fee > 0.05 | `nominalAnnualFeeRate` |
| 5 | `DEFLATION_ASSUMPTION` | inflation < 0 | `inflationRate` |

URL warnings are appended by the URL parser and are not calculation-assumption
warnings.

## 7. URL contract

### 7.1 Frozen key map and order

| Order | Key | Meaning |
|---:|---|---|
| 1 | `v` | URL contract version; not a business field |
| 2 | `cur` | `currency` |
| 3 | `p` | `initialPrincipal` |
| 4 | `c` | `contributionAmount` |
| 5 | `cf` | `contributionFrequency` |
| 6 | `ct` | `contributionTiming` |
| 7 | `m` | `durationMonths` |
| 8 | `r` | `nominalAnnualRate` |
| 9 | `cmp` | `compoundingFrequency` |
| 10 | `f` | `nominalAnnualFeeRate` |
| 11 | `i` | `inflationRate` |

### 7.2 Parse rules

- No query parameters: defaults, no issue.
- Unknown keys only: ignore them, defaults, no issue and no `v` required.
- If any recognized business key exists, the last `v` must be exactly `1`.
- Recognized business key without `v`: ignore all business parameters, restore
  defaults, one `MISSING_VERSION` warning without a business field.
- Last `v` not exactly `1`: ignore all business parameters, restore defaults,
  one `UNSUPPORTED_VERSION` warning without a business field. Do not emit
  per-field URL warnings.
- Duplicate keys, including `v`: last value wins.
- With valid `v=1`, one invalid business value falls back only that field and
  emits one `URL_VALUE_IGNORED` warning bound to the full input field name.
- If several business fields are invalid under valid `v=1`, emit one ignored
  warning per invalid field in the frozen business-key order
  `cur,p,c,cf,ct,m,r,cmp,f,i`, regardless of their order in the incoming query.
- Unknown keys are always ignored without issues.
- URL enum matching is exact and case-sensitive.
- A numeric URL token is valid only if it matches:
  `^-?(?:0|[1-9]\d*)(?:\.\d+)?$`.
- Empty strings, leading `+`, redundant signs, leading-zero integer forms such
  as `01`, trailing decimal points, scientific notation, `NaN`, `Infinity`,
  whitespace and percent signs are invalid.
- The parsed number must then pass the same finite, integer, range and precision
  rules as direct input.
- URL `-0`, `-0.0`, etc. are valid and normalize to ordinary `0`.
- URL parser issues are warnings, not form errors.

### 7.3 Serialization rules

- Normalize `-0` before comparison.
- If all ten fields equal `DEFAULT_INPUTS`, serialize to an empty query.
- Otherwise emit `v=1`, followed only by non-default business fields.
- Use the frozen order above.
- Use canonical enum tokens.
- Serialize finite numbers as plain base-10 text without exponent notation,
  leading `+`, unnecessary leading/trailing zeroes or trailing decimal point.
- Serializer output must parse back to the same normalized inputs.
- Origin, pathname and canonical URL construction are outside the pure query
  serializer. Later callers must use their actual origin and pathname; no US
  domain or root path may be hard-coded.

## 8. Display formatting

Phase 1B exposes a pure formatter that accepts at least:

```ts
formatAmount(
  value: number,
  options: { currency: CurrencyCode; locale: string }
): string
```

The `currency` parameter is mandatory even though the Revision 4 numeric
baseline intentionally omits the currency symbol; symbol placement and
market-specific currency labels are deferred to Phase 2. For the frozen
`en-US` baseline:

- comma grouping;
- period decimal separator;
- exactly two fraction digits;
- decimal `halfExpand`: positive and negative ties round away from zero;
- a value whose rounded result is zero displays `0.00`, never `-0.00`;
- calculation is not changed by formatting.

Required formatter cases:

| Input | Expected |
|---:|---:|
| `0` | `0.00` |
| `-0` | `0.00` |
| `0.004999` | `0.00` |
| `-0.004999` | `0.00` |
| `0.005` | `0.01` |
| `-0.005` | `-0.01` |
| `1.005` | `1.01` |
| `-1.005` | `-1.01` |
| `1234567.8` | `1,234,567.80` |

For these Phase 1B numeric-baseline strings, changing only the supported
`currency` argument does not change the string. This is deliberate: the
parameter prevents a US-only API, while visible symbols and currency labels
remain a Phase 2 decision.

Use an explicitly tested decimal half-expand implementation if the supported
Node/browser matrix cannot guarantee `Intl.NumberFormat` rounding behavior.

## 9. Numeric comparison tolerance

For raw values and every accounting identity:

```text
abs(actual - expected) <=
max(
  1e-9,
  1e-12 × max(1, abs(actual), abs(expected))
)
```

Do not test raw results with a two-decimal ±0.01 tolerance. Display strings are
exact string comparisons.

## 10. V01–V12 coverage matrix

| ID | Primary purpose |
|---|---|
| V01 | defaults; monthly/end; monthly compounding; 10-year full schedule |
| V02 | EUR; annual/end; annual compounding; contribution on month 12 |
| V03 | GBP; monthly/beginning; daily compounding; fee; partial final year |
| V04 | CAD; quarterly/beginning; quarterly compounding |
| V05 | AUD; quarterly/end; semi-annual compounding |
| V06 | negative return; signed negative growth; fee |
| V07 | zero contributions; nonzero return and fee |
| V08 | 11-month horizon; annual/end contribution must not occur |
| V09 | zero principal; annual/beginning contribution; repeating year calendar |
| V10 | zero growth and fee; inflation-only adjustment |
| V11 | one-month valid upper rate/fee/inflation boundaries; warnings |
| V12 | one-month exact balance; annual/end contribution absent |

All five compounding frequencies, all three contribution frequencies and both
timings are covered across the set.

## 11. Complete valid vectors

The following array order and IDs are frozen. Every object contains all ten
inputs, all six raw expected values, and all six exact `en-US` display strings.

```ts
const validVectors = [
  {
    id: 'V01',
    inputs: { currency:'USD', initialPrincipal:10000, contributionAmount:500, contributionFrequency:'monthly', contributionTiming:'end', durationMonths:120, nominalAnnualRate:0.07, compoundingFrequency:'monthly', nominalAnnualFeeRate:0, inflationRate:0.03 },
    expectedRaw: { finalBalance:106639.01748372454, totalContributions:60000, grossGrowth:36639.017483724514, totalFees:0, nominalInvestmentGain:36639.017483724514, inflationAdjustedFinalBalance:79349.4440002049 },
    expectedDisplay: { finalBalance:'106,639.02', totalContributions:'60,000.00', grossGrowth:'36,639.02', totalFees:'0.00', nominalInvestmentGain:'36,639.02', inflationAdjustedFinalBalance:'79,349.44' },
  },
  {
    id: 'V02',
    inputs: { currency:'EUR', initialPrincipal:1000, contributionAmount:100, contributionFrequency:'annually', contributionTiming:'end', durationMonths:24, nominalAnnualRate:0.10, compoundingFrequency:'annually', nominalAnnualFeeRate:0, inflationRate:0 },
    expectedRaw: { finalBalance:1420.0000000000005, totalContributions:200, grossGrowth:220.00000000000065, totalFees:0, nominalInvestmentGain:220.00000000000065, inflationAdjustedFinalBalance:1420.0000000000005 },
    expectedDisplay: { finalBalance:'1,420.00', totalContributions:'200.00', grossGrowth:'220.00', totalFees:'0.00', nominalInvestmentGain:'220.00', inflationAdjustedFinalBalance:'1,420.00' },
  },
  {
    id: 'V03',
    inputs: { currency:'GBP', initialPrincipal:2500, contributionAmount:200, contributionFrequency:'monthly', contributionTiming:'beginning', durationMonths:18, nominalAnnualRate:0.0525, compoundingFrequency:'daily', nominalAnnualFeeRate:0.006, inflationRate:0.021 },
    expectedRaw: { finalBalance:6416.312562394381, totalContributions:3600, grossGrowth:357.2313064350937, totalFees:40.918744040715765, nominalInvestmentGain:316.31256239437795, inflationAdjustedFinalBalance:6219.377222185905 },
    expectedDisplay: { finalBalance:'6,416.31', totalContributions:'3,600.00', grossGrowth:'357.23', totalFees:'40.92', nominalInvestmentGain:'316.31', inflationAdjustedFinalBalance:'6,219.38' },
  },
  {
    id: 'V04',
    inputs: { currency:'CAD', initialPrincipal:12000, contributionAmount:1500, contributionFrequency:'quarterly', contributionTiming:'beginning', durationMonths:27, nominalAnnualRate:0.08, compoundingFrequency:'quarterly', nominalAnnualFeeRate:0.01, inflationRate:0.025 },
    expectedRaw: { finalBalance:28756.45948180777, totalContributions:13500, grossGrowth:3728.7547419757616, totalFees:472.2952601679935, nominalInvestmentGain:3256.459481807768, inflationAdjustedFinalBalance:27202.36835283648 },
    expectedDisplay: { finalBalance:'28,756.46', totalContributions:'13,500.00', grossGrowth:'3,728.75', totalFees:'472.30', nominalInvestmentGain:'3,256.46', inflationAdjustedFinalBalance:'27,202.37' },
  },
  {
    id: 'V05',
    inputs: { currency:'AUD', initialPrincipal:50000, contributionAmount:3000, contributionFrequency:'quarterly', contributionTiming:'end', durationMonths:36, nominalAnnualRate:0.065, compoundingFrequency:'semi-annually', nominalAnnualFeeRate:0.0125, inflationRate:0.0325 },
    expectedRaw: { finalBalance:97024.28324938507, totalContributions:36000, grossGrowth:13710.726379620519, totalFees:2686.443130235431, nominalInvestmentGain:11024.283249385087, inflationAdjustedFinalBalance:88147.55330262339 },
    expectedDisplay: { finalBalance:'97,024.28', totalContributions:'36,000.00', grossGrowth:'13,710.73', totalFees:'2,686.44', nominalInvestmentGain:'11,024.28', inflationAdjustedFinalBalance:'88,147.55' },
  },
  {
    id: 'V06',
    inputs: { currency:'USD', initialPrincipal:10000, contributionAmount:250, contributionFrequency:'monthly', contributionTiming:'end', durationMonths:24, nominalAnnualRate:-0.12, compoundingFrequency:'annually', nominalAnnualFeeRate:0.02, inflationRate:0.03 },
    expectedRaw: { finalBalance:12666.408048950618, totalContributions:6000, grossGrowth:-2884.6737808201046, totalFees:448.91817022927785, nominalInvestmentGain:-3333.5919510493823, inflationAdjustedFinalBalance:11939.304410359711 },
    expectedDisplay: { finalBalance:'12,666.41', totalContributions:'6,000.00', grossGrowth:'-2,884.67', totalFees:'448.92', nominalInvestmentGain:'-3,333.59', inflationAdjustedFinalBalance:'11,939.30' },
  },
  {
    id: 'V07',
    inputs: { currency:'EUR', initialPrincipal:7500, contributionAmount:0, contributionFrequency:'monthly', contributionTiming:'end', durationMonths:30, nominalAnnualRate:0.09, compoundingFrequency:'monthly', nominalAnnualFeeRate:0.025, inflationRate:0 },
    expectedRaw: { finalBalance:8815.38306523069, totalContributions:0, grossGrowth:1826.5685765980536, totalFees:511.18551136736755, nominalInvestmentGain:1315.383065230686, inflationAdjustedFinalBalance:8815.38306523069 },
    expectedDisplay: { finalBalance:'8,815.38', totalContributions:'0.00', grossGrowth:'1,826.57', totalFees:'511.19', nominalInvestmentGain:'1,315.38', inflationAdjustedFinalBalance:'8,815.38' },
  },
  {
    id: 'V08',
    inputs: { currency:'GBP', initialPrincipal:1000, contributionAmount:1200, contributionFrequency:'annually', contributionTiming:'end', durationMonths:11, nominalAnnualRate:0.06, compoundingFrequency:'daily', nominalAnnualFeeRate:0, inflationRate:0 },
    expectedRaw: { finalBalance:1056.5358390671306, totalContributions:0, grossGrowth:56.53583906713061, totalFees:0, nominalInvestmentGain:56.53583906713061, inflationAdjustedFinalBalance:1056.5358390671306 },
    expectedDisplay: { finalBalance:'1,056.54', totalContributions:'0.00', grossGrowth:'56.54', totalFees:'0.00', nominalInvestmentGain:'56.54', inflationAdjustedFinalBalance:'1,056.54' },
  },
  {
    id: 'V09',
    inputs: { currency:'CAD', initialPrincipal:0, contributionAmount:5000, contributionFrequency:'annually', contributionTiming:'beginning', durationMonths:25, nominalAnnualRate:0.04, compoundingFrequency:'monthly', nominalAnnualFeeRate:0.005, inflationRate:0.02 },
    expectedRaw: { finalBalance:15584.8672275017, totalContributions:15000, grossGrowth:668.7381353044682, totalFees:83.87090780276681, nominalInvestmentGain:584.8672275017013, inflationAdjustedFinalBalance:14954.988459503482 },
    expectedDisplay: { finalBalance:'15,584.87', totalContributions:'15,000.00', grossGrowth:'668.74', totalFees:'83.87', nominalInvestmentGain:'584.87', inflationAdjustedFinalBalance:'14,954.99' },
  },
  {
    id: 'V10',
    inputs: { currency:'USD', initialPrincipal:10000, contributionAmount:0, contributionFrequency:'monthly', contributionTiming:'end', durationMonths:12, nominalAnnualRate:0, compoundingFrequency:'annually', nominalAnnualFeeRate:0, inflationRate:0.10 },
    expectedRaw: { finalBalance:10000, totalContributions:0, grossGrowth:0, totalFees:0, nominalInvestmentGain:0, inflationAdjustedFinalBalance:9090.90909090909 },
    expectedDisplay: { finalBalance:'10,000.00', totalContributions:'0.00', grossGrowth:'0.00', totalFees:'0.00', nominalInvestmentGain:'0.00', inflationAdjustedFinalBalance:'9,090.91' },
  },
  {
    id: 'V11',
    inputs: { currency:'AUD', initialPrincipal:100, contributionAmount:10, contributionFrequency:'quarterly', contributionTiming:'beginning', durationMonths:1, nominalAnnualRate:2.0, compoundingFrequency:'quarterly', nominalAnnualFeeRate:0.2, inflationRate:0.5 },
    expectedRaw: { finalBalance:123.81992390285207, totalContributions:10, grossGrowth:15.918566680866507, totalFees:2.0986427780144417, nominalInvestmentGain:13.819923902852064, inflationAdjustedFinalBalance:119.70609431425146 },
    expectedDisplay: { finalBalance:'123.82', totalContributions:'10.00', grossGrowth:'15.92', totalFees:'2.10', nominalInvestmentGain:'13.82', inflationAdjustedFinalBalance:'119.71' },
  },
  {
    id: 'V12',
    inputs: { currency:'USD', initialPrincipal:1, contributionAmount:999, contributionFrequency:'annually', contributionTiming:'end', durationMonths:1, nominalAnnualRate:0, compoundingFrequency:'annually', nominalAnnualFeeRate:0, inflationRate:0 },
    expectedRaw: { finalBalance:1, totalContributions:0, grossGrowth:0, totalFees:0, nominalInvestmentGain:0, inflationAdjustedFinalBalance:1 },
    expectedDisplay: { finalBalance:'1.00', totalContributions:'0.00', grossGrowth:'0.00', totalFees:'0.00', nominalInvestmentGain:'0.00', inflationAdjustedFinalBalance:'1.00' },
  },
] as const;
```

### 11.1 Required assertions for every valid vector

- all six raw values use the combined tolerance;
- all six display strings match exactly;
- `monthlyLedger.length === durationMonths`;
- `annualSchedule.length === Math.ceil(durationMonths / 12)`;
- every monthly row matches an independent reference implementation field by
  field under the combined tolerance;
- every annual row matches an independent reference implementation field by
  field under the combined tolerance;
- every monthly, annual and summary identity passes;
- annual data equals aggregation of production `monthlyLedger`, not a second
  production calculation path;
- all returned numeric values are finite;
- V06 `grossGrowth` and `nominalInvestmentGain` are negative;
- V08 and V12 make no annual/end contribution because month 12 is not reached;
- V11 emits, in order, `HIGH_RETURN_ASSUMPTION`, `HIGH_FEE` and no other
  calculation warning.

Audit-only SHA-256 fingerprints of JavaScript `JSON.stringify` output are listed
below to detect accidental fixture drift. They do not replace tolerance-based
numeric assertions and are not portable across altered field order or numeric
serialization.

| ID | Monthly ledger SHA-256 | Annual schedule SHA-256 |
|---|---|---|
| V01 | `2df0a8ce3999b67f9de9d4b185700dcbb61d99a366e5a7df4c083a11ae5f53fd` | `a7f58b90259128c599fe2fcf8392db1f557ae7be0b7f3bc52a7d83a1de194219` |
| V02 | `0b75848bcea083eae425c3b871a3d1591bdf15cde8880ab3fe4d895751dcea19` | `fea77c2a696207de8cd1ca52eedfb736c990c927e2c193fc8f406ecdae055bfa` |
| V03 | `e1b6c3bda057c5ddb1d74ea07f00d327d6edc966e3d8aab275f822b9749b54f3` | `d0521acd43ca84f3ad2a167814258f7a93f7cd56c7bd082da61501bcf50814f8` |
| V04 | `c5a21051928e8370948085df5e0b71fedd139762f4ae112d211afb0bc728920a` | `d409e0b8cea351e6d252d3cde2bd12c9497416d6e609ca242ab408bec202645e` |
| V05 | `f3dd4b74684ed7593db950a3d23aa95965e5210976834b6f85a07d7c4472731a` | `7e4aa7cf4cc924874bb5e67a993add3e768b28ad36ae79bb8cd30ba622a9adf3` |
| V06 | `c5221000a01f477c8f6a40bb145a2c690d7382462d51d203206092b71a26803d` | `f61106936f13f738b62d13f274728a15877aef7fe3d396da6f746bb166bf7ec1` |
| V07 | `db10364389cc8e3155fa326797c9de5e4c98249fd92fe9c0e87c583f2436feb2` | `b0c7a41c53e6696115ba747c9ef187457c4170b4a790cae870203166980cd51c` |
| V08 | `c043e80479b1d0775c41e267a0bfd38925151d789eaa03815bab5dd93eab14b4` | `64f298df2377d99fa8bc44d741cfed94c0def918df2a80dc5a2fdb602badfcdb` |
| V09 | `b2d3c89163b4a991fd4aaa064c4f88dbd72ca5bef425a0907b0b045267e84fa3` | `aa224d06bbf99230101b8bef2d7194e2ea33ad3782df690d653f5dd5502ce721` |
| V10 | `e88d8cac19672722746e7c1963fc5da9e8875b861d4a537d33883f48585b1963` | `f6ad02c49ec4cb415534548714068813bfd74fd4ace7324b71892047a567b54f` |
| V11 | `5c2bc1c758181ef48a587f092fa0acbea720cfbfd73dadd67b2e2dcc495df73d` | `eb0ee7f06e3bf88b75457d2423c49aae35a714c95b99b2adef26c9ccef54ca1e` |
| V12 | `dac1c8b9044a86dc5819ec42a1c714cccc8dd12a770cbb4b1b1eb605ac0e9cd8` | `838072451c4da73baab111639210f01be25c223e3050e9a9ff1c9e0405ba1dab` |

## 12. S01 stress vector

```ts
const S01: CalculatorInputs = {
  currency: 'USD',
  initialPrincipal: 1_000_000_000,
  contributionAmount: 100_000_000,
  contributionFrequency: 'monthly',
  contributionTiming: 'end',
  durationMonths: 1200,
  nominalAnnualRate: 0,
  compoundingFrequency: 'monthly',
  nominalAnnualFeeRate: 0,
  inflationRate: 0,
};
```

Expected:

```ts
{
  finalBalance: 121_000_000_000,
  totalContributions: 120_000_000_000,
  grossGrowth: 0,
  totalFees: 0,
  nominalInvestmentGain: 0,
  inflationAdjustedFinalBalance: 121_000_000_000,
  monthlyLedgerLength: 1200,
  annualScheduleLength: 100,
  allNumericResultsFinite: true,
}
```

S01 legitimately emits `LONG_HORIZON`, `LARGE_AMOUNT` with no field because both
amount fields trigger, and no other warning.

## 13. Complete invalid and behavior matrix I01–I24

For I01–I16, start with `DEFAULT_INPUTS` and replace only the listed field. Each
expects exactly one `severity: 'error'` issue with the listed code and field;
calculation must not run.

| ID | Field | Replacement | Expected code |
|---|---|---|---|
| I01 | `initialPrincipal` | `-0.01` | `OUT_OF_RANGE` |
| I02 | `initialPrincipal` | `1000000000.01` | `OUT_OF_RANGE` |
| I03 | `contributionAmount` | `0.001` | `TOO_MANY_DECIMALS` |
| I04 | `durationMonths` | `12.5` | `INTEGER_REQUIRED` |
| I05 | `durationMonths` | `0` | `OUT_OF_RANGE` |
| I06 | `durationMonths` | `1201` | `OUT_OF_RANGE` |
| I07 | `nominalAnnualRate` | `-1` | `OUT_OF_RANGE` |
| I08 | `nominalAnnualRate` | `0.07001` | `TOO_MANY_DECIMALS` |
| I09 | `inflationRate` | `-1` | `OUT_OF_RANGE` |
| I10 | `nominalAnnualFeeRate` | `-0.0001` | `OUT_OF_RANGE` |
| I11 | `currency` | `'CNY' as CurrencyCode` | `UNSUPPORTED_ENUM` |
| I12 | `contributionFrequency` | `'weekly' as ContributionFrequency` | `UNSUPPORTED_ENUM` |
| I13 | `contributionTiming` | `'middle' as ContributionTiming` | `UNSUPPORTED_ENUM` |
| I14 | `compoundingFrequency` | `'continuous' as CompoundingFrequency` | `UNSUPPORTED_ENUM` |
| I15 | `initialPrincipal` | `Number.NaN` | `NOT_FINITE` |
| I16 | `initialPrincipal` | `Number.POSITIVE_INFINITY` | `NOT_FINITE` |

### I17

Input URL: `?v=1&p=1e4`

- inputs equal `DEFAULT_INPUTS`;
- no errors;
- exactly one `URL_VALUE_IGNORED` warning;
- warning field: `initialPrincipal`.

### I18

Input URL: `?v=1&r=-0`

- `nominalAnnualRate === 0`;
- `Object.is(nominalAnnualRate, -0) === false`;
- no errors or warnings.

### I19

Input URL: `?v=1&m=12&m=24`

- `durationMonths === 24`;
- all other fields default;
- no errors or warnings.

### I20

Input URL: `?v=2&p=500`

- all ten fields equal defaults;
- no errors;
- exactly one `UNSUPPORTED_VERSION` warning without field;
- no `URL_VALUE_IGNORED`.

### I21

Input URL: `?v=2&v=1&p=500`

- last version wins;
- `initialPrincipal === 500`;
- all other fields default;
- no errors or warnings.

### I22

Input URL: `?unknown=x`

- unknown key ignored;
- all fields default;
- no errors or warnings; version not required.

### I23

Input URL: empty query

- all fields default;
- no errors or warnings; version not required;
- serializing the result returns an empty query.

### I24

Direct input: defaults with `durationMonths: 601`

- valid and calculates successfully;
- no errors;
- exactly one warning: `LONG_HORIZON`;
- warning field: `durationMonths`.

## 14. Additional mandatory URL and serialization contract tests

These are normative even though the historical numbering ends at I24.

| Case | Input/operation | Expected |
|---|---|---|
| U01 | `?p=500` | defaults; one `MISSING_VERSION`; no field |
| U02 | `?v=1&p=500&c=oops&r=0.1` | principal 500, contribution default, rate 0.1; one ignored warning on contribution |
| U03 | `?v=1&p=` | default principal; one ignored warning |
| U04 | `?v=1&p=+1` | default principal; one ignored warning |
| U05 | `?v=1&p=01` | default principal; one ignored warning |
| U06 | `?v=1&p=1.` | default principal; one ignored warning |
| U07 | `?v=1&p=%20100` | default principal; one ignored warning |
| U08 | `?v=1&cur=eur` | default currency; one ignored warning |
| U09 | serialize defaults | empty query |
| U10 | serialize defaults with principal 500 and EUR | `?v=1&cur=EUR&p=500` |
| U11 | parse U10 then serialize | exact U10 string |
| U12 | serialize `-0` in a changed field | ordinary `0`, never `-0` |

## 15. Independent verification protocol and recorded result

Two audit implementations were created only to compile this candidate:

- Reference A: Python, direct month-event iteration and ledger-first annual grouping.
- Reference B: JavaScript, independently built contribution sets, independent
  rate switch, separate account-state reducer and annual slicing.

They do not share:

- contribution-month helper;
- monthly-rate conversion helper;
- monthly loop;
- annual aggregation helper;
- source file or runtime.

Recorded 2026-07-30:

- V01–V12 six summaries: **PASS**, field-by-field;
- V01–V12 monthly ledgers: **PASS**, every numeric field under combined tolerance;
- V01–V12 annual schedules: **PASS**, every numeric field under combined tolerance;
- monthly identities: **PASS**;
- annual identities: **PASS**;
- summary identities: **PASS**;
- signed negative growth in V06: **PASS**;
- S01 expected summary: **PASS**;
- S01 ledger length 1200: **PASS**;
- S01 annual length 100: **PASS**;
- S01 all summary values finite: **PASS**.

The two implementations produced numerically identical binary64 results for the
recorded vectors. This is stronger than, but does not replace, the frozen
tolerance requirement.

## 16. Phase 1B test architecture requirement

Production tests must include a reference implementation that does not import
or share the production engine's:

- contribution-month logic;
- monthly-rate conversion;
- monthly calculation loop;
- annual aggregation.

For each valid vector, compare the production engine with:

1. the six frozen raw values;
2. the frozen display strings;
3. the independent reference ledger and annual schedule, field by field;
4. all ledger, annual and summary identities.

Never hard-code a production output path to return fixture results.

## 17. Known clarifications introduced by Revision 4

Revision 4 intentionally resolves the following ambiguities instead of silently
inheriting assumptions:

1. fees are charged on post-interest, pre-fee balance;
2. exact monthly and annual record fields are frozen;
3. partial final years are frozen;
4. validation precedence and one-error-per-field behavior are frozen;
5. missing URL version has its own deterministic warning;
6. exact URL numeric grammar and serialization grammar are frozen;
7. Phase 1B display strings omit currency symbols while the formatter still
   accepts currency and locale;
8. V01–V12 are newly designed and independently calculated; no scattered
   Revision 3 numeric result retains authority.

These clarifications require human review before freeze.

## 18. Freeze and resumption gate

Human review must verify at minimum:

- product and market boundary;
- fee base;
- all ten inputs in V01–V12;
- the purpose and coverage of each valid vector;
- all six raw and display results;
- I01–I24 and U01–U12;
- warning triggers and order;
- URL grammar;
- formatting behavior;
- dual-calculation evidence.

Only after explicit human approval:

1. change status from `AWAITING HUMAN REVIEW — NOT FROZEN` to an approved frozen
   status in a new immutable copy or approved revision;
2. record final SHA-256;
3. deliver that exact approved file to Phase 1B;
4. separately authorize Phase 1B resumption.

Approval of Revision 4 does not itself mean Sales Ready, AdSense Ready,
Published or Launched. Phase 1B completion must stop and await Phase 2 approval.
