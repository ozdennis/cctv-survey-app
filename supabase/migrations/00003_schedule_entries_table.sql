-- ─────────────────────────────────────────────────────────────────────────────
-- Shared Calendar: schedule_entries table
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists core.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (entry_type in ('survey', 'work_order', 'maintenance', 'meeting', 'other')),
  
  work_order_id uuid references project.work_orders(id) on delete cascade,
  survey_id uuid references project.surveys(id) on delete cascade,
  ticket_id uuid references support.tickets(id) on delete cascade,
  
  vendor_id uuid references core.vendors(id) on delete set null,
  account_id uuid references core.accounts(id) on delete set null,
  project_id uuid references core.projects(id) on delete set null,
  
  scheduled_at timestamptz not null,
  duration_minutes int default 60,
  location_address text,
  location_notes text,
  
  edit_count int not null default 0,
  last_edited_by uuid references core.users(id) on delete set null,
  
  title text not null,
  description text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references core.users(id) on delete set null
);

create index idx_schedule_entries_vendor on core.schedule_entries(vendor_id);
create index idx_schedule_entries_scheduled_at on core.schedule_entries(scheduled_at);
create index idx_schedule_entries_entry_type on core.schedule_entries(entry_type);

alter table core.schedule_entries enable row level security;

create policy "schedule_admin_all" on core.schedule_entries
for all using (core.has_role('admin'))
with check (core.has_role('admin'));

create policy "schedule_staff_read" on core.schedule_entries
for select using (core.has_any_role(array['sales', 'finance', 'customer_support']));

create policy "schedule_vendor_read_own" on core.schedule_entries
for select using (vendor_id = core.current_vendor_id());

create policy "schedule_vendor_update_own" on core.schedule_entries
for update using (vendor_id = core.current_vendor_id())
with check (vendor_id = core.current_vendor_id());

create policy "schedule_vendor_insert" on core.schedule_entries
for insert with check (vendor_id = core.current_vendor_id());

create or replace function core.enforce_schedule_edit_limit()
returns trigger
language plpgsql
security definer
set search_path = core, public
as $$
declare
  v_is_vendor boolean;
begin
  select core.has_role('vendor') into v_is_vendor;
  
  if v_is_vendor and old.scheduled_at is distinct from new.scheduled_at then
    if old.edit_count >= 2 then
      raise exception 'Vendors can only edit scheduled entries up to 2 times. Contact admin to reschedule.';
    end if;
    new.edit_count := old.edit_count + 1;
    new.last_edited_by := auth.uid();
  end if;
  
  return new;
end;
$$;

drop trigger if exists trg_enforce_schedule_edit_limit on core.schedule_entries;
create trigger trg_enforce_schedule_edit_limit
before update on core.schedule_entries
for each row execute procedure core.enforce_schedule_edit_limit();

create or replace function core.sync_work_order_to_schedule()
returns trigger
language plpgsql
security definer
set search_path = core, public, project
as $$
begin
  if new.scheduled_at is not null then
    insert into core.schedule_entries (
      entry_type, work_order_id, vendor_id, project_id,
      scheduled_at, title, description, status, created_by
    ) values (
      'work_order',
      new.id,
      new.vendor_id,
      new.project_id,
      new.scheduled_at,
      'WO: ' || new.code,
      'Type: ' || new.type,
      new.status,
      auth.uid()
    )
    on conflict (work_order_id) do update set
      scheduled_at = new.scheduled_at,
      title = 'WO: ' || new.code,
      status = new.status,
      vendor_id = new.vendor_id,
      updated_at = now();
  else
    delete from core.schedule_entries where work_order_id = new.id;
  end if;
  
  return new;
end;
$$;

drop trigger if exists trg_sync_work_order_schedule on project.work_orders;
create trigger trg_sync_work_order_schedule
after insert or update on project.work_orders
for each row execute procedure core.sync_work_order_to_schedule();

create or replace function core.sync_survey_to_schedule()
returns trigger
language plpgsql
security definer
set search_path = core, public, project
as $$
declare
  v_wo record;
begin
  select wo.vendor_id, wo.project_id, wo.code into v_wo
  from project.work_orders wo where wo.id = new.work_order_id;
  
  if new.scheduled_at is not null then
    insert into core.schedule_entries (
      entry_type, survey_id, vendor_id, project_id,
      scheduled_at, edit_count, title, description, status
    ) values (
      'survey',
      new.id,
      v_wo.vendor_id,
      v_wo.project_id,
      new.scheduled_at,
      new.edit_count,
      'Survey: ' || v_wo.code,
      'Status: ' || new.status,
      new.status
    )
    on conflict (survey_id) do update set
      scheduled_at = new.scheduled_at,
      edit_count = new.edit_count,
      status = new.status,
      updated_at = now();
  else
    delete from core.schedule_entries where survey_id = new.id;
  end if;
  
  return new;
end;
$$;

drop trigger if exists trg_sync_survey_schedule on project.surveys;
create trigger trg_sync_survey_schedule
after insert or update on project.surveys
for each row execute procedure core.sync_survey_to_schedule();

</changes>