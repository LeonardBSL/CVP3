import { ActionLink, JourneyStepper, PageHeader, SectionPanel, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, sectorSteps } from '../pageContext';

export default function ClientRelevancePage() {
  const { state } = useDemoState();
  const { briefing, client, insight } = getViewContext(state);

  useJourneyStep('sector', 'client-relevance');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Sector Briefing"
        title="Client relevance mapping"
        description="Macro and sector movement is translated directly into client impact and an RM-led action path."
      />

      <JourneyStepper steps={sectorSteps} currentStep="client-relevance" />

      <div className="two-column-grid">
        <SectionPanel title={`${client.name} relevance`} subtitle={`${briefing.name} signal translated into client action`}>
          <div className="panel-stack">
            <article className="list-item">
              <h4>Impact summary</h4>
              <p>{briefing.thesis}</p>
            </article>
            <article className="list-item">
              <h4>Why it matters for this client</h4>
              <p>{insight.whyItMatters}</p>
            </article>
            <article className="list-item">
              <h4>Recommended RM action</h4>
              <p>{insight.recommendedAction}</p>
            </article>
          </div>
        </SectionPanel>

        <SectionPanel title="Action path" subtitle="Cross-navigation keeps the RM in one connected workflow.">
          <div className="panel-stack">
            <ActionLink to="/engagement/insight">Move into advisory engagement</ActionLink>
            <ActionLink to="/insights/client" tone="secondary">
              Package as client insight
            </ActionLink>
            <ActionLink to="/dashboard" tone="secondary">
              Return to dashboard hub
            </ActionLink>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
