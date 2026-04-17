import {
  ArrowRight,
  CircleAlert,
  Clock3,
  DollarSign,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StatusPill } from '../components/UI';
import { getClientById } from '../data/demoData';
import { useDemoState } from '../state/DemoStateProvider';
import { getDashboardPresentation } from './pageContext';

const severityOrder = {
  critical: 0,
  warning: 1,
  positive: 2,
};

function sortDashboardAlerts(left, right) {
  const severityDelta = (severityOrder[left.severity] ?? 99) - (severityOrder[right.severity] ?? 99);
  if (severityDelta !== 0) {
    return severityDelta;
  }

  return right.confidence - left.confidence;
}

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useDemoState();
  const {
    activeAlert,
    client,
    scenario,
    totalPortfolioLabel,
    activeClientsCount,
    urgentAlertCount,
    avgResponseLabel,
    highestUrgentAlert,
  } = getDashboardPresentation(state);

  const priorityAlerts = [...state.alerts].sort(sortDashboardAlerts);

  useEffect(() => {
    if (location.hash !== '#priority-alerts') {
      return;
    }

    const section = document.getElementById('priority-alerts');
    if (!section) {
      return;
    }

    requestAnimationFrame(() => {
      section.scrollIntoView?.({ block: 'start' });
      section.focus();
    });
  }, [location.hash]);

  function openAlert(alert) {
    if (!alert) {
      return;
    }

    dispatch({ type: 'OPEN_ALERT', alertId: alert.id });
    navigate(`/engagement/alert/${alert.id}`);
  }

  const quickActions = [
    {
      label: 'Alerts',
      meta: urgentAlertCount ? `${urgentAlertCount}` : null,
      icon: CircleAlert,
      onClick: () => openAlert(highestUrgentAlert),
    },
    {
      label: 'Insights',
      meta: null,
      icon: Sparkles,
      onClick: () => navigate('/insights/client'),
    },
    {
      label: 'Clients',
      meta: `${activeClientsCount}`,
      icon: Users,
      onClick: () => navigate('/portal'),
    },
    {
      label: 'Advisory',
      meta: null,
      icon: Target,
      onClick: () => navigate('/engagement/insight'),
    },
  ];

  const metrics = [
    {
      label: 'Total Portfolio',
      value: totalPortfolioLabel,
      meta: '+12.5%',
      icon: DollarSign,
      tone: 'positive',
    },
    {
      label: 'Active Clients',
      value: `${activeClientsCount}`,
      meta: 'All monitored',
      icon: Users,
      tone: 'neutral',
    },
    {
      label: 'Urgent Alerts',
      value: `${urgentAlertCount}`,
      meta: 'High priority',
      icon: CircleAlert,
      tone: 'critical',
    },
    {
      label: 'Avg Response',
      value: avgResponseLabel,
      meta: 'Within SLA',
      icon: Clock3,
      tone: 'warning',
    },
  ];

  return (
    <div className="ri-page dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <h2>Relationship Intelligence</h2>
          <p>Intelligent insights that enable better client conversations and outcomes</p>
        </div>
      </section>

      <section className="ri-panel dashboard-quick-actions">
        <div className="ri-panel__header">
          <div>
            <h3>Quick Actions</h3>
          </div>
        </div>

        <div className="dashboard-quick-actions__grid">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                className="dashboard-action-card"
                onClick={action.onClick}
                aria-label={`${action.label} quick action`}
              >
                <Icon size={32} />
                <strong>{action.label}</strong>
                {action.meta ? <span className="dashboard-action-card__badge">{action.meta}</span> : <span className="dashboard-action-card__spacer" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="dashboard-kpi-grid" aria-label="Dashboard summary metrics">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className={`dashboard-kpi-card dashboard-kpi-card--${metric.tone}`}>
              <Icon size={28} />
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              <p>{metric.meta}</p>
            </article>
          );
        })}
      </section>

      <div className="dashboard-main-grid">
        <section className="ri-panel dashboard-alerts-panel" id="priority-alerts" tabIndex={-1} aria-labelledby="priority-alerts-heading">
          <div className="ri-panel__header">
            <div>
              <h3 id="priority-alerts-heading">Priority Alerts</h3>
            </div>
            {urgentAlertCount ? <span className="dashboard-pill dashboard-pill--critical">{urgentAlertCount} urgent</span> : null}
          </div>

          <div className="dashboard-alerts-list">
            {priorityAlerts.map(alert => {
              const alertClient = getClientById(alert.clientId);
              return (
                <button
                  key={alert.id}
                  type="button"
                  className={`dashboard-priority-alert dashboard-priority-alert--${alert.severity}`}
                  onClick={() => openAlert(alert)}
                >
                  <div className="dashboard-priority-alert__top">
                    <div>
                      <h4>{alert.title}</h4>
                      <p>{alertClient.name}</p>
                    </div>
                    <ArrowRight size={22} />
                  </div>
                  <p>{alert.updatedLabel}</p>
                  <span className="dashboard-priority-alert__tag">
                    {alert.severity === 'critical' ? 'Sector Pressure' : alert.severity === 'warning' ? 'Stress' : 'Growth'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="dashboard-focus-card">
          <span className="dashboard-focus-card__eyebrow">Client in Focus</span>
          <h3>{client.name}</h3>
          <div className="dashboard-focus-card__metric">
            <span>Portfolio Value</span>
            <strong>{client.relationshipValue.replace(' portfolio', '')}</strong>
          </div>
          <div className="dashboard-focus-card__metric">
            <span>Revenue Trend</span>
            <strong className="dashboard-focus-card__trend">
              <TrendingUp size={20} />
              {client.revenueTrend}
            </strong>
          </div>
          <div className="dashboard-focus-card__meta">
            <StatusPill tone={scenario.severity}>{scenario.label}</StatusPill>
            <StatusPill tone="neutral">{client.priorityTag}</StatusPill>
          </div>
          <p>{client.focus}</p>
          {activeAlert ? <p className="dashboard-focus-card__detail">{activeAlert.summary}</p> : null}
        </aside>
      </div>

      <button type="button" className="dashboard-journey-cta" onClick={() => openAlert(activeAlert)}>
        <Sparkles size={26} />
        <span>Start Advisory Journey</span>
        <ArrowRight size={26} />
      </button>
    </div>
  );
}
