import { SavingsGoalPage } from "../../savings-goal-page";
import { createPageMetadata } from "../../../lib/seo/publication";

export const metadata = createPageMetadata("/calculators/savings-goal");

export default function Page() {
  return <SavingsGoalPage />;
}
