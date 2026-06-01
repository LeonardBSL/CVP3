import { describe, expect, it } from 'vitest';
import { createBaseState } from '../state/demoState';
import { buildOriginationLenses, getViewContext } from '../pages/pageContext';

describe('buildOriginationLenses', () => {
  it('returns four lenses each with a title and non-empty sections', () => {
    const ctx = getViewContext(createBaseState());
    const lenses = buildOriginationLenses(ctx);

    expect(Object.keys(lenses)).toEqual(['strategic', 'financial', 'risk', 'regulatory']);
    for (const key of Object.keys(lenses)) {
      expect(lenses[key].title).toBeTruthy();
      expect(lenses[key].sections.length).toBeGreaterThan(0);
      expect(Array.isArray(lenses[key].sourceIds)).toBe(true);
    }
  });
});
