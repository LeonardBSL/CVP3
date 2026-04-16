import { buildInitialClientPortal, getActiveInsightRecordId } from '../data/clientPortalData';
import {
  buildInitialAlerts,
  buildInitialBundleSelection,
  buildInitialInsightDrafts,
  getBundleById,
  getClientById,
  getDefaultScenarioForClient,
  getInsightPackById,
  getScenarioById,
  sortAlerts,
} from '../data/demoData';

export const storageKey = 'cvp3-demo-state';

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function nowIso() {
  return new Date().toISOString();
}

function timestampLabel() {
  return new Date().toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function pushToast(toasts, title, tone = 'info') {
  return [{ id: makeId(), title, tone }, ...toasts].slice(0, 4);
}

function pushActivity(activityFeed, title, detail, tone = 'info') {
  return [{ id: makeId(), title, detail, tone, timestamp: timestampLabel() }, ...activityFeed].slice(0, 8);
}

function buildLookupContext(selectedClientId = 'nkosi-retail', overrides = {}) {
  return {
    intentMode: 'generic',
    clientScopeMode: 'selected',
    selectedClientIds: selectedClientId ? [selectedClientId] : [],
    ...overrides,
  };
}

function normalizeLookupContext(context = {}, selectedClientId = 'nkosi-retail') {
  const baseContext = buildLookupContext(selectedClientId);
  return {
    ...baseContext,
    ...context,
    selectedClientIds: Array.isArray(context.selectedClientIds)
      ? [...new Set(context.selectedClientIds)]
      : baseContext.selectedClientIds,
  };
}

function buildLookupSession(selectedClientId = 'nkosi-retail') {
  return {
    query: '',
    pendingQuery: '',
    status: 'idle',
    responseId: null,
    messages: [],
    context: buildLookupContext(selectedClientId),
    selectedAgentId: null,
  };
}

function normalizeLookupSession(lookupSession = {}, selectedClientId = 'nkosi-retail') {
  const baseSession = buildLookupSession(selectedClientId);
  return {
    ...baseSession,
    ...lookupSession,
    messages: Array.isArray(lookupSession.messages) ? lookupSession.messages : baseSession.messages,
    context: normalizeLookupContext(lookupSession.context, selectedClientId),
    selectedAgentId: lookupSession.selectedAgentId ?? null,
  };
}

function focusScenarioState(state, scenario) {
  return {
    ...state,
    selectedClientId: scenario.clientId,
    activeScenarioId: scenario.id,
    sectorFocus: scenario.sectorId,
    lookupSession: buildLookupSession(scenario.clientId),
  };
}

function updateAlertCollection(alerts, scenarioId, updates) {
  return alerts
    .map(alert => (alert.scenarioId === scenarioId ? { ...alert, ...updates } : alert))
    .sort(sortAlerts);
}

function sortNewest(items, key) {
  return [...items].sort((left, right) => new Date(right[key]) - new Date(left[key]));
}

function mergeClientPortalState(basePortal, savedPortal = {}) {
  return {
    ...basePortal,
    ...savedPortal,
    notes: {
      ...basePortal.notes,
      ...savedPortal.notes,
    },
    insightRecords: savedPortal.insightRecords ?? basePortal.insightRecords,
    generalNotes: savedPortal.generalNotes ?? basePortal.generalNotes,
    engagements: savedPortal.engagements ?? basePortal.engagements,
    pendingEngagementDrafts: {
      ...basePortal.pendingEngagementDrafts,
      ...savedPortal.pendingEngagementDrafts,
    },
  };
}

function normalizeNoteInput(noteInput = {}) {
  const body = noteInput.body?.trim();
  if (!body) {
    return null;
  }

  const durationType = noteInput.durationType ?? 'permanent';
  if (durationType === 'time-constrained' && !noteInput.expiresOn) {
    return null;
  }

  return {
    ...noteInput,
    body,
    durationType,
    expiresOn: durationType === 'time-constrained' ? noteInput.expiresOn : null,
  };
}

function buildPortalNote(noteInput, overrides = {}) {
  const createdAt = nowIso();
  return {
    id: makeId(),
    clientId: noteInput.clientId,
    body: noteInput.body,
    createdAt,
    updatedAt: createdAt,
    relevance: noteInput.relevance ?? 'general',
    durationType: noteInput.durationType,
    expiresOn: noteInput.durationType === 'time-constrained' ? noteInput.expiresOn : null,
    insightRecordId: noteInput.insightRecordId ?? null,
    engagementId: noteInput.engagementId ?? null,
    engagementPhase: noteInput.engagementPhase ?? null,
    ...overrides,
  };
}

function withSortedPortal(clientPortal) {
  return {
    ...clientPortal,
    insightRecords: sortNewest(clientPortal.insightRecords, 'generatedAt'),
    engagements: sortNewest(clientPortal.engagements, 'confirmedAt'),
  };
}

function addGeneralNoteId(generalNotes, noteId) {
  return [noteId, ...generalNotes.filter(existingId => existingId !== noteId)];
}

function attachNoteToInsightRecord(insightRecords, insightRecordId, noteId) {
  return insightRecords.map(record =>
    record.id === insightRecordId
      ? {
          ...record,
          noteIds: [noteId, ...record.noteIds.filter(existingId => existingId !== noteId)],
        }
      : record,
  );
}

function attachNoteToEngagement(engagements, engagementId, engagementPhase, noteId) {
  return engagements.map(engagement => {
    if (engagement.id !== engagementId) {
      return engagement;
    }

    const key = engagementPhase === 'pre' ? 'preNoteIds' : 'postNoteIds';
    return {
      ...engagement,
      [key]: [noteId, ...engagement[key].filter(existingId => existingId !== noteId)],
    };
  });
}

function addPortalNote(clientPortal, noteInput) {
  const normalizedNote = normalizeNoteInput(noteInput);
  if (!normalizedNote) {
    return clientPortal;
  }

  const note = buildPortalNote(normalizedNote);
  const nextPortal = {
    ...clientPortal,
    notes: {
      ...clientPortal.notes,
      [note.id]: note,
    },
  };

  if (note.engagementId) {
    return withSortedPortal({
      ...nextPortal,
      engagements: attachNoteToEngagement(clientPortal.engagements, note.engagementId, note.engagementPhase, note.id),
    });
  }

  if (note.relevance === 'insight' && note.insightRecordId) {
    return withSortedPortal({
      ...nextPortal,
      insightRecords: attachNoteToInsightRecord(clientPortal.insightRecords, note.insightRecordId, note.id),
    });
  }

  return withSortedPortal({
    ...nextPortal,
    generalNotes: addGeneralNoteId(clientPortal.generalNotes, note.id),
  });
}

function updatePortalNote(clientPortal, noteId, updates) {
  const existingNote = clientPortal.notes[noteId];
  if (!existingNote) {
    return clientPortal;
  }

  const normalizedUpdates = normalizeNoteInput({
    ...existingNote,
    ...updates,
  });
  if (!normalizedUpdates) {
    return clientPortal;
  }

  return {
    ...clientPortal,
    notes: {
      ...clientPortal.notes,
      [noteId]: {
        ...existingNote,
        body: normalizedUpdates.body,
        durationType: normalizedUpdates.durationType,
        expiresOn: normalizedUpdates.expiresOn,
        updatedAt: nowIso(),
      },
    },
  };
}

function addPendingEngagementNote(clientPortal, scenarioId, noteInput) {
  const normalizedNote = normalizeNoteInput(noteInput);
  if (!normalizedNote) {
    return clientPortal;
  }

  const note = buildPortalNote(normalizedNote, {
    relevance: normalizedNote.relevance ?? 'general',
    insightRecordId: null,
    engagementId: null,
    engagementPhase: 'pre',
  });
  const existingDraft = clientPortal.pendingEngagementDrafts[scenarioId] ?? {
    scenarioId,
    clientId: note.clientId,
    preNoteIds: [],
  };

  return {
    ...clientPortal,
    notes: {
      ...clientPortal.notes,
      [note.id]: note,
    },
    pendingEngagementDrafts: {
      ...clientPortal.pendingEngagementDrafts,
      [scenarioId]: {
        ...existingDraft,
        preNoteIds: [note.id, ...existingDraft.preNoteIds.filter(existingId => existingId !== note.id)],
      },
    },
  };
}

function confirmPortalEngagement(clientPortal, { clientId, scenarioId, channel, status }) {
  const confirmedAt = nowIso();
  const engagementId = `engagement-${makeId()}`;
  const insightRecordId = getActiveInsightRecordId(clientPortal, scenarioId);
  const pendingDraft = clientPortal.pendingEngagementDrafts[scenarioId] ?? {
    scenarioId,
    clientId,
    preNoteIds: [],
  };

  const nextNotes = { ...clientPortal.notes };
  pendingDraft.preNoteIds.forEach(noteId => {
    const note = nextNotes[noteId];
    if (note) {
      nextNotes[noteId] = {
        ...note,
        engagementId,
        engagementPhase: 'pre',
        updatedAt: confirmedAt,
      };
    }
  });

  const nextPendingDrafts = { ...clientPortal.pendingEngagementDrafts };
  delete nextPendingDrafts[scenarioId];

  return withSortedPortal({
    ...clientPortal,
    notes: nextNotes,
    engagements: [
      {
        id: engagementId,
        clientId,
        scenarioId,
        insightRecordId,
        channel,
        status,
        confirmedAt,
        preNoteIds: pendingDraft.preNoteIds,
        postNoteIds: [],
      },
      ...clientPortal.engagements,
    ],
    pendingEngagementDrafts: nextPendingDrafts,
  });
}

function markActiveInsightShared(clientPortal, scenarioId) {
  const sharedAt = nowIso();
  return withSortedPortal({
    ...clientPortal,
    insightRecords: clientPortal.insightRecords.map(record => {
      if (!(record.scenarioId === scenarioId && record.isActive)) {
        return record;
      }

      return {
        ...record,
        sharedStatus: 'shared',
        sharedAt: record.sharedAt ?? sharedAt,
      };
    }),
  });
}

export function createBaseState() {
  return {
    selectedClientId: 'nkosi-retail',
    activeScenarioId: 'growth-retail',
    alerts: buildInitialAlerts(),
    journeyProgress: {
      engagement: 'alert',
      insight: 'client',
      lookup: 'search',
      sector: 'overview',
    },
    bundleSelection: buildInitialBundleSelection(),
    insightDrafts: buildInitialInsightDrafts(),
    outreachChoice: 'meeting',
    lookupSession: buildLookupSession('nkosi-retail'),
    sectorFocus: 'retail',
    feedback: {},
    clientPortal: buildInitialClientPortal(),
    activityFeed: [
      {
        id: 'activity-0',
        title: 'Morning advisory sweep complete',
        detail: '4 proactive opportunities surfaced across your portfolio.',
        tone: 'info',
        timestamp: '09:10',
      },
      {
        id: 'activity-1',
        title: 'AI insight confidence refreshed',
        detail: 'Growth and sector signals were recalibrated against the latest transactional and sector-knowledge refresh.',
        tone: 'positive',
        timestamp: '08:54',
      },
    ],
    toasts: [],
  };
}

export function createInitialState() {
  const baseState = createBaseState();

  if (typeof window === 'undefined') {
    return baseState;
  }

  try {
    const savedState = JSON.parse(sessionStorage.getItem(storageKey));
    if (!savedState) return baseState;
    const selectedClientId = savedState.selectedClientId ?? baseState.selectedClientId;

    return {
      ...baseState,
      ...savedState,
      journeyProgress: {
        ...baseState.journeyProgress,
        ...savedState.journeyProgress,
      },
      bundleSelection: {
        ...baseState.bundleSelection,
        ...savedState.bundleSelection,
      },
      insightDrafts: {
        ...baseState.insightDrafts,
        ...savedState.insightDrafts,
      },
      lookupSession: normalizeLookupSession(savedState.lookupSession, selectedClientId),
      clientPortal: mergeClientPortalState(baseState.clientPortal, savedState.clientPortal),
      toasts: [],
    };
  } catch {
    return baseState;
  }
}

export function demoReducer(state, action) {
  switch (action.type) {
    case 'SELECT_CLIENT': {
      const scenario = getDefaultScenarioForClient(action.clientId);
      return {
        ...state,
        selectedClientId: action.clientId,
        activeScenarioId: scenario.id,
        sectorFocus: scenario.sectorId,
        lookupSession: buildLookupSession(action.clientId),
      };
    }

    case 'FOCUS_SCENARIO': {
      const scenario = getScenarioById(action.scenarioId);
      return focusScenarioState(state, scenario);
    }

    case 'TRIGGER_SCENARIO': {
      const scenario = getScenarioById(action.scenarioId);
      const client = getClientById(scenario.clientId);
      const nextState = focusScenarioState(state, scenario);
      return {
        ...nextState,
        alerts: updateAlertCollection(nextState.alerts, scenario.id, {
          status: 'new',
          updatedLabel: 'Just now',
        }),
        outreachChoice: scenario.defaultOutreach,
        activityFeed: pushActivity(
          nextState.activityFeed,
          `${scenario.label} simulated`,
          `${client.name} is now the highest-priority advisory opportunity in the cockpit.`,
          scenario.severity,
        ),
        toasts: pushToast(nextState.toasts, `${scenario.label} trigger added to the RM inbox.`, scenario.severity),
      };
    }

    case 'OPEN_ALERT': {
      const alert = state.alerts.find(item => item.id === action.alertId);
      if (!alert) return state;
      const scenario = getScenarioById(alert.scenarioId);
      const nextState = focusScenarioState(state, scenario);
      return {
        ...nextState,
        alerts: updateAlertCollection(nextState.alerts, scenario.id, {
          status: 'reviewing',
        }),
      };
    }

    case 'SET_JOURNEY_STEP':
      return {
        ...state,
        journeyProgress: {
          ...state.journeyProgress,
          [action.journey]: action.step,
        },
      };

    case 'TOGGLE_BUNDLE_PRODUCT': {
      const selection = state.bundleSelection[action.scenarioId];
      const selectedProductIds = selection.selectedProductIds.includes(action.productId)
        ? selection.selectedProductIds.filter(productId => productId !== action.productId)
        : [...selection.selectedProductIds, action.productId];
      return {
        ...state,
        bundleSelection: {
          ...state.bundleSelection,
          [action.scenarioId]: {
            ...selection,
            selectedProductIds,
          },
        },
      };
    }

    case 'SET_PRODUCT_TERM': {
      const selection = state.bundleSelection[action.scenarioId];
      return {
        ...state,
        bundleSelection: {
          ...state.bundleSelection,
          [action.scenarioId]: {
            ...selection,
            customTerms: {
              ...selection.customTerms,
              [action.productId]: action.term,
            },
          },
        },
      };
    }

    case 'SET_INSIGHT_DRAFT':
      return {
        ...state,
        insightDrafts: {
          ...state.insightDrafts,
          [action.scenarioId]: action.draft,
        },
      };

    case 'RESET_INSIGHT_DRAFT': {
      const scenario = getScenarioById(action.scenarioId);
      const insight = getInsightPackById(scenario.insightPackId);
      return {
        ...state,
        insightDrafts: {
          ...state.insightDrafts,
          [action.scenarioId]: insight.clientFacingDraft,
        },
      };
    }

    case 'SET_OUTREACH_CHOICE':
      return {
        ...state,
        outreachChoice: action.choice,
      };

    case 'SET_LOOKUP_INTENT_MODE':
      return {
        ...state,
        lookupSession: {
          ...state.lookupSession,
          context: {
            ...state.lookupSession.context,
            intentMode: action.intentMode,
          },
        },
      };

    case 'SET_LOOKUP_CLIENT_SCOPE_MODE':
      return {
        ...state,
        lookupSession: {
          ...state.lookupSession,
          context: {
            ...state.lookupSession.context,
            clientScopeMode: action.clientScopeMode,
          },
        },
      };

    case 'TOGGLE_LOOKUP_CLIENT': {
      const selectedClientIds = state.lookupSession.context.selectedClientIds.includes(action.clientId)
        ? state.lookupSession.context.selectedClientIds.filter(clientId => clientId !== action.clientId)
        : [...state.lookupSession.context.selectedClientIds, action.clientId];
      return {
        ...state,
        lookupSession: {
          ...state.lookupSession,
          context: {
            ...state.lookupSession.context,
            selectedClientIds,
          },
        },
      };
    }

    case 'SET_LOOKUP_AGENT':
      return {
        ...state,
        lookupSession: {
          ...state.lookupSession,
          selectedAgentId: action.agentId,
        },
      };

    case 'ADD_PORTAL_NOTE': {
      const nextClientPortal = addPortalNote(state.clientPortal, action.note);
      if (nextClientPortal === state.clientPortal) {
        return state;
      }

      return {
        ...state,
        clientPortal: nextClientPortal,
        toasts: pushToast(state.toasts, 'Internal note saved.', 'positive'),
      };
    }

    case 'UPDATE_PORTAL_NOTE': {
      const nextClientPortal = updatePortalNote(state.clientPortal, action.noteId, action.note);
      if (nextClientPortal === state.clientPortal) {
        return state;
      }

      return {
        ...state,
        clientPortal: nextClientPortal,
        toasts: pushToast(state.toasts, 'Internal note updated.', 'positive'),
      };
    }

    case 'ADD_PENDING_ENGAGEMENT_NOTE': {
      const nextClientPortal = addPendingEngagementNote(state.clientPortal, action.scenarioId, action.note);
      if (nextClientPortal === state.clientPortal) {
        return state;
      }

      return {
        ...state,
        clientPortal: nextClientPortal,
        toasts: pushToast(state.toasts, 'Pre-engagement note saved.', 'positive'),
      };
    }

    case 'ADD_ENGAGEMENT_NOTE': {
      const nextClientPortal = addPortalNote(state.clientPortal, {
        ...action.note,
        engagementId: action.engagementId,
        engagementPhase: action.engagementPhase,
      });
      if (nextClientPortal === state.clientPortal) {
        return state;
      }

      return {
        ...state,
        clientPortal: nextClientPortal,
        toasts: pushToast(
          state.toasts,
          `${action.engagementPhase === 'pre' ? 'Pre' : 'Post'}-engagement note saved.`,
          'positive',
        ),
      };
    }

    case 'CONFIRM_OUTREACH': {
      const scenario = getScenarioById(state.activeScenarioId);
      const client = getClientById(state.selectedClientId);
      const confirmationLabel = {
        call: 'Call scheduled',
        email: 'Email sent',
        meeting: 'Meeting scheduled',
      }[state.outreachChoice];
      return {
        ...state,
        alerts: updateAlertCollection(state.alerts, scenario.id, {
          status: 'actioned',
          updatedLabel: confirmationLabel,
        }),
        clientPortal: confirmPortalEngagement(state.clientPortal, {
          clientId: client.id,
          scenarioId: scenario.id,
          channel: state.outreachChoice,
          status: confirmationLabel,
        }),
        journeyProgress: {
          ...state.journeyProgress,
          engagement: 'confirm',
        },
        activityFeed: pushActivity(
          state.activityFeed,
          confirmationLabel,
          `${confirmationLabel} for ${client.name} using the ${scenario.label.toLowerCase()} play.`,
          'positive',
        ),
        toasts: pushToast(state.toasts, `${confirmationLabel} captured in the RM activity feed.`, 'positive'),
      };
    }

    case 'START_LOOKUP': {
      if (!action.query?.trim()) return state;
      const resetConversation = action.reset ?? false;
      const nextQuery = action.query.trim();
      const nextMessages = resetConversation
        ? [{ id: makeId(), role: 'user', text: nextQuery }]
        : [...state.lookupSession.messages, { id: makeId(), role: 'user', text: nextQuery }];
      return {
        ...state,
        lookupSession: {
          ...state.lookupSession,
          query: nextQuery,
          pendingQuery: nextQuery,
          status: 'loading',
          responseId: resetConversation ? null : state.lookupSession.responseId,
          messages: nextMessages,
        },
        journeyProgress: {
          ...state.journeyProgress,
          lookup: 'response',
        },
      };
    }

    case 'COMPLETE_LOOKUP':
      return {
        ...state,
        lookupSession: {
          ...state.lookupSession,
          query: action.query,
          pendingQuery: '',
          status: 'complete',
          responseId: action.responseId,
          messages: [
            ...state.lookupSession.messages,
            { id: makeId(), role: 'assistant', responseId: action.responseId },
          ],
        },
        activityFeed: pushActivity(
          state.activityFeed,
          'Lookup insight prepared',
          `AI response generated for: "${action.query}"`,
          'info',
        ),
        toasts: pushToast(state.toasts, 'Lookup recommendation is ready for review.', 'info'),
      };

    case 'SET_SECTOR_FOCUS':
      return {
        ...state,
        sectorFocus: action.sectorId,
      };

    case 'CAPTURE_FEEDBACK':
      return {
        ...state,
        feedback: {
          ...state.feedback,
          [action.contextKey]: action.value,
        },
        toasts: pushToast(state.toasts, 'Model learning captured for this insight.', 'positive'),
      };

    case 'RECORD_DELIVERY_ACTION': {
      const client = getClientById(state.selectedClientId);
      const verb = {
        send: 'Insight sent',
        present: 'Presentation launched',
        download: 'Insight pack prepared',
      }[action.mode];
      return {
        ...state,
        clientPortal: ['send', 'present'].includes(action.mode)
          ? markActiveInsightShared(state.clientPortal, state.activeScenarioId)
          : state.clientPortal,
        journeyProgress: {
          ...state.journeyProgress,
          insight: 'delivery',
        },
        activityFeed: pushActivity(state.activityFeed, verb, `${verb} for ${client.name}.`, action.mode === 'present' ? 'info' : 'positive'),
        toasts: pushToast(state.toasts, `${verb} recorded in the advisory cockpit.`, 'positive'),
      };
    }

    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.toastId),
      };

    case 'RESET_BUNDLE': {
      const scenario = getScenarioById(action.scenarioId);
      const bundle = getBundleById(scenario.bundleId);
      return {
        ...state,
        bundleSelection: {
          ...state.bundleSelection,
          [action.scenarioId]: {
            selectedProductIds: bundle.products.map(product => product.id),
            customTerms: Object.fromEntries(
              bundle.products
                .filter(product => product.termOptions?.length)
                .map(product => [product.id, product.termOptions[0]]),
            ),
          },
        },
      };
    }

    default:
      return state;
  }
}
