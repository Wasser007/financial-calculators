# Phase 2B Form Interaction Diagnostic

**Status: PHASE 2B FORM INTERACTION DIAGNOSED — AWAITING MINIMAL FIX AUTHORIZATION**

## Raw command evidence

Raw outputs were preserved separately in the system temporary directory (not the project):

- `C:\Users\ekate\AppData\Local\Temp\phase2b-form-diagnostic\typecheck.txt`
- `C:\Users\ekate\AppData\Local\Temp\phase2b-form-diagnostic\test.txt`
- `C:\Users\ekate\AppData\Local\Temp\phase2b-form-diagnostic\build-core.txt`
- `C:\Users\ekate\AppData\Local\Temp\phase2b-form-diagnostic\build-app.txt`

| Command | Exit code | Result |
| --- | ---: | --- |
| `npm.cmd run typecheck` | 2 | FAIL |
| `npm.cmd test` | 0 | PASS — 7 files, 88 tests |
| `npm.cmd run build:core` | 0 | PASS |
| `npm.cmd run build:app` | 1 | FAIL |

### Complete error matrix

| Class | Evidence | Root cause | Minimal repair location |
| --- | --- | --- | --- |
| B — TypeScript type model | `app/calculator-workspace.tsx(7,2488): error TS2345: Argument of type 'string \| undefined' is not assignable to parameter of type 'string'.` | The results tuple key is used to index a result object under strict indexed access, producing a possibly undefined value. | Narrow the result-key tuple to `keyof CalculatorSummary` and preserve its numeric value without a widening cast. |
| A/G — module path/resolution | Next Webpack: `./lib/presentation/form-model.ts Module not found: Can't resolve '../calculator/index.js'`; import trace `./app/calculator-workspace.tsx`. | `form-model.ts` correctly uses NodeNext `.js` import syntax for the core compiler, but Webpack does not resolve that emitted-extension specifier to the TypeScript source in this configuration. | Add an application-only adapter boundary that resolves the existing public API under bundler rules, without changing any Phase 1B import or copying core code. |

No additional TypeScript errors, failed tests, hydration warnings, React key warnings, controlled/uncontrolled warnings, or dependency-tree errors were emitted. Next failed in the optimized-production compilation stage before type checking/page-data generation.

## Path and import verification

| Relative path | Bytes | SHA-256 | Exists / case |
| --- | ---: | --- | --- |
| `app/calculator-workspace.tsx` | 4,371 | `afe3aedfbfd57cebea6b0128414f64d241d644bdcb6e17eed412f2b0ef9103ad` | exact |
| `lib/presentation/form-model.ts` | 2,187 | `7b1541e406284c02d384dcbb9e697f3afe54b5b0f8f09551280a9c31876b1a67` | exact |
| `lib/presentation/currency.ts` | 437 | `08d65152bfb221c588c1d721a26d6e65177de78c57a70f2facf580d71c183c48` | exact |
| `lib/calculator/index.ts` | 515 | `f2264bd537a23cdb9504d9460f3dca476e407c2ed5fc0e1f7dc49b46b12e5add` | exact |
| `lib/calculator/types.ts` | 2,603 | `d53bac14255ac2ed3c64157021037f2aebdcfe9fc626d80a5ec511b7b39aee34` | exact |

`form-model.ts` imports `../calculator/index.js`; the expected relative source target is `lib/calculator/index.ts`, which exists exactly. This is not a missing file, spelling, or case error. It is a NodeNext-versus-App-Router-bundler resolution boundary. `app/calculator-workspace.tsx` imports presentation files under bundler rules.

## Baseline

`npm ls next postcss sharp @types/react` resolves approved `next@16.2.11`, overridden `postcss@8.5.18`, overridden `sharp@0.35.0`, and `@types/react@19.2.18` without invalid, extraneous, or peer errors. `package.json` remains SHA-256 `3cb0e7293a655e537bf66640501cf69309d024a78ee9025aaed7ed5f376acd35`; `package-lock.json` remains `a0a0fa128897bf5d8bad6087eb57e72c6442be69882d2e9d4ba70738b4b272ff`.

No dependency was added, removed, or upgraded. Phase 1B and all frozen files remain unchanged. SchengenProfi was not touched.

## Frozen-contract findings

Independent review findings are confirmed: the candidate conflates draft validation, shown errors, and last-valid evaluation; it therefore clears valid results on invalid submit, lacks stale state, error associations/focus behavior, Reset/Recalculate, full disclaimer text, and last-valid-currency binding. These are E — Frozen contract deviations, repairable with existing dependencies. They require a small state-model redesign but no human decision and no change to Phase 1B.

## Repair eligibility

Existing React, Vitest, jsdom, Testing Library, and user-event are sufficient. No new dependency is required. A subsequent minimal-fix authorization should address only the two compile errors and the listed state/accessibility deviations, backed by behavioral tests; it must not enter annual-table, chart, URL, or commercial work.
