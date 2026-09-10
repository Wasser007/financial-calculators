// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import MoneyDurationPage from "../../app/calculators/how-long-will-my-money-last/page.js";

describe("Money Duration Page Integration", () => {
  it("renders page template with title, workspace and FAQs", () => {
    const { container } = render(<MoneyDurationPage />);
    const h1 = container.querySelector("h1");
    expect(h1?.textContent).toBe("How Long Will My Money Last?");

    // 检查核心 Workspace 挂载
    const workspace = container.querySelector(".calculator-workspace");
    expect(workspace).not.toBeNull();

    // 检查 FAQ 模块存在
    const faqList = container.querySelector(".faq-list");
    expect(faqList).not.toBeNull();
  });
});
