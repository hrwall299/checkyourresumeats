CREATE TABLE public.premium_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL DEFAULT 9,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed')),
  provider_order_id TEXT,
  provider_payment_id TEXT UNIQUE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.premium_purchases TO authenticated;
GRANT ALL ON public.premium_purchases TO service_role;
ALTER TABLE public.premium_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own premium purchases" ON public.premium_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create fixed-price pending purchases" ON public.premium_purchases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND amount = 9 AND currency = 'INR' AND payment_status = 'pending' AND provider_order_id IS NULL AND provider_payment_id IS NULL AND verified_at IS NULL);

CREATE TABLE public.premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  purchase_id UUID NOT NULL UNIQUE REFERENCES public.premium_purchases(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.premium_subscriptions TO authenticated;
GRANT ALL ON public.premium_subscriptions TO service_role;
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own premium subscriptions" ON public.premium_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.activate_premium_after_verified_payment(_purchase_id UUID, _provider_payment_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  purchase_row public.premium_purchases%ROWTYPE;
  subscription_id UUID;
  verified_time TIMESTAMPTZ := now();
BEGIN
  IF _provider_payment_id IS NULL OR length(trim(_provider_payment_id)) = 0 THEN
    RAISE EXCEPTION 'A verified provider payment reference is required';
  END IF;

  SELECT * INTO purchase_row FROM public.premium_purchases WHERE id = _purchase_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase not found';
  END IF;
  IF purchase_row.amount <> 9 OR purchase_row.currency <> 'INR' THEN
    RAISE EXCEPTION 'Purchase amount is not eligible for ATS Boost';
  END IF;

  IF purchase_row.payment_status = 'verified' THEN
    IF purchase_row.provider_payment_id <> _provider_payment_id THEN
      RAISE EXCEPTION 'Purchase was verified against a different provider payment';
    END IF;
    SELECT id INTO subscription_id FROM public.premium_subscriptions WHERE purchase_id = _purchase_id;
    RETURN subscription_id;
  END IF;
  IF purchase_row.payment_status <> 'pending' THEN
    RAISE EXCEPTION 'Purchase is not pending';
  END IF;

  UPDATE public.premium_purchases
  SET payment_status = 'verified', provider_payment_id = _provider_payment_id, verified_at = verified_time
  WHERE id = _purchase_id;

  UPDATE public.premium_subscriptions
  SET status = 'expired'
  WHERE user_id = purchase_row.user_id AND status = 'active';

  INSERT INTO public.premium_subscriptions (user_id, purchase_id, status, started_at, expires_at)
  VALUES (purchase_row.user_id, purchase_row.id, 'active', verified_time, verified_time + interval '3 months')
  RETURNING id INTO subscription_id;

  RETURN subscription_id;
END;
$$;
REVOKE ALL ON FUNCTION public.activate_premium_after_verified_payment(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_premium_after_verified_payment(UUID, TEXT) TO service_role;