import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectorJourneyTabs, SourceChips, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext } from '../pageContext';

export default function ClientRelevancePage() {
  const { state } = useDemoState();
  const { briefing, client, insight } = getViewContext(state);

  useJourneyStep('sector', 'client-relevance');

  return (
    <div className="ri-page sector-page">
      <header className="sector-route-header">
        <Link className="sector-back-link" to="/dashboard">
          <ArrowLeft size={24} />
          <span>Back to Dashboard</span>
        </Link>
        <h2>Sector Briefing</h2>
        <p className="sector-route-header__subtitle">Client relevance mapping</p>
        <p>Macro and sector movement is translated directly into client impact and an RM-led action path.</p>
      </header>

      <section className="ri-panel sector-stepper-panel">
        <SectorJourneyTabs currentStep="client-relevance" />
      </section>

      <section className="ri-panel sector-intro-panel">
        <div className="sector-intro-panel__copy">
          <h3>{`${client.name} relevance`}</h3>
          <p>{`${briefing.name} signal translated into client action`}</p>
        </div>
      </section>

      <section className="ri-panel sector-client-panel">
        <div className="sector-client-stack">
          <article className="sector-client-card">
            <h3>Impact summary</h3>
            <p>{briefing.thesis}</p>
          </article>

          <article className="sector-client-card">
            <h3>Why it matters for this client</h3>
            <p>{insight.whyItMatters}</p>
          </article>

          <article className="sector-client-card sector-client-card--warm">
            <h3>Recommended RM action</h3>
            <p>{insight.recommendedAction}</p>
          </article>

          {briefing.sourceIds?.length ? (
            <article className="sector-client-card sector-client-card--references">
              <h3>Reference set</h3>
              <SourceChips sourceIds={briefing.sourceIds} />
            </article>
          ) : null}
        </div>
      </section>

      <section className="ri-panel sector-action-panel">
        <div className="sector-action-panel__header">
          <h3>Action path</h3>
          <p>Cross-navigation keeps the RM in one connected workflow.</p>
        </div>
        <div className="sector-action-stack">
          <Link className="sector-action-link sector-action-link--primary" to="/engagement/insight">
            Move into advisory engagement
          </Link>
          <Link className="sector-action-link" to="/insights/client">
            Package as client insight
          </Link>
          <Link className="sector-action-link" to="/dashboard">
            Return to dashboard hub
          </Link>
        </div>
      </section>
    </div>
  );
}
