-- ─────────────────────────────────────────────────────────────────────────────
-- Finance: Add business_unit tracking for multi-revenue streams
-- ─────────────────────────────────────────────────────────────────────────────

-- Add business_unit to finance_ledger
ALTER TABLE finance.finance_ledger 
ADD COLUMN IF NOT EXISTS business_unit TEXT 
CHECK (business_unit IN ('cctv', 'web', 'maintenance'));

COMMENT ON COLUMN finance.finance_ledger.business_unit IS 
'Business unit owning this transaction: cctv (surveillance), web (hosting), maintenance (service contracts)';

-- Add business_unit to customer_invoices
ALTER TABLE finance.customer_invoices 
ADD COLUMN IF NOT EXISTS business_unit TEXT 
CHECK (business_unit IN ('cctv', 'web', 'maintenance'));

COMMENT ON COLUMN finance.customer_invoices.business_unit IS 
'Business unit for revenue tracking: cctv (surveillance), web (hosting), maintenance (service contracts)';

-- Add business_unit to vendor_invoices
ALTER TABLE finance.vendor_invoices 
ADD COLUMN IF NOT EXISTS business_unit TEXT 
CHECK (business_unit IN ('cctv', 'web', 'maintenance'));

COMMENT ON COLUMN finance.vendor_invoices.business_unit IS 
'Business unit for cost tracking: cctv (surveillance), web (hosting), maintenance (service contracts)';

-- Update existing records to default 'cctv' (legacy data)
UPDATE finance.finance_ledger SET business_unit = 'cctv' WHERE business_unit IS NULL;
UPDATE finance.customer_invoices SET business_unit = 'cctv' WHERE business_unit IS NULL;
UPDATE finance.vendor_invoices SET business_unit = 'cctv' WHERE business_unit IS NULL;

-- Make columns NOT NULL after backfill
ALTER TABLE finance.finance_ledger ALTER COLUMN business_unit SET NOT NULL;
ALTER TABLE finance.customer_invoices ALTER COLUMN business_unit SET NOT NULL;
ALTER TABLE finance.vendor_invoices ALTER COLUMN business_unit SET NOT NULL;

</contents>