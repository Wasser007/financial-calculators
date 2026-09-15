import { AdSenseUnit } from "@/components/AdSenseUnit";
import { CompoundInterestPage } from "../../compound-interest-page";
import { createPageMetadata } from "../../../lib/seo/publication";

export const metadata = createPageMetadata("/calculators/compound-interest");

export default function Page() { return <CompoundInterestPage />; }
