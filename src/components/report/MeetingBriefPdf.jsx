import PdfLayout from './PdfLayout';
import { ReportPresentation } from './ReportSections';

export default function MeetingBriefPdf({ brief, client, date }) {
  return (
    <PdfLayout reportType="Meeting Brief" client={client} date={date}>
      <ReportPresentation presentation={brief} />
    </PdfLayout>
  );
}
