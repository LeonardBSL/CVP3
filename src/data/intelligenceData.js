// ── Relationship Health & Attrition Risk Score ──
export const healthScore = {
  score: 74,
  band: 'low', // 'critical' | 'moderate' | 'stable' | 'low' | 'engaged'
  updatedAt: '29 May 2026, 09:14',
  model: 'CVP Health v2.1',
  subScores: { engagement: 21, transaction: 28, loyalty: 25 }, // weights 30 / 35 / 35
  signals: [
    { id: 'contact-freq', label: 'Contact frequency', detail: 'RM-initiated outreach per month', reading: '1.2 / month', trend: 'down', trendLabel: '↓ was 2.1', risk: 'moderate', riskLabel: 'Moderate risk' },
    { id: 'txn-vol', label: 'Transaction volume', detail: 'Average monthly debit/credit value', reading: 'R2.4m / month', trend: 'flat', trendLabel: '↔ stable', risk: 'none', riskLabel: 'No risk' },
    { id: 'product-depth', label: 'Product depth', detail: 'Active product relationships', reading: '4 products', trend: 'flat', trendLabel: '→ unchanged', risk: 'none', riskLabel: 'No risk' },
    { id: 'competitor', label: 'Competitor indicators', detail: 'Third-party settlement, transfer-out patterns', reading: 'None detected', trend: 'flat', trendLabel: 'Stable', risk: 'none', riskLabel: 'No risk' },
    { id: 'digital', label: 'Digital engagement', detail: 'Online banking, app usage frequency', reading: 'High', trend: 'up', trendLabel: '↑ increasing', risk: 'none', riskLabel: 'No risk' },
  ],
  reasoning:
    'Nkosi Retail Group scores 74/100, placing it in the Low Attrition Risk band. The primary risk signal is a decline in RM-initiated contact frequency — from 2.1 contacts per month three months ago to 1.2 today. This is offset by strong transaction volume stability (R2.4m/month), four active product relationships, and zero competitor-settlement indicators. Digital engagement has increased, a positive loyalty signal. The composite picture is a client that remains financially committed but may be feeling less personally attended to. Recommend: re-establish a regular contact cadence before this gap becomes a relationship risk.',
  sources: [
    { source: 'CRM System', detail: 'RM activity log — last 90 days of calls, meetings, emails' },
    { source: 'Transaction Ledger', detail: 'Monthly debit/credit volumes — Jan 2025 to present' },
    { source: 'Product Registry', detail: 'Active product and facility count — as at 29 May 2026' },
    { source: 'Settlement Monitor', detail: 'Outward transfer patterns — anomaly detection, last 60 days' },
  ],
  intelligenceSignals: [
    {
      id: 'pnp-loyalty',
      sourceType: 'competitor',
      sourceName: 'Trade Press — Retail Week',
      time: 'Yesterday',
      headline: 'Pick n Pay launches expanded Smart Shopper loyalty programme targeting LSM 6–9 retail shoppers',
      excerpt: 'The revamped Smart Shopper programme extends rewards to partner retailers and adds a digital wallet component.',
      impactDirection: 'watch',
      impactLabel: 'Competitor activity signal',
      connectionText:
        'The "Competitor activity" signal currently reads "None detected" based on settlement and transfer-out patterns. However, loyalty programme launches are a leading indicator — they typically precede wallet-share erosion by 1–2 quarters. The RM should be aware that the competitive environment for Nkosi\'s customer base is intensifying. This nudges the competitor sub-score from "None" toward "Watch".',
      affectedModules: ['health', 'milestones'],
    },
    {
      id: 'sme-cadence-kb',
      sourceType: 'kb',
      sourceName: 'Internal KB — Winning the SME Segment',
      time: 'Systemic Logic',
      headline: 'Winning the SME Segment: the critical role of proactive RM contact cadence',
      excerpt: 'SME clients with RM contact below 2 engagements per month show a statistically higher 12-month attrition rate, regardless of product depth or transaction volumes.',
      impactDirection: 'watch',
      impactLabel: 'Contact frequency below threshold',
      connectionText:
        'Nkosi\'s current contact frequency is 1.2 contacts per month — below the 2.0 threshold identified in the KB as the attrition boundary. This is the primary reason the engagement activity sub-score is 21/30. Closing this gap to 2+ contacts over the next 60 days would materially improve the composite score.',
      affectedModules: ['health'],
    },
  ],
  synthesis:
    'The Health Score of 74 reflects two converging risks that the raw transaction data alone does not surface: a contact frequency gap that the SME KB identifies as a leading attrition predictor, and a new competitor loyalty offering not yet visible in settlement data but historically preceding wallet-share loss. The score may soften in Q3 if these signals are not acted on. Priority: re-establish a 2+ contact/month cadence immediately.',
};

// ── Client Milestone & Lifecycle Intelligence ──
export const milestones = [
  {
    id: 'year-end',
    name: 'Financial Year-End',
    meta: 'Funding & cash position review',
    urgency: 'urgent',
    daysLabel: '42 days',
    source: 'CIPC · SARS',
    whatItIs: "Nkosi Retail Group's financial year ends 10 July 2026. This triggers statutory filings, audits, and commonly a review of banking facilities and credit lines.",
    whyItMatters: 'Year-end is the single best moment to discuss facility renewals, working capital top-ups, and forward-looking treasury arrangements — the client is already in financial planning mode.',
    rmContext: "Open with the client's Q4 cash position and whether the current overdraft facility covers the post-year-end tax payment cycle. Introduce the pre-approved expansion capacity as a forward-planning tool, not a distress product.",
  },
  {
    id: 'director-change',
    name: 'CIPC Director Change',
    meta: 'M. Nkosi — mandate & FICA check',
    urgency: 'urgent',
    daysLabel: '8 days ago',
    source: 'CIPC Registry',
    whatItIs: 'A new director, M. Nkosi, was registered at CIPC on 21 May 2026. The change is a formal governance event that may signal a succession plan, expansion into a new entity, or ownership restructure.',
    whyItMatters: 'Director changes affect signatory mandates, credit guarantees, and FICA obligations. The RM should verify mandate status and use the change as a natural relationship check-in touchpoint.',
    rmContext: 'Acknowledge the governance change positively — frame the call as a routine mandate check paired with a forward-looking conversation about whether the new structure changes their banking needs. Keep the tone advisory, not compliance-heavy.',
  },
  {
    id: 'anniversary',
    name: 'Business Anniversary',
    meta: '7 years — outreach opportunity',
    urgency: 'upcoming',
    daysLabel: '16 days',
    source: 'CIPC · CRM',
    whatItIs: 'Nkosi Retail Group turns 7 years old on 14 June 2026. Milestone years (5, 7, 10) are strong relationship anchors and often coincide with strategic planning cycles.',
    whyItMatters: 'Milestone anniversaries are low-pressure, high-warmth touchpoints that strengthen the relationship without a product agenda.',
    rmContext: 'A brief congratulatory message — email or call — that ties the anniversary to a reflective question about where the business is headed in year 8. Low-pressure, relationship-affirming.',
  },
  {
    id: 'bbbee',
    name: 'BBBEE Level Review',
    meta: 'dti consultation — escalated',
    urgency: 'watch',
    daysLabel: '~74 days',
    source: 'BBBEE Commission · CRM',
    whatItIs: 'BBBEE certification renewal window opens in Q3. Level changes can affect procurement eligibility and may signal expansion or contraction in client revenues.',
    whyItMatters: 'A level change is both a commercial signal and a conversation trigger — up is a growth signal, down warrants a sensitive revenue-pipeline conversation.',
    rmContext: 'Monitor for level change once certified. If the client moves up a level, that is a growth signal and a prompt to revisit expansion capacity. If down, it warrants a sensitive conversation about revenue pipeline and facility headroom.',
  },
];

// ── External News & Event Monitor (canonical signal source) ──
export const newsItems = [
  {
    id: 'pnp-loyalty',
    sourceType: 'competitor',
    sourceName: 'Retail Week SA',
    time: 'Yesterday · 16:42',
    urgency: 'act',
    headline: 'Pick n Pay launches expanded Smart Shopper loyalty programme targeting LSM 6–9 retail shoppers',
    excerpt: 'The revamped programme extends rewards to partner retailers, adds a digital wallet component, and increases cashback thresholds by 40%. Pick n Pay stated the expansion is designed to deepen wallet share in the mid-market retail segment.',
    relevanceAssessment:
      'This is a direct competitive threat to Nkosi Retail Group\'s customer base. Nkosi operates in the LSM 6–9 retail segment — the exact target of this expansion. Loyalty programmes of this type typically produce wallet-share erosion visible in transaction data within 2–3 months of launch. The RM should initiate contact before the client has seen press coverage, positioning the outreach as proactive market intelligence rather than a reactive response.',
    affectedModules: ['health', 'milestones'],
  },
  {
    id: 'fmcg-price-hike',
    sourceType: 'supplier',
    sourceName: 'Retail Gazette SA',
    time: '6 hours ago · 03:20',
    urgency: 'act',
    headline: 'Major FMCG distributor announces 8% across-the-board price increase effective 1 July 2026',
    excerpt: 'A key FMCG distributor has notified retail partners of an across-the-board 8% price hike driven by upstream input cost pressures including fuel, packaging, and imported raw materials. Retailers have 30 days to negotiate or absorb.',
    relevanceAssessment:
      'This directly affects Nkosi Retail Group\'s cost base. An 8% COGS increase from a key FMCG supplier will mechanically widen creditor days (already drifting at 31 days) unless the client can pass costs through or negotiate extended settlement terms. The 30-day negotiation window creates a natural RM conversation: working capital headroom, overdraft access, and supplier finance. This also warrants updating the Q2 diagnostic forecast — gross margin compression is now a concrete risk.',
    affectedModules: ['diagnostic', 'benchmarking'],
  },
  {
    id: 'shoprite-sens',
    sourceType: 'sens',
    sourceName: 'JSE SENS — Shoprite Holdings Ltd',
    time: '2 hours ago · 07:05',
    urgency: 'monitor',
    headline: 'Shoprite Holdings: H1 FY2026 revenue up 14%, headline earnings per share +17%',
    excerpt: "South Africa's largest retailer cites improved consumer spending in the LSM 5–8 segment, supply chain optimisation, and strong private label penetration. Management guides for continued strong H2 performance.",
    relevanceAssessment:
      'Shoprite\'s result confirms a sector-wide trading uplift, which contextualises Nkosi\'s own +18% YoY revenue growth as market-supported. The consumer recovery in LSM 5–8 is directly relevant to Nkosi\'s customer base. Note: this result will shift peer benchmark medians upward at the next monthly refresh (1 June) — the current benchmarking advantage should be used in conversation now.',
    affectedModules: ['benchmarking', 'diagnostic'],
  },
  {
    id: 'loadshedding-margin',
    sourceType: 'press',
    sourceName: 'Retail Gazette SA',
    time: '6 hours ago',
    urgency: 'monitor',
    headline: 'Load-shedding costs squeezing gross margins across SA retail sector — median margin falls to 21%',
    excerpt: 'A survey of 40 retail businesses shows average gross margin declining from 24% to 21% due to diesel generator costs, spoilage, and lost trading hours during Stage 4 and 5 load-shedding events.',
    relevanceAssessment:
      'Nkosi\'s gross margin of 24% is currently benchmarked against a peer median of 23% — a marginal 2nd-quartile result. This survey suggests the sector median has already declined to 21%, making Nkosi\'s margin position meaningfully stronger than the current benchmark implies. The RM can use this confidently: "Your margin is holding up better than most of your peers."',
    affectedModules: ['benchmarking'],
  },
  {
    id: 'dti-bbbee',
    sourceType: 'regulatory',
    sourceName: 'BusinessDay',
    time: '3 days ago',
    urgency: 'context',
    headline: 'dti opens 60-day consultation on revised BBBEE sector scorecard measurement framework',
    excerpt: 'Proposed changes include revised ownership thresholds, updated skills development weighting, and sector-specific scorecard adjustments for retail, manufacturing, and financial services.',
    relevanceAssessment:
      'Nkosi\'s BBBEE certification renewal window opens in Q3 — approximately 74 days from now. This consultation introduces uncertainty about the measurement rules that will apply at renewal. The RM should raise this in the next contact as a heads-up: "Are you tracking the dti consultation? It may affect your Q3 renewal strategy."',
    affectedModules: ['milestones'],
  },
];

// ── Peer Benchmarking ──
export const benchmarking = {
  peerGroup: {
    sector: 'Retail (NAICS 44–45)',
    revenueBand: 'R50m – R200m annual',
    geography: 'Gauteng & Western Cape',
    n: 34,
    refreshDate: '1 May 2026',
    kAnonymity: 'k-anonymity ≥ 5',
  },
  categories: [
    {
      id: 'financial-health',
      label: 'Financial Health',
      description: 'Profitability & growth indicators',
      metrics: [
        { id: 'revenue-growth', name: 'Revenue Growth (YoY)', formula: 'Year-on-year revenue increase', clientValue: '+18%', p25: '+3%', median: '+7%', p75: '+13%', quartile: 'Top', barClientPct: 72, barPeerPct: 35, tone: 'good' },
        { id: 'gross-margin', name: 'Gross Margin', formula: 'Gross profit as % of revenue', clientValue: '24%', p25: '18%', median: '21%', p75: '29%', quartile: '2nd', barClientPct: 48, barPeerPct: 42, tone: 'accent' },
        { id: 'wc-ratio', name: 'Working Capital Ratio', formula: 'Current assets ÷ current liabilities', clientValue: '1.8×', p25: '1.1×', median: '1.4×', p75: '1.9×', quartile: 'Top', barClientPct: 72, barPeerPct: 56, tone: 'good' },
      ],
    },
    {
      id: 'liquidity',
      label: 'Liquidity & Cash Flow',
      description: 'Working capital efficiency',
      metrics: [
        { id: 'ccc', name: 'Cash Conversion Cycle', formula: 'Days from cash out to cash in', clientValue: '22d', p25: '27d', median: '37d', p75: '52d', quartile: 'Top', barClientPct: 44, barPeerPct: 74, tone: 'good' },
        { id: 'debtor-days', name: 'Debtor Days', formula: 'Avg days to collect receivables', clientValue: '24d', p25: '28d', median: '38d', p75: '55d', quartile: 'Top', barClientPct: 48, barPeerPct: 76, tone: 'good' },
        { id: 'creditor-days', name: 'Creditor Days', formula: 'Avg days to pay suppliers', clientValue: '31d', p25: '22d', median: '28d', p75: '40d', quartile: '3rd', barClientPct: 62, barPeerPct: 56, tone: 'warn' },
      ],
    },
    {
      id: 'banking-behaviour',
      label: 'Banking Behaviour',
      description: 'How this client uses their banking relationship',
      metrics: [
        { id: 'facility-util', name: 'Facility Utilisation', formula: '% of approved credit facilities drawn', clientValue: '38%', p25: '44%', median: '61%', p75: '78%', quartile: 'Top', barClientPct: 38, barPeerPct: 61, tone: 'good' },
        { id: 'avg-balance', name: 'Avg Daily Balance', formula: 'Mean operating account balance', clientValue: 'R840k', p25: 'R210k', median: 'R480k', p75: 'R920k', quartile: 'Top', barClientPct: 84, barPeerPct: 52, tone: 'good' },
        { id: 'payment-reg', name: 'Payment Regularity', formula: 'On-time payment rate (last 12 months)', clientValue: '97%', p25: '84%', median: '91%', p75: '96%', quartile: 'Top', barClientPct: 97, barPeerPct: 91, tone: 'good' },
        { id: 'digital-adopt', name: 'Digital Adoption', formula: '% of transactions via digital channels', clientValue: '84%', p25: '51%', median: '67%', p75: '79%', quartile: 'Top', barClientPct: 84, barPeerPct: 67, tone: 'good' },
      ],
    },
    {
      id: 'growth',
      label: 'Growth Indicators',
      description: 'Business expansion signals',
      metrics: [
        { id: 'payroll-growth', name: 'Payroll Growth (YoY)', formula: 'Year-on-year growth in payroll spend', clientValue: '+22%', p25: '+2%', median: '+6%', p75: '+14%', quartile: 'Top', barClientPct: 78, barPeerPct: 30, tone: 'good' },
        { id: 'txn-growth', name: 'Transaction Volume Growth', formula: 'YoY increase in monthly transaction count', clientValue: '+31%', p25: '+4%', median: '+11%', p75: '+19%', quartile: 'Top', barClientPct: 88, barPeerPct: 42, tone: 'good' },
      ],
    },
  ],
  rmContext:
    'Lead with Banking Behaviour: a 97% payment regularity rate and 38% facility utilisation are standout signals — this is a client who manages their banking relationship with exceptional discipline. The growth story is compelling: payroll up 22% and transaction volume up 31% YoY while maintaining a 22-day cash conversion cycle is rare in this peer group. Watch creditor days: at 31 days vs a peer median of 28, this is a small gap worth monitoring if revenue growth moderates — not a conversation to start unprompted.',
  reasoning:
    'Benchmarks are computed monthly by matching this client to 34 anonymised peers on sector, revenue band, and geography. Quartile rankings are recalculated against the full peer distribution each cycle. The Banking Behaviour category uses Absa-internal transaction data not available in published financial benchmarks. All peer records meet k-anonymity ≥ 5; no individual business contributes more than 8% of the benchmark sample.',
  synthesis:
    'The benchmarks are more favourable than the current numbers suggest. The sector margin is deteriorating (load-shedding) while this client\'s holds — making the 24% gross margin look increasingly exceptional as the refresh date approaches. The Shoprite result means peer revenue growth medians will shift upward, but the client\'s 18% is still well clear. The best time to use these benchmarks in a client conversation is now — before the refresh recalibrates and the lead narrows.',
};

// ── Business Performance Diagnostic ──
export const diagnostic = {
  quarter: 'Q1 2026',
  period: 'Jan–Mar',
  generatedAt: '29 May 2026',
  model: 'CVP Diagnostic v2.3',
  overallRating: 'healthy', // 'healthy' | 'fair' | 'watch' | 'critical'
  overallNote: '3 of 4 metrics improving quarter-on-quarter',
  executiveSummary:
    'Nkosi Retail Group delivered a strong Q1 working-capital performance. Debtor days fell 7 days to 24 — driven by improved collections discipline visible in the transaction data. The cash conversion cycle hit a multi-quarter best of 22 days, placing the business in the top quartile of retail peers. Working capital efficiency improved from "Fair" to "Good". The primary watch item is creditor days drifting to 31 — now above the peer median of 28 — and an upcoming FMCG supplier price hike from July that is likely to apply further upward pressure into Q2.',
  metrics: [
    {
      id: 'debtor-days',
      name: 'Debtor Days',
      formula: 'Receivables ÷ (Revenue ÷ 365)',
      currentValue: '24',
      unit: 'days',
      badge: '24 days ↓',
      status: 'good',
      trend: [
        { quarter: "Q2 '25", value: 38, status: 'prev' },
        { quarter: "Q3 '25", value: 46, status: 'prev' },
        { quarter: "Q4 '25", value: 31, status: 'prev' },
        { quarter: "Q1 '26", value: 24, status: 'good' },
      ],
      interpretation:
        'A 7-day reduction from last quarter is material. The improvement tracks increased collections frequency across the store network — a deliberate operational change visible in the transaction data. At 24 days, the business collects faster than 88% of its retail peers.',
    },
    {
      id: 'creditor-days',
      name: 'Creditor Days',
      formula: 'Payables ÷ (COGS ÷ 365)',
      currentValue: '31',
      unit: 'days',
      badge: '31 days ↑',
      status: 'warn',
      trend: [
        { quarter: "Q2 '25", value: 26, status: 'prev' },
        { quarter: "Q3 '25", value: 30, status: 'prev' },
        { quarter: "Q4 '25", value: 32, status: 'prev' },
        { quarter: "Q1 '26", value: 31, status: 'warn' },
      ],
      interpretation:
        'Creditor days have drifted upward over four quarters (26 → 31 days). This is not yet a concern — it may reflect negotiated extended terms as the business scales. The FMCG price hike in July may push this higher as the client absorbs cost pressure. Peer median is 28 days. Monitor into Q2 without raising with the client unprompted.',
    },
    {
      id: 'ccc',
      name: 'Cash Conversion Cycle',
      formula: 'Debtor Days + Inventory Days − Creditor Days',
      currentValue: '22',
      unit: 'days',
      badge: '22 days ↓',
      status: 'good',
      highlight: true,
      trend: [
        { quarter: "Q2 '25", value: 38, status: 'prev' },
        { quarter: "Q3 '25", value: 46, status: 'prev' },
        { quarter: "Q4 '25", value: 34, status: 'prev' },
        { quarter: "Q1 '26", value: 22, status: 'good' },
      ],
      interpretation:
        'The CCC of 22 days is a multi-quarter best — driven primarily by the debtor days improvement. The business converts its inventory investment into cash in just over three weeks, well ahead of peers. A shorter cycle means less external working capital required — a direct indicator of funding headroom and financial resilience.',
    },
    {
      id: 'wc-efficiency',
      name: 'Working Capital Efficiency',
      formula: 'Current Assets ÷ Current Liabilities (+ cycle quality score)',
      currentValue: 'Good',
      unit: '',
      badge: 'Good ↑',
      status: 'good',
      trend: [
        { quarter: "Q2 '25", value: 56, status: 'prev' },
        { quarter: "Q3 '25", value: 59, status: 'prev' },
        { quarter: "Q4 '25", value: 64, status: 'prev' },
        { quarter: "Q1 '26", value: 72, status: 'good' },
      ],
      interpretation:
        'The composite WC efficiency score crossed from "Fair" into "Good" for the first time in three quarters, scoring 72/100. This reflects improved cycle metrics, higher average account balances, and reduced reliance on short-term overdraft. The business is operationally more self-sufficient than at any point in the last 12 months.',
    },
  ],
  rmContext:
    'Lead with the improvement story: the Q1 diagnostic is the most positive this client has produced in over a year. Use the CCC improvement (38 → 22 days) as the opening data point. Bridge to capacity: a 22-day cash cycle on a R148m portfolio creates meaningful working capital headroom. Creditor days — don\'t raise it: the slight drift is a monitoring signal for you, not a client conversation. Raise it only if Q2 shows continued widening.',
  sources: [
    { source: 'Transaction Ledger', detail: 'Receivables & payables flows — Q1 2026 (Jan–Mar)' },
    { source: 'Payroll Data', detail: 'Monthly payroll outflows used to validate operating scale' },
    { source: 'Absa Facility Records', detail: 'Overdraft utilisation and balance data for the working capital ratio' },
    { source: 'Peer Benchmark Dataset', detail: 'Sector-matched peer medians (anonymised, n=34)' },
  ],
  synthesis:
    'Taken together these signals paint a bifurcated picture for Q2 2026: the macro retail environment remains supportive (Shoprite result, consumer recovery), which should sustain the debtor days improvement. However, the FMCG price hike introduces a cost-push risk to creditor days and gross margin that was not present in Q1. Revisit the diagnostic after Q2 close with attention to whether creditor days widen beyond 35 days — the threshold at which the WC efficiency rating would revert to "Fair".',
};

/**
 * Returns the intelligence signals relevant to a given module, sourced from the
 * canonical newsItems list, mapped into the shared signal shape used by
 * SignalStrip and SignalIntelligenceSection.
 */
export function signalsForModule(moduleId) {
  return newsItems
    .filter(item => item.affectedModules.includes(moduleId))
    .map(item => ({
      id: item.id,
      sourceType: item.sourceType,
      sourceName: item.sourceName,
      time: item.time,
      headline: item.headline,
      excerpt: item.excerpt,
      impactDirection: item.urgency === 'act' ? 'watch' : item.urgency === 'monitor' ? 'up' : 'context',
      impactLabel: item.urgency === 'act' ? 'Act now' : item.urgency === 'monitor' ? 'Monitor' : 'Context',
      connectionText: item.relevanceAssessment,
      affectedModules: item.affectedModules,
    }));
}
