import { COMPOUND_INTEREST_EDITORIAL, getPublicEditorialState } from "../lib/editorial/model";

export function EditorialStatus() {
  const state = getPublicEditorialState(COMPOUND_INTEREST_EDITORIAL);
  return <aside className="editorial-status" aria-labelledby="editorial-status-heading">
    <h2 id="editorial-status-heading">Content status</h2>
    <dl>
      <div><dt>Updated</dt><dd><time dateTime={state.updated}>{state.updated}</time></dd></div>
      <div><dt>Author</dt><dd>{state.author}</dd></div>
      <div><dt>Reviewer</dt><dd>{state.reviewer}</dd></div>
      <div><dt>Fact checked</dt><dd>{state.factCheck}</dd></div>
    </dl>
    <p>This pre-launch content has not yet received formal editorial approval.</p>
  </aside>;
}
