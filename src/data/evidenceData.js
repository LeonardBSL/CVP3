import foresightImaginationPdf from '../assets/kb/SL25115 - From Foresight to Imagination Thought Piece_v2.pdf';
import sustainabilityReportingPdf from '../assets/kb/SL25147 - Sustainability Insights for LinkedIn_v2.pdf';
import consultingAiPdf from '../assets/kb/SL25199 - Evolution of Consulting Thought Paper.pdf';
import collectionsRecoveriesPdf from '../assets/kb/SL26008 - Unlocking Value through Process Improvement in Collections & Recoveries Thought Paper_v1.pdf';
import techTrendsPdf from '../assets/kb/SL26020 - Tech Trends 2026 Social Media_v2[30].pdf';
import interconnectedRiskPdf from '../assets/kb/SystemicLogic Thought Paper Series_Anticipating the Unseen_Proactive Risk Management in an Interconnected Risk Landscape (1).pdf';
import wealthCxPdf from '../assets/kb/SystemicLogic Thought Paper Series_The Pinnacle of Financial Services_Unraveling the Imperative of CX in Wealth Management.pdf';
import riskInterdependencyPdf from '../assets/kb/SystemicLogic Thought Paper Series_The Power of Foresight_Unveiling the Potential of Risk Interdependency Analysis for Strategic Risk Selection and Prioritisation in Financial Institutions.pdf';
import winningSmeSegmentPdf from '../assets/kb/SystemicLogic Thought Paper Series_Winning the SME Segment.pdf';

export const kbDocuments = {
  foresightImagination: {
    id: 'foresightImagination',
    title: 'From Foresight to Imagination',
    fileName: 'SL25115 - From Foresight to Imagination Thought Piece_v2.pdf',
    url: foresightImaginationPdf,
  },
  sustainabilityReporting: {
    id: 'sustainabilityReporting',
    title: 'From Compliance to Competitive Advantage',
    fileName: 'SL25147 - Sustainability Insights for LinkedIn_v2.pdf',
    url: sustainabilityReportingPdf,
  },
  consultingAi: {
    id: 'consultingAi',
    title: 'The Evolution of Consulting in the Age of AI',
    fileName: 'SL25199 - Evolution of Consulting Thought Paper.pdf',
    url: consultingAiPdf,
  },
  collectionsRecoveries: {
    id: 'collectionsRecoveries',
    title: 'Unlocking Value Through Process Improvement in Collections and Recoveries',
    fileName: 'SL26008 - Unlocking Value through Process Improvement in Collections & Recoveries Thought Paper_v1.pdf',
    url: collectionsRecoveriesPdf,
  },
  techTrends2026: {
    id: 'techTrends2026',
    title: '5 Tech Shifts That Will Define 2026',
    fileName: 'SL26020 - Tech Trends 2026 Social Media_v2[30].pdf',
    url: techTrendsPdf,
  },
  interconnectedRisk: {
    id: 'interconnectedRisk',
    title: 'Anticipating the Unseen: Proactive Risk Management in an Interconnected Risk Landscape',
    fileName: 'SystemicLogic Thought Paper Series_Anticipating the Unseen_Proactive Risk Management in an Interconnected Risk Landscape (1).pdf',
    url: interconnectedRiskPdf,
  },
  wealthCx: {
    id: 'wealthCx',
    title: 'The Pinnacle of Financial Services',
    fileName: 'SystemicLogic Thought Paper Series_The Pinnacle of Financial Services_Unraveling the Imperative of CX in Wealth Management.pdf',
    url: wealthCxPdf,
  },
  riskInterdependency: {
    id: 'riskInterdependency',
    title: 'The Power of Foresight',
    fileName: 'SystemicLogic Thought Paper Series_The Power of Foresight_Unveiling the Potential of Risk Interdependency Analysis for Strategic Risk Selection and Prioritisation in Financial Institutions.pdf',
    url: riskInterdependencyPdf,
  },
  winningSmeSegment: {
    id: 'winningSmeSegment',
    title: 'Winning the SME Segment',
    fileName: 'SystemicLogic Thought Paper Series_Winning the SME Segment.pdf',
    url: winningSmeSegmentPdf,
  },
};

export const citationCatalog = {
  merchantPulse: {
    id: 'merchantPulse',
    kind: 'transaction',
    title: 'Merchant settlement extract',
    description: 'Client transaction evidence from card and merchant settlement flows.',
    dataUsed: 'Last 90 days of merchant settlements, operating balances, and overdraft utilization from the client account.',
  },
  cashCycle: {
    id: 'cashCycle',
    kind: 'transaction',
    title: 'Liquidity and cash-flow monitor',
    description: 'Treasury evidence from balances, runway, and cash conversion timing.',
    dataUsed: 'Daily balances, liquidity coverage, cash conversion timing, and cash-runway calculations from the treasury view.',
  },
  procurementWatch: {
    id: 'procurementWatch',
    kind: 'transaction',
    title: 'Supplier payment timing extract',
    description: 'Client operating-cycle evidence from payables and receivables timing.',
    dataUsed: 'Supplier settlement cadence, receivables timing, and procurement-cycle changes across the latest operating periods.',
  },
  transportLedger: {
    id: 'transportLedger',
    kind: 'transaction',
    title: 'Transport settlement ledger',
    description: 'Client logistics evidence from settlement timing and liquidity cover.',
    dataUsed: 'Corridor settlement delays, receivables timing, liquidity buffer, and payroll-cover movements in the transport ledger.',
  },
  inventoryVelocity: {
    id: 'inventoryVelocity',
    kind: 'transaction',
    title: 'Sales and inventory velocity extract',
    description: 'Client operating evidence from digital sales, stock turn, and collections.',
    dataUsed: 'Digital sales growth, stock-turn movement, and collections-cycle stability across the rolling 90-day operating view.',
  },
  kbWinningNiche: {
    id: 'kbWinningNiche',
    kind: 'kb',
    title: 'Winning the SME Segment: Niche offering',
    description: 'Thought paper on targeted SME positioning and segment-specific propositions.',
    documentId: 'winningSmeSegment',
    page: 8,
    quote: 'Beyond the traditional banking offerings, a bank looking to win in the SME segment must choose to be the best in a niche offering with a significant market size.',
    excerpt: 'The paper argues that SME growth conversations work best when the bank leads with a focused, segment-specific proposition rather than a generic offer.',
  },
  kbWinningTailoredFinance: {
    id: 'kbWinningTailoredFinance',
    kind: 'kb',
    title: 'Winning the SME Segment: Tailored financing',
    description: 'Thought paper on packaging financing in a way that matches SME operating needs.',
    documentId: 'winningSmeSegment',
    page: 6,
    quote: 'offers a more tailored financing solution for SMEs, which couple two tranches under one contract',
    excerpt: 'The paper highlights bundled SME financing structures that combine more than one funding need in a single solution.',
  },
  kbCollectionsStrategic: {
    id: 'kbCollectionsStrategic',
    kind: 'kb',
    title: 'Collections & Recoveries: Strategic capability',
    description: 'Thought paper on moving from reactive handling to early, strategic intervention.',
    documentId: 'collectionsRecoveries',
    page: 4,
    quote: 'collections and recoveries are no longer back-office functions focused solely on arrears resolution. They are strategic capabilities',
    excerpt: 'The paper frames early intervention and operating visibility as strategic capabilities rather than back-office clean-up.',
  },
  kbCollectionsProcess: {
    id: 'kbCollectionsProcess',
    kind: 'kb',
    title: 'Collections & Recoveries: Process visibility',
    description: 'Thought paper on identifying process friction before pressure escalates.',
    documentId: 'collectionsRecoveries',
    page: 8,
    quote: 'Identify high-effort, low-value activities',
    excerpt: 'The paper argues that better process visibility helps teams act before stress turns into avoidable operational drag.',
  },
  kbRiskReactive: {
    id: 'kbRiskReactive',
    kind: 'kb',
    title: 'Interconnected Risk: Reactive posture',
    description: 'Thought paper on why reactive management misses linked pressure points.',
    documentId: 'interconnectedRisk',
    page: 7,
    quote: 'The prevailing paradigm of risk management is characterized by a triad of pitfalls: confusion between risks and issues, a reactive posture, and reliance on short-sighted risk identification sources.',
    excerpt: 'The paper warns that reactive decision-making hides linked risks until they have already started to compound.',
  },
  kbRiskIntegrated: {
    id: 'kbRiskIntegrated',
    kind: 'kb',
    title: 'Interconnected Risk: Integrated approach',
    description: 'Thought paper on linking multiple signals into one integrated management response.',
    documentId: 'interconnectedRisk',
    page: 8,
    quote: 'the need for a more encompassing risk management strategy becomes paramount.',
    excerpt: 'The paper recommends treating connected pressure points as one integrated management problem rather than isolated issues.',
  },
  kbTechOperatingModel: {
    id: 'kbTechOperatingModel',
    kind: 'kb',
    title: 'Tech Trends 2026: Operating model shift',
    description: 'Thought paper on technology becoming part of the operating model itself.',
    documentId: 'techTrends2026',
    page: 3,
    quote: 'In 2026, AI will increasingly become part of the operating model itself.',
    excerpt: 'The paper links stronger scaling outcomes to operating models that keep data, workflows, and decisioning aligned.',
  },
  kbTechStructuredData: {
    id: 'kbTechStructuredData',
    kind: 'kb',
    title: 'Tech Trends 2026: Machine-friendly data',
    description: 'Thought paper on the importance of structured data for reliable AI-driven decisions.',
    documentId: 'techTrends2026',
    page: 5,
    quote: 'If your data is not structured for AI, your AI will be slow, expensive, and unreliable.',
    excerpt: 'The paper argues that disciplined, machine-friendly data is a prerequisite for reliable scaling and decision support.',
  },
};

export const sourceCatalog = citationCatalog;

export function getCitations(citationIds = []) {
  return citationIds.map(citationId => citationCatalog[citationId]).filter(Boolean);
}

export function getKbDocument(documentId) {
  return kbDocuments[documentId] ?? null;
}

export function getCitationKindLabel(citation) {
  return citation.kind === 'kb' ? 'Knowledge base' : 'Client data';
}
