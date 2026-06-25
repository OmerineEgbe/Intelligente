import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- Intelligente app tables ------------------------------------------------

export const schools = pgTable('schools', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdat: timestamp('createdat').notNull().defaultNow(),
})

export const departments = pgTable('departments', {
  id: text('id').primaryKey(),
  schoolid: text('schoolid')
    .notNull()
    .references(() => schools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdat: timestamp('createdat').notNull().defaultNow(),
})

export const degreePrograms = pgTable('degree_programs', {
  id: text('id').primaryKey(),
  departmentid: text('departmentid')
    .notNull()
    .references(() => departments.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  level: text('level').notNull(),
  description: text('description'),
  duration: text('duration'),
  createdat: timestamp('createdat').notNull().defaultNow(),
})

export const specializations = pgTable('specializations', {
  id: text('id').primaryKey(),
  programid: text('programid')
    .notNull()
    .references(() => degreePrograms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdat: timestamp('createdat').notNull().defaultNow(),
})

export const careerPaths = pgTable('career_paths', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  relatedprograms: text('relatedprograms'),
  salaryrange: text('salaryrange'),
  jobmarketdemand: text('jobmarketdemand'),
  createdat: timestamp('createdat').notNull().defaultNow(),
})

export const studentProfiles = pgTable('student_profiles', {
  id: text('id').primaryKey(),
  userid: text('userid')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  studentType: text('studentType'),
  interests: text('interests'),
  aptitudes: text('aptitudes'),
  careerGoal: text('careerGoal'),
  preferredProgram: text('preferredProgram'),
  classificationCompleted: boolean('classificationCompleted').default(false),
  createdat: timestamp('createdat').notNull().defaultNow(),
  updatedat: timestamp('updatedat').notNull().defaultNow(),
})

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  userid: text('userid')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title'),
  studentType: text('studentType'),
  status: text('status').default('active'),
  createdat: timestamp('createdat').notNull().defaultNow(),
  updatedat: timestamp('updatedat').notNull().defaultNow(),
})

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  conversationid: text('conversationid')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  userid: text('userid')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdat: timestamp('createdat').notNull().defaultNow(),
})

export const guidanceOutputs = pgTable('guidance_outputs', {
  id: text('id').primaryKey(),
  userid: text('userid')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  conversationid: text('conversationid').references(() => conversations.id, {
    onDelete: 'set null',
  }),
  studentType: text('studentType'),
  interestProfile: text('interestProfile'),
  recommendedPrograms: text('recommendedPrograms'),
  semesterRoadmap: text('semesterRoadmap'),
  fitAssessment: text('fitAssessment'),
  createdat: timestamp('createdat').notNull().defaultNow(),
})
