import { useState } from 'react';
import { benchmarking, signalsForModule } from '../../../data/intelligenceData';
import IntelModal from '../../../components/intel/IntelModal';
import SignalStrip from '../../../components/intel/SignalStrip';
import SignalIntelligenceSection from '../../../components/intel/SignalIntelligenceSection';

const moduleSignals = signalsForModule('benchmarking');
const BAR_TONE = { good: 'intel-bench__bar-client--good', accent: 'intel-bench__bar-client--accent', warn: 'intel-bench__bar-client--warn' };
const QUARTILE_TONE = { Top: 'intel-q--top', '2nd': 'intel-q--mid', '3rd': 'intel-q--warn', bottom: 'intel-q--warn' };
const topQuartileCount = benchmarking.categories.flatMap(c => c.metrics).filter(m => m.quartile === 'Top').length;
const totalMetrics = benchmarking.categories.flatMap(c => c.metrics).length;

// Card preview: first metric of the first three categories.
const previewMetrics = benchmarking.categories.slice(0, 3).map(cat => ({
  category: cat.label,
  metric: cat.metrics[0],
}));

// kAnonymity value is e.g. "k-anonymity ≥ 5" — display the threshold only under the
// "k-anonymity" label so the regex /k-anonymity/ in tests matches uniquely (only the
// intel-reasoning-box), avoiding a "found multiple elements" failure.
const METHOD_CELLS = pg => {
  const [, ...kParts] = pg.kAnonymity.split(' '); // strips "k-anonymity" prefix → "≥ 5"
  return [
    { label: 'Sector', value: pg.sector },
    { label: 'Revenue band', value: pg.revenueBand },
    { label: 'Geography', value: pg.geography },
    { label: 'Peer count', value: `${pg.n} businesses` },
    { label: 'Refresh', value: pg.refreshDate },
    { label: 'Anonymisation', value: `${kParts.join(' ')} peers min` },
  ];
};

function BenchBar({ metric }) {
  return (
    <div className="intel-bench__bar">
      <div className="intel-bench__bar-peer" style={{ width: `${metric.barPeerPct}%` }} />
      <div className={`intel-bench__bar-client ${BAR_TONE[metric.tone] ?? BAR_TONE.good}`} style={{ width: `${metric.barClientPct}%` }} />
    </div>
  );
}

export default function BenchmarkingModule() {
  const [open, setOpen] = useState(false);
  const pg = benchmarking.peerGroup;

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="Peer Benchmarking — open full benchmark"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--accent">
          <div className="intel-mod__title intel-mod__title--accent">Peer Benchmarking</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-bench__tag">◎ {pg.sector.split(' (')[0]} · {pg.revenueBand} · n={pg.n}</div>
          {previewMetrics.map(({ category, metric }) => (
            <div key={metric.id} className="intel-bench__group">
              <div className="intel-bench__cat">{category}</div>
              <div className="intel-bench__item">
                <div className="intel-bench__item-head">
                  <span className="intel-bench__item-name">{metric.name}</span>
                  <span className={`intel-q ${QUARTILE_TONE[metric.quartile] ?? 'intel-q--mid'}`}>{metric.quartile} quartile</span>
                </div>
                <div className="intel-bench__item-vals">Client: <strong>{metric.clientValue}</strong> · Peers: <strong>{metric.median}</strong></div>
                <BenchBar metric={metric} />
              </div>
            </div>
          ))}
          <div className="intel-bench__legend">
            <span><span className="intel-bench__swatch intel-bench__swatch--client" />This client</span>
            <span><span className="intel-bench__swatch intel-bench__swatch--peer" />Peer median</span>
          </div>
          <SignalStrip signals={moduleSignals} />
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">{topQuartileCount} of {totalMetrics} metrics top quartile</span>
          <span className="intel-mod__foot-hint">Full benchmark →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="Anonymous Peer Benchmarking"
        subtitle={`Nkosi Retail Group · AI-generated · ${pg.n} peers · Updated ${pg.refreshDate}`}
        footerLeft="Anonymised aggregate data. No peer business is identifiable. Banking Behaviour data is Absa-internal only."
        footerRight="Model: CVP Benchmark v3.1"
        onClose={() => setOpen(false)}
      >
        <div className="intel-section-title">Peer Group Methodology</div>
        <div className="intel-method">
          {METHOD_CELLS(pg).map(cell => (
            <div key={cell.label} className="intel-method__cell">
              <span className="intel-method__label">{cell.label}</span>
              <span className="intel-method__val">{cell.value}</span>
            </div>
          ))}
        </div>
        <p className="intel-method__note">All peer data is anonymised and aggregated. No individual business is identifiable from these benchmarks.</p>

        <div className="intel-section-title">Grouped Metrics</div>
        {benchmarking.categories.map(category => (
          <div key={category.id} className="intel-bench-table">
            <div className="intel-bench-table__head">
              {category.label}
              <span className="intel-bench-table__desc">{category.description}</span>
            </div>
            <table className="intel-table intel-bench-table__table">
              <thead>
                <tr><th>Metric</th><th>Client</th><th>Median</th><th>vs Peers</th><th>Quartile</th></tr>
              </thead>
              <tbody>
                {category.metrics.map(metric => (
                  <tr key={metric.id}>
                    <td><strong>{metric.name}</strong><span className="intel-table__sub">{metric.formula}</span></td>
                    <td><strong>{metric.clientValue}</strong></td>
                    <td>{metric.median}</td>
                    <td style={{ width: '90px' }}><BenchBar metric={metric} /></td>
                    <td><span className={`intel-q ${QUARTILE_TONE[metric.quartile] ?? 'intel-q--mid'}`}>{metric.quartile}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="intel-section-title">RM Conversation Context</div>
        <div className="intel-context-box">{benchmarking.rmContext}</div>

        <div className="intel-section-title">AI Reasoning</div>
        <div className="intel-reasoning-box">{benchmarking.reasoning}</div>

        <div className="intel-section-title">What the AI is Seeing</div>
        <SignalIntelligenceSection
          signals={moduleSignals}
          synthesis={benchmarking.synthesis}
          connectionLabel="How this affects the benchmarks"
        />
      </IntelModal>
    </>
  );
}
