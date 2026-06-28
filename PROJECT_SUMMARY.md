# ResearchBridge BD - Complete Project Summary

**Last Updated:** June 29, 2026  
**Version:** 0.1.0 (MVP)  
**Status:** Fully Operational with 9 Demo Accounts & Seeded Test Data

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features & Functionality](#features--functionality)
4. [Database Schema](#database-schema)
5. [Working Process & Architecture](#working-process--architecture)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Demo Accounts](#demo-accounts)
8. [Setup & Development](#setup--development)
9. [API Endpoints](#api-endpoints)
10. [File Structure](#file-structure)
11. [Key Components](#key-components)

---

## Project Overview

**ResearchBridge BD** is a multi-stakeholder collaboration platform designed specifically for Bangladesh's research and development ecosystem. It connects:

- **Industry** (Companies posting challenges & job listings)
- **Academia** (Students & Researchers solving problems)
- **Government** (Data visibility & statistics)
- **Society** (Community-driven innovation)

The platform enables industry problems to become student/researcher opportunities, research output reaches real implementation, and government gains transparency into R&D activity.

### Mission
Bridge the gap between academic talent and industry needs while creating a trusted ecosystem for knowledge exchange and project collaboration in Bangladesh.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type-safe development |
| **Database** | PostgreSQL (Neon) | Cloud-hosted SQL database |
| **ORM** | Prisma 5 | Database abstraction layer |
| **Authentication** | NextAuth.js v4 | Session-based auth with JWT |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Icons** | Lucide React | SVG icon library |
| **Password Hash** | bcryptjs | Secure password hashing |
| **Validation** | Zod | Schema validation |
| **Date Handling** | date-fns | Date formatting utility |

### Dependencies
```json
{
  "@next-auth/prisma-adapter": "^1.0.7",
  "@prisma/client": "^5.22.0",
  "bcryptjs": "^3.0.3",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^4.1.0",
  "lucide-react": "^0.577.0",
  "next": "16.1.6",
  "next-auth": "^4.24.13",
  "prisma": "^5.22.0",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "tailwind-merge": "^3.5.0",
  "zod": "^4.3.6"
}
```

---

## Features & Functionality

### 1. **Problem Marketplace**
- **Industry Posts Challenges**: Companies submit problems with detailed specifications
- **Tiered Visibility**: Public (everyone sees), Private (internal), NDA (confidential)
- **Bounty System**: Cash bounties, certificates, or no compensation
- **Student/Researcher Submissions**: Multiple submissions per problem
- **IP Clause Management**: Clear intellectual property terms
- **Deadline Tracking**: Problems have submission deadlines
- **Status Management**: Open → In Review → Closed → Archived

**Key Data Points:**
- Problem title, abstract, full description
- Required skills (JSON array)
- Sector classification
- Bounty type and value
- Submission tracking

### 2. **Verified Trust System**
- **Student Registration**: Requires `.edu.bd` email domain verification
- **Company Registration**: Trade license verification queue
- **Admin Verification Panel**: Manual review of company documents
- **Trust Scores**: Numeric reputation score (0-100)
- **Standing Badges**: Green (good), Yellow (warning), Red (bad), Banned
- **Verification Workflow**: Pending → Approved/Rejected with admin notes

**Verification Types:**
- `trade_license` - For companies
- `email` - For student/faculty accounts
- `faculty` - For researcher verification
- `government` - For government agencies

### 3. **Talent Discovery**
- **Advanced Search**: Filter by skills, university, GPA, availability
- **Profile Browsing**: View student/researcher profiles with:
  - Bio and contact info
  - Skills and certifications
  - Past research/project history
  - LinkedIn/GitHub/Portfolio links
  - Solution submission history
- **Direct Messaging**: Initiate conversations from talent search
- **Profile Ratings**: View what others say about collaborating

### 4. **Jobs & Internships Marketplace**
- **Job Creation**: Companies post opportunities
- **Job Types**: Internship, Full-time, Part-time, Contract
- **Job Filtering**: By type, location, salary range, skills required
- **Job Search**: Keyword-based search
- **Direct Contact**: Message company directly through platform
- **Deadline Tracking**: Application deadlines
- **Status Management**: Active, Closed, Draft

### 5. **In-Platform Messaging**
- **Conversation Threads**: Real-time messaging between users
- **Message Tracking**: Read/unread status
- **Auto-Refresh**: Live message updates
- **Deep-Linking**: Start conversations from:
  - Talent discovery page
  - Problem detail page
  - Job listing
  - User profiles
- **Bidirectional**: Track sent and received messages

### 6. **Engagement & Project Management**
- **Milestone-Based Projects**: Break projects into deliverables
- **Negotiation Round System**: Up to 2 rounds of proposal before admin binding
- **Deposit System**: Track company deposits (30% platform fee)
- **Payment Tracking**: 
  - Project value in BDT
  - Platform fee calculation (default 30%)
  - Net student payout calculation
- **Status Flow**: Negotiating → Pending Deposit → Active → Closing → Payment Released → Closed
- **Admin Binding**: After 2 negotiation rounds, admin can create binding agreement

### 7. **Milestone Management**
- **Milestone Tracking**: Deliverable tracking with:
  - Due dates
  - Submission requirements
  - Revision count
  - Late submission tracking
- **Auto-Checking**: URL validation, word count checks, lateness detection
- **Status Workflow**: Pending → Submitted → Under Review → Approved/Revision Requested
- **Company Feedback**: Reviewers provide feedback on deliverables
- **Review Deadlines**: Set company review timeframes

### 8. **Dispute Resolution**
- **Open Disputes**: Raised by either company or student
- **Admin Ruling**: 
  - Full release (100% payment to student)
  - Partial (split payment)
  - Refund (money back to company)
- **Dispute Tracking**: Open → Resolved with ruling notes

### 9. **Admin Panel**
- **Platform Statistics**: 
  - Total users by role
  - Problems posted vs completed
  - Jobs posted
  - Engagement value flowing through platform
  - Verification stats
- **Verification Queue**: Review and approve/reject company verifications
- **Payment Queue**: Confirm deposits and releases
- **Fraud Reports**: Review reported fraudulent activity
- **Standing Badge Override**: Manually adjust user reputation
- **Transaction Log**: Complete audit trail of all payments and actions
- **Closure Queue**: Review completed engagements
- **Dispute Queue**: Review and rule on disputes
- **Review Watch**: Monitor active milestones approaching deadlines

### 10. **Certification System**
- **Project Certificates**: Generated on project completion
- **Certificate Details**:
  - Student name & university
  - Project title
  - Company name
  - Duration of project
  - Milestone summary
  - Verification URL (shareable proof)
- **Verification Page**: Public-facing certificate verification

### 11. **Fraud & Safety**
- **Fraud Reports**: Users can report suspicious activity
- **Report Tracking**: Status workflow (pending → reviewed → resolved/dismissed)
- **Content Moderation**: Admin can review and take action

---

## Database Schema

### Core Models

#### **User**
The central user model with role-based access control.

```
User {
  id: String (Primary Key)
  name: String
  email: String (Unique)
  password: String (bcrypt hashed)
  role: String (student|researcher|industry|government|admin)
  verified: Boolean (default: false)
  trustScore: Float (0-100)
  image: String? (avatar URL)
  
  Relations:
  - profile: Profile (1-to-1)
  - problems: Problem[] (1-to-many)
  - submissions: Submission[]
  - jobs: Job[]
  - sentMessages: Message[]
  - receivedMessages: Message[]
  - engagements: Engagement[] (both sides)
  - fraudReports: FraudReport[] (as reporter/reported)
  - adminActions: AdminAction[]
  - ratings: ProjectRating[] (as rater/ratee)
  - certificates: Certificate[]
}
```

#### **Profile**
Role-specific user information.

```
Profile {
  userId: String (Foreign Key, Unique)
  
  Common Fields:
  - bio: String?
  - phone: String?
  - location: String?
  - linkedinUrl, githubUrl, portfolioUrl: String?
  - skills: String (JSON array)
  - avatarUrl: String?
  
  Student-Specific:
  - university: String?
  - department: String?
  - studentId: String?
  - gpa: Float?
  - graduationYear: Int?
  - availableForInternship: Boolean
  - portfolioItems: String? (JSON)
  
  Researcher-Specific:
  - researchInterests: String?
  - publications: String?
  - orcidId: String?
  - hIndex: Int?
  - citationCount: Int?
  - supervisedStudents: Int?
  - availableForConsulting: Boolean
  
  Company-Specific:
  - companyName: String?
  - companySector: String?
  - companySize: String?
  - tradeLicenseNumber: String?
  - website: String?
  - yearEstablished: Int?
  
  Reputation:
  - standingBadge: String (green|yellow|red|banned)
  - verificationStatus: String (pending|verified|rejected)
}
```

#### **Problem**
Industry challenges posted for student/researcher solutions.

```
Problem {
  id: String (Primary Key)
  companyId: String (Foreign Key)
  title: String
  abstract: String
  fullDescription: String
  visibility: String (public|private|nda)
  bountyType: String? (cash|certificate|none)
  bountyValue: String?
  status: String (open|in_review|closed|archived)
  ipClauseAccepted: Boolean
  skills: String (JSON array)
  sector: String?
  deadline: DateTime?
  
  Relations:
  - company: User
  - submissions: Submission[]
  - engagements: Engagement[]
}
```

#### **Submission**
Student/researcher solutions to problems.

```
Submission {
  id: String
  problemId: String (Foreign Key)
  userId: String (Foreign Key)
  description: String
  fileUrl: String?
  githubRepoUrl: String?
  demoUrl: String?
  ipAccepted: Boolean
  status: String (submitted|shortlisted|accepted|rejected)
  score: Float?
  feedback: String?
  teamMembers: String? (JSON array)
  
  Relations:
  - problem: Problem
  - user: User
}
```

#### **Engagement**
Project collaborations between companies and students.

```
Engagement {
  id: String
  problemId: String (Foreign Key)
  companyId: String (Foreign Key)
  studentId: String (Foreign Key)
  
  Financial:
  - projectValueBdt: Float?
  - platformFeeRate: Float (default: 0.30)
  - depositAmountBdt: Float?
  - netStudentPayoutBdt: Float?
  
  Status:
  - status: String (negotiating|pending_deposit|active|closing|
                    payment_released|closed|archived|cancelled)
  
  Negotiation:
  - negotiationRound: Int (max 2)
  - proposedBy: String? (userId)
  - adminProposedBinding: Boolean
  
  Timeline:
  - agreedAt: DateTime?
  - companyConfirmed, studentConfirmed: Boolean
  - depositDeadline: DateTime?
  - depositConfirmedAt: DateTime?
  - completedAt: DateTime?
  - closedAt: DateTime?
  
  Contacts:
  - namedContactPhone: String?
  - namedContactEmail: String?
  
  Relations:
  - company, student: User
  - problem: Problem
  - milestones: Milestone[]
  - disputes: Dispute[]
  - ratings: ProjectRating[]
  - certificates: Certificate[]
  - adminActions: AdminAction[]
}
```

#### **Milestone**
Project deliverables within engagements.

```
Milestone {
  id: String
  engagementId: String (Foreign Key)
  title: String
  description: String
  dueDate: DateTime
  submissionRequirements: String?
  order: Int
  
  Submission:
  - deliverableUrl: String?
  - writtenNote: String?
  - submittedAt: DateTime?
  
  Review:
  - status: String (pending|submitted|under_review|approved|
                    revision_requested|disputed)
  - companyFeedback: String?
  - approvedAt: DateTime?
  - reviewDeadline: DateTime?
  
  Tracking:
  - isLate: Boolean?
  - revisionCount: Int
  - autoCheckResult: String? (JSON: {urlCheck, wordCount, isLate})
  - extensionsUsed: Int (default: 0)
  
  Relations:
  - engagement: Engagement
  - tags: MilestoneTag[]
  - disputes: Dispute[]
}
```

#### **MilestoneTag**
Rating/feedback tags after milestone completion.

```
MilestoneTag {
  milestoneId: String (FK, Unique with submittedBy)
  submittedBy: String (userId)
  taggedRole: String? (company|student)
  targetUserId: String?
  tags: String (JSON array)
  overallTag: String (would_collaborate_again|would_not_recommend|neutral)
  skipped: Boolean
}
```

#### **Dispute**
Conflict resolution for engagements.

```
Dispute {
  engagementId: String (FK)
  milestoneId: String? (FK)
  raisedById: String
  raisedBy: String? (display name)
  reason: String?
  description: String?
  status: String (open|resolved)
  
  Admin Ruling:
  - adminId: String?
  - ruling: String? (full_release|partial|refund)
  - rulingPercent: Float?
  - rulingNotes: String?
  - resolvedAt: DateTime?
}
```

#### **Message**
In-platform conversations.

```
Message {
  id: String
  senderId: String (FK)
  receiverId: String (FK)
  body: String
  read: Boolean
  createdAt: DateTime
}
```

#### **Job**
Employment opportunities posted by companies.

```
Job {
  id: String
  companyId: String (FK)
  title: String
  type: String (internship|fulltime|parttime|contract)
  skills: String (JSON array)
  description: String
  location: String?
  salary: String?
  deadline: DateTime?
  status: String (active|closed|draft)
}
```

#### **Verification**
Document verification queue.

```
Verification {
  id: String
  userId: String (FK)
  type: String (trade_license|email|faculty|government)
  documentUrl: String?
  status: String (pending|approved|rejected)
  reviewedBy: String?
  reviewedAt: DateTime?
  notes: String?
}
```

#### **Certificate**
Project completion certificates.

```
Certificate {
  id: String
  engagementId: String (FK)
  studentId: String (FK)
  studentName: String
  university: String?
  projectTitle: String
  companyName: String
  duration: String
  milestoneSummary: String (JSON array)
  verificationUrl: String (public verification link)
}
```

#### **ProjectRating**
Post-project ratings between parties.

```
ProjectRating {
  id: String
  engagementId: String (FK)
  raterId: String (FK)
  rateeId: String (FK)
  tags: String (JSON array)
  overallTag: String (would_collaborate_again|would_not_recommend|neutral)
  
  Unique: [engagementId, raterId]
}
```

#### **AdminAction**
Audit trail of admin interventions.

```
AdminAction {
  id: String
  adminId: String (FK)
  actionType: String (payment_confirmed|payment_released|
                       quality_check|dispute_ruling|
                       standing_override|deposit_confirmed)
  entityId: String
  entityType: String (engagement|milestone|dispute|profile)
  engagementId: String? (FK)
  notes: String (min 10 chars)
  metadata: String (JSON)
}
```

#### **FraudReport**
User-reported suspicious activity.

```
FraudReport {
  id: String
  reportedById: String (FK)
  reportedUserId: String (FK)
  reason: String
  description: String
  status: String (pending|reviewed|resolved|dismissed)
}
```

---

## Working Process & Architecture

### Authentication Flow

```
User → Login Page
  ↓
Credentials Provider (NextAuth.js)
  ↓
[Email + Password]
  ↓
Find user in DB
  ↓
bcrypt.compare(password, hashedPassword)
  ↓
Valid? → Create JWT token
  ↓
Redirect to Dashboard
```

**Key Files:**
- `src/lib/auth.ts` - NextAuth configuration
- `src/app/(auth)/login/page.tsx` - Login UI
- `src/app/(auth)/register/page.tsx` - Registration UI
- `src/app/api/auth/[...nextauth]/route.ts` - Auth API route

---

### Problem Submission Workflow

```
Company
  ↓
Create Problem
  ├─ Title, Description, Skills Required
  ├─ Visibility (Public/Private/NDA)
  ├─ Bounty Details
  └─ Deadline
  ↓
Problem Marketplace (VISIBLE)
  ↓
Students/Researchers
  ├─ Browse Problems
  ├─ View Company Profile
  └─ Submit Solution
  ↓
Company Dashboard
  ├─ Reviews Submissions
  ├─ Scores Solutions
  ├─ Shortlists Candidates
  └─ Initiates Engagement
  ↓
Engagement Created
  ├─ Status: Negotiating
  ├─ Send Proposal (milestones, payment)
  └─ Student Reviews & Responds
```

---

### Engagement & Project Execution

```
Engagement Created (Status: Negotiating)
  ↓
Round 1: Company proposes milestones & payment
  ├─ Student reviews
  ├─ Student counters OR accepts
  └─ Max 2 rounds before admin binding
  ↓
Both Parties Confirm (Status: Pending Deposit)
  ↓
Company Deposits 30% + Platform Fee
  ├─ Status: Active
  ├─ Engagement now binding
  └─ Timer starts
  ↓
Student Works on Milestones
  ├─ M1: Submit deliverable (URL, document, code)
  ├─ Company reviews within deadline
  ├─ Approved? → M2
  ├─ Revision needed? → Resubmit (max 2 revisions)
  └─ Disputed? → Admin ruling
  ↓
All Milestones Approved
  ├─ Status: Closing
  ├─ Mutual ratings (MilestoneTag)
  └─ Generate certificate
  ↓
Admin confirms completion
  ├─ Status: Payment Released
  ├─ Student paid: netStudentPayout
  ├─ Company receives certificate
  └─ Student certificate issued
  ↓
Engagement Closed (Status: Closed)
  ├─ Can still view project details
  ├─ Ratings visible
  └─ History tracked
```

---

### Data Flow Architecture

```
Frontend (React Components)
  ↓
Client-Side State (session, user context)
  ↓
API Routes (src/app/api/*)
  ├─ Authentication check
  ├─ Authorization check (role-based)
  └─ Request validation (Zod schemas)
  ↓
Prisma ORM
  ├─ Database queries
  ├─ Relationship loading
  └─ Transaction management
  ↓
PostgreSQL (Neon Cloud DB)
  ├─ Data persistence
  ├─ Relationships maintained
  └─ Indexes on common queries
  ↓
Response → Frontend
  ├─ JSON serialization
  ├─ Error handling
  └─ Status codes
```

---

### Admin Verification Queue

```
Company Registration
  ↓
Trade License Document Upload
  ↓
Verification Record Created (status: pending)
  ↓
Admin Dashboard
  ├─ Views verification queue
  ├─ Reviews document
  ├─ Can check previous verifications
  └─ Makes decision
  ↓
Admin Action:
  ├─ APPROVE (status: verified)
  │   └─ Company marked as verified
  │   └─ Can now post problems/jobs
  │
  └─ REJECT (status: rejected)
      └─ Company notified
      └─ Can resubmit later
```

---

### Message System

```
User A clicks "Message" on User B's profile
  ↓
Deep-link to messages page with pre-filled recipient
  ↓
Message thread created
  ├─ Bidirectional viewing
  ├─ Read/unread tracking
  └─ Real-time polling for new messages
  ↓
User B sees notification
  ├─ Unread message count
  ├─ Latest message preview
  └─ Link to start reply
```

---

## User Roles & Permissions

### 1. **Student**
**Verification:** `.edu.bd` email

**Capabilities:**
- ✓ View all public problems
- ✓ Submit solutions to problems
- ✓ Search talent discovery (view other students/researchers)
- ✓ Browse job listings
- ✓ Apply for jobs via messaging
- ✓ Join engagements as student
- ✓ Submit milestones
- ✓ View certificates
- ✗ Cannot post problems or jobs

**Dashboard Access:**
- Problems marketplace
- Talent discovery
- Jobs listing
- My engagements (as student)
- Messages
- Profile view/edit
- Certificates

---

### 2. **Researcher**
**Verification:** `.edu.bd` email + additional verification

**Capabilities:**
- ✓ All student capabilities
- ✓ Post research interests
- ✓ Track publications & H-index
- ✓ Consulting opportunities
- ✓ Submit high-level research solutions
- ✗ Cannot post problems or jobs

---

### 3. **Industry (Company)**
**Verification:** Trade License + Manual Admin Approval

**Capabilities:**
- ✓ Post problems (Public/Private/NDA)
- ✓ Post job listings
- ✓ Browse student/researcher profiles
- ✓ Review submissions
- ✓ Create engagements
- ✓ Propose milestones & payment
- ✓ Review deliverables
- ✓ Rate students
- ✓ Initiate payments
- ✗ Cannot submit solutions to problems

**Dashboard Access:**
- Problems I've posted
- Job listings I've created
- Submissions received
- My engagements (as company)
- Talent search
- Messages
- Admin panel (if company also admin)

---

### 4. **Government**
**Verification:** Special government verification

**Capabilities:**
- ✓ View platform statistics
- ✓ Export research activity data
- ✓ View verified company information
- ✓ Access anonymized engagement data
- ✓ Generate reports

---

### 5. **Admin**
**Automatically granted to admin@researchbridge.com.bd**

**Capabilities:**
- ✓ Access admin panel
- ✓ View all platform statistics
- ✓ Manage verification queue (approve/reject companies)
- ✓ Review fraud reports
- ✓ Override user standing badges
- ✓ Confirm deposits and payment releases
- ✓ Rule on disputes (full_release, partial, refund)
- ✓ Review active milestones (watch for deadlines)
- ✓ Create binding agreements after 2 negotiation rounds
- ✓ View complete transaction log

**Access:**
- `/admin` - Admin dashboard with all queues

---

## Demo Accounts

### Setup Status
✓ **Database:** Created with Prisma `db push`  
✓ **Test Data:** Seeded with 9 demo users + sample problems/jobs  
✓ **Status:** All accounts fully functional

### Demo Users & Credentials

| Email | Password | Role | Status | Name |
|-------|----------|------|--------|------|
| admin@researchbridge.com.bd | password123 | Admin | Verified | Admin User |
| rahim@diu.edu.bd | password123 | Student | Verified | Rahim Ahmed (DIU) |
| fatima@bracu.edu.bd | password123 | Student | Verified | Fatima Khan (BRACU) |
| karim@nsu.edu.bd | password123 | Student | Verified | Karim Hossain (NSU) |
| nasrin@diu.edu.bd | password123 | Researcher | Verified | Dr. Nasrin (DIU Faculty) |
| hr@techsolve.com.bd | password123 | Industry | Verified | TechSolve BD Ltd. |
| info@agridata.com.bd | password123 | Industry | Verified | AgriData Solutions |
| contact@finedge.com.bd | password123 | Industry | Verified | FinEdge Technologies |
| hello@newstartup.com.bd | password123 | Industry | Pending | New Startup Inc. |

---

### Seeded Test Data

**Problems (5 Total):**
1. Market Price Prediction for Agricultural Commodities
2. E-commerce Inventory Management Dashboard
3. Fraud Detection Model for Mobile Banking
4. Crop Disease Detection System
5. AI-Powered Resume Screening Tool

**Jobs (4 Total):**
1. UI/UX Designer (Fulltime) - TechSolve
2. Backend Developer (Fulltime) - FinEdge
3. Data Science Intern (Internship) - AgriData
4. Junior Full-Stack Developer Intern (Internship) - TechSolve

**Engagements (1 Total):**
- Status tracking and milestone management

---

## Setup & Development

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or pnpm
- PostgreSQL connection (Neon provided)

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/sirajhemonai/researchhub.git
cd researchhub

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Set up environment
cp .env.example .env
# Add DATABASE_URL from team lead (Neon connection string)
# Format: postgresql://user:password@host/dbname

# 4. Generate Prisma Client
npx prisma generate

# 5. Create database schema
npx prisma db push

# 6. Seed test data
npx prisma db seed
# or
npm run db:seed

# 7. Start development server
npm run dev
# Server runs on http://localhost:5000
# (Custom port to avoid conflicts)
```

### Environment Variables

Create `.env` file in project root (never commit):

```env
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]/researchbridge-bd"

# Authentication
NEXTAUTH_SECRET="researchbridge-bd-secret-change-in-production"
NEXTAUTH_URL="http://localhost:5000"

# (Optional for production)
NEXTAUTH_URL="https://yourdomain.com"
```

**Never commit `.env` to GitHub!**

---

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Apply schema changes to DB |
| `npm run db:seed` | Seed database with test data |
| `npm run db:reset` | Reset DB and re-seed |
| `npm run db:studio` | Open Prisma Studio (DB browser) |
| `npm run lint` | Run ESLint |

---

### Development Workflow

**1. Schema Changes:**
```bash
# Edit prisma/schema.prisma
# Apply to database
npm run db:push

# Teammates pull code and regenerate client
npx prisma generate
```

**2. Adding New Features:**
```bash
# Create new page in src/app/(dashboard)/...
# Create new API route in src/app/api/...
# Start dev server
npm run dev

# Hot reload applies changes automatically
```

**3. Database Issues:**
```bash
# Reset database (CAUTION: deletes all data)
npm run db:reset

# View database in browser
npm run db:studio
```

---

## API Endpoints

### Authentication APIs
- `POST /api/auth/[...nextauth]` - NextAuth credential provider
- `POST /api/register` - User registration

### Problem APIs
- `GET /api/problems` - List all problems
- `GET /api/problems/[id]` - Get problem details
- `POST /api/problems` - Create problem (industry only)
- `PUT /api/problems/[id]` - Update problem
- `DELETE /api/problems/[id]` - Delete problem

### Submission APIs
- `GET /api/submissions` - List submissions (company dashboard)
- `GET /api/submissions/[id]` - Get submission details
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/[id]` - Update submission (change status/feedback)

### Engagement APIs
- `GET /api/engagements` - List engagements (user's)
- `GET /api/engagements/[id]` - Get engagement details
- `POST /api/engagements` - Create engagement
- `PUT /api/engagements/[id]` - Update engagement status
- `POST /api/engagements/[id]/close` - Close engagement
- `POST /api/engagements/[id]/release-payment` - Release payment
- `POST /api/engagements/[id]/rate` - Rate engagement
- `GET /api/engagements/[id]/agreement` - Get agreement PDF
- `POST /api/engagements/[id]/agreement` - Generate agreement

### Milestone APIs
- `GET /api/milestones/[id]` - Get milestone details
- `POST /api/engagements/[id]/milestones` - Create milestones
- `PUT /api/milestones/[id]` - Update milestone (deliverable submission)
- `POST /api/milestones/[id]/tags` - Submit rating tags

### Message APIs
- `GET /api/messages` - Get message threads
- `POST /api/messages` - Send message

### Job APIs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/[id]` - Get job details
- `POST /api/jobs` - Create job (industry)
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Profile APIs
- `GET /api/profile` - Get current user profile
- `GET /api/profile/[id]` - Get user profile by ID
- `PUT /api/profile` - Update current user profile

### Talent Search APIs
- `GET /api/talent` - Search students/researchers (filter by skills, university, etc)

### Certificate APIs
- `GET /api/certificates/[certId]` - Get certificate details
- `GET /verify/[certId]` - Public certificate verification page

### Admin APIs
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/verifications` - Verification queue
- `POST /api/admin/verifications` - Approve/reject verification
- `GET /api/admin/payment-queue` - Payment confirmations needed
- `POST /api/admin/payment-queue` - Confirm payment
- `GET /api/admin/fraud-reports` - Fraud report queue
- `GET /api/admin/standing-badge` - User standing management
- `POST /api/admin/standing-badge` - Override standing badge
- `GET /api/admin/dispute-queue` - Disputes needing resolution
- `POST /api/admin/dispute-queue` - Rule on dispute
- `GET /api/admin/closure-queue` - Engagements to review for closure
- `GET /api/admin/review-watch` - Milestones approaching deadlines
- `GET /api/admin/transaction-log` - Complete audit trail

---

## File Structure

```
researchhub/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx           # Login page
│   │   │   └── register/page.tsx        # Registration page
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   └── page.tsx             # Admin dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # User dashboard (landing after login)
│   │   │   ├── problems/
│   │   │   │   ├── page.tsx             # Problem marketplace
│   │   │   │   ├── new/page.tsx         # Create problem
│   │   │   │   └── [id]/page.tsx        # Problem details
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx             # Job listings
│   │   │   │   ├── new/page.tsx         # Create job
│   │   │   │   └── [id]/page.tsx        # Job details
│   │   │   ├── engagements/
│   │   │   │   ├── page.tsx             # My engagements
│   │   │   │   ├── [id]/page.tsx        # Engagement details
│   │   │   │   └── [id]/agreement/      # Agreement PDF
│   │   │   ├── messages/
│   │   │   │   └── page.tsx             # Messaging interface
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx             # My profile
│   │   │   │   └── [id]/page.tsx        # Other user profiles
│   │   │   ├── talent/
│   │   │   │   └── page.tsx             # Talent discovery search
│   │   │   └── layout.tsx               # Authenticated layout
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts             # Auth endpoints
│   │   │   ├── problems/
│   │   │   │   ├── route.ts             # GET/POST problems
│   │   │   │   └── [id]/route.ts        # GET/PUT/DELETE problem
│   │   │   ├── submissions/
│   │   │   │   ├── route.ts             # GET/POST submissions
│   │   │   │   └── [id]/route.ts        # GET/PUT submission
│   │   │   ├── engagements/
│   │   │   │   ├── route.ts             # GET/POST engagements
│   │   │   │   ├── [id]/route.ts        # GET/PUT engagement
│   │   │   │   ├── [id]/milestones/     # Milestone management
│   │   │   │   ├── [id]/close/          # Close engagement
│   │   │   │   ├── [id]/release-payment/
│   │   │   │   ├── [id]/rate/           # Rate engagement
│   │   │   │   └── [id]/agreement/      # Agreement generation
│   │   │   ├── milestones/
│   │   │   │   ├── [id]/route.ts        # GET/PUT milestone
│   │   │   │   └── [id]/tags/route.ts   # Milestone ratings
│   │   │   ├── messages/
│   │   │   │   └── route.ts             # GET/POST messages
│   │   │   ├── jobs/
│   │   │   │   ├── route.ts             # GET/POST jobs
│   │   │   │   └── [id]/route.ts        # GET/PUT/DELETE job
│   │   │   ├── profile/
│   │   │   │   ├── route.ts             # GET/PUT user profile
│   │   │   │   └── [id]/route.ts        # GET user by ID
│   │   │   ├── talent/
│   │   │   │   └── route.ts             # Search talent
│   │   │   ├── certificates/
│   │   │   │   └── [certId]/route.ts    # Get certificate
│   │   │   ├── register/
│   │   │   │   └── route.ts             # Registration endpoint
│   │   │   └── admin/
│   │   │       ├── stats/route.ts       # Platform statistics
│   │   │       ├── verifications/route.ts
│   │   │       ├── payment-queue/route.ts
│   │   │       ├── fraud-reports/route.ts
│   │   │       ├── standing-badge/route.ts
│   │   │       ├── dispute-queue/route.ts
│   │   │       ├── closure-queue/route.ts
│   │   │       ├── review-watch/route.ts
│   │   │       └── transaction-log/route.ts
│   │   │
│   │   ├── verify/
│   │   │   └── [certId]/page.tsx        # Public certificate verification
│   │   │
│   │   ├── page.tsx                     # Landing page
│   │   ├── layout.tsx                   # Root layout
│   │   └── globals.css                  # Tailwind CSS
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx               # Navigation bar
│   │   │   └── footer.tsx               # Footer
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── modal.tsx
│   │   │   └── ...                      # Other UI components
│   │   └── providers.tsx                # Session provider wrapper
│   │
│   ├── lib/
│   │   ├── auth.ts                      # NextAuth configuration
│   │   ├── prisma.ts                    # Prisma client singleton
│   │   ├── utils.ts                     # Helper functions
│   │   │                                   (BD universities, skills, etc.)
│   │   └── validations.ts               # Zod schemas for forms
│   │
│   └── types/
│       └── next-auth.d.ts               # NextAuth type augmentation
│
├── prisma/
│   ├── schema.prisma                    # Database schema (PostgreSQL)
│   └── seed.ts                          # Seed script (test data)
│
├── public/
│   └── (static assets, logos, etc.)
│
├── .env.example                          # Environment template
├── .gitignore                            # Git ignore rules
├── package.json                          # Dependencies & scripts
├── tsconfig.json                         # TypeScript config
├── next.config.js                        # Next.js config
├── tailwind.config.js                    # Tailwind CSS config
└── README.md                             # Project README
```

---

## Key Components

### Frontend Components

#### **ProblemCard**
Displays problem listing in marketplace.
- Title, company name, bounty
- Skills required badges
- Status indicator
- Click to view details

#### **JobCard**
Displays job listing.
- Job title, type (internship/fulltime/etc)
- Company info
- Location, salary range
- Deadline

#### **EngagementTimeline**
Shows engagement status progression.
- Milestone tracking
- Payment status
- Dates and deadlines
- Status badges

#### **MessageThread**
In-platform messaging interface.
- Conversation history
- Send new message
- Read/unread indicators
- User avatars

#### **MilestoneCard**
Milestone submission tracking.
- Due date
- Status (pending/submitted/approved)
- Deliverable links
- Review feedback

#### **AdminDashboard**
Admin control panel with:
- Statistics cards
- Verification queue
- Payment queue
- Dispute resolution
- Transaction log

---

### API Response Structure

**Success Response:**
```json
{
  "success": true,
  "data": {
    // endpoint-specific data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

### Authentication & Session Management

**Session Object:**
```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    role: "student" | "researcher" | "industry" | "government" | "admin",
    verified: boolean
  },
  expires: string (ISO 8601 datetime)
}
```

**Protected Routes:**
- All pages under `(dashboard)/` require authentication
- Admin pages require `role === "admin"`
- Role-specific content conditionally rendered based on `session.user.role`

---

## Key Features Implementation Details

### 1. Bounty System
- Stored as `bountyType` (cash/certificate/none) and `bountyValue` (string, flexible format)
- Displayed on problem cards
- Tracked in engagement agreements

### 2. Trust Scoring
- Initial score: 0 (new users)
- Admin verified: +20 points
- Successful project: +10 points
- Dispute loss: -15 points
- Fraud report: -50 points + potential ban
- Badge: Green (90+), Yellow (60-89), Red (<60), Banned

### 3. IP Clause System
- Company sets IP ownership terms when posting problem
- Students/researchers accept IP clause when submitting
- Tracked in Submission & Engagement models
- Non-negotiable; acceptance required

### 4. Deposit & Payment Flow
- Company deposits 30% of project value
- Platform takes 30% fee from student payout
- Student receives net payout on completion
- 70% held in escrow until milestone approval
- Admin manually confirms payment release

### 5. Negotiation System
- Max 2 rounds of proposal exchange
- After 2 rounds, admin can create binding agreement
- Both parties must confirm before activation
- Timeline tracked via `agreedAt`, `depositConfirmedAt`

### 6. Certificate Verification
- Certificates generated on engagement completion
- Public verification URL (no login required)
- Certificate contains all project details
- Verifiable by third parties (employers, universities)

---

## Development Tips

### Debugging
1. Check browser console for client errors
2. Check server logs: `npm run dev` output
3. Use Prisma Studio: `npm run db:studio`
4. Test API endpoints directly with curl/Postman

### Common Tasks

**Add new model to database:**
1. Update `prisma/schema.prisma`
2. Run `npm run db:push`
3. Regenerate Prisma client: `npx prisma generate`

**Create new API endpoint:**
1. Create file in `src/app/api/[endpoint]/route.ts`
2. Export `GET`, `POST`, `PUT`, `DELETE` handlers
3. Add authentication check and authorization
4. Validate input with Zod
5. Query database with Prisma
6. Return JSON response

**Add new page:**
1. Create folder in `src/app/(dashboard)/[page]/`
2. Create `page.tsx` component
3. Add auth guard if needed
4. Use `useSession()` hook for current user
5. Fetch data from API endpoints

---

## Security Considerations

1. **Password Hashing:** bcryptjs (12 salt rounds)
2. **Session Security:** JWT tokens with expiration
3. **CSRF Protection:** Built-in Next.js middleware
4. **SQL Injection:** Prisma ORM prevents SQL injection
5. **Input Validation:** Zod schemas validate all inputs
6. **Email Verification:** `.edu.bd` domain restriction for students
7. **Trade License Verification:** Admin manual review for companies
8. **Role-Based Access Control:** Middleware checks user role
9. **Audit Trail:** Admin actions logged in AdminAction model

---

## Future Enhancements

1. **Payment Gateway Integration:** Real payment processing (bKash, Nagad)
2. **Email Notifications:** SendGrid integration for alerts
3. **File Storage:** AWS S3 for certificate/document uploads
4. **Real-time Features:** WebSocket integration for live messaging
5. **API Webhooks:** Automated integrations with external systems
6. **Advanced Search:** Elasticsearch for full-text search
7. **Analytics Dashboard:** Chart.js integration for metrics
8. **Mobile App:** React Native companion app
9. **Government Portal:** Separate interface for gov. officials
10. **Blockchain Certificates:** Verifiable credentials

---

## Support & Resources

- **Documentation:** See README.md
- **Database:** Neon PostgreSQL (connection string from team lead)
- **Demo Accounts:** See Demo Accounts section above
- **Bug Reports:** Contact team lead
- **Feature Requests:** GitHub Issues

---

## License

MIT License - Built for Bangladesh's research ecosystem

**Last Updated:** June 29, 2026  
**Database Status:** ✓ Active & Seeded  
**Demo Accounts:** ✓ All functional  
**Frontend:** ✓ Running on port 5000
