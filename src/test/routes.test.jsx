import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './testUtils';

describe('route smoke tests', () => {
  it.each([
    ['/dashboard', 'Relationship Intelligence'],
    ['/portal', 'Client Portal'],
    ['/engagement/alert/alert-growth-retail', 'Advisory Engagement'],
    ['/engagement/insight', 'Advisory Engagement'],
    ['/engagement/bundle', 'Advisory Engagement'],
    ['/engagement/customize', 'Advisory Engagement'],
    ['/engagement/outreach', 'Advisory Engagement'],
    ['/engagement/confirm', 'Advisory Engagement'],
    ['/insights/client', 'Insight Delivery'],
    ['/insights/insight', 'Insight Delivery'],
    ['/insights/customize', 'Insight Delivery'],
    ['/insights/benchmarking', 'Insight Delivery'],
    ['/insights/outlook', 'Insight Delivery'],
    ['/insights/delivery', 'Insight Delivery'],
    ['/lookup/search', 'Advisory Lookup'],
    ['/lookup/response', 'Advisory Lookup'],
    ['/lookup/recommendation', 'Advisory Lookup'],
    ['/sector/overview', 'Sector Briefing'],
    ['/sector/deep-dive', 'Sector Briefing'],
    ['/sector/client-relevance', 'Sector Briefing'],
  ])('renders %s', (route, heading) => {
    renderApp(route);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
