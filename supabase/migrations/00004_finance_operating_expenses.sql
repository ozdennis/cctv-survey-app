-- ─────────────────────────────────────────────────────────────────────────────
-- Finance: Operating Expenses table for recurring OPEX tracking
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS finance.operating_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN (
    'salary', 'rent', 'utilities', 'software', 'marketing', 
    'insurance', 'professional', 'office_supplies', 'travel', 'other'
  )),
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  business_unit text NOT NULL CHECK (business_unit IN ('cctv', 'web', 'maintenance')),
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_pattern text CHECK (recurrence_pattern IN ('monthly', 'quarterly', 'annual')),
  next_due_date date,
  vendor_name text,
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES core.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE finance.operating_expenses IS 
'Tracking table for operating expenses with optional recurring billing';

COMMENT ON COLUMN finance.operating_expenses.is_recurring IS 
'If true, this expense repeats based on recurrence_pattern';

COMMENT ON COLUMN finance.operating_expenses.next_due_date IS 
'Next scheduled date for recurring expense processing';

-- Enable RLS
ALTER TABLE finance.operating_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies: finance/admin only
CREATE POLICY "finance_admin_all_operating_expenses" ON finance.operating_expenses
FOR ALL 
USING (core.has_any_role(array['admin', 'finance']))
WITH CHECK (core.has_any_role(array['admin', 'finance']));

-- Trigger: Auto-post to ledger when operating expense is created
CREATE OR REPLACE FUNCTION finance.post_operating_expense_to_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = finance, public, core
AS $$
DECLARE
  v_ledger_code text;
BEGIN
  -- Generate ledger code
  SELECT core.generate_transaction_code('LG', NEW.created_at::date) INTO v_ledger_code;
  
  -- Insert into ledger
  INSERT INTO finance.finance_ledger (
    transaction_date,
    code,
    category,
    direction,
    amount,
    description,
    related_code,
    business_unit,
    created_by
  ) VALUES (
    NEW.created_at::date,
    v_ledger_code,
    'opex',
    'out',
    NEW.amount,
    NEW.description,
    NEW.code,
    NEW.business_unit,
    NEW.created_by
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_operating_expense_to_ledger ON finance.operating_expenses;
CREATE TRIGGER trg_post_operating_expense_to_ledger
AFTER INSERT ON finance.operating_expenses
FOR EACH ROW
EXECUTE FUNCTION finance.post_operating_expense_to_ledger();

-- Trigger: Update ledger on expense update (delete old, create new)
CREATE OR REPLACE FUNCTION finance.update_operating_expense_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = finance, public, core
AS $$
BEGIN
  -- Update the related ledger entry
  UPDATE finance.finance_ledger
  SET 
    amount = NEW.amount,
    description = NEW.description,
    business_unit = NEW.business_unit,
    transaction_date = NEW.created_at::date
  WHERE related_code = NEW.code AND category = 'opex';
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_operating_expense_ledger ON finance.operating_expenses;
CREATE TRIGGER trg_update_operating_expense_ledger
AFTER UPDATE ON finance.operating_expenses
FOR EACH ROW
EXECUTE FUNCTION finance.update_operating_expense_ledger();

-- Audit trigger for operating expenses
CREATE OR REPLACE FUNCTION finance.audit_operating_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = finance, public, core
AS $$
BEGIN
  INSERT INTO core.audit_log (
    actor_user_id,
    actor_role,
    category,
    entity_table,
    entity_id,
    entity_code,
    operation,
    summary,
    after,
    before
  ) VALUES (
    COALESCE(NEW.created_by, OLD.created_by),
    (SELECT role_code FROM core.user_roles WHERE user_id = COALESCE(NEW.created_by, OLD.created_by) LIMIT 1),
    'finance',
    'finance.operating_expenses',
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.code, OLD.code),
    TG_OP,
    TG_OP || ' operating expense: ' || COALESCE(NEW.code, OLD.code),
    to_jsonb(NEW),
    to_jsonb(OLD)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_operating_expense ON finance.operating_expenses;
CREATE TRIGGER trg_audit_operating_expense
AFTER INSERT OR UPDATE OR DELETE ON finance.operating_expenses
FOR EACH ROW
EXECUTE FUNCTION finance.audit_operating_expense();

</contents>