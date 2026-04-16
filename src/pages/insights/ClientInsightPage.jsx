import { TrendAreaChart } from '../../components/Charts';
import { ActionLink, InsightCard, JourneyStepper, MetricGrid, PageHeader, SectionPanel, useJourneyStep } from '../../components/UI';
import { JourneyNoteAction } from '../../components/InternalNotes';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, insightSteps } from '../pageContext';

export default function ClientInsightPage() {
  const { state } = useDemoState();
  const { activeInsightRecord, client, insight } = getViewContext(state);

  useJourneyStep('insight', 'client');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Insight Delivery"
        title="Client insight summary"
        description="The RM starts with a concise summary of what the client data is showing before moving into the fuller AI interpretation."
        actions={
          <>
            <JourneyNoteAction clientId={client.id} insightRecordId={activeInsightRecord?.id} />
            <ActionLink to="/insights/insight">Open detailed insight</ActionLink>
          </>
        }
      />

      <JourneyStepper steps={insightSteps} currentStep="client" />

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
          />
        </SectionPanel>

        <SectionPanel title="Transactional snapshot" subtitle="Client metrics are shown directly, without extra comparison layers.">
          <MetricGrid items={insight.transactionalMetrics} />
          <TrendAreaChart data={insight.trendData} label="Signal confidence" />
        </SectionPanel>
      </div>
    </div>
  );
}
