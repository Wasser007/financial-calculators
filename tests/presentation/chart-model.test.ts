import { describe, expect, it, vi } from "vitest";
const recomputationCalls = vi.hoisted(() => ({ evaluate: 0, calculate: 0, validate: 0 }));
vi.mock("../../lib/calculator/engine.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/calculator/engine.js")>();
  return { ...actual, evaluateCalculator: (...args: Parameters<typeof actual.evaluateCalculator>) => { recomputationCalls.evaluate++; return actual.evaluateCalculator(...args); }, calculate: (...args: Parameters<typeof actual.calculate>) => { recomputationCalls.calculate++; return actual.calculate(...args); } };
});

describe("presentation locale propagation", () => {
  it("reformats every composition and annual amount-bearing model surface", () => {
    const input = ledger(1234500, 0, 0, 0);
    const us = buildChartModels(input, "en-US");
    const de = buildChartModels(input, "de-DE");
    const annualUs = buildChartModels(last([1234500, 1234500]), "en-US");
    const annualDe = buildChartModels(last([1234500, 1234500]), "de-DE");
    if (!us.ok || !de.ok || !annualUs.ok || !annualDe.ok) throw new Error("expected successful chart models");

    expect(us.composition.steps[0].formattedValue).toContain("1,234,500.00");
    expect(de.composition.steps[0].formattedValue).toContain("1.234.500,00");
    expect(de.composition.steps[0].accessibleLabel).toContain("1.234.500,00");
    expect(de.composition.staticSummary.visibleText).toContain("1.234.500,00");
    expect(de.composition.ticks.map((tick) => tick.compactLabel)).not.toEqual(us.composition.ticks.map((tick) => tick.compactLabel));

    expect(us.annualGrowth.points[0].formattedClosingBalance).toContain("1,234,500.00");
    expect(de.annualGrowth.points[0].formattedClosingBalance).toContain("1.234.500,00");
    expect(de.annualGrowth.points[0].accessibleLabel).toContain("1.234.500,00");
    const usAmount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(1234500);
    const deAmount = new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD" }).format(1234500);
    expect(annualUs.annualGrowth.classification.staticSummary.visibleText).toBe(
      `The illustrated annual ending balance remains ${usAmount} across the recorded annual points. The first and final recorded annual ending balances are both ${usAmount}.`,
    );
    expect(annualDe.annualGrowth.classification.staticSummary.visibleText).toBe(
      `The illustrated annual ending balance remains ${deAmount} across the recorded annual points. The first and final recorded annual ending balances are both ${deAmount}.`,
    );
    expect(de.annualGrowth.ticks.map((tick) => tick.compactLabel)).not.toEqual(us.annualGrowth.ticks.map((tick) => tick.compactLabel));
    expect(de.composition.steps.map((step) => step.rawValue)).toEqual(us.composition.steps.map((step) => step.rawValue));
    expect(de.annualGrowth.points.map((point) => point.id)).toEqual(us.annualGrowth.points.map((point) => point.id));
  });
});
vi.mock("../../lib/calculator/validation.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/calculator/validation.js")>();
  return { ...actual, validateInputs: (...args: Parameters<typeof actual.validateInputs>) => { recomputationCalls.validate++; return actual.validateInputs(...args); } };
});
import type { CalculatorResult } from "../../lib/calculator/types.js";
import { evaluateCalculator } from "../../lib/calculator/engine.js";
import { defaultDrafts, evaluateDrafts } from "../../lib/presentation/form-model.js";
import { annualPointId, annualTickId, buildChartModels, compactTick, labelledPointIndexes, waterfallTickId } from "../../lib/presentation/chart-model.js";
import { formatCurrencyDisplay } from "../../lib/presentation/currency.js";
import type { AnnualModel, AnnualPoint, AnnualTicks, CompositionModel, ChartModelBuildResult, WaterfallTicks } from "../../lib/presentation/chart-model.js";

function last(balances: readonly number[] = [115]): Parameters<typeof buildChartModels>[0] {
  const initial = balances.length === 1 && balances[0] === 115 ? 100 : 0;
  let cumulative = 0, cumulativeGrowth = 0;
  const rows = balances.map((closingBalance, index) => {
    const openingBalance = index === 0 ? initial : balances[index - 1]!;
    const delta = closingBalance - openingBalance, contributions = Math.max(delta, 0), grossGrowth = Math.min(delta, 0);
    cumulative += contributions; cumulativeGrowth += grossGrowth;
    return { year: index + 1, startMonth: index * 12 + 1, endMonth: (index + 1) * 12, openingBalance, contributions, grossGrowth, fees: 0, closingBalance, cumulativeContributions: cumulative, cumulativeGrossGrowth: cumulativeGrowth, cumulativeFees: 0 };
  });
  const result: CalculatorResult = { finalBalance: balances.at(-1)!, totalContributions: cumulative, grossGrowth: cumulativeGrowth, totalFees: 0, nominalInvestmentGain: cumulativeGrowth, inflationAdjustedFinalBalance: balances.at(-1)!, annualSchedule: rows, monthlyLedger: [] };
  return { inputs: { currency: "USD", initialPrincipal: initial, contributionAmount: 0, contributionFrequency: "monthly", contributionTiming: "end", durationMonths: balances.length * 12, nominalAnnualRate: .1, compoundingFrequency: "monthly", nominalAnnualFeeRate: .01, inflationRate: 0 }, result };
}
function ledger(initial:number, contributions:number, grossGrowth:number, fees:number): Parameters<typeof buildChartModels>[0] {
  const finalBalance=initial+contributions+grossGrowth-fees;
  const base=last([initial]); const row={...base.result.annualSchedule[0]!,openingBalance:initial,contributions,grossGrowth,fees,closingBalance:finalBalance,cumulativeContributions:contributions,cumulativeGrossGrowth:grossGrowth,cumulativeFees:fees};
  return {...base,inputs:{...base.inputs,initialPrincipal:initial},result:{...base.result,finalBalance,totalContributions:contributions,grossGrowth,totalFees:fees,nominalInvestmentGain:grossGrowth-fees,inflationAdjustedFinalBalance:finalBalance,annualSchedule:[row]}};
}
function defaultLast(): Parameters<typeof buildChartModels>[0] {
  const drafted = evaluateDrafts(defaultDrafts());
  if (!drafted.inputs || !drafted.evaluation?.result) throw new Error("expected default drafts to evaluate");
  return { inputs: drafted.inputs, result: drafted.evaluation.result };
}

describe("Phase 2C Batch 1 chart model", () => {
  // S02/S05/S07: the builder has no presentation-state argument.
  // @ts-expect-error buildChartModels accepts only frozen last-valid financial data.
  buildChartModels(last(), { locale: "fr", hover: 1, selection: 2 });
  // @ts-expect-error presentation state is not a member of the builder input.
  const noPresentationState: Parameters<typeof buildChartModels>[0] = { ...last(), viewport: 320 };
  // @ts-expect-error S02 color cannot enter the builder input.
  const noColor: Parameters<typeof buildChartModels>[0] = { ...last(), color: "red" };
  // @ts-expect-error S02 formatter cannot enter the builder input.
  const noFormatter: Parameters<typeof buildChartModels>[0] = { ...last(), formatter: () => "x" };
  // @ts-expect-error S05 focus cannot enter the builder input.
  const noFocus: Parameters<typeof buildChartModels>[0] = { ...last(), focus: 1 };
  // @ts-expect-error S05 selection cannot enter the builder input.
  const noSelection: Parameters<typeof buildChartModels>[0] = { ...last(), selection: 1 };
  // @ts-expect-error S07 rerender state cannot enter the builder input.
  const noRerender: Parameters<typeof buildChartModels>[0] = { ...last(), rerender: true };
  // @ts-expect-error S07 hover cannot enter the builder input.
  const noHover: Parameters<typeof buildChartModels>[0] = { ...last(), hover: 1 };
  // @ts-expect-error S07 pointer cannot enter the builder input.
  const noPointer: Parameters<typeof buildChartModels>[0] = { ...last(), pointer: { x: 1, y: 1 } };
  // @ts-expect-error S05 committed selection cannot enter the builder input.
  const noCommittedSelection: Parameters<typeof buildChartModels>[0] = { ...last(), committedSelection: 1 };
  void noPresentationState; void noColor; void noFormatter; void noFocus; void noSelection; void noRerender; void noHover; void noPointer; void noCommittedSelection;
  // @ts-expect-error T01 annual chart cannot be used as composition chart.
  const t01: CompositionModel = {} as AnnualModel;
  // @ts-expect-error T02 composition chart cannot be used as annual chart.
  const t02: AnnualModel = {} as CompositionModel;
  // @ts-expect-error T08 arbitrary reason is outside the closed failure union.
  const t08: ChartModelBuildResult = { ok: false, reason: "arbitrary", unavailable: [] };
  // @ts-expect-error T08 failed build cannot omit its closed reason.
  const missingReason: ChartModelBuildResult = { ok: false, unavailable: [] };
  // @ts-expect-error duplicate tick ID in the tick-1 position cannot satisfy AnnualTicks.
  const duplicateTicks: AnnualTicks = [{id:"annual-y-tick-0",value:0,compactLabel:"0"},{id:"annual-y-tick-0",value:1,compactLabel:"1"},{id:"annual-y-tick-2",value:2,compactLabel:"2"},{id:"annual-y-tick-3",value:3,compactLabel:"3"},{id:"annual-y-tick-4",value:4,compactLabel:"4"}];
  // @ts-expect-error tick-0 position cannot carry tick-1.
  const reorderedTicks: AnnualTicks = [{id:"annual-y-tick-1",value:0,compactLabel:"0"},{id:"annual-y-tick-0",value:1,compactLabel:"1"},{id:"annual-y-tick-2",value:2,compactLabel:"2"},{id:"annual-y-tick-3",value:3,compactLabel:"3"},{id:"annual-y-tick-4",value:4,compactLabel:"4"}];
  // @ts-expect-error T09 duplicate members cannot resize the fixed unavailable tuple.
  const t09DuplicateUnavailable: ChartModelBuildResult = {ok:false,reason:"missing-data",unavailable:[{kind:"chart-unavailable",chart:"composition",classificationId:"composition-unavailable",fallbackText:"Balance composition is unavailable. Review the result summary and annual calculation detail."},{kind:"chart-unavailable",chart:"composition",classificationId:"composition-unavailable",fallbackText:"Balance composition is unavailable. Review the result summary and annual calculation detail."}]};
  // @ts-expect-error T09 a third unavailable member cannot resize the fixed tuple.
  const t09ResizedUnavailable: ChartModelBuildResult = {ok:false,reason:"missing-data",unavailable:[{kind:"chart-unavailable",chart:"composition",classificationId:"composition-unavailable",fallbackText:"Balance composition is unavailable. Review the result summary and annual calculation detail."},{kind:"chart-unavailable",chart:"annual-growth",classificationId:"annual-unavailable",fallbackText:"Annual ending balance chart is unavailable. Review the result summary and annual calculation detail."},{kind:"chart-unavailable",chart:"annual-growth",classificationId:"annual-unavailable",fallbackText:"Annual ending balance chart is unavailable. Review the result summary and annual calculation detail."}]};
  // @ts-expect-error Waterfall tick-2 cannot duplicate tick-1.
  const waterfallDuplicate: WaterfallTicks = [{id:"waterfall-y-tick-0",value:0,compactLabel:"0"},{id:"waterfall-y-tick-1",value:1,compactLabel:"1"},{id:"waterfall-y-tick-1",value:2,compactLabel:"2"},{id:"waterfall-y-tick-3",value:3,compactLabel:"3"},{id:"waterfall-y-tick-4",value:4,compactLabel:"4"}];
  // @ts-expect-error Waterfall tick-0 cannot occupy tick-3's position.
  const waterfallReordered: WaterfallTicks = [{id:"waterfall-y-tick-3",value:0,compactLabel:"0"},{id:"waterfall-y-tick-1",value:1,compactLabel:"1"},{id:"waterfall-y-tick-2",value:2,compactLabel:"2"},{id:"waterfall-y-tick-0",value:3,compactLabel:"3"},{id:"waterfall-y-tick-4",value:4,compactLabel:"4"}];
  void t01; void t02; void t08; void missingReason; void duplicateTicks; void reorderedTicks; void t09DuplicateUnavailable; void t09ResizedUnavailable; void waterfallDuplicate; void waterfallReordered;
  const fixtureTicks: AnnualTicks = [{id:"annual-y-tick-0",value:0,compactLabel:"0"},{id:"annual-y-tick-1",value:1,compactLabel:"1"},{id:"annual-y-tick-2",value:2,compactLabel:"2"},{id:"annual-y-tick-3",value:3,compactLabel:"3"},{id:"annual-y-tick-4",value:4,compactLabel:"4"}];
  const fixturePoint: AnnualPoint = {id:"annual-growth-point-0",scheduleIndex:0,year:1,startMonth:1,endMonth:12,isPartialPeriod:false,label:"Year 1",rawClosingBalance:0,formattedClosingBalance:"$0",sign:"zero",accessibleLabel:"Year 1: $0."};
  // T04/T10: a direct, legal single-point object has no multi-point fields.
  const t04t10Positive: AnnualModel = {kind:"annual-growth",currency:"USD",domain:{min:-1,max:1,includesZero:true,tickFractions:[0,.25,.5,.75,1]},ticks:fixtureTicks,labelledPointIndexes:[0],ok:true,modelKind:"single-point",points:[fixturePoint],classification:{classificationKind:"single-point",classificationId:"annual-single-point",staticSummary:{kind:"annual-summary",chart:"annual-growth",classificationId:"annual-single-point",visibleText:"One annual point: Year 1, $0.",selectedValueTemplate:"{label}: {fullAmount}.",announcementTemplate:"{label}: {fullAmount}."}}};
  const fixturePoint2: AnnualPoint = {...fixturePoint,id:"annual-growth-point-1",scheduleIndex:1,year:2,startMonth:13,endMonth:24,label:"Year 2",rawClosingBalance:1,formattedClosingBalance:"$1",sign:"positive",accessibleLabel:"Year 2: $1."};
  // T11: a direct, legal multi-point object constructs without assertion.
  const t11Positive: AnnualModel = {kind:"annual-growth",currency:"USD",domain:{min:-1,max:2,includesZero:true,tickFractions:[0,.25,.5,.75,1]},ticks:fixtureTicks,labelledPointIndexes:[0,1],ok:true,modelKind:"multi-point",points:[fixturePoint,fixturePoint2],classification:{classificationKind:"multi-point",pathClassification:"monotonic-or-flat",endpointClassification:"up",zeroClassification:"touches-zero",classificationId:"annual:monotonic-or-flat:up:touches-zero",staticSummary:{kind:"annual-summary",chart:"annual-growth",classificationId:"annual:monotonic-or-flat:up:touches-zero",visibleText:"Annual ending balance chart summary.",selectedValueTemplate:"{label}: {fullAmount}.",announcementTemplate:"{label}: {fullAmount}."}}};
  // T05: reversal with neutral endpoint is a legal closed multi-point classification.
  const t05ReversalNeutralPositive: AnnualModel = {kind:"annual-growth",currency:"USD",domain:{min:-1,max:2,includesZero:true,tickFractions:[0,.25,.5,.75,1]},ticks:fixtureTicks,labelledPointIndexes:[0,1],ok:true,modelKind:"multi-point",points:[fixturePoint,fixturePoint2],classification:{classificationKind:"multi-point",pathClassification:"starts-up-ends-down",endpointClassification:"neutral",zeroClassification:"touches-zero",classificationId:"annual:starts-up-ends-down:neutral:touches-zero",staticSummary:{kind:"annual-summary",chart:"annual-growth",classificationId:"annual:starts-up-ends-down:neutral:touches-zero",visibleText:"Annual ending balance chart summary.",selectedValueTemplate:"{label}: {fullAmount}.",announcementTemplate:"{label}: {fullAmount}."}}};
  // @ts-expect-error T03 direct literal rejects a summary/classification ID mismatch.
  const t03Negative: AnnualModel = {kind:"annual-growth",currency:"USD",domain:{min:-1,max:1,includesZero:true,tickFractions:[0,.25,.5,.75,1]},ticks:fixtureTicks,labelledPointIndexes:[0],ok:true,modelKind:"single-point",points:[fixturePoint],classification:{classificationKind:"single-point",classificationId:"annual-single-point",staticSummary:{kind:"annual-summary",chart:"annual-growth",classificationId:"annual:monotonic-or-flat:up:touches-zero",visibleText:"x",selectedValueTemplate:"{label}: {fullAmount}.",announcementTemplate:"{label}: {fullAmount}."}}};
  // @ts-expect-error T06 all-equal/crosses-zero is unreachable.
  const t06AllEqualCross: AnnualModel = {kind:"annual-growth",currency:"USD",domain:{min:-1,max:1,includesZero:true,tickFractions:[0,.25,.5,.75,1]},ticks:fixtureTicks,labelledPointIndexes:[0,1],ok:true,modelKind:"multi-point",points:[fixturePoint,fixturePoint],classification:{classificationKind:"multi-point",pathClassification:"all-equal",endpointClassification:"neutral",zeroClassification:"crosses-zero",classificationId:"annual:all-equal:neutral:crosses-zero",staticSummary:{kind:"annual-summary",chart:"annual-growth",classificationId:"annual:all-equal:neutral:crosses-zero",visibleText:"x",selectedValueTemplate:"{label}: {fullAmount}.",announcementTemplate:"{label}: {fullAmount}."}}};
  // @ts-expect-error T06 monotonic/neutral is unreachable.
  const t06MonotonicNeutral: AnnualModel = {kind:"annual-growth",currency:"USD",domain:{min:-1,max:1,includesZero:true,tickFractions:[0,.25,.5,.75,1]},ticks:fixtureTicks,labelledPointIndexes:[0,1],ok:true,modelKind:"multi-point",points:[fixturePoint,fixturePoint2],classification:{classificationKind:"multi-point",pathClassification:"monotonic-or-flat",endpointClassification:"neutral",zeroClassification:"touches-zero",classificationId:"annual:monotonic-or-flat:neutral:touches-zero",staticSummary:{kind:"annual-summary",chart:"annual-growth",classificationId:"annual:monotonic-or-flat:neutral:touches-zero",visibleText:"x",selectedValueTemplate:"{label}: {fullAmount}.",announcementTemplate:"{label}: {fullAmount}."}}};
  // @ts-expect-error T12 rejects one point under the multi-point discriminant.
  const t12SingleAsMulti: AnnualModel = {kind:"annual-growth",currency:"USD",domain:{min:-1,max:1,includesZero:true,tickFractions:[0,.25,.5,.75,1]},ticks:fixtureTicks,labelledPointIndexes:[0],ok:true,modelKind:"multi-point",points:[fixturePoint],classification:t11Positive.classification};
  // @ts-expect-error T12 rejects two points under the single-point discriminant.
  const t12MultiAsSingle: AnnualModel = {kind:"annual-growth",currency:"USD",domain:{min:-1,max:1,includesZero:true,tickFractions:[0, .25,.5,.75,1]},ticks:fixtureTicks,labelledPointIndexes:[0,1],ok:true,modelKind:"single-point",points:[fixturePoint,fixturePoint2],classification:t04t10Positive.classification};
  // @ts-expect-error T13 a successful annual model cannot contain an empty points tuple.
  const t13EmptyPoints: AnnualModel = {kind:"annual-growth",currency:"USD",domain:{min:-1,max:1,includesZero:true,tickFractions:[0,.25,.5,.75,1]},ticks:fixtureTicks,labelledPointIndexes:[],ok:true,modelKind:"single-point",points:[],classification:t04t10Positive.classification};
  // @ts-expect-error T09 rejects an empty unavailable tuple.
  const t09EmptyUnavailable: ChartModelBuildResult = {ok:false,reason:"missing-data",unavailable:[]};
  // @ts-expect-error T09 rejects reversed unavailable tuple order.
  const t09ReorderedUnavailable: ChartModelBuildResult = {ok:false,reason:"missing-data",unavailable:[{kind:"chart-unavailable",chart:"annual-growth",classificationId:"annual-unavailable",fallbackText:"Annual ending balance chart is unavailable. Review the result summary and annual calculation detail."},{kind:"chart-unavailable",chart:"composition",classificationId:"composition-unavailable",fallbackText:"Balance composition is unavailable. Review the result summary and annual calculation detail."}]};
  void t04t10Positive; void t11Positive; void t05ReversalNeutralPositive; void t03Negative; void t06AllEqualCross; void t06MonotonicNeutral; void t12SingleAsMulti; void t12MultiAsSingle; void t13EmptyPoints; void t09EmptyUnavailable; void t09ReorderedUnavailable;
  it("T01 composition model has only composition summary kind", () => { const r=buildChartModels(last()); if(!r.ok)throw new Error("success"); expect(r.composition.staticSummary.kind).toBe("composition-summary"); });
  it("T02 annual model has only annual summary kind", () => { const r=buildChartModels(last()); if(!r.ok)throw new Error("success"); expect(r.annualGrowth.classification.staticSummary.kind).toBe("annual-summary"); });
  it("T03 annual summary ID equals classification ID", () => { const r=buildChartModels(last([0,1])); if(!r.ok)throw new Error("success"); expect(r.annualGrowth.classification.staticSummary.classificationId).toBe(r.annualGrowth.classification.classificationId); });
  it("T04 single point has the single-point discriminant", () => { const r=buildChartModels(last([0])); if(!r.ok)throw new Error("success"); expect(r.annualGrowth.modelKind).toBe("single-point"); });
  it("A01 frozen [0] sequence is the independent single-point branch", () => { const r=buildChartModels(last([0])); if(!r.ok)throw new Error("success"); expect(r.annualGrowth.classification.classificationId).toBe("annual-single-point"); });
  it("T05 all-equal has neutral endpoint", () => expect(classify([0,0,0]).endpointClassification).toBe("neutral"));
  it("T06 all-equal cannot produce crosses-zero", () => expect(classify([0,0,0]).zeroClassification).not.toBe("crosses-zero"));
  it("T07 raw annual sequence produces a reachable ID", () => expect(classify([0,2,1]).classificationId).toBe("annual:starts-up-ends-down:up:touches-zero"));
  it("T07 real raw sequences cover every reachable path, endpoint, and zero classification", () => {
    const cases:[readonly number[],string][]=[[[0,0],"annual:all-equal:neutral:touches-zero"],[[2,2],"annual:all-equal:neutral:does-not-touch-zero"],[[0,1],"annual:monotonic-or-flat:up:touches-zero"],[[2,1],"annual:monotonic-or-flat:down:does-not-touch-zero"],[[-1,1],"annual:monotonic-or-flat:up:crosses-zero"],[[0,2,1],"annual:starts-up-ends-down:up:touches-zero"],[[0,2,0],"annual:starts-up-ends-down:neutral:touches-zero"],[[0,1,-1],"annual:starts-up-ends-down:down:crosses-zero"],[[2,0,1],"annual:starts-down-ends-up:down:touches-zero"],[[2,0,2],"annual:starts-down-ends-up:neutral:touches-zero"],[[1,-1,2],"annual:starts-down-ends-up:up:crosses-zero"],[[0,1,0,1,0],"annual:changes-direction:neutral:touches-zero"]];
    for(const [values,id] of cases)expect(classify(values).classificationId).toBe(id);
  });
  it("T07 enumerates the complete explicit reachable annual-ID set without extras", () => {
    const expected=new Set<string>(["annual:all-equal:neutral:touches-zero","annual:all-equal:neutral:does-not-touch-zero",...(["up","down"] as const).flatMap(e=>(["crosses-zero","touches-zero","does-not-touch-zero"] as const).map(z=>`annual:monotonic-or-flat:${e}:${z}`)),...(["starts-up-ends-down","starts-down-ends-up"] as const).flatMap(p=>[...(["up","down"] as const).flatMap(e=>(["crosses-zero","touches-zero"] as const).map(z=>`annual:${p}:${e}:${z}`)),...(["crosses-zero","touches-zero","does-not-touch-zero"] as const).map(z=>`annual:${p}:neutral:${z}`)]),...(["up","down","neutral"] as const).flatMap(e=>(["crosses-zero","touches-zero","does-not-touch-zero"] as const).map(z=>`annual:changes-direction:${e}:${z}`)) ]);
    const actual=new Set<string>();const values=[-2,-1,0,1,2];const visit=(prefix:number[],remaining:number):void=>{if(prefix.length>=2)actual.add(classify(prefix).classificationId);if(remaining>0)for(const value of values)visit([...prefix,value],remaining-1);};visit([],4);actual.add(classify([1,2,1,2,1]).classificationId);expect(actual).toEqual(expected);
  });
  it("T08 unavailable reason is one of the closed literals", () => { const r=buildChartModels(null as never); expect(r.ok).toBe(false); if(!r.ok)expect(["missing-data","non-finite-data","contract-mismatch"]).toContain(r.reason); });
  it("T09 unavailable tuple is composition then annual", () => { const r=buildChartModels(null as never); if(r.ok)throw new Error("failure"); expect(r.unavailable.map(x=>x.chart)).toEqual(["composition","annual-growth"]); });
  it("T10 one point constructs single-point success", () => { const r=buildChartModels(last([0])); if(!r.ok)throw new Error("success"); expect(r.annualGrowth.points).toHaveLength(1); });
  it("T11 two points construct multi-point success", () => { const r=buildChartModels(last([0,1])); if(!r.ok)throw new Error("success"); expect(r.annualGrowth.modelKind).toBe("multi-point"); });
  it("T12 count and model kind remain correlated", () => { const a=buildChartModels(last([0]));const b=buildChartModels(last([0,1]));if(!a.ok||!b.ok)throw new Error("success");expect([a.annualGrowth.modelKind,b.annualGrowth.modelKind]).toEqual(["single-point","multi-point"]); });
  it("T13 empty schedule cannot construct success", () => { const base=last();const r=buildChartModels({...base,result:{...base.result,annualSchedule:[]}});expect(r.ok).toBe(false); });

  it("F01 missing scalar returns missing-data before numeric validation", () => {
    const value = last() as unknown as { inputs: Record<string, unknown>; result: CalculatorResult };
    delete (value.result as unknown as Record<string, unknown>).finalBalance;
    expect((buildChartModels(value as never) as { reason?: string }).reason).toBe("missing-data");
  });
  it("F01 missing currency returns missing-data without formatter throw", () => {
    const value = { ...last(), inputs: { ...last().inputs } } as unknown as { inputs: Record<string, unknown>; result: CalculatorResult };
    delete value.inputs.currency;
    expect((buildChartModels(value as never) as { reason?: string }).reason).toBe("missing-data");
  });
  it("schedule rejects first and final months inconsistent with duration", () => {
    const base = last(); const rows = base.result.annualSchedule.map(row => ({ ...row, startMonth: 2, endMonth: 13 }));
    expect((buildChartModels({ ...base, result: { ...base.result, annualSchedule: rows } }) as { reason?: string }).reason).toBe("contract-mismatch");
  });
  it("schedule rejects a non-integer duration", () => { const base=last(); expect((buildChartModels({...base,inputs:{...base.inputs,durationMonths:12.5}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("F02 NaN returns non-finite-data", () => {
    const base = last(); const value = { ...base, result: { ...base.result, grossGrowth: Number.NaN } };
    expect((buildChartModels(value) as { reason?: string }).reason).toBe("non-finite-data");
  });
  it("F02 positive infinity returns non-finite-data", () => {
    const base = last(); const value = { ...base, result: { ...base.result, grossGrowth: Infinity } };
    expect((buildChartModels(value) as { reason?: string }).reason).toBe("non-finite-data");
  });
  it("F02 negative infinity returns non-finite-data", () => {
    const base = last(); const value = { ...base, result: { ...base.result, grossGrowth: -Infinity } };
    expect((buildChartModels(value) as { reason?: string }).reason).toBe("non-finite-data");
  });
  it("F03 first annual opening must equal input principal", () => {
    const base = last(); const rows = base.result.annualSchedule.map(row => ({ ...row })); rows[0]!.openingBalance += 1;
    expect((buildChartModels({ ...base, result: { ...base.result, annualSchedule: rows } }) as { reason?: string }).reason).toBe("contract-mismatch");
  });
  it("F03 annual row reconciliation must be exact", () => {
    const base = last(); const rows = base.result.annualSchedule.map(row => ({ ...row })); rows[0]!.closingBalance += 1;
    expect((buildChartModels({ ...base, result: { ...base.result, annualSchedule: rows } }) as { reason?: string }).reason).toBe("contract-mismatch");
  });
  it("F04 missing data dominates non-finite data", () => {
    const value = { inputs: { ...last().inputs }, result: { ...last().result, finalBalance: Number.NaN } } as unknown as { inputs: CalculatorResult; result: CalculatorResult };
    delete (value.result as unknown as Record<string, unknown>).finalBalance;
    expect((buildChartModels(value as never) as { reason?: string }).reason).toBe("missing-data");
  });
  it("F04 non-finite data dominates a simultaneous contract mismatch", () => { const base=last();expect((buildChartModels({...base,result:{...base.result,grossGrowth:NaN,totalFees:-1}}) as {reason?:string}).reason).toBe("non-finite-data"); });
  it("F04 mismatch dominates final-negative, final-zero, and growth classification", () => { for(const result of [{...last().result,finalBalance:-1,totalFees:-1},{...last().result,finalBalance:0,totalFees:-1},{...last().result,grossGrowth:-1,totalFees:-1}])expect((buildChartModels({...last(),result}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("F05 aggregate identity is not repaired", () => {
    const base = last(); const value = { ...base, result: { ...base.result, nominalInvestmentGain: 99 } };
    expect((buildChartModels(value) as { reason?: string }).reason).toBe("contract-mismatch");
  });
  it("W01 starting step is A0 to A1 from input principal", () => {
    const built = buildChartModels(last()); if (!built.ok) throw new Error("success");
    expect(built.composition.steps[0].startAnchor).toEqual({ id: "A0", value: 0 });
    expect(built.composition.steps[0].endAnchor.value).toBe(last().inputs.initialPrincipal);
  });
  it("W02 contribution step is A1 to A2", () => {
    const built = buildChartModels(last()); if (!built.ok) throw new Error("success");
    expect(built.composition.steps[1].startAnchor.id).toBe("A1"); expect(built.composition.steps[1].endAnchor.id).toBe("A2");
  });
  it("W03 growth step is A2 to A3", () => {
    const built = buildChartModels(last()); if (!built.ok) throw new Error("success");
    expect(built.composition.steps[2].startAnchor.id).toBe("A2"); expect(built.composition.steps[2].endAnchor.id).toBe("A3");
  });
  it("W04 fee step is A3 to A4", () => {
    const built = buildChartModels(last()); if (!built.ok) throw new Error("success");
    expect(built.composition.steps[3].startAnchor.id).toBe("A3"); expect(built.composition.steps[3].endAnchor.id).toBe("A4");
  });
  it("W05 ending step is A0 to A5 final balance", () => {
    const built = buildChartModels(last()); if (!built.ok) throw new Error("success");
    expect(built.composition.steps[4].endAnchor.value).toBe(last().result.finalBalance);
  });
  it("W07 zero gross growth uses flat pattern", () => {
    const built = buildChartModels(last()); if (!built.ok) throw new Error("success");
    expect(built.composition.steps[2].pattern).toBe("flat");
  });
  it("W07 positive gross growth uses positive growth pattern", () => {
    const base=last(); const row={...base.result.annualSchedule[0]!,contributions:0,grossGrowth:10,closingBalance:110,cumulativeContributions:0,cumulativeGrossGrowth:10};
    const value={...base,result:{...base.result,finalBalance:110,totalContributions:0,grossGrowth:10,totalFees:0,nominalInvestmentGain:10,inflationAdjustedFinalBalance:110,annualSchedule:[row]}};
    const built=buildChartModels(value); if(!built.ok)throw new Error("success"); expect(built.composition.steps[2]).toMatchObject({sign:"positive",pattern:"growth",rawValue:10});
  });
  it("W07 negative gross growth uses negative loss pattern", () => {
    const base=last(); const row={...base.result.annualSchedule[0]!,contributions:0,grossGrowth:-10,closingBalance:90,cumulativeContributions:0,cumulativeGrossGrowth:-10};
    const value={...base,result:{...base.result,finalBalance:90,totalContributions:0,grossGrowth:-10,totalFees:0,nominalInvestmentGain:-10,inflationAdjustedFinalBalance:90,annualSchedule:[row]}};
    const built=buildChartModels(value); if(!built.ok)throw new Error("success"); expect(built.composition.steps[2]).toMatchObject({sign:"negative",pattern:"loss",rawValue:-10});
  });
  it("W08 fee and growth remain distinct steps", () => {
    const built = buildChartModels(last()); if (!built.ok) throw new Error("success");
    expect(built.composition.steps[2].id).not.toBe(built.composition.steps[3].id);
  });
  it("W02–W05 preserve numeric anchors, raw values, and ledger equations", () => { const base=last();const row={...base.result.annualSchedule[0]!,contributions:20,grossGrowth:10,fees:5,closingBalance:125,cumulativeContributions:20,cumulativeGrossGrowth:10,cumulativeFees:5};const built=buildChartModels({...base,result:{...base.result,finalBalance:125,totalContributions:20,grossGrowth:10,totalFees:5,nominalInvestmentGain:5,inflationAdjustedFinalBalance:125,annualSchedule:[row]}});if(!built.ok)throw new Error("success");const s=built.composition.steps;expect(s.map(x=>[x.startAnchor.value,x.endAnchor.value,x.rawValue])).toEqual([[0,100,100],[100,120,20],[120,130,10],[130,125,-5],[0,125,125]]);expect(s[1]!.endAnchor.value-s[1]!.startAnchor.value).toBe(s[1]!.rawValue);expect(s[2]!.endAnchor.value-s[2]!.startAnchor.value).toBe(s[2]!.rawValue);expect(s[3]!.endAnchor.value-s[3]!.startAnchor.value).toBe(s[3]!.rawValue); });
  it("W08 keeps fees greater than positive growth as distinct reconciled geometry", () => { const base=last();const row={...base.result.annualSchedule[0]!,contributions:0,grossGrowth:10,fees:20,closingBalance:90,cumulativeContributions:0,cumulativeGrossGrowth:10,cumulativeFees:20};const built=buildChartModels({...base,result:{...base.result,finalBalance:90,totalContributions:0,grossGrowth:10,totalFees:20,nominalInvestmentGain:-10,inflationAdjustedFinalBalance:90,annualSchedule:[row]}});if(!built.ok)throw new Error("success");expect(built.composition.steps[2]).toMatchObject({rawValue:10,startAnchor:{value:100},endAnchor:{value:110}});expect(built.composition.steps[3]).toMatchObject({rawValue:-20,startAnchor:{value:110},endAnchor:{value:90}}); });
  const classify = (values: readonly number[]) => { const built = buildChartModels(last(values)); if (!built.ok || built.annualGrowth.modelKind !== "multi-point") throw new Error("multi-point success"); return built.annualGrowth.classification; };
  it("A01 all-equal annual sequence classifies", () => expect(classify([0, 0, 0]).pathClassification).toBe("all-equal"));
  it("A01 monotonic-up annual sequence classifies", () => expect(classify([0, 1, 2]).pathClassification).toBe("monotonic-or-flat"));
  it("A01 monotonic-down annual sequence classifies", () => expect(classify([2, 1, 0]).pathClassification).toBe("monotonic-or-flat"));
  it("A02 starts-up-ends-down sequence classifies", () => expect(classify([0, 2, 1]).pathClassification).toBe("starts-up-ends-down"));
  it("A02 starts-down-ends-up sequence classifies", () => expect(classify([2, 0, 1]).pathClassification).toBe("starts-down-ends-up"));
  it("A03 multiple reversal sequence classifies", () => expect(classify([0, 1, 0, 1, 0]).pathClassification).toBe("changes-direction"));
  it("A04 endpoint neutral is independent of reversal path", () => expect(classify([0, 1, 0]).endpointClassification).toBe("neutral"));
  it("A04 independently covers endpoint up, down, and neutral", () => { expect(classify([0,2,1]).endpointClassification).toBe("up");expect(classify([2,0,1]).endpointClassification).toBe("down");expect(classify([0,1,0]).endpointClassification).toBe("neutral"); });
  it("A05 zero classification distinguishes touch from cross", () => { expect(classify([0, 1, 0]).zeroClassification).toBe("touches-zero"); expect(classify([-1, 1]).zeroClassification).toBe("crosses-zero"); });
  it("A05 independently covers cross, touch, and does-not-touch", () => { expect(classify([-1,1]).zeroClassification).toBe("crosses-zero");expect(classify([0,1]).zeroClassification).toBe("touches-zero");expect(classify([2,1]).zeroClassification).toBe("does-not-touch-zero"); });
  it("A07 flat deltas do not create switches", () => expect(classify([0, 1, 1, 2]).pathClassification).toBe("monotonic-or-flat"));
  it("A07 counts zero, one, and many switches while ignoring flat deltas", () => { expect(classify([0,1,1,2]).pathClassification).toBe("monotonic-or-flat");expect(classify([0,2,2,1]).pathClassification).toBe("starts-up-ends-down");expect(classify([0,1,1,0,0,1,1,0]).pathClassification).toBe("changes-direction"); });
  it("A08 frozen zero sequence is up-down neutral touch only", () => { const c = classify([0, 1, 0]); expect(c).toMatchObject({ pathClassification:"starts-up-ends-down", endpointClassification:"neutral", zeroClassification:"touches-zero" }); });
  it("A08 frozen sequences carry their complete classification IDs", () => { expect(classify([0,1,0]).classificationId).toBe("annual:starts-up-ends-down:neutral:touches-zero");expect(classify([0,1,2]).classificationId).toBe("annual:monotonic-or-flat:up:touches-zero");expect(classify([2,1,0]).classificationId).toBe("annual:monotonic-or-flat:down:touches-zero"); });
  it("N01 all-zero domain is -1 through 1", () => { const built = buildChartModels(last([0])); if (!built.ok) throw new Error("success"); expect(built.annualGrowth.domain).toMatchObject({min:-1,max:1,includesZero:true}); });
  it("N01 covers exact domains and raw ticks for every balance class", () => { const cases:[readonly number[],number,number][]=[[[0],-1,1],[[5],-1,6],[[0,5],-1,6],[[-5,-2],-6,1],[[0,5,0],-1,6],[[-5,5],-6,6]];for(const [values,min,max] of cases){const built=buildChartModels(last(values));if(!built.ok)throw new Error("success");expect(built.annualGrowth.domain).toEqual({min,max,includesZero:true,tickFractions:[0,.25,.5,.75,1]});expect(built.annualGrowth.ticks.map(x=>x.value)).toEqual([0,.25,.5,.75,1].map(f=>min+(max-min)*f));} });
  it("N02 identical input produces stable domain and ticks", () => { const a=buildChartModels(last([0,1,0]));const b=buildChartModels(last([0,1,0]));if(!a.ok||!b.ok)throw new Error("success");expect(a.annualGrowth.domain).toEqual(b.annualGrowth.domain);expect(a.annualGrowth.ticks).toEqual(b.annualGrowth.ticks); });
  it("N03 compact tick promotes 999950 to 1M", () => expect(compactTick(999950)).toBe("1M"));
  it("N03 covers suffix thresholds and every promotion", () => { expect(compactTick(999)).toBe("999");expect(compactTick(1000)).toBe("1K");expect(compactTick(999950)).toBe("1M");expect(compactTick(999950000)).toBe("1B");expect(compactTick(999950000000)).toBe("1T"); });
  it("N04 compact tick preserves negative sign and normalizes negative zero", () => { expect(compactTick(-1250)).toBe("−1.3K"); expect(compactTick(-0)).toBe("0"); });
  it("N04 covers positive zero, negative zero, half-up, and .0 elision", () => { expect(compactTick(0)).toBe("0");expect(compactTick(-0)).toBe("0");expect(compactTick(1250)).toBe("1.3K");expect(compactTick(1000)).toBe("1K");expect(compactTick(-1250)).toBe("−1.3K"); });
  it("N06 label indexes include all points through six", () => expect(labelledPointIndexes(6)).toEqual([0,1,2,3,4,5]));
  it("N06 iterates every 1–6 and the frozen quarter formula for 7–100", () => { for(let n=1;n<=6;n++)expect(labelledPointIndexes(n)).toEqual(Array.from({length:n},(_,i)=>i));for(let n=7;n<=100;n++){const expected=[0,1,2,3,4].map(i=>Math.floor(i*(n-1)/4+.5));const actual=labelledPointIndexes(n);expect(actual).toEqual([...new Set(expected)].sort((a,b)=>a-b));expect(actual[0]).toBe(0);expect(actual.at(-1)).toBe(n-1);} });
  it("N07 label indexes round halves upward and are sorted unique", () => expect(labelledPointIndexes(7)).toEqual([0,2,3,5,6]));

  it("T01–T13 type branch and fixed failure contracts compile through the checked signature", () => {
    const built = buildChartModels(last());
    expect(built.ok).toBe(true);
    if (built.ok) expect(built.annualGrowth.modelKind).toBe("single-point");
    const empty = buildChartModels({ ...last(), result: { ...last().result, annualSchedule: [] } });
    expect(empty.ok ? undefined : empty.reason).toBe("missing-data");
  });
  it("F01–F05 validates missing, nonfinite, malformed, precedence, and frozen numeric identity boundaries", () => {
    expect((buildChartModels(null as never) as { reason?: string }).reason).toBe("missing-data");
    const base = last(); const nonfinite = { ...base, result: { ...base.result, finalBalance: Number.NaN } };
    const nonfiniteResult = buildChartModels(nonfinite); expect((nonfiniteResult as { reason?: string }).reason).toBe("non-finite-data");
    const invalid = { ...base, result: { ...base.result, totalFees: -1 } };
    const invalidResult = buildChartModels(invalid); expect((invalidResult as { reason?: string }).reason).toBe("contract-mismatch");
  });
  it("accepts the real default producer result despite annual floating-point accumulation order", () => {
    const drafted = defaultLast();
    const direct = evaluateCalculator(drafted.inputs);
    expect(direct.result).toBeDefined();
    expect(buildChartModels(drafted).ok).toBe(true);
    expect(buildChartModels({ inputs: drafted.inputs, result: direct.result! }).ok).toBe(true);
  });
  it("accepts the producer's annual aggregate representation difference without rounding financial data", () => {
    const value = defaultLast();
    const annualGrowth = value.result.annualSchedule.reduce((sum, row) => sum + row.grossGrowth, 0);
    expect(annualGrowth).not.toBe(value.result.grossGrowth);
    expect(buildChartModels(value).ok).toBe(true);
  });
  it("accepts the literal Phase 1A absolute tolerance boundary without mutating supplied values", () => {
    const expected = 0;
    const actual = 1e-9;
    const frozenTolerance = Math.max(1e-9, 1e-12 * Math.max(1, Math.abs(actual), Math.abs(expected)));
    expect(Math.abs(actual - expected)).toBe(frozenTolerance);
    const value = ledger(100, 0, 0, 0);
    const rows = value.result.annualSchedule.map((row) => ({ ...row, cumulativeContributions: actual }));
    const supplied = { ...value, result: { ...value.result, annualSchedule: rows } };
    const before = JSON.stringify(supplied);
    expect(buildChartModels(supplied).ok).toBe(true);
    expect(JSON.stringify(supplied)).toBe(before);
    expect(rows[0]!.cumulativeContributions).toBe(actual);
  });
  it("accepts the Phase 1A relative tolerance where the temporary EPSILON rule would not", () => {
    const expected = 1_000_000_000_000;
    const actual = expected + 0.5;
    const frozenTolerance = Math.max(1e-9, 1e-12 * Math.max(1, Math.abs(actual), Math.abs(expected)));
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(frozenTolerance);
    expect(Math.abs(actual - expected)).toBeGreaterThan(128 * Number.EPSILON * Math.max(1, Math.abs(actual), Math.abs(expected)));
    const value = ledger(0, expected, 0, 0);
    const rows = value.result.annualSchedule.map((row) => ({ ...row, cumulativeContributions: actual }));
    const supplied = { ...value, result: { ...value.result, annualSchedule: rows } };
    const before = JSON.stringify(supplied);
    expect(buildChartModels(supplied).ok).toBe(true);
    expect(JSON.stringify(supplied)).toBe(before);
  });
  it("rejects a literal difference above the frozen Phase 1A tolerance", () => {
    const expected = 0;
    const actual = 2e-9;
    const frozenTolerance = Math.max(1e-9, 1e-12 * Math.max(1, Math.abs(actual), Math.abs(expected)));
    expect(Math.abs(actual - expected)).toBeGreaterThan(frozenTolerance);
    const value = ledger(100, 0, 0, 0);
    const rows = value.result.annualSchedule.map((row) => ({ ...row, cumulativeContributions: actual }));
    expect((buildChartModels({ ...value, result: { ...value.result, annualSchedule: rows } }) as { reason?: string }).reason).toBe("contract-mismatch");
  });
  it("accepts an inside-tolerance recomputed A3-minus-fees identity without repairing finalBalance", () => {
    const value = ledger(100, 0, 0, 0);
    const suppliedFinal = 100 + 5e-10;
    const rows = value.result.annualSchedule.map((row) => ({ ...row, closingBalance: suppliedFinal }));
    const supplied = { ...value, result: { ...value.result, finalBalance: suppliedFinal, inflationAdjustedFinalBalance: suppliedFinal, annualSchedule: rows } };
    const before = JSON.stringify(supplied);
    const built = buildChartModels(supplied);
    expect(built.ok).toBe(true);
    expect(JSON.stringify(supplied)).toBe(before);
    if (!built.ok) throw new Error("expected success");
    expect(built.composition.steps[3].endAnchor.value).toBe(suppliedFinal);
    expect(built.composition.steps[4].endAnchor.value).toBe(suppliedFinal);
  });
  it("still rejects a materially incorrect closing balance", () => {
    const value = defaultLast();
    const rows = value.result.annualSchedule.map((row) => ({ ...row }));
    rows[0]!.closingBalance += 0.01;
    expect((buildChartModels({ ...value, result: { ...value.result, annualSchedule: rows } }) as { reason?: string }).reason).toBe("contract-mismatch");
  });
  it("still rejects a materially incorrect floating aggregate", () => {
    const value = defaultLast();
    expect((buildChartModels({ ...value, result: { ...value.result, grossGrowth: value.result.grossGrowth + 0.01 } }) as { reason?: string }).reason).toBe("contract-mismatch");
  });
  it("W01–W05/W07–W08 build frozen anchors, patterns, and separate fees", () => {
    const built = buildChartModels(last()); if (!built.ok) throw new Error("expected success");
    expect(built.composition.steps.map(step => step.id)).toEqual(["starting-balance", "contributions", "gross-growth", "fees", "ending-balance"]);
    expect(built.composition.steps[4].startAnchor.id).toBe("A0");
    expect(built.composition.steps[4].endAnchor.id).toBe("A5");
  });
  it("C01–C04 select exact composition text without double minus", () => {
    const built = buildChartModels(last()); if (!built.ok) throw new Error("expected success");
    expect(built.composition.staticSummary.visibleText).toContain("Regular contributions total");
  });
  it("A01–A05/A07–A08 classify normative annual sequences", () => {
    const built = buildChartModels(last([0, 1, 0])); if (!built.ok) throw new Error("expected success");
    if (built.annualGrowth.modelKind !== "multi-point") throw new Error("expected multi-point");
    expect(built.annualGrowth.classification.pathClassification).toBe("starts-up-ends-down");
    expect(built.annualGrowth.classification.endpointClassification).toBe("neutral");
    expect(built.annualGrowth.classification.zeroClassification).toBe("touches-zero");
  });
  it("N01–N04/N06–N07 derive deterministic domains, ticks, compact labels, and indexes", () => {
    expect(compactTick(999950)).toBe("1M");
    expect(compactTick(-0)).toBe("0");
    expect(labelledPointIndexes(7)).toEqual([0, 2, 3, 5, 6]);
    expect(annualTickId(4)).toBe("annual-y-tick-4");
    expect(waterfallTickId(0)).toBe("waterfall-y-tick-0");
    expect(annualPointId(99)).toBe("annual-growth-point-99");
  });
  it("S01/S02/S03/S04/S05/S06/S07 repeat the same last input with byte-identical IDs", () => {
    const first = buildChartModels(last([0, 1, 0])); const second = buildChartModels(last([0, 1, 0]));
    if (!first.ok || !second.ok) throw new Error("expected success");
    expect(second.annualGrowth.points.map(p => p.id)).toEqual(first.annualGrowth.points.map(p => p.id));
    expect(second.annualGrowth.ticks.map(t => t.id)).toEqual(first.annualGrowth.ticks.map(t => t.id));
    expect(second.composition.ticks.map(t => t.id)).toEqual(first.composition.ticks.map(t => t.id));
    expect(second.composition.steps.map(s => s.id)).toEqual(first.composition.steps.map(s => s.id));
  });
  it("B01 consumes supplied schedules without importing a financial recomputation entry point", () => {
    recomputationCalls.evaluate = 0; recomputationCalls.calculate = 0; recomputationCalls.validate = 0;
    const supplied = last([0, 1, 0]); const built = buildChartModels(supplied);
    if (!built.ok) throw new Error("expected success");
    expect(built.annualGrowth.points.map(point => point.rawClosingBalance)).toEqual([0, 1, 0]);
    expect(built.annualGrowth.points.map(point => point.scheduleIndex)).toEqual([0, 1, 2]);
    expect(recomputationCalls).toEqual({ evaluate: 0, calculate: 0, validate: 0 });
  });
  it("B01 one-year supplied schedule is preserved without recomputation", () => {
    recomputationCalls.evaluate = 0; recomputationCalls.calculate = 0; recomputationCalls.validate = 0;
    const built = buildChartModels(last([0])); if (!built.ok) throw new Error("success");
    expect(built.annualGrowth.points.map(p=>[p.scheduleIndex,p.rawClosingBalance])).toEqual([[0,0]]); expect(recomputationCalls).toEqual({ evaluate: 0, calculate: 0, validate: 0 });
  });
  it("B01 long supplied schedule is preserved without recomputation", () => {
    recomputationCalls.evaluate = 0; recomputationCalls.calculate = 0; recomputationCalls.validate = 0;
    const built = buildChartModels(last(Array.from({ length: 25 }, (_, i) => i))); if (!built.ok) throw new Error("success");
    expect(built.annualGrowth.points.map(p=>p.scheduleIndex)).toEqual(Array.from({length:25},(_,i)=>i)); expect(built.annualGrowth.points.map(p=>p.rawClosingBalance)).toEqual(Array.from({length:25},(_,i)=>i)); expect(recomputationCalls).toEqual({ evaluate: 0, calculate: 0, validate: 0 });
  });
  it("B01 one-hundred supplied points are preserved without recomputation", () => {
    recomputationCalls.evaluate = 0; recomputationCalls.calculate = 0; recomputationCalls.validate = 0;
    const built = buildChartModels(last(Array.from({ length: 100 }, (_, i) => i))); if (!built.ok) throw new Error("success");
    expect(built.annualGrowth.points.map(p=>p.scheduleIndex)).toEqual(Array.from({length:100},(_,i)=>i)); expect(built.annualGrowth.points.map(p=>p.rawClosingBalance)).toEqual(Array.from({length:100},(_,i)=>i)); expect(recomputationCalls).toEqual({ evaluate: 0, calculate: 0, validate: 0 });
  });
  const stable = () => { const a=buildChartModels(last([0,1,0])); const b=buildChartModels(last([0,1,0])); if(!a.ok||!b.ok) throw new Error("success"); return [a,b] as const; };
  it("S01 repeated build preserves summary classification IDs", () => { const [a,b]=stable(); expect(b.composition.staticSummary.classificationId).toBe(a.composition.staticSummary.classificationId); expect(b.annualGrowth.classification.classificationId).toBe(a.annualGrowth.classification.classificationId); });
  it("S02 builder rejects display-state argument at type level", () => { expect(buildChartModels.length).toBe(1); });
  it("S03 annual point and tick IDs use fixed templates", () => { const [a]=stable(); expect(a.annualGrowth.points.map(p=>p.id)).toEqual(["annual-growth-point-0","annual-growth-point-1","annual-growth-point-2"]); expect(a.annualGrowth.ticks.map(t=>t.id)).toEqual(["annual-y-tick-0","annual-y-tick-1","annual-y-tick-2","annual-y-tick-3","annual-y-tick-4"]); });
  it("S04 waterfall step IDs are fixed unique ordered literals", () => { const [a]=stable(); expect(a.composition.steps.map(s=>s.id)).toEqual(["starting-balance","contributions","gross-growth","fees","ending-balance"]); });
  it("S05 selection cannot mutate builder-owned IDs", () => { const [a,b]=stable(); expect(b.composition.steps.map(s=>s.id)).toEqual(a.composition.steps.map(s=>s.id)); });
  it("S06 ordinary repeated build preserves every ID", () => { const [a,b]=stable(); expect(JSON.stringify(b.annualGrowth.points.map(p=>p.id))).toBe(JSON.stringify(a.annualGrowth.points.map(p=>p.id))); });
  it("S07 formatted labels do not determine IDs", () => { const [a]=stable(); expect(a.annualGrowth.points[0]!.id).not.toBe(a.annualGrowth.points[0]!.formattedClosingBalance); });
  it("T10 and T11 select only the valid single-point or multi-point branch", () => {
    const single=buildChartModels(last([0])); const multi=buildChartModels(last([0,1]));
    if(!single.ok||!multi.ok) throw new Error("success");
    expect(single.annualGrowth.modelKind).toBe("single-point"); expect(multi.annualGrowth.modelKind).toBe("multi-point");
  });
  it("C01 zero-growth composition uses the frozen primary template", () => {
    const built=buildChartModels(last()); if(!built.ok)throw new Error("success");
    expect(built.composition.staticSummary.visibleText).toContain("the illustration shows starting balance, contributions, fees, and an ending balance");
  });
  it("C01 final-zero takes precedence over zero-growth template", () => {
    const built=buildChartModels(last([0])); if(!built.ok)throw new Error("success");
    expect(built.composition.staticSummary.classificationId).toBe("composition-final-zero");
    expect(built.composition.staticSummary.visibleText).toContain("The supplied illustration ends at");
  });
  it("C01 enumerates all seven frozen composition predicates, exact text, and precedence", () => {
    const cases:[Parameters<typeof ledger>,string][]=[[[100,0,0,150],"composition-final-negative"],[[100,0,0,100],"composition-final-zero"],[[100,0,-10,0],"composition-negative-growth"],[[100,0,0,0],"composition-zero-growth"],[[100,0,10,20],"composition-fees-exceed-positive-growth"],[[100,0,10,5],"composition-positive-growth-with-fees"],[[100,0,10,0],"composition-positive-growth-without-fees"]];
    for(const [args,id] of cases){const [initial,contributions,growth,fees]=args,final=initial+contributions+growth-fees,f=(n:number)=>formatCurrencyDisplay(n,"USD");const primary=id==="composition-final-negative"||id==="composition-final-zero"?`The supplied illustration ends at ${f(final)}. Review the listed starting balance, contributions, gross growth, and fees.`:id==="composition-negative-growth"?`Under these assumptions, gross growth is ${f(growth)}; after fees of ${f(fees)}, the illustration ends at ${f(final)}.`:id==="composition-zero-growth"?`Under these assumptions, gross growth is ${f(growth)}; the illustration shows starting balance, contributions, fees, and an ending balance of ${f(final)}.`:id==="composition-fees-exceed-positive-growth"?`Gross growth of ${f(growth)} is smaller than fees of ${f(fees)}; the illustration ends at ${f(final)}.`:id==="composition-positive-growth-with-fees"?`This illustration starts with ${f(initial)}, adds ${f(contributions)} in contributions, shows ${f(growth)} in gross growth before ${f(fees)} in fees, and ends at ${f(final)}.`:`This illustration starts with ${f(initial)}, adds ${f(contributions)} in contributions, shows ${f(growth)} in gross growth, and ends at ${f(final)}.`;const built=buildChartModels(ledger(...args));if(!built.ok)throw new Error("success");expect(built.composition.staticSummary.classificationId).toBe(id);expect(built.composition.staticSummary.visibleText).toBe(primary+" No regular contributions are included in this illustration.");}
  });
  it("C01 fees equal to positive gross growth remains positive-growth-with-fees", () => { const built=buildChartModels(ledger(100,0,10,10));if(!built.ok)throw new Error("success");expect(built.composition.staticSummary.classificationId).toBe("composition-positive-growth-with-fees");expect(built.composition.staticSummary.visibleText).toBe(`This illustration starts with $100.00, adds $0.00 in contributions, shows $10.00 in gross growth before $10.00 in fees, and ends at $100.00. No regular contributions are included in this illustration.`); });
  it("C02 positive contributions use the frozen contribution suffix", () => {
    const built=buildChartModels(last()); if(!built.ok)throw new Error("success");
    expect(built.composition.staticSummary.visibleText).toContain("Regular contributions total $15.00 in this illustration.");
  });
  it("C02 zero and positive contributions use their exact frozen suffixes", () => { const zero=buildChartModels(ledger(100,0,10,0));const positive=buildChartModels(ledger(100,20,10,0));if(!zero.ok||!positive.ok)throw new Error("success");expect(zero.composition.staticSummary.visibleText).toContain(" No regular contributions are included in this illustration.");expect(positive.composition.staticSummary.visibleText).toContain(" Regular contributions total $20.00 in this illustration."); });
  it("C03 extreme amount adds the full-amount carrier sentence", () => {
    const built=buildChartModels(last([1_000_000_000])); if(!built.ok)throw new Error("success");
    expect(built.composition.staticSummary.visibleText).toContain("Full amounts are shown in the data list and selected-value text.");
  });
  it("C03 extreme text retains a full non-compact amount", () => { const built=buildChartModels(ledger(1_000_000_000,0,0,0));if(!built.ok)throw new Error("success");expect(built.composition.staticSummary.visibleText).toContain("$1,000,000,000.00");expect(built.composition.staticSummary.visibleText).toContain("Full amounts are shown in the data list and selected-value text."); });
  it("C04 negative growth uses formatter sign without an added minus", () => {
    const base=last(); const row={...base.result.annualSchedule[0]!,contributions:0,grossGrowth:-10,closingBalance:90,cumulativeContributions:0,cumulativeGrossGrowth:-10};
    const value={...base,inputs:{...base.inputs,initialPrincipal:100},result:{...base.result,finalBalance:90,totalContributions:0,grossGrowth:-10,totalFees:0,nominalInvestmentGain:-10,inflationAdjustedFinalBalance:90,annualSchedule:[row]}};
    const built=buildChartModels(value); if(!built.ok)throw new Error("success");
    expect(built.composition.staticSummary.visibleText).toContain("gross growth is -$10.00"); expect(built.composition.staticSummary.visibleText).not.toContain("--");
  });
  it("schedule rejects more than one hundred supplied points", () => { const value=last(Array.from({length:101},(_,i)=>i)); expect((buildChartModels(value) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("direct-copy initial opening rejects a representational difference inside accounting tolerance", () => { const value=ledger(100,0,0,0);const rows=value.result.annualSchedule.map(row=>({...row}));rows[0]!.openingBalance=100+5e-10;expect(rows[0]!.openingBalance).not.toBe(value.inputs.initialPrincipal);expect((buildChartModels({...value,result:{...value.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects non-contiguous row opening balances", () => { const base=last([0,1]); const rows=base.result.annualSchedule.map(row=>({...row})); rows[1]!.openingBalance=9; expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("direct-copy adjacent opening rejects a representational difference inside accounting tolerance", () => { const base=last([0,1]);const rows=base.result.annualSchedule.map(row=>({...row}));rows[1]!.openingBalance=rows[0]!.closingBalance+5e-10;expect(rows[1]!.openingBalance).not.toBe(rows[0]!.closingBalance);expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects non-contiguous month intervals", () => { const base=last([0,1]); const rows=base.result.annualSchedule.map(row=>({...row})); rows[1]!.startMonth=99; expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects non-increasing annual years without requiring array-index years", () => { const base=last([0,1]); const rows=base.result.annualSchedule.map(row=>({...row})); rows[0]!.year=4; rows[1]!.year=4; expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects non-integer year", () => { const base=last();const rows=base.result.annualSchedule.map(row=>({...row,year:1.5}));expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects non-integer month", () => { const base=last();const rows=base.result.annualSchedule.map(row=>({...row,startMonth:1.5}));expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects a period longer than twelve months", () => { const base=last();const rows=base.result.annualSchedule.map(row=>({...row,endMonth:13}));expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects cumulative gross growth mismatch", () => { const base=last();const rows=base.result.annualSchedule.map(row=>({...row,cumulativeGrossGrowth:1}));expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects cumulative fees mismatch", () => { const base=last();const rows=base.result.annualSchedule.map(row=>({...row,cumulativeFees:1}));expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects gross-growth aggregate mismatch", () => { const base=last();expect((buildChartModels({...base,result:{...base.result,grossGrowth:1}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects fees aggregate mismatch", () => { const base=last();expect((buildChartModels({...base,result:{...base.result,totalFees:1}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects cumulative total mismatch", () => { const base=last(); const rows=base.result.annualSchedule.map(row=>({...row,cumulativeContributions:99})); expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects aggregate total mismatch", () => { const base=last(); expect((buildChartModels({...base,result:{...base.result,totalContributions:99}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects a non-integer endMonth", () => { const base=last();const rows=base.result.annualSchedule.map(x=>({...x,endMonth:12.5}));expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects only an invalid first startMonth", () => { const base=last();const rows=base.result.annualSchedule.map(x=>({...x,startMonth:2,endMonth:12}));expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects only an invalid final endMonth", () => { const base=last();const rows=base.result.annualSchedule.map(x=>({...x,endMonth:11}));expect((buildChartModels({...base,result:{...base.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("schedule rejects final-row closing balance distinct from finalBalance", () => { const base=last();const rows=base.result.annualSchedule.map(x=>({...x}));expect((buildChartModels({...base,result:{...base.result,finalBalance:116,inflationAdjustedFinalBalance:116,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("direct-copy final closing rejects a representational difference inside accounting tolerance", () => { const value=ledger(100,0,0,0);const rows=value.result.annualSchedule.map(row=>({...row,closingBalance:row.closingBalance+5e-10}));expect(rows[0]!.closingBalance).not.toBe(value.result.finalBalance);expect((buildChartModels({...value,result:{...value.result,annualSchedule:rows}}) as {reason?:string}).reason).toBe("contract-mismatch"); });
  it("direct-copy A4 and A5 carry the exact same supplied finalBalance", () => { const value=ledger(100,0,0,0);const built=buildChartModels(value);if(!built.ok)throw new Error("expected success");const a4=built.composition.steps[3].endAnchor.value,a5=built.composition.steps[4].endAnchor.value;expect(a4).toBe(value.result.finalBalance);expect(a5).toBe(value.result.finalBalance);expect(Object.is(a4,a5)).toBe(true); });
  it("A06 single-point partial regression uses supplied month bounds in label and summary", () => {
    const drafted = evaluateDrafts({ ...defaultDrafts(), durationMonths: "1" });
    if (!drafted.inputs || !drafted.evaluation?.result) throw new Error("expected legal one-month result");
    const built = buildChartModels({ inputs: drafted.inputs, result: drafted.evaluation.result });
    if (!built.ok) throw new Error("expected successful chart model");
    const point = built.annualGrowth.points[0]!;
    expect(point).toMatchObject({
      year: 1,
      startMonth: 1,
      endMonth: 1,
      isPartialPeriod: true,
      label: "Year 1 — partial period, months 1–1",
    });
    expect(point.accessibleLabel).toBe(`Year 1 — partial period, months 1–1: ${point.formattedClosingBalance}.`);
    expect(built.annualGrowth.classification.staticSummary.visibleText).toBe(
      `One annual point: Year 1 — partial period, months 1–1, ${point.formattedClosingBalance}. The final recorded period covers months 1–1.`,
    );
  });
});
