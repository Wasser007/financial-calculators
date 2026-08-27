import { ContentPage, ContentSection } from "../../components/content-page";
import { SITE } from "../../lib/site";
import { createPageMetadata } from "../../lib/seo/publication";

export const metadata = createPageMetadata("/contact");

export default function ContactPage() { return <ContentPage eyebrow="Contact and feedback" title="Contact" intro="A public contact channel has not yet been approved for this pre-launch site."><ContentSection title="Feedback channel">{SITE.feedbackAddress && SITE.feedbackAddressVerified ? <p>Email <a href={`mailto:${SITE.feedbackAddress}`}>{SITE.feedbackAddress}</a>.</p> : <p>There is currently no published email address or contact form. A verified feedback address and responsible operator must be approved before launch.</p>}</ContentSection><ContentSection title="Privacy reminder"><p>When a contact channel becomes available, do not send passwords, account numbers, government identifiers, or other sensitive financial information.</p></ContentSection><ContentSection title="What to include later"><p>Useful reports should identify the page, describe what happened, state the browser or device involved, and omit confidential financial details.</p></ContentSection></ContentPage>; }
