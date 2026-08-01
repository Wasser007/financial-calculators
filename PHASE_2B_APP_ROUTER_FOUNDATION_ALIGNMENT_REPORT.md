# Phase 2B App Router Foundation Alignment

**Status: PHASE 2B APP ROUTER FOUNDATION ALIGNED — AWAITING FORM INTERACTION GATE**

## Scope

This is a narrowly scoped alignment update to the App Router foundation. No form, input-state model, Phase 1B evaluation call, results display, annual table, chart, URL state, sharing, advertising, analytics, CMP, affiliate content, account, storage, database, server write, deployment, commit, push, or pull request was introduced.

## Baseline and post-change integrity

| File | Before SHA-256 | After SHA-256 | Result |
| --- | --- | --- | --- |
| `PHASE_2A_REVISION_2_FROZEN.md` | `b28529b69b589584a69cc709f40ad39a97f728b4b77c42774c314d35f59e8468` | same | unchanged |
| `PHASE_2B_APP_ROUTER_FOUNDATION_COMPLETION_REPORT.md` | `df3d85127f76f5241f80cd38164b24b6f0ee4b8fdd30545dded0dc0f6e50bdcf` | same | unchanged |
| `package.json` | `3cb0e7293a655e537bf66640501cf69309d024a78ee9025aaed7ed5f376acd35` | same | unchanged |
| `package-lock.json` | `a0a0fa128897bf5d8bad6087eb57e72c6442be69882d2e9d4ba70738b4b272ff` | same | unchanged |

The Phase 1A frozen baseline remains 34,246 bytes with SHA-256 `2bc9ef28d6b768fcff130d757d20cb772c0cb9facbf38d545289de5e00b167bb`. Phase 1B source and tests remain unchanged. SchengenProfi was not read or touched.

## Resolved deviations

1. **Frozen metadata** — `app/layout.tsx` now uses exactly:
   - Title: `Compound Interest Calculator with Contributions, Fees & Inflation`
   - Description: `Estimate how a starting balance and regular contributions may grow under your chosen return, compounding, fee, and inflation assumptions.`

2. **Skip link** — `app/layout.tsx` now places `Skip to main content` before page content and targets the real `main#main-content` landmark in `app/page.tsx`. `app/globals.css` hides the link until keyboard focus, when the frozen `#155EEF` 2px outline and 2px offset make it visible without JavaScript. Layout and page remain Server Components.

3. **Quiet Ledger hierarchy** — the page canvas is `#F7F8FA`; header, footer, and calculator workspace are `#FFFFFF` surfaces. Ink is `#132033`, muted copy is `#526174`, and the action/focus token remains `#155EEF`. The workspace is no longer a gray surface over a white canvas.

## Files modified or added

- Modified: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.
- Added: `tests/app/foundation.test.ts`.
- Added: this report.

The existing `lib/presentation/currency.ts` public contract was not changed. `tests/presentation/currency.test.ts` remains present for independent review and its eight tests pass.

## Tests and verification

The five new foundation tests independently inspect the rendered-source contract for exact metadata, the sole H1, skip-link target and focus rule, lack of form controls/client directives, and canvas/surface layering. They do not duplicate financial calculation logic.

| Gate | Result |
| --- | --- |
| Phase 1B regression tests | PASS — 75 tests |
| Currency formatter tests | PASS — 8 tests |
| New foundation tests | PASS — 5 tests |
| Total suite | PASS — 7 files, 88 tests |
| TypeScript | PASS — core and App Router configuration |
| Core build | PASS |
| Next Webpack production build | PASS — real TypeScript validation; no hydration, React-key, or build warnings |
| Coverage | PASS — statements 99.06%, branches 96.87%, functions 100%, lines 99.05% |
| `npm audit --json` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev --json` | PASS — 0 vulnerabilities |

`npm ls next postcss sharp @types/react` resolves `next@16.2.11`, overridden `postcss@8.5.18`, overridden `sharp@0.35.0`, and `@types/react@19.2.18` with no invalid, extraneous, or peer-dependency errors. No dependency files changed. Generated `.next` and TypeScript incremental-build output were removed after validation.

## Next gate

The aligned foundation is suitable for a separately approved form-interaction gate. That gate remains unauthorized by this report.
