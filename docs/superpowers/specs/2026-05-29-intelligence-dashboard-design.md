# Intelligence Dashboard — Client Portal Enhancement

**Date:** 2026-05-29
**Status:** Approved for implementation

---

## Problem

The existing `/portal` page is a useful internal notes and records tool, but it gives the RM no forward-looking intelligence about a client. The RM arrives without context about relationship risk, upcoming milestones, how the client compares to peers, how their financials are trending, or what is happening in their market right now. All of that intelligence currently lives in the RM's head, if it exists at all.

## Goals

- Add an AI-powered **Intelligence Dashboard** tab to the existing Client Portal page
- Surface 5 intelligence modules that synthesise internal data, external news, and the internal knowledge base into actionable RM context
- Every AI-generated insight must be explainable and citable — the RM must always know *why* the AI surfaced something and *where the data came from*
- All data for the prototype is hardcoded demo data scoped to Nkosi Retail Group (primary journey client)
- Existing Notes & Records tab remains unchanged

## Non-Goals

- Live data feeds or real API integrations (prototype only)
- Action buttons that trigger the engagement flow (read-only for this version)
- Changing any existing journey pages, routes, or state shape
- Multi-client intelligence views (demo shows Nkosi Retail Group only)

---

## Architecture

### Portal Page Structure

The existing `ClientPortalPage.jsx` at `/portal` gains a **tab bar** as a structural wrapper:

```
/portal
├── Tab 1: Intelligence Dashboard  ← new
└── Tab 2: Notes & Records         ← existing content, unchanged
```

Tab state is local `useState` — no routing change, no URL param. The `Intelligence Dashboard` tab is the default landing view.

### New Files

| File | Purpose |
|---|---|
| `src/pages/portal/IntelligenceDashboard.jsx` | Root component for the dashboard tab — renders the two-row grid |
| `src/pages/portal/modules/HealthScoreModule.jsx` | Module 1 card + modal |
| `src/pages/portal/modules/MilestonesModule.jsx` | Module 2 card + modal |
| `src/pages/portal/modules/NewsMonitorModule.jsx` | Module 3 card + modal |
| `src/pages/portal/modules/BenchmarkingModule.jsx` | Module 4 card + modal |
| `src/pages/portal/modules/DiagnosticModule.jsx` | Module 5 card + modal |
| `src/data/intelligenceData.js` | All hardcoded demo intelligence data for Nkosi Retail Group |

### Layout — Editorial Rows (Layout C)

```
┌─────────────────┬─────────────────┬──────────────────────────────┐
│  Health Score   │   Milestones    │   External News & Events     │
│     (1/4)       │     (1/4)       │           (1/2)              │
├─────────────────┴─────────────────┴──────────────────────────────┤
│         Peer Benchmarking (1/2)   │  Performance Diagnostic (1/2)│
└───────────────────────────────────┴──────────────────────────────┘
```

CSS implementation: two `display: grid` rows, no fixed pixel widths. Row 1: `grid-template-columns: 1fr 1fr 2fr`. Row 2: `grid-template-columns: 1fr 1fr`. Cards use `align-items: start` — they never stretch to fill empty vertical space.

---

## Color System

All colors use the existing `global.css` token set. No new colors are introduced.

| Use | Token |
|---|---|
| Module accent border + titles | `--accent: #c00030` |
| Milestones accent border + titles | `--warning: #a86918` |
| Positive signals / good ratings | `--positive: #2f7d4b` |
| Warning signals / watch items | `--warning: #a86918` |
| Critical signals / act-now | `--critical: #b4232f` |
| AI badge background | `--accent-soft: #fae6eb` |
| Signal strip background | `--surface-muted: #f5f6f8` |
| Card backgrounds | `--surface: #ffffff` |
| Card footer | `--surface-soft: #f9fafb` |

Source badge color mapping (signal strip chips):
- SENS → `accent-soft` / `accent`
- Trade Press → `surface-strong` / `text-muted`
- Internal KB → `surface-strong` / `text`
- Supplier → `warning-soft` / `warning`
- Competitor → `critical-soft` / `critical`
- Regulatory → `positive-soft` / `positive`

Typography: `'Manrope'` body, `'Poppins'` headings — matches existing shell.

---

## Shared Component Patterns

### Module Card Shell

Every module card follows this structure:

```jsx
<article className="module-card">
  <div className="module-card-header mh-accent">   // or mh-warning for milestones
    <div className="module-title mt-r">Title</div>
    <div className="ai-badge">AI</div>
  </div>
  <div className="module-card-body">
    {/* card content */}
    <div className="signal-strip">
      <div className="ss-label">AI Signals Active</div>
      {signals.map(s => <SignalChip key={s.id} signal={s} />)}
    </div>
  </div>
  <div className="module-card-footer">
    <span className="mf-meta">meta text</span>
    <span className="mf-hint">Action label →</span>
  </div>
</article>
```

Clicking anywhere on the card opens its modal via local `useState` — no routing.

### Signal Strip

Each card has a `signal-strip` section at the bottom of the card body (inside `module-card-body`, separated by a top border). Each chip shows:
- Source badge (colour-coded by source type)
- Signal headline text
- Impact line (coloured by positive/warning/neutral)

### Modal Pattern

Each module has a detail modal triggered by clicking the card:

```jsx
{modalOpen && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal-panel" onClick={e => e.stopPropagation()}>
      <div className="modal-header"> ... </div>
      <div className="modal-body">
        {/* full detail content */}
        <SignalIntelligenceSection signals={signals} synthesis={synthesis} />
      </div>
      <div className="modal-footer"> ... </div>
    </div>
  </div>
)}
```

Modal header uses the Absa red gradient: `linear-gradient(135deg, #c00030, #98002e)`.

### Signal Intelligence Section (modal-only)

All five modals include a **"What the AI is seeing"** section with a dark (`#111827`) header bar and animated red pulse dot. Each signal card shows:
1. Source type header (colour-coded)
2. Headline + excerpt
3. Impact pill (↑ Supports / ⚠ Watch / Context)
4. **"How this affects [module]"** connection explanation — this is the explainability layer
5. Module tag chips showing which other modules this signal feeds into

At the bottom of the signal list: an **AI Synthesis** block (dark `#111827` background) that connects all signals into a single forward-looking paragraph.

---

## Module 1 — Relationship Health & Attrition Risk Score

### Purpose
Composite score (0–100) synthesising disengagement signals to predict defection before it occurs.

### Card Content
- Large score number (74) in `--accent` red
- Risk band pill: Low / Moderate / High / Critical
- Gradient bar with position marker
- 4 signal rows (transaction vol, contact frequency, competitor activity, digital engagement) — each row background-tinted by status (neutral / `warning-soft` / `critical-soft`)
- Signal strip: 2 chips (Competitor loyalty launch + KB contact-cadence finding)

### Modal Content
1. **Score Breakdown** — 3 weighted sub-scores: Engagement Activity (30%), Transaction Health (35%), Market Loyalty (35%)
2. **Signal Detail table** — metric name, current reading, 90-day trend, risk contribution for 5 signals
3. **AI Reasoning** — plain-English paragraph explaining what the score means and the primary action
4. **Data Sources** — CRM, Transaction Ledger, Product Registry, Settlement Monitor
5. **Signal Intelligence Section** — competitor signal + KB signal with AI synthesis

### Demo Data Shape (`intelligenceData.js`)
```js
export const healthScore = {
  score: 74,
  band: 'low',           // 'critical' | 'moderate' | 'stable' | 'low' | 'engaged'
  updatedAt: '...',
  subScores: { engagement: 21, transaction: 28, loyalty: 25 },
  signals: [
    { id, label, reading, trend, riskContribution },
    ...
  ],
  reasoning: '...',
  sources: [...],
  intelligenceSignals: [
    { id, sourceType, sourceName, time, headline, excerpt, impactDirection, impactLabel, connectionText, affectedModules },
    ...
  ],
  synthesis: '...',
}
```

---

## Module 2 — Client Milestone & Lifecycle Intelligence

### Purpose
Monitors CIPC director changes, payroll growth patterns, year-end dates, business anniversaries, and BBBEE level changes to surface personalised RM outreach prompts at the right moment.

### Card Content
- 4 milestone items in a list
- Each item: amber dot (urgent) or grey dot (watch), milestone name, brief meta, days badge
- Urgent items: `warning-soft` background
- Signal strip: 2 chips (regulatory + KB)

### Modal Content
One detailed block per milestone, each containing:
1. **What it is** — factual description of the event
2. **Why it matters** — business context
3. **RM Conversation Context box** (green `positive-soft` background) — what to say, how to position the conversation
4. Source tag per milestone
5. **AI Reasoning** — how urgency was ranked
6. **Signal Intelligence Section**

### Milestone Data Shape
```js
export const milestones = [
  {
    id, name, meta,
    urgency: 'urgent' | 'upcoming' | 'watch',
    daysLabel,           // '42 days', '8 days ago', '~74 days'
    whatItIs, whyItMatters, rmContext,
    source,
    intelligenceSignals: [...],
    synthesis: '...',
  },
  ...
]
```

---

## Module 3 — External News & Event Monitor

### Purpose
Real-time monitoring of JSE SENS, trade publications, supplier announcements, and competitor news — enabling the RM to initiate a call before the client has seen the press release.

### Card Content
- Live pulse indicator (animated dot) + last scan timestamp
- 3-tile count bar: Act Now / Monitor / Context
- 2-column news grid: 4 items + 1 full-width item
- Each item: source badge, timestamp, urgency pill, headline, "Why it matters" line

### Modal Content
1. **AI Daily Brief** — dark `#111827` background, synthesised paragraph briefing all signals
2. **Source filter bar** — All / SENS / Trade Press / Supplier / Competitor / Regulatory
3. **Items grouped by source category**, each with:
   - Source header (colour-coded)
   - Urgency pill + module tag
   - Headline + full excerpt
   - **AI Relevance Assessment box** — why this item was surfaced for this client, what it means, which modules it feeds
4. Footer: AI disclaimer + scan interval

### News Item Data Shape
```js
export const newsItems = [
  {
    id, sourceType, sourceName, time,
    urgency: 'act' | 'monitor' | 'context',
    headline, excerpt,
    relevanceAssessment,     // plain text — why surfaced for this client
    affectedModules: [],     // e.g. ['health', 'benchmarking']
  },
  ...
]
```

---

## Module 4 — Peer Benchmarking

### Purpose
Anonymised comparison of the client's performance against sector-matched peers across Financial Health, Liquidity & Cash Flow, Banking Behaviour, and Growth Indicators.

### Card Content
- Peer group tag (sector, revenue band, geography, n=34)
- 3 category groups: Financial Health, Liquidity & Cash Flow, Banking Behaviour
- Each metric: name, client value, peer median, dual-bar (green client / grey peer), quartile badge
- Bar legend: client (green) / peer median (grey)
- Signal strip: 2 chips

### Modal Content
1. **Peer Group Methodology panel** (6-cell grid): sector, revenue band, geography, n, refresh cycle, anonymisation method
2. Anonymisation disclaimer
3. **4 categorised benchmark tables**: Financial Health, Liquidity & Cash Flow, Banking Behaviour, Growth Indicators
   - Each table: metric name + formula description, client value, P25/Median/P75, mini bar, quartile badge
4. **RM Conversation Context** (green box) — what to lead with, what nuance to watch
5. **AI Reasoning** — how the benchmarks are computed, k-anonymity guarantee
6. **Signal Intelligence Section**

### Categories and Metrics

| Category | Metrics |
|---|---|
| Financial Health | Revenue Growth (YoY), Gross Margin, Working Capital Ratio |
| Liquidity & Cash Flow | Cash Conversion Cycle, Debtor Days, Creditor Days |
| Banking Behaviour | Facility Utilisation, Avg Daily Balance, Payment Regularity, Digital Adoption |
| Growth Indicators | Payroll Growth (YoY), Transaction Volume Growth (YoY) |

### Benchmark Data Shape
```js
export const benchmarking = {
  peerGroup: { sector, revenueBand, geography, n, refreshDate, kAnonymity },
  categories: [
    {
      id, label, description,
      metrics: [
        { id, name, formula, clientValue, p25, median, p75, quartile, barClientPct, barPeerPct },
        ...
      ],
    },
    ...
  ],
  rmContext, reasoning,
  intelligenceSignals: [...],
  synthesis: '...',
}
```

---

## Module 5 — Business Performance Diagnostic

### Purpose
Structured quarterly financial health diagnostic generated from transaction data covering debtor days, creditor days, cash conversion cycle, and working capital efficiency, delivered as a formatted RM client review brief.

### Card Content
- Quarter tag (Q1 2026 · Transaction-derived)
- 4-column KPI grid: Debtor Days, Creditor Days, Cash Conversion Cycle (highlighted with `accent-soft`), WC Efficiency
- Each KPI: label, value, trend arrow
- Overall health strip (green `positive-soft`)
- Signal strip: 3 chips (supplier + KB + SENS)

### Modal — Full RM Client Review Brief

The modal is designed to feel like a document the RM can take into a meeting:

1. **Brief header** — client name, quarter, overall rating
2. **Executive Summary** — AI-generated narrative paragraph in `accent-soft` box
3. **4 Metric Detail blocks**, each containing:
   - Metric name + formula tag
   - Current value badge (colour-coded good/warn)
   - **Quarterly trend bar chart** (4 quarters, rendered with CSS bar-wrap divs)
   - **Interpretation paragraph** — what the number means in plain English
4. **Signal Intelligence Section** — supplier risk, KB validation, SENS context
5. **RM Conversation Context** (green box)
6. **Data Sources** — transaction ledger, payroll, facility records, peer dataset

### Quarterly Trend Bars
Rendered as flex-column div wrappers — no SVG, no canvas. Each bar: `div` with a percentage `height` in `px` from a fixed 40px max, coloured by status (good / warn / prev).

### Diagnostic Data Shape
```js
export const diagnostic = {
  quarter: 'Q1 2026',
  period: 'Jan–Mar',
  generatedAt: '...',
  overallRating: 'healthy',     // 'healthy' | 'fair' | 'watch' | 'critical'
  executiveSummary: '...',
  metrics: [
    {
      id, name, formula,
      currentValue, unit, badge,
      status: 'good' | 'warn' | 'neutral',
      trend: [
        { quarter, value, status },   // last 4 quarters
        ...
      ],
      interpretation: '...',
    },
    ...
  ],
  rmContext, reasoning,
  sources: [...],
  intelligenceSignals: [...],
  synthesis: '...',
}
```

---

## Intelligence Data File (`intelligenceData.js`)

A single flat file — no sub-directory. All 5 data objects are defined and exported directly from `intelligenceData.js`. The signal items that appear across multiple modules use the same `id` as the canonical `newsItems` entry; other modules reference them by filtering `newsItems` on `affectedModules` at render time rather than duplicating data.

```js
// src/data/intelligenceData.js
export const healthScore  = { ... }
export const milestones   = [ ... ]
export const newsItems    = [ ... ]   // canonical signal source
export const benchmarking = { ... }
export const diagnostic   = { ... }
```

Module components import only what they need: `import { healthScore, newsItems } from '../../data/intelligenceData'`.

---

## CSS Strategy

New CSS goes into `src/styles/global.css` under a clearly marked `/* ── Intelligence Dashboard ── */` section. Class naming follows the existing BEM-adjacent pattern used for `.portal-*` and `.dashboard-*`:

```
.intel-dashboard          // root wrapper
.intel-row-1              // CSS grid row 1
.intel-row-2              // CSS grid row 2
.intel-mod                // shared module card
.intel-mod__head          // card header
.intel-mod__body          // card body
.intel-mod__foot          // card footer
.intel-signal-strip       // signal chip strip
.intel-signal-chip        // individual chip
.intel-modal-overlay      // modal backdrop
.intel-modal              // modal panel
.intel-modal__head        // modal header
.intel-modal__body        // modal body
.intel-modal__foot        // modal footer
.intel-signal-section     // "What the AI is seeing" block
.intel-ai-synthesis       // dark synthesis box
```

No new design tokens — all values reference existing `--` variables.

---

## Accessibility

- Module cards: `<article>` with `aria-label`
- Card click opens modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title
- Modal closes on Escape key and backdrop click
- AI badge: `aria-label="AI-generated"` on the badge span
- Score bar: `aria-label="Relationship health score: 74 out of 100, low attrition risk"`
- Focus returns to the triggering card on modal close

---

## Touch-Point Summary

| File | Change |
|---|---|
| `src/pages/portal/ClientPortalPage.jsx` | Add tab bar; render `IntelligenceDashboard` or existing content based on active tab |
| `src/pages/portal/IntelligenceDashboard.jsx` | New — two-row grid, renders 5 module components |
| `src/pages/portal/modules/*.jsx` | New — one file per module (card + modal) |
| `src/data/intelligenceData.js` | New — all hardcoded demo intelligence data |
| `src/styles/global.css` | New `.intel-*` CSS classes appended |
