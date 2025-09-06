-- Create a view for low stock alerts
CREATE OR REPLACE VIEW public.low_stock_items AS
SELECT 
  i.*,
  (i.quantity_in_stock - i.min_stock_level) as stock_difference
FROM public.inventory_items i
WHERE i.quantity_in_stock <= i.min_stock_level
ORDER BY (i.quantity_in_stock - i.min_stock_level) ASC;

-- Create RLS policy for the view
ALTER VIEW public.low_stock_items SET (security_invoker = true);
