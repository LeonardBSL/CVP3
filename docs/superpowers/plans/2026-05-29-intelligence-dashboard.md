# Intelligence Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI-powered Intelligence Dashboard tab to the Client Portal page, presenting five explainable, citable intelligence modules (Relationship Health, Lifecycle Milestones, News Monitor, Peer Benchmarking, Performance Diagnostic) over hardcoded demo data for Nkosi Retail Group.

**Architecture:** A tab wrapper in `ClientPortalPage.jsx` toggles between the new `IntelligenceDashboard` and the existing notes/records view via local `useState`. The dashboard renders five self-contained module components in a two-row CSS grid (Layout C). Each module is a clickable card that opens a detail modal. All data is hardcoded in `src/data/intelligenceData.js`. All styling uses existing CSS custom-property tokens — no new design tokens.

**Tech Stack:** React 19, Vite, React Router, Lucide React icons, Vitest + React Testing Library. No backend, no component library, no CSS framework.

---

## Spec Reference

This plan implements `docs/superpowers/specs/2026-05-29-intelligence-dashboard-design.md`. Read it before starting.

## Conventions (read before any task)

- **Test runner:** `npx vitest run <path>` runs once; `npx vitest run` runs the whole suite. Tests live in `src/test/`.
- **Test helpers:** `renderApp(route, stateOverrides)` and `buildTestState(overrides)` from `src/test/testUtils.jsx` render the full app inside a `MemoryRouter` + `DemoStateProvider`. Module unit tests render the component directly (no router needed) since modules read from `intelligenceData.js`, not from app state.
- **Icons:** Import named icons from `lucide-react` (e.g. `import { TrendingUp } from 'lucide-react'`).
- **Color rule:** Every color value in JSX/CSS must resolve to an existing `:root` token from `src/styles/global.css` (`--accent`, `--warning`, `--positive`, `--critical`, `--surface*`, `--line*`, `--text*`, and their `-soft`/`-dark` variants). The only literal hex permitted is `#111827` (already `--text`) for the dark signal-section header, and the small bar-border tints `#f0c0cc`/`#f0c470`/`#f0d080` used in the mockups (acceptable as they derive from accent/warning). Prefer tokens; use those literals only where a mockup explicitly does.
- **Class naming:** All new classes are prefixed `intel-` and follow the BEM-adjacent style used by `.portal-*`/`.dashboard-*` (e.g. `intel-mod__head`).
- **CSS location:** All new CSS appended to `src/styles/global.css` under a single `/* ── Intelligence Dashboard ── */` banner.
- **Commits:** Commit after each task. Use Conventional Commit prefixes (`feat:`, `test:`, `style:`).

## File Structure

| File | Responsibility |
|---|---|
| `src/data/intelligenceData.js` | All hardcoded demo data: `healthScore`, `milestones`, `newsItems`, `benchmarking`, `diagnostic`. Canonical signal source is `newsItems`. |
| `src/components/intel/IntelModal.jsx` | Shared modal shell (overlay, panel, header gradient, Escape-to-close, focus return). |
| `src/components/intel/SignalStrip.jsx` | Shared card-footer signal chip strip. |
| `src/components/intel/SignalIntelligenceSection.jsx` | Shared modal "What the AI is seeing" block + AI synthesis. |
| `src/components/intel/intelFormat.js` | Tiny shared helpers (source badge class map, impact color class map). |
| `src/pages/portal/IntelligenceDashboard.jsx` | Dashboard tab root — two-row grid, renders the 5 module cards. |
| `src/pages/portal/modules/HealthScoreModule.jsx` | Module 1 (card + modal). |
| `src/pages/portal/modules/MilestonesModule.jsx` | Module 2 (card + modal). |
| `src/pages/portal/modules/NewsMonitorModule.jsx` | Module 3 (card + modal). |
| `src/pages/portal/modules/BenchmarkingModule.jsx` | Module 4 (card + modal). |
| `src/pages/portal/modules/DiagnosticModule.jsx` | Module 5 (card + modal). |
| `src/pages/portal/ClientPortalPage.jsx` | MODIFY — add tab bar; render dashboard or existing content. |
| `src/styles/global.css` | MODIFY — append `intel-*` classes. |

## Task Dependency Map

- **Task 1** (data) and **Task 2** (CSS) are foundational — do them first.
- **Tasks 3–5** (shared components) depend on Task 1 + Task 2.
- **Tasks 6–10** (the five modules) each depend on Tasks 1–5 but are **independent of each other** — they can be built in parallel by separate subagents.
- **Task 11** (dashboard assembly) depends on Tasks 6–10.
- **Task 12** (tab integration) depends on Task 11.
- **Task 13** (final integration test) depends on Task 12.

---

## Task 1: Intelligence demo data

**Files:**
- Create: `src/data/intelligenceData.js`
- Test: `src/test/intelligenceData.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/test/intelligenceData.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { healthScore, milestones, newsItems, benchmarking, diagnostic } from '../data/intelligenceData';

describe('intelligenceData', () => {
  it('exposes a health score in the 0-100 range with sub-scores and signals', () => {
    expect(healthScore.score).toBe(74);
    expect(healthScore.band).toBe('low');
    expect(healthScore.subScores).toEqual({ engagement: 21, transaction: 28, loyalty: 25 });
    expect(healthScore.signals.length).toBe(5);
    expect(healthScore.intelligenceSignals.length).toBeGreaterThanOrEqual(2);
    expect(typeof healthScore.synthesis).toBe('string');
  });

  it('exposes four lifecycle milestones with urgency and RM context', () => {
    expect(milestones).toHaveLength(4);
    const yearEnd = milestones.find(m => m.id === 'year-end');
    expect(yearEnd.urgency).toBe('urgent');
    expect(yearEnd.rmContext).toMatch(/year-end/i);
    milestones.forEach(m => {
      expect(m.whatItIs).toBeTruthy();
      expect(m.whyItMatters).toBeTruthy();
      expect(m.rmContext).toBeTruthy();
    });
  });

  it('exposes news items with urgency tiers and module links', () => {
    expect(newsItems.length).toBe(5);
    const actNow = newsItems.filter(n => n.urgency === 'act');
    expect(actNow.length).toBe(2);
    newsItems.forEach(n => {
      expect(['act', 'monitor', 'context']).toContain(n.urgency);
      expect(n.relevanceAssessment).toBeTruthy();
      expect(Array.isArray(n.affectedModules)).toBe(true);
    });
  });

  it('exposes benchmarking with four categories and a peer group', () => {
    expect(benchmarking.peerGroup.n).toBe(34);
    expect(benchmarking.categories.map(c => c.id)).toEqual([
      'financial-health', 'liquidity', 'banking-behaviour', 'growth',
    ]);
    benchmarking.categories.forEach(cat => {
      expect(cat.metrics.length).toBeGreaterThan(0);
      cat.metrics.forEach(m => {
        expect(m.quartile).toMatch(/top|2nd|3rd|bottom/i);
      });
    });
  });

  it('exposes a diagnostic with four metrics each carrying a 4-quarter trend', () => {
    expect(diagnostic.quarter).toBe('Q1 2026');
    expect(diagnostic.overallRating).toBe('healthy');
    expect(diagnostic.metrics).toHaveLength(4);
    diagnostic.metrics.forEach(m => {
      expect(m.trend).toHaveLength(4);
      expect(m.interpretation).toBeTruthy();
      expect(m.formula).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/intelligenceData.test.js`
Expected: FAIL — "Failed to resolve import '../data/intelligenceData'".

- [ ] **Step 3: Create the data file**

Create `src/data/intelligenceData.js`. The signal objects use a consistent shape across modules:
`{ id, sourceType, sourceName, time, headline, excerpt, impactDirection, impactLabel, connectionText, affectedModules }` where `sourceType` ∈ `'sens' | 'press' | 'kb' | 'supplier' | 'competitor' | 'regulatory'`, `impactDirection` ∈ `'up' | 'watch' | 'context'`.

```js
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
        'The "Competitor activity" signal currently reads "None detected" based on settlement and transfer-out patterns. However, loyalty programme launches are a leading indicator — they typically precede wallet-share erosion by 1–2 quarters. The RM should be aware that the competitive environment for Nkosi’s customer base is intensifying. This nudges the competitor sub-score from "None" toward "Watch".',
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
        'Nkosi’s current contact frequency is 1.2 contacts per month — below the 2.0 threshold identified in the KB as the attrition boundary. This is the primary reason the engagement activity sub-score is 21/30. Closing this gap to 2+ contacts over the next 60 days would materially improve the composite score.',
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
      'This is a direct competitive threat to Nkosi Retail Group’s customer base. Nkosi operates in the LSM 6–9 retail segment — the exact target of this expansion. Loyalty programmes of this type typically produce wallet-share erosion visible in transaction data within 2–3 months of launch. The RM should initiate contact before the client has seen press coverage, positioning the outreach as proactive market intelligence rather than a reactive response.',
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
      'This directly affects Nkosi Retail Group’s cost base. An 8% COGS increase from a key FMCG supplier will mechanically widen creditor days (already drifting at 31 days) unless the client can pass costs through or negotiate extended settlement terms. The 30-day negotiation window creates a natural RM conversation: working capital headroom, overdraft access, and supplier finance. This also warrants updating the Q2 diagnostic forecast — gross margin compression is now a concrete risk.',
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
      'Shoprite’s result confirms a sector-wide trading uplift, which contextualises Nkosi’s own +18% YoY revenue growth as market-supported. The consumer recovery in LSM 5–8 is directly relevant to Nkosi’s customer base. Note: this result will shift peer benchmark medians upward at the next monthly refresh (1 June) — the current benchmarking advantage should be used in conversation now.',
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
      'Nkosi’s gross margin of 24% is currently benchmarked against a peer median of 23% — a marginal 2nd-quartile result. This survey suggests the sector median has already declined to 21%, making Nkosi’s margin position meaningfully stronger than the current benchmark implies. The RM can use this confidently: "Your margin is holding up better than most of your peers."',
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
      'Nkosi’s BBBEE certification renewal window opens in Q3 — approximately 74 days from now. This consultation introduces uncertainty about the measurement rules that will apply at renewal. The RM should raise this in the next contact as a heads-up: "Are you tracking the dti consultation? It may affect your Q3 renewal strategy."',
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
  // intelligenceSignals are derived at render time by filtering newsItems on affectedModules.includes('benchmarking')
  synthesis:
    'The benchmarks are more favourable than the current numbers suggest. The sector margin is deteriorating (load-shedding) while this client’s holds — making the 24% gross margin look increasingly exceptional as the refresh date approaches. The Shoprite result means peer revenue growth medians will shift upward, but the client’s 18% is still well clear. The best time to use these benchmarks in a client conversation is now — before the refresh recalibrates and the lead narrows.',
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
    'Lead with the improvement story: the Q1 diagnostic is the most positive this client has produced in over a year. Use the CCC improvement (38 → 22 days) as the opening data point. Bridge to capacity: a 22-day cash cycle on a R148m portfolio creates meaningful working capital headroom. Creditor days — don’t raise it: the slight drift is a monitoring signal for you, not a client conversation. Raise it only if Q2 shows continued widening.',
  sources: [
    { source: 'Transaction Ledger', detail: 'Receivables & payables flows — Q1 2026 (Jan–Mar)' },
    { source: 'Payroll Data', detail: 'Monthly payroll outflows used to validate operating scale' },
    { source: 'Absa Facility Records', detail: 'Overdraft utilisation and balance data for the working capital ratio' },
    { source: 'Peer Benchmark Dataset', detail: 'Sector-matched peer medians (anonymised, n=34)' },
  ],
  // intelligenceSignals derived at render time by filtering newsItems on affectedModules.includes('diagnostic')
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
```

> Note: Module 1 (`healthScore.intelligenceSignals`) defines its own bespoke signals (one is the KB cadence finding, which is not a news item). Modules 4 and 5 derive theirs via `signalsForModule('benchmarking')` / `signalsForModule('diagnostic')`. This is intentional — the health module mixes a news signal with a KB signal, so it carries an explicit list.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/intelligenceData.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/intelligenceData.js src/test/intelligenceData.test.js
git commit -m "feat: add intelligence dashboard demo data"
```

---

## Task 2: Intelligence dashboard CSS

**Files:**
- Modify: `src/styles/global.css` (append at end)

This task has no unit test — CSS is verified visually and via the integration tests in later tasks. Keep it small and mechanical.

- [ ] **Step 1: Append the CSS block**

Append the following to the very end of `src/styles/global.css`. Every color references an existing `:root` token; the only literals are `#111827` (the dark signal-section surface, equal to `--text`) and small accent/warning border tints.

```css
/* ── Intelligence Dashboard ── */
.intel-dashboard { display: flex; flex-direction: column; gap: 1rem; }
.intel-row-1 { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 1rem; align-items: start; }
.intel-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: start; }

@media (max-width: 960px) {
  .intel-row-1, .intel-row-2 { grid-template-columns: 1fr; }
}

/* Module card shell */
.intel-mod {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.intel-mod:hover { box-shadow: 0 4px 16px rgba(192, 0, 48, 0.09); border-color: var(--line-strong); }
.intel-mod:focus-visible { outline: none; box-shadow: var(--focus-ring); }

.intel-mod__head {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--line);
  display: flex; justify-content: space-between; align-items: center;
}
.intel-mod__head--accent { border-left: 3px solid var(--accent); padding-left: 0.65rem; }
.intel-mod__head--warning { border-left: 3px solid var(--warning); padding-left: 0.65rem; }

.intel-mod__title { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
.intel-mod__title--accent { color: var(--accent); }
.intel-mod__title--warning { color: var(--warning); }

.intel-ai-badge { font-size: 0.54rem; background: var(--accent-soft); color: var(--accent); padding: 2px 6px; border-radius: 3px; font-weight: 700; letter-spacing: 0.04em; }

.intel-mod__body { padding: 0.9rem 1rem; flex: 1; }

.intel-mod__foot {
  padding: 0.5rem 1rem; border-top: 1px solid var(--line);
  background: var(--surface-soft);
  display: flex; justify-content: space-between; align-items: center;
}
.intel-mod__foot-meta { font-size: 0.61rem; color: var(--text-subtle); }
.intel-mod__foot-hint { font-size: 0.61rem; font-weight: 700; color: var(--accent); }

/* Signal strip */
.intel-signal-strip {
  border-top: 1px solid var(--line);
  padding: 0.6rem 1rem 0.65rem;
  margin: 0.7rem -1rem 0;
  background: var(--surface-muted);
}
.intel-signal-strip__label { font-size: 0.53rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-subtle); margin-bottom: 5px; }
.intel-signal-chip { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 4px; }
.intel-signal-chip:last-child { margin-bottom: 0; }
.intel-signal-chip__src { font-size: 0.52rem; font-weight: 700; padding: 1px 5px; border-radius: 3px; white-space: nowrap; flex-shrink: 0; margin-top: 1px; }
.intel-signal-chip__text { font-size: 0.62rem; color: var(--text-muted); line-height: 1.35; }
.intel-signal-chip__impact { font-size: 0.57rem; font-weight: 700; margin-top: 1px; }

/* Source badge color map (shared by chips and modal) */
.intel-src--sens { background: var(--accent-soft); color: var(--accent); }
.intel-src--press { background: var(--surface-strong); color: var(--text-muted); }
.intel-src--kb { background: var(--surface-strong); color: var(--text); }
.intel-src--supplier { background: var(--warning-soft); color: var(--warning); }
.intel-src--competitor { background: var(--critical-soft); color: var(--critical); }
.intel-src--regulatory { background: var(--positive-soft); color: var(--positive); }

/* Impact text color map */
.intel-impact--up { color: var(--positive); }
.intel-impact--watch { color: var(--warning); }
.intel-impact--context { color: var(--text-subtle); }

/* Modal */
.intel-modal-overlay {
  position: fixed; inset: 0; z-index: 60;
  background: rgba(17, 24, 39, 0.45);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 3rem 1rem; overflow-y: auto;
}
.intel-modal {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  width: 100%; max-width: 720px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}
.intel-modal__head {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
  padding: 0.95rem 1.2rem;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
}
.intel-modal__title { font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0; }
.intel-modal__subtitle { font-size: 0.7rem; color: rgba(255, 255, 255, 0.78); margin: 2px 0 0; }
.intel-modal__close { color: rgba(255, 255, 255, 0.8); background: none; border: none; display: flex; padding: 2px; border-radius: 4px; }
.intel-modal__close:hover { color: #fff; }
.intel-modal__body { padding: 1rem 1.2rem; }
.intel-modal__foot {
  border-top: 1px solid var(--line);
  padding: 0.7rem 1.2rem;
  background: var(--surface-soft);
  display: flex; justify-content: space-between; gap: 1rem;
  font-size: 0.62rem; color: var(--text-subtle);
}

.intel-section-title { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-subtle); margin: 1.1rem 0 0.5rem; }
.intel-section-title:first-child { margin-top: 0; }

/* Modal context box (green) */
.intel-context-box {
  background: var(--positive-soft); border: 1px solid #a7f3d0; border-radius: 6px;
  padding: 0.7rem 0.85rem; font-size: 0.72rem; color: #166534; line-height: 1.55;
}

/* Modal reasoning box (neutral) */
.intel-reasoning-box {
  background: var(--surface-soft); border: 1px solid var(--line); border-radius: 6px;
  padding: 0.75rem; font-size: 0.72rem; line-height: 1.6; color: var(--text-muted);
}
.intel-reasoning-box strong { color: var(--text); }

/* Citation list */
.intel-citation { font-size: 0.65rem; color: var(--text-subtle); background: var(--surface-soft); border: 1px solid var(--line); border-radius: 4px; padding: 5px 8px; display: flex; gap: 8px; margin-bottom: 4px; }
.intel-citation:last-child { margin-bottom: 0; }
.intel-citation__source { font-weight: 700; color: var(--text-muted); min-width: 110px; flex-shrink: 0; }

/* Signal Intelligence Section ("What the AI is seeing") */
.intel-signal-section { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
.intel-signal-section__head {
  background: linear-gradient(90deg, #111827 0%, #1f2937 100%);
  padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;
}
.intel-signal-section__title { font-size: 0.68rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px; }
.intel-signal-section__sub { font-size: 0.6rem; color: rgba(255, 255, 255, 0.55); }
.intel-pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: intel-pulse 2s infinite; flex-shrink: 0; }
@keyframes intel-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.intel-signal-list { padding: 0.65rem 0.75rem; display: flex; flex-direction: column; gap: 0.6rem; }

.intel-signal-card { border: 1px solid var(--line); border-radius: 5px; overflow: hidden; }
.intel-signal-card__head { padding: 5px 9px; display: flex; align-items: center; gap: 7px; }
.intel-signal-card__src { font-size: 0.6rem; font-weight: 700; }
.intel-signal-card__time { font-size: 0.58rem; color: var(--text-subtle); margin-left: auto; }
.intel-signal-card__body { padding: 7px 9px; background: var(--surface); }
.intel-signal-card__headline { font-size: 0.7rem; font-weight: 600; color: var(--text); line-height: 1.35; }
.intel-signal-card__excerpt { font-size: 0.65rem; color: var(--text-subtle); line-height: 1.4; margin-top: 2px; }
.intel-signal-card__pill { display: inline-block; font-size: 0.58rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; margin-top: 5px; }
.intel-signal-card__pill--up { background: var(--positive-soft); color: var(--positive); }
.intel-signal-card__pill--watch { background: var(--warning-soft); color: var(--warning); }
.intel-signal-card__pill--context { background: var(--surface-strong); color: var(--text-subtle); }
.intel-signal-card__connection { font-size: 0.65rem; color: var(--text-muted); line-height: 1.45; padding: 6px 9px; background: var(--surface-soft); border-top: 1px solid var(--line); }
.intel-signal-card__connection strong { color: var(--accent); }

.intel-synthesis { background: #111827; border-radius: 5px; padding: 0.6rem 0.7rem; }
.intel-synthesis__label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }
.intel-synthesis__text { font-size: 0.7rem; color: #e5e7eb; line-height: 1.55; }
.intel-synthesis__text strong { color: #fff; }
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npx vite build`
Expected: build succeeds with no CSS parse errors. (If `vite build` is slow, `npx vitest run` also imports CSS via the `css: true` test config and will surface syntax errors.)

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add intelligence dashboard CSS"
```

---

## Task 3: Shared format helpers

**Files:**
- Create: `src/components/intel/intelFormat.js`
- Test: `src/test/intelFormat.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/test/intelFormat.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { sourceBadgeClass, sourceLabel, impactClass } from '../components/intel/intelFormat';

describe('intelFormat', () => {
  it('maps source types to badge classes', () => {
    expect(sourceBadgeClass('sens')).toBe('intel-src--sens');
    expect(sourceBadgeClass('competitor')).toBe('intel-src--competitor');
    expect(sourceBadgeClass('unknown')).toBe('intel-src--press');
  });

  it('maps source types to human labels', () => {
    expect(sourceLabel('sens')).toBe('JSE SENS');
    expect(sourceLabel('kb')).toBe('KB');
    expect(sourceLabel('regulatory')).toBe('Regulatory');
  });

  it('maps impact directions to text classes', () => {
    expect(impactClass('up')).toBe('intel-impact--up');
    expect(impactClass('watch')).toBe('intel-impact--watch');
    expect(impactClass('context')).toBe('intel-impact--context');
    expect(impactClass('anything-else')).toBe('intel-impact--context');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/intelFormat.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/intel/intelFormat.js`:

```js
const SOURCE_BADGE = {
  sens: 'intel-src--sens',
  press: 'intel-src--press',
  kb: 'intel-src--kb',
  supplier: 'intel-src--supplier',
  competitor: 'intel-src--competitor',
  regulatory: 'intel-src--regulatory',
};

const SOURCE_LABEL = {
  sens: 'JSE SENS',
  press: 'Press',
  kb: 'KB',
  supplier: 'Supplier',
  competitor: 'Competitor',
  regulatory: 'Regulatory',
};

const IMPACT_CLASS = {
  up: 'intel-impact--up',
  watch: 'intel-impact--watch',
  context: 'intel-impact--context',
};

export function sourceBadgeClass(sourceType) {
  return SOURCE_BADGE[sourceType] ?? 'intel-src--press';
}

export function sourceLabel(sourceType) {
  return SOURCE_LABEL[sourceType] ?? 'Press';
}

export function impactClass(direction) {
  return IMPACT_CLASS[direction] ?? 'intel-impact--context';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/intelFormat.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/intel/intelFormat.js src/test/intelFormat.test.js
git commit -m "feat: add intel shared format helpers"
```

---

## Task 4: Shared IntelModal and SignalStrip components

**Files:**
- Create: `src/components/intel/IntelModal.jsx`
- Create: `src/components/intel/SignalStrip.jsx`
- Test: `src/test/intelShared.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/intelShared.test.jsx`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import IntelModal from '../components/intel/IntelModal';
import SignalStrip from '../components/intel/SignalStrip';

const signals = [
  { id: 's1', sourceType: 'competitor', headline: 'Loyalty launch', impactDirection: 'watch', impactLabel: '↑ Leading indicator' },
  { id: 's2', sourceType: 'kb', headline: 'Contact cadence below threshold', impactDirection: 'watch', impactLabel: 'Below threshold' },
];

describe('SignalStrip', () => {
  it('renders one chip per signal with source label and impact', () => {
    render(<SignalStrip signals={signals} />);
    expect(screen.getByText('Competitor')).toBeInTheDocument();
    expect(screen.getByText('KB')).toBeInTheDocument();
    expect(screen.getByText('Loyalty launch')).toBeInTheDocument();
    expect(screen.getByText('↑ Leading indicator')).toBeInTheDocument();
  });
});

describe('IntelModal', () => {
  it('renders title and children when open', () => {
    render(
      <IntelModal open title="Health Score" subtitle="Nkosi · AI-generated" onClose={() => {}}>
        <p>Modal body content</p>
      </IntelModal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Health Score')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    render(<IntelModal open={false} title="Health Score" onClose={() => {}}><p>Hidden</p></IntelModal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<IntelModal open title="X" onClose={onClose}><p>Body</p></IntelModal>);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<IntelModal open title="X" onClose={onClose}><p>Body</p></IntelModal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/intelShared.test.jsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write SignalStrip**

Create `src/components/intel/SignalStrip.jsx`:

```jsx
import { impactClass, sourceBadgeClass, sourceLabel } from './intelFormat';

export default function SignalStrip({ signals, label = 'AI Signals Active' }) {
  if (!signals?.length) {
    return null;
  }

  return (
    <div className="intel-signal-strip">
      <div className="intel-signal-strip__label">{label}</div>
      {signals.map(signal => (
        <div key={signal.id} className="intel-signal-chip">
          <span className={`intel-signal-chip__src ${sourceBadgeClass(signal.sourceType)}`}>
            {sourceLabel(signal.sourceType)}
          </span>
          <div>
            <div className="intel-signal-chip__text">{signal.headline}</div>
            {signal.impactLabel ? (
              <div className={`intel-signal-chip__impact ${impactClass(signal.impactDirection)}`}>
                {signal.impactLabel}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Write IntelModal**

Create `src/components/intel/IntelModal.jsx`:

```jsx
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function IntelModal({ open, title, subtitle, footerLeft, footerRight, onClose, children }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const titleId = 'intel-modal-title';

  return (
    <div className="intel-modal-overlay" onClick={onClose}>
      <div
        className="intel-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={event => event.stopPropagation()}
      >
        <div className="intel-modal__head">
          <div>
            <h3 id={titleId} className="intel-modal__title">{title}</h3>
            {subtitle ? <p className="intel-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="intel-modal__close" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="intel-modal__body">{children}</div>
        {footerLeft || footerRight ? (
          <div className="intel-modal__foot">
            <span>{footerLeft}</span>
            <span>{footerRight}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/test/intelShared.test.jsx`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/intel/IntelModal.jsx src/components/intel/SignalStrip.jsx src/test/intelShared.test.jsx
git commit -m "feat: add shared IntelModal and SignalStrip components"
```

---

## Task 5: Shared SignalIntelligenceSection component

**Files:**
- Create: `src/components/intel/SignalIntelligenceSection.jsx`
- Test: `src/test/signalIntelligenceSection.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/signalIntelligenceSection.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SignalIntelligenceSection from '../components/intel/SignalIntelligenceSection';

const signals = [
  {
    id: 'pnp',
    sourceType: 'competitor',
    sourceName: 'Retail Week',
    time: 'Yesterday',
    headline: 'Pick n Pay loyalty launch',
    excerpt: 'Expanded Smart Shopper programme.',
    impactDirection: 'watch',
    impactLabel: 'Competitor activity',
    connectionText: 'This nudges the competitor sub-score toward Watch.',
  },
];

describe('SignalIntelligenceSection', () => {
  it('renders each signal with source, headline, connection text, and synthesis', () => {
    render(<SignalIntelligenceSection signals={signals} synthesis="Two converging risks." />);
    expect(screen.getByText('What the AI is seeing')).toBeInTheDocument();
    expect(screen.getByText('Retail Week')).toBeInTheDocument();
    expect(screen.getByText('Pick n Pay loyalty launch')).toBeInTheDocument();
    expect(screen.getByText(/nudges the competitor sub-score/)).toBeInTheDocument();
    expect(screen.getByText('AI Synthesis')).toBeInTheDocument();
    expect(screen.getByText('Two converging risks.')).toBeInTheDocument();
  });

  it('renders without a synthesis block when none provided', () => {
    render(<SignalIntelligenceSection signals={signals} />);
    expect(screen.queryByText('AI Synthesis')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/signalIntelligenceSection.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/intel/SignalIntelligenceSection.jsx`:

```jsx
import { impactClass, sourceBadgeClass, sourceLabel } from './intelFormat';

const PILL_MODIFIER = {
  up: 'intel-signal-card__pill--up',
  watch: 'intel-signal-card__pill--watch',
  context: 'intel-signal-card__pill--context',
};

export default function SignalIntelligenceSection({ signals, synthesis, connectionLabel = 'How this affects this module' }) {
  if (!signals?.length) {
    return null;
  }

  return (
    <div className="intel-signal-section">
      <div className="intel-signal-section__head">
        <div className="intel-signal-section__title">
          <span className="intel-pulse" aria-hidden="true" />
          What the AI is seeing
        </div>
        <div className="intel-signal-section__sub">{signals.length} signal{signals.length === 1 ? '' : 's'}</div>
      </div>
      <div className="intel-signal-list">
        {signals.map(signal => (
          <div key={signal.id} className="intel-signal-card">
            <div className={`intel-signal-card__head ${sourceBadgeClass(signal.sourceType)}`}>
              <span className="intel-signal-card__src">{signal.sourceName ?? sourceLabel(signal.sourceType)}</span>
              {signal.time ? <span className="intel-signal-card__time">{signal.time}</span> : null}
            </div>
            <div className="intel-signal-card__body">
              <div className="intel-signal-card__headline">{signal.headline}</div>
              {signal.excerpt ? <div className="intel-signal-card__excerpt">{signal.excerpt}</div> : null}
              {signal.impactLabel ? (
                <span className={`intel-signal-card__pill ${PILL_MODIFIER[signal.impactDirection] ?? PILL_MODIFIER.context}`}>
                  {signal.impactLabel}
                </span>
              ) : null}
            </div>
            {signal.connectionText ? (
              <div className="intel-signal-card__connection">
                <strong>{connectionLabel}:</strong> {signal.connectionText}
              </div>
            ) : null}
          </div>
        ))}
        {synthesis ? (
          <div className="intel-synthesis">
            <div className="intel-synthesis__label">
              <span className="intel-pulse" aria-hidden="true" />
              AI Synthesis
            </div>
            <div className="intel-synthesis__text">{synthesis}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
```

> Note: `impactClass` is imported for parity with SignalStrip but the pill uses its own modifier map; keep the import only if used. If lint flags it as unused, remove the `impactClass` import — it is not needed here.

Correct the import line to avoid an unused import:

```jsx
import { sourceBadgeClass, sourceLabel } from './intelFormat';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/signalIntelligenceSection.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/intel/SignalIntelligenceSection.jsx src/test/signalIntelligenceSection.test.jsx
git commit -m "feat: add shared SignalIntelligenceSection component"
```

---

> **Tasks 6–10 are independent of one another.** Each builds one module component (card + modal) and depends only on Tasks 1–5. They can be assigned to parallel subagents. Each module component accepts no props and reads its own slice from `intelligenceData.js`.

## Task 6: Health Score module (Module 1)

**Files:**
- Create: `src/pages/portal/modules/HealthScoreModule.jsx`
- Test: `src/test/healthScoreModule.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/healthScoreModule.test.jsx`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HealthScoreModule from '../pages/portal/modules/HealthScoreModule';

describe('HealthScoreModule', () => {
  it('renders the score, risk band, and signal rows on the card', () => {
    render(<HealthScoreModule />);
    expect(screen.getByText('74')).toBeInTheDocument();
    expect(screen.getByText('Low Attrition Risk')).toBeInTheDocument();
    expect(screen.getByText('Contact frequency')).toBeInTheDocument();
  });

  it('opens the modal with score breakdown and reasoning when the card is clicked', () => {
    render(<HealthScoreModule />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /relationship health score/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Engagement Activity')).toBeInTheDocument();
    expect(screen.getByText(/places it in the Low Attrition Risk band/i)).toBeInTheDocument();
    expect(screen.getByText('What the AI is seeing')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/healthScoreModule.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/pages/portal/modules/HealthScoreModule.jsx`:

```jsx
import { useState } from 'react';
import { healthScore } from '../../../data/intelligenceData';
import IntelModal from '../../../components/intel/IntelModal';
import SignalStrip from '../../../components/intel/SignalStrip';
import SignalIntelligenceSection from '../../../components/intel/SignalIntelligenceSection';

const BAND_LABEL = {
  critical: 'Critical Attrition Risk',
  moderate: 'Moderate Attrition Risk',
  stable: 'Stable Relationship',
  low: 'Low Attrition Risk',
  engaged: 'Fully Engaged',
};

const ROW_TONE = { moderate: 'warn', high: 'watch' };
const VAL_TONE = { none: 'pos', moderate: 'warn', high: 'crit' };

const SUB_SCORE_META = [
  { key: 'engagement', label: 'Engagement Activity', max: 30, weight: '30%' },
  { key: 'transaction', label: 'Transaction Health', max: 35, weight: '35%' },
  { key: 'loyalty', label: 'Market Loyalty', max: 35, weight: '35%' },
];

export default function HealthScoreModule() {
  const [open, setOpen] = useState(false);
  const cardSignals = healthScore.intelligenceSignals.slice(0, 2);

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="Relationship Health Score — open full breakdown"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--accent">
          <div className="intel-mod__title intel-mod__title--accent">Relationship Health Score</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-health__hero">
            <div className="intel-health__score">{healthScore.score}</div>
            <div className="intel-health__side">
              <span className="intel-health__pill">{BAND_LABEL[healthScore.band]}</span>
              <span className="intel-health__sub">Composite · 0–100</span>
            </div>
          </div>
          <div className="intel-health__track">
            <div className="intel-health__fill" />
            <div className="intel-health__marker" style={{ left: `${healthScore.score}%` }} />
          </div>
          <div className="intel-health__labels">
            <span>Critical</span><span>Moderate</span><span>Stable</span><span>Engaged</span>
          </div>
          <div className="intel-health__rows">
            {healthScore.signals.slice(0, 4).map(signal => (
              <div key={signal.id} className={`intel-health__row${ROW_TONE[signal.risk] ? ` intel-health__row--${ROW_TONE[signal.risk]}` : ''}`}>
                <span className="intel-health__row-label">{signal.label}</span>
                <span className={`intel-health__row-val intel-health__row-val--${VAL_TONE[signal.risk] ?? 'pos'}`}>{signal.trendLabel}</span>
              </div>
            ))}
          </div>
          <SignalStrip signals={cardSignals} />
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">Updated {healthScore.updatedAt} · {cardSignals.length} signals</span>
          <span className="intel-mod__foot-hint">Full breakdown →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="Relationship Health & Attrition Risk"
        subtitle={`Nkosi Retail Group · AI-generated · Updated ${healthScore.updatedAt}`}
        footerLeft="AI-generated assessment. Apply professional judgement before acting on scores."
        footerRight={`Model: ${healthScore.model}`}
        onClose={() => setOpen(false)}
      >
        <div className="intel-section-title">Score Breakdown</div>
        <div className="intel-breakdown">
          {SUB_SCORE_META.map(meta => (
            <div key={meta.key} className="intel-breakdown__item">
              <div className="intel-breakdown__val">{healthScore.subScores[meta.key]}<span className="intel-breakdown__max">/{meta.max}</span></div>
              <div className="intel-breakdown__name">{meta.label}</div>
              <div className="intel-breakdown__weight">{meta.weight} weight</div>
            </div>
          ))}
        </div>
        <div className="intel-breakdown__total">
          Total: <strong>{healthScore.score} / 100</strong> — {BAND_LABEL[healthScore.band]}
        </div>

        <div className="intel-section-title">Signal Detail</div>
        <table className="intel-table">
          <thead>
            <tr><th>Signal</th><th>Reading</th><th>Trend (90d)</th><th>Risk</th></tr>
          </thead>
          <tbody>
            {healthScore.signals.map(signal => (
              <tr key={signal.id}>
                <td><strong>{signal.label}</strong><span className="intel-table__sub">{signal.detail}</span></td>
                <td>{signal.reading}</td>
                <td>{signal.trendLabel}</td>
                <td>{signal.riskLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="intel-section-title">AI Reasoning</div>
        <div className="intel-reasoning-box">{healthScore.reasoning}</div>

        <div className="intel-section-title">Data Sources & Citations</div>
        {healthScore.sources.map(source => (
          <div key={source.source} className="intel-citation">
            <span className="intel-citation__source">{source.source}</span>
            <span>{source.detail}</span>
          </div>
        ))}

        <div className="intel-section-title">What the AI is Seeing</div>
        <SignalIntelligenceSection
          signals={healthScore.intelligenceSignals}
          synthesis={healthScore.synthesis}
          connectionLabel="How this affects the Health Score"
        />
      </IntelModal>
    </>
  );
}
```

- [ ] **Step 4: Append module-specific CSS to `src/styles/global.css`**

```css
/* Module 1 — Health Score */
.intel-health__hero { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.65rem; }
.intel-health__score { font-size: 2.75rem; font-weight: 800; color: var(--accent); line-height: 1; font-family: var(--heading-font); }
.intel-health__side { display: flex; flex-direction: column; gap: 4px; }
.intel-health__pill { display: inline-block; font-size: 0.67rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; background: var(--positive-soft); color: var(--positive); width: fit-content; }
.intel-health__sub { font-size: 0.62rem; color: var(--text-subtle); }
.intel-health__track { background: var(--surface-strong); border-radius: 4px; height: 5px; position: relative; overflow: hidden; margin-bottom: 5px; }
.intel-health__fill { position: absolute; inset: 0; background: linear-gradient(90deg, var(--critical) 0%, var(--warning) 40%, var(--positive) 72%); }
.intel-health__marker { position: absolute; top: -2px; width: 3px; height: 9px; background: var(--text); border-radius: 2px; }
.intel-health__labels { display: flex; justify-content: space-between; font-size: 0.55rem; color: var(--text-subtle); margin-bottom: 0.65rem; }
.intel-health__rows { display: flex; flex-direction: column; gap: 4px; }
.intel-health__row { display: flex; justify-content: space-between; font-size: 0.7rem; padding: 4px 7px; border-radius: 4px; background: var(--surface-soft); border: 1px solid var(--line); }
.intel-health__row--warn { background: var(--warning-soft); border-color: #f0d080; }
.intel-health__row--watch { background: var(--critical-soft); border-color: #f0c0cc; }
.intel-health__row-label { color: var(--text-muted); }
.intel-health__row-val { font-weight: 700; }
.intel-health__row-val--pos { color: var(--positive); }
.intel-health__row-val--warn { color: var(--warning); }
.intel-health__row-val--crit { color: var(--critical); }

/* Shared modal: breakdown + table (used by Health and others) */
.intel-breakdown { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.intel-breakdown__item { background: var(--surface-soft); border: 1px solid var(--line); border-radius: 6px; padding: 10px; text-align: center; }
.intel-breakdown__val { font-size: 1.4rem; font-weight: 800; color: var(--text); }
.intel-breakdown__max { font-size: 0.8rem; color: var(--text-subtle); }
.intel-breakdown__name { font-size: 0.62rem; color: var(--text-subtle); margin-top: 2px; }
.intel-breakdown__weight { font-size: 0.58rem; color: var(--text-subtle); margin-top: 1px; }
.intel-breakdown__total { text-align: center; font-size: 0.68rem; color: var(--text-subtle); margin-top: 6px; }
.intel-breakdown__total strong { color: var(--accent); font-size: 1rem; }

.intel-table { width: 100%; border-collapse: collapse; font-size: 0.72rem; }
.intel-table th { text-align: left; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-subtle); padding: 4px 6px; border-bottom: 1px solid var(--line); }
.intel-table td { padding: 6px; border-bottom: 1px solid var(--surface-muted); vertical-align: top; }
.intel-table tr:last-child td { border-bottom: none; }
.intel-table__sub { display: block; color: var(--text-subtle); font-size: 0.65rem; margin-top: 1px; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/test/healthScoreModule.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/pages/portal/modules/HealthScoreModule.jsx src/test/healthScoreModule.test.jsx src/styles/global.css
git commit -m "feat: add health score intelligence module"
```

---

## Task 7: Lifecycle Milestones module (Module 2)

**Files:**
- Create: `src/pages/portal/modules/MilestonesModule.jsx`
- Test: `src/test/milestonesModule.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/milestonesModule.test.jsx`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MilestonesModule from '../pages/portal/modules/MilestonesModule';

describe('MilestonesModule', () => {
  it('renders milestone names and day labels on the card', () => {
    render(<MilestonesModule />);
    expect(screen.getByText('Financial Year-End')).toBeInTheDocument();
    expect(screen.getByText('42 days')).toBeInTheDocument();
    expect(screen.getByText('CIPC Director Change')).toBeInTheDocument();
  });

  it('opens the modal showing what-it-is, why-it-matters, and RM context per milestone', () => {
    render(<MilestonesModule />);
    fireEvent.click(screen.getByRole('button', { name: /lifecycle milestones/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('What it is').length).toBeGreaterThan(0);
    expect(screen.getAllByText('RM Conversation Context').length).toBeGreaterThan(0);
    expect(screen.getByText(/financial year ends 10 July 2026/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/milestonesModule.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/pages/portal/modules/MilestonesModule.jsx`:

```jsx
import { useState } from 'react';
import { milestones, signalsForModule } from '../../../data/intelligenceData';
import IntelModal from '../../../components/intel/IntelModal';
import SignalStrip from '../../../components/intel/SignalStrip';
import SignalIntelligenceSection from '../../../components/intel/SignalIntelligenceSection';

const moduleSignals = signalsForModule('milestones');
const urgentCount = milestones.filter(m => m.urgency === 'urgent').length;

export default function MilestonesModule() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="Lifecycle Milestones — open RM context"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--warning">
          <div className="intel-mod__title intel-mod__title--warning">Lifecycle Milestones</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-ml__list">
            {milestones.map(milestone => {
              const isUrgent = milestone.urgency === 'urgent';
              return (
                <div key={milestone.id} className={`intel-ml__item${isUrgent ? ' intel-ml__item--urgent' : ''}`}>
                  <span className={`intel-ml__dot${isUrgent ? ' intel-ml__dot--urgent' : ''}`} aria-hidden="true" />
                  <div className="intel-ml__body">
                    <div className="intel-ml__name">{milestone.name}</div>
                    <div className="intel-ml__meta">{milestone.meta}</div>
                  </div>
                  <span className={`intel-ml__days${isUrgent ? ' intel-ml__days--urgent' : ''}`}>{milestone.daysLabel}</span>
                </div>
              );
            })}
          </div>
          <SignalStrip signals={moduleSignals} />
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">{milestones.length} milestones · {urgentCount} need attention</span>
          <span className="intel-mod__foot-hint">RM context →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="Client Milestone & Lifecycle Intelligence"
        subtitle={`Nkosi Retail Group · AI-generated · ${milestones.length} active milestones`}
        footerLeft="AI-generated milestone detection. Verify regulatory events directly before acting."
        footerRight="Model: CVP Lifecycle v1.4"
        onClose={() => setOpen(false)}
      >
        <div className="intel-section-title">Active Milestones — RM Context</div>
        {milestones.map(milestone => (
          <div key={milestone.id} className="intel-ml-detail">
            <div className={`intel-ml-detail__head${milestone.urgency === 'urgent' ? ' intel-ml-detail__head--urgent' : ''}`}>
              <span className="intel-ml-detail__title">
                {milestone.urgency === 'urgent' ? '⚠ ' : ''}{milestone.name} — {milestone.daysLabel}
              </span>
              <span className="intel-ml-detail__source">{milestone.source}</span>
            </div>
            <div className="intel-ml-detail__body">
              <div className="intel-ml-detail__row">
                <span className="intel-ml-detail__key">What it is</span>
                <span className="intel-ml-detail__val">{milestone.whatItIs}</span>
              </div>
              <div className="intel-ml-detail__row">
                <span className="intel-ml-detail__key">Why it matters</span>
                <span className="intel-ml-detail__val">{milestone.whyItMatters}</span>
              </div>
              <div className="intel-context-box">
                <strong>RM Conversation Context:</strong> {milestone.rmContext}
              </div>
            </div>
          </div>
        ))}

        <div className="intel-section-title">AI Reasoning</div>
        <div className="intel-reasoning-box">
          Milestones are detected by monitoring CIPC filings, year-end calendar patterns, and BBBEE certification cycles against each client's profile. Urgency is ranked by time to event, financial materiality, and whether the event opens or closes a natural RM conversation window. Governance events such as the director change are prioritised because their action window is short.
        </div>

        <div className="intel-section-title">What the AI is Seeing</div>
        <SignalIntelligenceSection
          signals={moduleSignals}
          connectionLabel="How this affects the Milestones module"
        />
      </IntelModal>
    </>
  );
}
```

> Note: the test asserts the literal labels `What it is` and `RM Conversation Context`. The detail row uses key text `What it is`; the context box renders `RM Conversation Context:` inside a `<strong>`. `getAllByText('RM Conversation Context')` matches via substring is NOT default — Testing Library matches full text content of the element. The `<strong>` contains exactly `RM Conversation Context:` (with colon). Adjust the test matcher to use a regex: change the assertion to `screen.getAllByText(/RM Conversation Context/)`. Update the test in Step 1 accordingly before running.

Apply this correction to the test file Step 1: replace the two `getAllByText('...')` calls with regex matchers:

```jsx
    expect(screen.getAllByText(/What it is/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/RM Conversation Context/).length).toBeGreaterThan(0);
```

- [ ] **Step 4: Append module-specific CSS to `src/styles/global.css`**

```css
/* Module 2 — Milestones */
.intel-ml__list { display: flex; flex-direction: column; gap: 6px; }
.intel-ml__item { display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 5px; border: 1px solid var(--line); background: var(--surface-soft); }
.intel-ml__item--urgent { background: var(--warning-soft); border-color: #f0c470; }
.intel-ml__dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: var(--line-strong); }
.intel-ml__dot--urgent { background: var(--warning); }
.intel-ml__body { flex: 1; min-width: 0; }
.intel-ml__name { font-size: 0.71rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.intel-ml__meta { font-size: 0.6rem; color: var(--text-subtle); margin-top: 1px; }
.intel-ml__days { font-size: 0.6rem; font-weight: 700; padding: 2px 7px; border-radius: 10px; white-space: nowrap; flex-shrink: 0; background: var(--surface-strong); color: var(--text-subtle); border: 1px solid var(--line); }
.intel-ml__days--urgent { background: var(--warning-soft); color: var(--warning); border-color: #f0c470; }

.intel-ml-detail { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 8px; }
.intel-ml-detail__head { padding: 8px 12px; background: var(--surface-soft); border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.intel-ml-detail__head--urgent { background: var(--warning-soft); }
.intel-ml-detail__title { font-size: 0.78rem; font-weight: 700; color: var(--text); }
.intel-ml-detail__source { font-size: 0.6rem; background: var(--surface-strong); border: 1px solid var(--line); border-radius: 3px; padding: 1px 6px; color: var(--text-subtle); font-weight: 600; white-space: nowrap; }
.intel-ml-detail__body { padding: 10px 12px; display: flex; flex-direction: column; gap: 7px; }
.intel-ml-detail__row { display: grid; grid-template-columns: 90px 1fr; gap: 6px; font-size: 0.7rem; }
.intel-ml-detail__key { font-weight: 700; color: var(--text-subtle); }
.intel-ml-detail__val { color: var(--text); line-height: 1.45; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/test/milestonesModule.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/pages/portal/modules/MilestonesModule.jsx src/test/milestonesModule.test.jsx src/styles/global.css
git commit -m "feat: add lifecycle milestones intelligence module"
```

---

## Task 8: News & Event Monitor module (Module 3)

**Files:**
- Create: `src/pages/portal/modules/NewsMonitorModule.jsx`
- Test: `src/test/newsMonitorModule.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/newsMonitorModule.test.jsx`:

```jsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NewsMonitorModule from '../pages/portal/modules/NewsMonitorModule';

describe('NewsMonitorModule', () => {
  it('renders the live feed counts and top headlines on the card', () => {
    render(<NewsMonitorModule />);
    expect(screen.getByText('Live Feed')).toBeInTheDocument();
    expect(screen.getByText('Act Now')).toBeInTheDocument();
    expect(screen.getAllByText(/Pick n Pay launches expanded Smart Shopper/i).length).toBeGreaterThan(0);
  });

  it('opens the modal with the AI daily brief and relevance assessments', () => {
    render(<NewsMonitorModule />);
    fireEvent.click(screen.getByRole('button', { name: /external news & event monitor/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('AI Daily Brief')).toBeInTheDocument();
    expect(within(dialog).getAllByText('AI Relevance Assessment').length).toBeGreaterThan(0);
    expect(within(dialog).getByText(/8% across-the-board price increase/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/newsMonitorModule.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/pages/portal/modules/NewsMonitorModule.jsx`:

```jsx
import { useState } from 'react';
import { newsItems } from '../../../data/intelligenceData';
import { sourceBadgeClass, sourceLabel } from '../../../components/intel/intelFormat';
import IntelModal from '../../../components/intel/IntelModal';

const URGENCY_META = {
  act: { label: 'Act Now', cardMod: 'act', pillMod: 'act' },
  monitor: { label: 'Monitor', cardMod: 'monitor', pillMod: 'monitor' },
  context: { label: 'Context', cardMod: 'context', pillMod: 'context' },
};

const counts = {
  act: newsItems.filter(n => n.urgency === 'act').length,
  monitor: newsItems.filter(n => n.urgency === 'monitor').length,
  context: newsItems.filter(n => n.urgency === 'context').length,
};

const dailyBrief =
  'Two signals require RM action today. A competitor loyalty programme launch (Pick n Pay Smart Shopper expansion) directly targets Nkosi’s core customer base — make contact before the client sees coverage. Separately, a FMCG distributor price hike of 8% from July introduces a cost-push risk to creditor days and gross margin. Three further signals provide context: Shoprite’s strong results confirm sector tailwinds, load-shedding margin data reframes the client’s benchmarking position favourably, and a dti BBBEE consultation adds urgency to the Q3 milestone calendar.';

export default function NewsMonitorModule() {
  const [open, setOpen] = useState(false);

  // Card shows the first four items in a 2-col grid, fifth spans full width.
  const cardItems = newsItems.slice(0, 5);

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="External News & Event Monitor — open full feed"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--accent">
          <div className="intel-mod__title intel-mod__title--accent">External News & Event Monitor</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-news__live">
            <span className="intel-pulse" aria-hidden="true" />
            <span className="intel-news__live-label">Live Feed</span>
            <span className="intel-news__live-meta">Last scan: 09:14 · 4-hour interval</span>
          </div>
          <div className="intel-news__counts">
            <div className="intel-news__count intel-news__count--red"><span className="intel-news__count-val">{counts.act}</span><span className="intel-news__count-lbl">Act Now</span></div>
            <div className="intel-news__count"><span className="intel-news__count-val">{counts.monitor}</span><span className="intel-news__count-lbl">Monitor</span></div>
            <div className="intel-news__count"><span className="intel-news__count-val">{counts.context}</span><span className="intel-news__count-lbl">Context</span></div>
          </div>
          <div className="intel-news__grid">
            {cardItems.map((item, index) => {
              const meta = URGENCY_META[item.urgency];
              const isFull = index === 4;
              return (
                <div key={item.id} className={`intel-news__card intel-news__card--${meta.cardMod}${isFull ? ' intel-news__card--full' : ''}`}>
                  <div className="intel-news__card-top">
                    <span className={`intel-news__src ${sourceBadgeClass(item.sourceType)}`}>{sourceLabel(item.sourceType)}</span>
                    <span className="intel-news__time">{item.time.split(' · ')[0]}</span>
                    <span className={`intel-news__pill intel-news__pill--${meta.pillMod}`}>{meta.label}</span>
                  </div>
                  <div className="intel-news__headline">{item.headline}</div>
                  <div className="intel-news__why"><strong>Why:</strong> {shortWhy(item.relevanceAssessment)}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">{newsItems.length} signals · {counts.act} need RM action</span>
          <span className="intel-mod__foot-hint">Open full feed →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="External News & Event Monitoring"
        subtitle={`Nkosi Retail Group · AI-curated · ${newsItems.length} signals · Last scan 09:14`}
        footerLeft="AI-curated feed. Relevance assessments are AI-generated — apply professional judgement."
        footerRight="CVP News Monitor v1.8 · Scan interval: 4 hours"
        onClose={() => setOpen(false)}
      >
        <div className="intel-news__brief">
          <div className="intel-news__brief-head">
            <span className="intel-pulse" aria-hidden="true" />
            <span className="intel-news__brief-title">AI Daily Brief</span>
            <span className="intel-news__brief-time">29 May 2026, 09:14</span>
          </div>
          <div className="intel-news__brief-text">{dailyBrief}</div>
        </div>

        <div className="intel-section-title">All Signals</div>
        {newsItems.map(item => {
          const meta = URGENCY_META[item.urgency];
          return (
            <div key={item.id} className="intel-news-item">
              <div className={`intel-news-item__head ${sourceBadgeClass(item.sourceType)}`}>
                <span className="intel-news-item__src">{item.sourceName}</span>
                <span className="intel-news-item__time">{item.time}</span>
                <span className={`intel-news__pill intel-news__pill--${meta.pillMod}`}>{meta.label}</span>
              </div>
              <div className="intel-news-item__body">
                <div className="intel-news-item__headline">{item.headline}</div>
                <div className="intel-news-item__excerpt">{item.excerpt}</div>
                <div className="intel-news-item__assessment">
                  <div className="intel-news-item__assessment-label">AI Relevance Assessment</div>
                  <div className="intel-news-item__assessment-text">{item.relevanceAssessment}</div>
                  <div className="intel-news-item__modules">
                    {item.affectedModules.map(mod => (
                      <span key={mod} className="intel-news-item__module-tag">→ {MODULE_LABEL[mod] ?? mod}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </IntelModal>
    </>
  );
}

const MODULE_LABEL = {
  health: 'Health Score',
  milestones: 'Milestones',
  benchmarking: 'Benchmarking',
  diagnostic: 'Diagnostic',
};

// Trim the relevance assessment to its first sentence for the compact card "why" line.
function shortWhy(text) {
  const firstSentence = text.split('. ')[0];
  return firstSentence.length > 90 ? `${firstSentence.slice(0, 87)}…` : `${firstSentence}.`;
}
```

- [ ] **Step 4: Append module-specific CSS to `src/styles/global.css`**

```css
/* Module 3 — News Monitor */
.intel-news__live { display: flex; align-items: center; gap: 6px; margin-bottom: 0.7rem; }
.intel-news__live-label { font-size: 0.63rem; font-weight: 700; color: var(--accent); }
.intel-news__live-meta { font-size: 0.6rem; color: var(--text-subtle); margin-left: auto; }
.intel-news__counts { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 0.85rem; }
.intel-news__count { background: var(--surface-soft); border: 1px solid var(--line); border-radius: 5px; padding: 6px 8px; text-align: center; }
.intel-news__count--red { background: var(--accent-soft); border-color: #f0c0cc; }
.intel-news__count-val { display: block; font-size: 1.05rem; font-weight: 800; color: var(--text); line-height: 1; }
.intel-news__count--red .intel-news__count-val { color: var(--accent); }
.intel-news__count-lbl { font-size: 0.55rem; color: var(--text-subtle); }
.intel-news__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.intel-news__card { padding: 8px 10px; border-radius: 5px; border: 1px solid var(--line); background: var(--surface-soft); }
.intel-news__card--act { background: var(--accent-soft); border-color: #f0c0cc; }
.intel-news__card--monitor { background: var(--warning-soft); border-color: #f0c470; }
.intel-news__card--full { grid-column: 1 / -1; }
.intel-news__card-top { display: flex; align-items: center; gap: 4px; margin-bottom: 3px; }
.intel-news__src { font-size: 0.51rem; font-weight: 700; padding: 1px 5px; border-radius: 3px; }
.intel-news__time { font-size: 0.57rem; color: var(--text-subtle); }
.intel-news__pill { font-size: 0.51rem; font-weight: 700; padding: 1px 6px; border-radius: 8px; margin-left: auto; }
.intel-news__pill--act { background: var(--accent); color: #fff; }
.intel-news__pill--monitor { background: var(--warning-soft); color: var(--warning); border: 1px solid #f0c470; }
.intel-news__pill--context { background: var(--surface-strong); color: var(--text-subtle); }
.intel-news__headline { font-size: 0.69rem; font-weight: 700; color: var(--text); line-height: 1.3; margin-bottom: 2px; }
.intel-news__why { font-size: 0.6rem; color: var(--text-muted); line-height: 1.35; }
.intel-news__why strong { color: var(--accent); }

/* News modal */
.intel-news__brief { background: #111827; border-radius: 6px; padding: 0.7rem 0.85rem; margin-bottom: 0.5rem; }
.intel-news__brief-head { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.intel-news__brief-title { font-size: 0.65rem; font-weight: 700; color: #fff; }
.intel-news__brief-time { font-size: 0.6rem; color: rgba(255, 255, 255, 0.45); margin-left: auto; }
.intel-news__brief-text { font-size: 0.7rem; color: #e5e7eb; line-height: 1.6; }
.intel-news-item { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 8px; }
.intel-news-item__head { padding: 6px 10px; display: flex; align-items: center; gap: 7px; }
.intel-news-item__src { font-size: 0.65rem; font-weight: 700; }
.intel-news-item__time { font-size: 0.58rem; color: var(--text-subtle); }
.intel-news-item__body { padding: 9px 10px; background: var(--surface); }
.intel-news-item__headline { font-size: 0.76rem; font-weight: 700; color: var(--text); margin-bottom: 4px; line-height: 1.35; }
.intel-news-item__excerpt { font-size: 0.68rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 8px; }
.intel-news-item__assessment { background: var(--surface-soft); border: 1px solid var(--line); border-radius: 5px; padding: 7px 9px; }
.intel-news-item__assessment-label { font-size: 0.56rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); margin-bottom: 3px; }
.intel-news-item__assessment-text { font-size: 0.67rem; color: var(--text-muted); line-height: 1.5; }
.intel-news-item__modules { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 6px; }
.intel-news-item__module-tag { font-size: 0.58rem; padding: 2px 6px; border-radius: 8px; background: var(--accent-soft); color: var(--accent-dark); border: 1px solid #f0c0cc; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/test/newsMonitorModule.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/pages/portal/modules/NewsMonitorModule.jsx src/test/newsMonitorModule.test.jsx src/styles/global.css
git commit -m "feat: add news and event monitor intelligence module"
```

---

## Task 9: Peer Benchmarking module (Module 4)

**Files:**
- Create: `src/pages/portal/modules/BenchmarkingModule.jsx`
- Test: `src/test/benchmarkingModule.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/benchmarkingModule.test.jsx`:

```jsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BenchmarkingModule from '../pages/portal/modules/BenchmarkingModule';

describe('BenchmarkingModule', () => {
  it('renders the peer group tag and one metric per preview category on the card', () => {
    render(<BenchmarkingModule />);
    expect(screen.getByText(/n=34/)).toBeInTheDocument();
    expect(screen.getByText('Revenue Growth (YoY)')).toBeInTheDocument();
    expect(screen.getByText('Cash Conversion Cycle')).toBeInTheDocument();
  });

  it('opens the modal with the methodology panel and all four categories', () => {
    render(<BenchmarkingModule />);
    fireEvent.click(screen.getByRole('button', { name: /peer benchmarking/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Peer Group Methodology')).toBeInTheDocument();
    expect(within(dialog).getByText('Banking Behaviour')).toBeInTheDocument();
    expect(within(dialog).getByText('Growth Indicators')).toBeInTheDocument();
    expect(within(dialog).getByText(/k-anonymity/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/benchmarkingModule.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/pages/portal/modules/BenchmarkingModule.jsx`:

```jsx
import { useState } from 'react';
import { benchmarking, signalsForModule } from '../../../data/intelligenceData';
import IntelModal from '../../../components/intel/IntelModal';
import SignalStrip from '../../../components/intel/SignalStrip';
import SignalIntelligenceSection from '../../../components/intel/SignalIntelligenceSection';

const moduleSignals = signalsForModule('benchmarking');
const BAR_TONE = { good: 'intel-bench__bar-client--good', accent: 'intel-bench__bar-client--accent', warn: 'intel-bench__bar-client--warn' };
const QUARTILE_TONE = { Top: 'intel-q--top', '2nd': 'intel-q--mid', '3rd': 'intel-q--warn', bottom: 'intel-q--warn' };
const topQuartileCount = benchmarking.categories.flatMap(c => c.metrics).filter(m => m.quartile === 'Top').length;
const totalMetrics = benchmarking.categories.flatMap(c => c.metrics).length;

// Card preview: first metric of the first three categories.
const previewMetrics = benchmarking.categories.slice(0, 3).map(cat => ({
  category: cat.label,
  metric: cat.metrics[0],
}));

const METHOD_CELLS = pg => ([
  { label: 'Sector', value: pg.sector },
  { label: 'Revenue band', value: pg.revenueBand },
  { label: 'Geography', value: pg.geography },
  { label: 'Peer count', value: `${pg.n} businesses` },
  { label: 'Refresh', value: pg.refreshDate },
  { label: 'Anonymisation', value: pg.kAnonymity },
]);

function BenchBar({ metric }) {
  return (
    <div className="intel-bench__bar">
      <div className="intel-bench__bar-peer" style={{ width: `${metric.barPeerPct}%` }} />
      <div className={`intel-bench__bar-client ${BAR_TONE[metric.tone] ?? BAR_TONE.good}`} style={{ width: `${metric.barClientPct}%` }} />
    </div>
  );
}

export default function BenchmarkingModule() {
  const [open, setOpen] = useState(false);
  const pg = benchmarking.peerGroup;

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="Peer Benchmarking — open full benchmark"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--accent">
          <div className="intel-mod__title intel-mod__title--accent">Peer Benchmarking</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-bench__tag">◎ {pg.sector.split(' (')[0]} · {pg.revenueBand} · n={pg.n}</div>
          {previewMetrics.map(({ category, metric }) => (
            <div key={metric.id} className="intel-bench__group">
              <div className="intel-bench__cat">{category}</div>
              <div className="intel-bench__item">
                <div className="intel-bench__item-head">
                  <span className="intel-bench__item-name">{metric.name}</span>
                  <span className={`intel-q ${QUARTILE_TONE[metric.quartile] ?? 'intel-q--mid'}`}>{metric.quartile} quartile</span>
                </div>
                <div className="intel-bench__item-vals">Client: <strong>{metric.clientValue}</strong> · Peers: <strong>{metric.median}</strong></div>
                <BenchBar metric={metric} />
              </div>
            </div>
          ))}
          <div className="intel-bench__legend">
            <span><span className="intel-bench__swatch intel-bench__swatch--client" />This client</span>
            <span><span className="intel-bench__swatch intel-bench__swatch--peer" />Peer median</span>
          </div>
          <SignalStrip signals={moduleSignals} />
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">{topQuartileCount} of {totalMetrics} metrics top quartile</span>
          <span className="intel-mod__foot-hint">Full benchmark →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="Anonymous Peer Benchmarking"
        subtitle={`Nkosi Retail Group · AI-generated · ${pg.n} peers · Updated ${pg.refreshDate}`}
        footerLeft="Anonymised aggregate data. No peer business is identifiable. Banking Behaviour data is Absa-internal only."
        footerRight="Model: CVP Benchmark v3.1"
        onClose={() => setOpen(false)}
      >
        <div className="intel-section-title">Peer Group Methodology</div>
        <div className="intel-method">
          {METHOD_CELLS(pg).map(cell => (
            <div key={cell.label} className="intel-method__cell">
              <span className="intel-method__label">{cell.label}</span>
              <span className="intel-method__val">{cell.value}</span>
            </div>
          ))}
        </div>
        <p className="intel-method__note">All peer data is anonymised and aggregated. No individual business is identifiable from these benchmarks.</p>

        <div className="intel-section-title">Grouped Metrics</div>
        {benchmarking.categories.map(category => (
          <div key={category.id} className="intel-bench-table">
            <div className="intel-bench-table__head">
              {category.label}
              <span className="intel-bench-table__desc">{category.description}</span>
            </div>
            <table className="intel-table intel-bench-table__table">
              <thead>
                <tr><th>Metric</th><th>Client</th><th>Median</th><th>vs Peers</th><th>Quartile</th></tr>
              </thead>
              <tbody>
                {category.metrics.map(metric => (
                  <tr key={metric.id}>
                    <td><strong>{metric.name}</strong><span className="intel-table__sub">{metric.formula}</span></td>
                    <td><strong>{metric.clientValue}</strong></td>
                    <td>{metric.median}</td>
                    <td style={{ width: '90px' }}><BenchBar metric={metric} /></td>
                    <td><span className={`intel-q ${QUARTILE_TONE[metric.quartile] ?? 'intel-q--mid'}`}>{metric.quartile}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="intel-section-title">RM Conversation Context</div>
        <div className="intel-context-box">{benchmarking.rmContext}</div>

        <div className="intel-section-title">AI Reasoning</div>
        <div className="intel-reasoning-box">{benchmarking.reasoning}</div>

        <div className="intel-section-title">What the AI is Seeing</div>
        <SignalIntelligenceSection
          signals={moduleSignals}
          synthesis={benchmarking.synthesis}
          connectionLabel="How this affects the benchmarks"
        />
      </IntelModal>
    </>
  );
}
```

- [ ] **Step 4: Append module-specific CSS to `src/styles/global.css`**

```css
/* Module 4 — Benchmarking */
.intel-bench__tag { font-size: 0.61rem; background: var(--accent-soft); border: 1px solid #f0c0cc; color: var(--accent-dark); padding: 2px 9px; border-radius: 10px; display: inline-block; margin-bottom: 0.75rem; }
.intel-bench__group { margin-bottom: 0.5rem; }
.intel-bench__cat { font-size: 0.54rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-subtle); padding-bottom: 3px; border-bottom: 1px solid var(--line); margin-bottom: 4px; }
.intel-bench__item-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
.intel-bench__item-name { font-size: 0.68rem; font-weight: 600; color: var(--text-muted); }
.intel-bench__item-vals { font-size: 0.63rem; color: var(--text-subtle); margin-bottom: 3px; }
.intel-bench__item-vals strong { color: var(--text); }
.intel-bench__bar { background: var(--surface-strong); border-radius: 3px; height: 4px; position: relative; }
.intel-bench__bar-peer { position: absolute; left: 0; top: 0; height: 4px; background: var(--line-strong); border-radius: 3px; }
.intel-bench__bar-client { position: absolute; top: 0; height: 4px; border-radius: 3px; }
.intel-bench__bar-client--good { background: var(--positive); }
.intel-bench__bar-client--accent { background: var(--accent); }
.intel-bench__bar-client--warn { background: var(--warning); }
.intel-bench__legend { display: flex; gap: 12px; margin-top: 0.6rem; font-size: 0.57rem; color: var(--text-subtle); align-items: center; }
.intel-bench__swatch { width: 10px; height: 4px; border-radius: 2px; display: inline-block; margin-right: 3px; vertical-align: middle; }
.intel-bench__swatch--client { background: var(--positive); }
.intel-bench__swatch--peer { background: var(--line-strong); }

.intel-q { font-size: 0.56rem; font-weight: 700; padding: 1px 6px; border-radius: 8px; white-space: nowrap; }
.intel-q--top { background: var(--positive-soft); color: var(--positive); }
.intel-q--mid { background: var(--surface-strong); color: var(--text-subtle); }
.intel-q--warn { background: var(--warning-soft); color: var(--warning); }

.intel-method { background: var(--accent-soft); border: 1px solid #f0c0cc; border-radius: 6px; padding: 10px 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.intel-method__cell { display: flex; flex-direction: column; gap: 2px; }
.intel-method__label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); }
.intel-method__val { font-size: 0.72rem; color: var(--text); }
.intel-method__note { font-size: 0.63rem; color: var(--text-subtle); margin: 6px 0 0; font-style: italic; }

.intel-bench-table { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 10px; }
.intel-bench-table__head { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #fff; background: var(--accent); padding: 4px 10px; display: flex; justify-content: space-between; }
.intel-bench-table__desc { font-weight: 400; opacity: 0.85; font-size: 0.6rem; text-transform: none; letter-spacing: 0; }
.intel-bench-table__table { font-size: 0.7rem; }
.intel-bench-table__table th { background: var(--surface-soft); padding: 5px 8px; }
.intel-bench-table__table td { padding: 7px 8px; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/test/benchmarkingModule.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/pages/portal/modules/BenchmarkingModule.jsx src/test/benchmarkingModule.test.jsx src/styles/global.css
git commit -m "feat: add peer benchmarking intelligence module"
```

---

## Task 10: Business Performance Diagnostic module (Module 5)

**Files:**
- Create: `src/pages/portal/modules/DiagnosticModule.jsx`
- Test: `src/test/diagnosticModule.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/diagnosticModule.test.jsx`:

```jsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DiagnosticModule from '../pages/portal/modules/DiagnosticModule';

describe('DiagnosticModule', () => {
  it('renders the four KPI tiles and overall rating on the card', () => {
    render(<DiagnosticModule />);
    expect(screen.getByText('Debtor Days')).toBeInTheDocument();
    expect(screen.getByText('Cash Conv. Cycle')).toBeInTheDocument();
    expect(screen.getByText(/Overall: Healthy/i)).toBeInTheDocument();
  });

  it('opens the modal with the executive summary, metric trends, and interpretations', () => {
    render(<DiagnosticModule />);
    fireEvent.click(screen.getByRole('button', { name: /business performance diagnostic/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Executive Summary')).toBeInTheDocument();
    expect(within(dialog).getByText(/strong Q1 working-capital performance/i)).toBeInTheDocument();
    expect(within(dialog).getAllByText('Interpretation').length).toBe(4);
  });
});
```

> Note: the card uses the short label `Cash Conv. Cycle`; the modal metric detail uses the full `Cash Conversion Cycle`. The data `name` is `Cash Conversion Cycle`. The card maps long names to short labels via `CARD_LABEL` (below). Keep the card assertion on `Cash Conv. Cycle` and modal assertions on full names.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/diagnosticModule.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/pages/portal/modules/DiagnosticModule.jsx`:

```jsx
import { useState } from 'react';
import { diagnostic, signalsForModule } from '../../../data/intelligenceData';
import IntelModal from '../../../components/intel/IntelModal';
import SignalStrip from '../../../components/intel/SignalStrip';
import SignalIntelligenceSection from '../../../components/intel/SignalIntelligenceSection';

const moduleSignals = signalsForModule('diagnostic');

const CARD_LABEL = {
  'Debtor Days': 'Debtor Days',
  'Creditor Days': 'Creditor Days',
  'Cash Conversion Cycle': 'Cash Conv. Cycle',
  'Working Capital Efficiency': 'WC Efficiency',
};

const KPI_TREND = {
  good: 'intel-impact--up',
  warn: 'intel-impact--watch',
  neutral: 'intel-impact--context',
};

// Short trend caption per metric for the card KPI tile.
const KPI_CAPTION = {
  'debtor-days': '↓ from 31',
  'creditor-days': '↑ watch Q2',
  ccc: '↓ best yet',
  'wc-efficiency': '↑ from Fair',
};

const TREND_MAX = 46; // px scale ceiling for the modal bars

function maxTrendValue(metric) {
  return Math.max(...metric.trend.map(t => t.value));
}

export default function DiagnosticModule() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="intel-mod"
        aria-label="Business Performance Diagnostic — open full RM brief"
        onClick={() => setOpen(true)}
      >
        <div className="intel-mod__head intel-mod__head--accent">
          <div className="intel-mod__title intel-mod__title--accent">Business Performance Diagnostic</div>
          <span className="intel-ai-badge" aria-label="AI-generated">AI</span>
        </div>
        <div className="intel-mod__body">
          <div className="intel-diag__tag">{diagnostic.quarter} · {diagnostic.period} · Transaction-derived</div>
          <div className="intel-diag__kpis">
            {diagnostic.metrics.map(metric => (
              <div key={metric.id} className={`intel-diag__kpi${metric.highlight ? ' intel-diag__kpi--hl' : ''}`}>
                <div className={`intel-diag__kpi-label${metric.highlight ? ' intel-diag__kpi-label--hl' : ''}`}>{CARD_LABEL[metric.name] ?? metric.name}</div>
                <div className="intel-diag__kpi-val" style={metric.highlight ? { color: 'var(--accent)' } : undefined}>
                  {metric.currentValue}{metric.unit ? <span className="intel-diag__kpi-unit"> {metric.unit === 'days' ? 'd' : metric.unit}</span> : null}
                </div>
                <div className={`intel-diag__kpi-trend ${KPI_TREND[metric.status]}`}>{KPI_CAPTION[metric.id] ?? ''}</div>
              </div>
            ))}
          </div>
          <div className="intel-diag__overall">
            <span className="intel-diag__overall-label">Overall: Healthy · {diagnostic.overallNote}</span>
            <span className="intel-diag__overall-meta">{diagnostic.quarter}</span>
          </div>
          <SignalStrip signals={moduleSignals} />
        </div>
        <div className="intel-mod__foot">
          <span className="intel-mod__foot-meta">{diagnostic.quarter} · {moduleSignals.length} signals · Generated {diagnostic.generatedAt}</span>
          <span className="intel-mod__foot-hint">Full RM brief →</span>
        </div>
      </button>

      <IntelModal
        open={open}
        title="Business Performance Diagnostic"
        subtitle={`AI-generated RM Client Review Brief · ${diagnostic.quarter} · Nkosi Retail Group`}
        footerLeft="AI-generated diagnostic. Validate figures against audited statements before presenting to credit."
        footerRight={`${diagnostic.model} · ${diagnostic.quarter}`}
        onClose={() => setOpen(false)}
      >
        <div className="intel-diag__brief-head">
          <div>
            <div className="intel-diag__brief-client">Nkosi Retail Group</div>
            <div className="intel-diag__brief-meta">Retail · R148m portfolio · {diagnostic.quarter} ({diagnostic.period}) · Generated {diagnostic.generatedAt}</div>
          </div>
          <div className="intel-diag__brief-rating">
            <div className="intel-diag__brief-rating-val">Healthy</div>
            <div className="intel-diag__brief-rating-label">Overall rating</div>
          </div>
        </div>

        <div className="intel-section-title">Executive Summary</div>
        <div className="intel-diag__exec">{diagnostic.executiveSummary}</div>

        <div className="intel-section-title">Metric Detail</div>
        {diagnostic.metrics.map(metric => {
          const max = Math.max(maxTrendValue(metric), TREND_MAX);
          return (
            <div key={metric.id} className="intel-diag-detail">
              <div className={`intel-diag-detail__head intel-diag-detail__head--${metric.status}`}>
                <div>
                  <div className="intel-diag-detail__name">{metric.name}</div>
                  <div className="intel-diag-detail__formula">{metric.formula}</div>
                </div>
                <div className={`intel-diag-detail__badge intel-diag-detail__badge--${metric.status}`}>{metric.badge}</div>
              </div>
              <div className="intel-diag-detail__body">
                <div className="intel-diag-detail__chart">
                  <div className="intel-diag-detail__chart-label">Quarterly trend</div>
                  <div className="intel-diag-detail__bars">
                    {metric.trend.map(point => (
                      <div key={point.quarter} className="intel-diag-detail__bar-wrap">
                        <div
                          className={`intel-diag-detail__bar intel-diag-detail__bar--${point.status}`}
                          style={{ height: `${Math.round((point.value / max) * 46)}px` }}
                        />
                        <div className="intel-diag-detail__bar-q">{point.quarter}</div>
                      </div>
                    ))}
                  </div>
                  <div className="intel-diag-detail__series">{metric.trend.map(p => `${p.value}`).join(' → ')}</div>
                </div>
                <div className="intel-diag-detail__interp">
                  <div className="intel-diag-detail__interp-label">Interpretation</div>
                  <div className="intel-diag-detail__interp-text">{metric.interpretation}</div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="intel-section-title">What the AI is Seeing</div>
        <SignalIntelligenceSection
          signals={moduleSignals}
          synthesis={diagnostic.synthesis}
          connectionLabel="How this affects the diagnostic"
        />

        <div className="intel-section-title">RM Conversation Context</div>
        <div className="intel-context-box">{diagnostic.rmContext}</div>

        <div className="intel-section-title">Data Sources</div>
        {diagnostic.sources.map(source => (
          <div key={source.source} className="intel-citation">
            <span className="intel-citation__source">{source.source}</span>
            <span>{source.detail}</span>
          </div>
        ))}
      </IntelModal>
    </>
  );
}
```

- [ ] **Step 4: Append module-specific CSS to `src/styles/global.css`**

```css
/* Module 5 — Diagnostic */
.intel-diag__tag { font-size: 0.61rem; background: var(--accent-soft); border: 1px solid #f0c0cc; color: var(--accent-dark); padding: 2px 9px; border-radius: 10px; display: inline-block; margin-bottom: 0.75rem; }
.intel-diag__kpis { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 7px; margin-bottom: 0.7rem; }
.intel-diag__kpi { background: var(--surface-soft); border: 1px solid var(--line); border-radius: 5px; padding: 9px 10px; }
.intel-diag__kpi--hl { background: var(--accent-soft); border-color: #f0c0cc; }
.intel-diag__kpi-label { font-size: 0.55rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-subtle); margin-bottom: 2px; }
.intel-diag__kpi-label--hl { color: var(--accent); }
.intel-diag__kpi-val { font-size: 1.2rem; font-weight: 800; color: var(--text); line-height: 1; }
.intel-diag__kpi-unit { font-size: 0.62rem; color: var(--text-subtle); font-weight: 400; }
.intel-diag__kpi-trend { font-size: 0.6rem; font-weight: 700; margin-top: 2px; }
.intel-diag__overall { background: var(--positive-soft); border: 1px solid #a7f3d0; border-radius: 5px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center; }
.intel-diag__overall-label { font-size: 0.65rem; font-weight: 700; color: var(--positive); }
.intel-diag__overall-meta { font-size: 0.61rem; color: var(--text-subtle); }

/* Diagnostic modal */
.intel-diag__brief-head { background: var(--surface-soft); border: 1px solid var(--line); border-radius: 6px; padding: 9px 13px; display: flex; justify-content: space-between; align-items: center; }
.intel-diag__brief-client { font-size: 0.82rem; font-weight: 700; color: var(--text); }
.intel-diag__brief-meta { font-size: 0.63rem; color: var(--text-subtle); margin-top: 1px; }
.intel-diag__brief-rating { text-align: right; }
.intel-diag__brief-rating-val { font-size: 1.3rem; font-weight: 800; color: var(--positive); }
.intel-diag__brief-rating-label { font-size: 0.6rem; color: var(--text-subtle); }
.intel-diag__exec { background: var(--accent-soft); border: 1px solid #f0c0cc; border-radius: 6px; padding: 11px 13px; font-size: 0.72rem; color: var(--text-muted); line-height: 1.6; }

.intel-diag-detail { border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 8px; }
.intel-diag-detail__head { padding: 7px 11px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; }
.intel-diag-detail__head--good { background: var(--positive-soft); }
.intel-diag-detail__head--warn { background: var(--warning-soft); }
.intel-diag-detail__head--neutral { background: var(--surface-soft); }
.intel-diag-detail__name { font-size: 0.75rem; font-weight: 700; color: var(--text); }
.intel-diag-detail__formula { font-size: 0.6rem; background: var(--surface-strong); border: 1px solid var(--line); border-radius: 3px; padding: 1px 5px; color: var(--text-subtle); font-family: monospace; display: inline-block; margin-top: 2px; }
.intel-diag-detail__badge { font-size: 0.75rem; font-weight: 800; padding: 3px 9px; border-radius: 4px; }
.intel-diag-detail__badge--good { background: var(--positive-soft); color: var(--positive); }
.intel-diag-detail__badge--warn { background: var(--warning-soft); color: var(--warning); }
.intel-diag-detail__badge--neutral { background: var(--surface-strong); color: var(--text-muted); }
.intel-diag-detail__body { padding: 9px 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.intel-diag-detail__chart-label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-subtle); margin-bottom: 4px; }
.intel-diag-detail__bars { display: flex; align-items: flex-end; gap: 4px; height: 46px; }
.intel-diag-detail__bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
.intel-diag-detail__bar { width: 100%; border-radius: 2px 2px 0 0; background: var(--line-strong); }
.intel-diag-detail__bar--good { background: var(--positive); }
.intel-diag-detail__bar--warn { background: var(--warning); }
.intel-diag-detail__bar--prev { background: var(--line-strong); }
.intel-diag-detail__bar-q { font-size: 0.52rem; color: var(--text-subtle); }
.intel-diag-detail__series { font-size: 0.58rem; color: var(--text-subtle); margin-top: 3px; }
.intel-diag-detail__interp-label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-subtle); margin-bottom: 3px; }
.intel-diag-detail__interp-text { font-size: 0.68rem; color: var(--text-muted); line-height: 1.5; }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/test/diagnosticModule.test.jsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/pages/portal/modules/DiagnosticModule.jsx src/test/diagnosticModule.test.jsx src/styles/global.css
git commit -m "feat: add business performance diagnostic intelligence module"
```

---

## Task 11: Assemble the Intelligence Dashboard

**Files:**
- Create: `src/pages/portal/IntelligenceDashboard.jsx`
- Test: `src/test/intelligenceDashboard.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/test/intelligenceDashboard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import IntelligenceDashboard from '../pages/portal/IntelligenceDashboard';

describe('IntelligenceDashboard', () => {
  it('renders all five module cards in the two-row layout', () => {
    render(<IntelligenceDashboard />);
    expect(screen.getByRole('button', { name: /relationship health score/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lifecycle milestones/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /external news & event monitor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /peer benchmarking/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /business performance diagnostic/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/intelligenceDashboard.test.jsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/pages/portal/IntelligenceDashboard.jsx`:

```jsx
import HealthScoreModule from './modules/HealthScoreModule';
import MilestonesModule from './modules/MilestonesModule';
import NewsMonitorModule from './modules/NewsMonitorModule';
import BenchmarkingModule from './modules/BenchmarkingModule';
import DiagnosticModule from './modules/DiagnosticModule';

export default function IntelligenceDashboard() {
  return (
    <div className="intel-dashboard">
      <div className="intel-row-1">
        <HealthScoreModule />
        <MilestonesModule />
        <NewsMonitorModule />
      </div>
      <div className="intel-row-2">
        <BenchmarkingModule />
        <DiagnosticModule />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/intelligenceDashboard.test.jsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/pages/portal/IntelligenceDashboard.jsx src/test/intelligenceDashboard.test.jsx
git commit -m "feat: assemble intelligence dashboard two-row layout"
```

---

## Task 12: Add the tab bar to the Client Portal page

**Files:**
- Modify: `src/pages/portal/ClientPortalPage.jsx`
- Test: `src/test/clientPortalTabs.test.jsx`

This task wraps the existing portal content in a tab structure. The existing notes/insights/engagements JSX (currently everything inside the `portal-sections` div and the filter panel) becomes the "Notes & Records" tab. The new dashboard is the default "Intelligence Dashboard" tab.

- [ ] **Step 1: Write the failing test**

Create `src/test/clientPortalTabs.test.jsx`:

```jsx
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from './testUtils';

describe('Client Portal tabs', () => {
  it('shows the Intelligence Dashboard by default', () => {
    renderApp('/portal');
    expect(screen.getByRole('button', { name: /relationship health score/i })).toBeInTheDocument();
    // Notes content should not be visible initially
    expect(screen.queryByText('General notes')).not.toBeInTheDocument();
  });

  it('switches to Notes & Records when the tab is clicked', () => {
    renderApp('/portal');
    fireEvent.click(screen.getByRole('tab', { name: /notes & records/i }));
    expect(screen.getByText('General notes')).toBeInTheDocument();
    // Dashboard module should no longer be mounted
    expect(screen.queryByRole('button', { name: /relationship health score/i })).not.toBeInTheDocument();
  });

  it('switches back to the Intelligence Dashboard', () => {
    renderApp('/portal');
    fireEvent.click(screen.getByRole('tab', { name: /notes & records/i }));
    fireEvent.click(screen.getByRole('tab', { name: /intelligence dashboard/i }));
    expect(screen.getByRole('button', { name: /relationship health score/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/clientPortalTabs.test.jsx`
Expected: FAIL — no `tab` role elements found.

- [ ] **Step 3: Modify `ClientPortalPage.jsx`**

Add the import near the other page imports (after line 17, alongside the existing imports):

```jsx
import IntelligenceDashboard from './IntelligenceDashboard';
```

Add tab state inside the component, alongside the other `useState` hooks (after the existing `const [composerState, setComposerState] = useState(null);` line):

```jsx
  const [activeTab, setActiveTab] = useState('intelligence');
```

Replace the existing returned JSX header region. Find this block (the portal header `<section>`):

```jsx
      <section className="portal-header">
        <h2>Client Portal</h2>
        <p>
          Navigate client profiles, review the full internal history of insights and engagements, and manage internal notes
          without exposing them to the client.
        </p>
      </section>
```

Replace it with the header plus a tab bar:

```jsx
      <section className="portal-header">
        <h2>Client Portal</h2>
        <p>
          AI-powered intelligence dashboard and internal relationship history for your clients.
        </p>
      </section>

      <div className="intel-tab-bar" role="tablist" aria-label="Client portal views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'intelligence'}
          className={`intel-tab${activeTab === 'intelligence' ? ' intel-tab--active' : ''}`}
          onClick={() => setActiveTab('intelligence')}
        >
          Intelligence Dashboard
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'records'}
          className={`intel-tab${activeTab === 'records' ? ' intel-tab--active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          Notes &amp; Records
        </button>
      </div>

      {activeTab === 'intelligence' ? <IntelligenceDashboard /> : null}
```

Now wrap the existing "Notes & Records" content so it only renders on the records tab. The records content is: the `<section className="ri-panel portal-filter-panel">` block AND the `<div className="portal-sections">` block AND the `<InternalNoteComposer ... />`. Wrap all three in a fragment guarded by the tab:

Find the opening of the filter panel:

```jsx
      <section className="ri-panel portal-filter-panel">
```

Insert immediately before it:

```jsx
      {activeTab === 'records' ? (
      <>
```

Then find the closing `</div>` of `portal-sections` followed by the `<InternalNoteComposer`. After the `InternalNoteComposer` self-closing tag and before the final `</div>` that closes `ri-page portal-page`, insert the fragment close:

```jsx
      </>
      ) : null}
```

The resulting structure is:

```jsx
    <div className="ri-page portal-page">
      <Link className="portal-breadcrumb" to="/dashboard"> ... </Link>
      <section className="portal-header"> ... </section>
      <div className="intel-tab-bar" role="tablist" ...> ... </div>
      {activeTab === 'intelligence' ? <IntelligenceDashboard /> : null}
      {activeTab === 'records' ? (
      <>
        <section className="ri-panel portal-filter-panel"> ... </section>
        <div className="portal-sections"> ... </div>
        <InternalNoteComposer ... />
      </>
      ) : null}
    </div>
```

- [ ] **Step 4: Append tab CSS to `src/styles/global.css`**

```css
/* Intelligence Dashboard — portal tab bar */
.intel-tab-bar { display: flex; gap: 0; border-bottom: 1px solid var(--line); margin-bottom: 1.25rem; }
.intel-tab { padding: 0.6rem 1.1rem; font-size: 0.82rem; font-weight: 600; color: var(--text-subtle); border-bottom: 2px solid transparent; background: none; }
.intel-tab--active { color: var(--accent); border-bottom-color: var(--accent); }
.intel-tab:hover { color: var(--text); }
```

- [ ] **Step 5: Run the tab tests**

Run: `npx vitest run src/test/clientPortalTabs.test.jsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Run the full portal/journey suite to confirm no regressions**

Run: `npx vitest run src/test/journeys.test.jsx src/test/interactions.test.jsx src/test/routes.test.jsx src/test/shell.test.jsx`
Expected: PASS. If any existing test asserted the old portal header copy ("Navigate client profiles…") or expected notes content visible on `/portal` load, update that test to click the "Notes & Records" tab first. Document any such change in the commit message.

- [ ] **Step 7: Commit**

```bash
git add src/pages/portal/ClientPortalPage.jsx src/test/clientPortalTabs.test.jsx src/styles/global.css
git commit -m "feat: add intelligence dashboard tab to client portal"
```

---

## Task 13: Full-suite integration check

**Files:**
- No new files. Verification only.

- [ ] **Step 1: Run the entire test suite**

Run: `npx vitest run`
Expected: all tests pass, including the 8 new intelligence test files and all pre-existing tests.

- [ ] **Step 2: Production build**

Run: `npx vite build`
Expected: build completes with no errors.

- [ ] **Step 3: Manual smoke (optional but recommended)**

Run: `npx vite` and open `/portal`. Confirm:
- Intelligence Dashboard is the default tab
- All 5 cards render with no empty space in the grid
- Each card opens its modal on click; Escape and the ✕ close it
- "Notes & Records" tab still shows the existing notes/insights/engagements UI
- No blue/purple — all accents are Absa red, warning amber, positive green

- [ ] **Step 4: Commit any fixes**

If steps 1–3 surfaced issues, fix them and commit:

```bash
git add -A
git commit -m "fix: resolve intelligence dashboard integration issues"
```

---

## Self-Review Notes (resolved during planning)

1. **Spec coverage:** All five modules (§Module 1–5), shared modal/signal patterns (§Shared Component Patterns), the signal intelligence layer (§Signal Intelligence Section), Layout C (§Layout), color tokens (§Color System), data shapes (§each module), and accessibility (§Accessibility) each map to a task. Tab integration (§Architecture → Portal Page Structure) is Task 12.
2. **Type consistency:** Signal objects use a single shape everywhere: `{ id, sourceType, sourceName, time, headline, excerpt, impactDirection, impactLabel, connectionText, affectedModules }`. `signalsForModule()` produces this shape; `healthScore.intelligenceSignals` is authored in this shape directly. `SignalStrip` and `SignalIntelligenceSection` consume it identically. `sourceType` values (`sens|press|kb|supplier|competitor|regulatory`) match the CSS `intel-src--*` classes and the `intelFormat` maps exactly.
3. **Test-label alignment:** Where card and modal use different label text for the same datum (e.g. `Cash Conv. Cycle` vs `Cash Conversion Cycle`), the plan notes which assertion belongs to which surface. The Milestones test uses regex matchers to tolerate the trailing colon in `RM Conversation Context:`.
4. **No new color tokens:** every CSS value resolves to an existing `:root` variable, with the documented exceptions (`#111827` dark surface = `--text`; `#f0c0cc`/`#f0c470`/`#f0d080` border tints; `#166534`/`#a7f3d0`/`#9ca3af`/`#e5e7eb`/`#1f2937` used only inside the green context box and dark synthesis/signal blocks, matching the approved mockups).
5. **Parallelism:** Tasks 6–10 touch disjoint files except for the shared `src/styles/global.css` append. If run by parallel subagents, serialize the CSS appends or have each subagent append its own clearly-commented block to avoid merge conflicts; the integration check (Task 13) catches any duplication.
