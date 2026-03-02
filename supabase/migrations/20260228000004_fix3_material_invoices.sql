-- Migration to support Vendor Material Invoicing directly tied to Cashier COGS Approval
-- 1. Create the materialized invoice tracking table
CREATE TABLE public.material_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_order_id UUID REFERENCES public.work_orders(id) NOT NULL,
    vendor_id UUID REFERENCES public.users(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    total_amount NUMERIC NOT NULL,
    receipt_photo_url TEXT,
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    -- Array of { desc, qty, unit_price }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.material_invoices ENABLE ROW LEVEL SECURITY;
-- VENDORS: Can view their own invoices, and insert/update if pending
CREATE POLICY "Vendors view own invoices" ON public.material_invoices FOR
SELECT USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors insert invoices" ON public.material_invoices FOR
INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors update pending invoices" ON public.material_invoices FOR
UPDATE USING (
        auth.uid() = vendor_id
        AND status = 'pending'
    );
-- CASHIERS & ADMINS: Can view and update all invoices
CREATE POLICY "Internal staff view all invoices" ON public.material_invoices FOR
SELECT USING (
        public.has_any_role(ARRAY ['admin', 'cashier', 'finance'])
    );
CREATE POLICY "Cashiers approve invoices" ON public.material_invoices FOR
UPDATE USING (
        public.has_any_role(ARRAY ['admin', 'cashier'])
    );
-- 2. Trigger function to automatically log COGS in Finance Ledger upon Approval
CREATE OR REPLACE FUNCTION trg_cogs_on_material_approval() RETURNS TRIGGER AS $$
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
-- Insert the COGS ledger entry
INSERT INTO public.finance_ledger (
        code,
        category,
        amount,
        description,
        sales_order_id,
        user_id
    )
VALUES (
        generate_transaction_code('LG'),
        'cogs',
        NEW.total_amount,
        'Material Reimbursement for ' || v_code || ' by ' || v_vendor_name,
        v_so_id,
        NEW.vendor_id
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trigger_material_approval_cogs
AFTER
UPDATE ON public.material_invoices FOR EACH ROW EXECUTE FUNCTION trg_cogs_on_material_approval();