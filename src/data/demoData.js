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
    sectorId: 'wholesale',
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
};

export const sectorBriefings = {
  retail: {
    id: 'retail',
    name: 'Retail & Franchise',
    thesis: 'Operators with disciplined cash conversion are best positioned to move early on expansion decisions.',
    growthTrend: '+7% sector momentum',
    riskSignal: 'Inventory timing remains sensitive',
    opportunitySignal: 'Expansion-ready operators gaining share',
    commentary: 'Retail and franchise momentum is improving, but the cleanest expansion stories are still coming from operators that can show stable collections, healthy operating balances, and controlled stock timing.',
    trendData: [{ period: 'Q1', growth: 51, risk: 43 }, { period: 'Q2', growth: 56, risk: 41 }, { period: 'Q3', growth: 61, risk: 39 }, { period: 'Q4', growth: 68, risk: 37 }],
    drivers: ['Footfall recovery is concentrated in stronger operators.', 'Collections quality remains a differentiator.', 'Expansion appetite is building where liquidity remains controlled.'],
    statCards: [
      { label: 'Footfall pulse', value: '+7%', meta: 'Selective recovery holding' },
      { label: 'Rollout appetite', value: 'Rising', meta: 'Franchise expansion returning' },
      { label: 'Advisory angle', value: 'Expansion', meta: 'Package growth funding with liquidity control' },
    ],
    sourceIds: ['sectorRetailFranchiseMonitor', 'policyExpansionAppetite', 'kbWinningNiche', 'kbWinningTailoredFinance'],
    richResponse: {
      title: 'Detailed sector report',
      blocks: [
        paragraphBlock('sector-retail-summary', [
          citedText('Retail and franchise operators are moving back into expansion mode, but the sector is still rewarding operators who can prove collections stability and tight cash conversion first. ', ['sectorRetailFranchiseMonitor']),
          citedText('The current expansion appetite standard reinforces that rollout conversations are strongest when they are grounded in operating control rather than rescue funding.', ['policyExpansionAppetite']),
        ]),
        bulletBlock('sector-retail-drivers', [
          [
            citedText('Footfall recovery is not broad-based enough to make generic growth funding the right lead-in for every client.', ['sectorRetailFranchiseMonitor']),
          ],
          [
            citedText('The SME segment paper supports a focused proposition: lead with the operator story, not with a generic lending script.', ['kbWinningNiche']),
          ],
          [
            citedText('Bundling term funding with a working-capital buffer remains the most credible structure where stock build and site rollout need to move together.', ['kbWinningTailoredFinance', 'policyExpansionAppetite']),
          ],
        ]),
        tableBlock(
          'sector-retail-table',
          [
            { id: 'lens', label: 'Lens' },
            { id: 'current', label: 'Current read' },
            { id: 'rm', label: 'RM implication' },
          ],
          [
            tableRow('sector-retail-row-1', [
              tableCell([citedText('Demand')]),
              tableCell([citedText('Footfall and store activity are improving, but selectively.', ['sectorRetailFranchiseMonitor'])]),
              tableCell([citedText('Prioritize operators with visible collections discipline before positioning rollout funding.', ['policyExpansionAppetite'])]),
            ]),
            tableRow('sector-retail-row-2', [
              tableCell([citedText('Positioning')]),
              tableCell([citedText('Growth conversations are winning when they are proposition-led and client-specific.', ['kbWinningNiche'])]),
              tableCell([citedText('Frame Absa as the bank helping the client scale with control, not just providing debt.', ['kbWinningNiche'])]),
            ]),
            tableRow('sector-retail-row-3', [
              tableCell([citedText('Structure')]),
              tableCell([citedText('Bundled growth and liquidity structures match rollout timing better than a single funding line.', ['kbWinningTailoredFinance'])]),
              tableCell([citedText('Lead with execution readiness and working-capital protection.', ['policyExpansionAppetite'])]),
            ]),
          ],
        ),
      ],
    },
  },
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    thesis: 'Agriculture conversations are shifting toward input-cost discipline, harvest timing, and liquidity resilience rather than commodity optimism alone.',
    growthTrend: '+5% sector momentum',
    riskSignal: 'Input and weather variability remain elevated',
    opportunitySignal: 'Seasonal working-capital planning is gaining urgency',
    commentary: 'Agriculture outcomes are still being shaped by weather and input-cost variability, which makes disciplined seasonal funding and payment timing more important than relying on commodity upside alone.',
    trendData: [{ period: 'Q1', growth: 46, risk: 58 }, { period: 'Q2', growth: 51, risk: 55 }, { period: 'Q3', growth: 57, risk: 52 }, { period: 'Q4', growth: 60, risk: 49 }],
    drivers: ['Input-cost pressure remains uneven across subsectors.', 'Harvest-cycle timing still dictates liquidity needs.', 'Resilient operators are planning seasonal cover earlier.'],
    statCards: [
      { label: 'Seasonal pulse', value: '+5%', meta: 'Harvest activity stabilizing' },
      { label: 'Risk watch', value: 'Elevated', meta: 'Weather and input costs volatile' },
      { label: 'Advisory angle', value: 'Seasonality', meta: 'Match funding to delivery and cash cycles' },
    ],
    sourceIds: ['sectorAgricultureMonitor', 'policyWorkingCapitalDiscipline', 'policyReceivablesCoverage', 'kbRiskIntegrated'],
    richResponse: {
      title: 'Detailed sector report',
      blocks: [
        paragraphBlock('sector-agriculture-summary', [
          citedText('Agriculture momentum is improving, but the real determinant of resilience is still how well operators align input spending, harvest timing, and receivables collection through the season. ', ['sectorAgricultureMonitor']),
          citedText('That keeps the working-capital discipline and receivables-coverage standards highly relevant, especially where cash gaps appear before harvest receipts land.', ['policyWorkingCapitalDiscipline', 'policyReceivablesCoverage']),
        ]),
        bulletBlock('sector-agriculture-drivers', [
          [
            citedText('Weather and input variability continue to make generic optimism a poor substitute for disciplined seasonal planning.', ['sectorAgricultureMonitor']),
          ],
          [
            citedText('Integrated risk thinking is useful here because the sector story only becomes clear when cash timing, production risk, and debtor performance are read together.', ['kbRiskIntegrated']),
          ],
          [
            citedText('RM conversations should focus on resilience through the cycle: seasonal liquidity cover, receivables discipline, and early visibility on repayment timing.', ['policyWorkingCapitalDiscipline', 'policyReceivablesCoverage']),
          ],
        ]),
        tableBlock(
          'sector-agriculture-table',
          [
            { id: 'lens', label: 'Lens' },
            { id: 'current', label: 'Current read' },
            { id: 'rm', label: 'RM implication' },
          ],
          [
            tableRow('sector-agriculture-row-1', [
              tableCell([citedText('Seasonality')]),
              tableCell([citedText('Harvest and delivery timing still dominate cash needs.', ['sectorAgricultureMonitor'])]),
              tableCell([citedText('Frame liquidity cover around the seasonal calendar, not a flat annual cycle.', ['policyWorkingCapitalDiscipline'])]),
            ]),
            tableRow('sector-agriculture-row-2', [
              tableCell([citedText('Receivables')]),
              tableCell([citedText('Settlement lags can widen quickly when delivery cycles slip.', ['policyReceivablesCoverage'])]),
              tableCell([citedText('Use early-intervention language before delayed receipts start to compound.', ['policyReceivablesCoverage'])]),
            ]),
            tableRow('sector-agriculture-row-3', [
              tableCell([citedText('Risk view')]),
              tableCell([citedText('The sector must be read through connected operational and financial signals.', ['kbRiskIntegrated'])]),
              tableCell([citedText('Lead with resilience and planning discipline rather than commodity optimism.', ['kbRiskIntegrated'])]),
            ]),
          ],
        ),
      ],
    },
  },
  'public-sector': {
    id: 'public-sector',
    name: 'Public Sector',
    thesis: 'Public-sector counterparties are creating opportunity where payment discipline is improving, but delayed invoice cycles still require liquidity resilience and tighter debtor controls.',
    growthTrend: '+2% sector momentum',
    riskSignal: 'Payment timing remains uneven across entities',
    opportunitySignal: 'Structured debtor visibility is becoming more valuable',
    commentary: 'The public-sector story is not simply about exposure appetite. It is about whether payment timing, budget execution, and debtor concentration are being monitored tightly enough for RM conversations to move from caution into structured opportunity.',
    trendData: [{ period: 'Q1', growth: 42, risk: 59 }, { period: 'Q2', growth: 45, risk: 57 }, { period: 'Q3', growth: 47, risk: 54 }, { period: 'Q4', growth: 50, risk: 52 }],
    drivers: ['Budget drawdowns remain uneven across entities.', 'Debtor concentration can hide liquidity stress.', 'Visibility over invoice cycles is becoming a differentiator.'],
    statCards: [
      { label: 'Budget pulse', value: '+2%', meta: 'Execution stabilizing gradually' },
      { label: 'Payment watch', value: 'Uneven', meta: 'Invoice cycles still volatile' },
      { label: 'Advisory angle', value: 'Debtor control', meta: 'Preserve liquidity around slower payments' },
    ],
    sourceIds: ['sectorPublicSectorMonitor', 'policyPublicSectorPayment', 'kbRiskIntegrated', 'kbCollectionsStrategic'],
    richResponse: {
      title: 'Detailed sector report',
      blocks: [
        paragraphBlock('sector-public-summary', [
          citedText('Public-sector opportunities remain real, but they still need to be filtered through payment timing, budget execution, and debtor concentration rather than revenue potential alone. ', ['sectorPublicSectorMonitor']),
          citedText('That keeps the payment-risk standard central to the conversation because invoice-cycle delays can change liquidity quality quickly even when work remains active.', ['policyPublicSectorPayment']),
        ]),
        bulletBlock('sector-public-drivers', [
          [
            citedText('Budget drawdowns are stabilizing, but payment timing remains too uneven for generic comfort.', ['sectorPublicSectorMonitor']),
          ],
          [
            citedText('Collections strategy is useful because better process visibility improves action before delayed payments become a working-capital event.', ['kbCollectionsStrategic', 'policyPublicSectorPayment']),
          ],
          [
            citedText('Integrated risk thinking helps the RM connect concentration, invoice-cycle delays, and liquidity cover into one management story.', ['kbRiskIntegrated']),
          ],
        ]),
        tableBlock(
          'sector-public-table',
          [
            { id: 'lens', label: 'Lens' },
            { id: 'current', label: 'Current read' },
            { id: 'rm', label: 'RM implication' },
          ],
          [
            tableRow('sector-public-row-1', [
              tableCell([citedText('Budget timing')]),
              tableCell([citedText('Budget execution is improving but still uneven by entity.', ['sectorPublicSectorMonitor'])]),
              tableCell([citedText('Stay selective and keep exposure conversations tied to payment discipline.', ['policyPublicSectorPayment'])]),
            ]),
            tableRow('sector-public-row-2', [
              tableCell([citedText('Debtors')]),
              tableCell([citedText('Debtor concentration can hide stress until payments slip materially.', ['policyPublicSectorPayment'])]),
              tableCell([citedText('Lead with debtor visibility and liquidity cover before balance-sheet expansion.', ['policyPublicSectorPayment'])]),
            ]),
            tableRow('sector-public-row-3', [
              tableCell([citedText('Risk framing')]),
              tableCell([citedText('The sector has to be read through connected operational and liquidity signals.', ['kbRiskIntegrated'])]),
              tableCell([citedText('Translate caution into a structured management plan, not just a no-go answer.', ['kbCollectionsStrategic'])]),
            ]),
          ],
        ),
      ],
    },
  },
  'professional-services': {
    id: 'professional-services',
    name: 'Professional Services',
    thesis: 'Professional services firms are strongest when utilization, fee realization, and debtor control stay aligned as pipeline conversion improves.',
    growthTrend: '+5% sector momentum',
    riskSignal: 'Debtor days can widen quickly when pipeline quality drops',
    opportunitySignal: 'Advisory-led treasury and growth positioning gaining traction',
    commentary: 'Professional services conversations often look asset-light on paper, but the real sector differentiator is how well firms convert utilization and pipeline into cash without allowing debtor days to drift.',
    trendData: [{ period: 'Q1', growth: 52, risk: 41 }, { period: 'Q2', growth: 56, risk: 40 }, { period: 'Q3', growth: 60, risk: 39 }, { period: 'Q4', growth: 63, risk: 38 }],
    drivers: ['Pipeline quality is improving at the top end of the market.', 'Fee realization and utilization remain the key quality filters.', 'Debtor discipline separates healthy growth from hidden strain.'],
    statCards: [
      { label: 'Utilization pulse', value: '+5%', meta: 'Quality pipeline improving' },
      { label: 'Debtor watch', value: 'Tight', meta: 'Collections still the key filter' },
      { label: 'Advisory angle', value: 'Fee-to-cash', meta: 'Translate growth into cleaner cash conversion' },
    ],
    sourceIds: ['sectorProfessionalServicesMonitor', 'policyWorkingCapitalDiscipline', 'kbTechOperatingModel', 'kbWinningNiche'],
    richResponse: {
      title: 'Detailed sector report',
      blocks: [
        paragraphBlock('sector-professional-summary', [
          citedText('Professional services firms are benefiting from better pipeline conversion, but the most relevant quality test is still whether utilization and fee realization convert into cash without debtor days drifting. ', ['sectorProfessionalServicesMonitor']),
          citedText('That is why the working-capital discipline standard matters even in an asset-light sector: operating control still determines how scalable the growth story really is.', ['policyWorkingCapitalDiscipline']),
        ]),
        bulletBlock('sector-professional-drivers', [
          [
            citedText('The sector is becoming more operating-model driven, with data, workflow, and decisioning quality influencing how efficiently firms scale.', ['kbTechOperatingModel']),
          ],
          [
            citedText('A focused proposition still matters because professional services clients respond better when the discussion is linked to their operating model and collections discipline, not a generic product push.', ['kbWinningNiche']),
          ],
          [
            citedText('RM conversations should connect pipeline quality, debtor control, and treasury discipline into one advisory message.', ['sectorProfessionalServicesMonitor', 'policyWorkingCapitalDiscipline']),
          ],
        ]),
        tableBlock(
          'sector-professional-table',
          [
            { id: 'lens', label: 'Lens' },
            { id: 'current', label: 'Current read' },
            { id: 'rm', label: 'RM implication' },
          ],
          [
            tableRow('sector-professional-row-1', [
              tableCell([citedText('Pipeline')]),
              tableCell([citedText('Pipeline quality is improving, but selectively.', ['sectorProfessionalServicesMonitor'])]),
              tableCell([citedText('Anchor growth conversations in utilization and fee realization, not topline alone.', ['sectorProfessionalServicesMonitor'])]),
            ]),
            tableRow('sector-professional-row-2', [
              tableCell([citedText('Collections')]),
              tableCell([citedText('Debtor control remains the best early warning for stress.', ['policyWorkingCapitalDiscipline'])]),
              tableCell([citedText('Position treasury and collections discipline as a scaling enabler.', ['policyWorkingCapitalDiscipline'])]),
            ]),
            tableRow('sector-professional-row-3', [
              tableCell([citedText('Advisory posture')]),
              tableCell([citedText('Stronger firms respond to proposition-led advisory discussions tied to their operating model.', ['kbTechOperatingModel', 'kbWinningNiche'])]),
              tableCell([citedText('Use a targeted, operating-model-aware story rather than a broad product list.', ['kbWinningNiche'])]),
            ]),
          ],
        ),
      ],
    },
  },
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
};

export const scenarioTriggerMap = { growth: 'growth-retail' };

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
