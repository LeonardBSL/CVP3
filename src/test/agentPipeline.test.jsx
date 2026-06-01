import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import AgentPipeline from '../components/engagement/AgentPipeline';

const pipeline = {
  agents: [{ id: 'one', label: 'Agent One', role: 'Does a thing', contribution: 'HIDDEN CONTRIBUTION' }],
  synthesis: { id: 'synthesis', label: 'Final Report', role: 'Combines all inputs', contribution: 'SUMMARY' },
};

describe('AgentPipeline', () => {
  it('hides contributions until an agent row is expanded', async () => {
    const user = userEvent.setup();
    render(<AgentPipeline title="Pipeline" pipeline={pipeline} />);

    expect(screen.getByText('Agent One')).toBeInTheDocument();
    expect(screen.getByText('SUMMARY')).toBeInTheDocument();
    expect(screen.queryByText('HIDDEN CONTRIBUTION')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Agent One/i }));

    expect(screen.getByText('HIDDEN CONTRIBUTION')).toBeInTheDocument();
  });
});
