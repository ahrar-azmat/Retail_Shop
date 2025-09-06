-- Create a view for profit and loss calculations
CREATE OR REPLACE VIEW public.profit_loss_summary AS
SELECT 
  t.owner_id,
  DATE_TRUNC('month', t.created_at) as month,
  SUM(CASE WHEN t.transaction_type = 'sale' THEN t.total_amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN t.transaction_type = 'sale' THEN (t.quantity * i.cost_price) ELSE 0 END) as total_cost,
  SUM(CASE WHEN t.transaction_type = 'sale' THEN (t.total_amount - (t.quantity * i.cost_price)) ELSE 0 END) as gross_profit,
  COUNT(CASE WHEN t.transaction_type = 'sale' THEN 1 END) as total_sales
FROM public.transactions t
JOIN public.inventory_items i ON t.item_id = i.id
WHERE t.transaction_type = 'sale'
GROUP BY t.owner_id, DATE_TRUNC('month', t.created_at);

-- Create RLS policy for the view
ALTER VIEW public.profit_loss_summary SET (security_invoker = true);
