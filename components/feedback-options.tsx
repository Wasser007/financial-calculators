import Link from "next/link";
import { FEEDBACK_CATEGORIES, buildFeedbackHref } from "../lib/feedback";

export function FeedbackOptions({ pathname }: { pathname: string }) {
  const options = FEEDBACK_CATEGORIES.map((category) => ({ ...category, href: buildFeedbackHref(category.id, pathname) }));
  const available = options.some(({ href }) => href !== null);
  return <section className="feedback-panel" aria-labelledby="feedback-heading">
    <p className="eyebrow">Help improve this page</p>
    <h2 id="feedback-heading">Report a problem or share feedback</h2>
    {available ? <><ul>{options.map(({ id, label, href }) => <li key={id}><a href={href!}>{label}</a></li>)}</ul><p>Do not include passwords, account numbers, government identifiers, or other sensitive financial information.</p></> : <><p>The public feedback channel is not available yet. These report types are prepared for a verified contact channel:</p><ul>{options.map(({ id, label }) => <li key={id}>{label}</li>)}</ul><p>See <Link href="/contact/" prefetch={false}>contact and feedback status</Link>. Do not send sensitive financial information.</p></>}
  </section>;
}
