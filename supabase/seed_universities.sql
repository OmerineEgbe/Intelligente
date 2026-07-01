-- ══════════════════════════════════════════════════════════════
-- Intelligente — University & Programme Seed Data
-- Run this in Supabase SQL Editor
-- To add a new university in future: insert into universities,
-- then schools, then programmes. No code changes required.
-- ══════════════════════════════════════════════════════════════

-- ── 1. Universities ───────────────────────────────────────────

INSERT INTO universities (id, name, short_name, country, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Landmark Metropolitan University Institute', 'LMUI', 'Cameroon', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'University of Buea',                          'UB',   'Cameroon', 'coming_soon'),
  ('00000000-0000-0000-0000-000000000003', 'University of Douala',                        'UD',   'Cameroon', 'coming_soon'),
  ('00000000-0000-0000-0000-000000000004', 'University of Yaoundé I',                     'UYI',  'Cameroon', 'coming_soon')
ON CONFLICT (id) DO NOTHING;

-- ── 2. Schools (LMUI only — active) ──────────────────────────

INSERT INTO schools (id, university_id, name) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'School of Engineering & Technology'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'School of Business & Management'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'School of Health Sciences'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'School of Agriculture')
ON CONFLICT (id) DO NOTHING;

-- ── 3. Programmes (LMUI) ──────────────────────────────────────

INSERT INTO programmes (id, school_id, name, qualification, duration, entry_requirements, status) VALUES

  -- Engineering & Technology
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Computer Engineering', 'HND', '2 years', '3 GCE A-Levels or equivalent', 'active'),

  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'Software Engineering', 'HND', '2 years', '3 GCE A-Levels', 'active'),

  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   'Civil Engineering', 'HND', '2 years', '3 GCE A-Levels', 'active'),

  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001',
   'Computer Engineering', 'BTech (TopUp)', '2 years', 'HND in related field', 'active'),

  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001',
   'Software Engineering', 'BTech (TopUp)', '2 years', 'HND in related field', 'active'),

  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001',
   'Data Science', 'MSc', '18 months', 'BSc in related field', 'active'),

  -- Business & Management
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002',
   'Business Administration', 'HND', '2 years', '3 GCE A-Levels', 'active'),

  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002',
   'Accounting & Finance', 'HND', '2 years', '3 GCE A-Levels', 'active'),

  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002',
   'Marketing', 'HND', '2 years', '3 GCE A-Levels', 'active'),

  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002',
   'Business Administration', 'BBA (TopUp)', '2 years', 'HND in Business', 'active'),

  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002',
   'Business Administration', 'MBA', '18 months', 'Bachelor''s degree', 'active'),

  -- Health Sciences
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000003',
   'Nursing', 'HND', '3 years', '3 GCE A-Levels including Biology', 'active'),

  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000003',
   'Medical Laboratory Sciences', 'HND', '2 years', '3 GCE A-Levels including Chemistry & Biology', 'active'),

  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000003',
   'Public Health', 'HND', '2 years', '3 GCE A-Levels', 'active'),

  -- Agriculture
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000004',
   'Agriculture', 'HND', '2 years', '3 GCE A-Levels', 'active'),

  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000004',
   'Agricultural Business Management', 'HND', '2 years', '3 GCE A-Levels', 'active')

ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- HOW TO ADD A NEW UNIVERSITY IN FUTURE:
--
-- 1. INSERT INTO universities (id, name, short_name, country, status)
--    VALUES (gen_random_uuid(), 'New University', 'NU', 'Cameroon', 'active');
--
-- 2. INSERT INTO schools (id, university_id, name) VALUES (...);
--
-- 3. INSERT INTO programmes (id, school_id, name, qualification,
--    duration, entry_requirements, status) VALUES (...);
--
-- Set status = 'active' when ready to include in recommendations.
-- Set status = 'coming_soon' to show in UI but exclude from matching.
-- No code changes required.
-- ══════════════════════════════════════════════════════════════
