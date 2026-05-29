import { describe, expect, it } from 'vitest';
import { sourceBadgeClass, sourceLabel, impactClass } from '../components/intel/intelFormat';

describe('intelFormat', () => {
  it('maps source types to badge classes', () => {
    expect(sourceBadgeClass('sens')).toBe('intel-src--sens');
    expect(sourceBadgeClass('competitor')).toBe('intel-src--competitor');
    expect(sourceBadgeClass('unknown')).toBe('intel-src--press');
  });

  it('maps source types to human labels', () => {
    expect(sourceLabel('sens')).toBe('JSE SENS');
    expect(sourceLabel('kb')).toBe('KB');
    expect(sourceLabel('regulatory')).toBe('Regulatory');
  });

  it('maps impact directions to text classes', () => {
    expect(impactClass('up')).toBe('intel-impact--up');
    expect(impactClass('watch')).toBe('intel-impact--watch');
    expect(impactClass('context')).toBe('intel-impact--context');
    expect(impactClass('anything-else')).toBe('intel-impact--context');
  });
});
