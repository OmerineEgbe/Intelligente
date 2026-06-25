# Intelligente

An AI-powered academic and career guidance system for students of **Landmark Metropolitan University Institute (LMUI)**. Intelligente uses conversational AI to help students discover the right degree program and career path through personalised, context-aware dialogue.

---

## Overview

Intelligente guides three types of students:

| Type | Profile | What Intelligente Does |
|------|---------|------------------------|
| **Explorer** | Unsure of direction | Asks questions to surface interests and aptitudes |
| **Directed** | Has a career goal | Maps the goal to LMUI programs and builds a roadmap |
| **Validator** | Has a program in mind | Assesses fit and confirms or suggests alternatives |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Authentication | better-auth (email + password) |
| Database ORM | Drizzle ORM |
| Database | PostgreSQL via Supabase |
| AI Provider | Groq (llama-3.3-70b-versatile) — free tier |
| AI SDK | Vercel AI SDK v7 (`ai`, `@ai-sdk/react`, `@ai-sdk/groq`) |
| Deployment | Vercel (recommended) |

---

## User Flow

```
/ (Landing)
  └── /sign-up  (Register)
        └── /welcome  (Greeting + student type overview)
              └── /pre-chat  (3-step onboarding survey)
                    └── /dashboard  (AI chat interface)
```

---

## Where Data Is Stored

### Database — Supabase (PostgreSQL)

All persistent data lives in your **Supabase PostgreSQL** instance. The schema is managed with Drizzle ORM.

#### Auth Tables (managed by better-auth)

| Table | Purpose |
|-------|---------|
| `user` | Registered users (name, email, timestamps) |
| `session` | Active login sessions with expiry |
| `account` | Linked auth providers (email/password credentials) |
| `verification` | Email verification tokens |

#### Application Tables

| Table | Purpose |
|-------|---------|
| `student_profiles` | Student type, interests, aptitudes, career goal |
| `conversations` | Chat conversation records per user |
| `messages` | Individual messages within each conversation |
| `guidance_outputs` | AI-generated program recommendations and roadmaps |
| `schools` | LMUI schools (Engineering, Business, Medicine, Agriculture) |
| `departments` | Departments within each school |
| `degree_programs` | Individual degree programs (HND, BSc, MSc, MBA, etc.) |
| `specializations` | Specializations within degree programs |
| `career_paths` | Career path definitions linked to programs |

### Knowledge Base — Local Files (`/data/`)

The AI's domain knowledge comes from documents stored in `/data/`:

| File | Content |
|------|---------|
| `Intelligente_Master_Document_v2.docx` | Full system specification and guidance framework |
| `LMUI_Career_Guidance_Framework.docx` | Career pathway definitions for LMUI programs |
| `LMUI_Academic_Programs_Catalog.docx` | Complete catalog of programs, entry requirements, and descriptions |

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/OmerineEgbe/Intelligente.git
cd Intelligente
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Supabase — use the Transaction Pooler URL (port 6543) for serverless/Vercel
# Settings → Database → Connection string → Transaction pooler
DATABASE_URL=postgresql://postgres.[project-ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# better-auth — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BETTER_AUTH_SECRET=your-secret-here

# App URL (change to your production URL when deploying)
BETTER_AUTH_URL=http://localhost:3000

# Groq — free API key from https://console.groq.com
GROQ_API_KEY=your-groq-api-key-here
```

### 4. Push the database schema

This creates all tables in your Supabase database (run once):

```bash
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to the database |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |

---

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard (same as `.env.local`)
4. For `DATABASE_URL`, use the **Transaction Pooler** URL from Supabase (port `6543`) — not the direct connection — because Vercel uses serverless functions

---

## Project Structure

```
intelligente/
├── app/
│   ├── page.tsx              # Landing page
│   ├── welcome/page.tsx      # Post-signup welcome
│   ├── pre-chat/page.tsx     # Onboarding survey
│   ├── dashboard/page.tsx    # Main AI chat interface
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   └── api/
│       ├── chat/route.ts     # Groq AI streaming endpoint
│       └── auth/[...all]/    # better-auth handler
├── components/
│   └── auth-form.tsx         # Shared sign-in / sign-up form
├── lib/
│   ├── auth.ts               # better-auth server config
│   ├── auth-client.ts        # better-auth client hooks
│   └── db/
│       ├── index.ts          # Drizzle + pg Pool setup
│       └── schema.ts         # Full database schema
├── data/                     # LMUI knowledge base documents
├── drizzle.config.ts         # Drizzle ORM configuration
└── .env.local                # Environment variables (not committed)
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Supabase Transaction Pooler) |
| `BETTER_AUTH_SECRET` | Yes | Secret key for signing session tokens |
| `BETTER_AUTH_URL` | Yes | Base URL of the app (e.g. `http://localhost:3000`) |
| `GROQ_API_KEY` | Yes | Free Groq API key for LLM inference |

---

## License

Private — Landmark Metropolitan University Institute. All rights reserved.
