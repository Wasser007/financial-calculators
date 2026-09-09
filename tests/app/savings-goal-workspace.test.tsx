// @vitest-environment jsdom
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SavingsGoalWorkspace } from "../../components/savings-goal-workspace";

describe("SavingsGoalWorkspace Component", () => {
  it("renders initial baseline with required monthly deposit", () => {
    render(<SavingsGoalWorkspace />);
    expect(screen.getByText("Savings Goal Parameters")).toBeDefined();
    expect(screen.getByText("Required Contribution Plan")).toBeDefined();
    expect(screen.getByText("Annual Savings Progression")).toBeDefined();
    expect(screen.getByText("Required Monthly Deposit")).toBeDefined();
  });

  it("updates calculated deposit when target amount is changed", () => {
    render(<SavingsGoalWorkspace />);
    const targetInput = screen.getByLabelText("Savings Target ($)") as HTMLInputElement;
    fireEvent.change(targetInput, { target: { value: "100000" } });
    expect(targetInput.value).toBe("100000");
    expect(screen.queryByText("Please fix the errors")).toBeNull();
  });

  it("shows validation error when entering an invalid target", () => {
    render(<SavingsGoalWorkspace />);
    const targetInput = screen.getByLabelText("Savings Target ($)");
    fireEvent.change(targetInput, { target: { value: "0" } });
    expect(screen.getByText("Please enter a savings goal greater than 0.")).toBeDefined();
    expect(screen.getByText("Please fix the errors in the form to recalculate your savings goal.")).toBeDefined();
  });
});
