// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/calculators/compound-interest" }));

import CalculatorsPage from "../../app/calculators/page";
import ContactPage from "../../app/contact/page";
import HomePage from "../../app/page";
import PrivacyPage from "../../app/privacy/page";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

describe("formal site structure", () => {
  afterEach(cleanup);

  it("provides shared desktop and mobile navigation with a current section", () => {
    render(<SiteHeader />);
    const desktop = screen.getByRole("navigation", { name: "Primary navigation" });
    const mobile = screen.getByRole("navigation", { name: "Mobile navigation" });
    expect(within(desktop).getByRole("link", { name: "Calculators" }).getAttribute("aria-current")).toBe("page");
    expect(within(mobile).getByRole("link", { name: "Calculators" }).getAttribute("aria-current")).toBe("page");
    const disclosure = screen.getByText("Menu").closest("summary");
    expect(disclosure).not.toBeNull();
    expect(disclosure?.getAttribute("aria-label")).toBe("Site navigation");
    expect(disclosure?.getAttribute("aria-label")).not.toMatch(/open|close/i);
    fireEvent.click(disclosure!);
    expect(disclosure!.closest("details")?.open).toBe(true);
    expect(disclosure?.getAttribute("aria-label")).toBe("Site navigation");
    const mobileAbout = within(mobile).getByRole("link", { name: "About" });
    mobileAbout.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(mobileAbout);
    expect(disclosure!.closest("details")?.open).toBe(false);
  });

  it("links the only live calculator and keeps planned tools non-interactive", () => {
    render(<CalculatorsPage />);
    const openButtons = screen.getAllByRole("link", { name: "Open calculator" });
    expect(openButtons).toHaveLength(5);
    expect(openButtons[0]?.getAttribute("href")).toBe("/calculators/compound-interest");
    expect(openButtons[1]?.getAttribute("href")).toBe("/calculators/savings-goal");
    expect(openButtons[2]?.getAttribute("href")).toBe("/calculators/how-long-will-my-money-last");
    expect(openButtons[3]?.getAttribute("href")).toBe("/calculators/loan-mortgage-amortization");
    expect(openButtons[4]?.getAttribute("href")).toBe("/calculators/loan-payoff");
    const planned = screen.getByRole("heading", { name: "Planned tools by goal" }).closest("section");
    expect(planned).not.toBeNull();
    expect(within(planned!).queryAllByRole("link")).toHaveLength(0);
    expect(within(planned!).getAllByText("Planned")).toHaveLength(2);
    expect(within(planned!).getByText("SIP / DCA Calculator")).toBeTruthy();
  });

  it("presents compound interest as featured without implying it is the only available calculator", () => {
    render(<HomePage />);
    expect(screen.getByText("Featured calculator")).toBeTruthy();
    expect(screen.queryByText("Available now")).toBeNull();
  });

  it("publishes truthful privacy and contact boundaries without a fabricated contact link", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/processed in your browser/i)).toBeTruthy();
    cleanup();
    render(<ContactPage />);
    expect(screen.getByText(/no published email address or contact form/i)).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("provides complete shared footer destinations and no unsupported editorial claims", () => {
    const { container } = render(<SiteFooter />);
    const footer = screen.getByRole("contentinfo");
    for (const name of ["Calculators", "Methodology", "About", "Editorial policy", "Disclaimer", "Privacy", "Terms", "Contact"]) {
      expect(within(footer).getByRole("link", { name })).toBeTruthy();
    }
    expect(container.textContent).not.toMatch(/author|reviewer|fact checked/i);
  });
});
