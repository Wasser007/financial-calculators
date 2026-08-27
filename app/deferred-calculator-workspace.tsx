"use client";

import dynamic from "next/dynamic";

let workspaceImport: Promise<typeof import("./calculator-workspace")> | undefined;

function importWorkspace() {
  workspaceImport ??= import("./calculator-workspace");
  return workspaceImport;
}

function loadWorkspaceOnIntent(): Promise<typeof import("./calculator-workspace")["CalculatorWorkspace"]> {
  if (typeof window === "undefined" || document.getElementById("calculator-workspace") === null) {
    return importWorkspace().then((module) => module.CalculatorWorkspace);
  }
  return new Promise((resolve) => {
    const eventTypes = ["focusin", "pointerdown", "keydown"] as const;
    let fallbackTimer = 0;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      for (const eventType of eventTypes) document.removeEventListener(eventType, onIntent, true);
      window.removeEventListener("beforeprint", finish);
      window.clearTimeout(fallbackTimer);
      importWorkspace().then((module) => resolve(module.CalculatorWorkspace));
    };
    const onIntent = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("#calculator-workspace") !== null) finish();
    };
    for (const eventType of eventTypes) document.addEventListener(eventType, onIntent, true);
    window.addEventListener("beforeprint", finish);
    fallbackTimer = window.setTimeout(finish, 10_000);
  });
}

const DeferredWorkspace = dynamic(loadWorkspaceOnIntent, {
  loading: () => <p className="detail-loading">Preparing calculator…</p>,
});

export function DeferredCalculatorWorkspace() {
  return <DeferredWorkspace />;
}
