import { ContentPage, ContentSection } from "../../components/content-page";
import { SITE } from "../../lib/site";
import { createPageMetadata } from "../../lib/seo/publication";

export const metadata = createPageMetadata("/about");

export default function AboutPage() { return <ContentPage eyebrow="About the site" title={`About ${SITE.name}`} intro="A small collection of transparent financial calculators built to make scenario exploration easier to understand."><ContentSection title="Purpose"><p>These tools help people explore how inputs and assumptions can affect an illustrative result. They are educational aids, not personalized recommendations or predictions.</p></ContentSection><ContentSection title="Publishing standards"><p>We aim to keep calculation methods, limitations, update dates, privacy boundaries, and uncertainty visible. A tool should not appear available until it works, and a review or authorship claim should not appear until it can be supported.</p></ContentSection><ContentSection title="Current identity"><p>{SITE.name} is the current working product name. The final public name, legal operator, production domain, and formal editorial identities have not yet been approved for publication.</p></ContentSection></ContentPage>; }
