import { describe, expect, it } from 'vitest';
import { demoReducer, createBaseState } from '../state/demoState';

function getActiveInsightRecord(state, scenarioId = 'growth-retail') {
  return state.clientPortal.insightRecords.find(record => record.scenarioId === scenarioId && record.isActive);
}

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

  it('stores general notes separately from insight notes', () => {
    const baseState = createBaseState();
    const activeRecord = getActiveInsightRecord(baseState);
    const generalState = demoReducer(baseState, {
      type: 'ADD_PORTAL_NOTE',
      note: {
        clientId: 'nkosi-retail',
        body: 'General note saved from the journey.',
        relevance: 'general',
        durationType: 'permanent',
      },
    });
    const insightState = demoReducer(baseState, {
      type: 'ADD_PORTAL_NOTE',
      note: {
        clientId: 'nkosi-retail',
        body: 'Insight-specific note saved from the journey.',
        relevance: 'insight',
        durationType: 'permanent',
        insightRecordId: activeRecord.id,
      },
    });

    const latestGeneralNoteId = generalState.clientPortal.generalNotes[0];
    const latestInsightNoteId = insightState.clientPortal.insightRecords.find(record => record.id === activeRecord.id)?.noteIds[0];

    expect(generalState.clientPortal.notes[latestGeneralNoteId]).toMatchObject({ relevance: 'general' });
    expect(insightState.clientPortal.notes[latestInsightNoteId]).toMatchObject({ relevance: 'insight', insightRecordId: activeRecord.id });
  });

  it('requires an expiry date for time-constrained notes', () => {
    const baseState = createBaseState();
    const nextState = demoReducer(baseState, {
      type: 'ADD_PORTAL_NOTE',
      note: {
        clientId: 'nkosi-retail',
        body: 'This should be rejected.',
        relevance: 'general',
        durationType: 'time-constrained',
      },
    });

    expect(nextState).toBe(baseState);
  });

  it('marks only send and present delivery actions as shared', () => {
    const baseState = createBaseState();
    const downloadState = demoReducer(baseState, {
      type: 'RECORD_DELIVERY_ACTION',
      mode: 'download',
    });
    const sendState = demoReducer(baseState, {
      type: 'RECORD_DELIVERY_ACTION',
      mode: 'send',
    });
    const presentState = demoReducer(baseState, {
      type: 'RECORD_DELIVERY_ACTION',
      mode: 'present',
    });

    expect(getActiveInsightRecord(downloadState)?.sharedStatus).toBe('unshared');
    expect(getActiveInsightRecord(sendState)?.sharedStatus).toBe('shared');
    expect(getActiveInsightRecord(presentState)?.sharedStatus).toBe('shared');
  });

  it('stores pending pre-engagement notes against the scenario draft', () => {
    const nextState = demoReducer(createBaseState(), {
      type: 'ADD_PENDING_ENGAGEMENT_NOTE',
      scenarioId: 'growth-retail',
      note: {
        clientId: 'nkosi-retail',
        body: 'Prepare the meeting with a rollout focus.',
        relevance: 'general',
        durationType: 'permanent',
      },
    });

    const pendingDraft = nextState.clientPortal.pendingEngagementDrafts['growth-retail'];
    const pendingNote = nextState.clientPortal.notes[pendingDraft.preNoteIds[0]];

    expect(pendingDraft.preNoteIds).toHaveLength(1);
    expect(pendingNote).toMatchObject({ engagementId: null, engagementPhase: 'pre' });
  });

  it('creates an engagement record and attaches pending pre-engagement notes on confirm', () => {
    const preparedState = demoReducer(createBaseState(), {
      type: 'ADD_PENDING_ENGAGEMENT_NOTE',
      scenarioId: 'growth-retail',
      note: {
        clientId: 'nkosi-retail',
        body: 'Prepare the meeting with a rollout focus.',
        relevance: 'general',
        durationType: 'permanent',
      },
    });
    const confirmedState = demoReducer(
      {
        ...preparedState,
        outreachChoice: 'meeting',
      },
      { type: 'CONFIRM_OUTREACH' },
    );

    const latestEngagement = confirmedState.clientPortal.engagements[0];
    const linkedNote = confirmedState.clientPortal.notes[latestEngagement.preNoteIds[0]];

    expect(latestEngagement.scenarioId).toBe('growth-retail');
    expect(latestEngagement.status).toBe('Meeting scheduled');
    expect(linkedNote.engagementId).toBe(latestEngagement.id);
    expect(confirmedState.clientPortal.pendingEngagementDrafts['growth-retail']).toBeUndefined();
  });

  it('attaches post-engagement notes to the selected engagement record', () => {
    const confirmedState = demoReducer(
      {
        ...createBaseState(),
        outreachChoice: 'meeting',
      },
      { type: 'CONFIRM_OUTREACH' },
    );
    const latestEngagement = confirmedState.clientPortal.engagements[0];
    const updatedState = demoReducer(confirmedState, {
      type: 'ADD_ENGAGEMENT_NOTE',
      engagementId: latestEngagement.id,
      engagementPhase: 'post',
      note: {
        clientId: 'nkosi-retail',
        body: 'Client asked for a follow-up summary after the meeting.',
        relevance: 'general',
        durationType: 'permanent',
      },
    });

    const updatedEngagement = updatedState.clientPortal.engagements.find(engagement => engagement.id === latestEngagement.id);
    const storedNote = updatedState.clientPortal.notes[updatedEngagement.postNoteIds[0]];

    expect(storedNote).toMatchObject({ engagementId: latestEngagement.id, engagementPhase: 'post' });
    expect(updatedEngagement.postNoteIds.length).toBe(latestEngagement.postNoteIds.length + 1);
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
