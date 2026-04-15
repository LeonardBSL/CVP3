import { startTransition, useDeferredValue, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { suggestedQueries } from '../../data/demoData';
import { JourneyStepper, PageHeader, SectionPanel, useJourneyStep } from '../../components/UI';
import { useDemoState } from '../../state/DemoStateProvider';
import { lookupSteps } from '../pageContext';

export default function SearchPage() {
  const navigate = useNavigate();
  const { dispatch } = useDemoState();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  useJourneyStep('lookup', 'search');

  const filteredSuggestions = suggestedQueries.filter(item =>
    deferredQuery ? item.toLowerCase().includes(deferredQuery.toLowerCase()) : true,
  );

  function runLookup(nextQuery) {
    const finalQuery = nextQuery || suggestedQueries[0];
    startTransition(() => {
      dispatch({ type: 'START_LOOKUP', query: finalQuery });
      navigate('/lookup/response');
    });
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Advisory Lookup"
        title="Lookup search screen"
        description="The RM can pull on-demand intelligence for preparation or live client conversations, with the same trust cues as the proactive journeys."
      />

      <JourneyStepper steps={lookupSteps} currentStep="search" />

      <div className="two-column-grid">
        <SectionPanel title="Ask the advisory layer" subtitle="Queries are resolved against scripted intelligence, not live systems.">
          <div className="panel-stack">
            <label className="topbar-field">
              <span>Lookup query</span>
              <input
                aria-label="Lookup query"
                placeholder="Ask a client or sector question"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </label>
            <button type="button" className="button button--primary" onClick={() => runLookup(query)}>
              Run lookup
            </button>
          </div>
        </SectionPanel>

        <SectionPanel title="Suggested prompts" subtitle="Suggested journeys keep demos moving quickly while still showing RM autonomy.">
          <div className="panel-stack">
            {filteredSuggestions.map(item => (
              <button key={item} type="button" className="lookup-suggestion" onClick={() => runLookup(item)}>
                <h4>{item}</h4>
              </button>
            ))}
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
