# CVP 3

React + Vite single-page application for the Absa RM Advisory Cockpit.

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
