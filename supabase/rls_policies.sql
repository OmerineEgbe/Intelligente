-- Run this once in Supabase SQL Editor.
-- Enables RLS and adds the policies that let students read their own data.
-- Admins intentionally have NO access to student conversation/profile data.

-- ── Enable RLS on all student data tables ─────────────────────────────────────
alter table conversation_sessions  enable row level security;
alter table conversation_messages  enable row level security;
alter table trait_profiles         enable row level security;
alter table recommendations        enable row level security;
alter table roadmaps               enable row level security;
alter table profiles               enable row level security;

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Students can read and update their own profile row only.
drop policy if exists "students read own profile"   on profiles;
drop policy if exists "students update own profile" on profiles;

create policy "students read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "students update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ── conversation_sessions ─────────────────────────────────────────────────────
drop policy if exists "students read own sessions" on conversation_sessions;

create policy "students read own sessions"
  on conversation_sessions for select
  using (auth.uid() = user_id);

-- ── conversation_messages ─────────────────────────────────────────────────────
-- Join to conversation_sessions so only the session owner can read messages.
drop policy if exists "students read own messages" on conversation_messages;

create policy "students read own messages"
  on conversation_messages for select
  using (
    exists (
      select 1 from conversation_sessions s
      where s.id = conversation_messages.session_id
        and s.user_id = auth.uid()
    )
  );

-- ── trait_profiles ────────────────────────────────────────────────────────────
drop policy if exists "students read own trait profiles" on trait_profiles;

create policy "students read own trait profiles"
  on trait_profiles for select
  using (auth.uid() = user_id);

-- ── recommendations ───────────────────────────────────────────────────────────
drop policy if exists "students read own recommendations" on recommendations;

create policy "students read own recommendations"
  on recommendations for select
  using (auth.uid() = user_id);

-- ── roadmaps ──────────────────────────────────────────────────────────────────
drop policy if exists "students read own roadmaps" on roadmaps;

create policy "students read own roadmaps"
  on roadmaps for select
  using (auth.uid() = user_id);
