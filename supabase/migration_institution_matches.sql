-- Migration: add institution_matches to recommendations
-- Replaces lmui_match with a scalable institution_matches array
-- Each element: { university_name, short_name, available, programme_name,
--   school, qualification, entry_requirement, duration, mode,
--   match_score, why_matched[], pathway[], closest_alternative, unmatched_field }

ALTER TABLE recommendations
  ADD COLUMN IF NOT EXISTS institution_matches jsonb;
