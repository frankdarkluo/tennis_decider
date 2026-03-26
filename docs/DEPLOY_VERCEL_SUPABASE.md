# Vercel + Supabase Deployment Guide

This project is best deployed as:

- `Vercel` for the Next.js app
- existing `Supabase` for auth, database, and storage

Why this setup:

- the app uses Next.js App Router and API routes (`/api/search-videos`, `/api/video-diagnose`)
- Vercel supports this stack directly with the least configuration
- Supabase remains the backend and does not need to be replaced

## Recommended Free Setup

- `Vercel Hobby` for the web app
- current `Supabase Free` project for auth + data

This is enough for:

- public website access through a `*.vercel.app` URL
- Supabase magic-link login
- content library, rankings, plan saving, and research logging
- YouTube / VLM API keys stored safely in deployment environment variables

## 1. Push The Repo

Push this repository to GitHub first.

Typical flow:

```bash
git add .
git commit -m "Prepare Vercel deployment"
git push
```

## 2. Create The Vercel Project

1. Open Vercel
2. Import the GitHub repository
3. Framework preset should be detected as `Next.js`
4. Keep default build settings unless you intentionally changed them

Expected defaults:

- Build Command: `next build`
- Output: automatic
- Install Command: `npm install`

## 3. Add Environment Variables In Vercel

Add the same values you use locally.

Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Recommended:

```bash
NEXT_PUBLIC_ADMIN_EMAILS=
NEXT_PUBLIC_RESEARCH_CONTACT_EMAIL=
YOUTUBE_API_KEY=
VLM_PROVIDER=mock
VLM_API_KEY=
VLM_MODEL=Qwen/Qwen2.5-VL-72B-Instruct
VLM_BASE_URL=https://api.siliconflow.cn/v1
```

Notes:

- `YOUTUBE_API_KEY` must stay in Vercel environment variables only. Never commit it.
- If you are not enabling a real VLM yet, leave `VLM_PROVIDER=mock`.
- `NEXT_PUBLIC_ADMIN_EMAILS` controls who can open `/admin/export`.

## 4. Update Supabase Auth URL Settings

After the first Vercel deploy, you will get a domain like:

- `https://your-project-name.vercel.app`

In Supabase:

1. Go to `Authentication`
2. Open the URL / redirect settings
3. Set `Site URL` to your production site
4. Add allowed redirect URLs

Use at least these:

```text
http://localhost:3000/auth/callback
https://your-project-name.vercel.app/auth/callback
```

If you later add a custom domain, also add:

```text
https://your-domain.com/auth/callback
```

Important:

- this app sends magic-link redirects to `${window.location.origin}/auth/callback`
- that means local works locally, and production works on the deployed domain, as long as Supabase allows both callback URLs

## 5. Deploy And Smoke Test

After Vercel finishes deployment, verify:

- homepage loads
- `/rankings` loads
- `/library` loads
- email login works
- `/auth/callback` completes successfully
- saved data can still write to Supabase

Recommended quick checks:

1. Open the public Vercel URL
2. Request a magic link
3. Complete login
4. Save one assessment / diagnosis / plan
5. Confirm the data appears in Supabase tables

## 6. Optional Custom Domain

If you later want a cleaner public URL:

1. add a custom domain in Vercel
2. update DNS as Vercel instructs
3. add the custom domain callback URL in Supabase
4. switch `Site URL` in Supabase to the custom domain

## Common Pitfalls

- `Login link opens but does not complete`
  Usually the deployed callback URL was not added in Supabase.

- `Works locally but not online`
  Usually one or more Vercel environment variables are missing.

- `YouTube search returns empty results`
  Usually `YOUTUBE_API_KEY` was not added in Vercel, or the key restrictions are too strict.

- `Admin export page is inaccessible`
  Usually `NEXT_PUBLIC_ADMIN_EMAILS` does not include the current account.

- `Supabase project looks inactive`
  Free projects may pause after inactivity. Wake the project before testing production flows again.

## Minimal User Actions Still Required

These parts must be done by the project owner:

- push the repo to GitHub
- create / connect the Vercel project
- paste environment variables into Vercel
- update Supabase Auth redirect URLs

Everything else in the codebase is already compatible with this deployment path.
