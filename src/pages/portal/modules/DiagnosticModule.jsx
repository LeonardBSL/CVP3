import { useState } from 'react';
import { diagnostic, signalsForModule } from '../../../data/intelligenceData';
import IntelModal from '../../../components/intel/IntelModal';
import SignalStrip from '../../../components/intel/SignalStrip';
import SignalIntelligenceSection from '../../../components/intel/SignalIntelligenceSection';

const moduleSignals = signalsForModule('diagnostic');

const CARD_LABEL = {
  'Debtor Days': 'Debtor Days',
  'Creditor Days': 'Creditor Days',
  'Cash Conversion Cycle': 'Cash Conv. Cycle',
  'Working Capital Efficiency': 'WC Efficiency',
};

const KPI_TREND = {
  good: 'intel-impact--up',
  warn: 'intel-impact--watch',
  neutral: 'intel-impact--context',
};

// Short trend caption per metric for the card KPI tile.
const KPI_CAPTION = {
  'debtor-days': '↓ from 31',
  'creditor-days': '↑ watch Q2',
  ccc: '↓ best yet',
  'wc-efficiency': '↑ from Fair',
};

const TREND_MAX = 46; // px scale ceiling for the modal bars

function maxTrendValue(metric) {
  return Math.max(...metric.trend.map(t => t.value));
}

export default function DiagnosticModule() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="Business Performance Diagnostic — open full RM brief"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--accent">
          <div className="intel-mod__title intel-mod__title--accent">Business Performance Diagnostic</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-diag__tag">{diagnostic.quarter} · {diagnostic.period} · Transaction-derived</div>
          <div className="intel-diag__kpis">
            {diagnostic.metrics.map(metric => (
              <div key={metric.id} className={`intel-diag__kpi${metric.highlight ? ' intel-diag__kpi--hl' : ''}`}>
                <div className={`intel-diag__kpi-label${metric.highlight ? ' intel-diag__kpi-label--hl' : ''}`}>{CARD_LABEL[metric.name] ?? metric.name}</div>
                <div className="intel-diag__kpi-val" style={metric.highlight ? { color: 'var(--accent)' } : undefined}>
                  {metric.currentValue}{metric.unit ? <span className="intel-diag__kpi-unit"> {metric.unit === 'days' ? 'd' : metric.unit}</span> : null}
                </div>
                <div className={`intel-diag__kpi-trend ${KPI_TREND[metric.status]}`}>{KPI_CAPTION[metric.id] ?? ''}</div>
              </div>
            ))}
          </div>
          <div className="intel-diag__overall">
            <span className="intel-diag__overall-label">Overall: Healthy · {diagnostic.overallNote}</span>
            <span className="intel-diag__overall-meta">{diagnostic.quarter}</span>
          </div>
          <SignalStrip signals={moduleSignals} />
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">{diagnostic.quarter} · {moduleSignals.length} signals · Generated {diagnostic.generatedAt}</span>
          <span className="intel-mod__foot-hint">Full RM brief →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="Business Performance Diagnostic"
        subtitle={`AI-generated RM Client Review Brief · ${diagnostic.quarter} · Nkosi Retail Group`}
        footerLeft="AI-generated diagnostic. Validate figures against audited statements before presenting to credit."
        footerRight={`${diagnostic.model} · ${diagnostic.quarter}`}
        onClose={() => setOpen(false)}
      >
        <div className="intel-diag__brief-head">
          <div>
            <div className="intel-diag__brief-client">Nkosi Retail Group</div>
            <div className="intel-diag__brief-meta">Retail · R148m portfolio · {diagnostic.quarter} ({diagnostic.period}) · Generated {diagnostic.generatedAt}</div>
          </div>
          <div className="intel-diag__brief-rating">
            <div className="intel-diag__brief-rating-val">Healthy</div>
            <div className="intel-diag__brief-rating-label">Overall rating</div>
          </div>
        </div>

        <div className="intel-section-title">Executive Summary</div>
        <div className="intel-diag__exec">{diagnostic.executiveSummary}</div>

        <div className="intel-section-title">Metric Detail</div>
        {diagnostic.metrics.map(metric => {
          const max = Math.max(maxTrendValue(metric), TREND_MAX);
          return (
            <div key={metric.id} className="intel-diag-detail">
              <div className={`intel-diag-detail__head intel-diag-detail__head--${metric.status}`}>
                <div>
                  <div className="intel-diag-detail__name">{metric.name}</div>
                  <div className="intel-diag-detail__formula">{metric.formula}</div>
                </div>
                <div className={`intel-diag-detail__badge intel-diag-detail__badge--${metric.status}`}>{metric.badge}</div>
              </div>
              <div className="intel-diag-detail__body">
                <div className="intel-diag-detail__chart">
                  <div className="intel-diag-detail__chart-label">Quarterly trend</div>
                  <div className="intel-diag-detail__bars">
                    {metric.trend.map(point => (
                      <div key={point.quarter} className="intel-diag-detail__bar-wrap">
                        <div
                          className={`intel-diag-detail__bar intel-diag-detail__bar--${point.status}`}
                          style={{ height: `${Math.round((point.value / max) * 46)}px` }}
                        />
                        <div className="intel-diag-detail__bar-q">{point.quarter}</div>
                      </div>
                    ))}
                  </div>
                  <div className="intel-diag-detail__series">{metric.trend.map(p => `${p.value}`).join(' → ')}</div>
                </div>
                <div className="intel-diag-detail__interp">
                  <div className="intel-diag-detail__interp-label">Interpretation</div>
                  <div className="intel-diag-detail__interp-text">{metric.interpretation}</div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="intel-section-title">What the AI is Seeing</div>
        <SignalIntelligenceSection
          signals={moduleSignals}
          synthesis={diagnostic.synthesis}
          connectionLabel="How this affects the diagnostic"
        />

        <div className="intel-section-title">RM Conversation Context</div>
        <div className="intel-context-box">{diagnostic.rmContext}</div>

        <div className="intel-section-title">Data Sources</div>
        {diagnostic.sources.map(source => (
          <div key={source.source} className="intel-citation">
            <span className="intel-citation__source">{source.source}</span>
            <span>{source.detail}</span>
          </div>
        ))}
      </IntelModal>
    </>
  );
}
