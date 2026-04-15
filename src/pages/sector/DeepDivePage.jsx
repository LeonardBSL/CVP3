import { SectorPulseChart } from '../../components/Charts';
import { ActionLink, JourneyStepper, PageHeader, SectionPanel, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, sectorSteps } from '../pageContext';

export default function DeepDivePage() {
  const { state } = useDemoState();
  const { briefing } = getViewContext(state);

  useJourneyStep('sector', 'deep-dive');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Sector Briefing"
        title="Sector deep dive"
        description="The RM can move from a high-level sector signal into a more detailed view with charts, drivers, and CIB-style commentary."
        actions={<ActionLink to="/sector/client-relevance">Map to client</ActionLink>}
      />

      <JourneyStepper steps={sectorSteps} currentStep="deep-dive" />

      <div className="two-column-grid">
        <SectionPanel title={briefing.name} subtitle={briefing.thesis}>
          <SectorPulseChart data={briefing.trendData} />
        </SectionPanel>

        <SectionPanel title="CIB commentary" subtitle="Designed to feel premium, calm, and executive.">
          <div className="panel-stack">
            <article className="list-item">
              <h4>Commentary</h4>
              <p>{briefing.commentary}</p>
            </article>
            <article className="list-item">
              <h4>Key drivers</h4>
              <p>{briefing.drivers.join(' ')}</p>
            </article>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
