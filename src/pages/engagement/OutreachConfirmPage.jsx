import { CheckCircle2 } from 'lucide-react';
import { ActionLink, PageHeader, SectionPanel, StatusPill, useJourneyStep } from '../../components/UI';
import { EngagementPhaseNoteAction, JourneyNoteAction } from '../../components/InternalNotes';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext } from '../pageContext';

export default function OutreachConfirmPage() {
  const { state } = useDemoState();
  const { activeInsightRecord, client, latestEngagement, latestEngagementPostNotes, latestEngagementPreNotes, scenario } = getViewContext(state);
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
        actions={
          <>
            <JourneyNoteAction clientId={client.id} insightRecordId={activeInsightRecord?.id} />
            <ActionLink to="/dashboard">Return to dashboard</ActionLink>
          </>
        }
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
            <article className="list-item">
              <div className="list-item__top">
                <h4>Pre-engagement notes</h4>
                <StatusPill tone="neutral">{latestEngagementPreNotes.length}</StatusPill>
              </div>
              {latestEngagementPreNotes.length ? (
                <div className="note-list">
                  {latestEngagementPreNotes.map(note => (
                    <article key={note.id} className="note-item">
                      <p>{note.body}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p>No pre-engagement notes were captured for this outreach yet.</p>
              )}
            </article>
          </div>
        </SectionPanel>

        <SectionPanel
          title="Dashboard state"
          subtitle="Activity feed and dashboard cues are kept in sync for workshop playback."
          action={<EngagementPhaseNoteAction clientId={client.id} scenarioId={scenario.id} engagementId={latestEngagement?.id} phase="post" buttonTone="ghost" />}
        >
          <div className="panel-stack">
            <article className="list-item">
              <div className="list-item__top">
                <h4>{latestActivity?.title}</h4>
                <StatusPill tone={latestActivity?.tone}>{latestActivity?.timestamp}</StatusPill>
              </div>
              <p>{latestActivity?.detail}</p>
            </article>
            <article className="list-item">
              <div className="list-item__top">
                <h4>Post-engagement notes</h4>
                <StatusPill tone="neutral">{latestEngagementPostNotes.length}</StatusPill>
              </div>
              {latestEngagementPostNotes.length ? (
                <div className="note-list">
                  {latestEngagementPostNotes.map(note => (
                    <article key={note.id} className="note-item">
                      <p>{note.body}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p>Add a follow-up note to capture what happened after the outreach was confirmed.</p>
              )}
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
