import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MilestonesModule from '../pages/portal/modules/MilestonesModule';

describe('MilestonesModule', () => {
  it('renders milestone names and day labels on the card', () => {
    render(<MilestonesModule />);
    expect(screen.getByText('Financial Year-End')).toBeInTheDocument();
    expect(screen.getByText('42 days')).toBeInTheDocument();
    expect(screen.getByText('CIPC Director Change')).toBeInTheDocument();
  });

  it('opens the modal showing what-it-is, why-it-matters, and RM context per milestone', () => {
    render(<MilestonesModule />);
    fireEvent.click(screen.getByRole('button', { name: /lifecycle milestones/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText(/What it is/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/RM Conversation Context/).length).toBeGreaterThan(0);
    expect(screen.getByText(/financial year ends 10 July 2026/i)).toBeInTheDocument();
  });
});
