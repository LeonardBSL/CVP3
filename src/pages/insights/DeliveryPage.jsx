import { ArrowLeft, Download, Monitor, Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { JourneyNoteAction } from '../../components/InternalNotes';
import { InsightJourneyStepper, PresentationOverlay, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, insightSteps } from '../pageContext';

export default function DeliveryPage() {
  const [presentationOpen, setPresentationOpen] = useState(false);
  const { state, dispatch } = useDemoState();
  const { activeInsightRecord, client, insight, insightDraft } = getViewContext(state);

  useJourneyStep('insight', 'delivery');

  const draftParagraphs = insightDraft
    .split('\n')
    .map(paragraph => paragraph.trim())
    .filter(Boolean);

  function handleAction(mode) {
    dispatch({ type: 'RECORD_DELIVERY_ACTION', mode });
    if (mode === 'present') {
      setPresentationOpen(true);
    }
  }

  const deliveryActions = [
    { id: 'send', label: 'Send', icon: Send },
    { id: 'present', label: 'Present', icon: Monitor },
    { id: 'download', label: 'Download', icon: Download },
  ];

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
        <InsightJourneyStepper steps={insightSteps} currentStep="delivery" />
      </section>

      <section className="ri-panel insight-delivery-preview-panel">
        <div className="engagement-panel-header">
          <div>
            <h3>Client-ready insight</h3>
            <p>This is the text prepared for delivery.</p>
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

        <div className="insight-delivery-preview">
          {draftParagraphs.map((paragraph, index) => (
            <p key={`${client.id}-${index}`}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="ri-panel insight-delivery-actions-panel">
        <div className="engagement-section-heading">
          <div>
            <h3>Delivery actions</h3>
            <p>All actions are front-end simulations, with dashboard-safe confirmation feedback.</p>
          </div>
        </div>

        <div className="insight-delivery-action-grid">
          {deliveryActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                className="insight-delivery-action"
                onClick={() => handleAction(action.id)}
              >
                <span className="insight-delivery-action__icon">
                  <Icon size={34} />
                </span>
                <strong>{action.label}</strong>
              </button>
            );
          })}
        </div>
      </section>

      <section className="ri-panel insight-context-panel">
        <div className="engagement-section-heading">
          <div>
            <h3>Client pack context</h3>
          </div>
        </div>

        <div className="insight-context-grid">
          <article className="insight-guidance-card">
            <span>Client</span>
            <strong>{client.name}</strong>
          </article>
          <article className="insight-guidance-card">
            <span>Insight anchor</span>
            <strong>{insight.headline}</strong>
          </article>
          <article className="insight-activity-card">
            <span>Latest delivery activity</span>
            <strong>
              {state.activityFeed[0]?.title}: {state.activityFeed[0]?.detail}
            </strong>
          </article>
        </div>
      </section>

      <PresentationOverlay
        open={presentationOpen}
        onClose={() => setPresentationOpen(false)}
        title={insight.headline}
        clientName={client.name}
        body={draftParagraphs}
      />
    </div>
  );
}
