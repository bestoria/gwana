-- Enable RLS for users and subscriptions tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Reset existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

-- -------------------------------------------------------------
-- Policies for the "users" table
-- -------------------------------------------------------------

-- 1. SELECT: Users can view their own profile.
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = auth_id);

-- 2. UPDATE: Users can update their own profile.
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_id) 
WITH CHECK (auth.uid() = auth_id);

-- -------------------------------------------------------------
-- Policies for the "subscriptions" table
-- -------------------------------------------------------------

-- 1. SELECT: Users can view their own subscription.
-- This policy checks if the user_id on the subscription matches the id of the user whose auth_id matches the current user's UID.
CREATE POLICY "Users can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = subscriptions.user_id AND users.auth_id = auth.uid()
  )
);

-- NOTE on subscription updates:
-- It is generally recommended to handle subscription creations and updates via trusted backend services (like Supabase Edge Functions or webhooks from a payment provider) rather than allowing direct client-side updates.
-- This prevents users from tampering with their subscription status. For this reason, INSERT and UPDATE policies for the client are omitted here.

