-- Workflow helpers (docs-first)
-- - Vendor proposes survey schedule + price => creates customer survey invoice and gates execution.
-- - Finance records payments_in => invoice status derived from sum; survey becomes ready when paid.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- Vendor: propose schedule + survey price (creates customer invoice)
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function project.vendor_propose_survey_price(
  p_survey_id uuid,
  p_scheduled_at timestamptz,
  p_pre_survey_price numeric
)
returns table (survey_id uuid, invoice_id uuid, invoice_code text)
language plpgsql
security definer
set search_path = project, finance, core, public
as $$
declare
  v_vendor_id uuid;
  v_invoice_id uuid;
  v_invoice_code text;
  v_account_id uuid;
  v_project_id uuid;
begin
  if p_pre_survey_price is null or p_pre_survey_price <= 0 then
    raise exception 'pre_survey_price must be > 0';
  end if;

  v_vendor_id := core.current_vendor_id();
  if v_vendor_id is null then
    raise exception 'vendor context missing';
  end if;

  -- Ensure survey belongs to this vendor (via its work order)
  select wo.project_id
  into v_project_id
  from project.surveys s
  join project.work_orders wo on wo.id = s.work_order_id
  where s.id = p_survey_id
    and wo.vendor_id = v_vendor_id
  limit 1;

  if v_project_id is null then
    raise exception 'survey not found or not assigned to this vendor';
  end if;

  select p.account_id into v_account_id
  from core.projects p
  where p.id = v_project_id;

  if v_account_id is null then
    raise exception 'project/account missing';
  end if;

  v_invoice_code := core.generate_transaction_code('CI', current_date);

  insert into finance.customer_invoices (
    code,
    invoice_type,
    project_id,
    account_id,
    issue_date,
    due_date,
    status,
    total_amount,
    notes
  )
  values (
    v_invoice_code,
    'survey',
    v_project_id,
    v_account_id,
    current_date,
    current_date + interval '7 days',
    'sent',
    p_pre_survey_price,
    'Survey fee'
  )
  returning id into v_invoice_id;

  update project.surveys
  set
    scheduled_at = p_scheduled_at,
    edit_count = edit_count + 1,
    pre_survey_price = p_pre_survey_price,
    survey_invoice_id = v_invoice_id,
    status = 'waiting_payment',
    updated_at = now()
  where id = p_survey_id;

  return query select p_survey_id, v_invoice_id, v_invoice_code;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Finance: derive invoice status from payments_in
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function finance.trg_recompute_invoice_status()
returns trigger
language plpgsql
security definer
set search_path = finance, project, core, public
as $$
declare
  v_invoice_id uuid;
  v_total numeric;
  v_paid numeric;
  v_new_status text;
begin
  v_invoice_id := coalesce(new.invoice_id, old.invoice_id);

  select total_amount into v_total
  from finance.customer_invoices
  where id = v_invoice_id;

  select coalesce(sum(amount), 0) into v_paid
  from finance.payments_in
  where invoice_id = v_invoice_id;

  if v_total is null then
    return null;
  end if;

  if v_paid >= v_total and v_total > 0 then
    v_new_status := 'paid';
  elsif v_paid > 0 then
    v_new_status := 'partial';
  else
    -- keep as sent unless still draft/cancelled
    v_new_status := 'sent';
  end if;

  update finance.customer_invoices
  set status = case
    when status = 'cancelled' then 'cancelled'
    when status = 'draft' and v_new_status <> 'sent' then v_new_status
    else v_new_status
  end,
  updated_at = now()
  where id = v_invoice_id;

  -- If this is a survey invoice and now paid, unlock survey execution
  if v_new_status = 'paid' then
    update project.surveys
    set status = 'ready_for_execution',
        updated_at = now()
    where survey_invoice_id = v_invoice_id
      and status in ('waiting_payment','invoice_created','price_submitted');
  end if;

  return null;
end;
$$;

drop trigger if exists payments_in_recompute_invoice_status on finance.payments_in;
create trigger payments_in_recompute_invoice_status
after insert or update or delete on finance.payments_in
for each row execute procedure finance.trg_recompute_invoice_status();

