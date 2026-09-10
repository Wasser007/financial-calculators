export const calculatorGoals = [
  "Grow your money",
  "Reach a savings goal",
  "Make your money last",
  "Loans and debt",
  "Home and mortgage",
  "Rates and returns",
  "Pay and income",
] as const;

export type CalculatorGoal = (typeof calculatorGoals)[number];
export type CalculatorAvailability = "live" | "planned";

interface CalculatorDefinitionBase {
  slug: string;
  name: string;
  shortDescription: string;
  goal: CalculatorGoal;
  publicListing: boolean;
  relatedCalculators: readonly string[];
  metadata: { title: string; description: string };
}

export type CalculatorDefinition = CalculatorDefinitionBase & (
  | { availability: "live"; featured: boolean; publicListing: true; route: `/calculators/${string}` }
  | { availability: "planned"; featured: false; route: null }
);

type CatalogInvariantEntry = CalculatorDefinitionBase & {
  availability: CalculatorAvailability;
  featured: boolean;
  route: string | null;
};

export const calculatorCatalog = [
  {
    slug: "compound-interest",
    name: "Compound Interest Calculator",
    shortDescription: "Explore how a starting balance, regular contributions, returns, fees, and inflation can shape a balance over time.",
    goal: "Grow your money",
    availability: "live",
    featured: true,
    publicListing: true,
    route: "/calculators/compound-interest",
    relatedCalculators: ["savings-goal", "how-long-will-my-money-last"],
    metadata: {
      title: "Compound Interest Calculator",
      description: "Estimate how a starting balance and regular contributions may grow under chosen return, compounding, fee, and inflation assumptions.",
    },
  },
  {
    slug: "savings-goal",
    name: "Savings Goal Calculator",
    shortDescription: "Explore the contribution or time needed to work toward a savings target.",
    goal: "Reach a savings goal",
    availability: "live",
    featured: false,
    publicListing: true,
    route: "/calculators/savings-goal",
    relatedCalculators: ["compound-interest", "how-long-will-my-money-last"],
    metadata: {
      title: "Savings Goal Calculator",
      description: "Explore a savings target, timeline, and regular contribution.",
    },
  },
  {
    slug: "how-long-will-my-money-last",
    name: "How Long Will My Money Last?",
    shortDescription: "Explore how withdrawals, returns, and time may affect a finite balance.",
    goal: "Make your money last",
    availability: "live",
    featured: false,
    publicListing: true,
    route: "/calculators/how-long-will-my-money-last",
    relatedCalculators: ["savings-goal", "compound-interest"],
    metadata: {
      title: "How Long Will My Money Last?",
      description: "Explore how long a balance may last under chosen withdrawal and return assumptions.",
    },
  },
  {
    slug: "loan-mortgage-amortization",
    name: "Loan Payment & Amortization Calculator",
    shortDescription: "Explore estimated payments and how principal and interest change over a loan term.",
    goal: "Loans and debt",
    availability: "live",
    featured: false,
    publicListing: true,
    route: "/calculators/loan-mortgage-amortization",
    relatedCalculators: ["loan-payoff"],
    metadata: {
      title: "Loan Payment & Amortization Calculator",
      description: "Explore estimated loan payments and an amortization schedule.",
    },
  },
  {
    slug: "loan-payoff",
    name: "Loan Payoff Calculator",
    shortDescription: "Explore how extra payments may change a payoff date and interest cost.",
    goal: "Loans and debt",
    availability: "planned",
    featured: false,
    publicListing: true,
    route: null,
    relatedCalculators: ["loan-mortgage-amortization"],
    metadata: {
      title: "Loan Payoff Calculator",
      description: "Explore how payment choices may change a loan payoff timeline.",
    },
  },
  {
    slug: "apy-effective-interest-rate",
    name: "APY / Effective Interest Rate Calculator",
    shortDescription: "Compare a nominal rate with its effective annual yield.",
    goal: "Rates and returns",
    availability: "planned",
    featured: false,
    publicListing: false,
    route: null,
    relatedCalculators: ["cagr", "compound-interest"],
    metadata: {
      title: "APY / Effective Interest Rate Calculator",
      description: "Compare nominal and effective annual interest rates.",
    },
  },
  {
    slug: "cagr",
    name: "CAGR Calculator",
    shortDescription: "Estimate the constant annual growth rate between a starting and ending value.",
    goal: "Rates and returns",
    availability: "planned",
    featured: false,
    publicListing: false,
    route: null,
    relatedCalculators: ["future-value", "compound-interest"],
    metadata: {
      title: "CAGR Calculator",
      description: "Estimate compound annual growth between two values.",
    },
  },
  {
    slug: "future-value",
    name: "Future Value Calculator",
    shortDescription: "Explore a future amount under a selected rate, time, and cash-flow pattern.",
    goal: "Grow your money",
    availability: "planned",
    featured: false,
    publicListing: false,
    route: null,
    relatedCalculators: ["compound-interest", "savings-goal"],
    metadata: {
      title: "Future Value Calculator",
      description: "Explore a future value under selected assumptions.",
    },
  },
  {
    slug: "mortgage",
    name: "Mortgage Calculator",
    shortDescription: "Explore a mortgage payment, total interest, and repayment schedule.",
    goal: "Home and mortgage",
    availability: "planned",
    featured: false,
    publicListing: false,
    route: null,
    relatedCalculators: ["rent-vs-buy", "loan-mortgage-amortization"],
    metadata: {
      title: "Mortgage Calculator",
      description: "Explore estimated mortgage payments and total interest.",
    },
  },
  {
    slug: "rent-vs-buy",
    name: "Rent vs Buy Calculator",
    shortDescription: "Compare modeled housing costs across a chosen time period.",
    goal: "Home and mortgage",
    availability: "planned",
    featured: false,
    publicListing: false,
    route: null,
    relatedCalculators: ["mortgage"],
    metadata: {
      title: "Rent vs Buy Calculator",
      description: "Compare modeled renting and home-buying costs.",
    },
  },
] as const satisfies readonly CalculatorDefinition[];

export function assertCalculatorCatalogInvariants(catalog: readonly CatalogInvariantEntry[]): void {
  const slugs = new Set<string>();
  for (const calculator of catalog) {
    if (slugs.has(calculator.slug)) throw new Error(`Duplicate calculator slug: ${calculator.slug}`);
    slugs.add(calculator.slug);
  }
  const featuredLive = catalog.filter(({ availability, featured }) => availability === "live" && featured);
  if (featuredLive.length !== 1) throw new Error("The calculator catalog requires exactly one live featured calculator.");
  for (const calculator of catalog) {
    if (calculator.availability === "planned" && calculator.featured) throw new Error(`Planned calculator cannot be featured: ${calculator.slug}`);
    if (calculator.availability === "planned" && calculator.route !== null) throw new Error(`Planned calculator cannot have a route: ${calculator.slug}`);
    if (calculator.availability === "live" && calculator.route !== `/calculators/${calculator.slug}`) throw new Error(`Live calculator route must match its slug: ${calculator.slug}`);
    const related = new Set<string>();
    for (const relatedSlug of calculator.relatedCalculators) {
      if (!slugs.has(relatedSlug)) throw new Error(`Unknown related calculator: ${calculator.slug} -> ${relatedSlug}`);
      if (relatedSlug === calculator.slug) throw new Error(`Calculator cannot relate to itself: ${calculator.slug}`);
      if (related.has(relatedSlug)) throw new Error(`Duplicate related calculator: ${calculator.slug} -> ${relatedSlug}`);
      related.add(relatedSlug);
    }
  }
}

assertCalculatorCatalogInvariants(calculatorCatalog);

export function getCalculator(slug: string): CalculatorDefinition | undefined { return calculatorCatalog.find((calculator) => calculator.slug === slug); }
export function getRequiredCalculator(slug: string): CalculatorDefinition { const calculator = getCalculator(slug); if (!calculator) throw new Error(`Calculator not found in catalog: ${slug}`); return calculator; }
export function getListedCalculators(): readonly CalculatorDefinition[] { return calculatorCatalog.filter((calculator) => calculator.publicListing); }
export function getLiveCalculators(): readonly CalculatorDefinition[] { return calculatorCatalog.filter((calculator) => calculator.availability === "live"); }
export function getFeaturedCalculator(): CalculatorDefinition { const featured = calculatorCatalog.find((calculator) => calculator.featured && calculator.availability === "live"); if (!featured) throw new Error("The calculator catalog requires one live featured calculator."); return featured; }
export function getRelatedCalculators(slug: string): readonly CalculatorDefinition[] { const calculator = getCalculator(slug); if (!calculator) return []; return calculator.relatedCalculators.map(getCalculator).filter((item): item is CalculatorDefinition => item !== undefined && item.publicListing); }
export function calculatorHref(calculator: CalculatorDefinition): string | undefined { return calculator.availability === "live" && calculator.publicListing ? calculator.route : undefined; }
