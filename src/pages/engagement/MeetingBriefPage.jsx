import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EngagementJourneyStepper, useJourneyStep } from '../../components/UI';
import LookupAgentOutput from '../../components/LookupAgentOutput';
import { buildMeetingBrief, engagementSteps, getViewContext } from '../pageContext';
import { useDemoState } from '../../state/DemoStateProvider';

export default function MeetingBriefPage() {
  const { state } = useDemoState();
  const context = getViewContext(state);
  const { client, insight } = context;
  const brief = buildMeetingBrief(context);

  useJourneyStep('engagement', 'brief');

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
        <EngagementJourneyStepper steps={engagementSteps} currentStep="brief" />
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-panel-header">
          <div>
            <h3>{brief.title}</h3>
            <p>{client.name} | {insight.headline}</p>
          </div>
        </div>
        <LookupAgentOutput presentation={brief} />
      </section>

      <Link className="engagement-primary-cta" to="/engagement/outreach">
        <span>Choose outreach</span>
        <ArrowRight size={22} />
      </Link>
    </div>
  );
}
