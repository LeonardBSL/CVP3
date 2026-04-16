import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './testUtils';

describe('route smoke tests', () => {
  it.each([
    ['/dashboard', 'Relationship manager command centre'],
    ['/portal', 'Client portal'],
    ['/engagement/alert/alert-growth-retail', 'Alert detail view'],
    ['/engagement/insight', 'Insight review screen'],
    ['/engagement/bundle', 'Insight review screen'],
    ['/engagement/customize', 'Insight review screen'],
    ['/engagement/outreach', 'Outreach selection screen'],
    ['/engagement/confirm', 'Outreach confirmation'],
    ['/insights/client', 'Client insight summary'],
    ['/insights/insight', 'Detailed insight view'],
    ['/insights/customize', 'Customize insight'],
    ['/insights/benchmarking', 'Detailed insight view'],
    ['/insights/outlook', 'Detailed insight view'],
    ['/insights/delivery', 'Insight delivery screen'],
    ['/lookup/search', 'Lookup search screen'],
    ['/lookup/response', 'AI response screen'],
    ['/lookup/recommendation', 'Recommendation output'],
    ['/sector/overview', 'Sector overview'],
    ['/sector/deep-dive', 'Sector deep dive'],
    ['/sector/client-relevance', 'Client relevance mapping'],
  ])('renders %s', (route, heading) => {
    renderApp(route);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
