import { useState } from 'react';
import { Settings2, X } from 'lucide-react';
import { ActionLink, FeedbackStrip, InsightCard, JourneyStepper, MetricGrid, PageHeader, SectionPanel, StatusPill, useJourneyStep } from '../../components/UI';
import { JourneyNoteAction } from '../../components/InternalNotes';
import RichEvidenceNarrative from '../../components/RichEvidenceNarrative';
import { useDemoState } from '../../state/DemoStateProvider';
import { engagementSteps, getViewContext } from '../pageContext';

export default function InsightReviewPage() {
  const [bundleOpen, setBundleOpen] = useState(false);
  const { state, dispatch } = useDemoState();
  const { activeInsightRecord, bundle, client, insight, scenario, selection, selectedProducts } = getViewContext(state);

  useJourneyStep('engagement', 'insight');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Advisory Engagement"
        title="Insight review screen"
        description="The RM sees a structured signal summary first, then a fuller model explanation grounded in the client transaction profile and sector knowledge base."
        actions={
          <>
            <JourneyNoteAction clientId={client.id} insightRecordId={activeInsightRecord?.id} />
            <ActionLink to="/engagement/outreach">Choose outreach</ActionLink>
          </>
        }
      />

      <JourneyStepper steps={engagementSteps} currentStep="insight" />

      <div className="two-column-grid">
        <SectionPanel title={insight.headline} subtitle={`${client.name} | ${client.persona}`} accent="accent">
          <InsightCard
            confidence={insight.confidence}
            whyNow={insight.whyNow}
            sourceIds={insight.sourceIds}
            showSources={false}
            narrative={{
              whatHappened: insight.whatHappened,
              whyItMatters: insight.whyItMatters,
              whatToDoNext: insight.whatToDoNext,
            }}
            recommendedAction={insight.recommendedAction}
          >
            <RichEvidenceNarrative response={insight.richResponse} />
            <FeedbackStrip
              contextKey={`engagement-${client.id}`}
              actions={
                <button type="button" className="button button--secondary" onClick={() => setBundleOpen(true)}>
                  <Settings2 size={16} />
                  Review bundle
                </button>
              }
            />
          </InsightCard>
        </SectionPanel>

        <SectionPanel title="Transactional evidence" subtitle="Client data stays separate from sector context, but both are interpreted in one recommendation.">
          <MetricGrid items={insight.transactionalMetrics} />
          <div className="panel-stack">
            <article className="list-item">
              <h4>Model read</h4>
              <p>{insight.transactionalNarrative}</p>
            </article>
            <article className="list-item">
              <div className="list-item__top">
                <h4>Current bundle</h4>
                <StatusPill tone={scenario.severity}>{bundle.title}</StatusPill>
              </div>
              <p>{selectedProducts.map(product => product.name).join(', ')}</p>
            </article>
            <article className="list-item">
              <h4>RM focus</h4>
              <p>{client.focus}</p>
            </article>
          </div>
        </SectionPanel>
      </div>

      {bundleOpen ? (
        <div className="overlay-backdrop">
          <div className="overlay-card bundle-review-panel" role="dialog" aria-modal="true" aria-label="Review bundle">
            <div className="overlay-header">
              <div>
                <p className="eyebrow">Review bundle</p>
                <h3>{bundle.title}</h3>
                <p>Adjust the recommended package while keeping the supporting transactional evidence visible.</p>
              </div>
              <button type="button" className="button button--ghost" onClick={() => setBundleOpen(false)} aria-label="Close review bundle">
                <X size={16} />
                Close
              </button>
            </div>

            <div className="bundle-review-grid">
              <section className="bundle-review-column">
                <div className="bundle-review-column__header">
                  <div>
                    <p className="eyebrow">Bundle controls</p>
                    <h4>Customize recommendation</h4>
                  </div>
                  <button type="button" className="button button--ghost" onClick={() => dispatch({ type: 'RESET_BUNDLE', scenarioId: scenario.id })}>
                    Reset bundle
                  </button>
                </div>

                <div className="panel-stack">
                  {bundle.products.map(product => {
                    const selected = selection.selectedProductIds.includes(product.id);
                    return (
                      <article key={product.id} className="product-card">
                        <div className="checkbox-row">
                          <input
                            id={`bundle-product-${product.id}`}
                            checked={selected}
                            type="checkbox"
                            onChange={() => dispatch({ type: 'TOGGLE_BUNDLE_PRODUCT', scenarioId: scenario.id, productId: product.id })}
                          />
                          <div>
                            <label htmlFor={`bundle-product-${product.id}`}>
                              <strong>{product.name}</strong>
                            </label>
                            <p>{product.description}</p>
                          </div>
                        </div>

                        <div className="inline-meta">
                          <span>{product.pricing}</span>
                          <span>{product.eligibility}</span>
                          <StatusPill tone={product.preApproved ? 'positive' : 'neutral'}>{product.preApproved ? 'Pre-approved' : 'Optional'}</StatusPill>
                        </div>

                        {product.termOptions?.length ? (
                          <label className="topbar-field topbar-field--full">
                            <span>Recommended term</span>
                            <select
                              value={selection.customTerms[product.id]}
                              onChange={event =>
                                dispatch({
                                  type: 'SET_PRODUCT_TERM',
                                  scenarioId: scenario.id,
                                  productId: product.id,
                                  term: event.target.value,
                                })
                              }
                            >
                              {product.termOptions.map(option => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="bundle-review-column">
                <div className="bundle-review-column__header">
                  <div>
                    <p className="eyebrow">Evidence view</p>
                    <h4>Relevant transactional information</h4>
                  </div>
                </div>

                <MetricGrid items={insight.bundleEvidence.metrics} />

                <div className="panel-stack">
                  {insight.bundleEvidence.notes.map(note => (
                    <article key={note.title} className="list-item">
                      <h4>{note.title}</h4>
                      <p>{note.body}</p>
                    </article>
                  ))}
                  <article className="list-item">
                    <h4>Included products</h4>
                    <p>{selectedProducts.map(product => product.name).join(', ') || 'No products currently selected.'}</p>
                  </article>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
