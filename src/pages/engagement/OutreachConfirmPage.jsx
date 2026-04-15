import { CheckCircle2 } from 'lucide-react';
import { ActionLink, PageHeader, SectionPanel, StatusPill, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext } from '../pageContext';

export default function OutreachConfirmPage() {
  const { state } = useDemoState();
  const { client, scenario } = getViewContext(state);
  const latestActivity = state.activityFeed[0];
  const confirmationLabel = {
    call: 'Call scheduled',
    email: 'Email sent',
    meeting: 'Meeting scheduled',
  }[state.outreachChoice];

  useJourneyStep('engagement', 'confirm');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Advisory Engagement"
        title="Outreach confirmation"
        description="The prototype closes the loop with a clear confirmation state and a dashboard activity update, reinforcing that every insight leads to an accountable RM action."
        actions={<ActionLink to="/dashboard">Return to dashboard</ActionLink>}
      />

      <div className="success-banner">
        <CheckCircle2 size={20} />
        <div>
          <strong>{confirmationLabel}</strong>
          <p>{client.name} is now marked as actioned in the RM cockpit.</p>
        </div>
      </div>

      <div className="two-column-grid">
        <SectionPanel title="Action outcome" subtitle="The next client step is confirmed and the alert state has been updated.">
          <div className="panel-stack">
            <article className="list-item">
              <h4>Client</h4>
              <p>{client.name}</p>
            </article>
            <article className="list-item">
              <h4>Channel</h4>
              <p>{state.outreachChoice}</p>
            </article>
            <article className="list-item">
              <h4>Scenario</h4>
              <p>{scenario.label}</p>
            </article>
          </div>
        </SectionPanel>

        <SectionPanel title="Dashboard state" subtitle="Activity feed and dashboard cues are kept in sync for workshop playback.">
          <div className="panel-stack">
            <article className="list-item">
              <div className="list-item__top">
                <h4>{latestActivity?.title}</h4>
                <StatusPill tone={latestActivity?.tone}>{latestActivity?.timestamp}</StatusPill>
              </div>
              <p>{latestActivity?.detail}</p>
            </article>
            <ActionLink to="/insights/client" tone="secondary">
              Continue to insight delivery
            </ActionLink>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
