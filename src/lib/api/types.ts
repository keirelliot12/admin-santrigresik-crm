/**
 * TypeScript Types — Laravel API Responses
 *
 * Type definitions that match the Laravel Sanctum API response format.
 * Based on the API contract docs in Santrigresik_SaaS.
 *
 * Response format:
 *   - List: { "data": T[], "meta": PaginationMeta }
 *   - Single: { "data": T }
 *
 * @see docs/admin-api-migration-plan.md
 * @see Santrigresik_SaaS/docs/crm-api-contract.md
 */

// ============================================================
// Auth & User
// ============================================================

export type UserRole =
  | 'agency_admin'
  | 'agency_staff'
  | 'agency_finance'
  | 'client_user';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  client_id: number | null;
  is_agency: boolean;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user: AuthUser;
}

// ============================================================
// Pagination
// ============================================================

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

// ============================================================
// CRM — Leads
// ============================================================

export type InstitutionType =
  | 'Pesantren'
  | 'Madrasah'
  | 'Sekolah Islam'
  | 'Lembaga Islam';

export type LeadSource = 'Website' | 'Referral' | 'WhatsApp' | 'Event';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export interface Lead {
  id: number;
  name: string;
  institution_name: string;
  institution_type: InstitutionType;
  city: string;
  province: string;
  contact_person: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CRM — Pesantren
// ============================================================

export type PesantrenStatus = 'Prospect' | 'Active Client' | 'Inactive';

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
  status: PesantrenStatus;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CRM — Deals
// ============================================================

export type DealStage =
  | 'Lead'
  | 'Discovery'
  | 'Demo'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export interface Deal {
  id: number;
  name: string;
  pesantren_id: number;
  estimated_value: number;
  stage: DealStage;
  owner: number;
  expected_close_date: string | null;
  source_lead_id: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CRM — Follow-ups
// ============================================================

export type FollowupType = 'Call' | 'WhatsApp' | 'Meeting' | 'Email';
export type FollowupStatus = 'Scheduled' | 'Completed' | 'Missed';

export interface Followup {
  id: number;
  lead_id: number;
  date: string;
  time: string;
  type: FollowupType;
  notes: string;
  status: FollowupStatus;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CRM — Tasks
// ============================================================

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface CrmTask {
  id: number;
  title: string;
  description: string | null;
  assigned_to: number | null;
  related_to: string | null;
  related_type: 'Lead' | 'Pesantren' | 'Deal' | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CRM — Notes
// ============================================================

export interface Note {
  id: number;
  entity_id: number;
  entity_type: 'Lead' | 'Deal' | 'Pesantren';
  content: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// CRM — Activities
// ============================================================

export interface Activity {
  id: number;
  // Activity fields from backend
  created_at: string;
  updated_at: string;
}

// ============================================================
// CRM — Files
// ============================================================

export interface CrmFile {
  id: number;
  client_id: number | null;
  project_id: number | null;
  milestone_id: number | null;
  entity_id: number | null;
  entity_type: string | null;
  name: string;
  group_key: string | null;
  drive_url: string;
  version_label: string | null;
  is_latest: boolean;
  approval_status: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Projects (Agency)
// ============================================================

export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export interface Project {
  id: number;
  client_id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
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

export interface ProjectUpdate {
  id: number;
  type: 'update' | 'decision' | 'risk' | 'request';
  visibility: 'client' | 'internal';
  content: string;
  created_at: string;
  author: { id: number; name: string };
}

// ============================================================
// Finance — Invoices & Payments
// ============================================================

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

// ============================================================
// Portal — Tickets
// ============================================================

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_client'
  | 'resolved'
  | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: number;
  client_id: number;
  project_id: number | null;
  ticket_no: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
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

// ============================================================
// Dashboard
// ============================================================

export interface DashboardData {
  projects: { total: number; active: number };
  tickets: { open: number; closed: number };
  invoices: { unpaid: number; paid: number };
}

// ============================================================
// Reports
// ============================================================

export interface ReportSummary {
  // Fields from GET /crm/reports/summary
  [key: string]: unknown;
}

export interface ReportPerformance {
  // Fields from GET /crm/reports/performance
  [key: string]: unknown;
}

// ============================================================
// Team Users
// ============================================================

export interface TeamUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Standard API Response Wrapper (Laravel convention)
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}
