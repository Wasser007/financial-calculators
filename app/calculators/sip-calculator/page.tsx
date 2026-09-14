import { SipCalculatorPage } from "../../sip-calculator-page";
import { createPageMetadata } from "../../../lib/seo/publication";

export const metadata = createPageMetadata("/calculators/sip-calculator");

export default function Page() {
  return <SipCalculatorPage />;
}
