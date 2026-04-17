import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LookupAgentOutput from '../../components/LookupAgentOutput';
import { LookupJourneyTabs, StatusPill, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getLookupViewContext } from '../pageContext';

export default function RecommendationPage() {
  const { state } = useDemoState();
  const { agentPresentation, lookupResponse, recommendedProducts } = getLookupViewContext(state);

  useJourneyStep('lookup', 'recommendation');

  return (
    <div className="ri-page lookup-page lookup-page--recommendation">
      <Link className="portal-breadcrumb" to="/dashboard">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <section className="lookup-route-header">
        <h2>Advisory Lookup</h2>
        <p>On-demand intelligence</p>
      </section>

      <section className="ri-panel lookup-stepper-panel">
        <LookupJourneyTabs currentStep="recommendation" />
      </section>

      <section className="ri-panel lookup-intro-panel">
        <div className="lookup-intro-panel__copy">
          <h3>Recommended products</h3>
          <p>Product suggestions are linked to the client situation, not returned as a raw list.</p>
        </div>
      </section>

      {agentPresentation ? (
        <section className="ri-panel lookup-block">
          <div className="lookup-section-heading">
            <div>
              <h3>{agentPresentation.title}</h3>
              <p>The selected agent structure stays attached to the recommendation output.</p>
            </div>
          </div>
          <LookupAgentOutput presentation={agentPresentation} />
        </section>
      ) : null}

      {recommendedProducts.length ? (
        <div className="lookup-product-stack">
          {recommendedProducts.map(product => (
            <article key={product.id} className="ri-panel lookup-product-card">
              <div className="lookup-product-card__top">
                <div>
                  <h3>{product.name}</h3>
                  <StatusPill tone={product.preApproved ? 'warning' : 'neutral'}>{product.preApproved ? 'Pre-approved' : 'Optional'}</StatusPill>
                </div>
              </div>

              <p className="lookup-product-card__description">{product.description}</p>

              <div className="lookup-product-meta-grid">
                <article className="lookup-product-meta-card">
                  <span>{product.id === 'term-loan' ? 'Rate' : product.id === 'wc-buffer' ? 'Limit' : product.id === 'merchant-upgrade' ? 'Incentive' : 'Offer'}</span>
                  <strong>{product.pricing}</strong>
                </article>
                <article className="lookup-product-meta-card">
                  <span>{product.id === 'term-loan' ? 'Eligibility' : product.id === 'wc-buffer' ? 'Requirements' : product.id === 'merchant-upgrade' ? 'Approval' : 'Eligibility'}</span>
                  <strong>{product.eligibility}</strong>
                </article>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="ri-panel lookup-block">
          <article className="lookup-empty-card">
            <h4>No recommendation yet</h4>
            <p>Open the response tab and run a lookup before packaging products into the next-action view.</p>
          </article>
        </section>
      )}

      <section className="ri-panel lookup-block">
        <div className="lookup-section-heading">
          <div>
            <h3>Next steps</h3>
            <p>The RM leaves the lookup with an action plan, not just an answer.</p>
          </div>
        </div>

        <div className="lookup-next-steps-grid">
          <article className="lookup-next-step-card lookup-next-step-card--action">
            <span>Recommended action</span>
            <strong>{lookupResponse?.recommendedAction}</strong>
          </article>
          <article className="lookup-next-step-card lookup-next-step-card--workflow">
            <span>RM workflow</span>
            <strong>Move into engagement outreach or package the result into an insight-delivery conversation.</strong>
          </article>
        </div>

        <div className="lookup-recommendation-actions">
          <Link className="lookup-primary-cta" to="/insights/customize">
            <span>Package as client insight</span>
          </Link>
          <Link className="lookup-inline-link lookup-inline-link--secondary" to="/engagement/outreach">
            <span>Use in engagement</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
