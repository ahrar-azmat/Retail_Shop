-- Create transactions table for sales tracking
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'purchase', 'adjustment')),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Owners can manage their transactions" ON public.transactions
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Clients can view transactions from their owner" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'client'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_owner_id ON public.transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item_id ON public.transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);
