import {
  getBundleById,
  getClientById,
  getInsightPackById,
  getLookupResponseById,
  getScenarioById,
  getSectorBriefingById,
} from '../data/demoData';

export const engagementSteps = [
  { id: 'alert', label: 'Alert' },
  { id: 'insight', label: 'Insight' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'confirm', label: 'Confirm' },
];

export const insightSteps = [
  { id: 'client', label: 'Summary' },
  { id: 'insight', label: 'Insight' },
  { id: 'customize', label: 'Customize' },
  { id: 'delivery', label: 'Delivery' },
];

export const lookupSteps = [
  { id: 'search', label: 'Search' },
  { id: 'response', label: 'Response' },
  { id: 'recommendation', label: 'Recommendation' },
];

export const sectorSteps = [
  { id: 'overview', label: 'Overview' },
  { id: 'deep-dive', label: 'Deep dive' },
  { id: 'client-relevance', label: 'Client relevance' },
];

function sortByNewest(items, key) {
  return [...items].sort((left, right) => new Date(right[key]) - new Date(left[key]));
}

function resolveNotes(noteIds, notesById) {
  return noteIds.map(noteId => notesById[noteId]).filter(Boolean);
}

export function getViewContext(state, alertId = null) {
  const activeAlert = alertId
    ? state.alerts.find(alert => alert.id === alertId)
    : state.alerts.find(alert => alert.scenarioId === state.activeScenarioId) ?? state.alerts[0];
  const scenario = getScenarioById(activeAlert?.scenarioId ?? state.activeScenarioId);
  const client = getClientById(scenario.clientId);
  const insight = getInsightPackById(scenario.insightPackId);
  const bundle = getBundleById(scenario.bundleId);
  const selection = state.bundleSelection[scenario.id] ?? {
    selectedProductIds: bundle.products.map(product => product.id),
    customTerms: {},
  };
  const selectedProducts = bundle.products.filter(product => selection.selectedProductIds.includes(product.id));
  const briefing = getSectorBriefingById(state.sectorFocus || scenario.sectorId);
  const lookupResponse = state.lookupSession.responseId ? getLookupResponseById(state.lookupSession.responseId) : null;
  const insightDraft = state.insightDrafts?.[scenario.id] ?? insight.clientFacingDraft;
  const portalNotes = state.clientPortal?.notes ?? {};
  const activeInsightRecord = state.clientPortal?.insightRecords.find(
    record => record.scenarioId === scenario.id && record.isActive,
  ) ?? null;
  const latestEngagement = sortByNewest(
    (state.clientPortal?.engagements ?? []).filter(engagement => engagement.scenarioId === scenario.id),
    'confirmedAt',
  )[0] ?? null;
  const pendingEngagementDraft = state.clientPortal?.pendingEngagementDrafts?.[scenario.id] ?? null;

  return {
    activeAlert,
    scenario,
    client,
    insight,
    insightDraft,
    bundle,
    selection,
    selectedProducts,
    briefing,
    lookupResponse,
    activeInsightRecord,
    latestEngagement,
    pendingEngagementDraft,
    pendingPreEngagementNotes: resolveNotes(pendingEngagementDraft?.preNoteIds ?? [], portalNotes),
    latestEngagementPreNotes: resolveNotes(latestEngagement?.preNoteIds ?? [], portalNotes),
    latestEngagementPostNotes: resolveNotes(latestEngagement?.postNoteIds ?? [], portalNotes),
  };
}
