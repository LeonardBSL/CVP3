import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EngagementPhaseNoteAction } from '../../components/InternalNotes';
import { EngagementJourneyStepper, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { engagementSteps, getViewContext } from '../pageContext';

export default function OutreachConfirmPage() {
  const { state } = useDemoState();
  const { client, latestEngagement, latestEngagementPostNotes, latestEngagementPreNotes, scenario } = getViewContext(state);
  const latestActivity = state.activityFeed[0];
  const confirmationLabel = {
    call: 'Call scheduled',
    email: 'Email sent',
    meeting: 'Meeting scheduled',
  }[state.outreachChoice];

  useJourneyStep('engagement', 'confirm');

  return (
    <div className="ri-page engagement-page">
      <Link className="portal-breadcrumb" to="/dashboard">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <section className="engagement-route-header">
        <h2>Advisory Engagement</h2>
      </section>

      <section className="ri-panel engagement-stepper-panel">
        <EngagementJourneyStepper steps={engagementSteps} currentStep="confirm" />
      </section>

      <section className="ri-panel engagement-confirm-hero">
        <div className="engagement-confirm-hero__icon">
          <CheckCircle2 size={46} />
        </div>
        <h3>{confirmationLabel}</h3>
        <p>{client.name} is now marked as actioned in the RM cockpit.</p>
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <h3>Action outcome</h3>
          <p>The next client step is confirmed and the alert state has been updated.</p>
        </div>

        <div className="engagement-confirm-grid">
          <div>
            <span>Client</span>
            <strong>{client.name}</strong>
          </div>
          <div>
            <span>Channel</span>
            <strong>{state.outreachChoice.charAt(0).toUpperCase() + state.outreachChoice.slice(1)}</strong>
          </div>
          <div>
            <span>Scenario</span>
            <strong>{scenario.label}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{latestActivity?.timestamp ?? latestEngagement?.confirmedAt?.slice(11, 16)}</strong>
          </div>
        </div>

        <div className="engagement-context-stack">
          <article className="engagement-context-card">
            <h4>Pre-engagement notes</h4>
            {latestEngagementPreNotes.length ? (
              <div className="engagement-note-list">
                {latestEngagementPreNotes.map(note => (
                  <article key={note.id} className="engagement-note-card">
                    <p>{note.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p>0 notes — No pre-engagement notes were captured for this outreach yet.</p>
            )}
          </article>

          <article className="engagement-highlight-card">
            <span>Dashboard state</span>
            <p>Activity feed and dashboard cues are kept in sync for workshop playback.</p>
            <div className="engagement-highlight-card__timeline">
              <span>{latestActivity?.timestamp}</span>
              <p>{latestActivity?.detail}</p>
            </div>
          </article>

          <article className="engagement-context-card">
            <div className="engagement-context-card__header">
              <h4>Post-engagement notes</h4>
              <div className="engagement-header-actions">
                <EngagementPhaseNoteAction clientId={client.id} scenarioId={scenario.id} engagementId={latestEngagement?.id} phase="post" buttonTone="ghost" />
              </div>
            </div>
            {latestEngagementPostNotes.length ? (
              <div className="engagement-note-list">
                {latestEngagementPostNotes.map(note => (
                  <article key={note.id} className="engagement-note-card">
                    <p>{note.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p>0 notes — Add a follow-up note to capture what happened after the outreach was confirmed.</p>
            )}
          </article>
        </div>

        <Link className="engagement-secondary-link" to="/insights/client">
          Continue to insight delivery
        </Link>
      </section>

      <Link className="engagement-primary-cta" to="/dashboard">
        <span>Return to dashboard</span>
      </Link>
    </div>
  );
}
