const SOURCE_BADGE = {
  sens: 'intel-src--sens',
  press: 'intel-src--press',
  kb: 'intel-src--kb',
  supplier: 'intel-src--supplier',
  competitor: 'intel-src--competitor',
  regulatory: 'intel-src--regulatory',
};

const SOURCE_LABEL = {
  sens: 'JSE SENS',
  press: 'Press',
  kb: 'KB',
  supplier: 'Supplier',
  competitor: 'Competitor',
  regulatory: 'Regulatory',
};

const IMPACT_CLASS = {
  up: 'intel-impact--up',
  watch: 'intel-impact--watch',
  context: 'intel-impact--context',
};

export function sourceBadgeClass(sourceType) {
  return SOURCE_BADGE[sourceType] ?? 'intel-src--press';
}

export function sourceLabel(sourceType) {
  return SOURCE_LABEL[sourceType] ?? 'Press';
}

export function impactClass(direction) {
  return IMPACT_CLASS[direction] ?? 'intel-impact--context';
}
