# ResearchBridge BD - System Architecture

## Overview

**ResearchBridge BD** is a full-stack research collaboration and problem-solving platform built with **Next.js 16**, **React 19**, **PostgreSQL** (via Neon/Prisma), and **NextAuth.js**. It facilitates connections between students, researchers, industry partners, and government agencies to solve research problems, manage research projects, and share research datasets through a secure Data Room marketplace.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js App Router | 16.1.6 |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | PostgreSQL (Neon) | Latest |
| **ORM** | Prisma | 5.22.0 |
| **Authentication** | NextAuth.js | 4.24.13 |
| **Validation** | Zod | 4.3.6 |
| **Password Hashing** | bcryptjs | 3.0.3 |
| **Icons** | Lucide React | 0.577.0 |
| **Date Utils** | date-fns | 4.1.0 |

---

## Database Schema

### Core Models (Original)

#### User (Central Authority)
- **id**: Unique identifier (CUID)
- **name, email, password**: Authentication credentials
- **role**: student, researcher, industry, government, admin
- **verified**: Boolean for role verification
- **trustScore**: Reputation metric (0-100)
- **createdAt, updatedAt**: Timestamps

**Relations:**
- `profile` → Profile (one-to-one)
- `problems` → Problem[] (one-to-many, as creator)
- `submissions` → Submission[] (one-to-many, as submitter)
- `jobs` → Job[] (one-to-many, as creator)
- `sentMessages` → Message[] (one-to-many)
- `receivedMessages` → Message[] (one-to-many)
- `verifications` → Verification[] (one-to-many)
- `engagementsAsCompany` → Engagement[] (one-to-many)
- `engagementsAsStudent` → Engagement[] (one-to-many)
- `fraudReports` → FraudReport[] (bidirectional)
- `adminActions` → AdminAction[] (one-to-many)
- `ratingsGiven` → ProjectRating[] (one-to-many)
- `ratingsReceived` → ProjectRating[] (one-to-many)
- `certificates` → Certificate[] (one-to-many)

#### Profile (Extended User Details)
- **userId**: Foreign key (unique, cascading delete)
- **bio, phone, location, linkedinUrl, githubUrl, portfolioUrl**: General profile fields
- **skills**: JSON array of skill tags
- **avatarUrl**: User avatar image

**Role-Specific Fields:**
- **Student**: `university`, `department`, `studentId`, `gpa`, `graduationYear`, `availableForInternship`
- **Researcher**: `researchInterests`, `publications`, `orcidId`, `googleScholarUrl`, `hIndex`, `citationCount`, `supervisedStudents`, `availableForConsulting`
- **Industry**: `companyName`, `companySector`, `companySize`, `tradeLicenseNumber`, `website`, `yearEstablished`

**Common Fields:**
- **standingBadge**: green, yellow, red, or banned
- **verificationStatus**: pending, verified, or rejected

#### Problem (Research Problem Posted by Industry/Government)
- **id**: CUID
- **companyId**: Poster user ID (foreign key)
- **title, abstract, fullDescription**: Problem description
- **visibility**: public, private, or nda-required
- **bountyType**: cash, certificate, or none
- **bountyValue**: Bounty amount (if applicable)
- **status**: open, in_review, closed, or archived
- **tags**: JSON array of problem tags
- **createdAt, updatedAt**: Timestamps

#### Submission (Solution Submitted by Researcher/Student)
- **id**: CUID
- **problemId**: Foreign key to Problem
- **submitterId**: Foreign key to User (researcher/student)
- **solutionText**: Proposed solution
- **attachmentUrl**: Optional attachment
- **status**: submitted, in_review, accepted, rejected
- **feedback**: Review feedback from problem poster

#### Job (Internship/Employment Opportunity)
- **id**: CUID
- **companyId**: Posting company (foreign key)
- **title, description**: Job details
- **jobType**: fulltime, parttime, internship, contract
- **salaryRange, location**: Compensation and location
- **skillsRequired**: JSON array
- **status**: open, closed, on_hold
- **postedAt, closesAt**: Dates

#### Engagement (Project Collaboration Execution)
- **id**: CUID
- **problemId**: Reference to originating problem
- **companyId**: Client company
- **studentId**: Assigned researcher/student
- **agreement**: Signed agreement document
- **status**: proposed, pending, active, completed, disputed, cancelled
- **milestonesCompleted**: Count of completed milestones
- **totalMilestones**: Total number of milestones
- **startDate, endDate**: Project timeline
- **paymentReleased, paymentAmount**: Financial tracking

#### Message (Peer-to-Peer Communication)
- **id**: CUID
- **senderId, receiverId**: Foreign keys to Users
- **body**: Message content
- **read**: Boolean for read status
- **createdAt**: Timestamp

#### Verification (Role Verification Audit)
- **id**: CUID
- **userId**: Foreign key
- **verifiedBy**: Admin user who verified
- **status**: pending, approved, rejected
- **verificationFields**: JSON object of verified claims
- **notes, rejectionReason**: Admin notes

#### AdminAction (Admin Audit Trail)
- **id**: CUID
- **adminId**: Admin user (foreign key)
- **action**: Type of action performed
- **targetUserId, targetResourceId**: What was affected
- **reason, details**: Why and what details
- **createdAt**: Timestamp

#### FraudReport (Dispute and Fraud Tracking)
- **id**: CUID
- **reportedById, reportedUserId**: Users involved
- **reason, description**: Fraud details
- **status**: pending, reviewed, resolved, dismissed
- **createdAt**: Timestamp

#### ProjectRating (Peer Ratings After Engagement)
- **id**: CUID
- **engagementId**: Reference to completed engagement
- **raterId, rateeId**: Users involved
- **score**: 1-5 star rating
- **review**: Text review
- **createdAt**: Timestamp

#### Certificate (Skill Verification Badge)
- **id**: CUID
- **issuedToId**: User who earned it (foreign key)
- **engagementId**: Associated engagement
- **title, description**: Certificate details
- **issuedAt, expiresAt**: Validity dates
- **verificationCode**: Unique code for public verification

---

### New Models (Data Rooms - MVP Phase 1)

#### DataAsset (Shared Research Dataset)
- **id**: CUID
- **ownerId**: Researcher/owner who shares the dataset (foreign key, cascading delete)
- **title**: Name of the dataset
- **description**: Detailed description (≥30 chars)
- **sector**: e.g., "Agriculture", "Fintech", "Healthcare"
- **dataType**: tabular, image, text, audio, mixed
- **sensitivityLevel**: low, medium, high, critical
- **accessMode**: metadata_only, download, controlled
- **anonymization**: none, deidentified, anonymized, synthetic
- **recordsCount**: Number of records/samples
- **timePeriod**: Date range covered
- **ndaRequired**: Boolean flag
- **ethicsRequired**: Boolean flag
- **commercialUse**: Boolean flag
- **status**: draft, review (pending admin approval), published, suspended
- **storagePath**: Physical storage location
- **createdAt, updatedAt**: Timestamps

**Relations:**
- `owner` → User (foreign key)
- `accessRequests` → DataAccessRequest[] (one-to-many)
- `accessGrants` → DataAccessGrant[] (one-to-many)
- `auditLogs` → DataAuditLog[] (one-to-many)

#### DataAccessRequest (Request to Access a Dataset)
- **id**: CUID
- **dataAssetId**: Reference to dataset (foreign key, cascading delete)
- **requesterId**: User requesting access (foreign key)
- **purpose**: Why they want the data (≥30 chars)
- **methodology**: How they plan to use it
- **expectedOutput**: What they'll produce
- **institution**: Their affiliated institution
- **ethicsDocUrl**: Link to ethics approval (optional)
- **requestedDays**: 30, 60, or 90 day access period
- **status**: pending, owner_review, admin_review, approved, rejected, revoked, expired
- **ownerDecision**: approved, rejected (from dataset owner)
- **adminDecision**: approved, rejected (from platform admin)
- **rejectionReason**: Why it was rejected
- **createdAt, reviewedAt**: Timestamps

**Relations:**
- `dataAsset` → DataAsset (foreign key, cascading delete)
- `requester` → User (foreign key)
- `agreement` → DataUseAgreement? (one-to-one, optional)
- `grant` → DataAccessGrant? (one-to-one, optional)
- `auditLogs` → DataAuditLog[] (one-to-many)

#### DataUseAgreement (NDA/Terms Signature)
- **id**: CUID
- **requestId**: Reference to request (foreign key, unique, cascading delete)
- **agreementText**: Full terms text
- **signedByUserId**: User who signed
- **signedAt**: Signature timestamp
- **ipAddress**: IP for audit trail
- **status**: signed

**Relations:**
- `request` → DataAccessRequest (foreign key, cascading delete)

#### DataAccessGrant (Approved Access Permission)
- **id**: CUID
- **requestId**: Reference to approved request (foreign key, unique, cascading delete)
- **userId**: User granted access
- **dataAssetId**: Dataset they can access (foreign key)
- **accessMode**: How they can access (download, controlled, etc.)
- **expiresAt**: When access expires
- **revokedAt**: When revoked (if applicable)
- **status**: active, expired, revoked

**Relations:**
- `request` → DataAccessRequest (foreign key, cascading delete)
- `dataAsset` → DataAsset (foreign key)

#### DataAuditLog (Access & Download Audit Trail)
- **id**: CUID
- **userId**: Who performed the action
- **dataAssetId**: Which dataset (foreign key)
- **requestId**: Associated request (optional foreign key)
- **action**: access_requested, metadata_viewed, access_approved, access_rejected, agreement_signed, download_started, download_completed, revoked
- **ipAddress, userAgent**: Device/network fingerprint
- **metadata**: JSON object with additional context
- **createdAt**: Timestamp

**Relations:**
- `dataAsset` → DataAsset (foreign key)
- `request` → DataAccessRequest? (optional foreign key)

---

## API Routes Structure

### Authentication
- `POST /api/auth/[...nextauth]` — NextAuth.js endpoints (login, callback, signout)
- `POST /api/register` — User registration

### User Management
- `GET /api/profile` — Get current user profile
- `POST /api/profile` — Update current user profile
- `GET /api/profile/[id]` — Get specific user profile
- `GET /api/talent` — Search talent (researchers/students for hiring)

### Problems (Research Problems Marketplace)
- `GET /api/problems` — List published problems (paginated, filterable)
- `POST /api/problems` — Create new problem (industry/government only)
- `GET /api/problems/[id]` — Get problem details
- `PATCH /api/problems/[id]` — Update problem (owner only)
- `DELETE /api/problems/[id]` — Archive/delete problem (owner only)

### Submissions (Solutions to Problems)
- `GET /api/submissions` — List submissions (owner sees on their problems)
- `POST /api/submissions` — Submit solution to problem
- `GET /api/submissions/[id]` — Get submission details
- `PATCH /api/submissions/[id]` — Update submission status (approve/reject)

### Jobs (Internship/Employment Postings)
- `GET /api/jobs` — List open job postings (paginated)
- `POST /api/jobs` — Create new job posting (company only)
- `GET /api/jobs/[id]` — Get job details
- `PATCH /api/jobs/[id]` — Update job posting
- `DELETE /api/jobs/[id]` — Close job posting

### Engagements (Active Projects)
- `GET /api/engagements` — List user's engagements
- `POST /api/engagements` — Create new engagement (convert submission to project)
- `GET /api/engagements/[id]` — Get engagement details
- `PATCH /api/engagements/[id]` — Update engagement status
- `POST /api/engagements/[id]/agreement` — Sign/manage agreement
- `POST /api/engagements/[id]/milestones` — Create/update milestones
- `POST /api/engagements/[id]/rate` — Rate peer after completion
- `POST /api/engagements/[id]/release-payment` — Release escrow payment
- `POST /api/engagements/[id]/close` — Close engagement

### Milestones (Project Checkpoints)
- `GET /api/milestones/[id]` — Get milestone details
- `PATCH /api/milestones/[id]` — Update milestone (mark complete)
- `POST /api/milestones/[id]/tags` — Add/remove tags

### Messaging
- `GET /api/messages` — List conversations
- `POST /api/messages` — Send message
- `PATCH /api/messages` — Mark message as read

### Certificates (Skill Badges)
- `GET /api/certificates/[certId]` — Verify certificate (public route)

### **Data Rooms (NEW - MVP Phase 1)**

#### Core Data Asset Routes
- `GET /api/data-assets` — Browse published datasets (paginated, filterable by type/sensitivity/sector)
- `POST /api/data-assets` — Create new dataset (owner/researcher only)
- `GET /api/data-assets/[id]` — Get dataset details (with sensitivity-aware info)
- `PATCH /api/data-assets/[id]` — Update dataset (owner only)
- `DELETE /api/data-assets/[id]` — Delete dataset (owner only)
- `POST /api/data-assets/[id]/download` — Download granted dataset (creates audit log)

#### Access Request Routes
- `POST /api/data-assets/[id]/request-access` — Request access to dataset
- `GET /api/data-access-requests` — List requester's requests or owner's requests on their assets
- `POST /api/data-access-requests/[id]/owner-review` — Owner approves/rejects request
- `POST /api/data-access-requests/[id]/admin-review` — Admin approves/rejects request (for sensitive data)
- `POST /api/data-access-requests/[id]/sign-agreement` — Requester signs NDA/terms
- `POST /api/data-access-grants/[id]/revoke` — Owner or admin revokes access

#### Admin Data Room Routes
- `GET /api/admin/data-assets` — List datasets pending review (status=review)
- `PATCH /api/admin/data-assets` — Approve/reject dataset for publication
- `GET /api/admin/data-access-requests` — List requests pending admin review
- `GET /api/admin/data-audit-logs` — Audit trail of all data access/downloads

### Admin Queues & Management
- `GET /api/admin/stats` — Dashboard statistics
- `GET /api/admin/verifications` — Verification queue
- `PATCH /api/admin/verifications/[id]` — Approve/reject verification
- `GET /api/admin/fraud-reports` — Fraud report queue
- `GET /api/admin/review-watch` — Problematic submissions watch
- `GET /api/admin/payment-queue` — Pending payment releases
- `GET /api/admin/dispute-queue` — Open disputes
- `GET /api/admin/closure-queue` — Projects pending closure
- `GET /api/admin/transaction-log` — All financial transactions
- `GET /api/admin/standing-badge` — Standing badge overrides
- `POST /api/admin/standing-badge` — Apply/override standing badge

---

## Frontend Pages Structure

### Authentication (Group: `(auth)`)
Located: `/src/app/(auth)/`

- **`/login`** — Email/password login
- **`/register`** — New user signup with role selection

### Dashboard & Main Features (Group: `(dashboard)`)
Located: `/src/app/(dashboard)/`

#### Navigation Hub
- **`/dashboard`** — Main dashboard (overview, recent activity, stats)

#### Problems Marketplace
- **`/problems`** — Browse research problems (filterable by sector, bounty, status)
- **`/problems/[id]`** — Problem details, submission list, discussion
- **`/problems/new`** — Create new problem (company/government only)

#### Solutions & Submissions
- **`/submissions`** — User's submissions (for students) or received submissions (for companies)

#### Jobs/Internships
- **`/jobs`** — Browse job postings
- **`/jobs/[id]`** — Job details, apply
- **`/jobs/new`** — Post new job (company only)

#### Active Projects (Engagements)
- **`/engagements`** — List user's active/past projects
- **`/engagements/[id]`** — Project details, milestones, team, payments
- **`/engagements/[id]/agreement`** — View/sign project agreement

#### Messaging
- **`/messages`** — Inbox/conversations with other users

#### Talent Pool
- **`/talent`** — Browse researcher/student profiles (company filtering)

#### User Profiles
- **`/profile`** — Current user's profile (view/edit)
- **`/profile/[id]`** — Other user's public profile

#### **Data Rooms (NEW - MVP Phase 1)**
- **`/data-rooms`** — Browse published datasets (searchable, filterable by type/sensitivity/sector)
- **`/data-rooms/[id]`** — Dataset details (description, access terms, audit log of viewers)
- **`/data-rooms/[id]/request`** — Request access form (purpose, methodology, timeframe, ethics docs)
- **`/data-rooms/new`** — Create new dataset (owner/researcher only)
- **`/data-requests`** — My data access requests (status: pending, approved, active, expired, rejected)

#### Admin Panel
- **`/admin`** — Admin dashboard with tabbed views:
  - Overview tab: Key metrics
  - Verifications tab: Pending role verifications
  - Fraud Reports tab: Reported abuse
  - Payments tab: Payment release queue
  - Disputes tab: Open project disputes
  - Closure tab: Projects pending admin closure
  - Transactions tab: Financial ledger
  - Standing Badges tab: Badge overrides
  - **Data Rooms tab (NEW)**: Pending asset approvals, pending request reviews, audit logs

### Standalone Pages
- **`/`** — Public landing page
- **`/verify/[certId]`** — Public certificate verification page

---

## Component Architecture

### Layout Components (`/src/components/layout/`)
- **Navbar** — Top navigation with user menu, notification badge, search bar
- **Sidebar** — Dashboard sidebar with navigation links (if applicable)

### UI Components (`/src/components/ui/`)
- **Button** — Primary action button (variants: primary, secondary, danger)
- **Card** — Container for content blocks
- **Badge** — Inline label/tag (role, status, verification badge)
- **Modal** — Dialog overlay for forms, confirmations
- **Table** — Data table with sorting/pagination
- **FormInput** — Text/email/number input with validation feedback
- **Select** — Dropdown selector
- **Checkbox** — Boolean toggle
- **Textarea** — Multi-line text input

### Data Rooms Components (`/src/components/data-rooms/`) — NEW
- **SensitivityBadge** — Color-coded badge (low=green, medium=yellow, high=orange, critical=red)
- **DataAssetCard** — Dataset card preview (title, description, type, sensitivity, owner)
- **RequestStatusStepper** — Visual state machine (pending → owner_review → admin_review → approved → signed → active)
- **NdaSignModal** — Modal for signing NDA/agreement with legal text and confirmation
- **AuditLogTable** — Table of access audit log entries (action, user, timestamp, IP address)

---

## Authentication & Session Flow

### Provider: NextAuth.js with Prisma Adapter

1. **Session Strategy**: JWT (stateless, encrypted in cookie)
2. **Credentials Provider**: Email + password
3. **Password Hashing**: bcryptjs (rounds: 10)
4. **Secret**: `NEXTAUTH_SECRET` (environment variable, required)

### Authentication Sequence
```
User Login Form
    ↓
POST /api/auth/callback/credentials
    ↓
Validate email & hash password
    ↓
Create JWT session
    ↓
Set secure HTTP-only cookie
    ↓
Redirect to dashboard
```

### Session Guard
- All dashboard pages require active session
- Middleware redirects unauthenticated users to `/login`
- API routes check session before processing

---

## Data Flow Diagrams

### Problem → Submission → Engagement → Completion
```
1. Company/Government posts Problem
   ↓
2. Student/Researcher submits Solution
   ↓
3. Company reviews & accepts Submission
   ↓
4. Engagement created (project starts)
   ↓
5. Milestones tracked & completed
   ↓
6. Team rates each other
   ↓
7. Payment released (if applicable)
   ↓
8. Certificate issued to participant
```

### Data Room Access Request Flow (NEW)
```
1. Researcher publishes DataAsset (status: draft)
   ↓
2. Admin approves/rejects asset (status: review → published or rejected)
   ↓
3. Other researcher requests access (DataAccessRequest created)
   ↓
4. Asset owner reviews purpose (ownerDecision: approved/rejected)
   ↓
5. If high sensitivity, admin also reviews (adminDecision)
   ↓
6. If approved, requester signs NDA (DataUseAgreement)
   ↓
7. Access grant created (DataAccessGrant status: active)
   ↓
8. Requester downloads dataset (audit log entry created)
   ↓
9. Access expires after requestedDays (status: expired)
   ↓
10. Owner can revoke at any time (status: revoked)
```

### Role-Based Access Control (RBAC)

| Feature | Student | Researcher | Industry | Government | Admin |
|---------|---------|-----------|----------|-----------|-------|
| View Problems | ✓ | ✓ | ✓ | ✓ | ✓ |
| Post Problems | ✗ | ✗ | ✓ | ✓ | ✓ |
| Submit Solutions | ✓ | ✓ | ✗ | ✗ | ✗ |
| Browse Jobs | ✓ | ✓ | ✗ | ✗ | ✗ |
| Post Jobs | ✗ | ✗ | ✓ | ✗ | ✗ |
| Create Data Assets | ✗ | ✓ | ✗ | ✗ | ✗ |
| Request Data Access | ✓ | ✓ | ✓ | ✓ | ✗ |
| Approve Own Requests | ✓ | ✓ | ✓ | ✓ | ✗ |
| Admin Approvals | ✗ | ✗ | ✗ | ✗ | ✓ |
| View Audit Logs | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## Error Handling

### API Error Responses
```json
{
  "error": "Unauthorized",
  "message": "Session not found or expired"
}
```

Typical HTTP status codes:
- `200 OK` — Successful request
- `201 Created` — Resource created
- `400 Bad Request` — Invalid input (Zod validation failed)
- `401 Unauthorized` — No session or invalid session
- `403 Forbidden` — Insufficient permissions
- `404 Not Found` — Resource doesn't exist
- `409 Conflict` — Business logic conflict (e.g., duplicate email)
- `500 Internal Server Error` — Unexpected server error

### Client-Side Validation
- Zod schemas enforce request/response shape
- Form validation provides immediate feedback
- Toast notifications for errors (future enhancement)

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:5000  # or production URL

# Optional
NODE_ENV=development
```

---

## File Structure

```
researchbridge-bd/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── admin/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   ├── problems/
│   │   │   ├── jobs/
│   │   │   ├── engagements/
│   │   │   ├── messages/
│   │   │   ├── profile/
│   │   │   ├── talent/
│   │   │   ├── data-rooms/          ← NEW
│   │   │   ├── data-requests/       ← NEW
│   │   │   └── layout.tsx           ← Protected layout
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── problems/
│   │   │   ├── jobs/
│   │   │   ├── engagements/
│   │   │   ├── messages/
│   │   │   ├── profile/
│   │   │   ├── data-assets/         ← NEW
│   │   │   ├── data-access-requests/← NEW
│   │   │   ├── data-access-grants/  ← NEW
│   │   │   ├── admin/
│   │   │   │   ├── data-assets/
│   │   │   │   ├── data-access-requests/
│   │   │   │   └── data-audit-logs/
│   │   │   └── register/
│   │   ├── verify/
│   │   │   └── [certId]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── sidebar.tsx (if used)
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ... other UI components
│   │   └── data-rooms/              ← NEW
│   │       ├── SensitivityBadge.tsx
│   │       ├── DataAssetCard.tsx
│   │       ├── RequestStatusStepper.tsx
│   │       ├── NdaSignModal.tsx
│   │       └── AuditLogTable.tsx
│   ├── lib/
│   │   ├── auth.ts                  ← NextAuth.js config
│   │   ├── validations.ts           ← Zod schemas
│   │   ├── utils.ts                 ← Utility functions
│   │   └── prisma-singleton.ts      ← PrismaClient instance
│   └── middleware.ts                ← NextAuth middleware (if used)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── ... static assets
├── .env.example
├── .env.development.local           ← Dev environment
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Key Security Measures

1. **Password Hashing**: bcryptjs with 10 rounds
2. **Session Encryption**: JWT signed with `NEXTAUTH_SECRET`
3. **HTTP-Only Cookies**: Session tokens stored securely
4. **CSRF Protection**: NextAuth.js handles CSRF tokens automatically
5. **Input Validation**: Zod schemas validate all user inputs
6. **SQL Injection Prevention**: Prisma parameterized queries
7. **Role-Based Access Control**: Server-side permission checks before CRUD operations
8. **Audit Logging**: All sensitive actions (Data Room access, admin actions) logged

---

## Deployment

### Platforms Supported
- **Vercel** (recommended, native Next.js hosting)
- **AWS**, **Azure**, **GCP** (Node.js standard deployment)
- **Docker** (containerized deployment)

### Pre-Deployment Checklist
- [ ] Set `NEXTAUTH_SECRET` in production
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Set `DATABASE_URL` to production database
- [ ] Run `npm run build` to verify no TypeScript errors
- [ ] Review all environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS and secure cookies

---

## Future Enhancements (Phase 2+)

1. **Advanced Data Features**
   - Federated Learning for secure multi-party computation
   - Watermarking & fingerprinting for dataset protection
   - JupyterHub integration for in-situ data analysis
   - Data lineage tracking

2. **AI/ML Integrations**
   - Smart problem recommendation engine
   - Resume screening AI
   - Fraud detection model

3. **Financial Features**
   - Stripe payment integration
   - Escrow account management
   - Subscription tiers for companies

4. **Social Features**
   - Public researcher profiles
   - Achievement badges & leaderboards
   - Publication tracking & citations

5. **Compliance**
   - GDPR compliance mode
   - Data retention policies
   - Right-to-be-forgotten implementation

---

## Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Next.js conventions (file-based routing, server components by default)
- Use Tailwind CSS utility classes for styling
- Name components with PascalCase, hooks with camelCase

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` to sync
3. Update seed file if applicable
4. Test with fresh database reset

### Adding New Features
1. Define Zod schema for validation
2. Create API route(s) with proper auth checks
3. Build frontend page/component
4. Add to navbar if applicable
5. Test with multiple user roles
6. Update this architecture document

---

## Support & Troubleshooting

- **Build errors**: Run `npm install` and `npm run build`
- **Database connection**: Verify `DATABASE_URL` and network access
- **Session issues**: Check `NEXTAUTH_SECRET` is set and not empty
- **Port conflicts**: Adjust port in `package.json` scripts (default: 5000)
- **TypeScript errors**: Run `npx tsc --noEmit` to check types

