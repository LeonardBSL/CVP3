import { Font } from '@react-pdf/renderer';
import poppins600 from '@fontsource/poppins/files/poppins-latin-600-normal.woff?url';
import poppins700 from '@fontsource/poppins/files/poppins-latin-700-normal.woff?url';
import manrope400 from '@fontsource/manrope/files/manrope-latin-400-normal.woff?url';
import manrope600 from '@fontsource/manrope/files/manrope-latin-600-normal.woff?url';

let registered = false;

export function registerReportFonts() {
  if (registered) return;
  Font.register({ family: 'Poppins', fonts: [
    { src: poppins600, fontWeight: 600 },
    { src: poppins700, fontWeight: 700 },
  ] });
  Font.register({ family: 'Manrope', fonts: [
    { src: manrope400, fontWeight: 400 },
    { src: manrope600, fontWeight: 600 },
  ] });
  registered = true;
}

export const brand = {
  accent: '#c00030',
  accentDark: '#98002e',
  accentSoft: '#fae6eb',
  text: '#111827',
  textMuted: '#4b5563',
  textSubtle: '#6b7280',
  line: '#dde1e7',
  surface: '#ffffff',
};
