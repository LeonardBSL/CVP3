# Advisory-Journey Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fold the deck's Deal Origination and Meeting Prep modules into CVP 3's existing Advisory (Engagement) journey — adding a Brief step, origination lens tabs, an expandable agent pipeline, and a real Absa-branded PDF export.

**Architecture:** Pure data builders live in `src/pages/pageContext.js` and are reused by both the Lookup agent path and the new journey UI (so the deck's "context carries forward" holds via the existing `getViewContext`). Presentation reuses the existing `LookupAgentOutput` section renderer and `EngagementJourneyStepper`. The PDF is generated client-side with `@react-pdf/renderer`, branded from the app's own tokens and `@fontsource` fonts — no backend, keeping the static Cloudflare Pages build intact.

**Tech Stack:** React 19, React Router 7, Vite 8, Vitest 4 + React Testing Library, lucide-react, `@react-pdf/renderer` (new), `@fontsource/poppins` + `@fontsource/manrope` (already installed).

---

## Reference: existing shapes (do not re-derive)

- `getViewContext(state)` returns `{ activeAlert, scenario, client, insight, bundle, selection, selectedProducts, briefing, lookupResponse, ... }`.
- An **insight pack** (`insight`) has: `headline, confidence, whyNow, whatHappened, whyItMatters, whatToDoNext, recommendedAction, transactionalMetrics[], transactionalNarrative, richResponse, bundleEvidence, clientFacingDraft, trendData[], sourceIds[]`.
- A **presentation** (consumed by `LookupAgentOutput`) is `{ title, summary, sections[], sourceIds[] }`, where each section is `{ id, title, type, items|body }` and `type ∈ {bullets, key-value, cards, paragraph}`.
- `LookupAgentOutput` props: `{ presentation, sections=null, showSources=true }` (imported default from `src/components/LookupAgentOutput.jsx`).
- Journey helpers in `src/pages/pageContext.js`: `engagementSteps`, `describeTrend`, `formatMetric`, `splitDraftIntoBullets`, `buildPreMeetingWatchpoints`, `buildOpportunityCards`, `buildRiskAreas`, `buildRecommendedActions`, `buildLookupAgentPresentation`.
- UI exports from `src/components/UI.jsx`: `EngagementJourneyStepper`, `useJourneyStep`, `SourceChips`, `StatusPill`.
- Brand tokens: `--accent #c00030`, `--accent-dark #98002e`, `--accent-soft #fae6eb`, `--text #111827`, `--text-muted #4b5563`, `--text-subtle #6b7280`, `--line #dde1e7`, `--surface #ffffff`. Logo: `src/assets/absa-logo.png`.

## File map

- **Modify** `src/pages/pageContext.js` — extract `buildMeetingBrief`, `buildRevenueOpportunityScan`, `buildClientRiskAssessment`; add `buildStrategicLens`, `buildRegulatoryLens`, `buildOriginationLenses`, `buildOriginationPipeline`, `buildMeetingBriefPipeline`; add `brief` to `engagementSteps`.
- **Modify** `src/App.jsx` — add `/engagement/brief` route.
- **Create** `src/pages/engagement/MeetingBriefPage.jsx`
- **Create** `src/components/engagement/LensTabs.jsx`
- **Modify** `src/pages/engagement/InsightReviewPage.jsx` — add `LensTabs`, `AgentPipeline`, change CTA to Brief, add export.
- **Create** `src/components/engagement/AgentPipeline.jsx`
- **Create** `src/components/report/pdfTheme.js`
- **Create** `src/components/report/PdfLayout.jsx`
- **Create** `src/components/report/MeetingBriefPdf.jsx`
- **Create** `src/components/report/OriginationReportPdf.jsx`
- **Create** `src/components/report/ExportReportButton.jsx`
- **Create** tests under `src/test/` (one file per unit).

---

## Task 1: Install @react-pdf/renderer

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the dependency**

Run: `npm install @react-pdf/renderer@^4.0.0`
Expected: `package.json` `dependencies` gains `"@react-pdf/renderer"`, install completes without peer-dep errors against React 19.

- [ ] **Step 2: Verify the existing suite still passes**

Run: `npm test`
Expected: PASS (baseline green before changes).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add @react-pdf/renderer for branded report export"
```

---

## Task 2: Refactor shared builders out of buildLookupAgentPresentation

Extract the three agent bodies into exported pure functions so the journey UI can call them without a `lookupResponse`. The Lookup path keeps its current output by delegating and passing lookup-derived overrides.

**Files:**
- Modify: `src/pages/pageContext.js`
- Test: `src/test/pageContextBuilders.test.js` (create)

- [ ] **Step 1: Write the failing test**

Create `src/test/pageContextBuilders.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { createBaseState } from '../state/demoState';
import { buildMeetingBrief, getViewContext } from '../pages/pageContext';

describe('buildMeetingBrief', () => {
  it('builds a five-section brief from the insight pack without a lookupResponse', () => {
    const ctx = getViewContext(createBaseState());
    const brief = buildMeetingBrief(ctx);

    expect(brief.title).toBe('Pre-meeting brief');
    expect(brief.summary).toBe(ctx.insight.whyItMatters);
    expect(brief.sections.map(section => section.id)).toEqual([
      'executive-summary',
      'key-developments',
      'risks-watchpoints',
      'opportunities',
      'recommended-talking-points',
    ]);
    expect(brief.sourceIds).toEqual(ctx.insight.sourceIds);
  });

  it('honors overrides supplied by the lookup path', () => {
    const ctx = getViewContext(createBaseState());
    const brief = buildMeetingBrief(ctx, { summary: 'OVERRIDE', sourceIds: ['x'] });

    expect(brief.summary).toBe('OVERRIDE');
    expect(brief.sourceIds).toEqual(['x']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/pageContextBuilders.test.js`
Expected: FAIL — `buildMeetingBrief is not a function` / not exported.

- [ ] **Step 3: Add the exported `buildMeetingBrief`**

In `src/pages/pageContext.js`, add this exported function (place it directly above `buildLookupAgentPresentation`). It reuses the existing helpers `describeTrend`, `formatMetric`, `splitDraftIntoBullets`, `buildPreMeetingWatchpoints`, `buildOpportunityCards`:

```js
export function buildMeetingBrief(context, overrides = {}) {
  const { scenario, insight, briefing, selectedProducts = [], selection = { customTerms: {} } } = context;
  const trend = describeTrend(insight.trendData ?? []);
  const summary = overrides.summary ?? insight.whyItMatters;
  const recommendedAction = overrides.recommendedAction ?? insight.recommendedAction;
  const sourceIds = overrides.sourceIds ?? insight.sourceIds;

  return {
    title: 'Pre-meeting brief',
    summary,
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive summary',
        type: 'bullets',
        items: [
          summary,
          scenario.alert.summary,
          `Why now: ${scenario.alert.whyNow}`,
          trend.from != null && trend.to != null ? `Signal trend: ${trend.direction} from ${trend.from} to ${trend.to}.` : null,
          `Meeting objective: ${recommendedAction}`,
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
        items: buildOpportunityCards(selectedProducts, selection, insight).slice(0, 3),
      },
      {
        id: 'recommended-talking-points',
        title: 'Recommended talking points',
        type: 'bullets',
        items: splitDraftIntoBullets(insight.clientFacingDraft).slice(0, 3),
      },
    ],
    sourceIds,
  };
}
```

- [ ] **Step 4: Delegate the lookup `pre-meeting-brief` branch to the shared builder**

In `buildLookupAgentPresentation`, replace the entire `if (agentId === 'pre-meeting-brief') { ... }` block with:

```js
  if (agentId === 'pre-meeting-brief') {
    return buildMeetingBrief(
      { scenario, insight, briefing, selectedProducts: products, selection },
      { summary: lookupResponse.summary, recommendedAction: lookupResponse.recommendedAction, sourceIds: lookupResponse.sourceIds },
    );
  }
```

- [ ] **Step 5: Run the new test and the existing lookup tests**

Run: `npx vitest run src/test/pageContextBuilders.test.js src/test/signalIntelligenceSection.test.jsx src/test/interactions.test.jsx`
Expected: PASS (the shared builder reproduces the prior lookup output).

- [ ] **Step 6: Run the full suite (regression guard)**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/pageContext.js src/test/pageContextBuilders.test.js
git commit -m "refactor: extract buildMeetingBrief shared by lookup and journey"
```

---

## Task 3: Add the Brief journey step + route (minimal page)

**Files:**
- Modify: `src/pages/pageContext.js` (`engagementSteps`)
- Modify: `src/App.jsx`
- Create: `src/pages/engagement/MeetingBriefPage.jsx`
- Modify: `src/test/routes.test.jsx`

- [ ] **Step 1: Write the failing route test**

In `src/test/routes.test.jsx`, add this row to the `it.each` table immediately after the `'/engagement/insight'` row:

```js
    ['/engagement/brief', 'Advisory Engagement'],
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/routes.test.jsx`
Expected: FAIL — `/engagement/brief` redirects to dashboard, heading "Advisory Engagement" not found.

- [ ] **Step 3: Add the `brief` step to `engagementSteps`**

In `src/pages/pageContext.js`, change `engagementSteps` to:

```js
export const engagementSteps = [
  { id: 'alert', label: 'Alert' },
  { id: 'insight', label: 'Insight' },
  { id: 'brief', label: 'Brief' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'confirm', label: 'Confirm' },
];
```

- [ ] **Step 4: Create the minimal page**

Create `src/pages/engagement/MeetingBriefPage.jsx`:

```jsx
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EngagementJourneyStepper, useJourneyStep } from '../../components/UI';
import LookupAgentOutput from '../../components/LookupAgentOutput';
import { buildMeetingBrief, engagementSteps, getViewContext } from '../pageContext';
import { useDemoState } from '../../state/DemoStateProvider';

export default function MeetingBriefPage() {
  const { state } = useDemoState();
  const context = getViewContext(state);
  const { client, insight } = context;
  const brief = buildMeetingBrief(context);

  useJourneyStep('engagement', 'brief');

  return (
    <div className="ri-page engagement-page">
      <Link className="portal-breadcrumb" to="/dashboard">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      <section className="engagement-route-header">
        <h2>Advisory Engagement</h2>
      </section>

      <section className="ri-panel engagement-stepper-panel">
        <EngagementJourneyStepper steps={engagementSteps} currentStep="brief" />
      </section>

      <section className="ri-panel engagement-main-panel">
        <div className="engagement-panel-header">
          <div>
            <h3>{brief.title}</h3>
            <p>{client.name} | {insight.headline}</p>
          </div>
        </div>
        <LookupAgentOutput presentation={brief} />
      </section>

      <Link className="engagement-primary-cta" to="/engagement/outreach">
        <span>Choose outreach</span>
        <ArrowRight size={22} />
      </Link>
    </div>
  );
}
```

- [ ] **Step 5: Register the route**

In `src/App.jsx`, add the import after the other engagement imports:

```jsx
import MeetingBriefPage from './pages/engagement/MeetingBriefPage';
```

and add this route immediately after the `/engagement/insight` route:

```jsx
        <Route path="/engagement/brief" element={<MeetingBriefPage />} />
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/test/routes.test.jsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/pages/pageContext.js src/App.jsx src/pages/engagement/MeetingBriefPage.jsx src/test/routes.test.jsx
git commit -m "feat: add Brief step to the advisory journey"
```

---

## Task 4: Wire the Insight CTA to the Brief step

**Files:**
- Modify: `src/pages/engagement/InsightReviewPage.jsx`
- Test: `src/test/journeys.test.jsx`

- [ ] **Step 1: Write the failing test**

In `src/test/journeys.test.jsx`, add this test inside the top-level `describe` (match the existing import style — it already uses `renderApp` from `./testUtils`; if `userEvent` is not imported, add `import userEvent from '@testing-library/user-event';` and `import { screen } from '@testing-library/react';` if missing):

```js
  it('routes from the insight step to the new brief step', async () => {
    const user = userEvent.setup();
    renderApp('/engagement/insight');

    await user.click(screen.getByRole('link', { name: /build meeting brief/i }));

    expect(screen.getByRole('heading', { name: 'Pre-meeting brief' })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/journeys.test.jsx`
Expected: FAIL — no link named "Build meeting brief".

- [ ] **Step 3: Change the Insight CTA**

In `src/pages/engagement/InsightReviewPage.jsx`, change the final CTA link from:

```jsx
      <Link className="engagement-primary-cta" to="/engagement/outreach">
        <span>Choose outreach</span>
        <ArrowRight size={22} />
      </Link>
```

to:

```jsx
      <Link className="engagement-primary-cta" to="/engagement/brief">
        <span>Build meeting brief</span>
        <ArrowRight size={22} />
      </Link>
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/test/journeys.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/engagement/InsightReviewPage.jsx src/test/journeys.test.jsx
git commit -m "feat: link insight step to the meeting brief"
```

---

## Task 5: Origination lens builders + buildOriginationLenses

Extract the two existing lens bodies and add Strategic + Regulatory, then expose a single `buildOriginationLenses`.

**Files:**
- Modify: `src/pages/pageContext.js`
- Test: `src/test/originationLenses.test.js` (create)

- [ ] **Step 1: Write the failing test**

Create `src/test/originationLenses.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { createBaseState } from '../state/demoState';
import { buildOriginationLenses, getViewContext } from '../pages/pageContext';

describe('buildOriginationLenses', () => {
  it('returns four lenses each with a title and non-empty sections', () => {
    const ctx = getViewContext(createBaseState());
    const lenses = buildOriginationLenses(ctx);

    expect(Object.keys(lenses)).toEqual(['strategic', 'financial', 'risk', 'regulatory']);
    for (const key of Object.keys(lenses)) {
      expect(lenses[key].title).toBeTruthy();
      expect(lenses[key].sections.length).toBeGreaterThan(0);
      expect(Array.isArray(lenses[key].sourceIds)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/originationLenses.test.js`
Expected: FAIL — `buildOriginationLenses is not a function`.

- [ ] **Step 3: Extract the financial and risk builders**

In `src/pages/pageContext.js`, add two exported functions above `buildLookupAgentPresentation`. Move the **body** of the existing `revenue-opportunity-scan` branch into `buildRevenueOpportunityScan`, and the `client-risk-assessment` branch into `buildClientRiskAssessment`. They take `(context)` where context provides `{ scenario, client, insight, bundle, selection, briefing, selectedProducts }`:

```js
export function buildRevenueOpportunityScan(context) {
  const { client, insight, bundle, selection, selectedProducts: products = [] } = context;
  const sourceIds = insight.sourceIds;
  return {
    title: 'Revenue opportunity scan',
    summary: insight.whyItMatters,
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
    sourceIds,
  };
}

export function buildClientRiskAssessment(context) {
  const { scenario, insight, briefing } = context;
  const overallPosture = scenario.severity === 'positive' ? 'improving' : 'deteriorating';
  const trend = describeTrend(insight.trendData ?? []);
  return {
    title: 'Client risk assessment',
    summary: insight.whyItMatters,
    sections: [
      {
        id: 'risk-overview',
        title: 'Risk overview',
        type: 'paragraph',
        body: `Overall posture: ${overallPosture}. ${insight.whyItMatters}`,
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
          { label: 'Direction', value: trend.from != null && trend.to != null ? `${trend.direction} (${trend.from} to ${trend.to})` : trend.direction },
          { label: 'Overall posture', value: overallPosture },
          { label: 'Notable shift', value: scenario.alert.whyNow },
        ],
      },
      {
        id: 'recommended-actions',
        title: 'Recommended actions',
        type: 'bullets',
        items: [
          `Monitor ${insight.transactionalMetrics[2]?.label?.toLowerCase() ?? 'the latest operating signals'} through the next review cycle.`,
          `Engage client with the current RM position: ${insight.recommendedAction}`,
          scenario.severity === 'critical'
            ? 'Escalate internally if the pressure pattern continues to intensify across the next scripted refresh.'
            : 'Escalate internally only if the observed indicators move materially outside the current scripted range.',
        ],
      },
    ],
    sourceIds: insight.sourceIds,
  };
}
```

Note: the existing lookup branches (`revenue-opportunity-scan`, `client-risk-assessment`) keep their own code for now — they consume a `lookupResponse`. Do not delete them in this task; the journey lenses use the new builders. (A later cleanup task may unify them, out of scope here.)

- [ ] **Step 4: Add Strategic and Regulatory builders**

Add these two exported builders (derive generically from existing insight fields, per spec default):

```js
export function buildStrategicLens(context) {
  const { client, insight, scenario } = context;
  return {
    title: 'Strategic lens',
    summary: insight.whyItMatters,
    sections: [
      {
        id: 'strategic-thesis',
        title: 'Strategic thesis',
        type: 'paragraph',
        body: `${insight.headline} ${insight.whyItMatters}`,
      },
      {
        id: 'alignment',
        title: 'Alignment with client direction',
        type: 'bullets',
        items: [
          `RM focus: ${client.focus}`,
          `Why now: ${insight.whyNow}`,
          `Recommended posture: ${insight.recommendedAction}`,
        ],
      },
      {
        id: 'strategic-next-steps',
        title: 'Strategic next steps',
        type: 'bullets',
        items: splitDraftIntoBullets(insight.whatToDoNext).length
          ? splitDraftIntoBullets(insight.whatToDoNext)
          : [insight.whatToDoNext, `Anchor the conversation in the ${scenario.label.toLowerCase()} signal.`],
      },
    ],
    sourceIds: insight.sourceIds,
  };
}

export function buildRegulatoryLens(context) {
  const { insight, scenario, briefing } = context;
  return {
    title: 'Regulatory lens',
    summary: 'Regulatory and compliance context for this origination angle.',
    sections: [
      {
        id: 'regulatory-context',
        title: 'Regulatory context',
        type: 'paragraph',
        body: briefing?.riskSignal
          ? `${briefing.riskSignal} is the leading external watch item; confirm it does not constrain the proposed structure.`
          : `No specific regulatory constraint is flagged in the current ${scenario.label.toLowerCase()} scenario; proceed under standard product governance.`,
      },
      {
        id: 'compliance-checks',
        title: 'Compliance checks before commitment',
        type: 'bullets',
        items: [
          'Confirm product eligibility and pre-approved appetite before any client commitment.',
          'Ensure all figures cited in client-facing material trace to a source (evidence-backed by design).',
          'No client-facing commitment is made until human officers approve.',
        ],
      },
    ],
    sourceIds: insight.sourceIds,
  };
}
```

- [ ] **Step 5: Add the aggregate `buildOriginationLenses`**

```js
export function buildOriginationLenses(context) {
  return {
    strategic: buildStrategicLens(context),
    financial: buildRevenueOpportunityScan(context),
    risk: buildClientRiskAssessment(context),
    regulatory: buildRegulatoryLens(context),
  };
}
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/test/originationLenses.test.js`
Expected: PASS.

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/pages/pageContext.js src/test/originationLenses.test.js
git commit -m "feat: add origination lens builders (strategic/financial/risk/regulatory)"
```

---

## Task 6: LensTabs component + integrate into the Insight step

**Files:**
- Create: `src/components/engagement/LensTabs.jsx`
- Modify: `src/pages/engagement/InsightReviewPage.jsx`
- Test: `src/test/lensTabs.test.jsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/test/lensTabs.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import LensTabs from '../components/engagement/LensTabs';

const lenses = {
  strategic: { title: 'Strategic lens', summary: 's', sections: [{ id: 'a', title: 'Strategic thesis', type: 'paragraph', body: 'STRAT BODY' }], sourceIds: [] },
  financial: { title: 'Revenue opportunity scan', summary: 'f', sections: [{ id: 'b', title: 'Opportunity summary', type: 'bullets', items: ['FIN ITEM'] }], sourceIds: [] },
  risk: { title: 'Client risk assessment', summary: 'r', sections: [{ id: 'c', title: 'Risk overview', type: 'paragraph', body: 'RISK BODY' }], sourceIds: [] },
  regulatory: { title: 'Regulatory lens', summary: 'g', sections: [{ id: 'd', title: 'Regulatory context', type: 'paragraph', body: 'REG BODY' }], sourceIds: [] },
};

describe('LensTabs', () => {
  it('shows the first lens by default and switches on click', async () => {
    const user = userEvent.setup();
    render(<LensTabs lenses={lenses} />);

    expect(screen.getByText('STRAT BODY')).toBeInTheDocument();
    expect(screen.queryByText('REG BODY')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /regulatory/i }));

    expect(screen.getByText('REG BODY')).toBeInTheDocument();
    expect(screen.queryByText('STRAT BODY')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/lensTabs.test.jsx`
Expected: FAIL — cannot find module `LensTabs`.

- [ ] **Step 3: Create the component**

Create `src/components/engagement/LensTabs.jsx`:

```jsx
import { useState } from 'react';
import LookupAgentOutput from '../LookupAgentOutput';

const LENS_ORDER = [
  { key: 'strategic', label: 'Strategic' },
  { key: 'financial', label: 'Financial' },
  { key: 'risk', label: 'Risk' },
  { key: 'regulatory', label: 'Regulatory' },
];

export default function LensTabs({ lenses }) {
  const [active, setActive] = useState('strategic');
  const presentation = lenses[active];

  return (
    <div className="lens-tabs">
      <div className="lens-tabs__list" role="tablist" aria-label="Origination analytical lenses">
        {LENS_ORDER.map(lens => (
          <button
            key={lens.key}
            type="button"
            role="tab"
            aria-selected={active === lens.key}
            className={`lens-tabs__tab ${active === lens.key ? 'lens-tabs__tab--active' : ''}`}
            onClick={() => setActive(lens.key)}
          >
            {lens.label}
          </button>
        ))}
      </div>
      <div className="lens-tabs__panel" role="tabpanel">
        <LookupAgentOutput presentation={presentation} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/lensTabs.test.jsx`
Expected: PASS.

- [ ] **Step 5: Integrate into the Insight step**

In `src/pages/engagement/InsightReviewPage.jsx`: add imports near the top:

```jsx
import LensTabs from '../../components/engagement/LensTabs';
import { buildOriginationLenses } from '../pageContext';
```

(`getViewContext` is already imported.) Inside the component body, after the existing `const { ... } = getViewContext(state);` destructure, add:

```jsx
  const originationLenses = buildOriginationLenses(getViewContext(state));
```

Then add a new panel immediately after the `RichEvidenceNarrative` section (the `<section className="ri-panel engagement-main-panel"><RichEvidenceNarrative .../></section>` block):

```jsx
      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <h3>Origination lenses</h3>
          <p>Four specialist views over the same client intelligence.</p>
        </div>
        <LensTabs lenses={originationLenses} />
      </section>
```

- [ ] **Step 6: Add minimal styling**

Append to `src/styles/global.css`:

```css
.lens-tabs__list { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.lens-tabs__tab {
  border: 1px solid var(--line); background: var(--surface); color: var(--text-muted);
  border-radius: 999px; padding: 0.4rem 0.9rem; font: inherit; cursor: pointer;
}
.lens-tabs__tab--active { background: var(--accent-soft); color: var(--accent-dark); border-color: var(--accent); }
```

- [ ] **Step 7: Run the suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/engagement/LensTabs.jsx src/pages/engagement/InsightReviewPage.jsx src/styles/global.css src/test/lensTabs.test.jsx
git commit -m "feat: add origination lens tabs to the insight step"
```

---

## Task 7: AgentPipeline component + pipeline builders

**Files:**
- Modify: `src/pages/pageContext.js` (builders)
- Create: `src/components/engagement/AgentPipeline.jsx`
- Modify: `src/pages/engagement/InsightReviewPage.jsx` and `src/pages/engagement/MeetingBriefPage.jsx`
- Test: `src/test/agentPipeline.test.jsx` (create), `src/test/pipelineBuilders.test.js` (create)

- [ ] **Step 1: Write the failing builder test**

Create `src/test/pipelineBuilders.test.js`:

```js
import { describe, expect, it } from 'vitest';
import { createBaseState } from '../state/demoState';
import { buildMeetingBriefPipeline, buildOriginationPipeline, getViewContext } from '../pages/pageContext';

describe('pipeline builders', () => {
  it('origination pipeline has six agents plus a synthesis node', () => {
    const pipeline = buildOriginationPipeline(getViewContext(createBaseState()));
    expect(pipeline.agents).toHaveLength(6);
    expect(pipeline.synthesis.label).toBeTruthy();
    pipeline.agents.forEach(agent => expect(agent.contribution).toBeTruthy());
  });

  it('meeting brief pipeline has six agents plus a synthesis node', () => {
    const pipeline = buildMeetingBriefPipeline(getViewContext(createBaseState()));
    expect(pipeline.agents).toHaveLength(6);
    expect(pipeline.synthesis.label).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/pipelineBuilders.test.js`
Expected: FAIL — builders not exported.

- [ ] **Step 3: Add the pipeline builders**

In `src/pages/pageContext.js`, add:

```js
export function buildOriginationPipeline(context) {
  const { scenario, insight, client } = context;
  const metric = insight.transactionalMetrics;
  return {
    agents: [
      { id: 'market-signal', label: 'Market Signal', role: 'Detects banking-relevant events', contribution: scenario.alert.title },
      { id: 'insight-engine', label: 'Insight Engine', role: 'Explains trends and patterns', contribution: insight.whatHappened },
      { id: 'internal-intel', label: 'Internal Intelligence', role: 'Checks strategy and financing fit', contribution: `RM focus alignment: ${client.focus}` },
      { id: 'opportunity', label: 'Opportunity Generation', role: 'Converts intelligence into products', contribution: insight.recommendedAction },
      { id: 'risk-intel', label: 'Risk Intelligence', role: 'Validates exposure and sector risk', contribution: `Why now: ${scenario.alert.whyNow}` },
      { id: 'origination', label: 'Deal Origination', role: 'Assembles the banker-ready report', contribution: insight.whyItMatters },
    ],
    synthesis: { id: 'synthesis', label: 'Deal Origination Report', role: 'Combines all inputs', contribution: `${metric[0] ? `${metric[0].label}: ${metric[0].value}. ` : ''}${insight.headline}` },
  };
}

export function buildMeetingBriefPipeline(context) {
  const { scenario, insight, client, briefing } = context;
  return {
    agents: [
      { id: 'relationship-snapshot', label: 'Relationship Snapshot', role: 'Client identity and coverage', contribution: `${client.name} | ${client.persona}` },
      { id: 'financial-snapshot', label: 'Financial Snapshot', role: 'Revenue, balances, leverage', contribution: insight.transactionalMetrics.map(formatMetric).join('; ') },
      { id: 'opportunities-risks', label: 'Opportunities & Risks', role: 'Angles and watch-outs', contribution: insight.whyItMatters },
      { id: 'recent-intel', label: 'Recent Intelligence', role: 'Latest internal/external signals', contribution: scenario.alert.summary },
      { id: 'relationship-timeline', label: 'Relationship Timeline', role: 'Meeting history and follow-ups', contribution: `Recommended action: ${insight.recommendedAction}` },
      { id: 'peer-context', label: 'Peer/Market Context', role: 'Sector dynamics', contribution: briefing?.commentary ?? `${scenario.label} is the leading external signal.` },
    ],
    synthesis: { id: 'synthesis', label: 'Meeting Brief', role: 'Combines all inputs', contribution: insight.headline },
  };
}
```

- [ ] **Step 4: Run builder test to verify it passes**

Run: `npx vitest run src/test/pipelineBuilders.test.js`
Expected: PASS.

- [ ] **Step 5: Write the failing component test**

Create `src/test/agentPipeline.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import AgentPipeline from '../components/engagement/AgentPipeline';

const pipeline = {
  agents: [{ id: 'one', label: 'Agent One', role: 'Does a thing', contribution: 'HIDDEN CONTRIBUTION' }],
  synthesis: { id: 'synthesis', label: 'Final Report', role: 'Combines all inputs', contribution: 'SUMMARY' },
};

describe('AgentPipeline', () => {
  it('hides contributions until an agent row is expanded', async () => {
    const user = userEvent.setup();
    render(<AgentPipeline title="Pipeline" pipeline={pipeline} />);

    expect(screen.getByText('Agent One')).toBeInTheDocument();
    expect(screen.queryByText('HIDDEN CONTRIBUTION')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Agent One/i }));

    expect(screen.getByText('HIDDEN CONTRIBUTION')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run src/test/agentPipeline.test.jsx`
Expected: FAIL — cannot find module `AgentPipeline`.

- [ ] **Step 7: Create the component**

Create `src/components/engagement/AgentPipeline.jsx`:

```jsx
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

function AgentRow({ agent, index }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`agent-pipeline__row ${open ? 'agent-pipeline__row--open' : ''}`}>
      <button type="button" className="agent-pipeline__head" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <span className="agent-pipeline__index">{String(index + 1).padStart(2, '0')}</span>
        <span className="agent-pipeline__labels">
          <strong>{agent.label}</strong>
          <span>{agent.role}</span>
        </span>
        <ChevronDown size={16} />
      </button>
      {open ? <p className="agent-pipeline__body">{agent.contribution}</p> : null}
    </article>
  );
}

export default function AgentPipeline({ title, pipeline }) {
  return (
    <div className="agent-pipeline">
      {title ? <h4 className="agent-pipeline__title">{title}</h4> : null}
      <div className="agent-pipeline__rows">
        {pipeline.agents.map((agent, index) => (
          <AgentRow key={agent.id} agent={agent} index={index} />
        ))}
      </div>
      <article className="agent-pipeline__synthesis">
        <strong>{pipeline.synthesis.label}</strong>
        <span>{pipeline.synthesis.role}</span>
        <p>{pipeline.synthesis.contribution}</p>
      </article>
    </div>
  );
}
```

- [ ] **Step 8: Add minimal styling**

Append to `src/styles/global.css`:

```css
.agent-pipeline__rows { display: flex; flex-direction: column; gap: 0.5rem; }
.agent-pipeline__head {
  display: flex; align-items: center; gap: 0.75rem; width: 100%; text-align: left;
  background: var(--surface); border: 1px solid var(--line); border-radius: 0.5rem; padding: 0.6rem 0.8rem; cursor: pointer; font: inherit;
}
.agent-pipeline__index { color: var(--accent); font-weight: 700; }
.agent-pipeline__labels { display: flex; flex-direction: column; flex: 1; }
.agent-pipeline__labels span { color: var(--text-subtle); font-size: 0.85rem; }
.agent-pipeline__body { margin: 0.4rem 0 0.2rem 2.4rem; color: var(--text-muted); }
.agent-pipeline__synthesis { margin-top: 0.75rem; padding: 0.8rem; border-radius: 0.5rem; background: var(--accent-soft); display: flex; flex-direction: column; gap: 0.2rem; }
.agent-pipeline__synthesis span { color: var(--accent-dark); font-size: 0.85rem; }
```

- [ ] **Step 9: Render the pipeline on both steps**

In `src/pages/engagement/InsightReviewPage.jsx`, add imports:

```jsx
import AgentPipeline from '../../components/engagement/AgentPipeline';
import { buildOriginationPipeline } from '../pageContext';
```

Add after the `originationLenses` line:

```jsx
  const originationPipeline = buildOriginationPipeline(getViewContext(state));
```

Add a panel right after the Origination lenses section:

```jsx
      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <h3>How the agents work together</h3>
          <p>Six specialist agents produce one banker-ready report.</p>
        </div>
        <AgentPipeline pipeline={originationPipeline} />
      </section>
```

In `src/pages/engagement/MeetingBriefPage.jsx`, add imports:

```jsx
import AgentPipeline from '../../components/engagement/AgentPipeline';
import { buildMeetingBriefPipeline } from '../pageContext';
```

Add after the `brief` line: `const briefPipeline = buildMeetingBriefPipeline(context);` and render a panel after the `LookupAgentOutput` section:

```jsx
      <section className="ri-panel engagement-main-panel">
        <div className="engagement-section-heading">
          <h3>How the agents work together</h3>
          <p>Six specialist agents produce one meeting brief.</p>
        </div>
        <AgentPipeline pipeline={briefPipeline} />
      </section>
```

- [ ] **Step 10: Run the suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add src/pages/pageContext.js src/components/engagement/AgentPipeline.jsx src/pages/engagement/InsightReviewPage.jsx src/pages/engagement/MeetingBriefPage.jsx src/styles/global.css src/test/agentPipeline.test.jsx src/test/pipelineBuilders.test.js
git commit -m "feat: add expandable agent pipeline to insight and brief steps"
```

---

## Task 8: PDF theme + layout

**Files:**
- Create: `src/components/report/pdfTheme.js`
- Create: `src/components/report/PdfLayout.jsx`

- [ ] **Step 1: Create the theme + font registration**

Create `src/components/report/pdfTheme.js`:

```js
import { Font } from '@react-pdf/renderer';
import poppins600 from '@fontsource/poppins/files/poppins-latin-600-normal.woff?url';
import poppins700 from '@fontsource/poppins/files/poppins-latin-700-normal.woff?url';
import manrope400 from '@fontsource/manrope/files/manrope-latin-400-normal.woff?url';
import manrope600 from '@fontsource/manrope/files/manrope-latin-600-normal.woff?url';

let registered = false;

export function registerReportFonts() {
  if (registered) return;
  Font.register({ family: 'Poppins', fonts: [
    { src: poppins600, fontWeight: 600 },
    { src: poppins700, fontWeight: 700 },
  ] });
  Font.register({ family: 'Manrope', fonts: [
    { src: manrope400, fontWeight: 400 },
    { src: manrope600, fontWeight: 600 },
  ] });
  registered = true;
}

export const brand = {
  accent: '#c00030',
  accentDark: '#98002e',
  accentSoft: '#fae6eb',
  text: '#111827',
  textMuted: '#4b5563',
  textSubtle: '#6b7280',
  line: '#dde1e7',
  surface: '#ffffff',
};
```

Note on fonts: `@react-pdf/renderer` reads `.woff` via fontkit. If a font fails to register in a given environment, components below still render using the default Helvetica because each style sets an explicit `fontFamily` that falls back gracefully; do not block export on font registration.

- [ ] **Step 2: Create the shared layout**

Create `src/components/report/PdfLayout.jsx`:

```jsx
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import absaLogo from '../../assets/absa-logo.png';
import { brand, registerReportFonts } from './pdfTheme';

registerReportFonts();

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontFamily: 'Manrope', fontSize: 10, color: brand.text },
  header: { backgroundColor: brand.accent, marginHorizontal: -40, marginTop: -36, paddingVertical: 16, paddingHorizontal: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 70 },
  headerMeta: { color: '#ffffff', textAlign: 'right' },
  headerTitle: { fontFamily: 'Poppins', fontWeight: 700, fontSize: 14, color: '#ffffff' },
  subhead: { color: '#ffffff', fontSize: 9, opacity: 0.9 },
  docTitle: { fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: brand.text, marginTop: 20 },
  docMeta: { color: brand.textMuted, marginTop: 4, marginBottom: 8 },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', color: brand.textSubtle, fontSize: 8, borderTopWidth: 1, borderTopColor: brand.line, paddingTop: 6 },
});

export default function PdfLayout({ reportType, client, date, children }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Image src={absaLogo} style={styles.logo} />
          <View style={styles.headerMeta}>
            <Text style={styles.headerTitle}>Client Intelligence Platform</Text>
            <Text style={styles.subhead}>{reportType}</Text>
          </View>
        </View>

        <Text style={styles.docTitle}>{reportType}</Text>
        <Text style={styles.docMeta}>{client} · {date}</Text>

        {children}

        <View style={styles.footer} fixed>
          <Text>Absa CIB · Confidential · For internal advisory use only</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 3: Verify it compiles (build check)**

Run: `npm run build`
Expected: build succeeds (this confirms the `?url` font imports and `@react-pdf/renderer` resolve under Vite).

- [ ] **Step 4: Commit**

```bash
git add src/components/report/pdfTheme.js src/components/report/PdfLayout.jsx
git commit -m "feat: add Absa-branded PDF layout and theme"
```

---

## Task 9: PDF documents for brief and origination report

**Files:**
- Create: `src/components/report/ReportSections.jsx`
- Create: `src/components/report/MeetingBriefPdf.jsx`
- Create: `src/components/report/OriginationReportPdf.jsx`

- [ ] **Step 1: Create a shared section renderer for PDF**

Create `src/components/report/ReportSections.jsx`:

```jsx
import { StyleSheet, Text, View } from '@react-pdf/renderer';
import { brand } from './pdfTheme';

const styles = StyleSheet.create({
  section: { marginTop: 12 },
  heading: { fontFamily: 'Poppins', fontWeight: 600, fontSize: 12, color: brand.accentDark, marginBottom: 4 },
  summary: { color: brand.textMuted, marginBottom: 6 },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  dot: { width: 10, color: brand.accent },
  kv: { marginBottom: 4 },
  kvLabel: { fontFamily: 'Manrope', fontWeight: 600 },
  card: { borderWidth: 1, borderColor: brand.line, borderRadius: 4, padding: 6, marginBottom: 4 },
  cardTitle: { fontFamily: 'Manrope', fontWeight: 600 },
  meta: { color: brand.textSubtle, fontSize: 8, marginTop: 2 },
  para: { marginBottom: 4 },
});

function formatMeta(meta) {
  if (!meta) return null;
  return Array.isArray(meta) ? meta.join(' | ') : meta;
}

function SectionBody({ section }) {
  if (section.type === 'paragraph') return <Text style={styles.para}>{section.body}</Text>;
  if (section.type === 'bullets') {
    return section.items.map((item, index) => (
      <View key={index} style={styles.bullet}><Text style={styles.dot}>•</Text><Text>{item}</Text></View>
    ));
  }
  if (section.type === 'key-value') {
    return section.items.map((item, index) => (
      <Text key={index} style={styles.kv}><Text style={styles.kvLabel}>{item.label}: </Text>{item.value}</Text>
    ));
  }
  if (section.type === 'cards') {
    return section.items.map((item, index) => (
      <View key={index} style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text>{item.body}</Text>
        {item.meta ? <Text style={styles.meta}>{formatMeta(item.meta)}</Text> : null}
      </View>
    ));
  }
  return null;
}

export function ReportPresentation({ presentation }) {
  return (
    <View>
      {presentation.summary ? <Text style={styles.summary}>{presentation.summary}</Text> : null}
      {presentation.sections.map(section => (
        <View key={section.id} style={styles.section} wrap={false}>
          <Text style={styles.heading}>{section.title}</Text>
          <SectionBody section={section} />
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 2: Create the Meeting Brief document**

Create `src/components/report/MeetingBriefPdf.jsx`:

```jsx
import PdfLayout from './PdfLayout';
import { ReportPresentation } from './ReportSections';

export default function MeetingBriefPdf({ brief, client, date }) {
  return (
    <PdfLayout reportType="Meeting Brief" client={client} date={date}>
      <ReportPresentation presentation={brief} />
    </PdfLayout>
  );
}
```

- [ ] **Step 3: Create the Origination Report document**

Create `src/components/report/OriginationReportPdf.jsx`:

```jsx
import { StyleSheet, Text, View } from '@react-pdf/renderer';
import PdfLayout from './PdfLayout';
import { ReportPresentation } from './ReportSections';
import { brand } from './pdfTheme';

const styles = StyleSheet.create({
  lensTitle: { fontFamily: 'Poppins', fontWeight: 700, fontSize: 13, color: brand.text, marginTop: 14 },
});

const LENS_ORDER = ['strategic', 'financial', 'risk', 'regulatory'];

export default function OriginationReportPdf({ lenses, client, date }) {
  return (
    <PdfLayout reportType="Deal Origination Report" client={client} date={date}>
      {LENS_ORDER.map(key => (
        <View key={key}>
          <Text style={styles.lensTitle}>{lenses[key].title}</Text>
          <ReportPresentation presentation={lenses[key]} />
        </View>
      ))}
    </PdfLayout>
  );
}
```

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/report/ReportSections.jsx src/components/report/MeetingBriefPdf.jsx src/components/report/OriginationReportPdf.jsx
git commit -m "feat: add meeting brief and origination report PDF documents"
```

---

## Task 10: ExportReportButton + wire into both steps

**Files:**
- Create: `src/components/report/ExportReportButton.jsx`
- Modify: `src/pages/engagement/MeetingBriefPage.jsx`, `src/pages/engagement/InsightReviewPage.jsx`
- Test: `src/test/exportReportButton.test.jsx` (create)

- [ ] **Step 1: Write the failing test**

Create `src/test/exportReportButton.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const toBlob = vi.fn(() => Promise.resolve(new Blob(['pdf'], { type: 'application/pdf' })));
vi.mock('@react-pdf/renderer', () => ({ pdf: () => ({ toBlob }) }));

import ExportReportButton from '../components/report/ExportReportButton';

describe('ExportReportButton', () => {
  it('generates a PDF blob and triggers a download on click', async () => {
    const user = userEvent.setup();
    const createUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    render(<ExportReportButton document={<div />} fileName="Absa-Test.pdf" label="Download report" />);
    await user.click(screen.getByRole('button', { name: /download report/i }));

    expect(toBlob).toHaveBeenCalled();
    expect(createUrl).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/exportReportButton.test.jsx`
Expected: FAIL — cannot find module `ExportReportButton`.

- [ ] **Step 3: Create the component**

Create `src/components/report/ExportReportButton.jsx`:

```jsx
import { Download } from 'lucide-react';
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';

export default function ExportReportButton({ document: doc, fileName, label = 'Download PDF report' }) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="button button--ghost" onClick={handleClick} disabled={busy}>
      <Download size={16} />
      {busy ? 'Preparing…' : label}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/exportReportButton.test.jsx`
Expected: PASS.

- [ ] **Step 5: Wire into the Brief page**

In `src/pages/engagement/MeetingBriefPage.jsx`, add imports:

```jsx
import ExportReportButton from '../../components/report/ExportReportButton';
import MeetingBriefPdf from '../../components/report/MeetingBriefPdf';
```

Add the export action into the panel header (replace the existing `<div className="engagement-panel-header"> ... </div>` block with the version that includes the button):

```jsx
        <div className="engagement-panel-header">
          <div>
            <h3>{brief.title}</h3>
            <p>{client.name} | {insight.headline}</p>
          </div>
          <ExportReportButton
            document={<MeetingBriefPdf brief={brief} client={client.name} date="1 June 2026" />}
            fileName={`Absa-${client.name.replace(/\s+/g, '-')}-Meeting-Brief-20260601.pdf`}
            label="Download brief PDF"
          />
        </div>
```

- [ ] **Step 6: Wire into the Insight page (origination report)**

In `src/pages/engagement/InsightReviewPage.jsx`, add imports:

```jsx
import ExportReportButton from '../../components/report/ExportReportButton';
import OriginationReportPdf from '../../components/report/OriginationReportPdf';
```

In the Origination lenses section heading, add the export button beside the heading text:

```jsx
        <div className="engagement-section-heading">
          <div>
            <h3>Origination lenses</h3>
            <p>Four specialist views over the same client intelligence.</p>
          </div>
          <ExportReportButton
            document={<OriginationReportPdf lenses={originationLenses} client={client.name} date="1 June 2026" />}
            fileName={`Absa-${client.name.replace(/\s+/g, '-')}-Deal-Origination-Report-20260601.pdf`}
            label="Download origination report"
          />
        </div>
```

- [ ] **Step 7: Run the full suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Build check**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 9: Commit**

```bash
git add src/components/report/ExportReportButton.jsx src/pages/engagement/MeetingBriefPage.jsx src/pages/engagement/InsightReviewPage.jsx src/test/exportReportButton.test.jsx
git commit -m "feat: add branded PDF export to brief and insight steps"
```

---

## Task 11: Manual verification + final regression

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS, including all new test files.

- [ ] **Step 2: Manual smoke (dev server)**

Run: `npm run dev`, then in the browser:
- Navigate Dashboard → open an alert → Insight: confirm the lens tabs switch and the agent pipeline rows expand.
- Click "Download origination report" → a branded PDF downloads and opens with the Absa header, logo, and four lenses.
- Click "Build meeting brief" → Brief step renders the five sections + pipeline.
- Click "Download brief PDF" → branded Meeting Brief PDF downloads.
- Continue "Choose outreach" → confirm the journey still completes.

Expected: all steps work; PDFs are vector (text selectable), Absa-red header, logo present.

- [ ] **Step 3: Final commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "chore: advisory-journey enhancements verification pass"
```

---

## Self-review notes (resolved during planning)

- **Spec coverage:** Brief step (Tasks 3–4), origination lens tabs (Tasks 5–6), expandable agent pipeline (Task 7), branded PDF export (Tasks 8–10), regression guard on the Lookup brief (Task 2 Step 5). All spec sections map to a task.
- **Type consistency:** presentation shape `{ title, summary, sections[], sourceIds[] }` is used identically by `buildMeetingBrief`, the lens builders, `LookupAgentOutput`, and `ReportPresentation`. Pipeline shape `{ agents:[{id,label,role,contribution}], synthesis:{...} }` is used identically by both pipeline builders and `AgentPipeline`.
- **No placeholders:** every code step contains complete code.
```
