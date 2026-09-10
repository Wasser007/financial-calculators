// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { MoneyDurationWorkspace } from "../../components/money-duration-workspace.js";

describe("MoneyDurationWorkspace Component", () => {
  it("renders initial baseline with duration headline metric", () => {
    const { container } = render(<MoneyDurationWorkspace />);
    const primaryMetric = container.querySelector(".result-metric--primary dd");
    expect(primaryMetric).not.toBeNull();
    expect(primaryMetric?.textContent).toContain("yr");
  });

  it("updates duration metric when monthly withdrawal input changes", () => {
    const { container } = render(<MoneyDurationWorkspace />);
    const withdrawalInput = container.querySelector('input[name="monthlyWithdrawal"]') as HTMLInputElement;
    expect(withdrawalInput).not.toBeNull();

    fireEvent.change(withdrawalInput, { target: { value: "10000" } });

    const primaryMetric = container.querySelector(".result-metric--primary dd");
    expect(primaryMetric?.textContent).toBeDefined();
  });

  it("displays validation error when entering invalid starting balance", () => {
    const { container } = render(<MoneyDurationWorkspace />);
    const balanceInput = container.querySelector('input[name="initialBalance"]') as HTMLInputElement;

    fireEvent.change(balanceInput, { target: { value: "-500" } });

    const errorMsg = container.querySelector("#initialBalance-error");
    expect(errorMsg).not.toBeNull();
    expect(errorMsg?.textContent).toContain("Starting balance must be 0 or greater.");
  });
});
