# Auth Flow Audit — admin-santrigresik-crm

This document audits the current authentication implementation and defines the boundary between frontend session handling and backend business logic.

---

## Current Auth Implementation

### Provider

- **Type**: Credentials (email + password)
- **Library**: NextAuth.js 4 (`next-auth`)
- **Session strategy**: JWT (stateless — no DB session row per request)
- **Adapter**: `@auth/prisma-adapter` connected to a local SQLite database

### Flow

```
[Login page]
  → POST /api/auth/callback/credentials (email, password)
      → NextAuth credentials authorize()
          → prisma.user.findUnique({ where: { email } })
          → bcrypt.compare(password, user.password)
      → JWT token minted (payload: { id, role })
  → Encrypted JWT stored in httpOnly cookie (next-auth.session-token)

[Subsequent requests]
  → middleware.ts reads JWT via getToken()
  → Protected routes redirect to /auth/login if no valid token
  → API routes call getServerSession(authOptions) to verify session
```

### Session payload

```typescript
session.user = {
  id:    string,   // user.id from DB
  role:  string,   // "ADMIN" | "USER"
  email: string,   // user.email
  name:  string,   // user.name
}
```

---

## Auth Boundary Decisions

### What stays in this repo (frontend)

| Concern | Decision |
|---|---|
| Session cookie management | ✅ NextAuth JWT — stays here |
| Login / logout pages | ✅ Stays here |
| Route protection (middleware) | ✅ Stays here — JWT check via `getToken()` |
| Role check for UI rendering | ✅ Stays here — read from JWT, not DB |
| User profile display | ✅ Stays here — pulled from session JWT |
| Admin user CRUD | ❌ Delegate to `binkhozin/santrigresik-saas` |

### What must not live in this repo

| Concern | Reason |
|---|---|
| Storing business users | Business users belong in backend — only admin operators log into this app |
| Password reset flows for customers | Customer auth is handled by the SaaS backend |
| Role permission enforcement | Backend enforces; frontend only hides UI elements |
| Multi-tenant auth state | Backend concern — this app is single-tenant (admin only) |

---

## Issues Identified

### Issue 1 — Local user store is a risk

**Finding**: `prisma.user` stores admin credentials locally in SQLite. If the SaaS backend also has user management, these two user stores can diverge.

**Recommendation**: Admin credentials should ultimately be delegated to the SaaS backend. This app should exchange credentials with the backend and receive a JWT back, rather than verifying passwords against a local DB.

**Interim mitigation**: Keep local credentials for now, but add a clear `TODO` and do not add new user management features to this repo.

### Issue 2 — PrismaAdapter with JWT strategy is redundant

**Finding**: The `PrismaAdapter` is set in `authOptions` but the session strategy is `"jwt"`. In JWT mode, NextAuth does not write sessions to the database via the adapter. The adapter is only needed for database session strategy or OAuth provider account linking.

**Recommendation**: Remove the `PrismaAdapter` reference from `authOptions` to reduce confusion. The local `prisma.user` lookup in `authorize()` is still needed for credential verification, but the adapter itself adds no value with the current JWT-only, credentials-only setup.

### Issue 3 — No session expiry handling in the UI

**Finding**: The middleware redirects to `/auth/login` on missing token, but there is no handling for expired sessions (401 responses from API calls made mid-session).

**Recommendation**: The centralized API client (`src/lib/api-client.ts`) should detect `401` responses and trigger a `signOut()` redirect.

### Issue 4 — `NEXTAUTH_SECRET` is not enforced

**Finding**: There is no `.env.example` file documenting required env vars. A missing `NEXTAUTH_SECRET` causes NextAuth to fall back to an insecure default in development.

**Recommendation**: Add `.env.example` with `NEXTAUTH_SECRET` as a required variable.

---

## Target Auth Architecture (Sprint 1 → Sprint 2)

```
[Sprint 1 — current]
  Admin logs in with local credentials (prisma.user)
  NextAuth mints JWT
  Frontend uses JWT for session

[Sprint 2 — target]
  Admin logs in via POST /api/admin/auth/login on SaaS backend
  SaaS backend returns signed JWT
  NextAuth wraps the backend JWT in its own session cookie
  Local prisma.user is deprecated / removed
```

---

## Protected Route Matrix

| Path Pattern | Protection | Redirect on fail |
|---|---|---|
| `/dashboard/*` | JWT required | `/auth/login` |
| `/chat/*` | JWT required | `/auth/login` |
| `/calendar/*` | JWT required | `/auth/login` |
| `/email/*` | JWT required | `/auth/login` |
| `/kanban/*` | JWT required | `/auth/login` |
| `/contact/*` | JWT required | `/auth/login` |
| `/file-manager/*` | JWT required | `/auth/login` |
| `/auth/*` | Redirect if already authenticated | `/dashboard` |
| `/` | Public | — |

---

## Related Files

- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth config and credentials authorize
- `src/middleware.ts` — Route protection via `getToken()`
- `src/components/AuthProvider/index.jsx` — `SessionProvider` wrapper
- `prisma/schema.prisma` — Local User model (auth only)
- `prisma/seed.ts` — Default admin seed credentials
