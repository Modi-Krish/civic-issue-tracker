-- Migration: Allow department users to update issues in their department
-- This fixes the "Mark Solved" button on the department dashboard.
-- Run this in your Supabase SQL Editor.

-- Drop the existing update policy (it only allows admin + biker)
DROP POLICY IF EXISTS "Admins and bikers can update issues" ON public.issues;

-- Create a new update policy that also allows department users
CREATE POLICY "Authorized users can update issues"
  ON public.issues FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (
        u.role = 'admin'
        OR (u.role = 'biker' AND public.issues.assigned_biker_id = auth.uid())
        OR (u.role = 'department' AND public.issues.department_id = u.department_id)
      )
    )
  );
