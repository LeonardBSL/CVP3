import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './testUtils';

describe('journey walkthroughs', () => {
  it('walks the engagement journey from dashboard alert to confirmation', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard');

    await user.click(screen.getByRole('button', { name: /Expansion capacity signal detected/i }));
    expect(screen.getByRole('heading', { name: 'Alert detail view' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Review AI recommendation/i }));
    await user.click(screen.getByRole('button', { name: /Review bundle/i }));
    expect(screen.getByRole('dialog', { name: /Review bundle/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Close review bundle/i }));
    expect(screen.queryByRole('dialog', { name: /Review bundle/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /Choose outreach/i }));
    await user.click(screen.getByRole('button', { name: /Confirm outreach/i }));

    expect(screen.getAllByText('Meeting scheduled').length).toBeGreaterThan(0);
  }, 15000);

  it('walks the insight delivery journey from client insight to send action', async () => {
    const user = userEvent.setup();
    renderApp('/insights/client');

    await user.click(screen.getByRole('link', { name: /Open detailed insight/i }));
    await user.click(screen.getByRole('link', { name: /Customize insight/i }));
    await user.click(screen.getByRole('link', { name: /Continue to delivery/i }));
    await user.click(screen.getByRole('button', { name: /^Send$/i }));

    expect(screen.getByText(/Insight sent:/i)).toBeInTheDocument();
  }, 15000);

  it('walks the lookup journey from query to recommendation output', async () => {
    const user = userEvent.setup();
    renderApp('/lookup/search');

    await user.click(screen.getByRole('button', { name: /How do I explain the transport sector signal to a logistics client\?/i }));

    expect(screen.getByText(/Generating response/i)).toBeInTheDocument();

    expect(await screen.findByText(/Translate sector pressure into margin protection/i, {}, { timeout: 3000 })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: /Follow-up question/i }), 'What can I recommend to smooth procurement pressure for a manufacturing SME?');
    await user.click(screen.getByRole('button', { name: /^Send$/i }));

    expect(await screen.findByText(/Frame the solution as cycle stabilization across payables, receivables, and visibility/i, {}, { timeout: 3000 })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /Open recommendation output/i }));

    expect(screen.getByRole('heading', { name: 'Recommendation output' })).toBeInTheDocument();
    expect(screen.getByText(/Working Capital Revolver/i)).toBeInTheDocument();
  }, 15000);

  it('walks the sector journey from overview to client relevance', async () => {
    const user = userEvent.setup();
    renderApp('/sector/overview');

    await user.click(screen.getByRole('button', { name: /Transport & Logistics/i }));
    expect(screen.getByRole('heading', { name: 'Sector deep dive' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Map to client/i }));
    expect(screen.getByRole('heading', { name: 'Client relevance mapping' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Move into advisory engagement/i }));
    expect(screen.getByRole('heading', { name: 'Insight review screen' })).toBeInTheDocument();
  }, 15000);
});
