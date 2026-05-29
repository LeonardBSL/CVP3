import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './testUtils';

describe('Client Portal tabs', () => {
  it('shows the Intelligence Dashboard by default', () => {
    renderApp('/portal');
    expect(screen.getByRole('button', { name: /relationship health score/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /general notes/i })).not.toBeInTheDocument();
  });

  it('switches to Notes & Records when the tab is clicked', () => {
    renderApp('/portal');
    fireEvent.click(screen.getByRole('tab', { name: /notes & records/i }));
    expect(screen.getByRole('heading', { name: /general notes/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /relationship health score/i })).not.toBeInTheDocument();
  });

  it('switches back to the Intelligence Dashboard', () => {
    renderApp('/portal');
    fireEvent.click(screen.getByRole('tab', { name: /notes & records/i }));
    fireEvent.click(screen.getByRole('tab', { name: /intelligence dashboard/i }));
    expect(screen.getByRole('button', { name: /relationship health score/i })).toBeInTheDocument();
  });
});
