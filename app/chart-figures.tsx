"use client";

import { useRef, useState } from "react";
import type { AnnualModel, ChartModelBuildResult, CompositionModel } from "../lib/presentation/chart-model";
export type ChartSelection = Readonly<{ composition: number; annual: number }>;

const instruction = "Use Left and Right Arrow to review chart values. Home selects the first value. End selects the last value.";
const compositionViewBox = { minX: -18, minY: 0, width: 536, height: 200, value: "-18 0 536 200" } as const;
const annualViewBox = { minX: 0, minY: 0, width: 500, height: 180, value: "0 0 500 180" } as const;
const compositionPlot = { left: 20, right: 464, top: 20, bottom: 120 } as const;
const annualPlot = { left: 30, right: 470, top: 40, bottom: 140 } as const;
const compositionLabelRows = [142, 174] as const;

type PlotBounds = Readonly<{ left: number; right: number; top: number; bottom: number }>;
type ChartViewBox = Readonly<{ minX: number; minY: number; width: number; height: number }>;

const compositionX = (index: number) => 52 + index * 95;
const annualX = (index: number, length: number) => 30 + index * (440 / Math.max(1, length - 1));

function resolveSpatialIndex(
  event: React.PointerEvent<SVGSVGElement>,
  renderedXPositions: readonly number[],
  bounds: PlotBounds,
  viewBox: ChartViewBox,
): number | undefined {
  if (event.pointerType !== "mouse" && event.pointerType !== "touch") return undefined;
  const rect = event.currentTarget.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0 || renderedXPositions.length === 0) return undefined;
  const x = viewBox.minX + ((event.clientX - rect.left) / rect.width) * viewBox.width;
  const y = viewBox.minY + ((event.clientY - rect.top) / rect.height) * viewBox.height;
  if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) return undefined;

  let nearest = 0;
  let nearestDistance = Math.abs(x - renderedXPositions[0]!);
  for (let index = 1; index < renderedXPositions.length; index += 1) {
    const distance = Math.abs(x - renderedXPositions[index]!);
    if (distance < nearestDistance) {
      nearest = index;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function commitSpatialSelection(
  event: React.PointerEvent<SVGSVGElement>,
  renderedXPositions: readonly number[],
  bounds: PlotBounds,
  viewBox: ChartViewBox,
  selected: number,
  onSelect: (index: number) => void,
) {
  const index = resolveSpatialIndex(event, renderedXPositions, bounds, viewBox);
  if (index !== undefined && index !== selected) onSelect(index);
}

function previewSpatialSelection(
  event: React.PointerEvent<SVGSVGElement>,
  renderedXPositions: readonly number[],
  bounds: PlotBounds,
  viewBox: ChartViewBox,
  onPreview: (index: number) => void,
  onPreviewClear: () => void,
) {
  if (event.pointerType !== "mouse") return;
  const index = resolveSpatialIndex(event, renderedXPositions, bounds, viewBox);
  if (index === undefined) onPreviewClear();
  else onPreview(index);
}

function compositionBarGeometry(
  step: CompositionModel["steps"][number],
  domain: CompositionModel["domain"],
) {
  const valueToY = (value: number) =>
    compositionPlot.bottom -
    ((value - domain.min) / (domain.max - domain.min)) *
      (compositionPlot.bottom - compositionPlot.top);
  const startY = valueToY(step.startAnchor.value);
  const endY = valueToY(step.endAnchor.value);
  return { y: Math.min(startY, endY), height: Math.abs(startY - endY) };
}

function nextIndex(event: React.KeyboardEvent<HTMLElement>, current: number, length: number): number | undefined {
  if (event.key === "ArrowLeft") { event.preventDefault(); return Math.max(0, current - 1); }
  if (event.key === "ArrowRight") { event.preventDefault(); return Math.min(length - 1, current + 1); }
  if (event.key === "Home") { event.preventDefault(); return 0; }
  if (event.key === "End") { event.preventDefault(); return length - 1; }
  return undefined;
}

function CompositionFigure({ model, committed, visible, onSelect, onPreview, onPreviewClear }: {
  model: CompositionModel;
  committed: number;
  visible: number;
  onSelect(index: number): void;
  onPreview(index: number): void;
  onPreviewClear(): void;
}) {
  const step = model.steps[visible]!;
  const renderedXPositions = model.steps.map((_, index) => compositionX(index));
  return <figure aria-labelledby="composition-title" className="chart-figure chart-card">
    <figcaption><p className="chart-kicker">Where the balance comes from</p><h3 id="composition-title">Balance composition</h3></figcaption>
    <p className="chart-instruction" id="composition-instruction">{instruction}</p>
    <div role="group" tabIndex={0} aria-labelledby="composition-title" aria-describedby="composition-instruction" onKeyDown={(event) => { const index = nextIndex(event, committed, model.steps.length); if (index !== undefined) onSelect(index); }}>
      <svg viewBox={compositionViewBox.value} role="img" aria-labelledby="composition-svg-title composition-svg-desc" className="chart-svg" onPointerMove={(event) => previewSpatialSelection(event, renderedXPositions, compositionPlot, compositionViewBox, onPreview, onPreviewClear)} onPointerLeave={onPreviewClear} onPointerUp={(event) => { if (event.pointerType === "touch") onPreviewClear(); commitSpatialSelection(event, renderedXPositions, compositionPlot, compositionViewBox, committed, onSelect); }}>
        <title id="composition-svg-title">Balance composition</title><desc id="composition-svg-desc">A five-step reconciliation of starting balance, contributions, gross growth, fees, and ending balance.</desc>
        {model.steps.map((item, index) => {
          const geometry = compositionBarGeometry(item, model.domain);
          return <g key={item.id} aria-hidden="true" opacity={index === visible ? 1 : .45}>
            <rect x={20 + index * 95} y={geometry.y} width={64} height={geometry.height} rx={4} className={`chart-bar chart-${item.pattern}`} />
            <text x={compositionX(index)} y={compositionLabelRows[index % compositionLabelRows.length]} textAnchor="middle">{item.label}</text>
          </g>;
        })}
        {model.steps.map((item, index) => {
          const left = index === 0 ? compositionPlot.left : (renderedXPositions[index - 1]! + renderedXPositions[index]!) / 2;
          const right = index === model.steps.length - 1 ? compositionPlot.right : (renderedXPositions[index]! + renderedXPositions[index + 1]!) / 2;
          return <rect key={`${item.id}-hit`} data-chart-hit-region="composition" data-chart-index={index} aria-hidden="true" focusable="false" fill="transparent" x={left} y={compositionPlot.top} width={right - left} height={compositionPlot.bottom - compositionPlot.top} />;
        })}
      </svg>
    </div>
    <ol className="chart-values" aria-label="Balance composition values">{model.steps.map((item, index) => <li key={item.id}><button type="button" tabIndex={-1} onFocus={() => onSelect(index)} onClick={() => onSelect(index)} aria-current={index === committed ? "true" : undefined}>{item.accessibleLabel}</button></li>)}</ol>
    <p className="chart-selected">{step.accessibleLabel}</p><p className="chart-summary">{model.staticSummary.visibleText}</p>
  </figure>;
}

function AnnualFigure({ model, committed, visible, onSelect, onPreview, onPreviewClear }: {
  model: AnnualModel;
  committed: number;
  visible: number;
  onSelect(index: number): void;
  onPreview(index: number): void;
  onPreviewClear(): void;
}) {
  const committedIndex = Math.min(committed, model.points.length - 1);
  const visibleIndex = Math.min(visible, model.points.length - 1);
  const point = model.points[visibleIndex]!;
  const title = "Annual ending balance";
  const renderedXPositions = model.points.map((_, index) => annualX(index, model.points.length));
  return <figure aria-labelledby="annual-title" className="chart-figure chart-card">
    <figcaption><p className="chart-kicker">How it changes over time</p><h3 id="annual-title">{title}</h3></figcaption>
    <p className="chart-instruction" id="annual-instruction">{instruction}</p>
    <div role="group" tabIndex={0} aria-labelledby="annual-title" aria-describedby="annual-instruction" onKeyDown={(event) => { const index = nextIndex(event, committedIndex, model.points.length); if (index !== undefined) onSelect(index); }}>
      <svg viewBox={annualViewBox.value} role="img" aria-labelledby="annual-svg-title annual-svg-desc" className="chart-svg" onPointerMove={(event) => previewSpatialSelection(event, renderedXPositions, annualPlot, annualViewBox, onPreview, onPreviewClear)} onPointerLeave={onPreviewClear} onPointerUp={(event) => { if (event.pointerType === "touch") onPreviewClear(); commitSpatialSelection(event, renderedXPositions, annualPlot, annualViewBox, committedIndex, onSelect); }}>
        <title id="annual-svg-title">Annual ending balance</title><desc id="annual-svg-desc">One marker for each supplied annual ending balance.</desc>
        <polyline fill="none" className="chart-line" points={model.points.map((p, i) => `${annualX(i, model.points.length)},${140 - ((p.rawClosingBalance - model.domain.min) / Math.max(1, model.domain.max - model.domain.min)) * 100}`).join(" ")} />
        {model.points.map((p, index) => <circle key={p.id} aria-hidden="true" className="chart-point" cx={annualX(index, model.points.length)} cy={140 - ((p.rawClosingBalance - model.domain.min) / Math.max(1, model.domain.max - model.domain.min)) * 100} r={index === visibleIndex ? 6 : 4} />)}
        <rect data-chart-hit-region="annual" aria-hidden="true" focusable="false" fill="transparent" x={annualPlot.left} y={annualPlot.top} width={annualPlot.right - annualPlot.left} height={annualPlot.bottom - annualPlot.top} />
      </svg>
    </div>
    <ol className="chart-values chart-values--annual" aria-label="Annual ending balance values">{model.points.map((item, index) => <li key={item.id}><button type="button" tabIndex={-1} onFocus={() => onSelect(index)} onClick={() => onSelect(index)} aria-current={index === committedIndex ? "true" : undefined}>{item.accessibleLabel}</button></li>)}</ol>
    <p className="chart-selected">{point.accessibleLabel}</p><p className="chart-summary">{model.classification.staticSummary.visibleText}</p><a className="text-link" href="#annual-table-heading">View annual calculation detail <span aria-hidden="true">↓</span></a>
  </figure>;
}

export function ChartFigures({ built, stale, selection, onSelectionChange, onCommitAnnouncement }: {
  built: ChartModelBuildResult;
  stale: boolean;
  selection: ChartSelection | null;
  onSelectionChange(selection: ChartSelection): void;
  onCommitAnnouncement?(announcement: string): void;
}) {
  const [hoverPreview, setHoverPreview] = useState<{
    owner: ChartModelBuildResult;
    composition: number | null;
    annual: number | null;
  }>(() => ({ owner: built, composition: null, annual: null }));
  const commitmentRef = useRef<{
    owner: ChartModelBuildResult;
    source: ChartSelection | null;
    composition: number | null;
    annual: number | null;
  }>({ owner: built, source: selection, composition: selection?.composition ?? null, annual: selection?.annual ?? null });
  if (commitmentRef.current.owner !== built || commitmentRef.current.source !== selection) {
    commitmentRef.current = {
      owner: built,
      source: selection,
      composition: selection?.composition ?? null,
      annual: selection?.annual ?? null,
    };
  }
  if (!built.ok) return <section className="charts-section" aria-labelledby="visualised-heading" data-stale={stale || undefined}><h2 id="visualised-heading">Your result visualised</h2>{built.unavailable.map((item) => <p key={item.classificationId}>{item.fallbackText}</p>)}</section>;
  if (selection === null) throw new Error("A successful chart model requires Workspace-owned initial selection.");
  const activePreview = hoverPreview.owner === built
    ? hoverPreview
    : { owner: built, composition: null, annual: null };
  const preview = (chart: "composition" | "annual", index: number) => {
    setHoverPreview((current) => ({
      ...(current.owner === built ? current : { owner: built, composition: null, annual: null }),
      [chart]: index,
    }));
  };
  const clearPreview = (chart: "composition" | "annual") => {
    setHoverPreview((current) => current.owner !== built || current[chart] === null
      ? current
      : { ...current, [chart]: null });
  };
  const commit = (chart: "composition" | "annual", index: number, announcement: string) => {
    if (index === commitmentRef.current[chart]) return;
    commitmentRef.current[chart] = index;
    const next = { ...selection, [chart]: index };
    onSelectionChange(next);
    onCommitAnnouncement?.(announcement);
  };
  return <section className="charts-section" aria-labelledby="visualised-heading" data-stale={stale || undefined}><div className="card-heading"><div><p className="eyebrow">Visual breakdown</p><h2 id="visualised-heading">Your result visualised</h2></div><p>Charts illustrate the supplied calculation; they are not an account statement or guarantee.</p></div><div className="chart-grid"><CompositionFigure model={built.composition} committed={selection.composition} visible={activePreview.composition ?? selection.composition} onSelect={(composition) => commit("composition", composition, built.composition.steps[composition]!.accessibleLabel)} onPreview={(index) => preview("composition", index)} onPreviewClear={() => clearPreview("composition")} /><AnnualFigure model={built.annualGrowth} committed={selection.annual} visible={activePreview.annual ?? selection.annual} onSelect={(annual) => commit("annual", annual, built.annualGrowth.points[annual]!.accessibleLabel)} onPreview={(index) => preview("annual", index)} onPreviewClear={() => clearPreview("annual")} /></div></section>;
}
