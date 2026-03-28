# admin-santrigresik-crm

Internal admin UI for the **Santrigresik SaaS** platform.

This repo is a **thin admin client** — it renders the admin interface and delegates all business logic to the [`binkhozin/santrigresik-saas`](https://github.com/binkhozin/santrigresik-saas) backend. It is not a source of truth for CRM data, subscriptions, or billing.

---

## Architecture

```
[admin-santrigresik-crm]  ←→  [binkhozin/santrigresik-saas]
  Next.js 15 (App Router)         Backend API (source of truth)
  NextAuth.js (session only)      Auth, CRM, Billing, Subscriptions
  Thin UI client                  Tickets, Projects, Provisioning
```

- All business data lives in **`binkhozin/santrigresik-saas`**.
- This repo handles **session management** (NextAuth JWT) and **UI rendering** only.
- API calls go to `NEXT_PUBLIC_SAAS_API_URL` via the centralized API client at `src/lib/api-client.ts`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript / JavaScript |
| Auth | NextAuth.js 4 (Credentials + JWT) |
| UI | Bootstrap 5, React Bootstrap |
| Charts | ApexCharts, AmCharts 5 |
| State | React Context + useReducer |
| Styling | SASS, Styled Components |

---

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Random secret for NextAuth JWT signing |
| `NEXTAUTH_URL` | Full URL of this app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_SAAS_API_URL` | Base URL of `binkhozin/santrigresik-saas` API |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default admin login (local seed):
- Email: `admin@santrigresik.id`
- Password: `admin123`

> **Note**: Local Prisma/SQLite is used only for NextAuth session storage. All business data should come from `NEXT_PUBLIC_SAAS_API_URL`.

---

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/   # NextAuth handler (session only)
│   ├── (auth layout)/            # Login, signup, reset-password pages
│   └── (apps layout)/apps/       # Admin module pages
├── lib/
│   ├── api-client.ts             # Centralized API client → SaaS backend
│   └── prisma.ts                 # Prisma singleton (session storage only)
├── middleware.ts                  # Route protection (NextAuth JWT check)
└── components/                   # Shared UI components
```

---

## Admin Modules

| Module | Status | Backend Endpoint |
|---|---|---|
| Dashboard | Planned | `GET /api/admin/dashboard/summary` |
| Clients | Planned | `GET /api/admin/clients` |
| Subscriptions | Planned | `GET /api/admin/subscriptions` |
| Invoices & Payments | Planned | `GET /api/admin/invoices` |
| Tickets & Projects | Planned | `GET /api/admin/tickets` |
| Provisioning Monitor | Planned | `GET /api/admin/provisioning` |

See [`docs/MODULE_CONTRACTS.md`](docs/MODULE_CONTRACTS.md) for full endpoint contracts.

---

## Related Docs

- [`docs/SPRINT_1_PLAN.md`](docs/SPRINT_1_PLAN.md) — Sprint 1 execution plan
- [`docs/AUTH_BOUNDARY.md`](docs/AUTH_BOUNDARY.md) — Auth flow audit and boundary decisions
- [`docs/PRISMA_AUDIT.md`](docs/PRISMA_AUDIT.md) — Prisma usage audit and constraints
- [`docs/MODULE_CONTRACTS.md`](docs/MODULE_CONTRACTS.md) — Admin module endpoint contracts

---

## Related Repos

- [`binkhozin/santrigresik-saas`](https://github.com/binkhozin/santrigresik-saas) — Backend source of truth
