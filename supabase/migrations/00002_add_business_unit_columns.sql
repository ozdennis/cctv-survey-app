-- Migration: Add business_unit column to finance tables (Phase 1)
-- Generated per existing patterns in 00001_docs_first_baseline.sql

ALTER TABLE finance.customer_invoices 
ADD COLUMN IF NOT EXISTS business_unit TEXT 
CHECK (business_unit IN ('cctv', 'web', 'maintenance'));
COMMENT ON COLUMN finance.customer_invoices.business_unit IS 
'Business unit: cctv=surveillance projects, web=hosting services, maintenance=service contracts';

ALTER TABLE finance.vendor_invoices 
ADD COLUMN IF NOT EXISTS business_unit TEXT 
CHECK (business_unit IN ('cctv', 'web', 'maintenance'));
COMMENT ON COLUMN finance.vendor_invoices.business_unit IS 
'Business unit associated with vendor invoice';

ALTER TABLE finance.finance_ledger 
ADD COLUMN IF NOT EXISTS business_unit TEXT 
CHECK (business_unit IN ('cctv', 'web', 'maintenance'));
COMMENT ON COLUMN finance.finance_ledger.business_unit IS 
'Business unit for transaction categorization and reporting';

-- Safety note: Columns nullable initially. Backfill script + NOT NULL constraint in next migration after data review.
