# Single-Client Focus: Lock Journeys to Nkosi Retail Group

**Date:** 2026-05-20  
**Status:** Approved

## Problem

The prototype currently supports switching between 4 demo clients. This multi-client flexibility creates unnecessary overhead. All journey pages (engagement, insights, lookup, sector, dashboard) should always operate on Nkosi Retail Group. The client portal still needs to show different views per client, and the client dropdown on the advisory portal must retain all 4 clients.

## Goals

- Journey pages always show Nkosi Retail Group data — no switching, no overhead
- `/portal` page continues to display data for all 4 clients based on dropdown selection
- Client dropdown in workspace settings retains all 4 clients (drives portal view only)
- Remove data that is exclusively tied to non-Nkosi journeys

## Non-Goals

- Removing non-Nkosi clients from the dropdown UI
- Changing the portal's visual design or data richness
- Altering any journey page logic beyond which client it reads

---

## Design

### 1. State Shape Change (`src/state/demoState.js`)

Rename `selectedClientId` → `portalClientId` to make its scope explicit. Export a `JOURNEY_CLIENT_ID` constant that is the single source of truth for all journey pages.

**Before:**
```js
selectedClientId: 'nkosi-retail',
activeScenarioId: getDefaultScenarioForClient('nkosi-retail').id,
sectorFocus: ...,
lookupSession: buildLookupSession('nkosi-retail'),
```

**After:**
```js
export const JOURNEY_CLIENT_ID = 'nkosi-retail';

// initial state:
portalClientId: 'nkosi-retail',
activeScenarioId: getDefaultScenarioForClient(JOURNEY_CLIENT_ID).id,
sectorFocus: ...,
lookupSession: buildLookupSession(JOURNEY_CLIENT_ID),
```

The `SELECT_CLIENT` reducer case is stripped of its cascade. It only updates `portalClientId` — journey state (scenario, sector, lookup) never changes:

```js
case 'SELECT_CLIENT': {
  return { ...state, portalClientId: action.clientId };
}
```

### 2. View Context (`src/pages/pageContext.js`)

All journey view builders (engagement, insights, lookup, sector, dashboard) that currently read `state.selectedClientId` are updated to use the imported `JOURNEY_CLIENT_ID` constant.

The portal view builder is updated to read `state.portalClientId`.

No page component changes — they all call `getViewContext(state)` as before. The fix is entirely internal to `pageContext.js`.

### 3. AppShell Dropdown (`src/components/AppShell.jsx`)

The `SettingsDialog` dropdown value binding is updated from `selectedClientId` to `portalClientId`. The `dispatch` call and the full client list remain unchanged.

### 4. Session Storage (`src/state/DemoStateProvider.jsx`)

The `sessionStorage` rehydration key is updated from `selectedClientId` to `portalClientId` so portal client selection survives page refresh.

### 5. Stray Reference Sweep

A grep for `selectedClientId` across the entire `src/` directory catches any remaining reads in page components or test files. Journey page reads → replace with `JOURNEY_CLIENT_ID`. Portal reads → replace with `portalClientId`.

---

## Data Cleanup (`src/data/demoData.js`)

Remove entries that are exclusively used by non-Nkosi journey pages and will never be loaded after this change.

### Delete

| Collection | Entries to remove |
|---|---|
| `scenarios` | `liquidity-manufacturing`, `sector-logistics`, `growth-distributor` |
| `lookupResponses` | `lookup-liquidity-manufacturing`, `lookup-sector-logistics`, `lookup-growth-distributor` |
| `sectorBriefings` | `manufacturing`, `transport`, `wholesale` |

### Keep

| Collection | Reason |
|---|---|
| All 4 `clients` | Portal dropdown and views need all 4 |
| All 4 `insightPacks` | `clientPortalData.js` calls `getInsightPackById()` for all 4 when building portal insight records |
| All of `clientPortalData.js` | Source of "different views" per client on the portal — notes, engagements, insight records for all 4 clients |
| `productBundles` | Generic; not client-specific |

### clientPortalData.js hardening

`clientPortalData.js` currently references the `scenarios` array via a `scenarioByClientId` mapping. After deleting 3 non-Nkosi scenarios, this mapping must be hardened — either by inlining the client→scenario mapping as a static object, or by guarding the lookup with a fallback — so it does not throw on a missing scenario.

---

## Touch-Point Summary

| File | Change |
|---|---|
| `src/state/demoState.js` | Rename `selectedClientId` → `portalClientId`, export `JOURNEY_CLIENT_ID`, strip `SELECT_CLIENT` cascade |
| `src/pages/pageContext.js` | Journey builders use `JOURNEY_CLIENT_ID`; portal builder uses `state.portalClientId` |
| `src/components/AppShell.jsx` | Dropdown value: `selectedClientId` → `portalClientId` |
| `src/state/DemoStateProvider.jsx` | Update `sessionStorage` key name |
| `src/data/demoData.js` | Remove 3 scenarios, 3 lookupResponses, 3 sectorBriefings |
| `src/data/clientPortalData.js` | Harden `scenarioByClientId` mapping |

---

## Risk

Low. The app already defaults to `nkosi-retail`. The `getClientById` helper falls back to `clients[0]` (Nkosi) on a bad ID. No page components change structure — only which client ID they read. Data deletions are additive removals with no consumers remaining after the state change.
