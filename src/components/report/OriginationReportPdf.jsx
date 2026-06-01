import { StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';
import { ReportPresentation } from './ReportSections';
import { brand } from './pdfTheme';

const styles = StyleSheet.create({
  lensTitle: { fontFamily: 'Poppins', fontWeight: 700, fontSize: 13, color: brand.text, marginTop: 14 },
});

const LENS_ORDER = ['strategic', 'financial', 'risk', 'regulatory'];

export default function OriginationReportPdf({ lenses, client, date }) {
  return (
    <PdfLayout reportType="Deal Origination Report" client={client} date={date}>
      {LENS_ORDER.filter(key => lenses[key]).map(key => (
        <View key={key}>
          <Text style={styles.lensTitle}>{lenses[key].title}</Text>
          <ReportPresentation presentation={lenses[key]} />
        </View>
      ))}
    </PdfLayout>
  );
}
