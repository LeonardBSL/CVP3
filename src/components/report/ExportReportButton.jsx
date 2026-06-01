import { Download } from 'lucide-react';
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';

export default function ExportReportButton({ document: doc, fileName, label = 'Download PDF report' }) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="button button--ghost" onClick={handleClick} disabled={busy}>
      <Download size={16} />
      {busy ? 'Preparing…' : label}
    </button>
  );
}
