import { X } from 'lucide-react';
import { useEffect, useId } from 'react';

export default function IntelModal({ open, title, subtitle, footerLeft, footerRight, onClose, children }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;

    function handleKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open, onClose]);

  const titleId = useId();

  if (!open) {
    return null;
  }

  return (
    <div className="intel-modal-overlay" onClick={onClose}>
      <div
        className="intel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={event => event.stopPropagation()}
      >
        <div className="intel-modal__head">
          <div>
            <h3 id={titleId} className="intel-modal__title">{title}</h3>
            {subtitle ? <p className="intel-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="intel-modal__close" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="intel-modal__body">{children}</div>
        {footerLeft || footerRight ? (
          <div className="intel-modal__foot">
            <span>{footerLeft}</span>
            <span>{footerRight}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
