import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './testUtils';

describe('insight interactions', () => {
  it('shows a source tooltip and highlights the linked paragraph on hover', async () => {
    const user = userEvent.setup();
    renderApp('/engagement/insight');

    const sourceButton = screen.getByRole('button', { name: 'Source 1.1' });
    const paragraph = screen.getByText(/The latest transactional extract shows merchant settlements up 18%/i).closest('article');

    await user.hover(sourceButton);

    expect(screen.getByRole('tooltip')).toHaveTextContent(/Merchant settlement extract/i);
    expect(paragraph).toHaveClass('llm-response__paragraph--active');
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

    expect(screen.getByRole('heading', { name: 'Client portal' })).toBeInTheDocument();
    expect(screen.getByText(/Insight-specific note from the journey\./i)).toBeInTheDocument();
  });

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
  });
});
