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
  primaryLabel,
  onPrimary,
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
          <h2>{title}</h2>
          {body && <p className="sub">{body}</p>}
          {detail && <p className="bb-modal__detail">{detail}</p>}
          {emphasis && <p className="bb-modal__emphasis">{emphasis}</p>}
          <div className="bb-modal__actions">
            <button type="button" className="btn btn--y" onClick={onPrimary}>
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
