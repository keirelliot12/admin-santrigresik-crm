# Admin Module Contracts — admin-santrigresik-crm

This document defines the minimum endpoint contract between this admin UI and the `binkhozin/santrigresik-saas` backend for each admin module.

All requests use the centralized API client (`src/lib/api-client.ts`).
Base URL is read from `NEXT_PUBLIC_SAAS_API_URL`.

---

## Authentication header

Every protected endpoint requires:

```
Authorization: Bearer <jwt_from_nextauth_session>
```

---

## 1. Dashboard

**Page**: `/apps/dashboard`

**Purpose**: Summary metrics for the admin operator — no business writes.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/dashboard/summary` | Aggregated metrics |

### `GET /admin/dashboard/summary` — response shape

```json
{
  "totalClients": 0,
  "activeSubscriptions": 0,
  "openTickets": 0,
  "pendingInvoices": 0,
  "revenueThisMonth": 0,
  "provisioningAlerts": 0
}
```

---

## 2. Clients

**Page**: `/apps/clients`

**Purpose**: View and manage business clients (tenants registered in the SaaS).

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/clients` | List all clients (paginated) |
| `GET` | `/admin/clients/:id` | Get single client detail |
| `POST` | `/admin/clients` | Create new client |
| `PUT` | `/admin/clients/:id` | Update client |
| `DELETE` | `/admin/clients/:id` | Soft-delete client |

### `GET /admin/clients` — query params

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Page size (default: 20) |
| `search` | string | Filter by name/email |
| `status` | string | `ACTIVE` \| `INACTIVE` \| `SUSPENDED` |

### `GET /admin/clients` — response shape

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "company": "string",
      "status": "ACTIVE",
      "createdAt": "ISO8601"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

---

## 3. Subscriptions

**Page**: `/apps/subscriptions`

**Purpose**: View and manage client subscription plans.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/subscriptions` | List all subscriptions (paginated) |
| `GET` | `/admin/subscriptions/:id` | Get single subscription |
| `POST` | `/admin/subscriptions` | Create subscription for a client |
| `PUT` | `/admin/subscriptions/:id` | Update / upgrade / downgrade |
| `DELETE` | `/admin/subscriptions/:id` | Cancel subscription |

### `GET /admin/subscriptions` — query params

| Param | Type | Description |
|---|---|---|
| `clientId` | string | Filter by client |
| `status` | string | `ACTIVE` \| `TRIAL` \| `CANCELLED` \| `EXPIRED` |
| `page` | number | Page number |
| `limit` | number | Page size |

### `GET /admin/subscriptions` — response shape

```json
{
  "data": [
    {
      "id": "string",
      "clientId": "string",
      "clientName": "string",
      "plan": "STARTER | PRO | ENTERPRISE",
      "status": "ACTIVE",
      "startDate": "ISO8601",
      "endDate": "ISO8601",
      "amount": 0,
      "currency": "IDR"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

---

## 4. Invoices & Payments

**Page**: `/apps/invoice`

**Purpose**: View invoices and payment status.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/invoices` | List invoices (paginated) |
| `GET` | `/admin/invoices/:id` | Get single invoice with line items |
| `POST` | `/admin/invoices` | Create invoice |
| `PUT` | `/admin/invoices/:id` | Update invoice |
| `POST` | `/admin/invoices/:id/mark-paid` | Mark invoice as paid |
| `GET` | `/admin/payments` | List payment records |

### `GET /admin/invoices` — query params

| Param | Type | Description |
|---|---|---|
| `clientId` | string | Filter by client |
| `status` | string | `DRAFT` \| `SENT` \| `PAID` \| `OVERDUE` |
| `page` | number | Page number |
| `limit` | number | Page size |

### `GET /admin/invoices` — response shape

```json
{
  "data": [
    {
      "id": "string",
      "invoiceNumber": "INV-001",
      "clientId": "string",
      "clientName": "string",
      "status": "DRAFT",
      "amount": 0,
      "currency": "IDR",
      "date": "ISO8601",
      "dueDate": "ISO8601"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

---

## 5. Tickets & Projects

**Page**: `/apps/tickets`

**Purpose**: View and manage support tickets and client project boards.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/tickets` | List tickets (paginated) |
| `GET` | `/admin/tickets/:id` | Get single ticket |
| `POST` | `/admin/tickets` | Create ticket |
| `PUT` | `/admin/tickets/:id` | Update ticket / change status |
| `GET` | `/admin/projects` | List projects (paginated) |
| `GET` | `/admin/projects/:id` | Get single project |
| `POST` | `/admin/projects` | Create project |
| `PUT` | `/admin/projects/:id` | Update project |

### `GET /admin/tickets` — query params

| Param | Type | Description |
|---|---|---|
| `clientId` | string | Filter by client |
| `status` | string | `OPEN` \| `IN_PROGRESS` \| `RESOLVED` \| `CLOSED` |
| `priority` | string | `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` |
| `page` | number | Page number |
| `limit` | number | Page size |

### `GET /admin/tickets` — response shape

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "clientId": "string",
      "clientName": "string",
      "status": "OPEN",
      "priority": "MEDIUM",
      "assigneeId": "string",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

---

## 6. Provisioning Monitor

**Page**: `/apps/provisioning`

**Purpose**: Read-only view of infrastructure provisioning status per client.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/admin/provisioning` | List provisioning records |
| `GET` | `/admin/provisioning/:clientId` | Get provisioning status for one client |
| `POST` | `/admin/provisioning/:clientId/retry` | Retry failed provisioning |

### `GET /admin/provisioning` — query params

| Param | Type | Description |
|---|---|---|
| `status` | string | `PENDING` \| `RUNNING` \| `DONE` \| `FAILED` |
| `page` | number | Page number |
| `limit` | number | Page size |

### `GET /admin/provisioning` — response shape

```json
{
  "data": [
    {
      "id": "string",
      "clientId": "string",
      "clientName": "string",
      "status": "DONE",
      "lastRun": "ISO8601",
      "errorMessage": null
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

---

## Error response format

All endpoints return errors in a consistent shape:

```json
{
  "message": "Human-readable error description",
  "code": "MACHINE_READABLE_CODE"
}
```

HTTP status codes used:

| Code | Meaning |
|---|---|
| `400` | Validation error / bad request |
| `401` | Unauthenticated — trigger `signOut()` in UI |
| `403` | Forbidden — insufficient role |
| `404` | Resource not found |
| `422` | Unprocessable entity |
| `500` | Server error |

---

## Frontend usage example

```typescript
import { apiGet } from "@/lib/api-client";
import { useSession } from "next-auth/react";

export function useClients() {
  const { data: session } = useSession();

  async function fetchClients() {
    // TODO: replace session.user.backendToken with actual backend JWT
    // once Sprint 2 auth integration is complete.
    const result = await apiGet<ClientListResponse>(
      "/admin/clients",
      session?.user?.backendToken
    );

    if (!result.ok) {
      if (result.error.status === 401) {
        // Session expired — signOut() or redirect
      }
      throw new Error(result.error.message);
    }

    return result.data;
  }

  return { fetchClients };
}
```

---

## Related Files

- `src/lib/api-client.ts` — centralized API client
- `docs/AUTH_BOUNDARY.md` — auth and session token decisions
- `docs/PRISMA_AUDIT.md` — why business data must not live in local Prisma
- `docs/SPRINT_1_PLAN.md` — overall Sprint 1 execution plan
