import {
  clients,
  getBundleById,
  getClientById,
  getInsightPackById,
  getLookupAgentById,
  getLookupResponseById,
  getProductById,
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

const lookupIntentLabels = {
  generic: 'Generic lookup',
  'kb-only': 'Knowledge base only',
  'client-only': 'Client context only',
};

function sortByNewest(items, key) {
  return [...items].sort((left, right) => new Date(right[key]) - new Date(left[key]));
}

function resolveNotes(noteIds, notesById) {
  return noteIds.map(noteId => notesById[noteId]).filter(Boolean);
}

function getBundleSelection(state, scenario, bundle) {
  return state.bundleSelection[scenario.id] ?? {
    selectedProductIds: bundle.products.map(product => product.id),
    customTerms: {},
  };
}

function getLatestLookupResponseId(lookupSession) {
  const latestAssistantMessage = [...(lookupSession.messages ?? [])].reverse().find(message => message.role === 'assistant');
  return latestAssistantMessage?.responseId ?? lookupSession.responseId ?? null;
}

function summarizeClientNames(clientIds = []) {
  const names = clientIds
    .map(clientId => clients.find(client => client.id === clientId)?.name)
    .filter(Boolean);

  if (!names.length) return 'No specific clients selected';
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
}

function getLookupClientScopeLabel(context) {
  if (context.intentMode === 'kb-only') {
    return 'No client context';
  }

  if (context.clientScopeMode === 'all') {
    return 'All clients';
  }

  return summarizeClientNames(context.selectedClientIds);
}

function formatMetric(metric) {
  return `${metric.label}: ${metric.value}${metric.meta ? ` (${metric.meta})` : ''}`;
}

function splitDraftIntoBullets(draft = '') {
  return draft
    .split(/\n\s*\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function describeTrend(trendData = []) {
  const from = trendData[0]?.signal ?? null;
  const to = trendData[trendData.length - 1]?.signal ?? null;
  if (from == null || to == null) {
    return { direction: 'stable', from: null, to: null, delta: 0 };
  }

  const delta = to - from;
  return {
    direction: delta > 4 ? 'increasing' : delta < -4 ? 'decreasing' : 'stable',
    from,
    to,
    delta,
  };
}

function formatProductMeta(product, selection) {
  const configuredTerm = selection.customTerms[product.id] ?? product.termOptions?.[0] ?? null;
  return [
    product.preApproved ? 'Pre-approved' : 'Optional',
    product.pricing,
    product.eligibility,
    configuredTerm ? `Suggested term: ${configuredTerm}` : null,
  ].filter(Boolean);
}

function buildPreMeetingWatchpoints({ scenario, insight, briefing }) {
  if (scenario.severity === 'positive') {
    return [
      'Keep the discussion anchored in current operating discipline so the meeting stays proactive rather than promotional.',
      `${insight.transactionalMetrics[2]?.label ?? 'Client operating pattern'} should remain within the current range while the client scales.`,
      `${briefing?.riskSignal ?? 'Sector conditions'} remains the main external watchpoint ahead of the meeting.`,
    ];
  }

  return [
    scenario.alert.summary,
    `Early warning indicator: ${scenario.alert.whyNow}`,
    `${insight.transactionalMetrics[2]?.label ?? 'Operating trend'} is the watch item to monitor before the next cycle turns.`,
  ];
}

function buildOpportunityCards(products, selection, insight) {
  return products.map(product => ({
    title: product.name,
    body: `${product.description} Relevant now because ${insight.whyNow}`,
    meta: formatProductMeta(product, selection),
  }));
}

function buildRiskAreas({ scenario, insight, briefing }) {
  return [
    {
      label: 'Liquidity risk',
      value:
        scenario.severity === 'positive'
          ? `Currently contained, but ${insight.transactionalMetrics[1]?.label ?? 'cash-cycle discipline'} should stay stable through the next discussion cycle.`
          : scenario.alert.summary,
    },
    {
      label: 'Credit / funding risk',
      value: `Funding pressure may surface if ${scenario.alert.whyNow.charAt(0).toLowerCase()}${scenario.alert.whyNow.slice(1)}`,
    },
    {
      label: 'Operational or behavioural anomalies',
      value: briefing?.riskSignal
        ? `${briefing.riskSignal} remains the clearest linked watch item alongside the client data.`
        : `${insight.transactionalMetrics[2]?.label ?? 'Client operating pattern'} remains the clearest watch item in the current script.`,
    },
  ];
}

function buildRecommendedActions({ scenario, lookupResponse, insight }) {
  const actions = [
    `Monitor ${insight.transactionalMetrics[2]?.label?.toLowerCase() ?? 'the latest operating signals'} through the next review cycle.`,
    `Engage client with the current RM position: ${lookupResponse.recommendedAction}`,
  ];

  if (scenario.severity === 'critical') {
    actions.push('Escalate internally if the transport-style pressure pattern continues to intensify across the next scripted refresh.');
  } else {
    actions.push('Escalate internally only if the observed indicators move materially outside the current scripted range.');
  }

  return actions;
}

function buildLookupAgentPresentation(agentId, { scenario, client, insight, bundle, selection, briefing, lookupResponse, products, trend }) {
  if (!agentId || !scenario || !client || !insight || !bundle || !lookupResponse) {
    return null;
  }

  if (agentId === 'pre-meeting-brief') {
    return {
      title: 'Pre-meeting brief',
      summary: lookupResponse.summary,
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive summary',
          type: 'bullets',
          items: [
            lookupResponse.summary,
            scenario.alert.summary,
            `Why now: ${scenario.alert.whyNow}`,
            trend.from != null && trend.to != null ? `Signal trend: ${trend.direction} from ${trend.from} to ${trend.to}.` : null,
            `Meeting objective: ${lookupResponse.recommendedAction}`,
          ].filter(Boolean),
        },
        {
          id: 'key-developments',
          title: 'Key developments',
          type: 'key-value',
          items: [
            {
              label: 'Financial position',
              value: `${formatMetric(insight.transactionalMetrics[0])} ${insight.transactionalMetrics[1] ? `| ${formatMetric(insight.transactionalMetrics[1])}` : ''}`.trim(),
            },
            {
              label: 'Transactional behaviour',
              value: `${scenario.alert.summary} ${insight.transactionalMetrics[2] ? `Watch ${formatMetric(insight.transactionalMetrics[2])}.` : ''}`.trim(),
            },
            {
              label: 'External or sector signals',
              value: briefing?.commentary ?? `${scenario.label} remains the leading external context signal for this client.`,
            },
          ],
        },
        {
          id: 'risks-watchpoints',
          title: 'Risks and watchpoints',
          type: 'bullets',
          items: buildPreMeetingWatchpoints({ scenario, insight, briefing }),
        },
        {
          id: 'opportunities',
          title: 'Opportunities',
          type: 'cards',
          items: buildOpportunityCards(products, selection, insight).slice(0, 3),
        },
        {
          id: 'recommended-talking-points',
          title: 'Recommended talking points',
          type: 'bullets',
          items: splitDraftIntoBullets(insight.clientFacingDraft).slice(0, 3),
        },
      ],
      sourceIds: lookupResponse.sourceIds,
    };
  }

  if (agentId === 'revenue-opportunity-scan') {
    return {
      title: 'Revenue opportunity scan',
      summary: lookupResponse.summary,
      sections: [
        {
          id: 'opportunity-summary',
          title: 'Opportunity summary',
          type: 'bullets',
          items: products.map((product, index) => `${index + 1}. ${product.name} - ${product.description}`),
        },
        {
          id: 'opportunity-breakdown',
          title: 'Opportunity breakdown',
          type: 'cards',
          items: products.map(product => ({
            title: product.name,
            body: `${product.description} Relevant now because ${insight.whyNow} Expected impact: supports ${client.focus.toLowerCase()}.`,
            meta: formatProductMeta(product, selection),
          })),
        },
        {
          id: 'client-context',
          title: 'Client context',
          type: 'bullets',
          items: insight.transactionalMetrics.map(formatMetric),
        },
        {
          id: 'product-solution-mapping',
          title: 'Product or solution mapping',
          type: 'key-value',
          items: products.map(product => ({
            label: product.name,
            value: formatProductMeta(product, selection).join(' | '),
          })),
        },
        {
          id: 'recommended-next-actions',
          title: 'Recommended next actions',
          type: 'bullets',
          items: [
            `Engage client on ${products[0]?.name ?? bundle.title} while ${insight.whyNow.charAt(0).toLowerCase()}${insight.whyNow.slice(1)}`,
            products[1]
              ? `Explore ${products[1].name} as the next lever if the conversation broadens beyond the first opportunity.`
              : `Explore the broader ${bundle.title} bundle if the conversation broadens beyond the first opportunity.`,
            `Monitor ${insight.transactionalMetrics[2]?.label?.toLowerCase() ?? 'the operating signals'} before the next RM review.`,
          ],
        },
      ],
      sourceIds: lookupResponse.sourceIds,
    };
  }

  if (agentId === 'client-risk-assessment') {
    const overallPosture = scenario.severity === 'positive' ? 'improving' : 'deteriorating';

    return {
      title: 'Client risk assessment',
      summary: lookupResponse.summary,
      sections: [
        {
          id: 'risk-overview',
          title: 'Risk overview',
          type: 'paragraph',
          body: `Overall posture: ${overallPosture}. ${lookupResponse.summary}`,
        },
        {
          id: 'key-risk-areas',
          title: 'Key risk areas',
          type: 'key-value',
          items: buildRiskAreas({ scenario, insight, briefing }),
        },
        {
          id: 'risk-indicators-signals',
          title: 'Risk indicators and signals',
          type: 'bullets',
          items: [
            ...scenario.alert.supportingData.map(item => `${item.label}: ${item.value}`),
            ...insight.transactionalMetrics.map(formatMetric),
          ],
        },
        {
          id: 'trend-analysis',
          title: 'Trend analysis',
          type: 'key-value',
          items: [
            {
              label: 'Direction',
              value: trend.from != null && trend.to != null ? `${trend.direction} (${trend.from} to ${trend.to})` : trend.direction,
            },
            {
              label: 'Overall posture',
              value: overallPosture,
            },
            {
              label: 'Notable shift',
              value: scenario.alert.whyNow,
            },
          ],
        },
        {
          id: 'recommended-actions',
          title: 'Recommended actions',
          type: 'bullets',
          items: buildRecommendedActions({ scenario, lookupResponse, insight }),
        },
        {
          id: 'confidence-limitations',
          title: 'Confidence and limitations',
          type: 'key-value',
          items: [
            {
              label: 'Confidence level',
              value: `${lookupResponse.confidence}% confidence`,
            },
            {
              label: 'Limitations',
              value: 'The assessment is grounded in the scripted transactional and knowledge-base evidence available in this demo, not in live portfolio systems.',
            },
          ],
        },
      ],
      sourceIds: lookupResponse.sourceIds,
    };
  }

  return null;
}

function buildLookupContextSummary(lookupSession) {
  const agent = getLookupAgentById(lookupSession.selectedAgentId);
  return {
    intent: lookupIntentLabels[lookupSession.context.intentMode] ?? lookupIntentLabels.generic,
    clientScope: getLookupClientScopeLabel(lookupSession.context),
    agent: agent?.label ?? 'No agent selected',
  };
}

export function getViewContext(state, alertId = null) {
  const activeAlert = alertId
    ? state.alerts.find(alert => alert.id === alertId)
    : state.alerts.find(alert => alert.scenarioId === state.activeScenarioId) ?? state.alerts[0];
  const scenario = getScenarioById(activeAlert?.scenarioId ?? state.activeScenarioId);
  const client = getClientById(scenario.clientId);
  const insight = getInsightPackById(scenario.insightPackId);
  const bundle = getBundleById(scenario.bundleId);
  const selection = getBundleSelection(state, scenario, bundle);
  const selectedProducts = bundle.products.filter(product => selection.selectedProductIds.includes(product.id));
  const briefing = getSectorBriefingById(state.sectorFocus || scenario.sectorId);
  const lookupResponseId = getLatestLookupResponseId(state.lookupSession);
  const lookupResponse = lookupResponseId ? getLookupResponseById(lookupResponseId) : null;
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

export function getLookupPresentationForResponse(state, responseId = null) {
  const resolvedResponseId = responseId ?? getLatestLookupResponseId(state.lookupSession);
  const lookupResponse = resolvedResponseId ? getLookupResponseById(resolvedResponseId) : null;
  const scenario = lookupResponse?.scenarioId ? getScenarioById(lookupResponse.scenarioId) : null;
  const client = scenario ? getClientById(scenario.clientId) : null;
  const insight = scenario ? getInsightPackById(scenario.insightPackId) : null;
  const bundle = scenario ? getBundleById(scenario.bundleId) : null;
  const selection = scenario && bundle ? getBundleSelection(state, scenario, bundle) : { selectedProductIds: [], customTerms: {} };
  const recommendedProducts = (lookupResponse?.productIds ?? []).map(getProductById).filter(Boolean);
  const briefing = scenario ? getSectorBriefingById(scenario.sectorId) : null;
  const trend = describeTrend(insight?.trendData ?? []);
  const agent = getLookupAgentById(state.lookupSession.selectedAgentId);
  const contextSummary = buildLookupContextSummary(state.lookupSession);

  return {
    latestResponseId: resolvedResponseId,
    lookupResponse,
    scenario,
    client,
    insight,
    bundle,
    selection,
    recommendedProducts,
    briefing,
    trend,
    agent,
    contextSummary,
    agentPresentation: buildLookupAgentPresentation(agent?.id, {
      scenario,
      client,
      insight,
      bundle,
      selection,
      briefing,
      lookupResponse,
      products: recommendedProducts,
      trend,
    }),
  };
}

export function getLookupViewContext(state) {
  return getLookupPresentationForResponse(state);
}
