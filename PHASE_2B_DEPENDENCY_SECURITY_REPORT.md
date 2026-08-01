# Phase 2B Dependency Security Revision

**Status: PHASE 2B DEPENDENCY SECURITY REVISION COMPLETE — AWAITING APPLICATION IMPLEMENTATION GATE**

## Scope and invariant

Phase 2A Frozen was verified unchanged: 19,724 bytes; SHA-256 `b28529b69b589584a69cc709f40ad39a97f728b4b77c42774c314d35f59e8468`. This revision changes only application dependency declarations and lock resolution, then records the result. No App Router page, component, currency adapter, interaction, SVG chart, Phase 1B calculation/test source, or SchengenProfi file was changed.

The security invariant is that the production dependency tree resolves Next.js 16.2.11, PostCSS 8.5.18, and sharp 0.35.0 while preserving all other direct dependency declarations except the approved Next exact-version change and the approved overrides.

## Pre-fix evidence

`npm audit --json` was captured in the system temporary directory before remediation. It reported 3 high findings, all in the production dependency path: direct `next@16.2.1`, with transitive `postcss <=8.5.17` and `sharp <0.35.0`. The original pre-fix hash command was run before any modification; its console table was width-truncated and the full hash strings were not persisted, so they are not reproduced here rather than guessed. The recorded prefixes were `package.json: 1790B6B6…` and `package-lock.json: 334A3E58…`.

## Minimal patch strategy

- Changed direct Next declaration from `^16.2.1` to exact `16.2.11` using `npm.cmd install next@16.2.11 --save-exact`.
- Added the approved root overrides only: `postcss: 8.5.18`, `sharp: 0.35.0`.
- Regenerated the lock with normal `npm.cmd install`; no `npm audit fix`, force fix, global update, or unrelated direct dependency upgrade was used.

### Post-fix hashes

| File | SHA-256 |
|---|---|
| `package.json` | `36882b9790ca5c37a5827151cd807386a956f1edfe7b888375822db2ee1382d6` |
| `package-lock.json` | `13fbb16160749133c168af5f528ee801144cdfdb51aaf0fce063516eee128585` |

### Effective dependency tree

```text
@tailwindcss/postcss@4.1.12 → postcss@8.5.18 overridden
next@16.2.11 → postcss@8.5.18 overridden; sharp@0.35.0 overridden
vitest@4.1.10 → vite@8.2.0 → postcss@8.5.18 overridden
```

There were no `invalid`, `extraneous`, or peer-dependency errors from `npm.cmd ls next postcss sharp`.

## Ordered verification

| Gate | Result |
|---|---|
| `npm.cmd ls next postcss sharp` | PASS; exact approved resolved versions shown above |
| `npm.cmd test` | PASS; 5 files, 75 tests |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run build` | PASS |
| `npm.cmd run test:coverage` | PASS; statements 99.06%, branches 96.87%, functions 100%, lines 99.05% |
| `npm.cmd audit --json` | PASS; 0 critical, 0 high, 0 total |
| `npm.cmd audit --omit=dev --json` | PASS; 0 critical, 0 high, 0 total |

The previously reported high-vulnerability dependency path no longer reproduces in npm audit, and the legitimate Phase 1B public core behavior remains covered by the unchanged 75-test suite, typecheck, and build.

## Remaining risk and next gate

No known high or critical npm audit finding remains. The pre-fix full SHA-256 strings were not retained verbatim; this is an audit-record limitation only, not a validation gap in the post-fix resolved tree, frozen baseline, or dependency vulnerability closure. Phase 2A Frozen remains immutable. This report does not authorize page implementation or any product release.

## Files changed

- `package.json`
- `package-lock.json`
- `PHASE_2B_DEPENDENCY_SECURITY_REPORT.md`

## Conclusion

The dependency security revision is fixed and validated. The project is eligible for a separate App Router application-implementation gate. It is not complete, published, deployed, Sales Ready, or launched.
