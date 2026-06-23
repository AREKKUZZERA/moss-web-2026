# Deploy to Vercel

## Project settings

- Framework Preset: `Vite`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js Version: `24.x`

These values are already fixed in `vercel.json` and `package.json`, so Vercel should pick them up automatically.

## Why this config is required

- `/api/moss/*` is proxied by Vercel to `http://default-squad.ru:24442/moss/*`.
- `/api/table/*` is proxied by Vercel to `http://default-squad.ru:8542/*`.
- All non-API routes are rewritten to `/index.html`, so direct links like `/players/<uuid>` and browser refreshes work with React Router.

## Deploy through Vercel Dashboard

1. Push the project to GitHub, GitLab, or Bitbucket.
2. Open Vercel Dashboard and click `Add New` -> `Project`.
3. Import this repository.
4. Keep the detected settings or set them manually:
   - Framework Preset: `Vite`
   - Install Command: `npm ci`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node.js Version: `24.x`
5. Do not add `VITE_MOSS_API_BASE` or `VITE_TABLE_API_BASE` unless you intentionally want to bypass the Vercel proxy. The default values `/api/moss` and `/api/table` are correct for production.
6. Click `Deploy`.
7. After deployment, verify:
   - `/`
   - `/items`
   - `/charts`
   - `/players`
   - refresh on `/players` or another client route
   - API proxy: `/api/moss/health`
   - API proxy: `/api/table/getTableItems`

## Deploy through Vercel CLI

Install and login:

```bash
npm i -g vercel
vercel login
```

Create a preview deployment:

```bash
vercel
```

Create a production deployment:

```bash
vercel --prod
```

For a stricter local-build flow:

```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```

## Backend availability notes

The frontend depends on two external HTTP backends:

- `http://default-squad.ru:24442`
- `http://default-squad.ru:8542`

Vercel rewrites hide these HTTP origins behind the HTTPS site URL, so browser mixed-content blocking should not occur. If a page loads but data is empty or errors, check the backend endpoints first.
