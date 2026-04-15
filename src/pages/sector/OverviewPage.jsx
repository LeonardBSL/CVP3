import { useNavigate } from 'react-router-dom';
import { sectorBriefings } from '../../data/demoData';
import { ActionLink, JourneyStepper, PageHeader, SectionPanel, StatusPill, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, sectorSteps } from '../pageContext';

export default function OverviewPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemoState();
  const { client } = getViewContext(state);

  useJourneyStep('sector', 'overview');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Sector Briefing"
        title="Sector overview"
        description="Periodic and triggered sector intelligence gives the RM forward-looking context and a direct route into client relevance."
        actions={<ActionLink to="/sector/deep-dive">Open current deep dive</ActionLink>}
      />

      <JourneyStepper steps={sectorSteps} currentStep="overview" />

      <SectionPanel title="Sector signals" subtitle={`Current client context: ${client.name}`}>
        <div className="cards-grid">
          {Object.values(sectorBriefings).map(briefing => (
            <button
              key={briefing.id}
              type="button"
              className="sector-card"
              onClick={() => {
                dispatch({ type: 'SET_SECTOR_FOCUS', sectorId: briefing.id });
                navigate('/sector/deep-dive');
              }}
            >
              <div className="client-card__top">
                <h4>{briefing.name}</h4>
                <StatusPill tone="neutral">{briefing.growthTrend}</StatusPill>
              </div>
              <p>{briefing.thesis}</p>
              <div className="inline-meta">
                <span>{briefing.riskSignal}</span>
                <span>{briefing.opportunitySignal}</span>
              </div>
            </button>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}
