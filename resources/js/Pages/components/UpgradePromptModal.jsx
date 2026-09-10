function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function UpgradePromptModal({
  open = true,
  eyebrow = null,
  title,
  body,
  detail = null,
  emphasis = null,
  visual = null,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  secondaryLabel = 'Maybe later',
  onSecondary,
  onClose,
}) {
  if (!open) return null;

  const handleSecondary = onSecondary ?? onClose;

  return (
    <div className="bb">
      <div className="bb-modal">
        <button className="bb-modal__bg" aria-label="Close" onClick={onClose} />
        <div className="bb-modal__box bb-modal__box--upgrade" role="dialog" aria-modal="true" aria-label={title}>
          <button type="button" className="bb-modal__close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
          {eyebrow && (
            <div className="bb-modal__eyebrow">
              <SparkIcon />
              <span>{eyebrow}</span>
            </div>
          )}
          {visual === 'search-momentum' && (
            <div className="bb-upgrade-visual" aria-hidden="true">
              <div className="bb-upgrade-visual__chart">
                <span className="bb-upgrade-visual__badge">8-day access</span>
                <svg viewBox="0 0 240 76" fill="none">
                  <path d="M8 63C34 61 42 48 65 51C91 54 98 34 121 39C147 45 158 24 177 28C202 33 209 11 232 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="232" cy="9" r="7" fill="#ffc529" stroke="#fff" strokeWidth="4" />
                  <path d="M8 69H232" stroke="currentColor" strokeOpacity=".14" />
                </svg>
              </div>
              <div className="bb-upgrade-visual__perks">
                <span>More searches</span><span>Auto refreshes</span><span>Deeper analysis</span>
              </div>
            </div>
          )}
          {visual === 'video-analysis' && (
            <div className="bb-analysis-visual" aria-hidden="true">
              <div className="bb-analysis-visual__play">
                <span>▶</span>
                <i>8.4×</i>
              </div>
              <div className="bb-analysis-visual__insights">
                <span><i>01</i><b>Winning hook</b></span>
                <span><i>02</i><b>Why it worked</b></span>
                <span><i>03</i><b>How to recreate it</b></span>
              </div>
            </div>
          )}
          <h2>{title}</h2>
          {body && <p className="sub">{body}</p>}
          {detail && <p className="bb-modal__detail">{detail}</p>}
          {emphasis && <p className="bb-modal__emphasis">{emphasis}</p>}
          <div className="bb-modal__actions">
            <button type="button" className="btn btn--y" onClick={onPrimary} disabled={primaryDisabled}>
              {primaryLabel}
            </button>
            {secondaryLabel && (
              <button type="button" className="btn btn--g" onClick={handleSecondary}>
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
