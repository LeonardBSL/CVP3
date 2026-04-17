import {
  BellRing,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  Search,
  Settings2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import absaLogo from '../assets/absa-logo.png';
import { clients, getClientById, getScenarioById, scenarioTriggerMap } from '../data/demoData';
import { useDemoState } from '../state/DemoStateProvider';
import { StatusPill, ToastStack } from './UI';

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Client Portal', to: '/portal', icon: Building2 },
  { label: 'Advisory Engagement', to: '/engagement/alert/alert-growth-retail', icon: BellRing },
  { label: 'Insight Delivery', to: '/insights/client', icon: BriefcaseBusiness },
  { label: 'Advisory Lookup', to: '/lookup/search', icon: Search },
  { label: 'Sector Briefing', to: '/sector/overview', icon: TrendingUp },
];

function isSectionActive(pathname, target) {
  if (target === '/dashboard') return pathname === '/dashboard';
  if (target === '/portal') return pathname === '/portal';
  if (target.startsWith('/engagement/')) return pathname.startsWith('/engagement/');
  if (target.startsWith('/insights/')) return pathname.startsWith('/insights/');
  if (target.startsWith('/lookup/')) return pathname.startsWith('/lookup/');
  if (target.startsWith('/sector/')) return pathname.startsWith('/sector/');
  return pathname === target;
}

function SettingsDialog({ client, dispatch, onClose, scenario, selectedClientId }) {
  return (
    <div className="overlay-backdrop settings-backdrop">
      <div className="overlay-card settings-panel" role="dialog" aria-modal="true" aria-label="Workspace settings">
        <div className="overlay-header">
          <div>
            <p className="eyebrow">Workspace settings</p>
            <h3>Client and scenario controls</h3>
            <p>Adjust the active client context and trigger the scripted demo signals when needed.</p>
          </div>
          <button type="button" className="button button--ghost settings-close" onClick={onClose} aria-label="Close workspace settings">
            <X size={16} />
            Close
          </button>
        </div>

        <div className="settings-grid">
          <section className="settings-section">
            <label className="topbar-field">
              <span>Client</span>
              <select aria-label="Select client" value={selectedClientId} onChange={event => dispatch({ type: 'SELECT_CLIENT', clientId: event.target.value })}>
                {clients.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <p className="eyebrow">Active context</p>
              <h4>{client.name}</h4>
              <p>{client.persona}</p>
              <div className="sidebar-status-row">
                <StatusPill tone={scenario.severity}>{scenario.label}</StatusPill>
                <StatusPill tone="neutral">{client.priorityTag}</StatusPill>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <p className="eyebrow">Scenario simulator</p>
            <div className="scenario-controls settings-controls" aria-label="Scenario simulator">
              <button type="button" className="chip-button" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.growth })}>
                Simulate growth signal
              </button>
              <button type="button" className="chip-button" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.liquidity })}>
                Simulate liquidity risk
              </button>
              <button type="button" className="chip-button" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.sector })}>
                Simulate sector disruption
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function LegacyShell({ children, onOpenSettings }) {
  const location = useLocation();

  return (
    <div className="app-shell" data-testid="legacy-shell">
      <header className="shell-header">
        <div className="shell-header-inner">
          <div className="brand-lockup">
            <img className="brand-logo" src={absaLogo} alt="Absa" />
            <div>
              <p className="eyebrow">Absa CVP 3</p>
              <h1>RM Advisory Cockpit</h1>
            </div>
          </div>

        <nav className="primary-nav" aria-label="Primary">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const active = isSectionActive(location.pathname, item.to);
            return (
              <NavLink key={item.label} className={`nav-tab ${active ? 'nav-tab--active' : ''}`} to={item.to}>
                  <Icon size={16} />
                  <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

          <div className="topbar-group topbar-group--header">
            <button type="button" className="button button--ghost settings-trigger" onClick={onOpenSettings}>
              <Settings2 size={16} />
              Workspace settings
            </button>
          </div>
        </div>
      </header>

      <div className="workspace">
        <main className={`content-frame ${location.pathname !== '/dashboard' ? 'content-frame--nested' : ''}`}>{children}</main>
      </div>
    </div>
  );
}

function RelationshipShell({ children, onNotificationsClick, onOpenSettings, urgentAlertCount }) {
  const location = useLocation();

  return (
    <div className="ri-shell" data-testid="relationship-shell">
      <aside className="ri-rail">
        <div className="ri-rail__brand">
          <img className="ri-brand__logo" src={absaLogo} alt="Absa" />
          <div className="ri-brand__copy">
            <p className="ri-brand__title">Relationship Intelligence</p>
            <p>Intelligent insights that enable better client conversations and outcomes</p>
          </div>
        </div>

        <nav className="ri-nav" aria-label="Relationship Intelligence navigation">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const active = isSectionActive(location.pathname, item.to);
            return (
              <NavLink
                key={item.label}
                className={`ri-nav__link ${active ? 'ri-nav__link--active' : ''}`}
                to={item.to}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="ri-rail__footer">
          <button type="button" className="ri-utility-link ri-utility-link--notifications" onClick={onNotificationsClick}>
            <span className="ri-utility-link__body">
              <BellRing size={18} />
              <span>Notifications</span>
            </span>
            <span className="ri-utility-badge" aria-label={`${urgentAlertCount} urgent notifications`}>
              {urgentAlertCount}
            </span>
          </button>

          <button type="button" className="ri-utility-link ri-utility-link--settings" onClick={onOpenSettings}>
            <span className="ri-utility-link__body">
              <Settings2 size={18} />
              <span>Workspace settings</span>
            </span>
          </button>
        </div>
      </aside>

      <div className="ri-shell__workspace">
        <main className="ri-content-frame">{children}</main>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useDemoState();
  const client = getClientById(state.selectedClientId);
  const scenario = getScenarioById(state.activeScenarioId);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const urgentAlertCount = state.alerts.filter(alert => ['warning', 'critical'].includes(alert.severity)).length;
  const usesRelationshipShell =
    location.pathname === '/dashboard' ||
    location.pathname === '/portal' ||
    location.pathname.startsWith('/engagement/') ||
    location.pathname.startsWith('/insights/') ||
    location.pathname.startsWith('/sector/') ||
    location.pathname.startsWith('/lookup/');

  const focusPriorityAlerts = useCallback(() => {
    const section = document.getElementById('priority-alerts');
    if (!section) {
      return;
    }

    section.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
    section.focus();
  }, []);

  function handleNotificationsClick() {
    if (location.pathname === '/dashboard') {
      focusPriorityAlerts();
      return;
    }

    navigate('/dashboard#priority-alerts');
  }

  return (
    <>
      {usesRelationshipShell ? (
        <RelationshipShell
          onNotificationsClick={handleNotificationsClick}
          onOpenSettings={() => setSettingsOpen(true)}
          urgentAlertCount={urgentAlertCount}
        >
          {children}
        </RelationshipShell>
      ) : (
        <LegacyShell onOpenSettings={() => setSettingsOpen(true)}>{children}</LegacyShell>
      )}

      <ToastStack toasts={state.toasts} onDismiss={toastId => dispatch({ type: 'DISMISS_TOAST', toastId })} />

      {settingsOpen ? (
        <SettingsDialog
          client={client}
          dispatch={dispatch}
          onClose={() => setSettingsOpen(false)}
          scenario={scenario}
          selectedClientId={state.selectedClientId}
        />
      ) : null}
    </>
  );
}
