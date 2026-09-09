// @vitest-environment jsdom
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SavingsGoalPage } from "../../app/savings-goal-page";
import { metadata } from "../../app/calculators/savings-goal/page";

describe("SavingsGoalPage Component & Route Integration", () => {
  it("exposes correct canonical SEO metadata", () => {
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
  });

  it("renders page template with calculator name, FAQs, and mathematical section", () => {
    render(<SavingsGoalPage />);
    expect(screen.getByRole("heading", { name: "Savings Goal Calculator" })).toBeDefined();
    expect(screen.getByText("Understanding the Savings Goal Equation")).toBeDefined();
    expect(screen.getByText("How is the required monthly savings deposit calculated?")).toBeDefined();
    expect(screen.getByText("Savings Goal Parameters")).toBeDefined();
  });
});
