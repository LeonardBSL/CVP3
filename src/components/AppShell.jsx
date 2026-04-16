import { BellRing, BriefcaseBusiness, Building2, LayoutDashboard, Search, Settings2, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import absaLogo from '../assets/absa-logo.png';
import { clients, getClientById, getScenarioById, scenarioTriggerMap } from '../data/demoData';
import { useDemoState } from '../state/DemoStateProvider';
import { StatusPill, ToastStack } from './UI';

const navigationItems = [
  { label: 'Dashboard', description: 'RM command centre', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Client portal', description: 'Client history and notes', to: '/portal', icon: Building2 },
  { label: 'Advisory engagement', description: 'Signal to outreach', to: '/engagement/alert/alert-growth-retail', icon: BellRing },
  { label: 'Insight delivery', description: 'Client-ready packaging', to: '/insights/client', icon: BriefcaseBusiness },
  { label: 'Advisory lookup', description: 'On-demand intelligence', to: '/lookup/search', icon: Search },
  { label: 'Sector briefing', description: 'Macro to client relevance', to: '/sector/overview', icon: TrendingUp },
];

export default function AppShell({ children }) {
  const location = useLocation();
  const { state, dispatch } = useDemoState();
  const client = getClientById(state.selectedClientId);
  const scenario = getScenarioById(state.activeScenarioId);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="app-shell">
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
              return (
                <NavLink key={item.label} className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab--active' : ''}`} to={item.to}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="topbar-group topbar-group--header">
            <button type="button" className="button button--ghost settings-trigger" onClick={() => setSettingsOpen(true)}>
              <Settings2 size={16} />
              Workspace settings
            </button>
          </div>
        </div>
      </header>

      <div className="workspace">
        <main className={`content-frame ${location.pathname !== '/dashboard' ? 'content-frame--nested' : ''}`}>{children}</main>

        <ToastStack toasts={state.toasts} onDismiss={toastId => dispatch({ type: 'DISMISS_TOAST', toastId })} />
      </div>

      {settingsOpen ? (
        <div className="overlay-backdrop settings-backdrop">
          <div className="overlay-card settings-panel" role="dialog" aria-modal="true" aria-label="Workspace settings">
            <div className="overlay-header">
              <div>
                <p className="eyebrow">Workspace settings</p>
                <h3>Client and scenario controls</h3>
                <p>Adjust the active client context and trigger the scripted demo signals when needed.</p>
              </div>
              <button type="button" className="button button--ghost settings-close" onClick={() => setSettingsOpen(false)} aria-label="Close workspace settings">
                <X size={16} />
                Close
              </button>
            </div>

            <div className="settings-grid">
              <section className="settings-section">
                <label className="topbar-field">
                  <span>Client</span>
                  <select aria-label="Select client" value={state.selectedClientId} onChange={event => dispatch({ type: 'SELECT_CLIENT', clientId: event.target.value })}>
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
      ) : null}
    </div>
  );
}
