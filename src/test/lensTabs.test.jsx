import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import LensTabs from '../components/engagement/LensTabs';

const lenses = {
  strategic: { title: 'Strategic lens', summary: 's', sections: [{ id: 'a', title: 'Strategic thesis', type: 'paragraph', body: 'STRAT BODY' }], sourceIds: [] },
  financial: { title: 'Revenue opportunity scan', summary: 'f', sections: [{ id: 'b', title: 'Opportunity summary', type: 'bullets', items: ['FIN ITEM'] }], sourceIds: [] },
  risk: { title: 'Client risk assessment', summary: 'r', sections: [{ id: 'c', title: 'Risk overview', type: 'paragraph', body: 'RISK BODY' }], sourceIds: [] },
  regulatory: { title: 'Regulatory lens', summary: 'g', sections: [{ id: 'd', title: 'Regulatory context', type: 'paragraph', body: 'REG BODY' }], sourceIds: [] },
};

describe('LensTabs', () => {
  it('shows the first lens by default and switches on click', async () => {
    const user = userEvent.setup();
    render(<LensTabs lenses={lenses} />);

    expect(screen.getByText('STRAT BODY')).toBeInTheDocument();
    expect(screen.queryByText('REG BODY')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /regulatory/i }));

    expect(screen.getByText('REG BODY')).toBeInTheDocument();
    expect(screen.queryByText('STRAT BODY')).not.toBeInTheDocument();
  });

  it('toggles aria-selected when switching tabs', async () => {
    const user = userEvent.setup();
    render(<LensTabs lenses={lenses} />);

    const strategicTab = screen.getByRole('tab', { name: /strategic/i });
    const financialTab = screen.getByRole('tab', { name: /financial/i });

    expect(strategicTab).toHaveAttribute('aria-selected', 'true');
    expect(financialTab).toHaveAttribute('aria-selected', 'false');

    await user.click(financialTab);

    expect(strategicTab).toHaveAttribute('aria-selected', 'false');
    expect(financialTab).toHaveAttribute('aria-selected', 'true');
  });

  it('moves focus and selection with ArrowRight and ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<LensTabs lenses={lenses} />);

    const strategicTab = screen.getByRole('tab', { name: /strategic/i });
    const financialTab = screen.getByRole('tab', { name: /financial/i });

    strategicTab.focus();
    await user.keyboard('{ArrowRight}');

    expect(financialTab).toHaveAttribute('aria-selected', 'true');
    expect(financialTab).toHaveFocus();

    await user.keyboard('{ArrowLeft}');

    expect(strategicTab).toHaveAttribute('aria-selected', 'true');
    expect(strategicTab).toHaveFocus();
  });
});
