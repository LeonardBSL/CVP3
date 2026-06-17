# CVP 3

React + Vite single-page application for the Absa RM Advisory Cockpit.

## Overview

CVP 3 is the Customer Value Proposition prototype for **Absa**'s Relationship Manager (RM) advisory function — a demo cockpit that shows how AI-surfaced signals, insights, and sector intelligence can drive better client conversations and outcomes. It is a self-contained, front-end-only build: all content is served from in-memory demo data, so the app can be run and demonstrated without any backend.

## Experiences

The app has two distinct experiences that share a single shell and demo state.

### Relationship Intelligence cockpit (RM-facing)

The banker workspace, reached from the primary navigation. Feature areas:

- **Dashboard** — prioritised client alerts, KPIs, active-client context, and a scenario simulator to trigger scripted demo signals.
- **Advisory Engagement** — a guided journey from alert → insight review → meeting brief → outreach, with sourced evidence and a branded PDF meeting-brief export.
- **Insight Delivery** — client insight review, customisation, and delivery, with a branded PDF report export.
- **Advisory Lookup** — agent-style search across the knowledge base and client data, returning a structured response and recommendations.
- **Sector Briefing** — sector overview, deep dive, and client-relevance mapping that routes the RM back into client context.

### Client Portal (client-facing intelligence dashboard)

A separate intelligence dashboard surface for the client. Feature areas:

- **Health Score** — composite relationship/financial health module.
- **Milestones** — engagement and journey milestone tracking.
- **Benchmarking** — peer and sector benchmarking.
- **Diagnostic** — diagnostic assessment module.
- **News Monitor** — signal and news monitoring.
- **Signal intelligence & internal notes** — a signal strip plus RM-only internal notes layered over the portal.

## Tech stack

| Area | Choice |
| --- | --- |
| Frontend framework | React 19 + Vite 8, routed with React Router 7 (SPA, `BrowserRouter`) |
| Local API | None — in-memory demo data modules in `src/data/`; no backend server runs locally |
| Production host | Cloudflare Pages (static site) |
| State approach | React Context + `useReducer` (`DemoStateProvider`), persisted to `sessionStorage` |

## Local development

```bash
npm install
npm run dev
```

## Cloudflare Pages

This project can be hosted on Cloudflare Pages as a static site. Cloudflare Workers are not required for the current app because the build output is client-side only and the routes are handled by React Router in the browser.

### Pages build settings

- Framework preset: `React (Vite)`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Node.js version: `22.16.0`

The repository includes a `.node-version` file so Cloudflare Pages can use a compatible Node.js version during builds.

### SPA routing

This app uses `BrowserRouter`. Cloudflare Pages supports SPA routing by default as long as the deployment does not include a top-level `404.html` file. Do not add a root `404.html` unless you intentionally want to override that behavior.

### Deploy with Git integration

1. Push this repository to GitHub or GitLab.
2. In Cloudflare, create a new Pages project and connect the repository.
3. Use the Pages build settings listed above.
4. Deploy.

Every push to the configured production branch will trigger a new deployment.

### Deploy with Direct Upload

```bash
npm ci
npm run build
npx wrangler pages project create
npx wrangler pages deploy dist
```

If you want preview deployments with Wrangler, use:

```bash
npx wrangler pages deploy dist --branch <branch-name>
```

## Notes

- Avoid adding custom cache rules to the Pages custom domain unless you have a specific reason. Pages already handles static asset caching well.
- If you later need authenticated APIs, server-side logic, or edge middleware, add Pages Functions or a Worker then. The current frontend does not need them.
