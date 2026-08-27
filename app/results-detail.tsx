"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CalculatorInputs, CalculatorResult } from "../lib/calculator/types";
import { buildChartModels, type ChartModelBuildResult } from "../lib/presentation/chart-model";
import type { PresentationLocale } from "../lib/presentation/currency";
import { AnnualTable } from "./annual-table";
import { ChartFigures, type ChartSelection } from "./chart-figures";

type LastValidResult = {
  inputs: CalculatorInputs;
  result: CalculatorResult;
};

function initialChartSelection(built: Extract<ChartModelBuildResult, { ok: true }>): ChartSelection {
  return {
    composition: built.initialSelections.composition.committedIndex,
    annual: built.initialSelections.annualGrowth.committedIndex,
  };
}

export function ResultsDetail({
  last,
  stale,
  presentationLocale,
  calculationRevision,
}: {
  last: LastValidResult;
  stale: boolean;
  presentationLocale: PresentationLocale;
  calculationRevision: number;
}) {
  const built = useMemo(() => buildChartModels(last, presentationLocale), [last, presentationLocale]);
  const [selection, setSelection] = useState<ChartSelection | null>(() =>
    built.ok ? initialChartSelection(built) : null,
  );
  const renderedRevision = useRef(calculationRevision);
  const resetSelection = renderedRevision.current !== calculationRevision;
  const effectiveSelection = resetSelection && built.ok ? initialChartSelection(built) : selection;
  const chartAnnouncementText = useRef<Text | null>(null);

  useEffect(() => {
    if (!resetSelection) return;
    renderedRevision.current = calculationRevision;
    if (built.ok) setSelection(initialChartSelection(built));
  }, [built, calculationRevision, resetSelection]);

  const connectChartAnnouncementCarrier = useCallback((carrier: HTMLParagraphElement | null) => {
    if (carrier === null) {
      chartAnnouncementText.current = null;
      return;
    }
    const existing = carrier.firstChild;
    if (existing === null) {
      const text = carrier.ownerDocument.createTextNode("");
      carrier.appendChild(text);
      chartAnnouncementText.current = text;
      return;
    }
    if (existing.nodeType !== Node.TEXT_NODE || existing.nextSibling !== null) {
      throw new Error("The chart announcement carrier must contain exactly one text node.");
    }
    chartAnnouncementText.current = existing as Text;
  }, []);

  const announceChartCommit = useCallback((message: string) => {
    const text = chartAnnouncementText.current;
    if (text === null) return;
    text.replaceData(0, text.length, message);
  }, []);

  return (
    <div className="results-detail">
      <ChartFigures
        built={built}
        stale={stale}
        selection={effectiveSelection}
        onSelectionChange={setSelection}
        onCommitAnnouncement={announceChartCommit}
      />
      <AnnualTable
        rows={last.result.annualSchedule}
        currency={last.inputs.currency}
        stale={stale}
        presentationLocale={presentationLocale}
      />
      <p ref={connectChartAnnouncementCarrier} className="sr-only" role="status" aria-atomic="true" />
    </div>
  );
}
