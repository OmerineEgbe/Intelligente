-- DEV ONLY — resets all AI-generated data for a specific user so you can
-- go through the full flow again from scratch.
--
-- HOW TO USE:
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Copy your user UUID
--   3. Replace YOUR_USER_UUID_HERE below with it
--   4. Run in SQL Editor
--
-- Your user account (auth.users + profiles) is NOT touched.
-- Only conversation, trait, recommendation, and roadmap data is deleted.

do $$
declare
  target_user uuid := 'YOUR_USER_UUID_HERE';
begin
  -- Delete in reverse FK order to avoid constraint violations
  delete from roadmaps
    where recommendation_id in (
      select id from recommendations where user_id = target_user
    );

  delete from recommendations
    where user_id = target_user;

  delete from trait_profiles
    where user_id = target_user;

  delete from conversation_messages
    where session_id in (
      select id from conversation_sessions where user_id = target_user
    );

  delete from conversation_sessions
    where user_id = target_user;

  raise notice 'Reset complete for user %', target_user;
end;
$$;
