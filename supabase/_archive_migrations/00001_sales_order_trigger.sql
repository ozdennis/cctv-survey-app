-- Phase 10: Auto-generate Sales Order Codes (SO-YYYYMMDD-XXXX)
CREATE SEQUENCE IF NOT EXISTS public.sales_order_seq START 1;
CREATE OR REPLACE FUNCTION public.generate_so_code() RETURNS TRIGGER AS $$
DECLARE date_part TEXT;
seq_part TEXT;
BEGIN -- Format date as YYYYMMDD
date_part := TO_CHAR(NOW(), 'YYYYMMDD');
-- Get next sequence value and pad with zeros
seq_part := LPAD(NEXTVAL('public.sales_order_seq')::TEXT, 4, '0');
-- Combine to form the code, only if it wasn't explicitly provided
IF NEW.code IS NULL THEN NEW.code := 'SO-' || date_part || '-' || seq_part;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_generate_so_code ON public.sales_orders;
CREATE TRIGGER trigger_generate_so_code BEFORE
INSERT ON public.sales_orders FOR EACH ROW EXECUTE FUNCTION public.generate_so_code();