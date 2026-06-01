import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EngagementJourneyStepper, useJourneyStep } from '../../components/UI';
import LookupAgentOutput from '../../components/LookupAgentOutput';
import { buildMeetingBrief, buildMeetingBriefPipeline, engagementSteps, getReportDate, getViewContext } from '../pageContext';
import { useDemoState } from '../../state/DemoStateProvider';
import AgentPipeline from '../../components/engagement/AgentPipeline';
import ExportReportButton from '../../components/report/ExportReportButton';
import MeetingBriefPdf from '../../components/report/MeetingBriefPdf';

export default function MeetingBriefPage() {
  const { state } = useDemoState();
  useJourneyStep('engagement', 'brief');

  const context = getViewContext(state);
  const { client, insight } = context;
  const brief = buildMeetingBrief(context);
  const briefPipeline = buildMeetingBriefPipeline(context);
  const reportDate = getReportDate();

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
          <ExportReportButton
            document={<MeetingBriefPdf brief={brief} client={client.name} date={reportDate.label} />}
            fileName={`Absa-${client.name.replace(/\s+/g, '-')}-Meeting-Brief-${reportDate.stamp}.pdf`}
            label="Download brief PDF"
          />
        </div>
        <LookupAgentOutput presentation={brief} />
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <h3>How the agents work together</h3>
          <p>Six specialist agents produce one meeting brief.</p>
        </div>
        <AgentPipeline pipeline={briefPipeline} />
      </section>

      <Link className="engagement-primary-cta" to="/engagement/outreach">
        <span>Choose outreach</span>
        <ArrowRight size={22} />
      </Link>
    </div>
  );
}
