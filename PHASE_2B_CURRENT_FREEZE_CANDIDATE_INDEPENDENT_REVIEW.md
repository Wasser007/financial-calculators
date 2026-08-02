# Phase 2B Current Candidate — Independent Freeze Re-Review

**Verdict: PASS — FORMAL FREEZE AUTHORIZATION RECOMMENDED — NOT FROZEN**

## Executive conclusion

The current candidate is an uncommitted successor to the accepted Phase 2B form-interaction baseline. The two previously identified MUST FIX items are closed: the historical 139-test report is preserved and clearly separated from current evidence, and the annual-table public-model evidence now explicitly covers large annual rows and inflation independence. No Phase 1A/1B/2A frozen artifact, dependency manifest, lockfile, or core implementation changed.

## Repository and Git identity

- Workspace: `C:\Users\ekate\OneDrive\Документи\工具和谷歌广告`
- Branch: `master`
- HEAD: `e0e31c07d838b0589f5c4ee02e1a9c2c0a98e4bd`
- Exact HEAD tag: `phase-2b-form-interaction-v1.0-frozen`
- Tag object: annotated (`139fcbf0cbee353d5b7c1cdb570b2d15a48111e2`), resolving to the expected baseline commit.
- Staged changes: none.
- The candidate remains uncommitted. No tag was moved.

## Candidate inventory

Tracked modifications relative to the historical baseline:

1. `app/calculator-workspace.tsx` — annual-table integration and wrapped calculator action controls.
2. `app/globals.css` — removal of `body { min-width: 320px; }`.
3. `tests/app/calculator-workspace.test.tsx` — last-valid table/currency, pagination/reset, and action-control assertions.
4. `tests/app/foundation.test.ts` — source-level regression check against a 320px body minimum width.
5. `tests/calculator/engine.test.ts` — the two model-evidence tests reviewed below.

Untracked candidate/governance files:

1. `app/annual-table.tsx`
2. `tests/app/annual-table.test.tsx`
3. `PHASE_2B_ANNUAL_TABLE_PREIMPLEMENTATION_CONTRACT.md`
4. `PHASE_2B_CURRENT_FREEZE_CANDIDATE_EVIDENCE.md`
5. `PHASE_2B_TRACKED_BASELINE_FREEZE_REPORT.md` (historical report retained unchanged)
6. This independent review.

No candidate path references or incorporates SchengenProfi.

## Frozen-asset verification

| Artifact | SHA-256 | Result |
| --- | --- | --- |
| `PHASE_1A_REVISION_4_FROZEN.md` | `2bc9ef28d6b768fcff130d757d20cb772c0cb9facbf38d545289de5e00b167bb` | Match |
| `PHASE_2A_REVISION_2_FROZEN.md` | `b28529b69b589584a69cc709f40ad39a97f728b4b77c42774c314d35f59e8468` | Match |
| `package.json` | `3cb0e7293a655e537bf66640501cf69309d024a78ee9025aaed7ed5f376acd35` | Match |
| `package-lock.json` | `a0a0fa128897bf5d8bad6087eb57e72c6442be69882d2e9d4ba70738b4b272ff` | Match |
| Historical baseline report | `37047cf1909a8968686649fe894fd2d19fa23fbcbd877607ee5688484065e7dc` | Preserved |
| Current candidate evidence | `b39218774c7713498606456d17f7376185b8c6d6d0e3d10aa03050f2d48752b0` | Match |
| `tests/calculator/engine.test.ts` | `a6cb31871a9b5708e9ad262d127fce06a91aa01f923a9ae5586dd034238c1464` | Match |

## Historical-report and current-evidence verification

`PHASE_2B_TRACKED_BASELINE_FREEZE_REPORT.md` remains intact and continues to document the earlier 139-test form-interaction baseline. The current evidence report explicitly identifies it as pre-annual-table history, records 153 as the pre-remediation candidate baseline, and records the actual post-remediation result of 155 tests. It accurately states that neither document creates a formal freeze.

## Closure of original MUST FIX items

### MUST FIX 1 — current candidate evidence: CLOSED

`PHASE_2B_CURRENT_FREEZE_CANDIDATE_EVIDENCE.md` records the annual-table implementation, the 139-test historical-report distinction, the 153-to-155 test evolution, unchanged manifests/frozen specifications, and the difference between manually verified Windows-host audit evidence and the Codex-controlled process transport failure.

### MUST FIX 2 — annual-table model evidence: CLOSED

`tests/calculator/engine.test.ts` uses only the public `calculate` API:

- `retains readable large annual schedule values through the final year` verifies the actual 100-row schedule's first and final annual rows under the S01 large-amount scenario.
- `does not apply inflation adjustment to annual ledger output` compares actual `annualSchedule` output for otherwise equal inputs with and without inflation, while confirming the inflation-adjusted summary changes.

These tests complement existing V01–V12 comparisons, partial-year vectors, signed/zero scenarios, warning-order test, and S01 rather than reproducing engine formulas.

## Annual-table contract matrix

| Contract area | Implementation and test evidence | Result |
| --- | --- | --- |
| Sole annual data source | `AnnualTable` accepts typed `AnnualScheduleEntry[]`; `CalculatorWorkspace` passes `last.result.annualSchedule` | Satisfied |
| No financial recomputation | Component only slices rows for pagination and formats amounts; no rate/fee/contribution/inflation calculation | Satisfied |
| Exact nine fields/order | `app/annual-table.tsx` columns map and annual-table header test | Satisfied |
| Caption/currency accessibility | Exact caption, currency text, stable `aria-describedby`; annual-table DOM test | Satisfied |
| Last-valid currency/stale lifecycle | Workspace integration and stale/currency DOM tests | Satisfied |
| Signed/zero/partial values | Annual-table DOM tests plus V03/V06/V08/V10 vectors | Satisfied |
| 100-year and large values | S01 and new public-model test | Satisfied |
| No annual inflation calculation | New public-model test and absence of inflation input in `AnnualTable` | Satisfied |
| Pagination/reset/keyboard | Annual-table and Workspace DOM tests | Satisfied |
| Semantic/mobile structure | semantic table, component `overflow-x-auto`, aria-hidden compact summary, and source-contract tests | Satisfied |
| Unauthorized features | No chart, share, CSV, ad, affiliate, analytics, storage, or external script in candidate scope | Satisfied |

## Full gate results

| Gate | Command | Result |
| --- | --- | --- |
| Test suite | `npm.cmd test` | PASS — 10 files, 155 passed, 0 failed |
| Typecheck | `npm.cmd run typecheck` | PASS |
| Core build | `npm.cmd run build:core` | PASS |
| Next production build | `npm.cmd run build:app` | PASS — Webpack static build |
| Coverage | `npm.cmd run test:coverage` | PASS — statements 99.06%, branches 96.87%, functions 100%, lines 99.05% |
| Dependency tree | `npm.cmd ls next postcss sharp @types/react` | PASS — next 16.2.11; postcss 8.5.18 overridden; sharp 0.35.0 overridden; @types/react 19.2.18 |
| Diff integrity | `git diff --check` | PASS |

### Dependency and audit assessment

The two audit commands were attempted during this review and both failed only because the Codex-controlled process could not reach npm's audit endpoint. No `audit fix`, manifest, lockfile, npm configuration, or dependency-tree change occurred. The current candidate evidence records the previously manually executed ordinary Windows PowerShell audits: valid JSON, exit code 0, and 0 vulnerabilities for both complete and production dependency sets. Given those accepted host-environment results and byte-identical manifests/lockfile, audit evidence is acceptable for formal-freeze review; the controlled-process failure is an environment limitation, not a successful audit rerun.

## Findings

- BLOCKER: 0
- MUST FIX: 0
- SHOULD FIX: 0
- OBSERVATION: 1 — repeat audit commands from the Codex-controlled process remain network-blocked; retain the ordinary Windows PowerShell audit evidence with any formal-freeze record.

## Required answers

- Historical report preserved unchanged: YES
- Current candidate report accurate: YES
- Original MUST FIX 1 closed: YES
- Original MUST FIX 2 closed: YES
- Annual-table contract satisfied: YES
- Complete test total: 155
- All tests passed: YES
- Typecheck passed: YES
- Core build passed: YES
- Next production build passed: YES
- Coverage gate passed: YES
- Dependency manifests unchanged: YES
- Audit evidence acceptable for freeze: YES
- Frozen specifications unchanged: YES
- Unauthorized features found: NO
- Production code modified during this review: NO
- Tests modified during this review: NO
- Dependencies changed during this review: NO
- Commit created: NO
- Tag created or changed: NO
- Push/PR/deployment performed: NO
- SchengenProfi touched: NO
- Formal freeze authorization recommended: YES

**Final status: PASS — FORMAL FREEZE AUTHORIZATION RECOMMENDED — NOT FROZEN**
