-- Docs-first baseline schema (wipe & rebuild target)
-- Schemas: core, crm, project, finance, support
--
-- Notes:
-- - First registered user is auto-bootstrapped as admin + active (to avoid deadlock).
-- - All other users default to pending + no roles until admin assigns roles.
-- - Codes are generated via core.generate_transaction_code(prefix, date).

create extension if not exists pgcrypto;

create schema if not exists core;
create schema if not exists crm;
create schema if not exists project;
create schema if not exists finance;
create schema if not exists support;

-- ─────────────────────────────────────────────────────────────────────────────
-- core: code generation
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists core.code_counters (
  prefix text not null,
  yyyymmdd text not null,
  last_seq int not null default 0,
  primary key (prefix, yyyymmdd)
);

create or replace function core.generate_transaction_code(p_prefix text, p_date date default current_date)
returns text
language plpgsql
security definer
set search_path = core, public
as $$
declare
  v_day text := to_char(p_date, 'YYYYMMDD');
  v_seq int;
begin
  insert into core.code_counters(prefix, yyyymmdd, last_seq)
  values (p_prefix, v_day, 1)
  on conflict (prefix, yyyymmdd)
  do update set last_seq = core.code_counters.last_seq + 1
  returning last_seq into v_seq;

  return p_prefix || '-' || v_day || '-' || lpad(v_seq::text, 4, '0');
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- core: identity + access
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists core.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'disabled')),
  full_name text,
  company_name text,
  requested_type text check (requested_type in ('vendor', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.roles (
  code text primary key,
  description text
);

create table if not exists core.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('company', 'individual')) default 'company',
  billing_address text,
  site_address text,
  phone text,
  email text,
  site_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  tax_id text,
  bank_name text,
  bank_account_no text,
  bank_account_name text,
  contact_name text,
  contact_phone text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references core.users(id) on delete cascade,
  role_code text not null references core.roles(code) on delete restrict,
  vendor_id uuid references core.vendors(id) on delete restrict,
  account_id uuid references core.accounts(id) on delete restrict,
  assigned_by uuid references core.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (user_id, role_code)
);

create table if not exists core.projects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  account_id uuid not null references core.accounts(id) on delete restrict,
  name text,
  status text not null default 'planning'
    check (status in ('planning','survey','install','maintenance','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists core.audit_log (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_user_id uuid references core.users(id) on delete set null,
  actor_role text,
  category text not null check (category in ('finance','sales','vendor','support','core','auth')),
  entity_table text not null,
  entity_id uuid,
  entity_code text,
  operation text not null check (operation in ('INSERT','UPDATE','DELETE')),
  summary text,
  before jsonb,
  after jsonb,
  reason text
);

insert into core.roles(code, description) values
  ('admin','Full access'),
  ('sales','Sales portal access'),
  ('vendor','Vendor portal access'),
  ('finance','Finance portal access'),
  ('customer_support','Support portal access'),
  ('customer','Customer portal access')
on conflict (code) do update set description = excluded.description;

-- ─────────────────────────────────────────────────────────────────────────────
-- core helpers for RLS
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function core.has_role(p_role text)
returns boolean
language sql
security definer
set search_path = core, public
as $$
  select exists(
    select 1 from core.user_roles ur
    where ur.user_id = auth.uid() and ur.role_code = p_role
  );
$$;

create or replace function core.has_any_role(p_roles text[])
returns boolean
language sql
security definer
set search_path = core, public
as $$
  select exists(
    select 1 from core.user_roles ur
    where ur.user_id = auth.uid() and ur.role_code = any(p_roles)
  );
$$;

create or replace function core.current_vendor_id()
returns uuid
language sql
security definer
set search_path = core, public
as $$
  select ur.vendor_id
  from core.user_roles ur
  where ur.user_id = auth.uid() and ur.role_code = 'vendor'
  limit 1;
$$;

create or replace function core.is_active_user()
returns boolean
language sql
security definer
set search_path = core, public
as $$
  select exists(
    select 1 from core.users u
    where u.id = auth.uid() and u.status = 'active'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- auth trigger: create core.users row on signup (bootstrap first user as admin)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function core.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = core, public, auth
as $$
declare
  v_is_first boolean;
  v_requested_type text;
begin
  select not exists(select 1 from core.users) into v_is_first;
  v_requested_type := lower(coalesce(new.raw_user_meta_data->>'requested_type','other'));

  insert into core.users (id, email, status, full_name, company_name, requested_type)
  values (
    new.id,
    new.email,
    case when v_is_first then 'active' else 'pending' end,
    nullif(new.raw_user_meta_data->>'full_name',''),
    nullif(new.raw_user_meta_data->>'company_name',''),
    case when v_requested_type in ('vendor','other') then v_requested_type else 'other' end
  )
  on conflict (id) do nothing;

  if v_is_first then
    insert into core.user_roles(user_id, role_code, assigned_by)
    values (new.id, 'admin', new.id)
    on conflict (user_id, role_code) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure core.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- crm
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists crm.leads (
  id uuid primary key default gen_random_uuid(),
  source text,
  account_name text,
  contact_name text,
  contact_phone text,
  contact_email text,
  site_type text,
  estimated_cameras int,
  notes text,
  status text not null default 'new' check (status in ('new','qualified','discarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists crm.deals (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  lead_id uuid references crm.leads(id) on delete set null,
  account_id uuid references core.accounts(id) on delete set null,
  title text,
  stage text not null default 'new' check (stage in ('new','qualified','proposal_sent','negotiation','won','lost')),
  expected_value numeric,
  expected_close_date date,
  loss_reason text,
  owner_user_id uuid references core.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists crm.activities (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references crm.deals(id) on delete cascade,
  type text not null check (type in ('call','meeting','email','note')),
  summary text,
  interaction_at timestamptz not null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_by uuid references core.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists project.work_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references core.projects(id) on delete cascade,
  code text not null unique,
  type text not null check (type in ('survey','installation','maintenance')),
  status text not null default 'draft'
    check (status in ('draft','scheduled','in_progress','completed','cancelled')),
  scheduled_at timestamptz,
  vendor_id uuid references core.vendors(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- finance
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists finance.customer_invoices (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  invoice_type text not null default 'project' check (invoice_type in ('survey','project')),
  project_id uuid references core.projects(id) on delete set null,
  account_id uuid not null references core.accounts(id) on delete restrict,
  issue_date date not null default current_date,
  due_date date,
  status text not null default 'draft' check (status in ('draft','sent','partial','paid','cancelled')),
  currency text not null default 'IDR',
  total_amount numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists finance.customer_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references finance.customer_invoices(id) on delete cascade,
  description text,
  qty numeric not null default 1,
  unit_price numeric not null default 0,
  line_total numeric not null default 0
);

create table if not exists finance.payments_in (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references finance.customer_invoices(id) on delete cascade,
  payment_date date not null,
  amount numeric not null check (amount > 0),
  method text,
  reference text,
  recorded_by uuid references core.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists finance.vendor_invoices (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  vendor_id uuid not null references core.vendors(id) on delete restrict,
  work_order_id uuid references project.work_orders(id) on delete set null,
  total_amount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','rejected','paid')),
  notes text,
  receipt_photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists finance.payments_out (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('vendor_payout','withdrawal')),
  vendor_invoice_id uuid references finance.vendor_invoices(id) on delete set null,
  owner_id uuid references core.users(id) on delete set null,
  payment_date date not null,
  amount numeric not null check (amount > 0),
  method text,
  reference text,
  recorded_by uuid references core.users(id) on delete set null,
  approved_by uuid references core.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists finance.finance_ledger (
  id uuid primary key default gen_random_uuid(),
  transaction_date date not null default current_date,
  code text not null unique,
  category text not null check (category in ('revenue','cogs','opex','withdrawal','tax_reserve')),
  related_code text,
  project_id uuid references core.projects(id) on delete set null,
  customer_id uuid references core.accounts(id) on delete set null,
  vendor_id uuid references core.vendors(id) on delete set null,
  amount numeric not null check (amount > 0),
  direction text not null check (direction in ('in','out')),
  description text,
  created_at timestamptz not null default now(),
  created_by uuid references core.users(id) on delete set null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- project
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists project.surveys (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null unique references project.work_orders(id) on delete cascade,
  status text not null default 'open'
    check (status in ('open','price_submitted','invoice_created','waiting_payment','ready_for_execution','in_progress','completed')),
  scheduled_at timestamptz,
  edit_count int not null default 0,
  pre_survey_price numeric,
  survey_invoice_id uuid references finance.customer_invoices(id) on delete set null,
  report_notes text,
  final_quote_amount numeric,
  final_quote_submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project.survey_artifacts (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references project.surveys(id) on delete cascade,
  kind text not null check (kind in ('overall','zone','detail','other')),
  label text,
  file_url text not null,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references core.users(id) on delete set null
);

create table if not exists project.survey_cameras (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references project.surveys(id) on delete cascade,
  label text not null,
  zone text,
  notes text,
  created_at timestamptz not null default now(),
  unique (survey_id, label)
);

create table if not exists project.survey_line_items (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references project.surveys(id) on delete cascade,
  zone text,
  product_brand text,
  product_name text,
  product_spec text,
  quantity int not null check (quantity > 0),
  camera_label text,
  unit_price numeric,
  line_total numeric,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- support
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists support.tickets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  account_id uuid references core.accounts(id) on delete set null,
  project_id uuid references core.projects(id) on delete set null,
  contact_name text,
  contact_phone text,
  type text not null check (type in ('incident','maintenance','question','billing')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  status text not null default 'open'
    check (status in ('open','in_progress','vendor_sent','waiting_customer','resolved','closed')),
  subject text,
  description text,
  created_by uuid references core.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists support.ticket_comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support.tickets(id) on delete cascade,
  author_user_id uuid references core.users(id) on delete set null,
  body text,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists support.ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support.tickets(id) on delete cascade,
  file_url text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists support.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  ticket_id uuid references support.tickets(id) on delete set null,
  project_id uuid references core.projects(id) on delete restrict,
  work_order_id uuid references project.work_orders(id) on delete set null,
  type text not null check (type in ('maintenance','guarantee')),
  issue_summary text,
  customer_contact text,
  stage text not null default 'open'
    check (stage in ('open','vendor_sent','in_progress','resolved','closed')),
  created_by uuid references core.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS enable
-- ─────────────────────────────────────────────────────────────────────────────

alter table core.users enable row level security;
alter table core.user_roles enable row level security;
alter table core.accounts enable row level security;
alter table core.vendors enable row level security;
alter table core.projects enable row level security;
alter table core.audit_log enable row level security;

alter table crm.leads enable row level security;
alter table crm.deals enable row level security;
alter table crm.activities enable row level security;

alter table project.work_orders enable row level security;
alter table project.surveys enable row level security;
alter table project.survey_artifacts enable row level security;
alter table project.survey_cameras enable row level security;
alter table project.survey_line_items enable row level security;

alter table finance.customer_invoices enable row level security;
alter table finance.customer_invoice_items enable row level security;
alter table finance.payments_in enable row level security;
alter table finance.vendor_invoices enable row level security;
alter table finance.payments_out enable row level security;
alter table finance.finance_ledger enable row level security;

alter table support.tickets enable row level security;
alter table support.ticket_comments enable row level security;
alter table support.ticket_attachments enable row level security;
alter table support.maintenance_requests enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- core policies
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "core_users_select_self" on core.users;
create policy "core_users_select_self" on core.users
for select using (auth.uid() = id);

drop policy if exists "core_users_select_admin" on core.users;
create policy "core_users_select_admin" on core.users
for select using (core.has_role('admin'));

drop policy if exists "core_users_update_self" on core.users;
create policy "core_users_update_self" on core.users
for update using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "core_users_update_admin" on core.users;
create policy "core_users_update_admin" on core.users
for update using (core.has_role('admin'))
with check (core.has_role('admin'));

drop policy if exists "core_user_roles_select_self" on core.user_roles;
create policy "core_user_roles_select_self" on core.user_roles
for select using (user_id = auth.uid());

drop policy if exists "core_user_roles_admin_all" on core.user_roles;
create policy "core_user_roles_admin_all" on core.user_roles
for all using (core.has_role('admin'))
with check (core.has_role('admin'));

drop policy if exists "core_accounts_staff_select" on core.accounts;
create policy "core_accounts_staff_select" on core.accounts
for select using (core.has_any_role(array['admin','sales','finance','customer_support']));

drop policy if exists "core_accounts_sales_admin_insert" on core.accounts;
create policy "core_accounts_sales_admin_insert" on core.accounts
for insert with check (core.has_any_role(array['admin','sales']));

drop policy if exists "core_accounts_admin_update" on core.accounts;
create policy "core_accounts_admin_update" on core.accounts
for update using (core.has_role('admin'))
with check (core.has_role('admin'));

drop policy if exists "core_vendors_staff_select" on core.vendors;
create policy "core_vendors_staff_select" on core.vendors
for select using (core.has_any_role(array['admin','sales','finance','customer_support']));

drop policy if exists "core_vendors_admin_write" on core.vendors;
create policy "core_vendors_admin_write" on core.vendors
for all using (core.has_role('admin'))
with check (core.has_role('admin'));

drop policy if exists "core_projects_sales_admin_select" on core.projects;
create policy "core_projects_sales_admin_select" on core.projects
for select using (core.has_any_role(array['admin','sales','finance','customer_support']));

drop policy if exists "core_projects_sales_admin_write" on core.projects;
create policy "core_projects_sales_admin_write" on core.projects
for insert with check (core.has_any_role(array['admin','sales']));

create policy "core_projects_admin_update" on core.projects
for update using (core.has_role('admin'))
with check (core.has_role('admin'));

drop policy if exists "core_audit_admin_select" on core.audit_log;
create policy "core_audit_admin_select" on core.audit_log
for select using (core.has_role('admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- crm policies (sales/admin only)
-- ─────────────────────────────────────────────────────────────────────────────

create policy "crm_sales_admin_all_leads" on crm.leads
for all using (core.has_any_role(array['admin','sales']))
with check (core.has_any_role(array['admin','sales']));

create policy "crm_sales_admin_all_deals" on crm.deals
for all using (core.has_any_role(array['admin','sales']))
with check (core.has_any_role(array['admin','sales']));

create policy "crm_sales_admin_all_activities" on crm.activities
for all using (core.has_any_role(array['admin','sales']))
with check (core.has_any_role(array['admin','sales']));

-- ─────────────────────────────────────────────────────────────────────────────
-- project policies
-- ─────────────────────────────────────────────────────────────────────────────

create policy "work_orders_sales_admin_select" on project.work_orders
for select using (core.has_any_role(array['admin','sales','finance','customer_support']));

create policy "work_orders_vendor_select_own" on project.work_orders
for select using (vendor_id is not null and vendor_id = core.current_vendor_id());

create policy "work_orders_sales_admin_insert" on project.work_orders
for insert with check (core.has_any_role(array['admin','sales']));

create policy "work_orders_sales_admin_update" on project.work_orders
for update using (core.has_any_role(array['admin','sales']))
with check (core.has_any_role(array['admin','sales']));

create policy "work_orders_vendor_update_own" on project.work_orders
for update using (vendor_id is not null and vendor_id = core.current_vendor_id())
with check (vendor_id is not null and vendor_id = core.current_vendor_id());

create policy "surveys_sales_admin_select" on project.surveys
for select using (core.has_any_role(array['admin','sales','finance','customer_support']));

create policy "surveys_sales_admin_insert" on project.surveys
for insert with check (core.has_any_role(array['admin','sales']));

create policy "surveys_finance_admin_update" on project.surveys
for update using (core.has_any_role(array['admin','finance']))
with check (core.has_any_role(array['admin','finance']));

create policy "surveys_vendor_select_own" on project.surveys
for select using (
  exists (
    select 1 from project.work_orders wo
    where wo.id = work_order_id and wo.vendor_id = core.current_vendor_id()
  )
);

create policy "surveys_vendor_update_own" on project.surveys
for update using (
  exists (
    select 1 from project.work_orders wo
    where wo.id = work_order_id and wo.vendor_id = core.current_vendor_id()
  )
)
with check (
  exists (
    select 1 from project.work_orders wo
    where wo.id = work_order_id and wo.vendor_id = core.current_vendor_id()
  )
);

create policy "survey_artifacts_vendor_all_own" on project.survey_artifacts
for all using (
  exists (
    select 1
    from project.surveys s
    join project.work_orders wo on wo.id = s.work_order_id
    where s.id = survey_id and wo.vendor_id = core.current_vendor_id()
  )
)
with check (
  exists (
    select 1
    from project.surveys s
    join project.work_orders wo on wo.id = s.work_order_id
    where s.id = survey_id and wo.vendor_id = core.current_vendor_id()
  )
);

create policy "survey_cameras_vendor_all_own" on project.survey_cameras
for all using (
  exists (
    select 1
    from project.surveys s
    join project.work_orders wo on wo.id = s.work_order_id
    where s.id = survey_id and wo.vendor_id = core.current_vendor_id()
  )
)
with check (
  exists (
    select 1
    from project.surveys s
    join project.work_orders wo on wo.id = s.work_order_id
    where s.id = survey_id and wo.vendor_id = core.current_vendor_id()
  )
);

create policy "survey_line_items_vendor_all_own" on project.survey_line_items
for all using (
  exists (
    select 1
    from project.surveys s
    join project.work_orders wo on wo.id = s.work_order_id
    where s.id = survey_id and wo.vendor_id = core.current_vendor_id()
  )
)
with check (
  exists (
    select 1
    from project.surveys s
    join project.work_orders wo on wo.id = s.work_order_id
    where s.id = survey_id and wo.vendor_id = core.current_vendor_id()
  )
);

-- ─────────────────────────────────────────────────────────────────────────────
-- finance policies (finance/admin only; sales sees invoices via app-level filtered reads later)
-- ─────────────────────────────────────────────────────────────────────────────

create policy "finance_admin_all_customer_invoices" on finance.customer_invoices
for all using (core.has_any_role(array['admin','finance']))
with check (core.has_any_role(array['admin','finance']));

create policy "finance_admin_all_customer_invoice_items" on finance.customer_invoice_items
for all using (core.has_any_role(array['admin','finance']))
with check (core.has_any_role(array['admin','finance']));

create policy "finance_admin_all_payments_in" on finance.payments_in
for all using (core.has_any_role(array['admin','finance']))
with check (core.has_any_role(array['admin','finance']));

create policy "finance_admin_all_vendor_invoices" on finance.vendor_invoices
for all using (core.has_any_role(array['admin','finance']))
with check (core.has_any_role(array['admin','finance']));

create policy "finance_admin_all_payments_out" on finance.payments_out
for all using (core.has_any_role(array['admin','finance']))
with check (core.has_any_role(array['admin','finance']));

create policy "finance_admin_all_ledger" on finance.finance_ledger
for all using (core.has_any_role(array['admin','finance']))
with check (core.has_any_role(array['admin','finance']));

-- ─────────────────────────────────────────────────────────────────────────────
-- support policies (support/admin only)
-- ─────────────────────────────────────────────────────────────────────────────

create policy "support_admin_all_tickets" on support.tickets
for all using (core.has_any_role(array['admin','customer_support']))
with check (core.has_any_role(array['admin','customer_support']));

create policy "support_admin_all_ticket_comments" on support.ticket_comments
for all using (core.has_any_role(array['admin','customer_support']))
with check (core.has_any_role(array['admin','customer_support']));

create policy "support_admin_all_ticket_attachments" on support.ticket_attachments
for all using (core.has_any_role(array['admin','customer_support']))
with check (core.has_any_role(array['admin','customer_support']));

create policy "support_admin_all_maintenance_requests" on support.maintenance_requests
for all using (core.has_any_role(array['admin','customer_support']))
with check (core.has_any_role(array['admin','customer_support']));

