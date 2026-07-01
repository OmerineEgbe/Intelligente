-- ══════════════════════════════════════════════════════════════════
-- Intelligente — Role-Based Access Control (RBAC)
-- Replaces the single profiles.role column with a full RBAC system.
--
-- Structure:
--   roles            — named roles (admin, student, content_manager, analyst…)
--   permissions      — atomic capabilities (resource:action pairs)
--   role_permissions — which permissions each role grants
--   user_roles       — which roles each user holds (many-to-many)
--
-- Run in Supabase SQL Editor.
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Roles ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        UNIQUE NOT NULL,
  description text,
  color       text        DEFAULT '#64748b',   -- hex for UI badge
  created_at  timestamptz DEFAULT now()
);

-- ── 2. Permissions ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS permissions (
  id          uuid   PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text   UNIQUE NOT NULL,   -- e.g. 'universities:write'
  description text,
  resource    text   NOT NULL,          -- e.g. 'universities'
  action      text   NOT NULL,          -- 'read' | 'write' | 'delete' | 'manage'
  created_at  timestamptz DEFAULT now()
);

-- ── 3. Role → Permission mapping ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       uuid REFERENCES roles(id)       ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ── 4. User → Role mapping ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_roles (
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id     uuid        REFERENCES roles(id)      ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid        REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id)
);

-- ── 5. Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id       ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id       ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);

-- ── 6. Seed: default roles ─────────────────────────────────────────────────

INSERT INTO roles (name, description, color) VALUES
  ('admin',           'Full access to all admin features',                    '#0c1f4a'),
  ('student',         'Regular student — access to personal dashboard only',  '#2563eb'),
  ('content_manager', 'Manage universities, programmes, and career data',     '#7c3aed'),
  ('analyst',         'View analytics, reports, and usage data',              '#059669')
ON CONFLICT (name) DO NOTHING;

-- ── 7. Seed: default permissions ───────────────────────────────────────────

INSERT INTO permissions (name, resource, action, description) VALUES
  -- Admin panel access
  ('admin:access',          'admin',         'access', 'Access the admin panel'),
  -- Universities
  ('universities:read',     'universities',  'read',   'View universities'),
  ('universities:write',    'universities',  'write',  'Add and edit universities'),
  ('universities:delete',   'universities',  'delete', 'Delete universities'),
  -- Academic units
  ('units:read',            'units',         'read',   'View academic units'),
  ('units:write',           'units',         'write',  'Add and edit academic units'),
  ('units:delete',          'units',         'delete', 'Delete academic units'),
  -- Programmes
  ('programmes:read',       'programmes',    'read',   'View programmes'),
  ('programmes:write',      'programmes',    'write',  'Add and edit programmes'),
  ('programmes:delete',     'programmes',    'delete', 'Delete programmes'),
  -- Careers
  ('careers:read',          'careers',       'read',   'View career data'),
  ('careers:write',         'careers',       'write',  'Add and edit career entries'),
  -- Students
  ('students:read',         'students',      'read',   'View student list and profiles'),
  -- Analytics
  ('analytics:read',        'analytics',     'read',   'View analytics and reports'),
  -- AI Engine
  ('ai_engine:read',        'ai_engine',     'read',   'View AI engine status'),
  -- Settings
  ('settings:read',         'settings',      'read',   'View system settings'),
  ('settings:write',        'settings',      'write',  'Change system settings'),
  -- Roles (admin only)
  ('roles:manage',          'roles',         'manage', 'Create, edit, delete roles and assign permissions')
ON CONFLICT (name) DO NOTHING;

-- ── 8. Assign permissions to roles ─────────────────────────────────────────

DO $$
DECLARE
  r_admin           uuid;
  r_student         uuid;
  r_content_manager uuid;
  r_analyst         uuid;
BEGIN
  SELECT id INTO r_admin           FROM roles WHERE name = 'admin';
  SELECT id INTO r_student         FROM roles WHERE name = 'student';
  SELECT id INTO r_content_manager FROM roles WHERE name = 'content_manager';
  SELECT id INTO r_analyst         FROM roles WHERE name = 'analyst';

  -- admin: everything
  INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM permissions
    ON CONFLICT DO NOTHING;

  -- content_manager: universities, units, programmes, careers (no students, no settings, no roles)
  INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_content_manager, id FROM permissions
    WHERE name IN (
      'admin:access',
      'universities:read', 'universities:write',
      'units:read', 'units:write',
      'programmes:read', 'programmes:write',
      'careers:read', 'careers:write'
    )
    ON CONFLICT DO NOTHING;

  -- analyst: read-only analytics + students
  INSERT INTO role_permissions (role_id, permission_id)
    SELECT r_analyst, id FROM permissions
    WHERE name IN (
      'admin:access',
      'analytics:read',
      'students:read',
      'universities:read',
      'programmes:read',
      'careers:read',
      'ai_engine:read'
    )
    ON CONFLICT DO NOTHING;

  -- student: no admin permissions at all
  -- (student role exists for user_roles tracking — no permissions needed)
END;
$$;

-- ── 9. Migrate existing users from profiles.role to user_roles ────────────
-- Skip orphaned profiles (profile exists but auth.users row is gone)

INSERT INTO user_roles (user_id, role_id)
  SELECT p.id, r.id
  FROM profiles p
  JOIN roles r ON r.name = p.role
  WHERE p.role IS NOT NULL
    AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
ON CONFLICT DO NOTHING;

-- ── 10. RLS on RBAC tables ─────────────────────────────────────────────────

ALTER TABLE roles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles       ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read roles/permissions (needed to render UI)
DROP POLICY IF EXISTS "authenticated read roles"       ON roles;
DROP POLICY IF EXISTS "authenticated read permissions" ON permissions;
DROP POLICY IF EXISTS "authenticated read role_perms"  ON role_permissions;
DROP POLICY IF EXISTS "users read own roles"           ON user_roles;

CREATE POLICY "authenticated read roles"
  ON roles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated read permissions"
  ON permissions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated read role_perms"
  ON role_permissions FOR SELECT USING (auth.role() = 'authenticated');

-- Users can read their own role assignments
CREATE POLICY "users read own roles"
  ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- All writes to RBAC tables go through service role (admin client) only.
-- No INSERT/UPDATE/DELETE policies for anon/authenticated.

-- ── 11. DB function: check a user's permission ─────────────────────────────
-- Used by server-side code as a fast single-query check.

CREATE OR REPLACE FUNCTION user_has_permission(p_user_id uuid, p_permission text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p       ON p.id = rp.permission_id
    WHERE ur.user_id = p_user_id
      AND p.name = p_permission
  );
$$;

-- Convenience: get all permission names for a user
CREATE OR REPLACE FUNCTION user_permissions(p_user_id uuid)
RETURNS text[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ARRAY_AGG(DISTINCT p.name)
  FROM user_roles ur
  JOIN role_permissions rp ON rp.role_id = ur.role_id
  JOIN permissions p       ON p.id = rp.permission_id
  WHERE ur.user_id = p_user_id;
$$;

-- ── DONE ───────────────────────────────────────────────────────────────────
-- Next: run this migration, then assign your account both 'admin' and
-- 'student' roles using the admin UI or:
--
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT 'YOUR-UUID', id FROM roles WHERE name IN ('admin', 'student');
