import { ArrowLeft, ArrowRight } from 'lucide-react';
import { startTransition, useDeferredValue, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  clients,
  lookupAgentPlaceholder,
  lookupAgentPresets,
  lookupIntentOptions,
  suggestedQueries,
} from '../../data/demoData';
import { LookupJourneyTabs, StatusPill, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';

export default function SearchPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemoState();
  const { lookupSession } = state;
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  useJourneyStep('lookup', 'search');

  const filteredSuggestions = suggestedQueries.filter(item =>
    deferredQuery ? item.toLowerCase().includes(deferredQuery.toLowerCase()) : true,
  );
  const showClientScope = lookupSession.context.intentMode !== 'kb-only';
  const requiresSelectedClients = showClientScope && lookupSession.context.clientScopeMode === 'selected';
  const hasSelectedClients = lookupSession.context.selectedClientIds.length > 0;
  const canRunLookup = !requiresSelectedClients || hasSelectedClients;

  function runLookup(nextQuery) {
    if (!canRunLookup) return;

    const finalQuery = nextQuery || suggestedQueries[0];
    startTransition(() => {
      dispatch({ type: 'START_LOOKUP', query: finalQuery, reset: true });
      navigate('/lookup/response');
    });
  }

  return (
    <div className="ri-page lookup-page lookup-page--search">
      <Link className="portal-breadcrumb" to="/dashboard">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <section className="lookup-route-header">
        <h2>Advisory Lookup</h2>
        <p>On-demand intelligence</p>
      </section>

      <section className="ri-panel lookup-stepper-panel">
        <LookupJourneyTabs currentStep="search" />
      </section>

      <section className="ri-panel lookup-intro-panel">
        <div className="lookup-intro-panel__copy">
          <h3>Ask the advisory layer</h3>
          <p>Queries are resolved against scripted intelligence, not live systems.</p>
        </div>
      </section>

      <section className="ri-panel lookup-block">
        <div className="lookup-section-heading">
          <h3>Context filters</h3>
        </div>

        <div className="lookup-fieldset">
          <span className="lookup-fieldset__label">Intent</span>
          <div className="lookup-choice-grid">
            {lookupIntentOptions.map(option => {
              const selected = lookupSession.context.intentMode === option.id;
              return (
                <label key={option.id} className={`choice-card lookup-choice-card ${selected ? 'lookup-choice-card--selected' : ''}`}>
                  <div className="radio-row">
                    <input
                      checked={selected}
                      name="lookup-intent"
                      type="radio"
                      aria-label={option.label}
                      onChange={() => dispatch({ type: 'SET_LOOKUP_INTENT_MODE', intentMode: option.id })}
                    />
                    <div>
                      <h4>{option.label}</h4>
                      <p>{option.description}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {showClientScope ? (
          <div className="lookup-fieldset">
            <span className="lookup-fieldset__label">Client scope</span>
            <div className="lookup-choice-grid lookup-choice-grid--compact">
              {[
                {
                  id: 'all',
                  label: 'All clients',
                  description: 'Allow every client in the ecosystem to fall into context.',
                },
                {
                  id: 'selected',
                  label: 'Specific clients',
                  description: 'Restrict context to explicitly selected clients only.',
                },
              ].map(option => {
                const selected = lookupSession.context.clientScopeMode === option.id;
                return (
                  <label key={option.id} className={`choice-card lookup-choice-card ${selected ? 'lookup-choice-card--selected' : ''}`}>
                    <div className="radio-row">
                      <input
                        checked={selected}
                        name="lookup-client-scope"
                        type="radio"
                        aria-label={option.label}
                        onChange={() => dispatch({ type: 'SET_LOOKUP_CLIENT_SCOPE_MODE', clientScopeMode: option.id })}
                      />
                      <div>
                        <h4>{option.label}</h4>
                        <p>{option.description}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {requiresSelectedClients ? (
          <div className="lookup-fieldset">
            <span className="lookup-fieldset__label">Selected clients</span>
            <div className="lookup-client-grid">
              {clients.map(client => {
                const checked = lookupSession.context.selectedClientIds.includes(client.id);
                return (
                  <label key={client.id} className={`portal-checkbox lookup-client-checkbox ${checked ? 'lookup-client-checkbox--selected' : ''}`}>
                    <input
                      checked={checked}
                      type="checkbox"
                      aria-label={client.name}
                      onChange={() => dispatch({ type: 'TOGGLE_LOOKUP_CLIENT', clientId: client.id })}
                    />
                    <span>{client.name}</span>
                  </label>
                );
              })}
            </div>
            {!hasSelectedClients ? <p className="lookup-helper-text">Select at least one client before running the lookup.</p> : null}
          </div>
        ) : null}
      </section>

      <section className="ri-panel lookup-block">
        <div className="lookup-section-heading">
          <div>
            <h3>Agents layer</h3>
            <p>Select an agent to enhance your lookup query with specialized analysis.</p>
          </div>
          <StatusPill tone="neutral">{lookupSession.selectedAgentId ? 'Selected' : 'Optional'}</StatusPill>
        </div>

        <div className="lookup-agent-grid">
          <article className="choice-card choice-card--disabled lookup-agent-card lookup-agent-card--disabled" aria-disabled="true">
            <div className="client-card__top">
              <h4>{lookupAgentPlaceholder.label}</h4>
              <StatusPill tone="neutral">{lookupAgentPlaceholder.status}</StatusPill>
            </div>
            <p>{lookupAgentPlaceholder.description}</p>
          </article>

          {lookupAgentPresets.map(agent => {
            const selected = lookupSession.selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                type="button"
                className={`choice-card lookup-agent-card ${selected ? 'choice-card--selected' : ''}`}
                onClick={() => dispatch({ type: 'SET_LOOKUP_AGENT', agentId: selected ? null : agent.id })}
              >
                <div className="client-card__top">
                  <h4>{agent.label}</h4>
                  {selected ? <StatusPill tone="warning">Selected</StatusPill> : null}
                </div>
                <p>{agent.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="ri-panel lookup-block lookup-query-panel">
        <div className="lookup-section-heading">
          <h3>Lookup query</h3>
        </div>

        <label className="lookup-query-field">
          <span>Lookup query</span>
          <textarea
            aria-label="Lookup query"
            placeholder="Ask a client or sector question"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </label>

        <div className="lookup-query-actions">
          <button type="button" className="lookup-primary-cta lookup-primary-cta--compact" disabled={!canRunLookup} onClick={() => runLookup(query)}>
            <span>Run lookup</span>
          </button>
        </div>
      </section>

      <section className="ri-panel lookup-block">
        <div className="lookup-section-heading">
          <div>
            <h3>Suggested prompts</h3>
            <p>Suggested journeys keep demos moving quickly while still showing RM autonomy.</p>
          </div>
        </div>

        <div className="lookup-suggested-list">
          {filteredSuggestions.map(item => (
            <button key={item} type="button" className="lookup-suggestion-card" disabled={!canRunLookup} onClick={() => runLookup(item)}>
              <span>{item}</span>
              <ArrowRight size={22} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
