# Phase 3A Product Roadmap

Updated: 2026-08-27

## Status

| Milestone | Scope | Status |
| --- | --- | --- |
| 3A-01 | Flagship calculator visual, form, result, responsive, trust, and content foundations | Human Accepted and Closed |
| 3A-02 | Site structure: home, calculator category/landing, About, Methodology, policies, Contact | Human Accepted and Closed |
| 3A-03 | Independent market, language, number-format, currency, jurisdiction, SEO, and consent models | Human Accepted and Closed |
| 3A-04 | SEO, schema, methodology/content depth, YMYL trust signals, authorship/review workflow, feedback, and structured educational data | Human Accepted and Closed |
| 3A-05 | Production domain/deployment, performance, monitoring, security headers, analytics/consent, commercial foundations | Human Accepted and Closed |
| 3A-06 | Real-device, browser, assistive-technology, print, performance, SEO, privacy, and evidence-debt release gate | Human Accepted and Closed |

Phase 2C is complete at `Human CLOSED 122 / Implemented, evidence incomplete 0 / Not implemented 0 / Primary browser/manual pending 0 / Known product defects 0`.

Current governance state:

- Phase 3A implementation and evidence are complete.
- Phase 3A-01 through Phase 3A-06 are Human Accepted and Closed.
- Release Track 2-A Phase 3A checkpoint preparation is in progress.
- Production identity, legal-operator, public-domain, hosting and deployment decisions remain pending.
- Public deployment is not authorized and public indexing remains disabled.
- No second calculator or subsequent product phase has started.

## 3A-01 outcome

- A calm, professional calculator surface with a four-step one-page form and independently adjustable currency and number format.
- A desktop two-column workspace with a sticky result summary; a mobile-first single-column layout with 44px-or-larger interactive controls and no intended page-level horizontal overflow.
- Clear final-balance emphasis, supporting contribution/growth/fee/nominal/real metrics, accessible chart cards, and a scroll-contained annual table with print access to every annual row.
- Methodology, assumptions, example, FAQ, disclaimer, update date, privacy statement, and feedback foundation content without invented reviewer credentials.
- A NerdWallet-informed but independently written educational sequence: definition, usage steps, frozen-engine-verified worked example and contributions comparison, formula variables, limitations, FAQs, and related-tool foundations. Calculator/results remain first and no affiliate or advertising density was copied.
- Existing calculator math, result values, locale separation, chart keyboard/touch contracts, live-region behavior, forced-colors, reduced-motion, fallback, and print contracts preserved.

## Unique next task

Prepare an exact, recoverable Phase 3A Git checkpoint scope. Audit and classify every tracked and untracked worktree item, identify generated evidence and sensitive artifacts, and stop before staging. One separate explicit Human authorization is required before any stage, commit, annotated tag or private remote push. Do not begin another calculator during checkpoint preparation.

## Task-start Git preservation snapshot

Captured before Phase 3A-01 edits on branch `master`, HEAD `0253f33f303e3592146d7152974abf6367b66eb0`, with an empty cached index. These pre-existing changes and files are user-owned and were preserved:

```text
 M PHASE_2C_AUTHORITATIVE_122_ID_STATUS_LEDGER.md
 M app/annual-table.tsx
 M app/calculator-workspace.tsx
 M app/globals.css
 M lib/presentation/currency.ts
 M tests/app/annual-table.test.tsx
 M tests/app/calculator-workspace.test.tsx
 M tests/presentation/currency.test.ts
?? BATCH_1_50_CONTRACT_ATOMIC_EVIDENCE_BASELINE_AUDIT.md
?? BATCH_1_50_CONTRACT_CANONICAL_ATOMIC_LEDGER.jsonl
?? PHASE_2C_BATCH_1_ATOMIC_AUDIT_BASELINE_FINAL_FREEZE_REVIEW.md
?? PHASE_2C_BATCH_1_REVISION_1_ATOM_REVIEW.jsonl
?? PHASE_2C_BATCH_1_REVISION_1_EVIDENCE_INDEX.json
?? PHASE_2C_BATCH_1_REVISION_1_F01_F05_ATOM_REVIEW.jsonl
?? PHASE_2C_BATCH_1_REVISION_1_F01_F05_EVIDENCE_INDEX.json
?? PHASE_2C_BATCH_1_REVISION_1_RAW_EVIDENCE.log
?? PHASE_2C_BATCH_2_ATOMIC_IMPLEMENTATION_READINESS.md
?? PHASE_2C_BATCH_2_ENTRY_PREFLIGHT.md
?? PHASE_2C_FIRST_IMPLEMENTATION_BATCH_PLAN_CANDIDATE.md
?? PHASE_2C_FIRST_IMPLEMENTATION_BATCH_PLAN_CANDIDATE_REVISION_1.md
?? PHASE_2C_I10_R003_PRODUCT_DECISIONS_AND_IMPLEMENTATION_CONTRACT_FROZEN.md
?? PHASE_2C_I10_R003_RUNTIME_LOCALE_CHANGE_REALITY_AND_SCOPE_AUDIT.md
?? PHASE_2C_PRODUCT_RESEARCH_REPORT.md
?? PHASE_2C_REVISION_11_BATCH_1_AUTHORIZATION_READINESS_SUPPLEMENT.md
?? PHASE_2C_REVISION_11_BATCH_1_AUTHORIZATION_READINESS_SUPPLEMENT_REVISION_1.md
?? PHASE_2C_REVISION_11_BATCH_1_AUTHORIZATION_READINESS_SUPPLEMENT_REVISION_2.md
?? PHASE_2C_REVISION_11_IMPLEMENTATION_READINESS_REVIEW.md
?? PHASE_2C_REVISION_11_IMPLEMENTATION_READINESS_REVIEW_REVISION_2.md
?? PHASE_2C_REVISION_11_IMPLEMENTATION_READINESS_REVIEW_REVISION_3.md
?? PHASE_2C_REVISION_11_IMPLEMENTATION_READINESS_REVIEW_REVISION_4.md
?? PHASE_2C_REVISION_11_IMPLEMENTATION_READINESS_REVIEW_REVISION_5.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_1.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_2.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_3.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_4.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_5.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_6.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_7.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_8.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_9.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_10.md
?? PHASE_2C_SCOPE_UX_SPEC_CANDIDATE_REVISION_11.md
?? PHASE_2C_SCOPE_UX_SPEC_REVISION_11_NUMERIC_SEMANTICS_CORRECTION.md
?? app/chart-figures.tsx
?? lib/presentation/chart-model.ts
?? scripts/
?? tests/app/chart-figures.test.tsx
?? tests/presentation/chart-model.test.ts
```
