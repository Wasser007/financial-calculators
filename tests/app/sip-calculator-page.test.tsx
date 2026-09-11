// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SipCalculatorPage from "../../app/calculators/sip-calculator/page.js";

describe("SipCalculatorPage", () => {
  it("renders page title, workspace, and FAQs", () => {
    render(<SipCalculatorPage />);

    expect(screen.getByRole("heading", { level: 1, name: /SIP \/ DCA Investment Calculator/i })).toBeDefined();
    expect(screen.getByText("SIP / DCA Growth Planner")).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: /Frequently Asked Questions/i })).toBeDefined();
    expect(screen.getByText("What is a Systematic Investment Plan (SIP) or DCA?")).toBeDefined();
  });
});
