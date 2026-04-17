import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './testUtils';

describe('journey walkthroughs', () => {
  it('walks the engagement journey from dashboard alert to confirmation', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard');

    await user.click(screen.getByRole('button', { name: /Expansion capacity signal detected/i }));
    expect(screen.getByRole('heading', { name: 'Advisory Engagement' })).toBeInTheDocument();

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

    expect((await screen.findAllByText(/Translate sector pressure into margin protection/i, {}, { timeout: 3000 })).length).toBeGreaterThan(0);
    await user.type(screen.getByRole('textbox', { name: /Follow-up question/i }), 'What can I recommend to smooth procurement pressure for a manufacturing SME?');
    await user.click(screen.getByRole('button', { name: /^Send$/i }));

    expect((await screen.findAllByText(/Frame the solution as cycle stabilization across payables, receivables, and visibility/i, {}, { timeout: 3000 })).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('link', { name: /Open recommendation output/i }));

    expect(screen.getByRole('heading', { name: 'Advisory Lookup' })).toBeInTheDocument();
    expect(screen.getByText(/Recommended products/i)).toBeInTheDocument();
    expect(screen.getByText(/Working Capital Revolver/i)).toBeInTheDocument();
  }, 15000);

  it('renders the pre-meeting brief preset with specific-client context across response and recommendation views', async () => {
    const user = userEvent.setup();
    renderApp('/lookup/search');

    await user.click(screen.getByRole('button', { name: /Pre-meeting brief/i }));
    await user.click(screen.getByRole('button', { name: /Run lookup/i }));

    expect((await screen.findAllByText(/Executive summary/i, {}, { timeout: 3000 })).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Recommended talking points/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^Client Scope$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Nkosi Retail Group$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Agent$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^Pre-meeting brief$/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('link', { name: /Open recommendation output/i }));

    expect(screen.getAllByText(/Executive summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Recommended talking points/i).length).toBeGreaterThan(0);
  }, 15000);

  it('keeps client filters hidden for knowledge base only and still renders the default scripted lookup output', async () => {
    const user = userEvent.setup();
    renderApp('/lookup/search');

    await user.click(screen.getByRole('radio', { name: /Knowledge base only/i }));
    expect(screen.queryByText(/Selected clients/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Nkosi Retail Group/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /How do I explain the transport sector signal to a logistics client\?/i }));

    expect((await screen.findAllByText(/Translate sector pressure into margin protection/i, {}, { timeout: 3000 })).length).toBeGreaterThan(0);
    expect(screen.getByText(/^Agent$/i)).toBeInTheDocument();
    expect(screen.getByText(/^None$/i)).toBeInTheDocument();
  }, 15000);

  it('renders ranked revenue opportunities in the existing product order', async () => {
    const user = userEvent.setup();
    renderApp('/lookup/search');

    await user.click(screen.getByRole('button', { name: /Revenue opportunity scan/i }));
    await user.click(screen.getByRole('button', { name: /Which pre-approved products fit a growth-ready distributor\?/i }));

    expect((await screen.findAllByText(/Opportunity summary/i, {}, { timeout: 3000 })).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1\. Expansion Term Loan - Site rollout and fit-out funding\./i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2\. Working Capital Buffer - Short-cycle liquidity cover\./i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Product or solution mapping/i).length).toBeGreaterThan(0);
  }, 15000);

  it('renders the client risk assessment preset structure and confidence section', async () => {
    const user = userEvent.setup();
    renderApp('/lookup/search');

    await user.click(screen.getByRole('button', { name: /Client risk assessment/i }));
    await user.click(screen.getByRole('button', { name: /How do I explain the transport sector signal to a logistics client\?/i }));

    expect((await screen.findAllByText(/Risk overview/i, {}, { timeout: 3000 })).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Trend analysis/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Confidence and limitations/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Overall posture: deteriorating\./i).length).toBeGreaterThan(0);
  }, 15000);

  it('walks the sector journey from overview to client relevance', async () => {
    const user = userEvent.setup();
    renderApp('/sector/overview');

    await user.click(screen.getByRole('button', { name: /Transport & Logistics/i }));
    expect(screen.getByRole('heading', { name: 'Sector Briefing' })).toBeInTheDocument();
    expect(screen.getByText(/Sector deep dive/i)).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Map to client/i }));
    expect(screen.getByRole('heading', { name: 'Sector Briefing' })).toBeInTheDocument();
    expect(screen.getByText(/Client relevance mapping/i)).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Move into advisory engagement/i }));
    expect(screen.getByRole('heading', { name: 'Advisory Engagement' })).toBeInTheDocument();
  }, 15000);
});
