import { describe, expect, it } from 'vitest';
import { demoReducer, createBaseState } from '../state/demoState';

describe('demo reducer', () => {
  it('switches client context and scenario together', () => {
    const nextState = demoReducer(createBaseState(), {
      type: 'SELECT_CLIENT',
      clientId: 'mahlangu-manufacturing',
    });

    expect(nextState.selectedClientId).toBe('mahlangu-manufacturing');
    expect(nextState.activeScenarioId).toBe('liquidity-manufacturing');
    expect(nextState.sectorFocus).toBe('manufacturing');
  });

  it('triggers a scenario and updates the inbox and feed', () => {
    const nextState = demoReducer(createBaseState(), {
      type: 'TRIGGER_SCENARIO',
      scenarioId: 'sector-logistics',
    });

    expect(nextState.activeScenarioId).toBe('sector-logistics');
    expect(nextState.alerts[0].scenarioId).toBe('growth-retail');
    expect(nextState.activityFeed[0].title).toBe('Sector disruption simulated');
  });

  it('customizes bundle selection and terms', () => {
    const baseState = createBaseState();
    const toggledState = demoReducer(baseState, {
      type: 'TOGGLE_BUNDLE_PRODUCT',
      scenarioId: 'growth-retail',
      productId: 'merchant-upgrade',
    });
    const termState = demoReducer(toggledState, {
      type: 'SET_PRODUCT_TERM',
      scenarioId: 'growth-retail',
      productId: 'term-loan',
      term: '48 months',
    });

    expect(termState.bundleSelection['growth-retail'].selectedProductIds).not.toContain('merchant-upgrade');
    expect(termState.bundleSelection['growth-retail'].customTerms['term-loan']).toBe('48 months');
  });

  it('edits and resets the client-facing insight draft', () => {
    const editedState = demoReducer(createBaseState(), {
      type: 'SET_INSIGHT_DRAFT',
      scenarioId: 'growth-retail',
      draft: 'Updated client-ready draft.',
    });
    const resetState = demoReducer(editedState, {
      type: 'RESET_INSIGHT_DRAFT',
      scenarioId: 'growth-retail',
    });

    expect(editedState.insightDrafts['growth-retail']).toBe('Updated client-ready draft.');
    expect(resetState.insightDrafts['growth-retail']).toContain('We have reviewed your recent trading flows');
  });

  it('stores lookup chat turns across the conversation', () => {
    const startedState = demoReducer(createBaseState(), {
      type: 'START_LOOKUP',
      query: 'How do I explain the transport sector signal to a logistics client?',
    });
    const completedState = demoReducer(startedState, {
      type: 'COMPLETE_LOOKUP',
      query: 'How do I explain the transport sector signal to a logistics client?',
      responseId: 'lookup-sector-logistics',
    });

    expect(startedState.lookupSession.messages).toHaveLength(1);
    expect(startedState.lookupSession.messages[0]).toMatchObject({ role: 'user' });
    expect(completedState.lookupSession.messages).toHaveLength(2);
    expect(completedState.lookupSession.messages[1]).toMatchObject({ role: 'assistant', responseId: 'lookup-sector-logistics' });
  });

  it('confirms outreach and marks the alert actioned', () => {
    const nextState = demoReducer(
      {
        ...createBaseState(),
        outreachChoice: 'meeting',
      },
      { type: 'CONFIRM_OUTREACH' },
    );

    expect(nextState.alerts.find(alert => alert.scenarioId === 'growth-retail')?.status).toBe('actioned');
    expect(nextState.activityFeed[0].title).toBe('Meeting scheduled');
  });

  it('captures feedback and delivery actions', () => {
    const feedbackState = demoReducer(createBaseState(), {
      type: 'CAPTURE_FEEDBACK',
      contextKey: 'engagement-growth',
      value: 'up',
    });
    const deliveryState = demoReducer(feedbackState, {
      type: 'RECORD_DELIVERY_ACTION',
      mode: 'send',
    });

    expect(deliveryState.feedback['engagement-growth']).toBe('up');
    expect(deliveryState.activityFeed[0].title).toBe('Insight sent');
  });
});
