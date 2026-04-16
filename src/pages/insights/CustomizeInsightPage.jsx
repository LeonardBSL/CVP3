import { ActionLink, JourneyStepper, PageHeader, SectionPanel, SourceChips, useJourneyStep } from '../../components/UI';
import { JourneyNoteAction } from '../../components/InternalNotes';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, insightSteps } from '../pageContext';

export default function CustomizeInsightPage() {
  const { state, dispatch } = useDemoState();
  const { activeInsightRecord, client, insight, insightDraft, scenario } = getViewContext(state);

  useJourneyStep('insight', 'customize');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Insight Delivery"
        title="Customize insight"
        description="The generated insight is rewritten into client-facing language here so the RM can refine tone, detail, and emphasis before delivery."
        actions={
          <>
            <JourneyNoteAction clientId={client.id} insightRecordId={activeInsightRecord?.id} />
            <ActionLink to="/insights/delivery">Continue to delivery</ActionLink>
          </>
        }
      />

      <JourneyStepper steps={insightSteps} currentStep="customize" />

      <div className="two-column-grid">
        <SectionPanel
          title="Client-facing draft"
          subtitle="Write to the client, not about the client."
          action={
            <button type="button" className="button button--ghost" onClick={() => dispatch({ type: 'RESET_INSIGHT_DRAFT', scenarioId: scenario.id })}>
              Reset to generated
            </button>
          }
        >
          <div className="panel-stack">
            <label className="topbar-field topbar-field--full">
              <span>Editable insight text</span>
              <textarea
                aria-label="Client-facing insight draft"
                className="draft-textarea"
                value={insightDraft}
                onChange={event => dispatch({ type: 'SET_INSIGHT_DRAFT', scenarioId: scenario.id, draft: event.target.value })}
              />
            </label>
          </div>
        </SectionPanel>

        <SectionPanel title="Delivery guidance" subtitle="Keep the message clear, direct, and anchored in the client conversation.">
          <div className="panel-stack">
            <article className="list-item">
              <h4>Client</h4>
              <p>{client.name}</p>
            </article>
            <article className="list-item">
              <h4>Insight anchor</h4>
              <p>{insight.headline}</p>
            </article>
            <article className="list-item">
              <h4>Recommended action</h4>
              <p>{insight.recommendedAction}</p>
            </article>
            <article className="list-item">
              <h4>Source set</h4>
              <SourceChips sourceIds={insight.sourceIds} />
            </article>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
