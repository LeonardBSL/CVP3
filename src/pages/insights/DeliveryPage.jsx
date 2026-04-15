import { useState } from 'react';
import { DeliveryActions, JourneyStepper, PageHeader, PresentationOverlay, SectionPanel, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, insightSteps } from '../pageContext';

export default function DeliveryPage() {
  const [presentationOpen, setPresentationOpen] = useState(false);
  const { state, dispatch } = useDemoState();
  const { client, insight, insightDraft } = getViewContext(state);

  useJourneyStep('insight', 'delivery');

  const draftParagraphs = insightDraft.split('\n').map(paragraph => paragraph.trim()).filter(Boolean);

  function handleAction(mode) {
    dispatch({ type: 'RECORD_DELIVERY_ACTION', mode });
    if (mode === 'present') {
      setPresentationOpen(true);
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Insight Delivery"
        title="Insight delivery screen"
        description="Delivery actions now use the customized client-facing draft so the RM can send, present, or prepare exactly what was refined in the previous step."
      />

      <JourneyStepper steps={insightSteps} currentStep="delivery" />

      <div className="two-column-grid">
        <SectionPanel title="Client-ready insight" subtitle="This is the text prepared for delivery.">
          <div className="draft-preview">
            {draftParagraphs.map((paragraph, index) => (
              <p key={`${client.id}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Delivery actions" subtitle="All actions are front-end simulations, with dashboard-safe confirmation feedback.">
          <div className="panel-stack">
            <DeliveryActions onAction={handleAction} />
            <article className="list-item">
              <h4>Client pack context</h4>
              <p>{client.name}</p>
            </article>
            <article className="list-item">
              <h4>Insight anchor</h4>
              <p>{insight.headline}</p>
            </article>
            <article className="list-item">
              <h4>Latest delivery activity</h4>
              <p>{state.activityFeed[0]?.title}: {state.activityFeed[0]?.detail}</p>
            </article>
          </div>
        </SectionPanel>
      </div>

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
