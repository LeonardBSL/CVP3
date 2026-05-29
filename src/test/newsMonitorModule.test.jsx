import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NewsMonitorModule from '../pages/portal/modules/NewsMonitorModule';

describe('NewsMonitorModule', () => {
  it('renders the live feed counts and top headlines on the card', () => {
    render(<NewsMonitorModule />);
    expect(screen.getByText('Live Feed')).toBeInTheDocument();
    expect(screen.getAllByText('Act Now').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pick n Pay launches expanded Smart Shopper/i).length).toBeGreaterThan(0);
  });

  it('opens the modal with the AI daily brief and relevance assessments', () => {
    render(<NewsMonitorModule />);
    fireEvent.click(screen.getByRole('button', { name: /external news & event monitor/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('AI Daily Brief')).toBeInTheDocument();
    expect(within(dialog).getAllByText('AI Relevance Assessment').length).toBeGreaterThan(0);
    expect(within(dialog).getByText(/8% across-the-board price increase/i)).toBeInTheDocument();
  });
});
