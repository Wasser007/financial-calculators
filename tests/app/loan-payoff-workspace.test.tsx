// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoanPayoffWorkspace } from "../../components/loan-payoff-workspace.js";

describe("Loan Payoff Workspace Component", () => {
  it("renders default inputs and displays time saved headline", () => {
    render(<LoanPayoffWorkspace />);

    expect(screen.getByLabelText(/Current Loan Balance/i)).toBeDefined();
    expect(screen.getByLabelText(/Annual Interest Rate/i)).toBeDefined();
    expect(screen.getByLabelText(/Standard Monthly Payment/i)).toBeDefined();
    expect(screen.getByLabelText(/Extra Monthly Payment/i)).toBeDefined();

    expect(screen.getByText("Time Saved")).toBeDefined();
    expect(screen.getByText("Interest Saved")).toBeDefined();
  });
});
