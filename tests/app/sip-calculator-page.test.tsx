/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SipCalculatorPage } from "../../app/sip-calculator-page";

describe("SipCalculatorPage", () => {
  it("renders page title, workspace, and FAQs", () => {
    render(<SipCalculatorPage />);

    expect(screen.getByRole("heading", { level: 1, name: "SIP / DCA Calculator" })).toBeDefined();
    expect(screen.getByText("SIP / DCA Growth Planner")).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: /Frequently asked questions/i })).toBeDefined();
  });
});
