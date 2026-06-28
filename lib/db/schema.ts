import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  jsonb,
  date,
  integer,
} from 'drizzle-orm/pg-core'

// ── profiles ──────────────────────────────────────────────────────────────────
// id mirrors auth.users.id from Supabase Auth
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  full_name: text('full_name'),
  role: text('role').notNull().default('student'), // 'student' | 'admin'
  phone: text('phone'),
  date_of_birth: date('date_of_birth'),
  academic_background: jsonb('academic_background'), // reserved, nullable, not collected at MVP
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── universities ──────────────────────────────────────────────────────────────
export const universities = pgTable('universities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  short_name: text('short_name').notNull(),
  logo_url: text('logo_url'),
  country: text('country'),
  status: text('status').notNull().default('active'), // 'active' | 'inactive'
})

// ── schools ───────────────────────────────────────────────────────────────────
export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  university_id: uuid('university_id')
    .notNull()
    .references(() => universities.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
})

// ── programmes ────────────────────────────────────────────────────────────────
export const programmes = pgTable('programmes', {
  id: uuid('id').primaryKey().defaultRandom(),
  school_id: uuid('school_id')
    .notNull()
    .references(() => schools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  qualification: text('qualification').notNull(), // 'HND' | 'BTech' | 'TopUp BTech' | 'MBA' | 'MSc'
  duration: text('duration'),
  description: text('description'),
  entry_requirements: text('entry_requirements'),
  trait_requirements: jsonb('trait_requirements'), // { analytical_thinking: 80, creativity: 40, ... }
  status: text('status').notNull().default('active'), // 'active' | 'inactive'
})

// ── careers ───────────────────────────────────────────────────────────────────
export const careers = pgTable('careers', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  category: text('category'),
  description: text('description'),
  required_skills: jsonb('required_skills'),
  personality_traits: jsonb('personality_traits'),
  industry: text('industry'),
  future_outlook: text('future_outlook'),
})

// ── programme_career_map ─────────────────────────────────────────────────────
export const programme_career_map = pgTable('programme_career_map', {
  id: uuid('id').primaryKey().defaultRandom(),
  programme_id: uuid('programme_id')
    .notNull()
    .references(() => programmes.id, { onDelete: 'cascade' }),
  career_id: uuid('career_id')
    .notNull()
    .references(() => careers.id, { onDelete: 'cascade' }),
  confidence_score: numeric('confidence_score'),
})

// ── conversation_sessions ─────────────────────────────────────────────────────
export const conversation_sessions = pgTable('conversation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('in_progress'), // 'in_progress' | 'completed' | 'abandoned'
  started_at: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  ended_at: timestamp('ended_at', { withTimezone: true }),
})

// ── conversation_messages ─────────────────────────────────────────────────────
export const conversation_messages = pgTable('conversation_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id')
    .notNull()
    .references(() => conversation_sessions.id, { onDelete: 'cascade' }),
  sender: text('sender').notNull(), // 'student' | 'ai'
  message: text('message').notNull(),
  intent: text('intent'),
  structured_signals: jsonb('structured_signals'), // { detected_profile_type, running_notes, conversation_complete }
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
})

// ── trait_profiles ────────────────────────────────────────────────────────────
export const trait_profiles = pgTable('trait_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id')
    .notNull()
    .references(() => conversation_sessions.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  profile_type: text('profile_type').notNull(), // 'explorer' | 'pathfinder' | 'visionary'
  trait_scores: jsonb('trait_scores').notNull(), // { analytical_thinking: { score, justification }, ... }
  top_strengths: jsonb('top_strengths'), // [{ trait, label, score }]
  stated_ambition: text('stated_ambition'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── recommendations ───────────────────────────────────────────────────────────
export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  trait_profile_id: uuid('trait_profile_id')
    .notNull()
    .references(() => trait_profiles.id, { onDelete: 'cascade' }),
  programme_id: uuid('programme_id').references(() => programmes.id, { onDelete: 'set null' }),
  career_id: uuid('career_id').references(() => careers.id, { onDelete: 'set null' }),
  fit_verdict: text('fit_verdict').notNull(), // 'strong_fit' | 'conditional_fit' | 'misaligned'
  score: numeric('score'),
  explanation: text('explanation'),
  is_alternative: boolean('is_alternative').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── roadmaps ──────────────────────────────────────────────────────────────────
export const roadmaps = pgTable('roadmaps', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  recommendation_id: uuid('recommendation_id')
    .notNull()
    .references(() => recommendations.id, { onDelete: 'cascade' }),
  immediate_actions: jsonb('immediate_actions'), // string[]
  short_term_actions: jsonb('short_term_actions'), // string[]
  long_term_actions: jsonb('long_term_actions'), // string[]
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── saved_programmes ──────────────────────────────────────────────────────────
export const saved_programmes = pgTable('saved_programmes', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  programme_id: uuid('programme_id')
    .notNull()
    .references(() => programmes.id, { onDelete: 'cascade' }),
  saved_at: timestamp('saved_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── announcements ─────────────────────────────────────────────────────────────
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  audience: text('audience'), // 'all_students' | 'pathfinders_only' etc.
  created_by: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── admin_users ───────────────────────────────────────────────────────────────
export const admin_users = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  profile_id: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  permissions: jsonb('permissions'),
  active: boolean('active').notNull().default(true),
})

// ── analytics (aggregate only — never per-student rows) ───────────────────────
export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  metric_name: text('metric_name').notNull(),
  metric_value: numeric('metric_value').notNull(),
  recorded_at: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── prompt_configs ────────────────────────────────────────────────────────────
export const prompt_configs = pgTable('prompt_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // 'conversation_engine' | 'trait_extraction' | 'career_matching' | 'roadmap'
  version: integer('version').notNull().default(1),
  prompt_text: text('prompt_text').notNull(),
  active: boolean('active').notNull().default(true),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── system_settings ───────────────────────────────────────────────────────────
export const system_settings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
})
