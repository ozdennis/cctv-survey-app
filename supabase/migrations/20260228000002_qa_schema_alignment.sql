-- Align schema to strictly pass cctv-qa-complete.md SQL tests
-- 1. Create transaction_sequences
CREATE TABLE IF NOT EXISTS public.transaction_sequences (
    doc_type TEXT PRIMARY KEY,
    seq_date DATE NOT NULL,
    last_seq INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.transaction_sequences ENABLE ROW LEVEL SECURITY;
-- Internal table, no RLS policies needed if accessed only via SEC DEFINER RPC
-- 2. Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    site_type TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales and Admin can manage customers" ON public.customers FOR ALL USING (
    public.has_any_role(ARRAY ['Sales', 'Admin', 'CS'])
);
-- 3. Modify sales_orders to strictly match QA
-- cctv-qa-complete.md refers to: id, code, customer_id, sales_rep_id, order_type, camera_count_est, requirements, status
ALTER TABLE public.sales_orders
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id),
    ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'installation';
-- The QA script expects requirements, camera_count_est instead of specific_requirements, camera_count_estimate
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'sales_orders'
        AND column_name = 'specific_requirements'
) THEN
ALTER TABLE public.sales_orders
    RENAME COLUMN specific_requirements TO requirements;
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'sales_orders'
        AND column_name = 'camera_count_estimate'
) THEN
ALTER TABLE public.sales_orders
    RENAME COLUMN camera_count_estimate TO camera_count_est;
END IF;
END $$;
-- 4. Vendor Surveys
ALTER TABLE public.vendor_surveys
ADD COLUMN IF NOT EXISTS editable_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'vendor_surveys'
        AND column_name = 'estimated_survey_cost'
) THEN
ALTER TABLE public.vendor_surveys
    RENAME COLUMN estimated_survey_cost TO survey_cost;
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'vendor_surveys'
        AND column_name = 'include_survey_cost'
) THEN
ALTER TABLE public.vendor_surveys
    RENAME COLUMN include_survey_cost TO include_cost;
END IF;
END $$;
-- 5. Survey Line Items & Photos & Changelogs
CREATE TABLE IF NOT EXISTS public.survey_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.vendor_surveys(id) ON DELETE CASCADE,
    item_type TEXT,
    description TEXT,
    quantity INTEGER,
    unit_cost NUMERIC,
    placement TEXT,
    mount_height NUMERIC,
    fov_angle TEXT,
    power_method TEXT
);
ALTER TABLE public.survey_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors manage survey line items" ON public.survey_line_items FOR ALL USING (
    survey_id IN (
        SELECT id
        FROM public.vendor_surveys
        WHERE vendor_id = auth.uid()
    )
    OR public.has_any_role(ARRAY ['Admin', 'Sales'])
);
CREATE TABLE IF NOT EXISTS public.survey_changelogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.vendor_surveys(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES public.users(id),
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.survey_changelogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Readonly for most" ON public.survey_changelogs FOR
SELECT USING (true);
-- simplify read
CREATE TABLE IF NOT EXISTS public.survey_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.vendor_surveys(id) ON DELETE CASCADE,
    photo_url TEXT
);
ALTER TABLE public.survey_photos ENABLE ROW LEVEL SECURITY;
-- 6. Schedule Entries (Calendar)
CREATE TABLE IF NOT EXISTS public.schedule_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_type TEXT,
    linked_id UUID,
    vendor_id UUID REFERENCES public.users(id),
    scheduled_at TIMESTAMPTZ,
    edit_count INTEGER DEFAULT 0,
    last_edited_by UUID REFERENCES public.users(id)
);
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors manage schedule" ON public.schedule_entries FOR ALL USING (
    vendor_id = auth.uid()
    OR public.has_any_role(ARRAY ['Admin','Sales'])
);
-- 7. Work Orders - dp_verified Generated Column
ALTER TABLE public.work_orders
ADD COLUMN IF NOT EXISTS customer_dp_image_url TEXT,
    ADD COLUMN IF NOT EXISTS vendor_dp_image_url TEXT,
    ADD COLUMN IF NOT EXISTS pdf_url TEXT;
-- Drop standard column if it exists to replace with GENERATED ALWAYS
ALTER TABLE public.work_orders DROP COLUMN IF EXISTS dp_verified;
ALTER TABLE public.work_orders
ADD COLUMN dp_verified BOOLEAN GENERATED ALWAYS AS (
        customer_dp_image_url IS NOT NULL
        AND vendor_dp_image_url IS NOT NULL
    ) STORED;
CREATE TABLE IF NOT EXISTS public.wo_camera_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    camera_number INTEGER,
    photo_url TEXT,
    zone_label TEXT,
    image_quality_ok BOOLEAN DEFAULT FALSE,
    night_vision_ok BOOLEAN DEFAULT FALSE,
    recording_ok BOOLEAN DEFAULT FALSE,
    remote_access_ok BOOLEAN DEFAULT FALSE,
    customer_demo_ok BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.wo_camera_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors manage WO cameras" ON public.wo_camera_uploads FOR ALL USING (
    work_order_id IN (
        SELECT id
        FROM public.work_orders
        WHERE vendor_id = auth.uid()
    )
    OR public.has_any_role(ARRAY ['Admin', 'Sales'])
);
-- 8. Portfolio Entries
CREATE TABLE IF NOT EXISTS public.portfolio_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES public.work_orders(id),
    customer_id UUID REFERENCES public.customers(id),
    added_by UUID REFERENCES public.users(id),
    description TEXT,
    images JSONB
);
ALTER TABLE public.portfolio_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales and Admin portfolio access" ON public.portfolio_entries FOR ALL USING (public.has_any_role(ARRAY ['Admin', 'Sales']));
-- 9. Maintenance Tickets
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type TEXT,
    customer_id UUID REFERENCES public.customers(id),
    contact TEXT,
    phone TEXT,
    linked_so_id UUID REFERENCES public.sales_orders(id),
    issue TEXT,
    stage TEXT DEFAULT 'open',
    notes TEXT,
    created_by UUID REFERENCES public.users(id)
);
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CS and Admin manage maint" ON public.maintenance_tickets FOR ALL USING (
    public.has_any_role(ARRAY ['Admin', 'CS', 'Sales'])
);
-- 10. Finance Ledger Mapping (finance_ledgers -> finance_ledger)
-- Actually let's rename finance_ledgers to finance_ledger if it exists
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'finance_ledgers'
) THEN
ALTER TABLE public.finance_ledgers
    RENAME TO finance_ledger;
END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.finance_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    linked_id UUID,
    linked_type TEXT,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    recorded_by UUID REFERENCES public.users(id),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    tax_reserve NUMERIC GENERATED ALWAYS AS (
        CASE
            WHEN category = 'revenue' THEN ROUND(amount * 0.005)
            ELSE 0
        END
    ) STORED
);
ALTER TABLE public.finance_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finance manage ledger" ON public.finance_ledger FOR ALL USING (public.has_any_role(ARRAY ['Admin','Finance']));
-- 11. Proforma Invoices Schema Alignment
ALTER TABLE public.proforma_invoices
ADD COLUMN IF NOT EXISTS invoice_type TEXT,
    ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES public.users(id),
    ADD COLUMN IF NOT EXISTS line_items JSONB,
    ADD COLUMN IF NOT EXISTS pdf_url TEXT;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'proforma_invoices'
        AND column_name = 'total'
) THEN
ALTER TABLE public.proforma_invoices
    RENAME COLUMN total TO total_amount;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'proforma_invoices'
        AND column_name = 'survey_id'
) THEN
ALTER TABLE public.proforma_invoices
ADD COLUMN survey_id UUID REFERENCES public.vendor_surveys(id);
END IF;
END $$;
-- 12. RPC for Atomic Seq Generation
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
$$ LANGUAGE plpgsql SECURITY DEFINER;