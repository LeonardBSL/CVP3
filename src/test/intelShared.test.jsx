import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import IntelModal from '../components/intel/IntelModal';
import SignalStrip from '../components/intel/SignalStrip';

const signals = [
  { id: 's1', sourceType: 'competitor', headline: 'Loyalty launch', impactDirection: 'watch', impactLabel: '↑ Leading indicator' },
  { id: 's2', sourceType: 'kb', headline: 'Contact cadence below threshold', impactDirection: 'watch', impactLabel: 'Below threshold' },
];

describe('SignalStrip', () => {
  it('renders one chip per signal with source label and impact', () => {
    render(<SignalStrip signals={signals} />);
    expect(screen.getByText('Competitor')).toBeInTheDocument();
    expect(screen.getByText('KB')).toBeInTheDocument();
    expect(screen.getByText('Loyalty launch')).toBeInTheDocument();
    expect(screen.getByText('↑ Leading indicator')).toBeInTheDocument();
  });
});

describe('IntelModal', () => {
  it('renders title and children when open', () => {
    render(
      <IntelModal open title="Health Score" subtitle="Nkosi · AI-generated" onClose={() => {}}>
        <p>Modal body content</p>
      </IntelModal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Health Score')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(<IntelModal open={false} title="Health Score" onClose={() => {}}><p>Hidden</p></IntelModal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<IntelModal open title="X" onClose={onClose}><p>Body</p></IntelModal>);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<IntelModal open title="X" onClose={onClose}><p>Body</p></IntelModal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
