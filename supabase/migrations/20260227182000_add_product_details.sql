-- Add columns to support rich product data from the deep scrape
ALTER TABLE public.camera_types
ADD COLUMN category text;
ALTER TABLE public.camera_types
ADD COLUMN features text;