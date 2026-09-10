import { router } from '@inertiajs/react';
import { Close } from '../../landing/components/Icons.jsx';

export default function DuplicateSearchModal({ search, newKeywords = [], busy = false, onRefresh, onCancel }) {
  const additions = newKeywords.slice(0, 4);
  const hasAdditions = additions.length > 0;

  return (
    <div className="bb">
      <div className="bb-modal">
        <button className="bb-modal__bg" aria-label="Close" onClick={onCancel} />
        <div className="bb-modal__box">
          <button type="button" className="bb-modal__close" aria-label="Close" onClick={onCancel} disabled={busy}>
            <Close />
          </button>
          <h2>Already in your history</h2>
          <p className="sub">
            This keyword already has a saved search. {hasAdditions
              ? 'Add these new expansion terms and refresh it with the latest TikTok results?'
              : 'Would you like to refresh it with the latest TikTok results?'}
          </p>
          {search?.name && <p style={{ marginTop: 16, fontWeight: 700, color: 'var(--ink)' }}>{search.name}</p>}
          {hasAdditions && (
            <div style={{ marginTop: 14 }}>
              <p className="sect__n">New terms to merge</p>
              <div className="chips">
                {additions.map((keyword) => <span key={keyword} className="chip on">+ {keyword}</span>)}
                {newKeywords.length > additions.length && <span className="chip on">+{newKeywords.length - additions.length} more</span>}
              </div>
            </div>
          )}
          <p className="muted" style={{ marginTop: 12, fontSize: '.82rem' }}>This refresh uses 1 search credit.</p>
          <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
            {search?.url && (
              <button type="button" className="btn btn--g" onClick={() => router.visit(search.url)} disabled={busy}>
                View existing results
              </button>
            )}
            <button type="button" className="btn btn--y" onClick={onRefresh} disabled={busy}>
              {busy ? 'Refreshing…' : hasAdditions ? 'Merge & refresh' : 'Refresh search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
