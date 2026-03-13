-- ============================================================
-- Civic Issue Tracking & Management System – Database Schema
-- Run this SQL in your Supabase SQL Editor (or via psql).
-- ============================================================

-- Enable the uuid-ossp extension (usually already enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- 1. DEPARTMENTS
-- ----------------------------------------------------------
CREATE TABLE public.departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial departments
INSERT INTO public.departments (name, description) VALUES
  ('Road',        'Road maintenance, potholes, and traffic issues'),
  ('Electricity', 'Power outages, street lights, and electrical hazards'),
  ('Garbage',     'Waste collection, dumping, and sanitation'),
  ('Water',       'Water supply, leakage, and drainage issues'),
  ('Sanitation',  'Public hygiene, sewage, and cleanliness');

-- ----------------------------------------------------------
-- 2. USERS  (extends Supabase auth.users)
-- ----------------------------------------------------------
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'department'
                CHECK (role IN ('admin', 'biker', 'department')),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast role-based lookups
CREATE INDEX idx_users_role ON public.users(role);

-- ----------------------------------------------------------
-- 3. ISSUES
-- ----------------------------------------------------------
CREATE TABLE public.issues (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT,

  -- GIS coordinates
  lat              DOUBLE PRECISION NOT NULL,
  lng              DOUBLE PRECISION NOT NULL,

  -- Evidence
  photo_url        TEXT,

  -- Status & priority
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'in_progress', 'resolved')),
  priority         TEXT NOT NULL DEFAULT 'low'
                   CHECK (priority IN ('low', 'medium', 'high')),

  -- Relations
  department_id    UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  assigned_biker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reported_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at      TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_issues_status        ON public.issues(status);
CREATE INDEX idx_issues_priority      ON public.issues(priority);
CREATE INDEX idx_issues_department    ON public.issues(department_id);
CREATE INDEX idx_issues_biker         ON public.issues(assigned_biker_id);
CREATE INDEX idx_issues_coordinates   ON public.issues(lat, lng);

-- ----------------------------------------------------------
-- 4. ISSUE UPDATES  (activity log / before-after proof)
-- ----------------------------------------------------------
CREATE TABLE public.issue_updates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id    UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  comment     TEXT,
  photo_url   TEXT,            -- before/after proof image
  old_status  TEXT,
  new_status  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_issue_updates_issue ON public.issue_updates(issue_id);

-- ----------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) – enable & basic policies
-- ----------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.departments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;

-- Departments: readable by everyone authenticated
CREATE POLICY "Departments are viewable by authenticated users"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

-- Users: can read own profile; admins can read all
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Issues: viewable by admin, assigned biker, reporter, or department member
CREATE POLICY "Issues viewable by role"
  ON public.issues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (
        u.role = 'admin'
        OR (u.role = 'biker' AND (
              public.issues.assigned_biker_id = auth.uid()
              OR public.issues.reported_by = auth.uid()
           ))
        OR (u.role = 'department' AND public.issues.department_id = u.department_id)
      )
    )
  );

-- Issues: admins and bikers can insert
CREATE POLICY "Admins and bikers can create issues"
  ON public.issues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'biker')
    )
  );

-- Issues: admins and assigned bikers can update
CREATE POLICY "Admins and bikers can update issues"
  ON public.issues FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.role = 'admin' OR (u.role = 'biker' AND public.issues.assigned_biker_id = auth.uid()))
    )
  );

-- Issue Updates: viewable same as issues
CREATE POLICY "Issue updates viewable by role"
  ON public.issue_updates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.issues i
      JOIN public.users u ON u.id = auth.uid()
      WHERE i.id = public.issue_updates.issue_id
      AND (
        u.role = 'admin'
        OR (u.role = 'biker' AND i.assigned_biker_id = auth.uid())
        OR (u.role = 'department' AND i.department_id = u.department_id)
      )
    )
  );

-- Issue Updates: bikers and admins can insert
CREATE POLICY "Bikers and admins can create issue updates"
  ON public.issue_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'biker')
    )
  );

-- ----------------------------------------------------------
-- 6. FUNCTION: Auto-create public.users row on signup
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'department')
  );
  RETURN NEW;
END;
$$;

-- Trigger: fire after a new auth user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------
-- 7. STORAGE BUCKET (run separately if not using SQL for storage)
-- ----------------------------------------------------------
-- Supabase Storage bucket for issue photos:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('issue-photos', 'issue-photos', true);
