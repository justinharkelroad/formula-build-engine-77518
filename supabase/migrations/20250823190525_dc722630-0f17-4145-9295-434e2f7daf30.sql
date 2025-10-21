-- First, let's check if we have authentication and user roles set up
-- We need to create a user roles system for admin access

-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table to manage admin access
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check if user is admin
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Drop existing public policies that allow unrestricted access
DROP POLICY IF EXISTS "Admin can insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admin can view all registrations" ON public.registrations;

-- Create secure RLS policies for registrations table
-- Only authenticated admin users can access registration data
CREATE POLICY "Only admins can view registrations" 
ON public.registrations 
FOR SELECT 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can insert registrations" 
ON public.registrations 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update registrations" 
ON public.registrations 
FOR UPDATE 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete registrations" 
ON public.registrations 
FOR DELETE 
TO authenticated
USING (public.is_admin());

-- Also fix the analytics_events table security issue
DROP POLICY IF EXISTS "Admin can insert analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admin can view all analytics events" ON public.analytics_events;

CREATE POLICY "Only admins can view analytics events" 
ON public.analytics_events 
FOR SELECT 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

-- Create RLS policy for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Set search_path for the function to fix the linter warning
ALTER FUNCTION public.is_admin() SET search_path = public, auth;