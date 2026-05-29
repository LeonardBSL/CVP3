import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import IntelligenceDashboard from '../pages/portal/IntelligenceDashboard';

describe('IntelligenceDashboard', () => {
  it('renders all five module cards in the two-row layout', () => {
    render(<IntelligenceDashboard />);
    expect(screen.getByRole('button', { name: /relationship health score/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lifecycle milestones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /external news & event monitor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /peer benchmarking/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /business performance diagnostic/i })).toBeInTheDocument();
  });
});
