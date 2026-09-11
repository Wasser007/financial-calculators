// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LoanPayoffPage from "../../app/calculators/loan-payoff/page.js";

describe("Loan Payoff Page Route", () => {
  it("renders page template with title, workspace and FAQs", () => {
    render(<LoanPayoffPage />);
    expect(screen.getByRole("heading", { name: "Loan Payoff Calculator", level: 1 })).toBeDefined();
    expect(screen.getByText(/Currency & Format/i)).toBeDefined();
    expect(screen.getByText("How Loan Payoff Acceleration Works")).toBeDefined();
  });
});
