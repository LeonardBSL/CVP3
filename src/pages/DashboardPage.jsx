import { ArrowUpRight, BellRing, BriefcaseBusiness, Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clients, getDefaultScenarioForClient, scenarioTriggerMap } from '../data/demoData';
import { useDemoState } from '../state/DemoStateProvider';
import { ActionLink, InsightCard, MetricGrid, PageHeader, SectionPanel, StatusPill } from '../components/UI';
import { getViewContext } from './pageContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemoState();
  const { client, insight, scenario } = getViewContext(state);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Dashboard"
        title="Relationship manager command centre"
        description="A premium, insight-led cockpit where proactive signals, AI recommendations, and RM actions converge in one workspace."
        actions={<ActionLink to="/engagement/alert/alert-growth-retail">Walk engagement journey</ActionLink>}
      />

      <div className="dashboard-grid">
        <SectionPanel title="Priority alert inbox" subtitle="Alerts are ranked by urgency, confidence, and readiness for RM action.">
          <div className="panel-stack">
            {state.alerts.map(alert => (
              <button
                key={alert.id}
                type="button"
                className="alert-row"
                onClick={() => {
                  dispatch({ type: 'OPEN_ALERT', alertId: alert.id });
                  navigate(`/engagement/alert/${alert.id}`);
                }}
              >
                <div className="alert-row__top">
                  <h4>{alert.title}</h4>
                  <div className="inline-pills">
                    <StatusPill tone={alert.severity}>{alert.priority}</StatusPill>
                    <StatusPill tone="neutral">{alert.updatedLabel}</StatusPill>
                  </div>
                </div>
                <p>{alert.summary}</p>
                <div className="inline-meta">
                  <span>{alert.confidence}% confidence</span>
                  <span>{alert.whyNow}</span>
                </div>
              </button>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Active AI narrative" subtitle={`${client.name} | ${client.persona}`} accent="accent">
          <InsightCard
            confidence={insight.confidence}
            whyNow={insight.whyNow}
            sourceIds={insight.sourceIds}
            narrative={{
              whatHappened: insight.whatHappened,
              whyItMatters: insight.whyItMatters,
              whatToDoNext: insight.whatToDoNext,
            }}
            recommendedAction={insight.recommendedAction}
          />
        </SectionPanel>
      </div>

      <MetricGrid
        items={[
          { label: 'Client in focus', value: client.name, meta: client.persona },
          { label: 'Relationship value', value: client.relationshipValue, meta: client.focus },
          { label: 'Revenue trend', value: client.revenueTrend, meta: client.cashCycle },
          { label: 'Eligibility', value: client.creditEligibility, meta: scenario.label },
        ]}
      />

      <div className="two-column-grid">
        <SectionPanel title="Simulation controls" subtitle="Trigger pre-scripted signals to demonstrate the shift from reactive to proactive banking.">
          <div className="panel-stack">
            <button type="button" className="choice-card" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.growth })}>
              <div className="client-card__top">
                <h4>Simulate growth signal</h4>
                <BellRing size={18} />
              </div>
              <p>Surface a ready-to-act expansion opportunity with pre-approved capacity.</p>
            </button>
            <button type="button" className="choice-card" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.liquidity })}>
              <div className="client-card__top">
                <h4>Simulate liquidity risk</h4>
                <Search size={18} />
              </div>
              <p>Show the RM how AI explains the cash-flow squeeze before the client escalates it.</p>
            </button>
            <button type="button" className="choice-card" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.sector })}>
              <div className="client-card__top">
                <h4>Simulate sector disruption</h4>
                <TrendingUp size={18} />
              </div>
              <p>Translate macro transport pressure into client-specific resilience action.</p>
            </button>
          </div>
        </SectionPanel>

        <SectionPanel title="Recent RM activity" subtitle="Simulated actions, confirmations, and model-learning feedback appear here.">
          <div className="timeline">
            {state.activityFeed.map(item => (
              <article key={item.id} className="timeline-item">
                <div className="timeline-item__top">
                  <h4>{item.title}</h4>
                  <StatusPill tone={item.tone}>{item.timestamp}</StatusPill>
                </div>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </SectionPanel>
      </div>

      <div className="two-column-grid">
        <SectionPanel title="Priority clients" subtitle="The same personas persist across all journeys so workshop participants can track context.">
          <div className="cards-grid">
            {clients.map(item => (
              <button
                key={item.id}
                type="button"
                className="client-card"
                onClick={() => dispatch({ type: 'SELECT_CLIENT', clientId: item.id })}
              >
                <div className="client-card__top">
                  <h4>{item.name}</h4>
                  <StatusPill tone="neutral">{item.priorityTag}</StatusPill>
                </div>
                <p>{item.persona}</p>
                <div className="inline-meta">
                  <span>{item.revenueTrend}</span>
                  <span>{item.creditEligibility}</span>
                </div>
              </button>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Journey shortcuts" subtitle="Cross-navigation keeps the RM in control across engagement, insight, lookup, and sector views.">
          <div className="panel-stack">
            <ActionLink to="/engagement/insight">
              <BellRing size={16} />
              Review AI recommendation
            </ActionLink>
            <ActionLink to="/insights/client" tone="secondary">
              <BriefcaseBusiness size={16} />
              Open client insight dashboard
            </ActionLink>
            <ActionLink to="/lookup/search" tone="secondary">
              <Search size={16} />
              Run advisory lookup
            </ActionLink>
            <ActionLink to="/portal" tone="secondary">
              <BriefcaseBusiness size={16} />
              Open client portal
            </ActionLink>
            <ActionLink to="/sector/overview" tone="secondary">
              <TrendingUp size={16} />
              Open sector briefing
            </ActionLink>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                const nextScenario = getDefaultScenarioForClient(state.selectedClientId);
                dispatch({ type: 'FOCUS_SCENARIO', scenarioId: nextScenario.id });
              }}
            >
              Re-sync selected client context
              <ArrowUpRight size={16} />
            </button>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
