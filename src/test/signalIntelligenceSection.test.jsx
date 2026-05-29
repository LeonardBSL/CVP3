import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SignalIntelligenceSection from '../components/intel/SignalIntelligenceSection';

const signals = [
  {
    id: 'pnp',
    sourceType: 'competitor',
    sourceName: 'Retail Week',
    time: 'Yesterday',
    headline: 'Pick n Pay loyalty launch',
    excerpt: 'Expanded Smart Shopper programme.',
    impactDirection: 'watch',
    impactLabel: 'Competitor activity',
    connectionText: 'This nudges the competitor sub-score toward Watch.',
  },
];

describe('SignalIntelligenceSection', () => {
  it('renders each signal with source, headline, connection text, and synthesis', () => {
    render(<SignalIntelligenceSection signals={signals} synthesis="Two converging risks." />);
    expect(screen.getByText('What the AI is seeing')).toBeInTheDocument();
    expect(screen.getByText('Retail Week')).toBeInTheDocument();
    expect(screen.getByText('Pick n Pay loyalty launch')).toBeInTheDocument();
    expect(screen.getByText(/nudges the competitor sub-score/)).toBeInTheDocument();
    expect(screen.getByText('AI Synthesis')).toBeInTheDocument();
    expect(screen.getByText('Two converging risks.')).toBeInTheDocument();
  });

  it('renders without a synthesis block when none provided', () => {
    render(<SignalIntelligenceSection signals={signals} />);
    expect(screen.queryByText('AI Synthesis')).not.toBeInTheDocument();
  });
});
