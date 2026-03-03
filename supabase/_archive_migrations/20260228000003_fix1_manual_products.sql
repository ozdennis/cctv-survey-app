-- Remove camera_types dependency from vendor_surveys / survey_line_items
ALTER TABLE survey_line_items DROP COLUMN IF EXISTS camera_type_id;
DROP TABLE IF EXISTS camera_types CASCADE;
-- Ensure plain text columns exist
ALTER TABLE survey_line_items
ADD COLUMN IF NOT EXISTS product_brand TEXT,
    -- e.g. "Hikvision"
ADD COLUMN IF NOT EXISTS product_name TEXT,
    -- e.g. "DS-2CD2143G2-I"
ADD COLUMN IF NOT EXISTS product_spec TEXT;
-- e.g. "4MP AcuSense, IR 40m, IP67"