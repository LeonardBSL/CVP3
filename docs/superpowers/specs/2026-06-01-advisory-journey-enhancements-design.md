# Advisory-Journey Enhancements — Design Spec

**Date:** 2026-06-01
**Status:** Approved design, ready for implementation plan
**Parent:** [CIP Feature Mapping](2026-06-01-cip-feature-mapping-design.md)
**Module:** Deal Origination + Meeting Prep, folded into the existing Advisory journey

## Goal

Bring the deck's **Deal Origination** and **Meeting Prep** modules into CVP 3 by
*enhancing the existing Advisory journey* (the Engagement flow), reusing the analysis
that already exists in `pageContext.js`. Add a branded, exportable PDF report.

No new top-level section — both modules live inside `/engagement/*`.

## Decisions (captured in brainstorming)

1. **Meeting Brief = a new journey step.** Journey becomes Alert → Insight → **Brief** →
   Outreach → Confirm.
2. **Origination lenses = compact lens tabs** on the Insight step (Strategic / Financial /
   Risk / Regulatory).
3. **Pipeline transparency = expandable per-agent view** (deck slides 17–19), on both the
   Insight step (6-stage origination pipeline) and the Brief step (7 prep agents).
4. **Export = a real, rendered, Absa-branded PDF** via `@react-pdf/renderer` (vector text,
   embedded fonts, logo) — not `window.print()`. Applies to both the Meeting Brief and an
   Origination Report.

## What already exists (reuse, don't rebuild)

- `pageContext.js` → `buildLookupAgentPresentation('pre-meeting-brief', …)` already produces
  the deck's Meeting Brief sections: Executive summary, Key developments, Risks &
  watchpoints, Opportunities, Recommended talking points (with `sourceIds`).
- `'revenue-opportunity-scan'` ≈ Financial/Opportunity lens; `'client-risk-assessment'` ≈
  Risk lens — both already built as section sets.
- Insight packs (`getInsightPackById`) already carry `whyNow`, `whatHappened`,
  `whyItMatters`, `whatToDoNext`, `confidence`, `recommendedAction`, `transactionalMetrics`,
  `richResponse`, `clientFacingDraft`, `trendData`, `sourceIds`.
- Reusable UI: `EngagementJourneyStepper`, `RichEvidenceNarrative`, `SourceChips`,
  `IntelModal`, journey-step hook `useJourneyStep`.
- Brand tokens (from `global.css`): `--accent #c00030`, `--accent-dark #98002e`,
  `--accent-soft #fae6eb`, `--text #111827`, `--text-muted #4b5563`, `--line #dde1e7`,
  fonts Poppins (headings) / Manrope (body); `src/assets/absa-logo.png`.

## Architecture

### Units and boundaries

**Pure data builders (in `pageContext.js`) — no React, independently testable:**

- `buildMeetingBrief(viewContext)` → the Meeting Brief section set. Refactored out of
  `buildLookupAgentPresentation`'s `pre-meeting-brief` branch so it no longer requires a
  `lookupResponse`. It derives `summary`/`recommendedAction`/`sourceIds` from the **insight
  pack** (`insight.recommendedAction`, `insight.sourceIds`, `insight.whyItMatters`).
  The Lookup agent path keeps working by delegating to this same builder (passing the
  lookup-derived summary when present, falling back to the insight otherwise).
- `buildOriginationLenses(viewContext)` → `{ strategic, financial, risk, regulatory }`,
  each a `{ title, sections[] }` in the existing section shape (`bullets | key-value |
  cards | paragraph`). `risk` delegates to the existing `client-risk-assessment` logic;
  `financial` to `revenue-opportunity-scan`; `strategic` and `regulatory` are two new
  builders following the same shape.
- `buildOriginationPipeline(viewContext)` → 6 ordered agent nodes (Market Signal, Insight
  Engine, Internal Intelligence, Opportunity Generation, Risk Intelligence, Deal
  Origination) + a synthesis node, each with a short `contribution` string sourced from the
  insight/scenario data.
- `buildMeetingBriefPipeline(viewContext)` → 7 prep agents (Relationship/Financial
  Snapshot, Opportunities & Risks, Recent Intelligence, Relationship Timeline, Peer/Market
  Context) + synthesis.

These reuse the existing `getViewContext(state)` — they take its output, so they share the
active client/scenario context already threaded through `demoState` (preserving the deck's
"context carries forward" throughline).

**Presentational components (`src/components/` and pages):**

- `MeetingBriefPage` (`src/pages/engagement/MeetingBriefPage.jsx`) — route
  `/engagement/brief`. Renders `buildMeetingBrief` sections + an `AgentPipeline` (prep
  agents) + an `ExportReportButton`. Primary CTA → `/engagement/outreach`.
- `LensTabs` (`src/components/engagement/LensTabs.jsx`) — compact tab strip
  (Strategic / Financial / Risk / Regulatory) rendering the active lens's section set.
  Added to `InsightReviewPage` below the existing detail stack.
- `AgentPipeline` (`src/components/engagement/AgentPipeline.jsx`) — reusable; takes an
  ordered list of `{ id, label, role, contribution }` + a synthesis node. Each row is
  collapsed by default and expands to show `contribution`. Used on both Insight and Brief.
- A small shared `SectionRenderer` for the `bullets | key-value | cards | paragraph`
  section shape (the Lookup response page already renders these — extract it so Insight
  lenses, the Brief, and Lookup all share one renderer instead of duplicating markup).

**PDF (new `src/components/report/`):**

- `pdfTheme.js` — Absa palette + font registration (Poppins, Manrope as bundled `.ttf`
  under `src/assets/fonts/`; fall back to Helvetica only if a face is missing).
- `PdfLayout.jsx` — shared `@react-pdf/renderer` document chrome: Absa-red header band with
  embedded `absa-logo.png`, document title + client + date, page footer with page numbers
  and a confidentiality line, consistent type scale.
- `MeetingBriefPdf.jsx` — renders the Meeting Brief sections into `PdfLayout`.
- `OriginationReportPdf.jsx` — renders the origination brief + the four lenses + a pipeline
  summary into `PdfLayout`.
- `ExportReportButton.jsx` — builds the chosen document and downloads it via
  `pdf(<Doc/>).toBlob()` → object URL → anchor click. Filename pattern
  `Absa-<Client>-<ReportType>-<YYYYMMDD>.pdf`.

### Routing & journey wiring

- `App.jsx`: add `<Route path="/engagement/brief" element={<MeetingBriefPage />} />`.
- `pageContext.js`: `engagementSteps` → `[alert, insight, brief, outreach, confirm]`.
- `InsightReviewPage`: primary CTA changes from "Choose outreach" → "Build meeting brief"
  (`/engagement/brief`); add `LensTabs` and an `AgentPipeline` (origination).
- `MeetingBriefPage`: `useJourneyStep('engagement', 'brief')`; CTA → `/engagement/outreach`.
- `AppShell` needs no change (`/engagement/` prefix already drives the active nav state).

### Data additions (`demoData.js`)

- Strategic + Regulatory lens content per insight pack (or derived generically from
  existing fields, matching how the current builders synthesize from scenario/insight).
- Per-agent `role`/`contribution` copy for the two pipelines (kept short, demo-scripted,
  consistent with the existing scripted-evidence tone).

## Dependencies

- `@react-pdf/renderer` (PDF generation; pure client-side, works with the static Cloudflare
  Pages build).
- Bundled font files: `Poppins` + `Manrope` `.ttf` in `src/assets/fonts/`.
- No backend, no new build step — the Vite static output is unchanged.

## Testing (vitest + React Testing Library, matching existing `src/test/` patterns)

- `pageContext` unit tests: `buildMeetingBrief` (derives from insight without a
  lookupResponse), `buildOriginationLenses` (all four lenses present, correct shape),
  pipeline builders (node count + ordering).
- `MeetingBriefPage` render test: sections present, pipeline collapsed-by-default, CTA →
  outreach.
- `LensTabs` interaction test: switching tabs swaps section content.
- `AgentPipeline` test: row expands to reveal contribution.
- `routes.test.jsx`: `/engagement/brief` resolves; journey order updated.
- `ExportReportButton` test: clicking invokes the PDF builder (mock `@react-pdf/renderer`'s
  `pdf().toBlob()`; do not render a real PDF in jsdom) and triggers a download with the
  expected filename.
- Existing Lookup `pre-meeting-brief` tests must still pass after the builder refactor
  (regression guard on the shared builder).

## Out of scope

- Credit Memo (separate new flow — its own spec).
- Operational Knowledge Assistant (already covered by Advisory Lookup).
- Live data / real document ingestion — all outputs stay scripted-demo, as today.
- Server-side PDF rendering or emailing the report.

## Open questions (none blocking)

- Strategic/Regulatory lens copy: derive generically from existing insight fields (less
  authoring) vs. script bespoke copy per insight pack (richer demo). Default: derive
  generically first, allow per-pack overrides.
- Whether the Origination Report PDF should also embed the trend sparkline as a small
  rendered chart or just tabulate `trendData`. Default: tabulate first; chart later.
