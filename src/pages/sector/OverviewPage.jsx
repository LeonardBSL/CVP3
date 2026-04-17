import { ArrowLeft, MoveUpRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { sectorBriefings } from '../../data/demoData';
import { SectorJourneyTabs, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext } from '../pageContext';

export default function OverviewPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemoState();
  const { client } = getViewContext(state);

  useJourneyStep('sector', 'overview');

  return (
    <div className="ri-page sector-page">
      <header className="sector-route-header">
        <Link className="sector-back-link" to="/dashboard">
          <ArrowLeft size={24} />
          <span>Back to Dashboard</span>
        </Link>
        <h2>Sector Briefing</h2>
        <p className="sector-route-header__subtitle">Sector overview</p>
        <p>Periodic and triggered sector intelligence gives the RM forward-looking context and a direct route into client relevance.</p>
      </header>

      <section className="ri-panel sector-stepper-panel">
        <SectorJourneyTabs currentStep="overview" />
      </section>

      <section className="ri-panel sector-intro-panel">
        <div className="sector-intro-panel__copy">
          <h3>Sector signals</h3>
          <p>{`Current client context: ${client.name}`}</p>
        </div>
      </section>

      <section className="sector-card-grid" aria-label="Sector signals">
        {Object.values(sectorBriefings).map(briefing => {
          const selected = state.sectorFocus === briefing.id || (!state.sectorFocus && client.sectorId === briefing.id);

          return (
            <button
              key={briefing.id}
              type="button"
              className={`ri-panel sector-briefing-card ${selected ? 'sector-briefing-card--selected' : ''}`}
              onClick={() => {
                dispatch({ type: 'SET_SECTOR_FOCUS', sectorId: briefing.id });
                navigate('/sector/deep-dive');
              }}
            >
              <div className="sector-briefing-card__top">
                <div className="sector-briefing-card__heading">
                  <h3>{briefing.name}</h3>
                  <span className="sector-trend-pill">{briefing.growthTrend}</span>
                </div>
                <span className="sector-briefing-card__icon" aria-hidden="true">
                  <MoveUpRight size={28} />
                </span>
              </div>

              <p className="sector-briefing-card__thesis">{briefing.thesis}</p>

              <ul className="sector-bullet-list">
                <li>{briefing.riskSignal}</li>
                <li>{briefing.opportunitySignal}</li>
              </ul>
            </button>
          );
        })}
      </section>
    </div>
  );
}
