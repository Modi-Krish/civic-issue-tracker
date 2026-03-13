-- =============================================
-- Civic Issue Tracker: Solve Feature Migration
-- =============================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/exyyxovmxpoojuhqzzwd/sql/new

-- Allow department users to update (resolve) issues in their own department
DROP POLICY IF EXISTS "Admins and bikers can update issues" ON public.issues;

DO $$ BEGIN
  CREATE POLICY "Admins bikers and departments can update issues"
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

SELECT 'Migration complete!' AS status;
