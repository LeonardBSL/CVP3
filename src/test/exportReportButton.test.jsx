import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const toBlob = vi.fn(() => Promise.resolve(new Blob(['pdf'], { type: 'application/pdf' })));
vi.mock('@react-pdf/renderer', () => ({ pdf: () => ({ toBlob }) }));

import ExportReportButton from '../components/report/ExportReportButton';

describe('ExportReportButton', () => {
  it('generates a PDF blob and triggers a download on click', async () => {
    const user = userEvent.setup();
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<ExportReportButton document={<div />} fileName="Absa-Test.pdf" label="Download report" />);
    await user.click(screen.getByRole('button', { name: /download report/i }));

    expect(toBlob).toHaveBeenCalled();
    expect(createUrl).toHaveBeenCalled();
  });
});
