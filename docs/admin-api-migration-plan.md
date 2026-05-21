# Admin Frontend — API Migration Plan

> **Branch:** `integration/admin-api-migration-plan`
> **Status:** Draft
> **Last Updated:** 2026-05-21

---

## 1. Ringkasan Kondisi Saat Ini

### Arsitektur Eksisting

```
┌─────────────────────────────────────────────────────┐
│  Admin Frontend (Next.js 15 + React 19)             │
│                                                     │
│  Auth: NextAuth.js (CredentialsProvider)            │
│  DB:   Prisma ORM → SQLite (dev.db)                 │
│  API:  Next.js API Routes → prisma.* (direct DB)   │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ /api/auth/* │  │ /api/contacts│  │ /api/todo │  │
│  │ → NextAuth  │  │ → prisma.*   │  │ → prisma.*│  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│                                                     │
│  ❌ Tidak ada koneksi ke Laravel Backend            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Laravel Backend (Santrigresik_SaaS)                │
│                                                     │
│  Auth: Laravel Sanctum (Bearer token)               │
│  DB:   PostgreSQL                                   │
│  API:  /api/v1/*                                    │
│                                                     │
│  ✅ Auth, Portal, Agency, Finance, CRM endpoints    │
│  ✅ Multi-tenant (tenant.context middleware)        │
│  ✅ Role-based access (admin/staff/finance/client)  │
└─────────────────────────────────────────────────────┘
```

### Halaman yang Ada (Template Boilerplate)

| Route | Status | Data Source |
|---|---|---|
| `/dashboard` | ✅ UI ada | Prisma SQLite (dummy) |
| `/apps/todo` | ✅ UI ada | Prisma SQLite |
| `/apps/kanban` | ✅ UI ada | Prisma SQLite |
| `/apps/chat` | ✅ UI ada | Static/dummy |
| `/apps/calendar` | ✅ UI ada | Prisma SQLite |
| `/apps/blog` | ✅ UI ada | Static/dummy |
| `/apps/contact` | ✅ UI ada | Prisma SQLite |
| `/apps/invoices` | ✅ UI ada | Prisma SQLite |
| `/apps/email` | ✅ UI ada | Prisma SQLite |
| `/apps/file-manager` | ✅ UI ada | Prisma SQLite |
| `/apps/gallery` | ✅ UI ada | Static/dummy |
| `/apps/integrations` | ✅ UI ada | Static/dummy |
| `/auth/login` | ✅ NextAuth | Prisma SQLite |
| `/auth/signup` | ✅ NextAuth | Prisma SQLite |

---

## 2. Masalah Utama

### 2.1 Auth Mismatch
- **Admin FE:** NextAuth.js dengan CredentialsProvider → SQLite
- **Backend:** Laravel Sanctum dengan Bearer token → PostgreSQL
- **Akibat:** User login di admin TIDAK SAMA dengan user di backend

### 2.2 Data Layer Mismatch
- **Admin FE:** Prisma ORM → SQLite lokal (data dummy/template)
- **Backend:** Eloquent ORM → PostgreSQL (data produksi)
- **Akibat:** Data di admin TIDAK REFLEKSI data produksi

### 2.3 Model Mismatch
- **Prisma models:** User, Contact, Board, Task, Event, Invoice, Message, Email
- **Laravel models:** User, Client, Lead, Pesantren, Deal, Followup, Task, Note, Activity, Project, Ticket, Invoice, Payment, File
- **Akibat:** Fitur CRM (Leads, Pesantren, Deals, dll) TIDAK ADA di admin FE

### 2.4 API Contract Mismatch
- **Admin FE API routes:** `/api/dashboard`, `/api/contacts`, `/api/invoices`, `/api/todo`, dll
- **Backend API routes:** `/api/v1/auth/*`, `/api/v1/portal/*`, `/api/v1/agency/*`, `/api/v1/crm/*`, `/api/v1/finance/*`
- **Akibat:** Perlu mapping ulang semua data fetching

---

## 3. Strategi Migrasi

### Prinsip Utama
1. **Non-breaking:** Jangan hapus Prisma, NextAuth, atau flow login yang ada
2. **Bertahap:** Migrasi per-fitur, bukan total rewrite
3. **Parallel run:** API client baru berdampingan dengan Prisma existing
4. **Feature flag:** Gunakan env variable untuk switch antara Prisma mode dan API mode

### Arsitektur Target

```
┌──────────────────────────────────────────────────────────────┐
│  Admin Frontend (Next.js 15 + React 19)                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Legacy Layer (existing, unchanged)                     │ │
│  │  Auth: NextAuth.js → Prisma SQLite                      │ │
│  │  API:  /api/* → prisma.*                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                    ┌─────▼─────┐                             │
│                    │  Feature  │                             │
│                    │  Flag     │                             │
│                    │  USE_API  │                             │
│                    └─────┬─────┘                             │
│                          │                                   │
│  ┌───────────────────────▼─────────────────────────────────┐ │
│  │  New API Layer (non-breaking addition)                  │ │
│  │                                                         │ │
│  │  src/lib/api/                                           │ │
│  │  ├── client.ts      ← Axios instance + interceptors     │ │
│  │  ├── auth.ts        ← login, logout, getMe              │ │
│  │  ├── types.ts       ← TypeScript interfaces             │ │
│  │  └── services/                                          │ │
│  │      ├── crm.ts      ← leads, pesantren, deals          │ │
│  │      ├── projects.ts ← projects, files                  │ │
│  │      ├── finance.ts  ← invoices, payments               │ │
│  │      └── portal.ts   ← dashboard, tickets               │ │
│  │                                                         │ │
│  │  src/hooks/                                             │ │
│  │  └── useApiAuth.ts  ← API auth hook (parallel)          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│                    ┌─────────────┐                           │
│                    │  Laravel    │                           │
│                    │  Backend    │                           │
│                    │  /api/v1/*  │                           │
│                    └─────────────┘                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Daftar File/Folder yang Terdampak

### 4.1 File Baru (Non-Breaking)

| File | Tujuan |
|---|---|
| `src/lib/api/client.ts` | Axios instance + interceptors |
| `src/lib/api/auth.ts` | Auth service (login, logout, me) |
| `src/lib/api/types.ts` | TypeScript interfaces untuk API response |
| `src/lib/api/services/crm.ts` | CRM service (leads, pesantren, deals, followups, tasks, notes) |
| `src/lib/api/services/projects.ts` | Project service |
| `src/lib/api/services/finance.ts` | Finance service (invoices, payments) |
| `src/lib/api/services/portal.ts` | Portal service (dashboard, tickets) |
| `src/hooks/useApiAuth.ts` | Auth hook untuk API mode |

### 4.2 File yang Akan Dimodifikasi (Fase Selanjutnya)

| File | Perubahan |
|---|---|
| `src/app/api/auth/[...nextauth]/route.ts` | Tambahkan Sanctum credential check (opsional) |
| `src/app/(auth layout)/auth/login/*` | Tambahkan API login sebagai opsi |
| `src/app/(apps layout)/dashboard/page.tsx` | Fetch dari API (setelah API ready) |
| `src/app/(apps layout)/apps/contact/*` | Fetch dari `/api/v1/crm/leads` |
| `src/app/(apps layout)/apps/invoices/*` | Fetch dari `/api/v1/finance/invoices` |
| `src/middleware.ts` | Tambahkan API token validation (setelah auth switch) |

### 4.3 File yang TIDAK Berubah (Legacy)

| File | Alasan |
|---|---|
| `prisma/schema.prisma` | Tetap ada untuk backward compatibility |
| `prisma/seed.ts` | Tetap ada |
| `src/lib/prisma.ts` | Tetap ada |
| `src/app/api/todo/*` | Legacy, tidak dihapus |
| `src/app/api/chat/*` | Legacy, tidak dihapus |
| `src/app/api/calendar/*` | Legacy, tidak dihapus |
| `src/app/api/email/*` | Legacy, tidak dihapus |
| `src/app/api/file-manager/*` | Legacy, tidak dihapus |
| Semua UI components | Tidak berubah, hanya data source yang berubah |

---

## 5. Rancangan ENV

### 5.1 Environment Variables

```env
# ============================================
# API MODE
# ============================================
# Set to "true" to enable API mode (fetch from Laravel backend)
# Set to "false" or unset to use legacy Prisma mode
NEXT_PUBLIC_USE_API=false

# Laravel Backend API Base URL
NEXT_PUBLIC_API_BASE_URL=https://crm1.santrigresik.me/api/v1

# This App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# LEGACY (existing, keep unchanged)
# ============================================
# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Prisma SQLite
DATABASE_URL="file:./dev.db"
```

### 5.2 Switching Strategy

```typescript
// Feature flag check
const useApi = process.env.NEXT_PUBLIC_USE_API === 'true';

if (useApi) {
  // Fetch from Laravel backend
  const data = await apiService.getLeads();
} else {
  // Fetch from Prisma SQLite (legacy)
  const data = await prisma.lead.findMany();
}
```

---

## 6. Rancangan API Client Layer

### 6.1 Struktur

```
src/lib/api/
├── client.ts          ← Axios instance + interceptors
├── auth.ts            ← Auth service
├── types.ts           ← Shared TypeScript types
└── services/
    ├── crm.ts         ← CRM: leads, pesantren, deals, followups, tasks, notes, activities
    ├── projects.ts    ← Agency: projects, files
    ├── finance.ts     ← Finance: invoices, payments
    └── portal.ts      ← Portal: dashboard, tickets
```

### 6.2 API Client (`client.ts`)

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 6.3 Auth Service (`auth.ts`)

```typescript
import apiClient from './client';
import type { AuthUser, LoginResponse } from './types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
      device_name: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : 'Unknown',
    });
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<{ data: AuthUser }>('/me');
    return data.data;
  },
};
```

### 6.4 Types (`types.ts`)

```typescript
// Auth
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'agency_admin' | 'agency_staff' | 'agency_finance' | 'client_user';
  client_id: number | null;
  is_agency: boolean;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user: AuthUser;
}

// Pagination
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SingleResponse<T> {
  data: T;
}

// CRM
export interface Lead {
  id: number;
  name: string;
  institution_name: string;
  institution_type: 'Pesantren' | 'Madrasah' | 'Sekolah Islam' | 'Lembaga Islam';
  city: string;
  province: string;
  contact_person: string;
  phone: string;
  email: string;
  source: 'Website' | 'Referral' | 'WhatsApp' | 'Event';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

export interface Pesantren {
  id: number;
  name: string;
  institution_type: string;
  city: string;
  province: string;
  contact_person: string;
  phone: string;
  email: string;
  website: string | null;
  services_used: string[];
  status: 'Prospect' | 'Active Client' | 'Inactive';
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: number;
  name: string;
  pesantren_id: number;
  estimated_value: number;
  stage: 'Lead' | 'Discovery' | 'Demo' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  owner: number;
  expected_close_date: string | null;
  source_lead_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Followup {
  id: number;
  lead_id: number;
  date: string;
  time: string;
  type: 'Call' | 'WhatsApp' | 'Meeting' | 'Email';
  notes: string;
  status: 'Scheduled' | 'Completed' | 'Missed';
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

export interface CrmTask {
  id: number;
  title: string;
  description: string | null;
  assigned_to: number | null;
  related_to: string | null;
  related_type: 'Lead' | 'Pesantren' | 'Deal' | null;
  due_date: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  entity_id: number;
  entity_type: 'Lead' | 'Deal' | 'Pesantren';
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  // Activity fields from backend
  created_at: string;
  updated_at: string;
}

// Projects
export interface Project {
  id: number;
  client_id: number;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string | null;
  due_date: string | null;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: number;
  project_id: number;
  name: string;
  drive_url: string;
  created_at: string;
}

// Finance
export interface Invoice {
  id: number;
  client_id: number;
  project_id: number | null;
  issue_date: string;
  due_date: string;
  currency: string;
  tax_amount: number;
  status: string;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  description: string;
  qty: number;
  unit_price: number;
  line_total: number;
  position: number;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  paid_at: string;
  method: string | null;
  proof_drive_url: string | null;
  notes: string | null;
  created_at: string;
}

// Portal / Tickets
export interface Ticket {
  id: number;
  client_id: number;
  project_id: number | null;
  ticket_no: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  message: string;
  is_internal_note: boolean;
  created_at: string;
  author: {
    id: number;
    name: string;
    role: string;
  };
}

// Dashboard
export interface DashboardData {
  projects: { total: number; active: number };
  tickets: { open: number; closed: number };
  invoices: { unpaid: number; paid: number };
}
```

---

## 7. Rancangan Auth Flow Baru

### 7.1 Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User visits /auth/login                                    │
│                          │                                  │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Login Form                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │ Email       │  │ Password    │  │ Login Button │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  POST /api/v1/auth/login                              │  │
│  │  { email, password, device_name }                     │  │
│  │                                                       │  │
│  │  Response: { token, token_type, user }                │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Store:                                               │  │
│  │  localStorage.setItem('auth_token', token)            │  │
│  │  localStorage.setItem('auth_user', JSON.stringify(u)) │  │
│  └───────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  Redirect to /dashboard                                     │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Auth State Management

```typescript
// src/hooks/useApiAuth.ts
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/api/auth';
import type { AuthUser } from '@/lib/api/types';

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const ApiAuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function ApiAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService.getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <ApiAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </ApiAuthContext.Provider>
  );
}

export const useApiAuth = () => useContext(ApiAuthContext);
```

### 7.3 Logout Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User clicks Logout                                         │
│                          │                                  │
│                          ▼                                  │
│  POST /api/v1/auth/logout                                   │
│                          │                                  │
│                          ▼                                  │
│  Clear localStorage:                                        │
│  - removeItem('auth_token')                                 │
│  - removeItem('auth_user')                                  │
│                          │                                  │
│                          ▼                                  │
│  Redirect to /auth/login                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Mapping Halaman Admin ke Endpoint Backend

### 8.1 Dashboard

| Halaman | Endpoint | Method | Data |
|---|---|---|---|
| `/dashboard` | `/portal/dashboard` | GET | Stats overview |
| | `/crm/reports/summary` | GET | CRM summary |
| | `/crm/reports/performance` | GET | Performance metrics |

### 8.2 CRM — Leads

| Halaman | Endpoint | Method | Catatan |
|---|---|---|---|
| `/apps/crm/leads` (baru) | `/crm/leads` | GET | List dengan filter |
| | `/crm/leads` | POST | Create |
| | `/crm/leads/{id}` | GET | Detail |
| | `/crm/leads/{id}` | PUT | Update |
| | `/crm/leads/{id}` | DELETE | Delete |
| | `/crm/leads/{id}/convert` | POST | Convert to deal |

### 8.3 CRM — Pesantren

| Halaman | Endpoint | Method |
|---|---|---|
| `/apps/crm/pesantren` (baru) | `/crm/pesantren` | GET, POST |
| | `/crm/pesantren/{id}` | GET, PUT, DELETE |

### 8.4 CRM — Deals

| Halaman | Endpoint | Method |
|---|---|---|
| `/apps/crm/deals` (baru) | `/crm/deals` | GET, POST |
| | `/crm/deals/{id}` | GET, PUT, DELETE |
| | `/crm/deals/{id}/stage` | PATCH |

### 8.5 CRM — Follow-ups

| Halaman | Endpoint | Method |
|---|---|---|
| `/apps/crm/followups` (baru) | `/crm/followups` | GET, POST |
| | `/crm/followups/{id}` | GET, PUT, DELETE |
| | `/crm/followups/{id}/status` | PATCH |

### 8.6 CRM — Tasks

| Halaman | Endpoint | Method |
|---|---|---|
| `/apps/crm/tasks` (baru) | `/crm/tasks` | GET, POST |
| | `/crm/tasks/{id}` | GET, PUT, DELETE |
| | `/crm/tasks/{id}/status` | PATCH |

### 8.7 CRM — Notes

| Halaman | Endpoint | Method |
|---|---|---|
| (embedded di detail) | `/crm/notes` | GET, POST |
| | `/crm/notes/{id}` | GET, PUT, DELETE |

### 8.8 CRM — Activities

| Halaman | Endpoint | Method |
|---|---|---|
| (embedded di detail) | `/crm/activities` | GET, POST |
| | `/crm/{entity}/{id}/activities` | GET |

### 8.9 Projects

| Halaman | Endpoint | Method |
|---|---|---|
| `/apps/projects` (baru) | `/agency/projects` | GET, POST |
| `/apps/projects/{id}` | `/agency/projects/{id}` | GET |
| | `/agency/projects/{id}/files` | GET |
| | `/agency/projects/{id}/updates` | POST |
| | `/agency/files` | POST |

### 8.10 Finance — Invoices

| Halaman | Endpoint | Method |
|---|---|---|
| `/apps/invoices` | `/finance/invoices` | GET, POST |
| | `/finance/invoices/{id}` | PATCH |
| | `/finance/invoices/{id}/send` | POST |
| | `/finance/payments/{id}/confirm` | POST |

### 8.11 Portal — Tickets

| Halaman | Endpoint | Method |
|---|---|---|
| `/apps/tickets` (baru) | `/portal/tickets` | GET, POST |
| `/apps/tickets/{id}` | `/portal/tickets/{id}` | GET |
| | `/portal/tickets/{id}/messages` | POST |

### 8.12 Reports

| Halaman | Endpoint | Method |
|---|---|---|
| `/apps/reports` (baru) | `/crm/reports/summary` | GET |
| | `/crm/reports/performance` | GET |

### 8.13 Team Users

| Halaman | Endpoint | Method |
|---|---|---|
| `/apps/team` (baru) | `/crm/users` | GET |
| | `/crm/users/{id}` | GET |

---

## 9. Urutan Pengerjaan Bertahap

### Fase 1: Foundation (Non-Breaking) ✅
- [x] Buat dokumen migration plan ini
- [ ] Buat `src/lib/api/client.ts` — Axios instance
- [ ] Buat `src/lib/api/auth.ts` — Auth service
- [ ] Buat `src/lib/api/types.ts` — TypeScript interfaces
- [ ] Buat `src/hooks/useApiAuth.ts` — API auth hook
- [ ] Tambahkan env variables ke `.env.example`
- [ ] Pastikan lint/typecheck pass

### Fase 2: Auth Integration
- [ ] Buat halaman login baru dengan API auth (`/auth/login/api`)
- [ ] Implement token storage & validation
- [ ] Implement logout flow
- [ ] Test login → dashboard flow

### Fase 3: Dashboard Migration
- [ ] Migrasi `/dashboard` ke fetch dari API
- [ ] Implement loading states
- [ ] Implement error handling

### Fase 4: CRM Features
- [ ] Buat halaman Leads (list, create, detail, convert)
- [ ] Buat halaman Pesantren
- [ ] Buat halaman Deals (pipeline view)
- [ ] Buat halaman Follow-ups
- [ ] Buat halaman Tasks
- [ ] Buat halaman Notes & Activities (embedded)

### Fase 5: Projects & Files
- [ ] Buat halaman Projects
- [ ] Buat halaman Project Detail
- [ ] Implement file upload

### Fase 6: Finance
- [ ] Migrasi halaman Invoices ke API
- [ ] Implement payment confirmation

### Fase 7: Portal & Tickets
- [ ] Buat halaman Tickets
- [ ] Buat halaman Ticket Detail dengan messages

### Fase 8: Reports & Team
- [ ] Buat halaman Reports
- [ ] Buat halaman Team Users

### Fase 9: Cleanup
- [ ] Hapus Prisma (setelah semua fitur migrated)
- [ ] Hapus NextAuth (setelah auth fully migrated)
- [ ] Hapus legacy API routes
- [ ] Update middleware
- [ ] Final testing

---

## 10. Risiko dan Mitigasi

| Risiko | Level | Dampak | Mitigasi |
|---|---|---|---|
| Auth migration gagal | 🔴 Tinggi | User tidak bisa login | Keep NextAuth sebagai fallback, feature flag |
| API endpoint berubah | 🟡 Sedang | Data tidak muncul | Versioning di backend, docs sync |
| CORS error | 🟡 Sedang | Request blocked | Pastikan `CORS_ALLOWED_ORIGINS` include admin domain |
| Token expiry handling | 🟡 Sedang | Session hilang | Implement auto-logout + redirect |
| Data type mismatch | 🟡 Sedang | UI error | Strict TypeScript types, validation |
| Performance degradation | 🟢 Rendah | Loading lambat | Implement caching, pagination |
| Prisma & API conflict | 🟢 Rendah | Data inconsistency | Feature flag, gradual migration |
| Role/permission mismatch | 🔴 Tinggi | Akses tidak sesuai | Mapping role FE → BE, test semua role |

---

## 11. Catatan Penting

1. **JANGAN hapus Prisma** sampai semua fitur fully migrated
2. **JANGAN hapus NextAuth** sampai API auth fully tested
3. **JANGAN ubah flow login** di Fase 1
4. **Selalu test** dengan `NEXT_PUBLIC_USE_API=false` (legacy mode) sebelum switch
5. **Coordinate dengan backend team** untuk memastikan API contract stabil
6. **Update dokumen ini** setiap kali ada perubahan rencana
