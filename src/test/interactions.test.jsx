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
});
