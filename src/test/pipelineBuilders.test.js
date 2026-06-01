import { describe, expect, it } from 'vitest';
import { createBaseState } from '../state/demoState';
import { buildMeetingBriefPipeline, buildOriginationPipeline, getViewContext } from '../pages/pageContext';

describe('pipeline builders', () => {
  it('origination pipeline has six agents plus a synthesis node', () => {
    const pipeline = buildOriginationPipeline(getViewContext(createBaseState()));
    expect(pipeline.agents).toHaveLength(6);
    expect(pipeline.synthesis.label).toBeTruthy();
    expect(pipeline.synthesis.contribution).toBeTruthy();
    pipeline.agents.forEach(agent => expect(agent.contribution).toBeTruthy());
  });

  it('meeting brief pipeline has six agents plus a synthesis node', () => {
    const pipeline = buildMeetingBriefPipeline(getViewContext(createBaseState()));
    expect(pipeline.agents).toHaveLength(6);
    expect(pipeline.synthesis.label).toBeTruthy();
    expect(pipeline.synthesis.contribution).toBeTruthy();
    pipeline.agents.forEach(agent => expect(agent.contribution).toBeTruthy());
  });
});
