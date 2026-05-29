import { impactClass, sourceBadgeClass, sourceLabel } from './intelFormat';

export default function SignalStrip({ signals, label = 'AI Signals Active' }) {
  if (!signals?.length) {
    return null;
  }

  return (
    <div className="intel-signal-strip">
      <div className="intel-signal-strip__label">{label}</div>
      {signals.map(signal => (
        <div key={signal.id} className="intel-signal-chip">
          <span className={`intel-signal-chip__src ${sourceBadgeClass(signal.sourceType)}`}>
            {sourceLabel(signal.sourceType)}
          </span>
          <div>
            <div className="intel-signal-chip__text">{signal.headline}</div>
            {signal.impactLabel ? (
              <div className={`intel-signal-chip__impact ${impactClass(signal.impactDirection)}`}>
                {signal.impactLabel}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
