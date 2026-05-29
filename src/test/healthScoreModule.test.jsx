import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HealthScoreModule from '../pages/portal/modules/HealthScoreModule';

describe('HealthScoreModule', () => {
  it('renders the score, risk band, and signal rows on the card', () => {
    render(<HealthScoreModule />);
    expect(screen.getByText('74')).toBeInTheDocument();
    expect(screen.getByText('Low Attrition Risk')).toBeInTheDocument();
    expect(screen.getByText('Contact frequency')).toBeInTheDocument();
  });

  it('opens the modal with score breakdown and reasoning when the card is clicked', () => {
    render(<HealthScoreModule />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /relationship health score/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Engagement Activity')).toBeInTheDocument();
    expect(screen.getByText(/placing it in the Low Attrition Risk band/i)).toBeInTheDocument();
    expect(screen.getByText('What the AI is Seeing')).toBeInTheDocument();
  });
});
