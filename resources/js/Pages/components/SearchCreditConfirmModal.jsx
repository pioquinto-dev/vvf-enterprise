export default function SearchCreditConfirmModal({ body, subject, busy = false, onConfirm, onCancel }) {
  return (
    <div className="bb">
      <div className="bb-modal">
        <button className="bb-modal__bg" aria-label="Close" onClick={onCancel} />
        <div className="bb-modal__box">
          <h2>Start this search?</h2>
          <p className="sub">{body}</p>
          {subject && <p style={{ marginTop: 16, fontWeight: 700, color: 'var(--ink)' }}>{subject}</p>}
          <div className="actrow__r" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--g" onClick={onCancel} disabled={busy}>Cancel</button>
            <button type="button" className="btn btn--y" onClick={onConfirm} disabled={busy}>{busy ? 'Starting…' : 'Start search'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
