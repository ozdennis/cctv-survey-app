-- Vendor survey scheduling + payment gating
-- Flow: vendor proposes schedule+price → system creates survey invoice → blocks execution until paid

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: Vendor proposes survey schedule and price
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function project.vendor_propose_survey_price(
  p_survey_id uuid,
  p_scheduled_at timestamptz,
  p_pre_survey_price numeric
)
returns table (invoice_code text)
language plpgsql
security definer
set search_path = project, finance, core, public
as $$
declare
  v_work_order_id uuid;
  v_project_id uuid;
  v_account_id uuid;
  v_existing_invoice_id uuid;
  v_invoice_code text;
begin
  -- Validate survey exists and is in valid state
  select wo.id, wo.project_id
  into v_work_order_id, v_project_id
  from project.surveys s
  join project.work_orders wo on wo.id = s.work_order_id
  where s.id = p_survey_id;

  if v_work_order_id is null then
    raise exception 'Survey not found';
  end if;

  -- Get account_id from project
  select account_id into v_account_id
  from core.projects
  where id = v_project_id;

  if v_account_id is null then
    raise exception 'Project account not found';
  end if;

  -- Check if invoice already exists
  select survey_invoice_id into v_existing_invoice_id
  from project.surveys
  where id = p_survey_id;

  if v_existing_invoice_id is not null then
    raise exception 'Survey invoice already exists';
  end if;

  -- Generate invoice code
  select core.generate_transaction_code('CI') into v_invoice_code;

  -- Create survey invoice
  insert into finance.customer_invoices (
    code,
    invoice_type,
    project_id,
    account_id,
    status,
    currency,
    total_amount,
    notes
  ) values (
    v_invoice_code,
    'survey',
    v_project_id,
    v_account_id,
    'sent',
    'IDR',
    p_pre_survey_price,
    'Pre-survey fee - payment required before execution'
  );

  -- Add invoice item
  insert into finance.customer_invoice_items (
    invoice_id,
    description,
    qty,
    unit_price,
    line_total
  ) values (
    (select id from finance.customer_invoices where code = v_invoice_code),
    'Pre-survey site visit',
    1,
    p_pre_survey_price,
    p_pre_survey_price
  );

  -- Update survey with schedule, price, and invoice reference
  update project.surveys
  set
    scheduled_at = p_scheduled_at,
    pre_survey_price = p_pre_survey_price,
    survey_invoice_id = (select id from finance.customer_invoices where code = v_invoice_code),
    status = 'waiting_payment',
    updated_at = now()
  where id = p_survey_id;

  -- Update work order status
  update project.work_orders
  set
    status = 'scheduled',
    scheduled_at = p_scheduled_at,
    updated_at = now()
  where id = v_work_order_id;

  -- Log the action
  insert into core.audit_log (
    actor_user_id,
    actor_role,
    category,
    entity_table,
    entity_id,
    entity_code,
    operation,
    summary,
    reason
  ) values (
    auth.uid(),
    'vendor',
    'vendor',
    'project.surveys',
    p_survey_id,
    v_invoice_code,
    'UPDATE',
    'Vendor proposed survey schedule and price, invoice created',
    null
  );

  return query select v_invoice_code;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: Finance confirms survey payment → unlocks execution
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function finance.confirm_survey_payment(
  p_invoice_id uuid
)
returns void
language plpgsql
security definer
set search_path = finance, project, core, public
as $$
declare
  v_survey_id uuid;
  v_invoice_code text;
begin
  -- Get invoice code
  select code into v_invoice_code
  from finance.customer_invoices
  where id = p_invoice_id;

  if v_invoice_code is null then
    raise exception 'Invoice not found';
  end if;

  -- Verify this is a survey invoice
  select survey_id into v_survey_id
  from project.surveys
  where survey_invoice_id = p_invoice_id;

  if v_survey_id is null then
    raise exception 'Invoice is not linked to a survey';
  end if;

  -- Update invoice status
  update finance.customer_invoices
  set status = 'paid'
  where id = p_invoice_id;

  -- Unlock survey for execution
  update project.surveys
  set status = 'ready_for_execution'
  where id = v_survey_id;

  -- Create ledger entry for revenue
  insert into finance.finance_ledger (
    transaction_date,
    code,
    category,
    related_code,
    project_id,
    customer_id,
    amount,
    direction,
    description,
    created_by
  )
  select
    current_date,
    core.generate_transaction_code('FE'),
    'revenue',
    ci.code,
    ci.project_id,
    ci.account_id,
    ci.total_amount,
    'in',
    'Survey payment received: ' || ci.code,
    auth.uid()
  from finance.customer_invoices ci
  where ci.id = p_invoice_id;

  -- Log the action
  insert into core.audit_log (
    actor_user_id,
    actor_role,
    category,
    entity_table,
    entity_id,
    entity_code,
    operation,
    summary,
    reason
  ) values (
    auth.uid(),
    'finance',
    'finance',
    'finance.customer_invoices',
    p_invoice_id,
    v_invoice_code,
    'UPDATE',
    'Survey invoice marked as paid, execution unlocked',
    null
  );
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC: Vendor submits final quote after survey completion
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function project.vendor_submit_survey_quote(
  p_survey_id uuid,
  p_final_quote_amount numeric,
  p_report_notes text
)
returns void
language plpgsql
security definer
set search_path = project, core, public
as $$
declare
  v_work_order_id uuid;
  v_current_status text;
begin
  -- Validate survey exists and is in valid state
  select s.status, wo.id
  into v_current_status, v_work_order_id
  from project.surveys s
  join project.work_orders wo on wo.id = s.work_order_id
  where s.id = p_survey_id;

  if v_work_order_id is null then
    raise exception 'Survey not found';
  end if;

  if v_current_status not in ('ready_for_execution', 'in_progress') then
    raise exception 'Survey must be in ready_for_execution or in_progress status';
  end if;

  -- Update survey with final quote
  update project.surveys
  set
    final_quote_amount = p_final_quote_amount,
    report_notes = p_report_notes,
    final_quote_submitted_at = now(),
    status = 'completed',
    updated_at = now()
  where id = p_survey_id;

  -- Mark work order as completed
  update project.work_orders
  set
    status = 'completed',
    updated_at = now()
  where id = v_work_order_id;

  -- Log the action
  insert into core.audit_log (
    actor_user_id,
    actor_role,
    category,
    entity_table,
    entity_id,
    entity_code,
    operation,
    summary,
    reason
  ) values (
    auth.uid(),
    'vendor',
    'vendor',
    'project.surveys',
    p_survey_id,
    null,
    'UPDATE',
    'Vendor submitted final survey quote and report',
    null
  );
end;
$$;

-- Grant execute permissions
grant execute on function project.vendor_propose_survey_price(uuid, timestamptz, numeric) to authenticated;
grant execute on function finance.confirm_survey_payment(uuid) to authenticated;
grant execute on function project.vendor_submit_survey_quote(uuid, numeric, text) to authenticated;

</contents>