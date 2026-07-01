-- Migration: Recommendations table v2
-- Adds new jsonb columns for universal career/degree matching (Phase 1 & 2)
-- before LMUI institution mapping (Phase 3)
-- Run this in Supabase SQL editor

ALTER TABLE recommendations
  ADD COLUMN IF NOT EXISTS career_matches  jsonb,
  ADD COLUMN IF NOT EXISTS degree_field    text,
  ADD COLUMN IF NOT EXISTS lmui_match      jsonb,
  ADD COLUMN IF NOT EXISTS other_matches   jsonb;

-- roadmaps table: add pathway column
ALTER TABLE roadmaps
  ADD COLUMN IF NOT EXISTS pathway jsonb;

-- career_matches shape:
-- [{ career_name, match_score, fit_verdict, why_matched[], demand,
--    growth_outlook, typical_salary, is_primary, description }]

-- lmui_match shape:
-- { available, programme_name, school, qualification, duration,
--   entry_requirement, mode, match_score, why_matched[], pathway[] }
-- pathway[]: [{ name, field, duration }]

-- other_matches shape:
-- [{ career_name, match_score, fit_verdict }]
