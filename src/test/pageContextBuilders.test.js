import { describe, expect, it } from 'vitest';
import { createBaseState } from '../state/demoState';
import { buildMeetingBrief, getReportDate, getViewContext } from '../pages/pageContext';

describe('buildMeetingBrief', () => {
  it('builds a five-section brief from the insight pack without a lookupResponse', () => {
    const ctx = getViewContext(createBaseState());
    const brief = buildMeetingBrief(ctx);

    expect(brief.title).toBe('Pre-meeting brief');
    expect(brief.summary).toBe(ctx.insight.whyItMatters);
    expect(brief.sections.map(section => section.id)).toEqual([
      'executive-summary',
      'key-developments',
      'risks-watchpoints',
      'opportunities',
      'recommended-talking-points',
    ]);
    expect(brief.sourceIds).toEqual(ctx.insight.sourceIds);
  });

  it('honors overrides supplied by the lookup path', () => {
    const ctx = getViewContext(createBaseState());
    const brief = buildMeetingBrief(ctx, { summary: 'OVERRIDE', sourceIds: ['x'] });

    expect(brief.summary).toBe('OVERRIDE');
    expect(brief.sourceIds).toEqual(['x']);
  });
});

describe('getReportDate', () => {
  it('formats a human label and a compact filename stamp from a given date', () => {
    const { label, stamp } = getReportDate(new Date('2026-06-01T09:00:00Z'));

    expect(label).toBe('1 June 2026');
    expect(stamp).toBe('20260601');
  });
});
