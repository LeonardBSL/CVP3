import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DiagnosticModule from '../pages/portal/modules/DiagnosticModule';

describe('DiagnosticModule', () => {
  it('renders the four KPI tiles and overall rating on the card', () => {
    render(<DiagnosticModule />);
    expect(screen.getByText('Debtor Days')).toBeInTheDocument();
    expect(screen.getByText('Cash Conv. Cycle')).toBeInTheDocument();
    expect(screen.getByText(/Overall: Healthy/i)).toBeInTheDocument();
  });

  it('opens the modal with the executive summary, metric trends, and interpretations', () => {
    render(<DiagnosticModule />);
    fireEvent.click(screen.getByRole('button', { name: /business performance diagnostic/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Executive Summary')).toBeInTheDocument();
    expect(within(dialog).getByText(/strong Q1 working-capital performance/i)).toBeInTheDocument();
    expect(within(dialog).getAllByText('Interpretation').length).toBe(4);
  });
});
