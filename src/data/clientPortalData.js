import { getInsightPackById, scenarios } from './demoData';

function shiftDate(days, hours = 9, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function shiftIso(days, hours = 9, minutes = 0) {
  return shiftDate(days, hours, minutes).toISOString();
}

function shiftDay(days) {
  return shiftIso(days, 9, 0).slice(0, 10);
}

function createNote({
  id,
  clientId,
  body,
  createdAt,
  updatedAt = createdAt,
  relevance = 'general',
  durationType = 'permanent',
  expiresOn = null,
  insightRecordId = null,
  engagementId = null,
  engagementPhase = null,
}) {
  return {
    id,
    clientId,
    body,
    createdAt,
    updatedAt,
    relevance,
    durationType,
    expiresOn: durationType === 'time-constrained' ? expiresOn : null,
    insightRecordId,
    engagementId,
    engagementPhase,
  };
}

function createInsightRecord({
  id,
  clientId,
  scenarioId,
  headline,
  summary,
  generatedAt,
  sharedStatus = 'unshared',
  sharedAt = null,
  noteIds = [],
  isActive = false,
}) {
  return {
    id,
    clientId,
    scenarioId,
    headline,
    summary,
    generatedAt,
    sharedStatus,
    sharedAt: sharedStatus === 'shared' ? sharedAt ?? generatedAt : null,
    noteIds,
    isActive,
  };
}

function createEngagement({
  id,
  clientId,
  scenarioId,
  insightRecordId,
  channel,
  status,
  confirmedAt,
  preNoteIds = [],
  postNoteIds = [],
}) {
  return {
    id,
    clientId,
    scenarioId,
    insightRecordId,
    channel,
    status,
    confirmedAt,
    preNoteIds,
    postNoteIds,
  };
}

export function buildInitialClientPortal() {
  const notes = {};
  const generalNotes = [];
  const insightRecords = [];
  const engagements = [];
  const pendingEngagementDrafts = {};

  function registerNote(note) {
    notes[note.id] = note;
    return note.id;
  }

  function registerGeneralNote(note) {
    generalNotes.unshift(registerNote(note));
  }

  function registerInsightRecord(record) {
    insightRecords.push(record);
  }

  function registerEngagement(engagement) {
    engagements.push(engagement);
  }

  const scenarioByClientId = Object.fromEntries(scenarios.map(scenario => [scenario.clientId, scenario]));

  scenarios.forEach((scenario, index) => {
    const insight = getInsightPackById(scenario.insightPackId);
    registerInsightRecord(
      createInsightRecord({
        id: `insight-live-${scenario.id}`,
        clientId: scenario.clientId,
        scenarioId: scenario.id,
        headline: insight.headline,
        summary: insight.whatHappened,
        generatedAt: shiftIso(-(index + 1), 10, 15),
        sharedStatus: 'unshared',
        noteIds: [],
        isActive: true,
      }),
    );
  });

  registerGeneralNote(
    createNote({
      id: 'note-general-nkosi-profile',
      clientId: 'nkosi-retail',
      body: 'Prefers strategy conversations anchored in site-level cash conversion rather than generic market commentary.',
      createdAt: shiftIso(-47, 8, 30),
      relevance: 'general',
      durationType: 'permanent',
    }),
  );
  registerGeneralNote(
    createNote({
      id: 'note-general-nkosi-window',
      clientId: 'nkosi-retail',
      body: 'Expansion committee meets next week, so funding options should be packaged before Tuesday.',
      createdAt: shiftIso(-4, 11, 5),
      relevance: 'general',
      durationType: 'time-constrained',
      expiresOn: shiftDay(4),
    }),
  );

  const nkosiSharedRecordId = 'insight-history-nkosi-seasonal';
  const nkosiSharedNoteId = registerNote(
    createNote({
      id: 'note-insight-nkosi-seasonal',
      clientId: 'nkosi-retail',
      body: 'Client responded well to a cash-backed growth framing and asked for examples tied to store rollout pacing.',
      createdAt: shiftIso(-34, 9, 40),
      updatedAt: shiftIso(-33, 14, 0),
      relevance: 'insight',
      durationType: 'permanent',
      insightRecordId: nkosiSharedRecordId,
    }),
  );
  const nkosiUnsharedRecordId = 'insight-history-nkosi-supplier';
  const nkosiUnsharedNoteId = registerNote(
    createNote({
      id: 'note-insight-nkosi-supplier',
      clientId: 'nkosi-retail',
      body: 'Keep this internal until supplier concentration is validated with the credit partner.',
      createdAt: shiftIso(-12, 10, 10),
      relevance: 'insight',
      durationType: 'time-constrained',
      expiresOn: shiftDay(6),
      insightRecordId: nkosiUnsharedRecordId,
    }),
  );
  const nkosiActiveNoteId = registerNote(
    createNote({
      id: 'note-insight-nkosi-live',
      clientId: 'nkosi-retail',
      body: 'Use the current growth signal to steer toward execution-readiness rather than rate discussion.',
      createdAt: shiftIso(-1, 15, 25),
      relevance: 'insight',
      durationType: 'permanent',
      insightRecordId: 'insight-live-growth-retail',
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      id: nkosiSharedRecordId,
      clientId: 'nkosi-retail',
      scenarioId: scenarioByClientId['nkosi-retail'].id,
      headline: 'Seasonal trading uplift supported an early working-capital review.',
      summary: 'The prior review combined higher festive inflows with tighter inventory control to open a growth discussion.',
      generatedAt: shiftIso(-35, 9, 20),
      sharedStatus: 'shared',
      sharedAt: shiftIso(-34, 12, 15),
      noteIds: [nkosiSharedNoteId],
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      id: nkosiUnsharedRecordId,
      clientId: 'nkosi-retail',
      scenarioId: scenarioByClientId['nkosi-retail'].id,
      headline: 'Supplier settlement data may support a margin-protection follow-up.',
      summary: 'Earlier settlement pressure suggested a short-term advisory follow-up, but it remained internal.',
      generatedAt: shiftIso(-13, 8, 45),
      sharedStatus: 'unshared',
      noteIds: [nkosiUnsharedNoteId],
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      ...insightRecords.find(record => record.id === 'insight-live-growth-retail'),
      noteIds: [nkosiActiveNoteId],
    }),
  );
  insightRecords.splice(
    insightRecords.findIndex(record => record.id === 'insight-live-growth-retail'),
    1,
  );

  const nkosiEngagementOneId = 'engagement-nkosi-1';
  const nkosiEngagementOnePreId = registerNote(
    createNote({
      id: 'note-engagement-nkosi-1-pre',
      clientId: 'nkosi-retail',
      body: 'Lead with stock-build timing and only then move into the funding envelope.',
      createdAt: shiftIso(-33, 10, 0),
      durationType: 'permanent',
      engagementId: nkosiEngagementOneId,
      engagementPhase: 'pre',
    }),
  );
  const nkosiEngagementOnePostId = registerNote(
    createNote({
      id: 'note-engagement-nkosi-1-post',
      clientId: 'nkosi-retail',
      body: 'Client asked for a branch-by-branch rollout view and agreed to a treasury follow-up.',
      createdAt: shiftIso(-32, 16, 45),
      durationType: 'permanent',
      engagementId: nkosiEngagementOneId,
      engagementPhase: 'post',
    }),
  );
  registerEngagement(
    createEngagement({
      id: nkosiEngagementOneId,
      clientId: 'nkosi-retail',
      scenarioId: scenarioByClientId['nkosi-retail'].id,
      insightRecordId: nkosiSharedRecordId,
      channel: 'meeting',
      status: 'Meeting held',
      confirmedAt: shiftIso(-32, 14, 30),
      preNoteIds: [nkosiEngagementOnePreId],
      postNoteIds: [nkosiEngagementOnePostId],
    }),
  );
  const nkosiEngagementTwoId = 'engagement-nkosi-2';
  const nkosiEngagementTwoPreId = registerNote(
    createNote({
      id: 'note-engagement-nkosi-2-pre',
      clientId: 'nkosi-retail',
      body: 'Use email only for sharing a short recap; keep the pricing conversation for the next meeting.',
      createdAt: shiftIso(-10, 9, 20),
      durationType: 'time-constrained',
      expiresOn: shiftDay(7),
      engagementId: nkosiEngagementTwoId,
      engagementPhase: 'pre',
    }),
  );
  const nkosiEngagementTwoPostId = registerNote(
    createNote({
      id: 'note-engagement-nkosi-2-post',
      clientId: 'nkosi-retail',
      body: 'RM decided not to send the internal supplier-read insight until credit appetite is refreshed.',
      createdAt: shiftIso(-10, 15, 5),
      durationType: 'permanent',
      engagementId: nkosiEngagementTwoId,
      engagementPhase: 'post',
    }),
  );
  registerEngagement(
    createEngagement({
      id: nkosiEngagementTwoId,
      clientId: 'nkosi-retail',
      scenarioId: scenarioByClientId['nkosi-retail'].id,
      insightRecordId: nkosiUnsharedRecordId,
      channel: 'email',
      status: 'Email drafted',
      confirmedAt: shiftIso(-10, 13, 40),
      preNoteIds: [nkosiEngagementTwoPreId],
      postNoteIds: [nkosiEngagementTwoPostId],
    }),
  );

  registerGeneralNote(
    createNote({
      id: 'note-general-mahlangu-relationship',
      clientId: 'mahlangu-manufacturing',
      body: 'Owner is receptive to short tactical calls but wants written follow-through with operating-cycle detail.',
      createdAt: shiftIso(-52, 8, 10),
      relevance: 'general',
      durationType: 'permanent',
    }),
  );
  registerGeneralNote(
    createNote({
      id: 'note-general-mahlangu-expired',
      clientId: 'mahlangu-manufacturing',
      body: 'Temporary watch item on delayed receivables has expired after the March procurement run closed.',
      createdAt: shiftIso(-21, 10, 50),
      relevance: 'general',
      durationType: 'time-constrained',
      expiresOn: shiftDay(-3),
    }),
  );

  const mahlanguSharedRecordId = 'insight-history-mahlangu-cycle';
  const mahlanguSharedNoteId = registerNote(
    createNote({
      id: 'note-insight-mahlangu-cycle',
      clientId: 'mahlangu-manufacturing',
      body: 'Shared narrative should emphasize cycle stabilization rather than balance-sheet stress.',
      createdAt: shiftIso(-29, 11, 5),
      relevance: 'insight',
      durationType: 'permanent',
      insightRecordId: mahlanguSharedRecordId,
    }),
  );
  const mahlanguUnsharedRecordId = 'insight-history-mahlangu-credit';
  const mahlanguUnsharedNoteId = registerNote(
    createNote({
      id: 'note-insight-mahlangu-credit',
      clientId: 'mahlangu-manufacturing',
      body: 'Hold this note internally until the receivables-aging file is confirmed with coverage.',
      createdAt: shiftIso(-9, 9, 35),
      relevance: 'insight',
      durationType: 'time-constrained',
      expiresOn: shiftDay(9),
      insightRecordId: mahlanguUnsharedRecordId,
    }),
  );
  const mahlanguActiveNoteId = registerNote(
    createNote({
      id: 'note-insight-mahlangu-live',
      clientId: 'mahlangu-manufacturing',
      body: 'If this is shared, keep the language firmly on procurement timing and treasury visibility.',
      createdAt: shiftIso(-2, 14, 10),
      relevance: 'insight',
      durationType: 'permanent',
      insightRecordId: 'insight-live-liquidity-manufacturing',
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      id: mahlanguSharedRecordId,
      clientId: 'mahlangu-manufacturing',
      scenarioId: scenarioByClientId['mahlangu-manufacturing'].id,
      headline: 'Procurement-cycle tightening justified a same-day liquidity review.',
      summary: 'Earlier supplier pressure and slower collections were translated into a stabilization conversation.',
      generatedAt: shiftIso(-30, 8, 40),
      sharedStatus: 'shared',
      sharedAt: shiftIso(-29, 15, 0),
      noteIds: [mahlanguSharedNoteId],
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      id: mahlanguUnsharedRecordId,
      clientId: 'mahlangu-manufacturing',
      scenarioId: scenarioByClientId['mahlangu-manufacturing'].id,
      headline: 'Receivables drift may require policy re-check before client outreach.',
      summary: 'The internal read suggested a funding conversation, but the RM paused it pending credit validation.',
      generatedAt: shiftIso(-9, 8, 5),
      sharedStatus: 'unshared',
      noteIds: [mahlanguUnsharedNoteId],
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      ...insightRecords.find(record => record.id === 'insight-live-liquidity-manufacturing'),
      noteIds: [mahlanguActiveNoteId],
    }),
  );
  insightRecords.splice(
    insightRecords.findIndex(record => record.id === 'insight-live-liquidity-manufacturing'),
    1,
  );

  const mahlanguEngagementOneId = 'engagement-mahlangu-1';
  const mahlanguEngagementOnePreId = registerNote(
    createNote({
      id: 'note-engagement-mahlangu-1-pre',
      clientId: 'mahlangu-manufacturing',
      body: 'Open with supplier timing pressure, not overdue debt language.',
      createdAt: shiftIso(-29, 9, 15),
      durationType: 'permanent',
      engagementId: mahlanguEngagementOneId,
      engagementPhase: 'pre',
    }),
  );
  const mahlanguEngagementOnePostId = registerNote(
    createNote({
      id: 'note-engagement-mahlangu-1-post',
      clientId: 'mahlangu-manufacturing',
      body: 'Client requested invoice discounting examples and agreed to share the updated receivables ledger.',
      createdAt: shiftIso(-28, 16, 25),
      durationType: 'permanent',
      engagementId: mahlanguEngagementOneId,
      engagementPhase: 'post',
    }),
  );
  registerEngagement(
    createEngagement({
      id: mahlanguEngagementOneId,
      clientId: 'mahlangu-manufacturing',
      scenarioId: scenarioByClientId['mahlangu-manufacturing'].id,
      insightRecordId: mahlanguSharedRecordId,
      channel: 'call',
      status: 'Call completed',
      confirmedAt: shiftIso(-28, 13, 30),
      preNoteIds: [mahlanguEngagementOnePreId],
      postNoteIds: [mahlanguEngagementOnePostId],
    }),
  );
  const mahlanguEngagementTwoId = 'engagement-mahlangu-2';
  const mahlanguEngagementTwoPreId = registerNote(
    createNote({
      id: 'note-engagement-mahlangu-2-pre',
      clientId: 'mahlangu-manufacturing',
      body: 'Keep this follow-up internal until credit confirms the procurement assumptions.',
      createdAt: shiftIso(-8, 9, 45),
      durationType: 'time-constrained',
      expiresOn: shiftDay(5),
      engagementId: mahlanguEngagementTwoId,
      engagementPhase: 'pre',
    }),
  );
  const mahlanguEngagementTwoPostId = registerNote(
    createNote({
      id: 'note-engagement-mahlangu-2-post',
      clientId: 'mahlangu-manufacturing',
      body: 'No client contact made; RM parked the follow-up after internal review.',
      createdAt: shiftIso(-8, 12, 55),
      durationType: 'permanent',
      engagementId: mahlanguEngagementTwoId,
      engagementPhase: 'post',
    }),
  );
  registerEngagement(
    createEngagement({
      id: mahlanguEngagementTwoId,
      clientId: 'mahlangu-manufacturing',
      scenarioId: scenarioByClientId['mahlangu-manufacturing'].id,
      insightRecordId: mahlanguUnsharedRecordId,
      channel: 'email',
      status: 'Internal hold',
      confirmedAt: shiftIso(-8, 11, 20),
      preNoteIds: [mahlanguEngagementTwoPreId],
      postNoteIds: [mahlanguEngagementTwoPostId],
    }),
  );

  registerGeneralNote(
    createNote({
      id: 'note-general-transit-ops',
      clientId: 'transit-logistics',
      body: 'Operations lead prefers concise notes that tie settlement changes directly to corridor impact.',
      createdAt: shiftIso(-39, 7, 55),
      relevance: 'general',
      durationType: 'permanent',
    }),
  );
  registerGeneralNote(
    createNote({
      id: 'note-general-transit-expired',
      clientId: 'transit-logistics',
      body: 'Temporary note on diesel relief window has expired and should only appear when expired notes are shown.',
      createdAt: shiftIso(-18, 10, 30),
      relevance: 'general',
      durationType: 'time-constrained',
      expiresOn: shiftDay(-1),
    }),
  );

  const transitSharedRecordId = 'insight-history-transit-resilience';
  const transitSharedNoteId = registerNote(
    createNote({
      id: 'note-insight-transit-resilience',
      clientId: 'transit-logistics',
      body: 'Shared pack landed best when framed as flexibility protection rather than distress management.',
      createdAt: shiftIso(-26, 8, 35),
      relevance: 'insight',
      durationType: 'permanent',
      insightRecordId: transitSharedRecordId,
    }),
  );
  const transitUnsharedRecordId = 'insight-history-transit-margin';
  const transitUnsharedNoteId = registerNote(
    createNote({
      id: 'note-insight-transit-margin',
      clientId: 'transit-logistics',
      body: 'Keep this internal until margin-pressure assumptions are reconciled with the latest fleet data.',
      createdAt: shiftIso(-7, 11, 15),
      relevance: 'insight',
      durationType: 'time-constrained',
      expiresOn: shiftDay(3),
      insightRecordId: transitUnsharedRecordId,
    }),
  );
  const transitActiveNoteId = registerNote(
    createNote({
      id: 'note-insight-transit-live',
      clientId: 'transit-logistics',
      body: 'If shared, connect corridor delays to treasury support and avoid over-indexing on fuel prices alone.',
      createdAt: shiftIso(-1, 16, 5),
      relevance: 'insight',
      durationType: 'permanent',
      insightRecordId: 'insight-live-sector-logistics',
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      id: transitSharedRecordId,
      clientId: 'transit-logistics',
      scenarioId: scenarioByClientId['transit-logistics'].id,
      headline: 'Settlement pressure justified an earlier resilience conversation.',
      summary: 'The RM used the transport signal to prepare a treasury and liquidity response before disruption escalated.',
      generatedAt: shiftIso(-27, 8, 0),
      sharedStatus: 'shared',
      sharedAt: shiftIso(-26, 13, 10),
      noteIds: [transitSharedNoteId],
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      id: transitUnsharedRecordId,
      clientId: 'transit-logistics',
      scenarioId: scenarioByClientId['transit-logistics'].id,
      headline: 'Margin compression read stayed internal pending fleet utilization refresh.',
      summary: 'The RM held a more severe internal interpretation back until utilization data was refreshed.',
      generatedAt: shiftIso(-7, 9, 10),
      sharedStatus: 'unshared',
      noteIds: [transitUnsharedNoteId],
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      ...insightRecords.find(record => record.id === 'insight-live-sector-logistics'),
      noteIds: [transitActiveNoteId],
    }),
  );
  insightRecords.splice(
    insightRecords.findIndex(record => record.id === 'insight-live-sector-logistics'),
    1,
  );

  const transitEngagementOneId = 'engagement-transit-1';
  const transitEngagementOnePreId = registerNote(
    createNote({
      id: 'note-engagement-transit-1-pre',
      clientId: 'transit-logistics',
      body: 'Use corridor delays as the opening proof point before fuel hedging is mentioned.',
      createdAt: shiftIso(-26, 9, 10),
      durationType: 'permanent',
      engagementId: transitEngagementOneId,
      engagementPhase: 'pre',
    }),
  );
  const transitEngagementOnePostId = registerNote(
    createNote({
      id: 'note-engagement-transit-1-post',
      clientId: 'transit-logistics',
      body: 'Client asked for collections optimization first and treasury advisory second.',
      createdAt: shiftIso(-25, 17, 15),
      durationType: 'permanent',
      engagementId: transitEngagementOneId,
      engagementPhase: 'post',
    }),
  );
  registerEngagement(
    createEngagement({
      id: transitEngagementOneId,
      clientId: 'transit-logistics',
      scenarioId: scenarioByClientId['transit-logistics'].id,
      insightRecordId: transitSharedRecordId,
      channel: 'meeting',
      status: 'Meeting held',
      confirmedAt: shiftIso(-25, 14, 40),
      preNoteIds: [transitEngagementOnePreId],
      postNoteIds: [transitEngagementOnePostId],
    }),
  );
  const transitEngagementTwoId = 'engagement-transit-2';
  const transitEngagementTwoPreId = registerNote(
    createNote({
      id: 'note-engagement-transit-2-pre',
      clientId: 'transit-logistics',
      body: 'Keep the unshared margin view internal until the fleet team confirms corridor mix.',
      createdAt: shiftIso(-6, 8, 45),
      durationType: 'time-constrained',
      expiresOn: shiftDay(4),
      engagementId: transitEngagementTwoId,
      engagementPhase: 'pre',
    }),
  );
  const transitEngagementTwoPostId = registerNote(
    createNote({
      id: 'note-engagement-transit-2-post',
      clientId: 'transit-logistics',
      body: 'RM parked the outreach and added the fleet refresh to next week’s check-in.',
      createdAt: shiftIso(-6, 12, 10),
      durationType: 'permanent',
      engagementId: transitEngagementTwoId,
      engagementPhase: 'post',
    }),
  );
  registerEngagement(
    createEngagement({
      id: transitEngagementTwoId,
      clientId: 'transit-logistics',
      scenarioId: scenarioByClientId['transit-logistics'].id,
      insightRecordId: transitUnsharedRecordId,
      channel: 'call',
      status: 'Internal follow-up',
      confirmedAt: shiftIso(-6, 10, 35),
      preNoteIds: [transitEngagementTwoPreId],
      postNoteIds: [transitEngagementTwoPostId],
    }),
  );

  registerGeneralNote(
    createNote({
      id: 'note-general-meridian-growth',
      clientId: 'meridian-distributor',
      body: 'Founders want growth discussions linked to inventory turns and cross-category expansion discipline.',
      createdAt: shiftIso(-43, 8, 25),
      relevance: 'general',
      durationType: 'permanent',
    }),
  );
  registerGeneralNote(
    createNote({
      id: 'note-general-meridian-window',
      clientId: 'meridian-distributor',
      body: 'Short-term note: prepare the adjacent-sector expansion view before the monthly ops review.',
      createdAt: shiftIso(-3, 10, 20),
      relevance: 'general',
      durationType: 'time-constrained',
      expiresOn: shiftDay(8),
    }),
  );

  const meridianSharedRecordId = 'insight-history-meridian-adjacent';
  const meridianSharedNoteId = registerNote(
    createNote({
      id: 'note-insight-meridian-adjacent',
      clientId: 'meridian-distributor',
      body: 'Shared insight worked because it connected faster stock turn to controlled expansion headroom.',
      createdAt: shiftIso(-24, 9, 45),
      relevance: 'insight',
      durationType: 'permanent',
      insightRecordId: meridianSharedRecordId,
    }),
  );
  const meridianUnsharedRecordId = 'insight-history-meridian-covenant';
  const meridianUnsharedNoteId = registerNote(
    createNote({
      id: 'note-insight-meridian-covenant',
      clientId: 'meridian-distributor',
      body: 'Hold this internal until covenant headroom is refreshed after quarter close.',
      createdAt: shiftIso(-5, 11, 50),
      relevance: 'insight',
      durationType: 'time-constrained',
      expiresOn: shiftDay(11),
      insightRecordId: meridianUnsharedRecordId,
    }),
  );
  const meridianActiveNoteId = registerNote(
    createNote({
      id: 'note-insight-meridian-live',
      clientId: 'meridian-distributor',
      body: 'Current draft should keep the emphasis on disciplined scaling and treasury support.',
      createdAt: shiftIso(-2, 15, 40),
      relevance: 'insight',
      durationType: 'permanent',
      insightRecordId: 'insight-live-growth-distributor',
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      id: meridianSharedRecordId,
      clientId: 'meridian-distributor',
      scenarioId: scenarioByClientId['meridian-distributor'].id,
      headline: 'Adjacent-sector growth opportunity was packaged with treasury support.',
      summary: 'A previous review translated strong digital sales and stock turn into a disciplined expansion discussion.',
      generatedAt: shiftIso(-25, 8, 50),
      sharedStatus: 'shared',
      sharedAt: shiftIso(-24, 14, 5),
      noteIds: [meridianSharedNoteId],
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      id: meridianUnsharedRecordId,
      clientId: 'meridian-distributor',
      scenarioId: scenarioByClientId['meridian-distributor'].id,
      headline: 'Cross-category upside remained internal pending covenant refresh.',
      summary: 'The signal was credible, but the RM kept the pack internal until quarter-close covenant data landed.',
      generatedAt: shiftIso(-5, 9, 25),
      sharedStatus: 'unshared',
      noteIds: [meridianUnsharedNoteId],
    }),
  );
  registerInsightRecord(
    createInsightRecord({
      ...insightRecords.find(record => record.id === 'insight-live-growth-distributor'),
      noteIds: [meridianActiveNoteId],
    }),
  );
  insightRecords.splice(
    insightRecords.findIndex(record => record.id === 'insight-live-growth-distributor'),
    1,
  );

  const meridianEngagementOneId = 'engagement-meridian-1';
  const meridianEngagementOnePreId = registerNote(
    createNote({
      id: 'note-engagement-meridian-1-pre',
      clientId: 'meridian-distributor',
      body: 'Open with operating quality and leave optional treasury expansion add-ons for the second half of the discussion.',
      createdAt: shiftIso(-24, 9, 0),
      durationType: 'permanent',
      engagementId: meridianEngagementOneId,
      engagementPhase: 'pre',
    }),
  );
  const meridianEngagementOnePostId = registerNote(
    createNote({
      id: 'note-engagement-meridian-1-post',
      clientId: 'meridian-distributor',
      body: 'Client was positive on the funding envelope but asked for treasury onboarding detail before deciding.',
      createdAt: shiftIso(-23, 16, 20),
      durationType: 'permanent',
      engagementId: meridianEngagementOneId,
      engagementPhase: 'post',
    }),
  );
  registerEngagement(
    createEngagement({
      id: meridianEngagementOneId,
      clientId: 'meridian-distributor',
      scenarioId: scenarioByClientId['meridian-distributor'].id,
      insightRecordId: meridianSharedRecordId,
      channel: 'meeting',
      status: 'Meeting held',
      confirmedAt: shiftIso(-23, 13, 55),
      preNoteIds: [meridianEngagementOnePreId],
      postNoteIds: [meridianEngagementOnePostId],
    }),
  );
  const meridianEngagementTwoId = 'engagement-meridian-2';
  const meridianEngagementTwoPreId = registerNote(
    createNote({
      id: 'note-engagement-meridian-2-pre',
      clientId: 'meridian-distributor',
      body: 'Keep the covenant-sensitive read internal until quarter close is complete.',
      createdAt: shiftIso(-4, 8, 40),
      durationType: 'time-constrained',
      expiresOn: shiftDay(10),
      engagementId: meridianEngagementTwoId,
      engagementPhase: 'pre',
    }),
  );
  const meridianEngagementTwoPostId = registerNote(
    createNote({
      id: 'note-engagement-meridian-2-post',
      clientId: 'meridian-distributor',
      body: 'RM paused client outreach and requested updated covenant data from coverage.',
      createdAt: shiftIso(-4, 12, 15),
      durationType: 'permanent',
      engagementId: meridianEngagementTwoId,
      engagementPhase: 'post',
    }),
  );
  registerEngagement(
    createEngagement({
      id: meridianEngagementTwoId,
      clientId: 'meridian-distributor',
      scenarioId: scenarioByClientId['meridian-distributor'].id,
      insightRecordId: meridianUnsharedRecordId,
      channel: 'email',
      status: 'Internal hold',
      confirmedAt: shiftIso(-4, 10, 50),
      preNoteIds: [meridianEngagementTwoPreId],
      postNoteIds: [meridianEngagementTwoPostId],
    }),
  );

  insightRecords.sort((left, right) => new Date(right.generatedAt) - new Date(left.generatedAt));
  engagements.sort((left, right) => new Date(right.confirmedAt) - new Date(left.confirmedAt));

  return {
    notes,
    insightRecords,
    generalNotes,
    engagements,
    pendingEngagementDrafts,
  };
}

export function getActiveInsightRecordId(clientPortal, scenarioId) {
  return clientPortal.insightRecords.find(record => record.scenarioId === scenarioId && record.isActive)?.id ?? null;
}

export function isPortalNoteExpired(note, referenceDate = new Date()) {
  if (note.durationType !== 'time-constrained' || !note.expiresOn) {
    return false;
  }

  return new Date(`${note.expiresOn}T23:59:59`) < referenceDate;
}
