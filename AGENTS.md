# Repository working agreement

## Structure

- `app/` contains the Next.js App Router page and interactive UI.
- `lib/calculator/` contains the frozen calculation, parsing, validation, and URL contracts.
- `lib/presentation/` contains display-only models and formatters.
- `tests/` mirrors the product and calculator contracts.

## Commands

- Focused tests: `npm.cmd test -- <test files>`
- Full tests: `npm.cmd test`
- Type checks: `npm.cmd run typecheck`
- Core build: `npm.cmd run build:core`
- Production App Router build: `npm.cmd run build:app`
- Coverage, when requested and stable: `npm.cmd run test:coverage`

## Durable boundaries

- Do not change `PHASE_1A_REVISION_4_FROZEN.md` or calculator mathematics without explicit Human authorization.
- Keep market/country, UI language, number format locale, currency, jurisdiction, SEO locale, and consent region independently configurable.
- Preserve semantic HTML, keyboard and screen-reader behavior, 44px touch targets, reduced-motion and forced-colors support, chart/table fallbacks, and complete print output.
- Do not delete, reset, clean, overwrite, stage, or commit user work unless explicitly requested. Preserve existing tracked and untracked files.
- A milestone is complete only after the product implementation, relevant tests, full tests, typecheck, both builds, diff checks, and proportionate visual review are complete. A plan, scaffold, report, or partial CSS change is not completion.
