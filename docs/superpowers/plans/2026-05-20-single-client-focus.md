# Single-Client Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lock all journey pages (engagement, insights, lookup, sector, dashboard) to Nkosi Retail Group while keeping the `/portal` page multi-client via a renamed `portalClientId` field.

**Architecture:** Add `JOURNEY_CLIENT_ID = 'nkosi-retail'` constant to `demoState.js`; rename `selectedClientId` → `portalClientId` in state; strip the `SELECT_CLIENT` cascade so switching the dropdown only affects the portal. Remove non-Nkosi scenarios, insightPacks, lookupResponses, and sectorBriefings that will never be reached, and harden `clientPortalData.js` to use a static client→scenarioId map instead of dynamically reading the now-trimmed scenarios array.

**Tech Stack:** React 19, React Router 7, Vite, plain JS (no TypeScript)

---

### Task 1: Update `demoState.js` — add JOURNEY_CLIENT_ID, rename state field, strip SELECT_CLIENT cascade

**Files:**
- Modify: `src/state/demoState.js`

- [ ] **Step 1: Export JOURNEY_CLIENT_ID constant**

Add this line immediately after the import block (after line 12, before the `storageKey` declaration):

```js
export const JOURNEY_CLIENT_ID = 'nkosi-retail';
```

- [ ] **Step 2: Remove selectedClientId from focusScenarioState**

Find `focusScenarioState` (around line 83). Remove the `selectedClientId` line. Before:

```js
function focusScenarioState(state, scenario) {
  return {
    ...state,
    selectedClientId: scenario.clientId,
    activeScenarioId: scenario.id,
    sectorFocus: scenario.sectorId,
    lookupSession: buildLookupSession(scenario.clientId),
  };
}
```

After:

```js
function focusScenarioState(state, scenario) {
  return {
    ...state,
    activeScenarioId: scenario.id,
    sectorFocus: scenario.sectorId,
    lookupSession: buildLookupSession(scenario.clientId),
  };
}
```

- [ ] **Step 3: Rename selectedClientId → portalClientId in createBaseState**

Find `createBaseState` (around line 358). Change:

```js
export function createBaseState() {
  return {
    selectedClientId: 'nkosi-retail',
    activeScenarioId: 'growth-retail',
```

To:

```js
export function createBaseState() {
  return {
    portalClientId: 'nkosi-retail',
    activeScenarioId: 'growth-retail',
```

- [ ] **Step 4: Update createInitialState to rehydrate portalClientId and lock lookupSession to JOURNEY_CLIENT_ID**

Find `createInitialState` (around line 396). The block that reads from sessionStorage currently does:

```js
    const selectedClientId = savedState.selectedClientId ?? baseState.selectedClientId;

    return {
      ...baseState,
      ...savedState,
      journeyProgress: { ... },
      bundleSelection: { ... },
      insightDrafts: { ... },
      lookupSession: normalizeLookupSession(savedState.lookupSession, selectedClientId),
      clientPortal: mergeClientPortalState(baseState.clientPortal, savedState.clientPortal),
      toasts: [],
    };
```

Change to:

```js
    return {
      ...baseState,
      ...savedState,
      portalClientId: savedState.portalClientId ?? baseState.portalClientId,
      journeyProgress: {
        ...baseState.journeyProgress,
        ...savedState.journeyProgress,
      },
      bundleSelection: {
        ...baseState.bundleSelection,
        ...savedState.bundleSelection,
      },
      insightDrafts: {
        ...baseState.insightDrafts,
        ...savedState.insightDrafts,
      },
      lookupSession: normalizeLookupSession(savedState.lookupSession, JOURNEY_CLIENT_ID),
      clientPortal: mergeClientPortalState(baseState.clientPortal, savedState.clientPortal),
      toasts: [],
    };
```

- [ ] **Step 5: Strip the SELECT_CLIENT cascade**

Find the `SELECT_CLIENT` case in `demoReducer` (around line 434). Before:

```js
    case 'SELECT_CLIENT': {
      const scenario = getDefaultScenarioForClient(action.clientId);
      return {
        ...state,
        selectedClientId: action.clientId,
        activeScenarioId: scenario.id,
        sectorFocus: scenario.sectorId,
        lookupSession: buildLookupSession(action.clientId),
      };
    }
```

After:

```js
    case 'SELECT_CLIENT': {
      return { ...state, portalClientId: action.clientId };
    }
```

- [ ] **Step 6: Fix CONFIRM_OUTREACH and RECORD_DELIVERY_ACTION to use JOURNEY_CLIENT_ID**

Find the `CONFIRM_OUTREACH` case (around line 663). Change:

```js
    case 'CONFIRM_OUTREACH': {
      const scenario = getScenarioById(state.activeScenarioId);
      const client = getClientById(state.selectedClientId);
```

To:

```js
    case 'CONFIRM_OUTREACH': {
      const scenario = getScenarioById(state.activeScenarioId);
      const client = getClientById(JOURNEY_CLIENT_ID);
```

Find the `RECORD_DELIVERY_ACTION` case (around line 760). Change:

```js
    case 'RECORD_DELIVERY_ACTION': {
      const client = getClientById(state.selectedClientId);
```

To:

```js
    case 'RECORD_DELIVERY_ACTION': {
      const client = getClientById(JOURNEY_CLIENT_ID);
```

- [ ] **Step 7: Remove unused import — getDefaultScenarioForClient is no longer called in SELECT_CLIENT**

At the top of `demoState.js`, `getDefaultScenarioForClient` is imported but now unused in the reducer. Check whether it is used anywhere else in the file (it is not — only `SELECT_CLIENT` called it). Remove it from the import:

```js
import {
  buildInitialAlerts,
  buildInitialBundleSelection,
  buildInitialInsightDrafts,
  getBundleById,
  getClientById,
  getInsightPackById,
  getScenarioById,
  sortAlerts,
} from '../data/demoData';
```

- [ ] **Step 8: Commit**

```bash
git add src/state/demoState.js
git commit -m "refactor: rename selectedClientId to portalClientId, lock journeys to JOURNEY_CLIENT_ID"
```

---

### Task 2: Update `AppShell.jsx` — rename dropdown binding, remove dead simulator buttons

**Files:**
- Modify: `src/components/AppShell.jsx`

- [ ] **Step 1: Update SettingsDialog prop name and dropdown value binding**

Find the `SettingsDialog` function signature (around line 37). Change:

```js
function SettingsDialog({ client, dispatch, onClose, scenario, selectedClientId }) {
```

To:

```js
function SettingsDialog({ client, dispatch, onClose, scenario, portalClientId }) {
```

Find the `<select>` inside `SettingsDialog` (around line 57). Change:

```js
<select aria-label="Select client" value={selectedClientId} onChange={event => dispatch({ type: 'SELECT_CLIENT', clientId: event.target.value })}>
```

To:

```js
<select aria-label="Select client" value={portalClientId} onChange={event => dispatch({ type: 'SELECT_CLIENT', clientId: event.target.value })}>
```

- [ ] **Step 2: Remove the two dead scenario simulator buttons**

Find the scenario simulator section inside `SettingsDialog` (around lines 79–89). The liquidity and sector buttons reference deleted scenarios. Remove them. Before:

```jsx
<div className="scenario-controls settings-controls" aria-label="Scenario simulator">
  <button type="button" className="chip-button" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.growth })}>
    Simulate growth signal
  </button>
  <button type="button" className="chip-button" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.liquidity })}>
    Simulate liquidity risk
  </button>
  <button type="button" className="chip-button" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.sector })}>
    Simulate sector disruption
  </button>
</div>
```

After:

```jsx
<div className="scenario-controls settings-controls" aria-label="Scenario simulator">
  <button type="button" className="chip-button" onClick={() => dispatch({ type: 'TRIGGER_SCENARIO', scenarioId: scenarioTriggerMap.growth })}>
    Simulate growth signal
  </button>
</div>
```

- [ ] **Step 3: Update the AppShell root — getClientById and prop pass**

Find the `AppShell` default export function (around line 199). Change:

```js
  const client = getClientById(state.selectedClientId);
```

To:

```js
  const client = getClientById(state.portalClientId);
```

Find the `SettingsDialog` usage (around line 251). Change:

```jsx
      {settingsOpen ? (
        <SettingsDialog
          client={client}
          dispatch={dispatch}
          onClose={() => setSettingsOpen(false)}
          scenario={scenario}
          selectedClientId={state.selectedClientId}
        />
      ) : null}
```

To:

```jsx
      {settingsOpen ? (
        <SettingsDialog
          client={client}
          dispatch={dispatch}
          onClose={() => setSettingsOpen(false)}
          scenario={scenario}
          portalClientId={state.portalClientId}
        />
      ) : null}
```

- [ ] **Step 4: Verify in browser**

Run `npm run dev`. Open workspace settings. Confirm:
- Dropdown shows all 4 clients
- Switching client in dropdown updates the "Active context" name shown in the panel
- Only "Simulate growth signal" button appears
- Navigating to engagement/insights/lookup/sector after switching portal client always shows Nkosi Retail Group data

- [ ] **Step 5: Commit**

```bash
git add src/components/AppShell.jsx
git commit -m "refactor: wire AppShell to portalClientId, remove non-Nkosi simulator buttons"
```

---

### Task 3: Delete non-Nkosi data from `demoData.js`

**Files:**
- Modify: `src/data/demoData.js`

- [ ] **Step 1: Delete 3 non-Nkosi scenarios from the scenarios array**

In the `scenarios` array (starts at line 116), delete the three entries after `growth-retail`. The array currently has 4 objects. After this step it has 1. Delete the entire objects for:
- `id: 'liquidity-manufacturing'` (starts around line 143, ends at the closing `},` around line 168)
- `id: 'sector-logistics'` (starts around line 169, ends around line 194)
- `id: 'growth-distributor'` (starts around line 195, ends around line 221)

Result — the `scenarios` array has exactly one entry:

```js
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
```

- [ ] **Step 2: Delete 3 non-Nkosi insightPacks entries**

In the `insightPacks` object, delete these three top-level keys and their entire value blocks:
- `'insight-liquidity-manufacturing': { ... }` (starts around line 295)
- `'insight-sector-logistics': { ... }` (starts around line 378)
- `'insight-growth-distributor': { ... }` (starts around line 448)

Each block ends just before the next quoted key or the closing `};`. The `insightPacks` object should contain only `'insight-growth-retail': { ... }` after this step.

- [ ] **Step 3: Delete 3 non-Nkosi lookupResponses entries**

In the `lookupResponses` object (starts around line 1012), delete:
- `'lookup-liquidity-manufacturing': { ... }` (starts around line 1043)
- `'lookup-sector-logistics': { ... }` (starts around line 1073)
- `'lookup-growth-distributor': { ... }` (starts around line 1103)

The `lookupResponses` object should contain only `'lookup-growth-retail': { ... }` after this step.

- [ ] **Step 4: Delete 3 non-Nkosi sectorBriefings entries**

In the `sectorBriefings` object (starts around line 524), delete:
- `wholesale: { ... }` (starts at line 525)
- `manufacturing: { ... }` (find by key name)
- `transport: { ... }` (find by key name)

Keep: `retail`, `agriculture`, `professional-services`, `public-sector`.

- [ ] **Step 5: Update scenarioTriggerMap**

Find line 1135 (now renumbered after deletions). Change:

```js
export const scenarioTriggerMap = { growth: 'growth-retail', liquidity: 'liquidity-manufacturing', sector: 'sector-logistics' };
```

To:

```js
export const scenarioTriggerMap = { growth: 'growth-retail' };
```

- [ ] **Step 6: Verify no console errors**

Run `npm run dev`. Open the browser console. Navigate through dashboard → engagement → insights → lookup → sector. Confirm no "Cannot read properties of undefined" or missing-data errors. The alerts list should show 1 alert (growth-retail). The sector briefing page should load retail briefing correctly.

- [ ] **Step 7: Commit**

```bash
git add src/data/demoData.js
git commit -m "chore: remove non-Nkosi scenarios, insightPacks, lookupResponses, sectorBriefings"
```

---

### Task 4: Harden `clientPortalData.js` — static scenarioByClientId map

**Files:**
- Modify: `src/data/clientPortalData.js`

- [ ] **Step 1: Replace the scenarios import with a static map**

At the top of the file, find:

```js
import { getInsightPackById, scenarios } from './demoData';
```

Change to:

```js
import { getInsightPackById } from './demoData';
```

Find the dynamic mapping line inside `buildInitialClientPortal` (line 120):

```js
  const scenarioByClientId = Object.fromEntries(scenarios.map(scenario => [scenario.clientId, scenario]));
```

Replace it with the static map that returns scenario ID strings directly:

```js
  const scenarioByClientId = {
    'nkosi-retail': 'growth-retail',
    'mahlangu-manufacturing': 'liquidity-manufacturing',
    'transit-logistics': 'sector-logistics',
    'meridian-distributor': 'growth-distributor',
  };
```

- [ ] **Step 2: Remove .id from all scenarioByClientId references**

The old map returned full scenario objects, so callers used `.id`. The new map returns the ID string directly. Find every occurrence of `scenarioByClientId[` in the file and remove the trailing `.id`. For example:

Before:
```js
scenarioId: scenarioByClientId['nkosi-retail'].id,
```
After:
```js
scenarioId: scenarioByClientId['nkosi-retail'],
```

Do this for all 4 client keys across all insight record registrations and engagement registrations. There are 8 total occurrences (2 historical insight records + 1 active record update + 2 engagements per client × 4 clients). Use find-and-replace on the pattern `scenarioByClientId[` with confirm-on-each to catch every instance.

- [ ] **Step 3: Verify portal shows all 4 clients**

Run `npm run dev`. Open `/portal`. Switch between all 4 clients using the workspace settings dropdown. Confirm each client shows their notes, insight records, and engagement history without console errors.

- [ ] **Step 4: Commit**

```bash
git add src/data/clientPortalData.js
git commit -m "refactor: inline static scenarioByClientId map, remove scenarios import"
```

---

### Task 5: Stray reference sweep and final verification

**Files:**
- Potentially any file in `src/`

- [ ] **Step 1: Grep for remaining selectedClientId references**

Run from the project root:

```bash
grep -r "selectedClientId" src/
```

Expected output: no matches. If any matches appear, follow the rule:
- In a journey page or its context → replace with `JOURNEY_CLIENT_ID` (import from `../state/demoState`)
- In a portal page → replace with `state.portalClientId`
- In a test file referencing state shape → update the mock state object field name

- [ ] **Step 2: Grep for references to deleted scenario/lookup IDs**

```bash
grep -r "liquidity-manufacturing\|sector-logistics\|growth-distributor" src/
```

Expected: matches only in `clientPortalData.js` (the static map and ID strings used as portal record IDs — these are fine, they're just string literals, not lookups into the deleted data). If matches appear elsewhere, investigate and remove.

- [ ] **Step 3: Full journey walkthrough in browser**

Navigate each journey end to end:

1. **Dashboard** — should show Nkosi Retail Group data throughout
2. **Advisory Engagement** (`/engagement/alert/alert-growth-retail`) — Nkosi alert, Nkosi client name
3. **Insight Delivery** (`/insights/client`) — Nkosi insight pack
4. **Advisory Lookup** (`/lookup/search`) — submit a query, confirm response is growth-retail
5. **Sector Briefing** (`/sector/overview`) — retail sector briefing loads

Switch client in workspace settings to Mahlangu Components. Re-navigate each journey. **All journeys must still show Nkosi Retail Group data.** The `/portal` page must show Mahlangu Components data.

Switch back to Nkosi in settings. Reload the page. Confirm `portalClientId` persists from sessionStorage correctly.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: complete single-client focus — journeys locked to Nkosi, portal remains multi-client"
```
