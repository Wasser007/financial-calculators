# New Financial Calculator Integration Standard Operating Procedure (SOP)

## 1. Universal Integration Rules (Never Violate)
1. **Never use custom asset sync scripts**: Cloudflare Pages natively deploys the Next.js build output. The build script must remain `next build --webpack`.
2. **Verify Component Interfaces Before Use**: Always inspect the component signature via terminal (`head`/`cat`) instead of guessing prop types.
3. **Follow Strict TypeScript Standards**:
   - Explicit `import type` for types.
   - Preserved `.js` extension for local ESM imports.
   - Exact tuple and optional types matching component signatures (`readonly [string, string][]` for faqs).
4. **Architectural Co-existence**:
   - Do not modify the baseline `calculatorCatalog` invariant unless executing an authorized global roadmap migration with synchronized test updates.

## 2. Step-by-Step Integration Checklist for New Calculators
1. **Core Math & Engine**: Create `lib/calculators/<name>/engine.ts` with pure math and unit tests (`tests/calculators/<name>.test.ts`).
2. **Workspace Component**: Create `components/<name>-workspace.tsx` with unified design tokens and responsive form/chart/table layout.
3. **Page Component**: Create `app/<name>-page.tsx` utilizing `<CalculatorPageTemplate>` with strictly typed `faqs: readonly [string, string][]` and verified metadata.
4. **Route Page**: Create `app/calculators/<name>/page.tsx` exporting default Page and `metadata`.
5. **Full Verification**: Run `npm run verify` (`tsc` + `vitest` + `next build`). Only push when all 3 gates pass cleanly.
