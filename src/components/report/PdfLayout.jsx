import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import absaLogo from '../../assets/absa-logo.png';
import { brand, registerReportFonts } from './pdfTheme';

registerReportFonts();

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontFamily: 'Manrope', fontSize: 10, color: brand.text },
  header: { backgroundColor: brand.accent, marginHorizontal: -40, marginTop: -36, paddingVertical: 16, paddingHorizontal: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 70 },
  headerMeta: { color: '#ffffff', textAlign: 'right' },
  headerTitle: { fontFamily: 'Poppins', fontWeight: 700, fontSize: 14, color: '#ffffff' },
  subhead: { color: '#ffffff', fontSize: 9, opacity: 0.9 },
  docTitle: { fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: brand.text, marginTop: 20 },
  docMeta: { color: brand.textMuted, marginTop: 4, marginBottom: 8 },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', color: brand.textSubtle, fontSize: 8, borderTopWidth: 1, borderTopColor: brand.line, paddingTop: 6 },
});

export default function PdfLayout({ reportType, client, date, children }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Image src={absaLogo} style={styles.logo} />
          <View style={styles.headerMeta}>
            <Text style={styles.headerTitle}>Client Intelligence Platform</Text>
            <Text style={styles.subhead}>{reportType}</Text>
          </View>
        </View>

        <Text style={styles.docTitle}>{reportType}</Text>
        <Text style={styles.docMeta}>{client} · {date}</Text>

        {children}

        <View style={styles.footer} fixed>
          <Text>Absa CIB · Confidential · For internal advisory use only</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
