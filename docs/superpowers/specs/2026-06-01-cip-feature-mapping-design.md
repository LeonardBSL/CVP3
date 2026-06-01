# Client Intelligence Platform — Feature Mapping into CVP 3

**Date:** 2026-06-01
**Status:** Mapping / recommendation (approved approach: A — enhance-in-place)
**Next step:** Spec the first module to build (Credit Memo or the Advisory-journey enhancements)

## Purpose

A second app — the **Client Intelligence Platform (CIP)** pitch deck — describes four AI
modules across the bank. This document maps those modules onto CVP 3 (the "RM Advisory
Cockpit"), deciding for each whether it **enhances an existing flow** or **requires a new
flow**, and recommends how to integrate them.

This is the mapping deliverable. A detailed implementation spec follows for whichever
module we choose to build first.

## Scope decisions

- **Office scope: front + middle.** In scope: Deal Origination, Meeting Prep (front),
  Credit Memo (middle). The back-office **Operational Knowledge Assistant is out of
  scope** as a distinct module — its conversational, cited Q&A pattern is already
  embodied by the existing **Advisory Lookup** flow (`/lookup/*`, with its `Agents
  layer` and cited responses).
- **Integration approach: A — enhance-in-place.** Maximum reuse of existing flows and
  components; keep the current information architecture; add the minimum new surface.
- **Refinement:** Both **Deal Origination and Meeting Prep enhance the existing Advisory
  journey** (the Engagement flow), rather than spinning Meeting Prep off as its own
  section. **Credit Memo is the only genuinely new top-level flow.**

## The CIP modules (source)

1. **AI Deal Origination** (Front) — monitors client financials, market news, public
   filings; surfaces structured origination briefs. Deck pipeline: Market Signal →
   Insight Engine → Internal Intelligence → Opportunity Generation → Risk Intelligence →
   Deal Origination Report.
2. **Client / Meeting Prep** (Front) — briefing packs before client meetings. Seven
   agents: Relationship Snapshot, Financial Snapshot, Opportunities & Risks, Recent
   Intelligence, Relationship Timeline, Peer/Market Context → Brief Synthesis → Meeting
   Brief (exec summary, conversation strategy, opening angle, talking points, recommended
   questions, next actions).
3. **Credit Memo & Execution** (Middle) — first-draft credit memos with citations. Seven
   agents: Borrower Profile, Financial Performance, Repayment Capacity, Industry Risk,
   Covenant & Security, Downside Risk → Synthesis → Credit Recommendation.
4. **Operational Knowledge Assistant** (Back) — conversational, cited Q&A over internal
   docs. *(Out of scope; see Advisory Lookup.)*

Cross-cutting CIP engine: minimal input → multi-source read → parallel specialist lenses
→ consolidated, citation-backed output → human review, with **context carrying forward**
between modules.

## CVP 3 today (relevant flows)

- **Dashboard** (`/dashboard`) — priority alerts, KPIs, "Start Advisory Journey".
- **Advisory Engagement** (`/engagement/*`) — the *advisory journey*: alert → insight
  review → outreach selection → outreach confirm. `InsightReviewPage` already produces an
  AI-generated insight ("Why now / What happened / Why it matters / What to do next"),
  `RichEvidenceNarrative`, transactional evidence, and a product bundle.
- **Insight Delivery** (`/insights/*`) — client → insight → customize → delivery.
- **Advisory Lookup** (`/lookup/*`) — search → response → recommendation, with intent
  modes, client scoping, an **Agents layer** (`lookupAgentPresets`), and cited answers.
- **Client Portal** (`/portal`) — Intelligence Dashboard modules: Benchmarking,
  Diagnostic, Health Score, Milestones, News Monitor.
- **Sector Briefing** (`/sector/*`) — overview → deep-dive → client-relevance.

Reusable building blocks already present: journey steppers
(`EngagementJourneyStepper`, `InsightJourneyStepper`, `LookupJourneyTabs`), evidence &
citation components (`RichEvidenceNarrative`, `SourceChips`, `IntelModal`), the Lookup
**Agents layer** pattern, and client/scenario context threaded through `demoState`.

## Mapping summary

| CIP module | Office | CVP 3 home | Verdict |
|---|---|---|---|
| Deal Origination | Front | Advisory Engagement (advisory journey) + Dashboard alerts | **Enhance existing** |
| Meeting Prep | Front | Advisory journey (draws on Client Portal modules) | **Enhance existing** |
| Credit Memo | Middle | — (no analog) | **New top-level flow** |
| Operational Knowledge | Back | Advisory Lookup | Already exists (out of scope) |

## Per-module integration plan

### 1. Deal Origination — enhance Advisory Engagement

**Current state:** The advisory journey already detects signals (Dashboard priority
alerts) and produces an origination-brief-shaped insight in `InsightReviewPage`
(why-now / what-happened / why-it-matters / what-next, with evidence and a product
bundle).

**Gap vs. deck:** No explicit named lenses for *Internal Intelligence* (strategy
alignment, financing capability) and *Risk Intelligence*; no visible
pipeline/agent transparency; no exportable "Deal Origination Report" artifact.

**Plan (enhance, no new route):**
- Add named analytical lenses to the insight view (strategic, financial, risk,
  regulatory) — surfaced as sections within the existing insight panel.
- Add a lightweight **pipeline/agent transparency** affordance (reuse the Lookup
  Agents-layer pattern) showing the stages that produced the brief.
- Add an **export/"Deal Origination Report"** action on the insight.

**Reuses:** `InsightReviewPage`, `RichEvidenceNarrative`, `SourceChips`, journey stepper.
**New:** lens section data model; report export; agent/pipeline display component.

### 2. Meeting Prep — enhance the Advisory journey

**Current state:** No "meeting brief" artifact today. But the deck's seven prep agents map
almost 1:1 onto existing Client Portal modules:

| Deck prep agent | CVP 3 source |
|---|---|
| Relationship Snapshot | client/demoData + Portal |
| Financial Snapshot | Health Score / Diagnostic modules |
| Opportunities & Risks | Engagement insight |
| Recent Intelligence | News Monitor module |
| Relationship Timeline | Milestones module |
| Peer/Market Context | Benchmarking module + Sector Briefing |
| Brief Synthesis | new synthesis step |

**Plan (enhance, within the advisory journey):**
- Add a **"Generate meeting brief"** step/output in the advisory journey that
  synthesizes the above sources into a banker-ready Meeting Brief (exec summary,
  conversation strategy, opening angle, talking points, recommended questions, next
  actions).
- Brief is editable and exportable; every claim cites its source module.

**Reuses:** Portal module data, Engagement insight, `SourceChips`, journey stepper.
**New:** Meeting Brief synthesis + view; "Generate brief" entry point in the journey.

### 3. Credit Memo — new top-level flow

**Current state:** No analog. Middle-office; the RM cockpit covers none of repayment
capacity, covenants, security, stress testing, or memo structure.

**Plan (new section + new journey):**
- New nav section **Credit Memo** with its own journey: deal-context input → six
  specialist lenses (Borrower Profile, Financial Performance, Repayment Capacity,
  Industry Risk, Covenant & Security, Downside Risk) → synthesis → first-draft memo with
  citations → review/edit/export.
- Honors the "human judgment at the centre" principle: the memo is an explicitly
  reviewable first draft, never an approval.

**Reuses (patterns only):** journey stepper, evidence/citation components, Agents-layer
display.
**New:** routes (`/credit/*`), pages, credit data model, memo document view/export.

## Cross-cutting throughlines to preserve

- **Context carries forward.** Origination brief → Meeting brief → Credit memo should
  share the active client context already threaded via `demoState`, so work done upstream
  is not re-entered downstream. This is the deck's signature continuity and the strongest
  argument for keeping Origination + Meeting Prep inside one advisory journey.
- **Evidence-backed by design.** Every new output reuses `SourceChips` /
  `RichEvidenceNarrative` so claims stay clickable and cited.
- **Agent/pipeline transparency.** Standardize on the Lookup Agents-layer pattern so the
  multi-lens "specialist agents" story is visible and consistent across origination,
  meeting prep, and credit memo.

## What is new vs. enhanced

- **Enhanced (no new top-level nav):** Deal Origination and Meeting Prep, both inside the
  Advisory journey.
- **New top-level flow:** Credit Memo only.
- **Out of scope:** Operational Knowledge Assistant (covered by Advisory Lookup).

## Open questions for the spec phase

1. **Which to build first** — the Advisory-journey enhancements (Origination + Meeting
   Prep) or the new Credit Memo flow?
2. For Meeting Prep: is the brief a **new step inside** the existing engagement journey,
   or an **action button** available from the journey/Portal that opens a brief view?
3. For Credit Memo: how real is the data model for the demo — scripted fixtures matching
   the existing `demoData` style, or a richer credit dataset?
4. How much agent/pipeline transparency to show — a simple "stages" ribbon, or an
   expandable per-agent view?
