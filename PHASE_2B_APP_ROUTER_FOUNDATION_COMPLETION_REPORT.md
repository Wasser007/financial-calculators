# Phase 2B App Router Foundation Completion

**Status: PHASE 2B APP ROUTER FOUNDATION COMPLETE — AWAITING FORM INTERACTION GATE**

## Scope and authority

This completed the narrowly authorized App Router foundation gate only. It retains a server-rendered semantic page shell, the presentation-only currency formatter, their configuration, and formatter tests. It does not implement calculator inputs, Phase 1B calculation execution, result cards, annual data, charts, URL state, sharing, advertising, analytics, CMP, affiliate content, accounts, storage, databases, server writes, deployment, commits, pushes, or pull requests.

The prior blocked report remains unchanged: `PHASE_2B_APP_ROUTER_FOUNDATION_REPORT.md`, 4,089 bytes, SHA-256 `070cca28b86a4d8a1200fb8d76c5bfab3bc7476a39ea75045957c0adfad58410`.

## Baseline verification

| Artifact | Bytes | SHA-256 | Result |
| --- | ---: | --- | --- |
| `PHASE_1A_REVISION_4_FROZEN.md` | 34,246 | `2bc9ef28d6b768fcff130d757d20cb772c0cb9facbf38d545289de5e00b167bb` | unchanged |
| `PHASE_2A_REVISION_2_FROZEN.md` | 19,724 | `b28529b69b589584a69cc709f40ad39a97f728b4b77c42774c314d35f59e8468` | unchanged |
| `PHASE_2B_DEPENDENCY_SECURITY_REPORT.md` | 3,734 | `22b868d4228ce6c07562d955f9ed8327467a87ff1b36560e1dd18977a03a2072` | unchanged |

Phase 1B source, public API, and original tests remain intact. SchengenProfi was not read or touched.

## Authorized dependency exception

- Read-only registry query: `npm view @types/react version` returned `19.2.18`.
- Installed exactly: `npm install --save-dev --save-exact @types/react@19.2.18`.
- `@types/react` is the only new direct dependency and is a development dependency.
- `csstype` was added only as the normal transitive dependency of `@types/react`; no second direct dependency was requested or installed.

| File | Before | After |
| --- | --- | --- |
| `package.json` | 775 bytes; `36882b9790ca5c37a5827151cd807386a956f1edfe7b888375822db2ee1382d6` | 984 bytes; `3cb0e7293a655e537bf66640501cf69309d024a78ee9025aaed7ed5f376acd35` |
| `package-lock.json` | 128,616 bytes; `13fbb16160749133c168af5f528ee801144cdfdb51aaf0fce063516eee128585` | 129,342 bytes; `a0a0fa128897bf5d8bad6087eb57e72c6442be69882d2e9d4ba70738b4b272ff` |

`npm ls` resolves `next@16.2.11`, overridden `postcss@8.5.18`, overridden `sharp@0.35.0`, and `@types/react@19.2.18` with no invalid, extraneous, or peer-dependency errors.

## Foundation implementation

### Added application/configuration files

- `app/layout.tsx` — Server Component root layout, `lang="en-US"`, metadata, and global-style import.
- `app/page.tsx` — semantic English-first header, main, calculator-workspace, methodology, and disclaimer shell with the sole H1 `Compound Interest Calculator`; it exposes no fake results or inactive form controls.
- `app/globals.css` — white visual foundation and the frozen visible focus treatment: `#155EEF`, 2px outline, 2px offset.
- `postcss.config.mjs` — Tailwind v4 PostCSS entry.
- `next.config.ts` — local tracing root plus `tsconfig.app.json` routing; it does not use `typescript.ignoreBuildErrors`.
- `tsconfig.app.json` and `next-env.d.ts` — App Router-specific strict type-check configuration, separated from the frozen core compiler configuration.
- `lib/presentation/currency.ts` — pure `formatCurrencyDisplay(value, currency)` adapter.
- `tests/presentation/currency.test.ts` — formatter tests.

### Component boundary

The root layout and page are Server Components; neither contains `use client`. No client state or calculation execution exists. The display adapter imports only the Phase 1B `CurrencyCode` type, uses `Intl.NumberFormat("en-US", { style: "currency", currencyDisplay: "symbol", minimumFractionDigits: 2, maximumFractionDigits: 2 })`, and does not calculate, parse, mutate, serialize, or store financial values. It does not call Phase 1B's numeric-only `formatAmount` helper.

### Actual formatter output

| Currency | `formatCurrencyDisplay(1234.5, currency)` |
| --- | --- |
| USD | `$1,234.50` |
| EUR | `€1,234.50` |
| GBP | `£1,234.50` |
| CAD | `CA$1,234.50` |
| AUD | `A$1,234.50` |

Zero, negative values, rounding to two places, large-value grouping, non-mutation, and independence from `formatAmount` are also tested.

## Unicode build decision

The earlier Turbopack production build panicked on this workspace's Unicode path. The authorized scripts therefore use `next dev --webpack` and `next build --webpack`. Webpack completed the production build, including real TypeScript validation, with no hydration, React-key, or build warnings. The project was neither moved nor copied.

## Validation

| Gate | Result |
| --- | --- |
| Phase 1B regression suite | PASS — 75 of 75 retained tests |
| Currency formatter tests | PASS — 8 tests |
| Total test suite | PASS — 6 files, 83 tests |
| TypeScript check | PASS — core and `tsconfig.app.json` |
| Core build | PASS — `npm run build:core` |
| Next production build | PASS — `next build --webpack`, real TypeScript check |
| Coverage | PASS — statements 99.06%, branches 96.87%, functions 100%, lines 99.05% |
| `npm audit --json` | PASS — 0 total vulnerabilities |
| `npm audit --omit=dev --json` | PASS — 0 total vulnerabilities |

Generated `.next` and TypeScript incremental-build output were removed after verification. No dependencies beyond the explicitly authorized direct `@types/react@19.2.18` change were added.

## Next gate

The application foundation is ready for a separately approved form-interaction gate. This report does not authorize that gate or any SVG-chart work.
