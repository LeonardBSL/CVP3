import { useNavigate } from 'react-router-dom';
import { useDemoState } from '../../state/DemoStateProvider';
import { JourneyStepper, OutreachChoiceIcon, PageHeader, SectionPanel, StatusPill, useJourneyStep } from '../../components/UI';
import { engagementSteps, getViewContext } from '../pageContext';

const choices = [
  { id: 'call', title: 'Call', description: 'Best for early stress or same-day tactical alignment.' },
  { id: 'email', title: 'Email', description: 'Best for low-friction follow-up once the narrative is clear.' },
  { id: 'meeting', title: 'Meeting', description: 'Best for strategic package review and relationship depth.' },
];

export default function OutreachSelectionPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemoState();
  const { client, scenario, insight } = getViewContext(state);

  useJourneyStep('engagement', 'outreach');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Advisory Engagement"
        title="Outreach selection screen"
        description="Every insight ends in a clear RM action. The channel is chosen deliberately to match the urgency, trust level, and narrative style of the opportunity."
        actions={
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              dispatch({ type: 'CONFIRM_OUTREACH' });
              navigate('/engagement/confirm');
            }}
          >
            Confirm outreach
          </button>
        }
      />

      <JourneyStepper steps={engagementSteps} currentStep="outreach" />

      <div className="two-column-grid">
        <SectionPanel title="Choose delivery channel" subtitle="Human-led engagement keeps the RM accountable for the final client moment.">
          <div className="choice-grid">
            {choices.map(choice => (
              <button
                key={choice.id}
                type="button"
                className="choice-card"
                onClick={() => dispatch({ type: 'SET_OUTREACH_CHOICE', choice: choice.id })}
              >
                <div className="client-card__top">
                  <h4>{choice.title}</h4>
                  <OutreachChoiceIcon choice={choice.id} />
                </div>
                <p>{choice.description}</p>
                <StatusPill tone={state.outreachChoice === choice.id ? 'positive' : 'neutral'}>
                  {state.outreachChoice === choice.id ? 'Selected' : 'Available'}
                </StatusPill>
              </button>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Outreach preview" subtitle="The RM delivers a packaged recommendation, not a raw model output.">
          <div className="panel-stack">
            <article className="list-item">
              <h4>Target client</h4>
              <p>{client.name}</p>
            </article>
            <article className="list-item">
              <h4>Opening line</h4>
              <p>{insight.headline}</p>
            </article>
            <article className="list-item">
              <h4>Recommended emphasis</h4>
              <p>{scenario.label}: {insight.recommendedAction}</p>
            </article>
            <article className="list-item">
              <h4>Selected channel</h4>
              <p>{state.outreachChoice}</p>
            </article>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
