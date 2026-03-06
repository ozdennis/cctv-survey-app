-- ─────────────────────────────────────────────────────────────────────────────
-- Finance: Auto-update invoice status on payment
-- ─────────────────────────────────────────────────────────────────────────────

-- Trigger function: updates customer_invoices.status based on payments_in sum
create or replace function finance.update_invoice_status_on_payment()
returns trigger
language plpgsql
security definer
set search_path = finance, public
as $$
declare
  v_total numeric;
  v_paid numeric;
begin
  select total_amount into v_total
  from finance.customer_invoices
  where id = new.invoice_id;

  select coalesce(sum(amount), 0) into v_paid
  from finance.payments_in
  where invoice_id = new.invoice_id;

  update finance.customer_invoices
  set 
    status = case
      when v_paid >= v_total then 'paid'
      when v_paid > 0 then 'partial'
      else 'sent'
    end,
    updated_at = now()
  where id = new.invoice_id;

  return new;
end;
$$;

drop trigger if exists trg_update_invoice_status on finance.payments_in;
create trigger trg_update_invoice_status
after insert on finance.payments_in
for each row execute procedure finance.update_invoice_status_on_payment();

create or replace function finance.update_invoice_status_on_payment_change()
returns trigger
language plpgsql
security definer
set search_path = finance, public
as $$
declare
  v_invoice_id uuid;
  v_total numeric;
  v_paid numeric;
begin
  v_invoice_id := coalesce(
    (select invoice_id from finance.payments_in where id = new.id),
    (select invoice_id from finance.payments_in where id = old.id)
  );

  if v_invoice_id is null then
    return null;
  end if;

  select total_amount into v_total
  from finance.customer_invoices
  where id = v_invoice_id;

  select coalesce(sum(amount), 0) into v_paid
  from finance.payments_in
  where invoice_id = v_invoice_id;

  update finance.customer_invoices
  set 
    status = case
      when v_paid >= v_total then 'paid'
      when v_paid > 0 then 'partial'
      else 'sent'
    end,
    updated_at = now()
  where id = v_invoice_id;

  return new;
end;
$$;

drop trigger if exists trg_update_invoice_status_change on finance.payments_in;
create trigger trg_update_invoice_status_change
after update or delete on finance.payments_in
for each row execute procedure finance.update_invoice_status_on_payment_change();

create or replace function finance.audit_payment_in()
returns trigger
language plpgsql
security definer
set search_path = finance, public, core
as $$
begin
  insert into core.audit_log (
    actor_user_id, actor_role, category, entity_table, entity_id, entity_code,
    operation, summary, after, reason
  ) values (
    new.recorded_by,
    (select role_code from core.user_roles where user_id = new.recorded_by limit 1),
    'finance',
    'finance.payments_in',
    new.id,
    (select code from finance.customer_invoices where id = new.invoice_id),
    'INSERT',
    'Payment recorded: ' || new.amount,
    to_jsonb(new),
    null
  );
  return new;
end;
$$;

drop trigger if exists trg_audit_payment_in on finance.payments_in;
create trigger trg_audit_payment_in
after insert on finance.payments_in
for each row execute procedure finance.audit_payment_in();

</changes>