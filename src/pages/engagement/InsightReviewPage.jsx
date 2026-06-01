import { ArrowLeft, ArrowRight, BrainCircuit, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EngagementJourneyStepper, FeedbackStrip, useJourneyStep } from '../../components/UI';
import { JourneyNoteAction } from '../../components/InternalNotes';
import RichEvidenceNarrative from '../../components/RichEvidenceNarrative';
import { useDemoState } from '../../state/DemoStateProvider';
import { buildOriginationLenses, buildOriginationPipeline, engagementSteps, getViewContext } from '../pageContext';
import LensTabs from '../../components/engagement/LensTabs';
import AgentPipeline from '../../components/engagement/AgentPipeline';
import ExportReportButton from '../../components/report/ExportReportButton';
import OriginationReportPdf from '../../components/report/OriginationReportPdf';

export default function InsightReviewPage() {
  const [bundleOpen, setBundleOpen] = useState(false);
  const { state, dispatch } = useDemoState();
  const context = getViewContext(state);
  const { activeInsightRecord, bundle, client, insight, scenario, selection, selectedProducts } = context;
  const originationLenses = buildOriginationLenses(context);
  const originationPipeline = buildOriginationPipeline(context);

  useJourneyStep('engagement', 'insight');

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
        <EngagementJourneyStepper steps={engagementSteps} currentStep="insight" />
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-panel-header">
          <div>
            <h3>{insight.headline}</h3>
            <p>
              {client.name} | {client.persona}
            </p>
          </div>
          <div className="engagement-header-actions">
            <JourneyNoteAction clientId={client.id} insightRecordId={activeInsightRecord?.id} buttonTone="ghost" />
          </div>
        </div>

        <article className="engagement-insight-banner">
          <div className="engagement-insight-banner__icon">
            <BrainCircuit size={16} />
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
      </section>

      <section className="ri-panel engagement-main-panel">
        <RichEvidenceNarrative response={insight.richResponse} />
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <div>
            <h3>Origination lenses</h3>
            <p>Four specialist views over the same client intelligence.</p>
          </div>
          <ExportReportButton
            document={<OriginationReportPdf lenses={originationLenses} client={client.name} date="1 June 2026" />}
            fileName={`Absa-${client.name.replace(/\s+/g, '-')}-Deal-Origination-Report-20260601.pdf`}
            label="Download origination report"
          />
        </div>
        <LensTabs lenses={originationLenses} />
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <h3>How the agents work together</h3>
          <p>Six specialist agents produce one banker-ready report.</p>
        </div>
        <AgentPipeline pipeline={originationPipeline} />
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <h3>Transactional evidence</h3>
          <p>Client data stays separate from sector context, but both are interpreted in one recommendation.</p>
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

        <div className="engagement-context-stack">
          <article className="engagement-context-card">
            <h4>Model read</h4>
            <p>{insight.transactionalNarrative}</p>
          </article>

          <article className="engagement-highlight-card">
            <span>Current bundle</span>
            <strong>{bundle.title}</strong>
            <p>{selectedProducts.map(product => product.name).join(', ')}</p>
            <div className="engagement-highlight-card__divider" />
            <span>RM focus</span>
            <p>{client.focus}</p>
          </article>
        </div>

        <FeedbackStrip
          className="engagement-feedback"
          contextKey={`engagement-${client.id}`}
          actions={
            <button type="button" className="button button--ghost" onClick={() => setBundleOpen(true)}>
              <Settings2 size={16} />
              Review bundle
            </button>
          }
        />
      </section>

      <Link className="engagement-primary-cta" to="/engagement/brief">
        <span>Build meeting brief</span>
        <ArrowRight size={22} />
      </Link>

      {bundleOpen ? (
        <div className="overlay-backdrop">
          <div className="overlay-card bundle-review-panel engagement-bundle-modal" role="dialog" aria-modal="true" aria-label="Review bundle">
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

                <div className="engagement-stat-grid engagement-stat-grid--modal">
                  {insight.bundleEvidence.metrics.map(metric => (
                    <article key={metric.label} className="engagement-stat-card">
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      {metric.meta ? <p>{metric.meta}</p> : null}
                    </article>
                  ))}
                </div>

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
