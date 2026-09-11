// @vitest-environment jsdom
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SipCalculatorWorkspace } from "../../components/sip-calculator-workspace.js";

describe("SipCalculatorWorkspace", () => {
  it("renders with initial inputs and presentation metrics", () => {
    render(<SipCalculatorWorkspace />);

    expect(screen.getByText("SIP / DCA Growth Planner")).toBeDefined();
    expect(screen.getByText("Expected Future Value")).toBeDefined();
    expect(screen.getByText("Total Principal Invested")).toBeDefined();
    expect(screen.getByText("Total Wealth Gained")).toBeDefined();
  });
});
