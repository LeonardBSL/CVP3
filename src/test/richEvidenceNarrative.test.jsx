import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import RichEvidenceNarrative from '../components/RichEvidenceNarrative';

describe('RichEvidenceNarrative', () => {
  it('renders paragraph, bullet, numbered, and table blocks in one continuous response', () => {
    render(
      <RichEvidenceNarrative
        response={{
          title: 'Response',
          blocks: [
            {
              id: 'paragraph-block',
              type: 'paragraph',
              segments: [{ text: 'A paragraph block grounded in client data.', citationIds: ['merchantPulse'] }],
            },
            {
              id: 'bullet-block',
              type: 'bullets',
              items: [
                { id: 'bullet-1', segments: [{ text: 'A bullet point with a KB citation.', citationIds: ['kbWinningNiche'] }] },
                { id: 'bullet-2', segments: [{ text: 'A second bullet point.', citationIds: ['cashCycle'] }] },
              ],
            },
            {
              id: 'numbered-block',
              type: 'numbered',
              items: [
                { id: 'numbered-1', segments: [{ text: 'First numbered step.', citationIds: ['kbCollectionsStrategic'] }] },
                { id: 'numbered-2', segments: [{ text: 'Second numbered step.', citationIds: ['cashCycle'] }] },
              ],
            },
            {
              id: 'table-block',
              type: 'table',
              columns: [
                { id: 'signal', label: 'Signal' },
                { id: 'response', label: 'Response' },
              ],
              rows: [
                {
                  id: 'row-1',
                  cells: [
                    { segments: [{ text: 'Supplier timing is tightening.', citationIds: ['procurementWatch'] }] },
                    { segments: [{ text: 'Add visibility and liquidity support.', citationIds: ['kbCollectionsProcess'] }] },
                  ],
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(screen.getByText(/A paragraph block grounded in client data\./i)).toBeInTheDocument();
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(/Add visibility and liquidity support\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Citation 1: Merchant settlement extract/i })).toBeInTheDocument();
  });
});
