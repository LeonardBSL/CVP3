import { useState } from 'react';
import { healthScore } from '../../../data/intelligenceData';
import IntelModal from '../../../components/intel/IntelModal';
import SignalStrip from '../../../components/intel/SignalStrip';
import SignalIntelligenceSection from '../../../components/intel/SignalIntelligenceSection';

const BAND_LABEL = {
  critical: 'Critical Attrition Risk',
  moderate: 'Moderate Attrition Risk',
  stable: 'Stable Relationship',
  low: 'Low Attrition Risk',
  engaged: 'Fully Engaged',
};

const ROW_TONE = { moderate: 'warn', high: 'watch' };
const VAL_TONE = { none: 'pos', moderate: 'warn', high: 'crit' };

const SUB_SCORE_META = [
  { key: 'engagement', label: 'Engagement Activity', max: 30, weight: '30%' },
  { key: 'transaction', label: 'Transaction Health', max: 35, weight: '35%' },
  { key: 'loyalty', label: 'Market Loyalty', max: 35, weight: '35%' },
];

export default function HealthScoreModule() {
  const [open, setOpen] = useState(false);
  const cardSignals = healthScore.intelligenceSignals.slice(0, 2);

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="Relationship Health Score — open full breakdown"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--accent">
          <div className="intel-mod__title intel-mod__title--accent">Relationship Health Score</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-health__hero">
            <div className="intel-health__score">{healthScore.score}</div>
            <div className="intel-health__side">
              <span className="intel-health__pill">{BAND_LABEL[healthScore.band]}</span>
              <span className="intel-health__sub">Composite · 0–100</span>
            </div>
          </div>
          <div className="intel-health__track">
            <div className="intel-health__fill" />
            <div className="intel-health__marker" style={{ left: `${healthScore.score}%` }} />
          </div>
          <div className="intel-health__labels">
            <span>Critical</span><span>Moderate</span><span>Stable</span><span>Engaged</span>
          </div>
          <div className="intel-health__rows">
            {healthScore.signals.slice(0, 4).map(signal => (
              <div key={signal.id} className={`intel-health__row${ROW_TONE[signal.risk] ? ` intel-health__row--${ROW_TONE[signal.risk]}` : ''}`}>
                <span className="intel-health__row-label">{signal.label}</span>
                <span className={`intel-health__row-val intel-health__row-val--${VAL_TONE[signal.risk] ?? 'pos'}`}>{signal.trendLabel}</span>
              </div>
            ))}
          </div>
          <SignalStrip signals={cardSignals} />
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">Updated {healthScore.updatedAt} · {cardSignals.length} signals</span>
          <span className="intel-mod__foot-hint">Full breakdown →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="Relationship Health & Attrition Risk"
        subtitle={`Nkosi Retail Group · AI-generated · Updated ${healthScore.updatedAt}`}
        footerLeft="AI-generated assessment. Apply professional judgement before acting on scores."
        footerRight={`Model: ${healthScore.model}`}
        onClose={() => setOpen(false)}
      >
        <div className="intel-section-title">Score Breakdown</div>
        <div className="intel-breakdown">
          {SUB_SCORE_META.map(meta => (
            <div key={meta.key} className="intel-breakdown__item">
              <div className="intel-breakdown__val">{healthScore.subScores[meta.key]}<span className="intel-breakdown__max">/{meta.max}</span></div>
              <div className="intel-breakdown__name">{meta.label}</div>
              <div className="intel-breakdown__weight">{meta.weight} weight</div>
            </div>
          ))}
        </div>
        <div className="intel-breakdown__total">
          Total: <strong>{healthScore.score} / 100</strong> — {BAND_LABEL[healthScore.band]}
        </div>

        <div className="intel-section-title">Signal Detail</div>
        <table className="intel-table">
          <thead>
            <tr><th>Signal</th><th>Reading</th><th>Trend (90d)</th><th>Risk</th></tr>
          </thead>
          <tbody>
            {healthScore.signals.map(signal => (
              <tr key={signal.id}>
                <td><strong>{signal.label}</strong><span className="intel-table__sub">{signal.detail}</span></td>
                <td>{signal.reading}</td>
                <td>{signal.trendLabel}</td>
                <td>{signal.riskLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="intel-section-title">AI Reasoning</div>
        <div className="intel-reasoning-box">{healthScore.reasoning}</div>

        <div className="intel-section-title">Data Sources & Citations</div>
        {healthScore.sources.map(source => (
          <div key={source.source} className="intel-citation">
            <span className="intel-citation__source">{source.source}</span>
            <span>{source.detail}</span>
          </div>
        ))}

        <div className="intel-section-title">What the AI is Seeing</div>
        <SignalIntelligenceSection
          signals={healthScore.intelligenceSignals}
          synthesis={healthScore.synthesis}
          connectionLabel="How this affects the Health Score"
        />
      </IntelModal>
    </>
  );
}
