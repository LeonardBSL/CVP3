import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JourneyNoteAction } from '../../components/InternalNotes';
import { InsightJourneyStepper, SourceChips, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, insightSteps } from '../pageContext';

export default function ClientInsightPage() {
  const { state } = useDemoState();
  const { activeInsightRecord, client, insight } = getViewContext(state);

  useJourneyStep('insight', 'client');

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
        <InsightJourneyStepper steps={insightSteps} currentStep="client" />
      </section>

      <section className="ri-panel engagement-main-panel insight-main-panel">
        <div className="engagement-panel-header">
          <div>
            <h3>{insight.headline}</h3>
            <p>
              {client.name} | {client.persona}
            </p>
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

        <article className="engagement-insight-banner">
          <div className="engagement-insight-banner__icon">
            <Sparkles size={26} />
          </div>
          <div>
            <strong>AI-generated insight</strong>
            <span>{insight.confidence}% confidence</span>
          </div>
        </article>

        <div className="engagement-detail-stack">
          <article className="engagement-detail-block">
            <span>Why now surfaced</span>
            <p>{insight.whyNow}</p>
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

        <article className="insight-summary-callout">
          <span>Recommended action</span>
          <strong>{insight.recommendedAction}</strong>
        </article>

        <div className="engagement-source-section">
          <h4>Data sources</h4>
          <SourceChips sourceIds={insight.sourceIds} />
        </div>
      </section>

      <section className="ri-panel insight-transaction-panel">
        <div className="engagement-section-heading">
          <div>
            <h3>Transactional snapshot</h3>
            <p>Client metrics are shown directly, without extra comparison layers.</p>
          </div>
        </div>

        <div className="engagement-stat-grid">
          {insight.transactionalMetrics.map(metric => (
            <article key={metric.label} className="engagement-stat-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              {metric.meta ? <p>{metric.meta}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <Link className="engagement-primary-cta insight-primary-cta" to="/insights/insight">
        <span>Open detailed insight</span>
        <ArrowRight size={22} />
      </Link>
    </div>
  );
}
