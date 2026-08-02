# Phase 2B Current Freeze Candidate Evidence

**Status: READY FOR INDEPENDENT FREEZE RE-REVIEW — NOT FROZEN**

## Candidate identity and scope

- Review workspace: `C:\Users\ekate\OneDrive\Документи\工具和谷歌广告`
- Baseline commit: `e0e31c07d838b0589f5c4ee02e1a9c2c0a98e4bd`
- Baseline annotated tag: `phase-2b-form-interaction-v1.0-frozen`
- This is a working-tree candidate following that accepted form-interaction baseline. No commit or tag was created or changed for this candidate.
- The Phase 1A and Phase 2A frozen documents and both dependency manifests remain byte-identical to their approved baselines.
- SchengenProfi was not read, modified, or used.

## Historical baseline distinction

`PHASE_2B_TRACKED_BASELINE_FREEZE_REPORT.md` is retained unchanged as the historical pre-annual-table baseline report. Its 139-test result and statement that annual-table work was not authorized describe its original point in time; they are not current annual-table freeze evidence.

This document is the current candidate evidence for the implemented annual table, responsive corrections, and their test coverage. It does not amend the historical report or declare a formal freeze.

## Annual-table contract and evidence matrix

| Contract requirement | Evidence | Status |
| --- | --- | --- |
| Read only the Phase 1B `annualSchedule`; do not recompute annual finance data | `app/annual-table.tsx` maps its typed `rows` directly and only slices for pagination; no ledger, rate, fee, or inflation computation exists | Covered |
| Exact nine fields and order | `app/annual-table.tsx` `columns`; `tests/app/annual-table.test.tsx` exact header assertion | Covered |
| Exact caption, visible currency context, and `aria-describedby` | Component caption/currency text; annual-table DOM test | Covered |
| Use last-valid currency and preserve stale output | `CalculatorWorkspace` passes `last.inputs.currency` and `last.result.annualSchedule`; workspace DOM tests cover stale preservation and replacement after valid calculation | Covered |
| Truthful signed/zero values and no row mutation | annual-table DOM test; Phase 1B V06/V10 coverage | Covered |
| Partial final year is passed through without month-bound display | annual-table DOM test; Phase 1B V03/V08 vector schedules | Covered |
| Large 100-year schedule remains valid through its final row | `tests/calculator/engine.test.ts`: `retains readable large annual schedule values through the final year` | Covered |
| Inflation stays a final-summary metric and does not alter annual ledger rows | `tests/calculator/engine.test.ts`: `does not apply inflation adjustment to annual ledger output` | Covered |
| Pagination, native keyboard operation, 100 rows, and reset rules | annual-table and workspace DOM tests | Covered |
| Semantic table, component-only horizontal scroll, aria-hidden compact summary | annual-table component and DOM test; manual 320px and 200% viewport acceptance recorded in project review history | Covered |

## Candidate changes

- Annual-table presentation component and focused DOM tests.
- `CalculatorWorkspace` integration using the same last-valid `result` and `inputs.currency` as the six-result summary.
- Removal of the page-level `body { min-width: 320px; }` constraint, protected by a source-contract test.
- Recalculate/Reset controls grouped with `flex flex-wrap gap-2` and protected by a DOM structure test.
- Two Phase 1B public-behavior tests added to close the annual-table model evidence gap: a large 100-year annual schedule and inflation independence of annual rows.

No production financial formula, Phase 1B public API, frozen specification, dependency, lockfile, configuration, chart, URL/share feature, warning UI, commercial feature, storage, deployment, or external script was changed.

## Verification evidence

Commands completed in this Windows workspace for the current candidate:

| Gate | Command | Result |
| --- | --- | --- |
| Complete tests | `npm.cmd test` | PASS — 10 files, 155 tests, 0 failures |
| TypeScript | `npm.cmd run typecheck` | PASS |
| Core build | `npm.cmd run build:core` | PASS |
| Next production build | `npm.cmd run build:app` | PASS — Webpack static build, no build warnings |
| Coverage | `npm.cmd run test:coverage` | PASS — statements 99.06%, branches 96.87%, functions 100%, lines 99.05% |
| Dependency tree | `npm.cmd ls next postcss sharp @types/react` | PASS — next 16.2.11; postcss 8.5.18 overridden; sharp 0.35.0 overridden; @types/react 19.2.18 |

The two audit gates were previously completed manually in ordinary Windows PowerShell: both returned valid JSON, exit code 0, and 0 vulnerabilities for the complete and production dependency sets. A repeat from the Codex-controlled process during this remediation could not reach npm's audit endpoint; that process limitation did not modify dependencies, npm configuration, or the lockfile. This report intentionally distinguishes the manually verified Windows-host audit evidence from the controlled-process transport failure.

## Integrity snapshot

- `PHASE_1A_REVISION_4_FROZEN.md`: `2bc9ef28d6b768fcff130d757d20cb772c0cb9facbf38d545289de5e00b167bb`
- `PHASE_2A_REVISION_2_FROZEN.md`: `b28529b69b589584a69cc709f40ad39a97f728b4b77c42774c314d35f59e8468`
- `package.json`: `3cb0e7293a655e537bf66640501cf69309d024a78ee9025aaed7ed5f376acd35`
- `package-lock.json`: `a0a0fa128897bf5d8bad6087eb57e72c6442be69882d2e9d4ba70738b4b272ff`
- `app/annual-table.tsx`: `51c93245c2a2f07826ceab8045e358aefd7969d8ea69bd4a13ef040880b64a44`
- `tests/app/annual-table.test.tsx`: `ba6e53ad546dad3efb704185a792892ef1e7629c6e3de9ed2be2421b9a1eb758`

`git diff --check` passed. The working tree remains intentionally non-clean because this candidate consists of uncommitted tracked changes and untracked annual-table/governance files. No changes were staged.

## Remediation result

- BLOCKERS: 0
- MUST FIX: 0
- SHOULD FIX: 0
- OBSERVATIONS: 1 — formal freeze still requires an independent re-review and a separate explicit authorization.
- Historical 139-test report preserved: YES
- Historical report clearly distinguished from current candidate: YES
- Annual-table model evidence complete: YES
- Complete test total after remediation: 155
- All tests passed: YES
- Typecheck passed: YES
- Production build passed: YES
- Coverage gate passed: YES
- npm audit result: 0 vulnerabilities in manually verified ordinary Windows PowerShell evidence; controlled-process retry blocked by registry transport
- Production code modified: YES — the current candidate contains the authorized annual-table presentation and Workspace integration; this evidence-remediation task changed tests and this report only
- Frozen specifications modified: NO
- Dependencies changed: NO
- Commit created: NO
- Tag created or changed: NO
- Push/PR/deployment performed: NO
- SchengenProfi touched: NO

**Final status: READY FOR INDEPENDENT FREEZE RE-REVIEW — NOT FROZEN**
