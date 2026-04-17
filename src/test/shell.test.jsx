import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './testUtils';

describe('shell switching', () => {
  it('uses the relationship shell on dashboard, portal, engagement, insight, lookup, and sector routes', () => {
    const dashboardView = renderApp('/dashboard');
    expect(screen.getByTestId('relationship-shell')).toBeInTheDocument();

    dashboardView.unmount();

    const portalView = renderApp('/portal');
    expect(screen.getByTestId('relationship-shell')).toBeInTheDocument();

    portalView.unmount();

    const engagementView = renderApp('/engagement/insight');
    expect(screen.getByTestId('relationship-shell')).toBeInTheDocument();
    engagementView.unmount();

    const insightView = renderApp('/insights/client');
    expect(screen.getByTestId('relationship-shell')).toBeInTheDocument();
    insightView.unmount();

    const sectorView = renderApp('/sector/overview');
    expect(screen.getByTestId('relationship-shell')).toBeInTheDocument();
    sectorView.unmount();

    renderApp('/lookup/search');
    expect(screen.getByTestId('relationship-shell')).toBeInTheDocument();
  });

  it('does not fall back to the legacy shell on redesigned sector routes', () => {
    renderApp('/sector/overview');

    expect(screen.getByTestId('relationship-shell')).toBeInTheDocument();
    expect(screen.queryByTestId('legacy-shell')).not.toBeInTheDocument();
  });
});
