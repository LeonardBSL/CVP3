import { getCitations } from './evidenceData';

const priorityRank = { P1: 1, P2: 2, P3: 3 };

const citedText = (text, citationIds = []) => ({ text, citationIds });
const paragraphBlock = (id, segments) => ({ id, type: 'paragraph', segments });
const bulletBlock = (id, items) => ({
  id,
  type: 'bullets',
  items: items.map((segments, index) => ({
    id: `${id}-item-${index + 1}`,
    segments,
  })),
});
const numberedBlock = (id, items) => ({
  id,
  type: 'numbered',
  items: items.map((segments, index) => ({
    id: `${id}-item-${index + 1}`,
    segments,
  })),
});
const tableCell = segments => ({ segments });
const tableRow = (id, cells) => ({ id, cells });
const tableBlock = (id, columns, rows) => ({ id, type: 'table', columns, rows });

export const clients = [
  {
    id: 'nkosi-retail',
    name: 'Nkosi Retail Group',
    persona: 'Retail franchise operator',
    sectorId: 'retail',
    focus: 'Expansion and cash-flow confidence',
    relationshipValue: 'R148m portfolio',
    revenueTrend: '+18% YoY',
    cashCycle: '29 day cycle',
    creditEligibility: 'Pre-approved expansion capacity',
    priorityTag: 'Growth-ready',
  },
  {
    id: 'mahlangu-manufacturing',
    name: 'Mahlangu Components',
    persona: 'Manufacturing SME',
    sectorId: 'manufacturing',
    focus: 'Capex timing and funding delays',
    relationshipValue: 'R112m portfolio',
    revenueTrend: '+4% YoY',
    cashCycle: '47 day cycle',
    creditEligibility: 'Liquidity support available',
    priorityTag: 'Emerging stress',
  },
  {
    id: 'transit-logistics',
    name: 'Transit Flow Logistics',
    persona: 'Logistics company',
    sectorId: 'transport',
    focus: 'Working-capital timing and margin resilience',
    relationshipValue: 'R131m portfolio',
    revenueTrend: '+6% YoY',
    cashCycle: '54 day cycle',
    creditEligibility: 'Working-capital line ready',
    priorityTag: 'Sector pressure',
  },
  {
    id: 'meridian-distributor',
    name: 'Meridian Trade Grid',
    persona: 'Tech-enabled distributor',
    sectorId: 'distribution',
    focus: 'Cross-sector growth and treasury discipline',
    relationshipValue: 'R95m portfolio',
    revenueTrend: '+22% YoY',
    cashCycle: '24 day cycle',
    creditEligibility: 'Expansion package available',
    priorityTag: 'Momentum client',
  },
];

export const productBundles = {
  growthExpansion: {
    id: 'growthExpansion',
    title: 'Growth / Expansion',
    summary: 'Expansion, liquidity cover, and faster execution.',
    products: [
      { id: 'term-loan', name: 'Expansion Term Loan', description: 'Site rollout and fit-out funding.', pricing: 'Prime - 0.35%', eligibility: 'Clean repayment behavior', preApproved: true, tag: 'Funding', termOptions: ['24 months', '36 months', '48 months'] },
      { id: 'wc-buffer', name: 'Working Capital Buffer', description: 'Short-cycle liquidity cover.', pricing: 'R5m limit', eligibility: 'Stable collections', preApproved: true, tag: 'Liquidity', termOptions: ['R3m limit', 'R5m limit', 'R7m limit'] },
      { id: 'merchant-upgrade', name: 'Merchant Services Upgrade', description: 'Collections optimization.', pricing: 'Fee rebate for 6 months', eligibility: 'RM confirmation', preApproved: false, tag: 'Collections' },
      { id: 'fx-lite', name: 'Treasury FX Lite', description: 'Light hedging support.', pricing: 'Advisory onboarding included', eligibility: 'Optional add-on', preApproved: true, tag: 'Treasury' },
    ],
  },
  liquidityStabilisation: {
    id: 'liquidityStabilisation',
    title: 'Liquidity Stabilisation',
    summary: 'Treasury visibility and flexible liquidity structures.',
    products: [
      { id: 'revolver', name: 'Working Capital Revolver', description: 'Bridge procurement and receivables timing.', pricing: 'Prime + 0.15%', eligibility: 'Pre-approved', preApproved: true, tag: 'Liquidity', termOptions: ['9 months', '12 months', '18 months'] },
      { id: 'invoice-discounting', name: 'Invoice Discounting', description: 'Accelerates cash conversion.', pricing: 'From 1.35%', eligibility: 'Anchor counterparties in file', preApproved: true, tag: 'Receivables' },
      { id: 'supplier-payments', name: 'Supplier Payment Programme', description: 'Smooths outbound payments.', pricing: 'Implementation waived', eligibility: 'RM-led onboarding', preApproved: false, tag: 'Operations' },
      { id: 'cash-console', name: 'Cash Visibility Console', description: 'Daily treasury visibility and alerting.', pricing: 'Bundled with transaction package', eligibility: 'Available immediately', preApproved: true, tag: 'Visibility' },
    ],
  },
  sectorResilience: {
    id: 'sectorResilience',
    title: 'Sector Resilience',
    summary: 'Margin protection and funding readiness.',
    products: [
      { id: 'margin-line', name: 'Margin Protection Line', description: 'Working-capital cover for sector shocks.', pricing: 'Prime + 0.05%', eligibility: 'Pre-approved within appetite', preApproved: true, tag: 'Resilience', termOptions: ['R4m line', 'R6m line', 'R8m line'] },
      { id: 'fleet-finance', name: 'Fleet Renewal Finance', description: 'Efficiency-linked capex finance.', pricing: 'Custom pricing after quote', eligibility: 'Credit review required', preApproved: false, tag: 'Capex' },
      { id: 'hedging-desk', name: 'Fuel Hedging Advisory Desk', description: 'Treasury market and hedge support.', pricing: 'No upfront fee', eligibility: 'Available immediately', preApproved: false, tag: 'Advisory' },
      { id: 'collections-sweep', name: 'Collections Sweep Optimizer', description: 'Improves settlement timing.', pricing: 'Included with cash uplift', eligibility: 'Ready to activate', preApproved: true, tag: 'Cash management' },
    ],
  },
};

const allProducts = Object.values(productBundles).flatMap(bundle => bundle.products);

export const scenarios = [
  {
    id: 'growth-retail',
    typeId: 'growth',
    label: 'Growth signal',
    shortLabel: 'Growth',
    severity: 'positive',
    clientId: 'nkosi-retail',
    sectorId: 'retail',
    bundleId: 'growthExpansion',
    insightPackId: 'insight-growth-retail',
    lookupResponseId: 'lookup-growth-retail',
    defaultOutreach: 'meeting',
    alert: {
      id: 'alert-growth-retail',
      title: 'Expansion capacity signal detected',
      summary: 'Collections, cash balances, and repayment behavior support two additional franchise sites.',
      priority: 'P1',
      confidence: 87,
      whyNow: 'Merchant inflows accelerated for three cycles while overdraft use stayed flat.',
      supportingData: [
        { label: 'Merchant collections', value: '+18%' },
        { label: 'Average operating balance', value: 'R8.4m' },
        { label: 'Overdraft utilization', value: '22%' },
      ],
    },
  },
  {
    id: 'liquidity-manufacturing',
    typeId: 'liquidity',
    label: 'Liquidity risk',
    shortLabel: 'Liquidity',
    severity: 'warning',
    clientId: 'mahlangu-manufacturing',
    sectorId: 'manufacturing',
    bundleId: 'liquidityStabilisation',
    insightPackId: 'insight-liquidity-manufacturing',
    lookupResponseId: 'lookup-liquidity-manufacturing',
    defaultOutreach: 'call',
    alert: {
      id: 'alert-liquidity-manufacturing',
      title: 'Liquidity stress emerging before procurement peak',
      summary: 'Supplier payments are bunching earlier while collections lag the previous quarter.',
      priority: 'P1',
      confidence: 82,
      whyNow: 'Procurement needs are rising earlier and debtor days have widened by one week.',
      supportingData: [
        { label: 'Supplier acceleration', value: '+14 days earlier' },
        { label: 'Debtor days delta', value: '+7 days' },
        { label: 'Cash runway', value: '31 days' },
      ],
    },
  },
  {
    id: 'sector-logistics',
    typeId: 'sector',
    label: 'Sector disruption',
    shortLabel: 'Sector',
    severity: 'critical',
    clientId: 'transit-logistics',
    sectorId: 'transport',
    bundleId: 'sectorResilience',
    insightPackId: 'insight-sector-logistics',
    lookupResponseId: 'lookup-sector-logistics',
    defaultOutreach: 'meeting',
    alert: {
      id: 'alert-sector-logistics',
      title: 'Transport margin pressure requires proactive cover',
      summary: 'Fuel volatility and delayed settlements are increasing pressure on day-to-day working capital.',
      priority: 'P1',
      confidence: 85,
      whyNow: 'Corridor settlement times and diesel pressure both moved outside the six-month range.',
      supportingData: [
        { label: 'Diesel volatility', value: '+11%' },
        { label: 'Settlement delay', value: '+6 days' },
        { label: 'Liquidity buffer', value: '1.7x weekly payroll' },
      ],
    },
  },
  {
    id: 'growth-distributor',
    typeId: 'growth',
    label: 'Growth signal',
    shortLabel: 'Growth',
    severity: 'positive',
    clientId: 'meridian-distributor',
    sectorId: 'distribution',
    bundleId: 'growthExpansion',
    insightPackId: 'insight-growth-distributor',
    lookupResponseId: 'lookup-growth-distributor',
    defaultOutreach: 'email',
    alert: {
      id: 'alert-growth-distributor',
      title: 'Cross-sector demand signal detected',
      summary: 'Digital collections and stock turn suggest capacity for controlled market expansion.',
      priority: 'P3',
      confidence: 84,
      whyNow: 'Sales growth is accelerating while cash collection velocity remains stable.',
      supportingData: [
        { label: 'Digital sales growth', value: '+22%' },
        { label: 'Stock turn', value: '+12%' },
        { label: 'Collection lag', value: '24 day cycle' },
      ],
    },
  },
];

export const insightPacks = {
  'insight-growth-retail': {
    headline: 'Nkosi Retail Group can expand two additional sites without stretching liquidity.',
    confidence: 87,
    whyNow: 'Stronger inflows, stable utilization, and healthy operating balances point to controlled expansion headroom.',
    whatHappened: 'Client transactional data shows sustained growth in collections while day-to-day liquidity remains disciplined.',
    whyItMatters: 'This is a strong advisory moment because the client can discuss expansion from a position of operating control rather than funding pressure.',
    whatToDoNext: 'Validate the rollout plan, confirm pre-approved appetite, and move into a strategy meeting within 48 hours.',
    recommendedAction: 'Lead with the Growth / Expansion bundle and schedule an advisory meeting.',
    transactionalMetrics: [
      { label: 'Merchant inflows', value: '+18%', meta: 'Last 90 days' },
      { label: 'Average operating balance', value: 'R8.4m', meta: 'Held above seasonal plan' },
      { label: 'Overdraft utilization', value: '22%', meta: 'Stable over three cycles' },
    ],
    transactionalNarrative: 'The model is reading the client account, collections, and cash-flow data alongside SystemicLogic SME growth papers on niche positioning and tailored financing structures.',
    richResponse: {
      title: 'Detailed model interpretation',
      blocks: [
        paragraphBlock('growth-retail-context', [
          citedText('The model is reading the client account, collections, and cash-flow data alongside SystemicLogic SME growth papers on niche positioning and tailored financing structures.', ['merchantPulse', 'cashCycle', 'kbWinningNiche']),
        ]),
        paragraphBlock('growth-retail-data', [
          citedText('The latest transactional extract shows merchant settlements up 18% over the last 90 days, average operating balances holding above R8.4m, and overdraft utilization staying flat at 22%. ', ['merchantPulse', 'cashCycle']),
          citedText('Volume growth is therefore flowing through to cash rather than being absorbed by working-capital strain.', ['cashCycle']),
        ]),
        bulletBlock('growth-retail-evidence', [
          [
            citedText('The client story is strongest when the RM leads with stronger takings and stable liquidity rather than a generic growth script.', ['merchantPulse', 'cashCycle']),
          ],
          [
            citedText('The SME paper reinforces that banks win these moments by leading with a focused proposition instead of a broad, undifferentiated offer.', ['kbWinningNiche']),
          ],
        ]),
        numberedBlock('growth-retail-action', [
          [
            citedText('Frame the conversation around two-site expansion capacity while cash discipline is still visible in the operating account.', ['merchantPulse', 'cashCycle']),
          ],
          [
            citedText('Package the term loan with a working-capital buffer so the recommendation mirrors the tailored two-tranche financing approach described in the SME paper.', ['kbWinningTailoredFinance', 'cashCycle']),
          ],
        ]),
      ],
    },
    bundleEvidence: {
      metrics: [
        { label: 'Liquidity cover', value: '2.8x', meta: 'Average weekly commitments' },
        { label: 'Cash conversion', value: '29 days', meta: 'Stable through growth' },
        { label: 'Expansion-ready capacity', value: '2 sites', meta: 'Within policy appetite' },
      ],
      notes: [
        {
          title: 'Relevant transactional signal',
          body: 'Collections growth has been consistent for three cycles and end-of-day balances remain above the client operating range needed to absorb a stock build.',
        },
        {
          title: 'Why the bundle fits',
          body: 'The term loan funds rollout, the working-capital buffer protects cash timing, and merchant optimization helps the client sustain collection efficiency as footprint grows.',
        },
        {
          title: 'RM discussion angle',
          body: 'Open with trading momentum and cash discipline, then position funding as an execution enabler rather than a rescue product.',
        },
      ],
    },
    clientFacingDraft: `We have reviewed your recent trading flows and can see that collections have accelerated while day-to-day liquidity has remained controlled.

That combination suggests you may be well placed to fund two additional sites without putting unnecessary pressure on working capital. Retail sector specialists are also noting that operators with disciplined cash conversion are moving earlier on expansion decisions this season.

We would like to discuss a simple package combining expansion funding with a working-capital buffer so that stock build and site rollout can stay aligned.`,
    trendData: [{ period: 'Jan', signal: 62 }, { period: 'Feb', signal: 68 }, { period: 'Mar', signal: 74 }, { period: 'Apr', signal: 81 }, { period: 'May', signal: 87 }],
    sourceIds: ['merchantPulse', 'cashCycle', 'kbWinningNiche', 'kbWinningTailoredFinance'],
  },
  'insight-liquidity-manufacturing': {
    headline: 'Mahlangu Components needs pre-emptive liquidity cover before procurement intensity peaks.',
    confidence: 82,
    whyNow: 'Supplier outflows are arriving earlier while collections continue to lengthen.',
    whatHappened: 'Client transactional data shows procurement payments pulling forward while receivables recovery has drifted by roughly one week.',
    whyItMatters: 'Acting now keeps the RM in control of the conversation and reduces the risk of a reactive funding request later in the cycle.',
    whatToDoNext: 'Lead with working-capital stabilization, confirm receivables finance, and package cash visibility.',
    recommendedAction: 'Package the Liquidity Stabilisation bundle and start with a call today.',
    transactionalMetrics: [
      { label: 'Supplier payment timing', value: '14 days earlier', meta: 'Against prior cycle' },
      { label: 'Debtor days', value: '54 days', meta: '+7 day movement' },
      { label: 'Cash runway', value: '31 days', meta: 'Below normal operating comfort' },
    ],
    transactionalNarrative: 'The model is combining payment timing, receivables behaviour, and current balance patterns with SystemicLogic papers on proactive risk management and process discipline.',
    richResponse: {
      title: 'Detailed model interpretation',
      blocks: [
        paragraphBlock('liquidity-manufacturing-context', [
          citedText('The model is combining payment timing, receivables behaviour, and current balance patterns with SystemicLogic papers on proactive risk management and process discipline.', ['procurementWatch', 'cashCycle', 'kbCollectionsStrategic', 'kbRiskReactive']),
        ]),
        paragraphBlock('liquidity-manufacturing-data', [
          citedText('The client transactional view shows supplier payments bunching earlier, debtor days widening to 54 days, and average cash runway compressing to 31 days. ', ['procurementWatch', 'cashCycle']),
          citedText('None of those indicators is critical on its own, but together they point to a tightening working-capital cycle before procurement intensity peaks.', ['cashCycle', 'kbRiskReactive']),
        ]),
        bulletBlock('liquidity-manufacturing-pressure', [
          [
            citedText('Earlier supplier settlements mean the funding gap is arriving before the client would normally feel it in headline balances.', ['procurementWatch', 'kbCollectionsStrategic']),
          ],
          [
            citedText('Longer receivables recovery reduces the room to wait, which is why better process visibility matters before the next cycle hardens.', ['procurementWatch', 'cashCycle', 'kbCollectionsProcess']),
          ],
        ]),
        tableBlock(
          'liquidity-manufacturing-table',
          [
            { id: 'signal', label: 'Signal' },
            { id: 'meaning', label: 'What it means' },
            { id: 'response', label: 'Recommended response' },
          ],
          [
            tableRow('liquidity-manufacturing-row-1', [
              tableCell([citedText('Supplier payments are landing earlier than the prior cycle.', ['procurementWatch'])]),
              tableCell([citedText('Pressure is building before the client reaches a visibly stressed state.', ['kbCollectionsStrategic', 'kbRiskReactive'])]),
              tableCell([citedText('Use a flexible revolver to absorb procurement timing pressure.', ['cashCycle'])]),
            ]),
            tableRow('liquidity-manufacturing-row-2', [
              tableCell([citedText('Debtor days have widened to 54 days and runway is down to 31 days.', ['procurementWatch', 'cashCycle'])]),
              tableCell([citedText('The process paper argues for earlier visibility and intervention before operating friction compounds.', ['kbCollectionsProcess'])]),
              tableCell([citedText('Pair receivables acceleration with daily cash visibility.', ['cashCycle', 'kbCollectionsStrategic'])]),
            ]),
          ],
        ),
      ],
    },
    bundleEvidence: {
      metrics: [
        { label: 'Average collections lag', value: '+7 days', meta: 'Quarter on quarter' },
        { label: 'Working-capital gap', value: 'R3.1m', meta: 'At procurement peak' },
        { label: 'Liquidity headroom', value: 'Moderate', meta: 'Still addressable early' },
      ],
      notes: [
        {
          title: 'Relevant transactional signal',
          body: 'Outbound supplier timing is tightening faster than inbound collections, which is exactly where receivables acceleration and flexible liquidity provide value.',
        },
        {
          title: 'Why the bundle fits',
          body: 'The revolver bridges procurement timing, invoice discounting shortens the receivables gap, and the cash console improves treasury visibility before stress becomes visible to the client.',
        },
        {
          title: 'RM discussion angle',
          body: 'Frame the conversation as resilience planning around the operating cycle, not as a late-stage funding intervention.',
        },
      ],
    },
    clientFacingDraft: `We are seeing earlier supplier payment requirements and slower collections in your recent transactional data, which suggests the next procurement cycle may place more pressure on day-to-day liquidity.

Sector specialists are seeing similar timing volatility across manufacturing SMEs, especially where procurement windows are shifting ahead of receivables recovery.

We would like to discuss a practical working-capital package that can smooth cash timing, improve visibility, and keep procurement activity moving without unnecessary funding friction.`,
    trendData: [{ period: 'Jan', signal: 71 }, { period: 'Feb', signal: 66 }, { period: 'Mar', signal: 63 }, { period: 'Apr', signal: 59 }, { period: 'May', signal: 54 }],
    sourceIds: ['procurementWatch', 'cashCycle', 'kbCollectionsStrategic', 'kbCollectionsProcess', 'kbRiskReactive'],
  },
  'insight-sector-logistics': {
    headline: 'Transit Flow Logistics should lock in resilience funding before sector pressure hits harder.',
    confidence: 85,
    whyNow: 'Transport settlements have slowed while fuel costs are trending outside the recent range.',
    whatHappened: 'Client transactional data shows settlement timing slipping just as external fuel pressure is increasing.',
    whyItMatters: 'This is a differentiated RM moment because sector pressure can be translated into client-level liquidity and margin actions before operations are disrupted.',
    whatToDoNext: 'Use the sector signal to frame a resilience conversation and review the pre-approved margin line.',
    recommendedAction: 'Open with the Sector Resilience bundle and current transport commentary.',
    transactionalMetrics: [
      { label: 'Settlement delay', value: '+6 days', meta: 'Key corridors' },
      { label: 'Liquidity buffer', value: '1.7x', meta: 'Weekly payroll cover' },
      { label: 'Diesel pressure', value: '+11%', meta: 'Outside six-month range' },
    ],
    transactionalNarrative: 'The model is linking client settlement timing and liquidity cover with SystemicLogic risk papers on reactive postures and integrated response design.',
    richResponse: {
      title: 'Detailed model interpretation',
      blocks: [
        paragraphBlock('sector-logistics-context', [
          citedText('The model is linking client settlement timing and liquidity cover with SystemicLogic risk papers on reactive postures and integrated response design.', ['transportLedger', 'cashCycle', 'kbRiskReactive', 'kbRiskIntegrated']),
        ]),
        paragraphBlock('sector-logistics-data', [
          citedText('The client ledger shows corridor settlements arriving six days later than the recent norm while the liquidity buffer has narrowed to roughly 1.7 times weekly payroll. ', ['transportLedger', 'cashCycle']),
          citedText('On the client data alone, there is still room to act, but the direction of travel is negative.', ['cashCycle']),
        ]),
        paragraphBlock('sector-logistics-kb', [
          citedText('The risk paper is useful here because it treats reactive posture as a core weakness once linked pressures begin to move together. ', ['kbRiskReactive']),
          citedText('That makes the sector context additive: it explains why settlement drag and cost pressure should be handled as one integrated management problem rather than as isolated symptoms.', ['kbRiskIntegrated']),
        ]),
        numberedBlock('sector-logistics-action', [
          [
            citedText('Start with the client ledger: settlements are slower, liquidity cover is tightening, and the RM can already show the direction of travel.', ['transportLedger', 'cashCycle']),
          ],
          [
            citedText('Explain that the knowledge base warns against waiting for a harder event once connected risks have begun to compound.', ['kbRiskReactive']),
          ],
          [
            citedText('Move into a resilience package that treats margin protection, cash timing, and treasury support as one integrated response.', ['kbRiskIntegrated', 'cashCycle']),
          ],
        ]),
      ],
    },
    bundleEvidence: {
      metrics: [
        { label: 'Settlement drag', value: '+6 days', meta: 'Compared with rolling baseline' },
        { label: 'Fuel cost sensitivity', value: 'High', meta: 'Based on route mix' },
        { label: 'Margin resilience window', value: '6-8 weeks', meta: 'Before tighter pressure' },
      ],
      notes: [
        {
          title: 'Relevant transactional signal',
          body: 'Receivables timing is worsening while available liquidity is still sufficient to act early, which is the strongest moment for margin protection and treasury advice.',
        },
        {
          title: 'Why the bundle fits',
          body: 'The margin line protects operating flexibility, collections sweep improves cash timing, and hedging support gives the RM a sector-informed reason to broaden the conversation.',
        },
        {
          title: 'RM discussion angle',
          body: 'Lead with settlement delays and cost pressure, then show that Absa is bringing both client evidence and sector knowledge into the same recommendation.',
        },
      ],
    },
    clientFacingDraft: `Recent settlement timing and fuel-cost pressure suggest that the next few weeks could place more strain on working capital and operating margins.

Across the transport sector, specialists are seeing delayed corridor settlements and higher cost volatility at the same time, which increases the value of acting before cash pressure becomes visible in operations.

We would like to discuss a resilience package focused on margin protection, cash timing, and treasury support so that you can respond early and preserve flexibility.`,
    trendData: [{ period: 'Jan', signal: 74 }, { period: 'Feb', signal: 72 }, { period: 'Mar', signal: 68 }, { period: 'Apr', signal: 61 }, { period: 'May', signal: 55 }],
    sourceIds: ['transportLedger', 'cashCycle', 'kbRiskReactive', 'kbRiskIntegrated'],
  },
  'insight-growth-distributor': {
    headline: 'Meridian Trade Grid is ready for controlled expansion into adjacent sectors.',
    confidence: 84,
    whyNow: 'Digital collections are converting into cash efficiently while inventory turnover remains disciplined.',
    whatHappened: 'Client transactional data shows faster digital sales growth without the usual deterioration in cash collection or stock movement.',
    whyItMatters: 'This is an opportunity to move from reactive support into proactive advisory while growth quality is still visible in the account.',
    whatToDoNext: 'Confirm where working-capital cover matters most and tee up a focused follow-up discussion.',
    recommendedAction: 'Use the Growth / Expansion bundle with a client-specific treasury angle.',
    transactionalMetrics: [
      { label: 'Digital sales growth', value: '+22%', meta: 'Rolling 90 days' },
      { label: 'Stock turn', value: '+12%', meta: 'Without cash drag' },
      { label: 'Collections cycle', value: '24 days', meta: 'Holding steady through growth' },
    ],
    transactionalNarrative: 'The model is reading digital sales, stock movement, and collections quality together with SystemicLogic papers on focused SME propositions and operating-model discipline.',
    richResponse: {
      title: 'Detailed model interpretation',
      blocks: [
        paragraphBlock('growth-distributor-context', [
          citedText('The model is reading digital sales, stock movement, and collections quality together with SystemicLogic papers on focused SME propositions and operating-model discipline.', ['inventoryVelocity', 'cashCycle', 'kbWinningNiche', 'kbTechOperatingModel']),
        ]),
        paragraphBlock('growth-distributor-data', [
          citedText('Meridian is showing 22% growth in digital sales, improved stock turn, and a collections cycle that has stayed at 24 days even as volumes increased. ', ['inventoryVelocity', 'cashCycle']),
          citedText('That combination matters because it shows the business is scaling without losing cash discipline.', ['cashCycle']),
        ]),
        bulletBlock('growth-distributor-evidence', [
          [
            citedText('Growth is arriving alongside cleaner stock movement and stable collections, so the RM can talk about quality of growth rather than raw volume.', ['inventoryVelocity', 'cashCycle']),
          ],
          [
            citedText('The SME and technology papers both reinforce that stronger propositions are specific and operationally grounded, not just larger versions of yesterday’s offer.', ['kbWinningNiche', 'kbTechOperatingModel']),
          ],
        ]),
        numberedBlock('growth-distributor-action', [
          [
            citedText('Confirm where adjacent-sector expansion will place the most pressure on working capital and stock timing.', ['inventoryVelocity']),
          ],
          [
            citedText('Pair the term loan with a working-capital buffer so the recommendation remains tailored to the client’s operating pattern.', ['kbWinningTailoredFinance', 'cashCycle']),
          ],
          [
            citedText('Add treasury support because the technology paper argues that scaling outcomes increasingly depend on the operating model itself.', ['kbTechOperatingModel']),
          ],
        ]),
      ],
    },
    bundleEvidence: {
      metrics: [
        { label: 'Cash conversion stability', value: '24 days', meta: 'Stable through rapid growth' },
        { label: 'Inventory velocity', value: '+12%', meta: 'Improving stock turn' },
        { label: 'Expansion readiness', value: 'High', meta: 'Operational flows support next move' },
      ],
      notes: [
        {
          title: 'Relevant transactional signal',
          body: 'Growth is arriving alongside stable collections and faster stock movement, which gives the RM a credible base for expansion funding and treasury support.',
        },
        {
          title: 'Why the bundle fits',
          body: 'Expansion funding addresses growth capacity, the working-capital buffer protects execution timing, and treasury support helps maintain the cash discipline already visible in the account.',
        },
        {
          title: 'RM discussion angle',
          body: 'Keep the discussion focused on disciplined growth quality and how Absa can help the client scale without losing control of cash conversion.',
        },
      ],
    },
    clientFacingDraft: `Your recent transactional data shows strong digital sales growth, faster stock turn, and collections that have remained disciplined while volumes increased.

That pattern suggests you may be well placed to expand into adjacent sectors without compromising working-capital control. Sector specialists are also seeing the strongest distributors maintain cash conversion while they scale.

We would welcome a discussion on a focused growth package that combines funding capacity with treasury support to keep expansion disciplined.`,
    trendData: [{ period: 'Jan', signal: 64 }, { period: 'Feb', signal: 69 }, { period: 'Mar', signal: 76 }, { period: 'Apr', signal: 81 }, { period: 'May', signal: 84 }],
    sourceIds: ['inventoryVelocity', 'cashCycle', 'kbWinningNiche', 'kbWinningTailoredFinance', 'kbTechOperatingModel'],
  },
};

export const sectorBriefings = {
  retail: { id: 'retail', name: 'Retail', thesis: 'Operators with disciplined cash conversion are best positioned to move early on expansion decisions.', growthTrend: '+7% sector momentum', riskSignal: 'Inventory timing remains sensitive', opportunitySignal: 'Expansion-ready operators gaining share', commentary: 'Sector expert papers point to a cleaner divide between operators preserving cash discipline and those relying on late-cycle funding support.', trendData: [{ period: 'Q1', growth: 51, risk: 43 }, { period: 'Q2', growth: 56, risk: 41 }, { period: 'Q3', growth: 61, risk: 39 }, { period: 'Q4', growth: 68, risk: 37 }], drivers: ['Footfall recovery is concentrated in stronger operators.', 'Collections quality remains a differentiator.', 'Expansion appetite is building where liquidity remains controlled.'] },
  manufacturing: { id: 'manufacturing', name: 'Manufacturing', thesis: 'Procurement volatility is increasing the value of treasury visibility and flexible liquidity structures.', growthTrend: '+3% sector momentum', riskSignal: 'Procurement timing volatility elevated', opportunitySignal: 'Receivables finance is underused', commentary: 'Sector specialists are seeing earlier funding gaps emerge where procurement cycles move faster than receivables recovery.', trendData: [{ period: 'Q1', growth: 48, risk: 52 }, { period: 'Q2', growth: 46, risk: 58 }, { period: 'Q3', growth: 44, risk: 61 }, { period: 'Q4', growth: 47, risk: 57 }], drivers: ['Funding gaps are appearing earlier.', 'Receivables timing remains inconsistent.', 'Payment tooling can reduce operational stress.'] },
  transport: { id: 'transport', name: 'Transport & Logistics', thesis: 'Margin pressure is rising as fuel volatility and settlement delays compound each other.', growthTrend: '+4% sector momentum', riskSignal: 'Margin compression accelerating', opportunitySignal: 'Resilience funding and treasury advice are timely', commentary: 'Sector knowledge is most useful when it is translated into client-level working-capital and margin-protection actions before operations are disrupted.', trendData: [{ period: 'Q1', growth: 54, risk: 46 }, { period: 'Q2', growth: 53, risk: 52 }, { period: 'Q3', growth: 49, risk: 61 }, { period: 'Q4', growth: 45, risk: 68 }], drivers: ['Fuel cost pressure is outside the recent range.', 'Settlement timing is widening on key corridors.', 'Fleet efficiency conversations are regaining relevance.'] },
  distribution: { id: 'distribution', name: 'Tech-enabled Distribution', thesis: 'Digitally enabled distributors are using cash discipline and stock turn as strategic growth advantages.', growthTrend: '+9% sector momentum', riskSignal: 'Treasury discipline must scale with growth', opportunitySignal: 'Expansion planning is accelerating', commentary: 'Sector papers suggest the strongest distributors are pairing growth with disciplined cash conversion rather than chasing volume alone.', trendData: [{ period: 'Q1', growth: 57, risk: 35 }, { period: 'Q2', growth: 62, risk: 34 }, { period: 'Q3', growth: 68, risk: 32 }, { period: 'Q4', growth: 74, risk: 33 }], drivers: ['Digital conversion rates are improving.', 'Collections velocity remains strong.', 'Expansion appetite is broadening beyond core verticals.'] },
};

export const suggestedQueries = [
  'How should I position expansion funding for a retail client with stronger takings?',
  'What can I recommend to smooth procurement pressure for a manufacturing SME?',
  'How do I explain the transport sector signal to a logistics client?',
  'Which pre-approved products fit a growth-ready distributor?',
  'How do I connect transactional data to sector knowledge in a client discussion?',
];

export const lookupIntentOptions = [
  {
    id: 'generic',
    label: 'Generic lookup',
    description: 'Search across the whole knowledge base and client ecosystem.',
  },
  {
    id: 'kb-only',
    label: 'Knowledge base only',
    description: 'Exclude all client context and keep the lookup grounded only in the knowledge base.',
  },
  {
    id: 'client-only',
    label: 'Client context only',
    description: 'Exclude all knowledge base information and use only client context.',
  },
];

export const lookupAgentPresets = [
  {
    id: 'pre-meeting-brief',
    label: 'Pre-meeting brief',
    description: 'Prepare a concise briefing for the next client interaction.',
  },
  {
    id: 'revenue-opportunity-scan',
    label: 'Revenue opportunity scan',
    description: 'Identify and rank the strongest commercial opportunities.',
  },
  {
    id: 'client-risk-assessment',
    label: 'Client risk assessment',
    description: 'Summarize current exposure, trend, and watchpoints.',
  },
];

export const lookupAgentPlaceholder = {
  id: 'build-agent',
  label: 'Build agent',
  description: 'Create a custom advisory agent tuned to a specific workflow.',
  status: 'Coming soon',
};

export const lookupResponses = {
  'lookup-growth-retail': {
    scenarioId: 'growth-retail',
    prompt: 'How should I position expansion funding for a retail client with stronger takings?',
    keywords: ['retail', 'expansion', 'takings', 'growth'],
    title: 'Position the discussion around controlled expansion, not generic lending.',
    confidence: 88,
    summary: 'Lead with the client transaction story first, then use the SME paper to explain why a focused proposition makes sense now.',
    richResponse: {
      title: 'Response',
      blocks: [
        paragraphBlock('lookup-growth-retail-summary', [
          citedText('Lead with the client transaction story first, then use the SME paper to explain why a focused proposition makes sense now.', ['merchantPulse', 'cashCycle', 'kbWinningNiche']),
        ]),
        numberedBlock('lookup-growth-retail-steps', [
          [
            citedText('Start with the client evidence: merchant settlements are up, operating balances have stayed healthy, and overdraft use has not moved with the higher trading volumes.', ['merchantPulse', 'cashCycle']),
          ],
          [
            citedText('Then use the SME paper as context by explaining that growth conversations are strongest when the bank leads with a clear niche proposition rather than a generic offer.', ['kbWinningNiche']),
          ],
          [
            citedText('Move into a simple package discussion: expansion funding for the rollout plus a working-capital buffer that mirrors the tailored financing structure described in the paper.', ['kbWinningTailoredFinance', 'cashCycle']),
          ],
        ]),
      ],
    },
    recommendedAction: 'Set up an advisory meeting and review the Growth / Expansion bundle.',
    productIds: ['term-loan', 'wc-buffer', 'merchant-upgrade'],
    sourceIds: ['merchantPulse', 'cashCycle', 'kbWinningNiche', 'kbWinningTailoredFinance'],
  },
  'lookup-liquidity-manufacturing': {
    scenarioId: 'liquidity-manufacturing',
    prompt: 'What can I recommend to smooth procurement pressure for a manufacturing SME?',
    keywords: ['manufacturing', 'procurement', 'liquidity', 'smooth'],
    title: 'Frame the solution as cycle stabilization across payables, receivables, and visibility.',
    confidence: 83,
    summary: 'The strongest answer is to describe the timing gap already visible in the account, then show how earlier intervention and better visibility close it.',
    richResponse: {
      title: 'Response',
      blocks: [
        paragraphBlock('lookup-liquidity-manufacturing-summary', [
          citedText('The strongest answer is to describe the timing gap already visible in the account, then show how earlier intervention and better visibility close it.', ['procurementWatch', 'cashCycle', 'kbCollectionsStrategic']),
        ]),
        bulletBlock('lookup-liquidity-manufacturing-points', [
          [
            citedText('Start with the operating-cycle signal: supplier payments are arriving earlier, receivables are taking longer to settle, and runway is narrowing.', ['procurementWatch', 'cashCycle']),
          ],
          [
            citedText('Use the collections paper to explain why acting early is sensible. It frames visibility and intervention as strategic capabilities, not as late-stage clean-up.', ['kbCollectionsStrategic', 'kbCollectionsProcess']),
          ],
          [
            citedText('Recommend a stabilization package that combines flexible liquidity, receivables acceleration, and daily cash visibility so the solution maps directly to the timing gap in the account.', ['cashCycle', 'kbCollectionsStrategic']),
          ],
        ]),
      ],
    },
    recommendedAction: 'Use the Liquidity Stabilisation bundle and start with a same-day RM call.',
    productIds: ['revolver', 'invoice-discounting', 'cash-console'],
    sourceIds: ['procurementWatch', 'cashCycle', 'kbCollectionsStrategic', 'kbCollectionsProcess'],
  },
  'lookup-sector-logistics': {
    scenarioId: 'sector-logistics',
    prompt: 'How do I explain the transport sector signal to a logistics client?',
    keywords: ['transport', 'logistics', 'sector', 'signal'],
    title: 'Translate sector pressure into margin protection and working-capital resilience.',
    confidence: 86,
    summary: 'Explain that the signal is grounded in the client ledger first, with the risk paper clarifying why the trend should be acted on now.',
    richResponse: {
      title: 'Response',
      blocks: [
        paragraphBlock('lookup-sector-logistics-summary', [
          citedText('Explain that the signal is grounded in the client ledger first, with the risk paper clarifying why the trend should be acted on now.', ['transportLedger', 'cashCycle', 'kbRiskReactive']),
        ]),
        numberedBlock('lookup-sector-logistics-steps', [
          [
            citedText('Begin with what is already visible in the client account: settlement timing has stretched, the liquidity buffer is narrowing, and the direction of travel has turned negative.', ['transportLedger', 'cashCycle']),
          ],
          [
            citedText('Then explain that the risk paper warns against reactive posture once linked pressures begin to move together. That is why the settlement shift matters more now than it would in a calmer operating environment.', ['kbRiskReactive', 'kbRiskIntegrated']),
          ],
          [
            citedText('That leads naturally into a resilience discussion: margin protection, collections optimization, and treasury support are all designed to preserve flexibility before operational pressure escalates.', ['kbRiskIntegrated', 'cashCycle']),
          ],
        ]),
      ],
    },
    recommendedAction: 'Lead with the Sector Resilience bundle and include current transport commentary.',
    productIds: ['margin-line', 'collections-sweep', 'hedging-desk'],
    sourceIds: ['transportLedger', 'cashCycle', 'kbRiskReactive', 'kbRiskIntegrated'],
  },
  'lookup-growth-distributor': {
    scenarioId: 'growth-distributor',
    prompt: 'Which pre-approved products fit a growth-ready distributor?',
    keywords: ['distributor', 'growth', 'pre-approved', 'products'],
    title: 'Match the package to disciplined growth, not to raw sales momentum.',
    confidence: 84,
    summary: 'The key is to show that growth is converting into cash cleanly, then position funding and treasury support around that operating quality.',
    richResponse: {
      title: 'Response',
      blocks: [
        paragraphBlock('lookup-growth-distributor-summary', [
          citedText('The key is to show that growth is converting into cash cleanly, then position funding and treasury support around that operating quality.', ['inventoryVelocity', 'cashCycle']),
        ]),
        bulletBlock('lookup-growth-distributor-points', [
          [
            citedText('Start with the client profile: digital sales growth is strong, stock turn is improving, and collections have stayed disciplined. That means the client is scaling without creating obvious cash drag.', ['inventoryVelocity', 'cashCycle']),
          ],
          [
            citedText('Use the knowledge base to reinforce the shape of the offer. The SME paper favours focused propositions, and the tech paper ties better scaling outcomes to the operating model itself.', ['kbWinningNiche', 'kbTechOperatingModel']),
          ],
          [
            citedText('Lead with the pre-approved term loan and working-capital buffer, then add treasury support so the package preserves the operating discipline that makes the signal compelling.', ['kbWinningTailoredFinance', 'cashCycle']),
          ],
        ]),
      ],
    },
    recommendedAction: 'Send a growth-focused follow-up and tee up a deeper advisory discussion.',
    productIds: ['term-loan', 'wc-buffer', 'fx-lite'],
    sourceIds: ['inventoryVelocity', 'cashCycle', 'kbWinningNiche', 'kbWinningTailoredFinance', 'kbTechOperatingModel'],
  },
};

export const scenarioTriggerMap = { growth: 'growth-retail', liquidity: 'liquidity-manufacturing', sector: 'sector-logistics' };

export function buildInitialAlerts() {
  return scenarios
    .map((scenario, index) => ({
      id: scenario.alert.id,
      scenarioId: scenario.id,
      clientId: scenario.clientId,
      priority: scenario.alert.priority,
      severity: scenario.severity,
      title: scenario.alert.title,
      summary: scenario.alert.summary,
      confidence: scenario.alert.confidence,
      whyNow: scenario.alert.whyNow,
      supportingData: scenario.alert.supportingData,
      status: index === 0 ? 'new' : 'monitoring',
      updatedLabel: index === 0 ? 'Just now' : 'Today',
    }))
    .sort(sortAlerts);
}

export function buildInitialBundleSelection() {
  return Object.fromEntries(
    scenarios.map(scenario => {
      const bundle = productBundles[scenario.bundleId];
      return [scenario.id, { selectedProductIds: bundle.products.map(product => product.id), customTerms: Object.fromEntries(bundle.products.filter(product => product.termOptions?.length).map(product => [product.id, product.termOptions[0]])) }];
    }),
  );
}

export function buildInitialInsightDrafts() {
  return Object.fromEntries(
    scenarios.map(scenario => [scenario.id, insightPacks[scenario.insightPackId].clientFacingDraft]),
  );
}

export function sortAlerts(left, right) {
  const priorityDelta = priorityRank[left.priority] - priorityRank[right.priority];
  return priorityDelta !== 0 ? priorityDelta : right.confidence - left.confidence;
}

export const getClientById = clientId => clients.find(client => client.id === clientId) ?? clients[0];
export const getScenarioById = scenarioId => scenarios.find(scenario => scenario.id === scenarioId) ?? scenarios[0];
export const getDefaultScenarioForClient = clientId => scenarios.find(scenario => scenario.clientId === clientId) ?? scenarios[0];
export const getBundleById = bundleId => productBundles[bundleId];
export const getInsightPackById = insightPackId => insightPacks[insightPackId];
export const getSectorBriefingById = sectorId => sectorBriefings[sectorId];
export const getLookupResponseById = responseId => lookupResponses[responseId];
export const getLookupAgentById = agentId => lookupAgentPresets.find(agent => agent.id === agentId) ?? null;
export const getProductById = productId => allProducts.find(product => product.id === productId) ?? null;
export const getSources = sourceIds => getCitations(sourceIds);

export function resolveLookupResponse(query, activeScenarioId, fallbackResponseId = null) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return getLookupResponseById(fallbackResponseId ?? getScenarioById(activeScenarioId).lookupResponseId);
  }
  const matched = Object.values(lookupResponses).find(response => response.keywords.some(keyword => normalizedQuery.includes(keyword)));
  return matched ?? getLookupResponseById(fallbackResponseId ?? getScenarioById(activeScenarioId).lookupResponseId);
}

export function resolveLookupResponseId(query, activeScenarioId, fallbackResponseId = null) {
  const matchedResponse = resolveLookupResponse(query, activeScenarioId, fallbackResponseId);
  return Object.entries(lookupResponses).find(([, response]) => response === matchedResponse)?.[0] ?? fallbackResponseId ?? getScenarioById(activeScenarioId).lookupResponseId;
}
