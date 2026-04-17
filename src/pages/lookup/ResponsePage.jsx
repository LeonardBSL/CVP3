import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { startTransition, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LookupAgentOutput from '../../components/LookupAgentOutput';
import RichEvidenceNarrative from '../../components/RichEvidenceNarrative';
import { LookupJourneyTabs, useJourneyStep } from '../../components/UI';
import { getSources, resolveLookupResponseId, suggestedQueries } from '../../data/demoData';
import { useDemoState } from '../../state/DemoStateProvider';
import { getLookupPresentationForResponse, getLookupViewContext } from '../pageContext';

function responseQualityLabel(confidence = 0) {
  if (confidence >= 85) return 'High';
  if (confidence >= 70) return 'Strong';
  return 'Moderate';
}

function sourceStateLabel(index) {
  if (index === 0) return 'Current';
  if (index === 1) return 'Up to date';
  return 'Latest';
}

export default function ResponsePage() {
  const [followUp, setFollowUp] = useState('');
  const followUpInputRef = useRef(null);
  const { state, dispatch } = useDemoState();
  const { activeScenarioId, lookupSession } = state;
  const latestView = getLookupViewContext(state);
  const { agentPresentation, contextSummary, lookupResponse } = latestView;
  const sources = getSources(lookupResponse?.sourceIds ?? []);

  useJourneyStep('lookup', 'response');

  useEffect(() => {
    if (lookupSession.status !== 'loading' || !lookupSession.pendingQuery) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      dispatch({
        type: 'COMPLETE_LOOKUP',
        query: lookupSession.pendingQuery,
        responseId: resolveLookupResponseId(lookupSession.pendingQuery, activeScenarioId, lookupSession.responseId),
      });
    }, 1200);

    return () => window.clearTimeout(timerId);
  }, [activeScenarioId, dispatch, lookupSession.pendingQuery, lookupSession.responseId, lookupSession.status]);

  function runLookup(nextQuery) {
    const finalQuery = nextQuery.trim();
    if (!finalQuery || lookupSession.status === 'loading') return;

    startTransition(() => {
      dispatch({ type: 'START_LOOKUP', query: finalQuery });
      setFollowUp('');
    });
  }

  const responseHistory = lookupSession.messages
    .map(message => {
      if (message.role === 'user') {
        return {
          id: message.id,
          role: 'user',
          title: message.text,
          meta: 'Question',
        };
      }

      const messageView = getLookupPresentationForResponse(state, message.responseId);
      return {
        id: message.id,
        role: 'assistant',
        title: messageView.lookupResponse?.title ?? 'Response',
        meta: 'Response',
      };
    })
    .reverse()
    .slice(0, 6);

  return (
    <div className="ri-page lookup-page lookup-page--response">
      <Link className="portal-breadcrumb" to="/dashboard">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <section className="lookup-route-header">
        <h2>Advisory Lookup</h2>
        <p>On-demand intelligence</p>
      </section>

      <section className="ri-panel lookup-stepper-panel">
        <LookupJourneyTabs currentStep="response" />
      </section>

      <section className="lookup-response-summary-grid">
        <article className="ri-panel lookup-setup-panel">
          <span className="lookup-summary-eyebrow">Active lookup setup</span>
          <div className="lookup-setup-grid">
            <div className="lookup-setup-item">
              <span>Intent</span>
              <strong>{contextSummary.intent}</strong>
            </div>
            <div className="lookup-setup-item">
              <span>Client Scope</span>
              <strong>{contextSummary.clientScope}</strong>
            </div>
            <div className="lookup-setup-item">
              <span>Agent</span>
              <strong>{contextSummary.agent.replace('No agent selected', 'None')}</strong>
            </div>
          </div>
        </article>

        <aside className="lookup-quality-card">
          <span>Response quality</span>
          <strong>{responseQualityLabel(lookupResponse?.confidence)}</strong>
          <p>Confidence: {lookupResponse?.confidence ?? 0}%</p>
        </aside>
      </section>

      <div className="lookup-response-grid">
        <section className="ri-panel lookup-response-panel">
          <div className="lookup-response-panel__header">
            <div className="lookup-response-heading">
              <span className="lookup-response-icon" aria-hidden="true">
                <Sparkles size={24} />
              </span>
              <div>
                <h3>Advisory Response</h3>
                <p>Based on current intelligence</p>
              </div>
            </div>

            {lookupResponse ? (
              <Link className="lookup-inline-link" to="/lookup/recommendation">
                <span>Open recommendation output</span>
                <ArrowRight size={18} />
              </Link>
            ) : null}
          </div>

          {lookupSession.status === 'loading' ? (
            <article className="lookup-loading-card">
              <strong>Generating response...</strong>
              <p>Connecting transactional signals to sector knowledge for the next answer.</p>
              <div className="generating-bar" />
            </article>
          ) : null}

          {lookupResponse ? (
            <>
              <article className="lookup-response-summary-card">
                <h4>{lookupResponse.title}</h4>
                <p>{lookupResponse.summary}</p>
              </article>

              <article className="lookup-response-callout">
                <span>Recommended action</span>
                <strong>{lookupResponse.recommendedAction}</strong>
              </article>

              {agentPresentation ? (
                <section className="lookup-subsection">
                  <div className="lookup-subsection__header">
                    <h4>{agentPresentation.title}</h4>
                    <p>Preset structure remains available alongside the grounded response.</p>
                  </div>
                  <LookupAgentOutput presentation={agentPresentation} />
                </section>
              ) : null}

              <section className="lookup-subsection lookup-subsection--detail">
                <div className="lookup-subsection__header">
                  <h4>Detailed response with citations</h4>
                  <p>Keep the grounded explanation, hover cues, and source-document access intact.</p>
                </div>
                <RichEvidenceNarrative response={lookupResponse.richResponse} />
              </section>
            </>
          ) : (
            <article className="lookup-empty-card">
              <h4>No response yet</h4>
              <p>Run a lookup from the search tab to populate the grounded response and citation view.</p>
            </article>
          )}
        </section>

        <aside className="lookup-sidebar">
          <section className="ri-panel lookup-sidebar-panel">
            <div className="lookup-sidebar-panel__header">
              <h3>Sources used</h3>
            </div>

            {sources.length ? (
              <div className="lookup-source-list">
                {sources.map((source, index) => (
                  <div key={source.id} className="lookup-source-list__item">
                    <span>{source.title}</span>
                    <strong>{sourceStateLabel(index)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="lookup-sidebar-empty">Sources will appear once the first response completes.</p>
            )}
          </section>

          <button type="button" className="lookup-sidebar-button" onClick={() => followUpInputRef.current?.focus()}>
            Ask Another Question
          </button>
        </aside>
      </div>

      <section className="ri-panel lookup-follow-up-panel">
        <div className="lookup-section-heading">
          <div>
            <h3>Continue lookup</h3>
            <p>Follow up in the same journey without losing the latest grounded answer.</p>
          </div>
        </div>

        <form
          className="lookup-follow-up-form"
          onSubmit={event => {
            event.preventDefault();
            runLookup(followUp);
          }}
        >
          <label className="lookup-query-field">
            <span>Follow-up question</span>
            <input
              ref={followUpInputRef}
              aria-label="Follow-up question"
              placeholder="Ask a follow-up question"
              value={followUp}
              onChange={event => setFollowUp(event.target.value)}
            />
          </label>
          <button type="submit" className="lookup-primary-cta lookup-primary-cta--compact" disabled={lookupSession.status === 'loading' || !followUp.trim()}>
            <span>Send</span>
          </button>
        </form>

        <div className="lookup-chip-row">
          {suggestedQueries.slice(0, 3).map(item => (
            <button key={item} type="button" className="chip-button" disabled={lookupSession.status === 'loading'} onClick={() => runLookup(item)}>
              {item}
            </button>
          ))}
        </div>

        {responseHistory.length ? (
          <div className="lookup-history-list">
            {responseHistory.map(item => (
              <article key={item.id} className={`lookup-history-item lookup-history-item--${item.role}`}>
                <span>{item.meta}</span>
                <strong>{item.title}</strong>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
