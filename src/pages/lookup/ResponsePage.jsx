import { startTransition, useEffect, useState } from 'react';
import LookupAgentOutput from '../../components/LookupAgentOutput';
import { ActionLink, JourneyStepper, PageHeader, SectionPanel, SourceChips, StatusPill, useJourneyStep } from '../../components/UI';
import RichEvidenceNarrative from '../../components/RichEvidenceNarrative';
import { resolveLookupResponseId, suggestedQueries } from '../../data/demoData';
import { useDemoState } from '../../state/DemoStateProvider';
import { getLookupPresentationForResponse, getLookupViewContext, lookupSteps } from '../pageContext';

export default function ResponsePage() {
  const [followUp, setFollowUp] = useState('');
  const { state, dispatch } = useDemoState();
  const { activeScenarioId, lookupSession } = state;
  const latestView = getLookupViewContext(state);
  const { agentPresentation, contextSummary, lookupResponse } = latestView;

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

  return (
    <div className="page">
      <PageHeader
        eyebrow="Advisory Lookup"
        title="AI response screen"
        description="The lookup now behaves like a running advisory chat so the RM can ask a question, review the response, and continue with follow-up prompts."
        actions={lookupResponse ? <ActionLink to="/lookup/recommendation">Open recommendation output</ActionLink> : null}
      />

      <JourneyStepper steps={lookupSteps} currentStep="response" />

      <div className="lookup-context-summary">
        <StatusPill tone="neutral">Intent: {contextSummary.intent}</StatusPill>
        <StatusPill tone="neutral">Client scope: {contextSummary.clientScope}</StatusPill>
        <StatusPill tone="neutral">Preset: {contextSummary.agent}</StatusPill>
      </div>

      <div className="two-column-grid">
        <SectionPanel title="Advisory chat" subtitle="Ask a question, then keep the conversation going with follow-ups." accent="accent">
          <div className="chat-thread" aria-live="polite">
            {!lookupSession.messages.length && lookupSession.status !== 'loading' ? (
              <article className="chat-message chat-message--assistant">
                <div className="chat-bubble chat-bubble--assistant chat-bubble--empty">
                  <h4>Start the conversation</h4>
                  <p>Ask about a client signal, a sector theme, or the best next advisory action. The latest answer will remain available for recommendation output.</p>
                </div>
              </article>
            ) : null}

            {lookupSession.messages.map(message => {
              if (message.role === 'user') {
                return (
                  <article key={message.id} className="chat-message chat-message--user">
                    <div className="chat-bubble chat-bubble--user">
                      <p>{message.text}</p>
                    </div>
                  </article>
                );
              }

              const messageView = getLookupPresentationForResponse(state, message.responseId);

              return (
                <article key={message.id} className="chat-message chat-message--assistant">
                  <div className="chat-bubble chat-bubble--assistant">
                    <div className="chat-message__meta">
                      <h4>{messageView.lookupResponse.title}</h4>
                      <StatusPill tone="positive">{messageView.lookupResponse.confidence}% confidence</StatusPill>
                    </div>

                    {messageView.agentPresentation ? (
                      <LookupAgentOutput presentation={messageView.agentPresentation} />
                    ) : (
                      <RichEvidenceNarrative response={messageView.lookupResponse.richResponse} />
                    )}
                  </div>
                </article>
              );
            })}

            {lookupSession.status === 'loading' ? (
              <article className="chat-message chat-message--assistant">
                <div className="chat-bubble chat-bubble--assistant chat-bubble--loading">
                  <strong>Generating response...</strong>
                  <p>Connecting transactional signals to sector knowledge for the next answer.</p>
                  <div className="generating-bar" />
                </div>
              </article>
            ) : null}
          </div>

          <form
            className="chat-composer"
            onSubmit={event => {
              event.preventDefault();
              runLookup(followUp);
            }}
          >
            <label className="topbar-field topbar-field--full">
              <span>Follow-up question</span>
              <input
                aria-label="Follow-up question"
                placeholder="Ask a follow-up question"
                value={followUp}
                onChange={event => setFollowUp(event.target.value)}
              />
            </label>
            <button type="submit" className="button button--primary" disabled={lookupSession.status === 'loading' || !followUp.trim()}>
              Send
            </button>
          </form>

          <div className="chat-suggestion-row">
            {suggestedQueries.slice(0, 3).map(item => (
              <button key={item} type="button" className="chip-button" disabled={lookupSession.status === 'loading'} onClick={() => runLookup(item)}>
                {item}
              </button>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Latest response" subtitle="Recommendation output always reflects the most recent assistant answer.">
          {lookupResponse ? (
            agentPresentation ? (
              <LookupAgentOutput presentation={agentPresentation} />
            ) : (
              <div className="panel-stack">
                <article className="list-item">
                  <div className="list-item__top">
                    <h4>Current answer</h4>
                    <StatusPill tone="positive">{lookupResponse.confidence}% confidence</StatusPill>
                  </div>
                  <p>{lookupResponse.summary}</p>
                </article>
                <article className="list-item">
                  <h4>Recommended action</h4>
                  <p>{lookupResponse.recommendedAction}</p>
                </article>
                <article className="list-item">
                  <h4>Grounding sources</h4>
                  <SourceChips sourceIds={lookupResponse.sourceIds} />
                </article>
              </div>
            )
          ) : (
            <article className="list-item">
              <h4>No response yet</h4>
              <p>Run the first lookup message to start the chat and populate the recommendation pane.</p>
            </article>
          )}
        </SectionPanel>
      </div>
    </div>
  );
}
