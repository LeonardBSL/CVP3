import { ActionLink, InsightCard, JourneyStepper, MetricGrid, PageHeader, SectionPanel, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, insightSteps } from '../pageContext';

export default function InsightDetailPage() {
  const { state } = useDemoState();
  const { client, insight } = getViewContext(state);

  useJourneyStep('insight', 'insight');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Insight Delivery"
        title="Detailed insight view"
        description="This step combines the client transaction pattern and sector knowledge into one longform AI explanation that the RM can review before client-facing editing."
        actions={<ActionLink to="/insights/customize">Customize insight</ActionLink>}
      />

      <JourneyStepper steps={insightSteps} currentStep="insight" />

      <div className="two-column-grid">
        <SectionPanel title={insight.headline} subtitle={`${client.name} | ${client.persona}`} accent="accent">
          <InsightCard
            confidence={insight.confidence}
            whyNow={insight.whyNow}
            sourceIds={insight.sourceIds}
            narrative={{
              whatHappened: insight.whatHappened,
              whyItMatters: insight.whyItMatters,
              whatToDoNext: insight.whatToDoNext,
            }}
            recommendedAction={insight.recommendedAction}
            detailIntro={insight.transactionalNarrative}
            detailParagraphs={insight.llmBreakdown}
          />
        </SectionPanel>

        <SectionPanel title="Client transaction view" subtitle="The structured summary stays grounded in the client account and cash-flow profile.">
          <MetricGrid items={insight.transactionalMetrics} />
          <div className="panel-stack">
            {insight.bundleEvidence.notes.map(note => (
              <article key={note.title} className="list-item">
                <h4>{note.title}</h4>
                <p>{note.body}</p>
              </article>
            ))}
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
