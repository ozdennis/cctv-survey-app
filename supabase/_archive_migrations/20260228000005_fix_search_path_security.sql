-- ============================================================================
-- Migration: Fix Function Search Path Security Warnings
-- Resolves: Supabase Linter "function_search_path_mutable" for 4 functions
-- Also fixes: Column mismatch in trg_cogs_on_material_approval trigger
-- ============================================================================
-- 1. Fix generate_so_code() — add SECURITY DEFINER + SET search_path
CREATE OR REPLACE FUNCTION public.generate_so_code() RETURNS TRIGGER AS $$
DECLARE date_part TEXT;
seq_part TEXT;
BEGIN date_part := TO_CHAR(NOW(), 'YYYYMMDD');
seq_part := LPAD(NEXTVAL('public.sales_order_seq')::TEXT, 4, '0');
IF NEW.code IS NULL THEN NEW.code := 'SO-' || date_part || '-' || seq_part;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';
-- 2. Fix handle_new_user() — add SET search_path
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
DECLARE is_first_user boolean;
BEGIN
SELECT NOT EXISTS(
        SELECT 1
        FROM public.users
    ) INTO is_first_user;
INSERT INTO public.users (id, name, roles)
VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
        CASE
            WHEN is_first_user THEN ARRAY ['Admin']
            ELSE ARRAY ['Vendor']
        END
    );
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';
-- 3. Fix generate_transaction_code() — add SET search_path
CREATE OR REPLACE FUNCTION public.generate_transaction_code(doc_prefix TEXT) RETURNS TEXT AS $$
DECLARE today DATE := CURRENT_DATE;
seq_val INTEGER;
new_code TEXT;
BEGIN
INSERT INTO public.transaction_sequences (doc_type, seq_date, last_seq)
VALUES (doc_prefix, today, 1) ON CONFLICT (doc_type) DO
UPDATE
SET last_seq = CASE
        WHEN public.transaction_sequences.seq_date = today THEN public.transaction_sequences.last_seq + 1
        ELSE 1
    END,
    seq_date = today
RETURNING last_seq INTO seq_val;
new_code := doc_prefix || '-' || to_char(today, 'YYYYMMDD') || '-' || LPAD(seq_val::TEXT, 4, '0');
RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';
-- 4. Fix trg_cogs_on_material_approval() — add SET search_path
--    ALSO FIX: use correct column names (linked_id, linked_type, recorded_by)
--    instead of non-existent (sales_order_id, user_id)
CREATE OR REPLACE FUNCTION public.trg_cogs_on_material_approval() RETURNS TRIGGER AS $$
DECLARE v_so_id UUID;
v_vendor_name TEXT;
v_code TEXT;
BEGIN IF NEW.status = 'approved'
AND OLD.status != 'approved' THEN -- Get the related Sales Order ID and code through the Work Order
SELECT so.id,
    so.code INTO v_so_id,
    v_code
FROM public.work_orders wo
    JOIN public.sales_orders so ON so.id = wo.sales_order_id
WHERE wo.id = NEW.work_order_id;
-- Get Vendor Name
SELECT COALESCE(company_name, name) INTO v_vendor_name
FROM public.users
WHERE id = NEW.vendor_id;
-- Insert the COGS ledger entry using CORRECT column names
INSERT INTO public.finance_ledger (
        code,
        category,
        amount,
        description,
        linked_id,
        linked_type,
        recorded_by
    )
VALUES (
        public.generate_transaction_code('LG'),
        'cogs',
        NEW.total_amount,
        'Material Reimbursement for ' || v_code || ' by ' || v_vendor_name,
        v_so_id,
        'material_invoice',
        NEW.vendor_id
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';