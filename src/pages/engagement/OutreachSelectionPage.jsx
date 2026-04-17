import { ArrowLeft, ArrowRight, CalendarDays, Mail, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EngagementPhaseNoteAction } from '../../components/InternalNotes';
import { EngagementJourneyStepper, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { engagementSteps, getViewContext } from '../pageContext';

const choices = [
  {
    id: 'call',
    title: 'Call',
    description: 'Best for early stress or same-day tactical alignment.',
    icon: Phone,
  },
  {
    id: 'email',
    title: 'Email',
    description: 'Best for low-friction follow-up once the narrative is clear.',
    icon: Mail,
  },
  {
    id: 'meeting',
    title: 'Meeting',
    description: 'Best for strategic package review and relationship depth.',
    icon: CalendarDays,
  },
];

export default function OutreachSelectionPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemoState();
  const { client, pendingPreEngagementNotes, scenario, insight } = getViewContext(state);

  useJourneyStep('engagement', 'outreach');

  const selectedChoice = choices.find(choice => choice.id === state.outreachChoice) ?? choices[0];

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
        <EngagementJourneyStepper steps={engagementSteps} currentStep="outreach" />
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <h3>Select outreach channel</h3>
        </div>

        <div className="engagement-choice-grid">
          {choices.map(choice => {
            const Icon = choice.icon;
            const selected = state.outreachChoice === choice.id;

            return (
              <button
                key={choice.id}
                type="button"
                className={`engagement-choice-card ${selected ? 'engagement-choice-card--selected' : ''}`}
                aria-pressed={selected}
                onClick={() => dispatch({ type: 'SET_OUTREACH_CHOICE', choice: choice.id })}
              >
                <Icon size={34} />
                <strong>{choice.title}</strong>
                <p>{choice.description}</p>
              </button>
            );
          })}
        </div>

        <div className="engagement-context-stack">
          <article className="engagement-context-card">
            <h4>Outreach preview</h4>
            <div className="engagement-outreach-preview">
              <div>
                <span>Selected channel</span>
                <strong>{selectedChoice.title}</strong>
              </div>
              <div>
                <span>Opening line</span>
                <strong>{insight.headline}</strong>
              </div>
              <div>
                <span>Recommended emphasis</span>
                <strong>
                  {scenario.label}: {insight.recommendedAction}
                </strong>
              </div>
            </div>
          </article>

          <article className="engagement-context-card">
            <div className="engagement-context-card__header">
              <h4>Pre-engagement notes</h4>
              <div className="engagement-header-actions">
                <EngagementPhaseNoteAction clientId={client.id} scenarioId={scenario.id} phase="pre" buttonTone="ghost" />
              </div>
            </div>
            {pendingPreEngagementNotes.length ? (
              <div className="engagement-note-list">
                {pendingPreEngagementNotes.map(note => (
                  <article key={note.id} className="engagement-note-card">
                    <p>{note.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p>No pre-engagement notes captured yet.</p>
            )}
          </article>
        </div>
      </section>

      <button
        type="button"
        className="engagement-primary-cta"
        onClick={() => {
          dispatch({ type: 'CONFIRM_OUTREACH' });
          navigate('/engagement/confirm');
        }}
      >
        <span>Confirm outreach</span>
        <ArrowRight size={22} />
      </button>
    </div>
  );
}
