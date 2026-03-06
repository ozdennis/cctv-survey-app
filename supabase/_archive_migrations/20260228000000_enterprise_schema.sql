-- Phase 8: Enterprise Database Schema Overhaul
-- 1. Wipe Old Prototype Tables (except users and camera_types)
DROP TABLE IF EXISTS public.material_list CASCADE;
DROP TABLE IF EXISTS public.camera_points CASCADE;
DROP TABLE IF EXISTS public.survey_details CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
-- 2. Clean Roles and Users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS roles TEXT [] DEFAULT '{Vendor}'::TEXT [];
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- Migrate old 'role' to 'roles' array if 'role' column exists
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'role'
) THEN EXECUTE 'UPDATE public.users SET roles = ARRAY [role] WHERE role IS NOT NULL; ALTER TABLE public.users DROP COLUMN role CASCADE;';
END IF;
END $$;
-- 3. Security Definer Function for RBAC
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT) RETURNS BOOLEAN AS $$
DECLARE user_roles TEXT [];
BEGIN
SELECT roles INTO user_roles
FROM public.users
WHERE id = auth.uid();
RETURN required_role = ANY(user_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
CREATE OR REPLACE FUNCTION public.has_any_role(required_roles TEXT []) RETURNS BOOLEAN AS $$
DECLARE user_roles TEXT [];
BEGIN
SELECT roles INTO user_roles
FROM public.users
WHERE id = auth.uid();
RETURN user_roles && required_roles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
-- 4. Create Tables
-- Sales Orders
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    -- e.g., SO-YYYYMMDD-XXXX
    customer_name TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    site_type TEXT NOT NULL,
    -- Residential, Commercial, Industrial
    camera_count_estimate INTEGER DEFAULT 0,
    specific_requirements TEXT,
    status TEXT DEFAULT 'New',
    -- New, Survey Scheduled, Surveyed, Invoiced, Paid, WorkOrder, Completed
    sales_rep_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Vendor Surveys
CREATE TABLE IF NOT EXISTS public.vendor_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID UNIQUE REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.users(id),
    schedule_date TIMESTAMPTZ,
    estimated_survey_cost NUMERIC DEFAULT 0,
    schedule_edit_count INTEGER DEFAULT 0,
    site_map_url TEXT,
    include_survey_cost BOOLEAN DEFAULT TRUE,
    finalized BOOLEAN DEFAULT FALSE,
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Survey Camera Zones (The actual physical locations to be covered)
CREATE TABLE IF NOT EXISTS public.survey_camera_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.vendor_surveys(id) ON DELETE CASCADE,
    zone_label TEXT NOT NULL,
    indoor_outdoor TEXT NOT NULL,
    mounting_height_meters NUMERIC,
    fov_angle TEXT,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Survey Materials (Equipment list)
CREATE TABLE IF NOT EXISTS public.survey_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES public.vendor_surveys(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.camera_types(id),
    custom_name TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Proforma Invoices (Platform Invoices managed by Finance)
CREATE TABLE IF NOT EXISTS public.proforma_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID UNIQUE REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    finance_id UUID REFERENCES public.users(id),
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    down_payment_required NUMERIC NOT NULL DEFAULT 0,
    customer_payment_proof_url TEXT,
    vendor_payment_proof_url TEXT,
    status TEXT DEFAULT 'Draft',
    -- Draft, Issued, Paid Partial, Paid Full
    payment_terms TEXT DEFAULT '50% DP / 50% Completion',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Work Orders
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID UNIQUE REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'INSTALL',
    -- INSTALL or MAINT
    vendor_id UUID REFERENCES public.users(id),
    schedule_date TIMESTAMPTZ,
    signed_checklist_url TEXT,
    finalized BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'Pending Exec',
    -- Pending Exec, In Progress, Completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Work Order Evidence
CREATE TABLE IF NOT EXISTS public.work_order_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES public.survey_camera_zones(id),
    installed_photo_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Finance Ledgers
CREATE TABLE IF NOT EXISTS public.finance_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    -- REVENUE, COGS, OPEX, OWNER_DRAW, TAX_RESERVE
    amount NUMERIC NOT NULL,
    description TEXT,
    recorded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 5. Strict RLS Policies
-- Enable RLS everywhere
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_camera_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proforma_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_types ENABLE ROW LEVEL SECURITY;
-- Drop all old policies to prevent conflicts from prototype phase
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
DROP POLICY IF EXISTS "Admins can update everyone." ON public.users;
DROP POLICY IF EXISTS "Users can read own profile." ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Anyone can read products" ON public.camera_types;
DROP POLICY IF EXISTS "Admins can manage products" ON public.camera_types;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.camera_types;
DROP POLICY IF EXISTS "Enable all access for admin users" ON public.camera_types;
-- Users RLS
DROP POLICY IF EXISTS "Sales can read all users" ON public.users;
DROP POLICY IF EXISTS "CS can read all users" ON public.users;
DROP POLICY IF EXISTS "Finance can read all users" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users FOR
SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.users FOR
UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING (public.has_role('Admin'));
CREATE POLICY "Sales can read all users" ON public.users FOR
SELECT USING (public.has_role('Sales'));
CREATE POLICY "CS can read all users" ON public.users FOR
SELECT USING (public.has_role('CS'));
CREATE POLICY "Finance can read all users" ON public.users FOR
SELECT USING (public.has_role('Finance'));
-- Sales Orders RLS
DROP POLICY IF EXISTS "Sales can view all SOs" ON public.sales_orders;
DROP POLICY IF EXISTS "Vendors can view assigned SOs" ON public.sales_orders;
DROP POLICY IF EXISTS "Sales can insert SOs" ON public.sales_orders;
DROP POLICY IF EXISTS "Sales can update SOs" ON public.sales_orders;
CREATE POLICY "Sales can view all SOs" ON public.sales_orders FOR
SELECT USING (
        public.has_role('Sales')
        OR public.has_role('Admin')
        OR public.has_role('Finance')
        OR public.has_role('CS')
    );
CREATE POLICY "Vendors can view assigned SOs" ON public.sales_orders FOR
SELECT USING (
        id IN (
            SELECT sales_order_id
            FROM public.vendor_surveys
            WHERE vendor_id = auth.uid()
        )
        OR id IN (
            SELECT sales_order_id
            FROM public.work_orders
            WHERE vendor_id = auth.uid()
        )
    );
CREATE POLICY "Sales can insert SOs" ON public.sales_orders FOR
INSERT WITH CHECK (
        public.has_role('Sales')
        OR public.has_role('Admin')
        OR public.has_role('CS')
    );
CREATE POLICY "Sales can update SOs" ON public.sales_orders FOR
UPDATE USING (
        public.has_role('Sales')
        OR public.has_role('Admin')
        OR public.has_role('CS')
    ) WITH CHECK (
        public.has_role('Sales')
        OR public.has_role('Admin')
        OR public.has_role('CS')
    );
-- Vendor Surveys
DROP POLICY IF EXISTS "Vendors can view own surveys" ON public.vendor_surveys;
DROP POLICY IF EXISTS "Vendors can insert own surveys" ON public.vendor_surveys;
DROP POLICY IF EXISTS "Vendors can update own surveys" ON public.vendor_surveys;
DROP POLICY IF EXISTS "Sales and Admin can manage surveys" ON public.vendor_surveys;
CREATE POLICY "Vendors can view own surveys" ON public.vendor_surveys FOR
SELECT USING (
        vendor_id = auth.uid()
        OR public.has_role('Sales')
        OR public.has_role('Admin')
        OR public.has_role('Finance')
        OR public.has_role('CS')
    );
CREATE POLICY "Vendors can insert own surveys" ON public.vendor_surveys FOR
INSERT WITH CHECK (
        vendor_id = auth.uid()
        AND (
            public.has_role('Vendor')
            OR public.has_role('Admin')
        )
    );
CREATE POLICY "Vendors can update own surveys" ON public.vendor_surveys FOR
UPDATE USING (
        vendor_id = auth.uid()
        AND finalized = false
    ) WITH CHECK (vendor_id = auth.uid());
CREATE POLICY "Sales and Admin can manage surveys" ON public.vendor_surveys FOR ALL USING (
    public.has_role('Sales')
    OR public.has_role('Admin')
);
-- Camera Zones & Materials inherited access
DROP POLICY IF EXISTS "Vendors can manage zones for own survey" ON public.survey_camera_zones;
DROP POLICY IF EXISTS "Vendors can manage materials for own survey" ON public.survey_materials;
CREATE POLICY "Vendors can manage zones for own survey" ON public.survey_camera_zones FOR ALL USING (
    survey_id IN (
        SELECT id
        FROM public.vendor_surveys
        WHERE vendor_id = auth.uid()
    )
    OR public.has_role('Admin')
    OR public.has_role('Sales')
);
CREATE POLICY "Vendors can manage materials for own survey" ON public.survey_materials FOR ALL USING (
    survey_id IN (
        SELECT id
        FROM public.vendor_surveys
        WHERE vendor_id = auth.uid()
    )
    OR public.has_role('Admin')
    OR public.has_role('Sales')
);
-- Proforma Invoices
DROP POLICY IF EXISTS "Finance, Sales, Admin can access invoices" ON public.proforma_invoices;
CREATE POLICY "Finance, Sales, Admin can access invoices" ON public.proforma_invoices FOR ALL USING (
    public.has_any_role(ARRAY ['Finance', 'Sales', 'Admin'])
);
-- Work Orders
DROP POLICY IF EXISTS "Vendors can view assigned WOs" ON public.work_orders;
DROP POLICY IF EXISTS "Vendors can update assigned WOs" ON public.work_orders;
DROP POLICY IF EXISTS "Admin and Sales manage WOs" ON public.work_orders;
CREATE POLICY "Vendors can view assigned WOs" ON public.work_orders FOR
SELECT USING (
        vendor_id = auth.uid()
        OR public.has_any_role(ARRAY ['Sales', 'Admin', 'CS', 'Finance'])
    );
CREATE POLICY "Vendors can update assigned WOs" ON public.work_orders FOR
UPDATE USING (
        vendor_id = auth.uid()
        AND finalized = false
    ) WITH CHECK (vendor_id = auth.uid());
CREATE POLICY "Admin and Sales manage WOs" ON public.work_orders FOR ALL USING (
    public.has_any_role(ARRAY ['Sales', 'Admin', 'CS'])
);
-- Work Order Evidence
DROP POLICY IF EXISTS "Vendors can add evidence" ON public.work_order_evidence;
CREATE POLICY "Vendors can add evidence" ON public.work_order_evidence FOR ALL USING (
    work_order_id IN (
        SELECT id
        FROM public.work_orders
        WHERE vendor_id = auth.uid()
    )
    OR public.has_any_role(ARRAY ['Sales', 'Admin', 'CS'])
);
-- Finance Ledgers
DROP POLICY IF EXISTS "Finance and Admin can manage ledgers" ON public.finance_ledgers;
CREATE POLICY "Finance and Admin can manage ledgers" ON public.finance_ledgers FOR ALL USING (
    public.has_any_role(ARRAY ['Finance', 'Admin'])
);
-- Audit Logs
DROP POLICY IF EXISTS "Readonly for most, Insert via triggers/server" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can manage audit logs" ON public.audit_logs;
CREATE POLICY "Readonly for most, Insert via triggers/server" ON public.audit_logs FOR
SELECT USING (
        public.has_any_role(ARRAY ['Admin', 'Sales', 'Finance', 'CS'])
    );
CREATE POLICY "Admins can manage audit logs" ON public.audit_logs FOR ALL USING (public.has_role('Admin'));
-- Camera Types (Products)
DROP POLICY IF EXISTS "Anyone can read products" ON public.camera_types;
DROP POLICY IF EXISTS "Admins can manage products" ON public.camera_types;
CREATE POLICY "Anyone can read products" ON public.camera_types FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage products" ON public.camera_types FOR ALL USING (public.has_role('Admin'));