# ResearchBridge BD

**Connecting Industry · Academia · Government · Society**

A multi-stakeholder collaboration platform designed for the Bangladeshi context. Industry problems become student and researcher opportunities. Research output reaches real implementation. Government gains data and visibility.

## Tech Stack

- **Framework:** Next.js 16 (App Router, fullstack)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Auth:** NextAuth.js v4 (credentials provider)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React

## Quick Start (For Teammates)

```bash
# 1. Clone the repo
git clone https://github.com/tanoor890/researchbridge-bd.git
cd researchbridge-bd

# 2. Install dependencies
npm install

# 3. Set up environment
#    Get the DATABASE_URL from the team lead (shared privately)
cp .env.example .env
#    Then paste the real DATABASE_URL into your .env

# 4. Generate Prisma client
npx prisma generate

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The database is hosted on Neon (shared PostgreSQL). All teammates connect to the same database — no need to run `db:push` or `db:seed` unless the schema changes. The database is already seeded with test data.

## Environment Setup

Create a `.env` file in the project root (never commit this file):

```
DATABASE_URL="postgresql://..."   # Get from team lead
NEXTAUTH_SECRET="researchbridge-bd-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**IMPORTANT:** Never commit `.env` to GitHub. It contains database credentials.

## Test Accounts

All passwords: `password123`

| Role       | Email                        | Description              |
|------------|------------------------------|--------------------------|
| Admin      | admin@researchbridge.com.bd  | Full admin access        |
| Student    | rahim@diu.edu.bd             | DIU CSE student          |
| Student    | fatima@bracu.edu.bd          | BRAC University student  |
| Student    | karim@nsu.edu.bd             | NSU student              |
| Researcher | nasrin@diu.edu.bd            | DIU faculty member       |
| Industry   | hr@techsolve.com.bd          | Verified company         |
| Industry   | info@agridata.com.bd         | Verified company         |
| Industry   | contact@finedge.com.bd       | Verified company         |
| Industry   | hello@newstartup.com.bd      | Pending verification     |

## Features (MVP)

### Problem Marketplace
- Industry posts challenges with tiered visibility (Public / Private / NDA)
- Students and researchers submit solutions with IP clause acceptance
- Problem owners evaluate, shortlist, and connect with submitters

### Verified Trust System
- Student registration requires `.edu.bd` email
- Company registration triggers trade license verification queue
- Admin panel for manual verification review

### Talent Discovery
- Search students/researchers by skill, university, GPA, availability
- View verified profiles with solution history
- Direct messaging from talent search

### Jobs & Internships
- Industry posts listings (internship, full-time, part-time, contract)
- Filter by type, search by keyword
- Contact company directly via messaging

### In-Platform Messaging
- Real-time conversation threads
- Auto-refresh for new messages
- Deep-link to start conversations from profiles, problems, or jobs

### Admin Panel
- Platform statistics dashboard
- Verification queue (approve/reject with notes)
- Fraud report management

### Profile System
- Role-specific profiles (Student, Researcher, Industry)
- Skills tagging with BD-relevant taxonomy
- Academic info, research info, or company details based on role

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Register pages
│   ├── (dashboard)/      # All authenticated pages
│   │   ├── admin/        # Admin panel
│   │   ├── dashboard/    # User dashboard
│   │   ├── jobs/         # Job listings + creation
│   │   ├── messages/     # Messaging system
│   │   ├── problems/     # Problem marketplace
│   │   ├── profile/      # Profile view + edit
│   │   └── talent/       # Talent discovery
│   ├── api/              # All API routes
│   └── page.tsx          # Landing page
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── ui/               # Reusable UI components
│   └── providers.tsx     # Session provider
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # Helpers, BD skills/universities
│   └── validations.ts    # Zod schemas
├── types/
│   └── next-auth.d.ts    # Session type augmentation
prisma/
├── schema.prisma         # Database schema (PostgreSQL)
└── seed.ts               # Seed script with test data
```

## Scripts

| Command            | Description                          |
|--------------------|--------------------------------------|
| `npm run dev`      | Start dev server                     |
| `npm run build`    | Production build                     |
| `npm run db:push`  | Push schema changes to database      |
| `npm run db:seed`  | Seed database with test data         |
| `npm run db:reset` | Reset database and re-seed           |
| `npm run db:studio`| Open Prisma Studio (DB browser)      |

## For Team Leads: Schema Changes

When you modify `prisma/schema.prisma`:

1. Run `npm run db:push` to apply changes to the shared Neon database
2. Commit and push the schema change to GitHub
3. Teammates pull the latest code and run `npx prisma generate`

## License

MIT — Built for Bangladesh's research ecosystem.
