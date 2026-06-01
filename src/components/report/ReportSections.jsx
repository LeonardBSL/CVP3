import { StyleSheet, Text, View } from '@react-pdf/renderer';
import { brand } from './pdfTheme';

const styles = StyleSheet.create({
  section: { marginTop: 12 },
  heading: { fontFamily: 'Poppins', fontWeight: 600, fontSize: 12, color: brand.accentDark, marginBottom: 4 },
  summary: { color: brand.textMuted, marginBottom: 6 },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  dot: { width: 10, color: brand.accent },
  kv: { marginBottom: 4 },
  kvLabel: { fontFamily: 'Manrope', fontWeight: 600 },
  card: { borderWidth: 1, borderColor: brand.line, borderRadius: 4, padding: 6, marginBottom: 4 },
  cardTitle: { fontFamily: 'Manrope', fontWeight: 600 },
  meta: { color: brand.textSubtle, fontSize: 8, marginTop: 2 },
  para: { marginBottom: 4 },
});

function formatMeta(meta) {
  if (!meta) return null;
  return Array.isArray(meta) ? meta.join(' | ') : meta;
}

function SectionBody({ section }) {
  if (section.type === 'paragraph') return <Text style={styles.para}>{section.body}</Text>;
  if (section.type === 'bullets') {
    return section.items.map((item, index) => (
      <View key={index} style={styles.bullet}><Text style={styles.dot}>•</Text><Text>{item}</Text></View>
    ));
  }
  if (section.type === 'key-value') {
    return section.items.map((item, index) => (
      <Text key={index} style={styles.kv}><Text style={styles.kvLabel}>{item.label}: </Text>{item.value}</Text>
    ));
  }
  if (section.type === 'cards') {
    return section.items.map((item, index) => (
      <View key={index} style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text>{item.body}</Text>
        {item.meta ? <Text style={styles.meta}>{formatMeta(item.meta)}</Text> : null}
      </View>
    ));
  }
  return null;
}

export function ReportPresentation({ presentation }) {
  return (
    <View>
      {presentation.summary ? <Text style={styles.summary}>{presentation.summary}</Text> : null}
      {presentation.sections.map(section => (
        <View key={section.id} style={styles.section} wrap={false}>
          <Text style={styles.heading}>{section.title}</Text>
          <SectionBody section={section} />
        </View>
      ))}
    </View>
  );
}
