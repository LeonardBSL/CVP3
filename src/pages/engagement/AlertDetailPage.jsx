import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ActionLink, InsightCard, JourneyStepper, MetricGrid, PageHeader, SectionPanel, StatusPill, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { engagementSteps, getViewContext } from '../pageContext';

export default function AlertDetailPage() {
  const { alertId } = useParams();
  const { state, dispatch } = useDemoState();
  const { activeAlert, client, insight, scenario } = getViewContext(state, alertId);

  useJourneyStep('engagement', 'alert');

  useEffect(() => {
    if (alertId) {
      dispatch({ type: 'OPEN_ALERT', alertId });
    }
  }, [alertId, dispatch]);

  if (!activeAlert) {
    return null;
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Advisory Engagement"
        title="Alert detail view"
        description="The RM sees the trigger, the supporting evidence, the confidence score, and exactly why the moment matters now."
        actions={<ActionLink to="/engagement/insight">Review AI recommendation</ActionLink>}
      />

      <JourneyStepper steps={engagementSteps} currentStep="alert" />

      <div className="two-column-grid">
        <SectionPanel title={activeAlert.title} subtitle={client.name} accent="accent">
          <InsightCard
            confidence={activeAlert.confidence}
            whyNow={activeAlert.whyNow}
            sourceIds={insight.sourceIds}
            narrative={{
              whatHappened: insight.whatHappened,
              whyItMatters: insight.whyItMatters,
              whatToDoNext: insight.whatToDoNext,
            }}
            recommendedAction={insight.recommendedAction}
          />
        </SectionPanel>

        <SectionPanel title="Trigger evidence" subtitle="Trust by design: source, confidence, and explanation are visible before the RM acts.">
          <MetricGrid items={activeAlert.supportingData} />
          <div className="panel-stack">
            <article className="list-item">
              <div className="list-item__top">
                <h4>Scenario</h4>
                <StatusPill tone={scenario.severity}>{scenario.label}</StatusPill>
              </div>
              <p>{activeAlert.summary}</p>
            </article>
            <article className="list-item">
              <div className="list-item__top">
                <h4>Client context</h4>
                <StatusPill tone="neutral">{client.persona}</StatusPill>
              </div>
              <p>{client.creditEligibility}</p>
            </article>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
