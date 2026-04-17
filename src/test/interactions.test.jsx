import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './testUtils';

describe('insight interactions', () => {
  it('shows a transaction citation tooltip and highlights the linked text span on hover', async () => {
    const user = userEvent.setup();
    renderApp('/engagement/insight');

    const citationMarker = screen.getAllByRole('button', { name: /Citation 1: Merchant settlement extract/i })[0];
    const citedSpan = screen
      .getAllByText(/The model is reading the client account, collections, and cash-flow data alongside/i)
      .find(node => node.classList.contains('rich-response__segment'));

    await user.hover(citationMarker);

    expect(screen.getByRole('tooltip')).toHaveTextContent(/Merchant settlement extract/i);
    expect(screen.getByRole('tooltip')).toHaveTextContent(/Last 90 days of merchant settlements/i);
    expect(citedSpan).toHaveClass('rich-response__segment--active');
  });

  it('opens and closes the source document modal from a KB citation', async () => {
    const user = userEvent.setup();
    renderApp('/engagement/insight');

    const citationMarker = screen.getAllByRole('button', { name: /Citation 3: Winning the SME Segment: Niche offering/i })[0];

    await user.hover(citationMarker);
    expect(screen.getByRole('tooltip')).toHaveTextContent(/segment-specific proposition/i);

    await user.click(citationMarker);

    expect(await screen.findByRole('dialog', { name: /Source document viewer/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Winning the SME Segment: Niche offering/i })).toBeInTheDocument();
    expect(screen.getByText(/^Winning the SME Segment$/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download document/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Close source document viewer/i }));
    expect(screen.queryByRole('dialog', { name: /Source document viewer/i })).not.toBeInTheDocument();
  });

  it('does not open the source document modal for transaction citations', async () => {
    const user = userEvent.setup();
    renderApp('/engagement/insight');

    await user.click(screen.getAllByRole('button', { name: /Citation 1: Merchant settlement extract/i })[0]);

    expect(screen.queryByRole('dialog', { name: /Source document viewer/i })).not.toBeInTheDocument();
  });

  it('opens and closes the bundle review modal from the engagement insight step', async () => {
    const user = userEvent.setup();
    renderApp('/engagement/insight');

    await user.click(screen.getByRole('button', { name: /Review bundle/i }));
    expect(screen.getByRole('dialog', { name: /Review bundle/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Close review bundle/i }));
    expect(screen.queryByRole('dialog', { name: /Review bundle/i })).not.toBeInTheDocument();
  });

  it('captures an insight note from the insight journey and shows it in the portal', async () => {
    const user = userEvent.setup();
    renderApp('/insights/insight');

    await user.click(screen.getByRole('button', { name: /Add internal note/i }));
    expect(screen.getByRole('dialog', { name: /Add internal note/i })).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /Internal note text/i }), 'Insight-specific note from the journey.');
    await user.click(screen.getByRole('button', { name: /Save note/i }));
    await user.click(screen.getByRole('link', { name: /Client portal/i }));

    expect(screen.getByRole('heading', { name: 'Client Portal' })).toBeInTheDocument();
    expect(screen.getByText(/Insight-specific note from the journey\./i)).toBeInTheDocument();
  }, 15000);

  it('captures a general client note from the engagement journey and shows it in the portal', async () => {
    const user = userEvent.setup();
    renderApp('/engagement/alert/alert-growth-retail');

    await user.click(screen.getByRole('button', { name: /Add internal note/i }));
    await user.type(screen.getByRole('textbox', { name: /Internal note text/i }), 'General client note from the engagement journey.');
    await user.selectOptions(screen.getByLabelText(/Note relevance/i), 'general');
    await user.click(screen.getByRole('button', { name: /Save note/i }));
    await user.click(screen.getByRole('link', { name: /Client portal/i }));

    expect(screen.getByText(/General client note from the engagement journey\./i)).toBeInTheDocument();
  });

  it('filters portal insights to shared records only', async () => {
    const user = userEvent.setup();
    renderApp('/portal');

    expect(screen.getByText(/Nkosi Retail Group can expand two additional sites without stretching liquidity\./i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/Insight sharing filter/i), 'shared');

    expect(screen.queryByText(/Nkosi Retail Group can expand two additional sites without stretching liquidity\./i)).not.toBeInTheDocument();
    expect(screen.getByText(/Seasonal trading uplift supported an early working-capital review\./i)).toBeInTheDocument();
  });

  it('reveals expired notes only when show expired is enabled', async () => {
    const user = userEvent.setup();
    renderApp('/portal');

    await user.selectOptions(screen.getByLabelText(/Client portal client/i), 'mahlangu-manufacturing');

    expect(screen.queryByText(/Temporary watch item on delayed receivables has expired/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Show expired/i }));

    expect(screen.getByText(/Temporary watch item on delayed receivables has expired/i)).toBeInTheDocument();
  });

  it('shows dashboard aggregates and opens the highest-priority urgent alert from quick actions', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard');

    expect(screen.getByText('R486m')).toBeInTheDocument();
    expect(screen.getByText('2.4hrs')).toBeInTheDocument();
    expect(screen.getByLabelText(/2 urgent notifications/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Alerts quick action/i }));

    expect(screen.getByRole('heading', { name: 'Advisory Engagement' })).toBeInTheDocument();
    expect(screen.getByText(/Transport margin pressure requires proactive cover/i)).toBeInTheDocument();
  });

  it('starts the advisory journey from the active dashboard alert', async () => {
    const user = userEvent.setup();
    renderApp('/dashboard');

    await user.click(screen.getByRole('button', { name: /Start Advisory Journey/i }));

    expect(screen.getByRole('heading', { name: 'Advisory Engagement' })).toBeInTheDocument();
    expect(screen.getByText(/Expansion capacity signal detected/i)).toBeInTheDocument();
  });

  it('routes portal notifications back to the dashboard priority alerts section', async () => {
    const user = userEvent.setup();
    renderApp('/portal');

    await user.click(screen.getByRole('button', { name: /Notifications/i }));

    expect(await screen.findByRole('heading', { name: 'Relationship Intelligence' })).toBeInTheDocument();
    await waitFor(() => expect(document.getElementById('priority-alerts')).toHaveFocus());
  });

  it('loads more portal insights on demand', async () => {
    const user = userEvent.setup();
    renderApp('/portal');

    expect(screen.queryByText(/Seasonal trading uplift supported an early working-capital review\./i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Load more insights/i }));

    expect(screen.getByText(/Seasonal trading uplift supported an early working-capital review\./i)).toBeInTheDocument();
  });

  it('edits a general note directly in the portal', async () => {
    const user = userEvent.setup();
    renderApp('/portal');

    await user.click(screen.getAllByRole('button', { name: /Edit note/i })[0]);
    await user.clear(screen.getByRole('textbox', { name: /Internal note text/i }));
    await user.type(screen.getByRole('textbox', { name: /Internal note text/i }), 'Updated portal note.');
    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(screen.getByText(/Updated portal note\./i)).toBeInTheDocument();
  });

  it('adds insight and engagement notes directly in the portal', async () => {
    const user = userEvent.setup();
    renderApp('/portal');

    await user.click(screen.getAllByRole('button', { name: /Add insight note/i })[0]);
    await user.type(screen.getByRole('textbox', { name: /Internal note text/i }), 'Portal insight note.');
    await user.click(screen.getByRole('button', { name: /Save insight note/i }));
    expect(screen.getByText(/Portal insight note\./i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Toggle engagement Email Email drafted/i }));

    await user.click(screen.getByRole('button', { name: /Add pre-engagement note/i }));
    await user.type(screen.getByRole('textbox', { name: /Internal note text/i }), 'Portal pre-engagement note.');
    await user.click(screen.getByRole('button', { name: /Save pre-engagement note/i }));
    expect(screen.getByText(/Portal pre-engagement note\./i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Add post-engagement note/i }));
    await user.type(screen.getByRole('textbox', { name: /Internal note text/i }), 'Portal post-engagement note.');
    await user.click(screen.getByRole('button', { name: /Save post-engagement note/i }));
    expect(screen.getByText(/Portal post-engagement note\./i)).toBeInTheDocument();
  });

  it('keeps internal notes out of delivery preview and presentation output', async () => {
    const user = userEvent.setup();
    renderApp('/insights/delivery');
    const noteText = 'Internal note that must not reach the client.';

    await user.click(screen.getByRole('button', { name: /Add internal note/i }));
    await user.type(screen.getByRole('textbox', { name: /Internal note text/i }), noteText);
    await user.click(screen.getByRole('button', { name: /Save note/i }));

    expect(screen.queryByText(noteText)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Present$/i }));
    expect(screen.queryByText(noteText)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Close$/i }));
    await user.click(screen.getByRole('button', { name: /^Send$/i }));

    expect(screen.queryByText(noteText)).not.toBeInTheDocument();
  }, 15000);

  it('shows the build agent placeholder without making it selectable', () => {
    renderApp('/lookup/search');

    expect(screen.getByText(/^Build agent$/i)).toBeInTheDocument();
    expect(screen.getByText(/Coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Build agent$/i })).not.toBeInTheDocument();
  });
});
