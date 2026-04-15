import { productBundles } from '../../data/demoData';
import { ActionLink, JourneyStepper, PageHeader, SectionPanel, StatusPill, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { getViewContext, lookupSteps } from '../pageContext';

const allProducts = Object.values(productBundles).flatMap(bundle => bundle.products);

export default function RecommendationPage() {
  const { state } = useDemoState();
  const { lookupResponse } = getViewContext(state);

  useJourneyStep('lookup', 'recommendation');

  const recommendedProducts = (lookupResponse?.productIds ?? [])
    .map(productId => allProducts.find(product => product.id === productId))
    .filter(Boolean);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Advisory Lookup"
        title="Recommendation output"
        description="The lookup completes with products linked to the client transaction story and the sector interpretation behind it."
        actions={<ActionLink to="/engagement/outreach">Use in engagement</ActionLink>}
      />

      <JourneyStepper steps={lookupSteps} currentStep="recommendation" />

      <div className="two-column-grid">
        <SectionPanel title="Recommended products" subtitle="Product suggestions are linked to the client situation, not returned as a raw list.">
          <div className="panel-stack">
            {recommendedProducts.map(product => (
              <article key={product.id} className="product-card">
                <div className="product-card__top">
                  <h4>{product.name}</h4>
                  <StatusPill tone={product.preApproved ? 'positive' : 'neutral'}>{product.preApproved ? 'Pre-approved' : 'Optional'}</StatusPill>
                </div>
                <p>{product.description}</p>
                <div className="inline-meta">
                  <span>{product.pricing}</span>
                  <span>{product.eligibility}</span>
                </div>
              </article>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Next steps" subtitle="The RM leaves the lookup with an action plan, not just an answer.">
          <div className="panel-stack">
            <article className="list-item">
              <h4>Recommended action</h4>
              <p>{lookupResponse?.recommendedAction}</p>
            </article>
            <article className="list-item">
              <h4>RM workflow</h4>
              <p>Move into engagement outreach or package the result into an insight-delivery conversation.</p>
            </article>
            <ActionLink to="/insights/customize" tone="secondary">
              Package as client insight
            </ActionLink>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
