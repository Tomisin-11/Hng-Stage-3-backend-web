# Insighta Labs+ — Web Portal

> React web interface for the Insighta Labs+ Platform

## Pages

| Route | Description |
|-------|-------------|
| `/login` | GitHub OAuth login |
| `/dashboard` | Metrics: totals, gender split, recent profiles |
| `/profiles` | List with filters, sort, pagination, CSV export |
| `/profiles/:id` | Profile detail with confidence scores |
| `/search` | Natural language search with example queries |
| `/account` | Current user, session info, logout |
| `/users` | User management — **admin only** |

## Setup

```bash
git clone <repo>
cd insighta-web
npm install
npm run dev      # Starts on http://localhost:3000
```

The Vite dev server proxies `/api/*` and `/auth/*` to `http://localhost:4000`.
The backend must be running first.

## Authentication

- Login via GitHub OAuth (HTTP redirect flow)
- `access_token` stored **in memory only** (not localStorage — XSS protection)
- `refresh_token` stored in **HTTP-only, SameSite=Strict cookie** — JS cannot access it
- On page load: silent session restore via cookie → `POST /auth/refresh`
- On 401 API response: automatic token refresh, original request retried
- On expired refresh token: redirected to `/login`

## Security

- **HTTP-only cookies**: refresh token never exposed to JavaScript
- **SameSite=Strict**: cookie not sent on cross-origin requests (CSRF protection)
- **In-memory access tokens**: cleared on page close, never persisted
- **X-API-Version: 1**: required header on all API calls, handled globally in apiClient.js

## Build

```bash
npm run build    # Output in dist/
npm run preview  # Preview production build
```
