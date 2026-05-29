import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BenchmarkingModule from '../pages/portal/modules/BenchmarkingModule';

describe('BenchmarkingModule', () => {
  it('renders the peer group tag and one metric per preview category on the card', () => {
    render(<BenchmarkingModule />);
    expect(screen.getByText(/n=34/)).toBeInTheDocument();
    expect(screen.getByText('Revenue Growth (YoY)')).toBeInTheDocument();
    expect(screen.getByText('Cash Conversion Cycle')).toBeInTheDocument();
  });

  it('opens the modal with the methodology panel and all four categories', () => {
    render(<BenchmarkingModule />);
    fireEvent.click(screen.getByRole('button', { name: /peer benchmarking/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Peer Group Methodology')).toBeInTheDocument();
    expect(within(dialog).getByText('Banking Behaviour')).toBeInTheDocument();
    expect(within(dialog).getByText('Growth Indicators')).toBeInTheDocument();
    expect(within(dialog).getByText(/k-anonymity/)).toBeInTheDocument();
  });
});
