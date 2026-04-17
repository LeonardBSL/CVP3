import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectorPulseChart } from '../../components/Charts';
import { SectorJourneyTabs, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext } from '../pageContext';

export default function DeepDivePage() {
  const { state } = useDemoState();
  const { briefing } = getViewContext(state);

  useJourneyStep('sector', 'deep-dive');

  return (
    <div className="ri-page sector-page">
      <header className="sector-route-header">
        <Link className="sector-back-link" to="/dashboard">
          <ArrowLeft size={24} />
          <span>Back to Dashboard</span>
        </Link>
        <h2>Sector Briefing</h2>
        <p className="sector-route-header__subtitle">Sector deep dive</p>
        <p>The RM can move from a high-level sector signal into a more detailed view with charts, drivers, and CIB-style commentary.</p>
      </header>

      <section className="ri-panel sector-stepper-panel sector-stepper-panel--with-footer">
        <SectorJourneyTabs currentStep="deep-dive" />
        <div className="sector-stepper-footer">
          <Link className="sector-inline-link" to="/sector/client-relevance">
            Map to client
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="ri-panel sector-intro-panel">
        <div className="sector-intro-panel__copy">
          <h3>{briefing.name}</h3>
          <p>{briefing.thesis}</p>
        </div>
      </section>

      <section className="ri-panel sector-chart-panel">
        <SectorPulseChart data={briefing.trendData} />
      </section>

      <section className="ri-panel sector-deep-dive-panel">
        <div className="sector-deep-dive-grid">
          <article className="sector-detail-card">
            <h3>CIB commentary</h3>
            <p>{briefing.commentary}</p>
          </article>

          <article className="sector-detail-card sector-detail-card--neutral">
            <h3>Key drivers</h3>
            <ul className="sector-bullet-list sector-bullet-list--stacked">
              {briefing.drivers.map(driver => (
                <li key={driver}>{driver}</li>
              ))}
            </ul>
          </article>

          <article className="sector-detail-card sector-detail-card--signal">
            <h3>Sector signals in focus</h3>
            <div className="sector-chip-row">
              <span className="sector-chip sector-chip--warm">{briefing.growthTrend}</span>
              <span className="sector-chip sector-chip--critical">{briefing.riskSignal}</span>
              <span className="sector-chip sector-chip--neutral">{briefing.opportunitySignal}</span>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
