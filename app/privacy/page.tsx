import { ContentPage, ContentSection } from "../../components/content-page";
import { createPageMetadata } from "../../lib/seo/publication";

export const metadata = createPageMetadata("/privacy");

export default function PrivacyPage() {
  return <ContentPage eyebrow="Current data practice" title="Privacy" intro="The current calculator is designed to work without an account and without saving the financial values you enter.">
    <ContentSection title="Calculator inputs"><p>Calculator inputs are processed in your browser. The current site does not send those values to an application database or associate them with an account.</p></ContentSection>
    <ContentSection title="Accounts, analytics, advertising, and monitoring"><p>The current site has no account system, advertising integration, analytics integration, or external monitoring provider. It does not intentionally set profiling or advertising cookies, create a visitor identifier, or transmit calculator inputs to a monitoring service.</p></ContentSection>
    <ContentSection title="Technical delivery data"><p>When a production host is selected, that host may process ordinary request data such as IP address, browser information, requested URL, and timestamps to deliver and secure the site. The production provider and retention terms have not yet been selected, so this notice must be reviewed before launch.</p></ContentSection>
    <ContentSection title="Do not send sensitive information"><p>No public contact channel has been approved. When one is added, do not include passwords, account numbers, government identifiers, or other sensitive financial information.</p></ContentSection>
    <ContentSection title="Policy changes"><p>This page describes the current implementation. It should be updated before adding analytics, advertising, accounts, server-side input storage, a contact form, or other data processing.</p></ContentSection>
  </ContentPage>;
}
