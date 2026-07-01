-- ══════════════════════════════════════════════════════════════════
-- Intelligente — Extended University Schema
-- Supports both Government and Private university structures in Cameroon
--
-- Government structure:  University → Faculty → Department → Programme
-- Private structure:     University → School  → Programme
--
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Extend universities ─────────────────────────────────────────────────

ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS institution_type text NOT NULL DEFAULT 'private'
    CHECK (institution_type IN ('government', 'private')),
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS description text;

-- Mark the 4 government universities we seeded
UPDATE universities SET institution_type = 'government'
WHERE short_name IN ('UB', 'UD', 'UYI');

UPDATE universities SET institution_type = 'private'
WHERE short_name = 'LMUI';

-- ── 2. Extend schools → universal academic_units ───────────────────────────
-- Schools table becomes the universal "academic unit" table.
-- Government:  Faculty (parent_id=null) → Department (parent_id=faculty_id)
-- Private:     School  (parent_id=null) → Programme directly
-- Both can have Institutes, Centres, Colleges, etc.

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS unit_type text NOT NULL DEFAULT 'school'
    CHECK (unit_type IN ('faculty', 'school', 'college', 'institute', 'department', 'centre')),
  ADD COLUMN IF NOT EXISTS description text;

-- ── 3. Extend programmes ───────────────────────────────────────────────────

ALTER TABLE programmes
  ADD COLUMN IF NOT EXISTS level text DEFAULT 'undergraduate'
    CHECK (level IN ('undergraduate', 'postgraduate', 'professional', 'certificate', 'diploma')),
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'full-time'
    CHECK (mode IN ('full-time', 'part-time', 'distance', 'blended')),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS tuition_fee text;   -- e.g. "450,000 XAF/year"

-- ── 4. RLS policies for admin writes ──────────────────────────────────────

-- Enable RLS on university tables if not already
ALTER TABLE universities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools        ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes     ENABLE ROW LEVEL SECURITY;

-- Public can read active universities/programmes (for AI matching)
DROP POLICY IF EXISTS "public read universities"  ON universities;
DROP POLICY IF EXISTS "public read schools"       ON schools;
DROP POLICY IF EXISTS "public read programmes"    ON programmes;

CREATE POLICY "public read universities"
  ON universities FOR SELECT USING (true);

CREATE POLICY "public read schools"
  ON schools FOR SELECT USING (true);

CREATE POLICY "public read programmes"
  ON programmes FOR SELECT USING (true);

-- Admin writes bypass RLS via service role key (admin client).
-- No INSERT/UPDATE/DELETE policies needed for the anon/authenticated role
-- since all admin mutations use createAdminClient() server-side.

-- ── 5. Index for hierarchy traversal ──────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_schools_parent_id     ON schools(parent_id);
CREATE INDEX IF NOT EXISTS idx_schools_university_id ON schools(university_id);
CREATE INDEX IF NOT EXISTS idx_programmes_school_id  ON programmes(school_id);

-- ── DONE ───────────────────────────────────────────────────────────────────
-- After running this migration, go to the Admin panel to add universities
-- and their academic units/programmes through the UI. No future SQL needed.
