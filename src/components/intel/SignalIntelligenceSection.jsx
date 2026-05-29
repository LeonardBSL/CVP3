import { sourceBadgeClass, sourceLabel } from './intelFormat';

const PILL_MODIFIER = {
  up: 'intel-signal-card__pill--up',
  watch: 'intel-signal-card__pill--watch',
  context: 'intel-signal-card__pill--context',
};

export default function SignalIntelligenceSection({ signals, synthesis, connectionLabel = 'How this affects this module' }) {
  if (!signals?.length) {
    return null;
  }

  return (
    <div className="intel-signal-section">
      <div className="intel-signal-section__head">
        <div className="intel-signal-section__title">
          <span className="intel-pulse" aria-hidden="true" />
          What the AI is seeing
        </div>
        <div className="intel-signal-section__sub">{signals.length} signal{signals.length === 1 ? '' : 's'}</div>
      </div>
      <div className="intel-signal-list">
        {signals.map(signal => (
          <div key={signal.id} className="intel-signal-card">
            <div className={`intel-signal-card__head ${sourceBadgeClass(signal.sourceType)}`}>
              <span className="intel-signal-card__src">{signal.sourceName ?? sourceLabel(signal.sourceType)}</span>
              {signal.time ? <span className="intel-signal-card__time">{signal.time}</span> : null}
            </div>
            <div className="intel-signal-card__body">
              <div className="intel-signal-card__headline">{signal.headline}</div>
              {signal.excerpt ? <div className="intel-signal-card__excerpt">{signal.excerpt}</div> : null}
              {signal.impactLabel ? (
                <span className={`intel-signal-card__pill ${PILL_MODIFIER[signal.impactDirection] ?? PILL_MODIFIER.context}`}>
                  {signal.impactLabel}
                </span>
              ) : null}
            </div>
            {signal.connectionText ? (
              <div className="intel-signal-card__connection">
                <strong>{connectionLabel}:</strong> {signal.connectionText}
              </div>
            ) : null}
          </div>
        ))}
        {synthesis ? (
          <div className="intel-synthesis">
            <div className="intel-synthesis__label">
              <span className="intel-pulse" aria-hidden="true" />
              AI Synthesis
            </div>
            <div className="intel-synthesis__text">{synthesis}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
