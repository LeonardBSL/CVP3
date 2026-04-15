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

function buildLookupSession(responseId = 'lookup-growth-retail') {
  return {
    query: '',
    pendingQuery: '',
    status: 'idle',
    responseId,
    messages: [],
  };
}

function focusScenarioState(state, scenario) {
  return {
    ...state,
    selectedClientId: scenario.clientId,
    activeScenarioId: scenario.id,
    sectorFocus: scenario.sectorId,
    lookupSession: buildLookupSession(scenario.lookupResponseId),
  };
}

function updateAlertCollection(alerts, scenarioId, updates) {
  return alerts
    .map(alert => (alert.scenarioId === scenarioId ? { ...alert, ...updates } : alert))
    .sort(sortAlerts);
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
    lookupSession: buildLookupSession(),
    sectorFocus: 'retail',
    feedback: {},
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
      lookupSession: {
        ...baseState.lookupSession,
        ...savedState.lookupSession,
      },
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
        lookupSession: buildLookupSession(scenario.lookupResponseId),
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

    case 'START_LOOKUP':
      if (!action.query?.trim()) return state;
      return {
        ...state,
        lookupSession: {
          ...state.lookupSession,
          query: action.query.trim(),
          pendingQuery: action.query.trim(),
          status: 'loading',
          messages: [
            ...state.lookupSession.messages,
            { id: makeId(), role: 'user', text: action.query.trim() },
          ],
        },
        journeyProgress: {
          ...state.journeyProgress,
          lookup: 'response',
        },
      };

    case 'COMPLETE_LOOKUP':
      return {
        ...state,
        lookupSession: {
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
