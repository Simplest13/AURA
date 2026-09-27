# Frontend — Web Dashboard (Vite + React 19)

The `frontend/` package is a **lightweight companion web dashboard** for AURA. It is deliberately simpler than the mobile app: it talks to the *same* backend API on port 4000, reuses the same JWT auth, and gives you a desktop view of health, reminders, lectures, and PDF summaries while the phone remains the flagship product.

## Tech Stack

| Concern | Choice |
|---|---|
| Build tool | Vite 8 (`npm run dev`, port 5173) |
| UI framework | React 19 with TypeScript |
| Routing | `react-router-dom` (BrowserRouter) |
| Server state | `@tanstack/react-query` (queries + mutations with cache invalidation) |
| HTTP client | Axios, single shared instance with a JWT request interceptor |
| Styling | Plain CSS — inline styles on pages, shared `designTokens.css` |

## Structure

```
frontend/src/
├── App.tsx                    # Router + route table + top nav bar
├── main.tsx / main.ts         # Entry point
├── api/
│   ├── axios.ts               # Axios instance, baseURL from VITE_API_BASE_URL, JWT interceptor
│   ├── auth.ts                # register() / login() → { token, user }
│   ├── lectures.ts            # GET/POST /api/lectures/lectures
│   └── reminders.ts           # Full CRUD on /api/reminders/reminders
├── components/
│   └── ProtectedRoute.tsx     # Guards routes via localStorage token
├── pages/
│   ├── Login.tsx              # /login
│   ├── Register.tsx           # /register
│   ├── Health.tsx             # / — GET /health status + version
│   ├── Reminders.tsx          # /reminders — full CRUD list
│   ├── Lectures.tsx           # /lectures — list + manual add
│   └── Pdf.tsx                # /pdf — upload & summarise
├── types.ts                   # Reminder, Lecture, Document interfaces
├── designTokens.css           # :root CSS custom properties (AURA dark palette)
└── style.css                  # Global styles
```

## Routing & Auth Guard

Routes are declared in `App.tsx`. Public routes: `/login`, `/register`. Everything else is wrapped in `ProtectedRoute`, which checks for a JWT in `localStorage.token` and redirects to `/login` when absent. A catch-all route redirects unknown paths to `/`.

| Path | Page | Guard |
|---|---|---|
| `/` | Health | ✅ Protected |
| `/reminders` | Reminders | ✅ Protected |
| `/lectures` | Lectures | ✅ Protected |
| `/pdf` | Pdf | ✅ Protected |

## Pages

| Page | What it does | Backend calls |
|---|---|---|
| **Login** | Email + password form; stores JWT in `localStorage` | `POST /api/auth/login` |
| **Register** | Name/email/password; stores JWT | `POST /api/auth/register` |
| **Health** | Shows backend status + version | `GET /health` |
| **Reminders** | List, add, toggle-complete, delete; React Query mutations invalidate the `reminders` cache | `GET/POST/PUT/DELETE /api/reminders/reminders` |
| **Lectures** | List lectures (title + audio link); manually add by title + audio URL | `GET/POST /api/lectures/lectures` |
| **Pdf** | File picker → base64 → upload → request summary | `POST /api/pdf/documents`, `POST /api/pdf/summarize` |

## Auth Flow (Token in localStorage)

1. `Login.tsx` / `Register.tsx` call the plain-axios helpers in `api/auth.ts`.
2. On success the response `{ token, user }`'s `token` is saved via `localStorage.setItem('token', ...)`, then the user is navigated to `/`.
3. Every subsequent request through the shared `api` instance picks up `Authorization: Bearer <token>` from the interceptor in `api/axios.ts`.
4. `ProtectedRoute` gates rendering on the token's mere presence (no expiry handling — the backend enforces the JWT itself).

> Note: `api/auth.ts` uses raw `axios` (no baseURL) — it relies on a Vite dev proxy or relative path config to reach the backend. If login fails with a network error, check `VITE_API_BASE_URL` in `frontend/.env` and the proxy in `vite.config.ts`.

## Data Fetching Pattern

List pages use the classic React Query pattern:

```tsx
const { data, isLoading, error } = useQuery(['reminders'], getReminders);
const createMut = useMutation(createReminder, {
  onSuccess: () => queryClient.invalidateQueries(['reminders']),
});
```

Every mutation invalidates the matching query key, so the list refetches automatically. The Pdf page is the exception: it uses a `FileReader` → base64 → two sequential `api.post` calls with local `loading` state instead of React Query, since upload + summarize is a single user-triggered sequence.

## Design Tokens

`designTokens.css` defines the shared AURA dark theme as CSS custom properties (`--aura-bg: #07070D`, `--aura-primary: #7C3AED` purple, `--aura-cyan: #22D3EE`, `--aura-error: #EF4444`, …), mirroring the palette used by the mobile design system. Pages currently style mostly with inline styles, so the tokens are available for progressive migration.

## Environment

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend, e.g. `http://localhost:4000`. Used by `api/axios.ts` as the Axios `baseURL`. |

Run it:

```bash
cd frontend
npm install
npm run dev      # Vite dev server (default http://localhost:5173)
```

Position: this dashboard is a **monitoring/companion surface**. The mobile app owns the full product experience (chat, voice, lecture recorder, wearable simulation); the dashboard is where you quickly verify backend connectivity, manage reminders/lectures from a desktop, and test PDF summarisation without touching the phone.
