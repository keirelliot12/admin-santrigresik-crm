# Prisma Usage Audit — admin-santrigresik-crm

This document audits all Prisma models in `prisma/schema.prisma` and categorises each one against the rule:

> **Business source of truth stays in `binkhozin/santrigresik-saas`.**
> This repo's Prisma database is for NextAuth session management only.

---

## Model Classification

### ✅ Auth-only — keep in this repo

These models are required by NextAuth.js for session storage and credential verification. They store no business data.

| Model | Purpose | Keep? |
|---|---|---|
| `User` | Admin operator credential store (email + hashed password + role) | ✅ Keep (auth only) |
| `Account` | OAuth provider account linking (reserved, currently unused) | ✅ Keep |
| `Session` | NextAuth DB session rows (unused with JWT strategy — see note) | ✅ Keep (required by adapter) |
| `VerificationToken` | Email verification tokens for NextAuth | ✅ Keep |

> **Note on `Session` model**: The current auth strategy is `"jwt"`, which means NextAuth does not write session rows to the DB. The `Session` table exists because the `PrismaAdapter` schema requires it, but it will remain empty. See `docs/AUTH_BOUNDARY.md` Issue 2 for the recommendation to remove the redundant adapter reference.

---

### ❌ Business data — must NOT be maintained here

These models hold CRM, billing, or operational business data. They duplicate concerns that belong exclusively in `binkhozin/santrigresik-saas`.

| Model | Business concern | Action |
|---|---|---|
| `Contact` | CRM — clients, leads | ❌ Remove — fetch from SaaS backend via `apiGet("/admin/clients")` |
| `Board` | Project / Kanban management | ❌ Remove — fetch from SaaS backend |
| `Task` | Todo / task management | ❌ Remove — fetch from SaaS backend |
| `Event` | Calendar events | ❌ Remove — fetch from SaaS backend |
| `Invoice` | Billing — invoices | ❌ Remove — fetch from SaaS backend via `apiGet("/admin/invoices")` |
| `InvoiceItem` | Billing — invoice line items | ❌ Remove — part of Invoice on backend |
| `FileNode` | File / folder hierarchy | ❌ Remove — fetch from SaaS backend |
| `Message` | Chat messages | ❌ Remove — fetch from SaaS backend |
| `Email` | Email store | ❌ Remove — fetch from SaaS backend |

---

## Risk Assessment

| Risk | Severity | Status |
|---|---|---|
| Business data diverges between SQLite and SaaS backend | High | ⚠️ Active risk — local models still exist |
| Admin performs writes to local DB instead of backend | High | ⚠️ Active risk — API routes use `prisma.*` directly |
| New features are added to local models instead of calling backend | Medium | ⚠️ Risk — no guard against this yet |
| Auth-only models are incorrectly extended with business fields | Low | Monitor |

---

## Current Prisma Usage in API Routes

The following local API routes use Prisma to query business models directly. These routes bypass the SaaS backend and must be migrated:

| Route | Prisma Model Used | Migration Target |
|---|---|---|
| `src/app/api/contacts/route.ts` | `Contact` | `GET/POST /admin/clients` on SaaS backend |
| `src/app/api/contacts/[id]/route.ts` | `Contact` | `PUT/DELETE /admin/clients/:id` on SaaS backend |
| `src/app/api/invoices/route.ts` | `Invoice`, `InvoiceItem` | `GET/POST /admin/invoices` on SaaS backend |
| `src/app/api/kanban/route.ts` | `Board`, `Task` | `GET/POST /admin/tickets` on SaaS backend |
| `src/app/api/todo/route.ts` | `Task` | `GET/POST /admin/tasks` on SaaS backend |
| `src/app/api/calendar/route.ts` | `Event` | `GET/POST /admin/events` on SaaS backend |
| `src/app/api/chat/route.ts` | `Message` | `GET/POST /admin/messages` on SaaS backend |
| `src/app/api/email/route.ts` | `Email` | `GET/POST /admin/emails` on SaaS backend |
| `src/app/api/files/route.ts` | `FileNode` | `GET/POST /admin/files` on SaaS backend |
| `src/app/api/dashboard/route.ts` | `Contact`, `Invoice`, `Task` | `GET /admin/dashboard/summary` on SaaS backend |

---

## Recommended Migration Path

### Phase A — Freeze business models (Sprint 1)

- Do not add new fields or models to `prisma/schema.prisma` outside of the auth group.
- Add a comment block to `prisma/schema.prisma` clearly marking which models are auth-only.
- Do not create new local API routes that use `prisma.*` for business data.

### Phase B — Proxy routes via API client (Sprint 2)

Replace each local API route body with a proxy call through `src/lib/api-client.ts`:

```typescript
// Before (local Prisma query)
const contacts = await prisma.contact.findMany();

// After (proxied to SaaS backend)
const result = await apiGet<Contact[]>("/admin/clients", token);
```

### Phase C — Remove business models (Sprint 3)

Once all routes are proxied:
1. Drop business model tables via a Prisma migration.
2. Remove `Contact`, `Board`, `Task`, `Event`, `Invoice`, `InvoiceItem`, `FileNode`, `Message`, `Email` from `schema.prisma`.
3. Keep only: `User`, `Account`, `Session`, `VerificationToken`.

---

## Constraint Rules (enforce from Sprint 1)

1. `prisma.*` may only be used in `src/app/api/auth/**` and `src/lib/prisma.ts`.
2. All other API routes must use `src/lib/api-client.ts` to talk to the SaaS backend.
3. New Prisma models require explicit sign-off that they are auth-infrastructure only.

---

## Related Files

- `prisma/schema.prisma` — full schema (audit target)
- `src/lib/prisma.ts` — Prisma singleton
- `src/lib/api-client.ts` — centralized API client (use instead of Prisma for business data)
- `docs/AUTH_BOUNDARY.md` — auth boundary decisions
