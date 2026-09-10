import { LoanMortgagePage } from "../../loan-mortgage-page";
import { createPageMetadata } from "../../../lib/seo/publication";

export const metadata = createPageMetadata("/calculators/loan-mortgage-amortization");

export default function Page() {
  return <LoanMortgagePage />;
}
