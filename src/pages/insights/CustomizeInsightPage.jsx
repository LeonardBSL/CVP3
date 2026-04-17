import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JourneyNoteAction } from '../../components/InternalNotes';
import { InsightJourneyStepper, SourceChips, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, insightSteps } from '../pageContext';

export default function CustomizeInsightPage() {
  const { state, dispatch } = useDemoState();
  const { activeInsightRecord, client, insight, insightDraft, scenario } = getViewContext(state);

  useJourneyStep('insight', 'customize');

  return (
    <div className="ri-page insight-page">
      <Link className="portal-breadcrumb" to="/dashboard">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <section className="engagement-route-header">
        <h2>Insight Delivery</h2>
      </section>

      <section className="ri-panel engagement-stepper-panel">
        <InsightJourneyStepper steps={insightSteps} currentStep="customize" />
      </section>

      <section className="ri-panel insight-customize-panel">
        <div className="engagement-panel-header">
          <div>
            <h3>Client-facing draft</h3>
            <p>Write to the client, not about the client.</p>
          </div>
          <div className="engagement-header-actions">
            <JourneyNoteAction
              clientId={client.id}
              insightRecordId={activeInsightRecord?.id}
              buttonTone="ghost"
              buttonClassName="insight-note-action"
            />
          </div>
        </div>

        <div className="insight-edit-toolbar">
          <span>Editable insight text</span>
          <button
            type="button"
            className="insight-inline-reset"
            onClick={() => dispatch({ type: 'RESET_INSIGHT_DRAFT', scenarioId: scenario.id })}
          >
            Reset to generated
          </button>
        </div>

        <label className="insight-draft-editor">
          <textarea
            aria-label="Client-facing insight draft"
            className="insight-draft-textarea"
            value={insightDraft}
            onChange={event => dispatch({ type: 'SET_INSIGHT_DRAFT', scenarioId: scenario.id, draft: event.target.value })}
          />
        </label>
      </section>

      <section className="ri-panel insight-guidance-panel">
        <div className="engagement-section-heading">
          <div>
            <h3>Delivery guidance</h3>
            <p>Keep the message clear, direct, and anchored in the client conversation.</p>
          </div>
        </div>

        <div className="insight-guidance-grid">
          <article className="insight-guidance-card">
            <span>Client</span>
            <strong>{client.name}</strong>
          </article>
          <article className="insight-guidance-card">
            <span>Insight anchor</span>
            <strong>{insight.headline}</strong>
          </article>
          <article className="insight-guidance-card">
            <span>Recommended action</span>
            <strong>{insight.recommendedAction}</strong>
          </article>
          <article className="insight-guidance-card insight-guidance-card--sources">
            <span>Source set</span>
            <SourceChips sourceIds={insight.sourceIds} />
          </article>
        </div>
      </section>

      <Link className="engagement-primary-cta insight-primary-cta" to="/insights/delivery">
        <span>Continue to delivery</span>
        <ArrowRight size={22} />
      </Link>
    </div>
  );
}
