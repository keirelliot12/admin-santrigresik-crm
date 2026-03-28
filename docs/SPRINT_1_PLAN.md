# Sprint 1 Plan — keirelliot12/admin-santrigresik-crm

This document turns the approved Sprint 1 plan into repo-scoped execution work for the admin CRM frontend.

## Repo role
- Internal admin UI for the Santrigresik SaaS backend
- Thin client for CRM, billing, subscriptions, tickets, projects, and provisioning monitoring
- Not a source of truth for business state

## Sprint 1 goal
Make this frontend ready to consume the SaaS backend cleanly, with clear auth boundaries and a stable API client layer.

## Must-have scope
1. Replace the template README with repo-specific documentation
2. Audit existing frontend auth flow
3. Define a centralized API client layer to the SaaS backend
4. Audit and constrain Prisma usage so business truth stays in the backend
5. Define the minimum admin modules and endpoint needs for later implementation

## Recommended implementation order
### Phase 1 — Repo hygiene
- Replace template README
- Document repo purpose, setup, required env vars, and backend dependency

### Phase 2 — Auth and API boundary audit
- Audit current NextAuth / auth flow
- Decide what belongs in frontend session handling vs backend business logic
- Define unauthorized and session-expiry handling

### Phase 3 — API client standardization
- Add centralized API client / fetcher strategy
- Standardize base API URL configuration
- Standardize error handling and auth failure handling

### Phase 4 — Boundary hardening
- Audit Prisma usage
- Keep Prisma from becoming a business source of truth if it is currently drifting that way
- Keep this repo as a thin UI client over the backend

### Phase 5 — Module planning
- Define the minimum module contract for:
  - dashboard
  - clients
  - subscriptions
  - invoices/payments
  - tickets/projects
  - provisioning monitor

## Acceptance criteria
- README is repo-specific and no longer a template
- The frontend has a documented auth and API boundary
- A centralized API client strategy exists
- The repo is positioned as a thin admin client over `binkhozin/santrigresik-saas`

## Out of scope for this PR
- Full dashboard implementation
- Full CRUD implementation for all modules
- Production polish

## Related repo
- `binkhozin/santrigresik-saas` remains the source of truth for auth, CRM, subscriptions, and access

## Execution note for agent
Prefer small, reviewable commits. Start with repo hygiene, auth boundary audit, and API client standardization before broad UI work.
