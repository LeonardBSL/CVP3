import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EngagementJourneyStepper, StatusPill, useJourneyStep } from '../../components/UI';
import { JourneyNoteAction } from '../../components/InternalNotes';
import { getSources } from '../../data/demoData';
import { getCitationKindLabel } from '../../data/evidenceData';
import { useDemoState } from '../../state/DemoStateProvider';
import { engagementSteps, getViewContext } from '../pageContext';

function sourceChipTone(source) {
  if (source.kind === 'kb') return 'kb';
  if (source.kind === 'policy') return 'policy';
  return 'transaction';
}

export default function AlertDetailPage() {
  const { alertId } = useParams();
  const { state, dispatch } = useDemoState();
  const { activeAlert, activeInsightRecord, client, insight, scenario } = getViewContext(state, alertId);
  const sources = getSources(insight?.sourceIds ?? []);

  useJourneyStep('engagement', 'alert');

  useEffect(() => {
    if (alertId) {
      dispatch({ type: 'OPEN_ALERT', alertId });
    }
  }, [alertId, dispatch]);

  if (!activeAlert) {
    return null;
  }

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
        <EngagementJourneyStepper steps={engagementSteps} currentStep="alert" />
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-panel-header">
          <div>
            <h3>{activeAlert.title}</h3>
            <p>{client.name}</p>
          </div>
          <div className="engagement-header-actions">
            <JourneyNoteAction clientId={client.id} insightRecordId={activeInsightRecord?.id} buttonTone="ghost" />
          </div>
        </div>

        <article className="engagement-insight-banner">
          <div className="engagement-insight-banner__icon">
            <Sparkles size={26} />
          </div>
          <div>
            <strong>AI-generated insight</strong>
            <span>{activeAlert.confidence}% confidence</span>
          </div>
        </article>

        <div className="engagement-detail-stack">
          <article className="engagement-detail-block">
            <span>Why now surfaced</span>
            <p>{activeAlert.whyNow}</p>
          </article>
          <article className="engagement-detail-block">
            <span>What happened</span>
            <p>{insight.whatHappened}</p>
          </article>
          <article className="engagement-detail-block">
            <span>Why it matters</span>
            <p>{insight.whyItMatters}</p>
          </article>
          <article className="engagement-detail-block">
            <span>What to do next</span>
            <p>{insight.whatToDoNext}</p>
          </article>
        </div>
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <h3>Trigger evidence</h3>
          <p>Trust by design: source, confidence, and explanation are visible before the RM acts.</p>
        </div>

        <div className="engagement-stat-grid">
          {activeAlert.supportingData.map(metric => (
            <article key={metric.label} className="engagement-stat-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        <div className="engagement-context-stack">
          <article className="engagement-context-card">
            <div className="engagement-context-card__header">
              <h4>Scenario</h4>
              <StatusPill tone={scenario.severity}>{scenario.label}</StatusPill>
            </div>
            <p>{activeAlert.summary}</p>
          </article>

          <article className="engagement-context-card">
            <div className="engagement-context-card__header">
              <h4>Client context</h4>
              <StatusPill tone="neutral">{client.persona}</StatusPill>
            </div>
            <p>{client.creditEligibility}</p>
          </article>
        </div>

        <div className="engagement-source-section">
          <h4>Data sources</h4>
          <div className="engagement-source-chip-row">
            {sources.map(source => (
              <span key={source.id} className={`engagement-source-chip engagement-source-chip--${sourceChipTone(source)}`}>
                <strong>{getCitationKindLabel(source)}</strong>
                {source.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Link className="engagement-primary-cta" to="/engagement/insight">
        <span>Review AI recommendation</span>
        <ArrowRight size={22} />
      </Link>
    </div>
  );
}
