# Secure Data Room — Implementation Plan

**Feature:** Secure Data Collaboration Module for ResearchBridge BD  
**Approach:** MVP Phase 1 — Metadata listing + access request + NDA + owner/admin approval + signed download links  
**Built on top of:** existing Next.js 16 + Prisma + PostgreSQL + NextAuth + Zod stack

---

## 1. What We Are Building

A **Secure Data Room** marketplace module that sits alongside Problems, Jobs, Talent, Engagements, and Messages. It lets hospitals and companies list sensitive datasets with only metadata visible publicly, lets verified researchers request access, routes approvals through the owner and admin, captures a digital NDA signature, then grants time-limited signed download access — with every action written to an immutable audit log.

```
/data-rooms         — public browse page (metadata only)
/data-rooms/new     — create a data asset (industry/admin only)
/data-rooms/[id]    — dataset detail + Request Access button
/data-rooms/[id]/request  — researcher access request form
/data-requests      — my pending/approved/rejected requests (researcher view)
/admin              — new "Data Rooms" tab added to existing admin page
```

---

## 2. Existing Foundations We Reuse

| Existing system | How we reuse it |
|---|---|
| `User` + `role` field | Controls who can create, request, approve |
| `Profile.verificationStatus` | Gate: only verified researchers can request high-sensitivity data |
| `Verification` model + admin queue | Hospital/company must be verified before publishing a data asset |
| `AdminAction` model | All admin approvals/rejections are logged here (existing pattern) |
| `Message` model | Researchers can message the dataset owner directly from the detail page |
| `getServerSession` / `authOptions` | Same auth pattern used in all existing API routes |
| Zod `validations.ts` | New schemas added to the same file |
| `prisma.ts` singleton | No change needed |
| `Card`, `Badge`, `Button`, `Modal` UI components | All reused as-is |
| Admin page tab pattern | We add a `data-rooms` tab to the existing `AdminPage` component |
| Navbar `navLinks` array | We add a `/data-rooms` link into the existing array |

---

## 3. Database Changes

### 3.1 New models to add to `prisma/schema.prisma`

#### `DataAsset`
Represents a dataset published by a hospital or company.

```prisma
model DataAsset {
  id               String   @id @default(cuid())
  ownerId          String
  owner            User     @relation("OwnedDataAssets", fields: [ownerId], references: [id])
  title            String
  description      String
  sector           String?
  dataType         String   // tabular, image, text, audio, mixed
  sensitivityLevel String   // low, medium, high, critical
  accessMode       String   // metadata_only, download, controlled
  anonymization    String   // none, deidentified, anonymized, synthetic
  recordsCount     Int?
  timePeriod       String?
  ndaRequired      Boolean  @default(true)
  ethicsRequired   Boolean  @default(false)
  commercialUse    Boolean  @default(false)
  status           String   @default("draft") // draft, review, published, suspended
  storagePath      String?  // S3/R2 key — null for metadata_only mode
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  accessRequests   DataAccessRequest[]
  accessGrants     DataAccessGrant[]
  auditLogs        DataAuditLog[]
}
```

#### `DataAccessRequest`
A researcher's formal request to access a dataset.

```prisma
model DataAccessRequest {
  id                String    @id @default(cuid())
  dataAssetId       String
  dataAsset         DataAsset @relation(fields: [dataAssetId], references: [id], onDelete: Cascade)
  requesterId       String
  requester         User      @relation("DataAccessRequests", fields: [requesterId], references: [id])
  purpose           String
  methodology       String?
  expectedOutput    String?
  institution       String?
  ethicsDocUrl      String?
  requestedDays     Int?      // 30, 60, 90
  status            String    @default("pending")
  // pending | owner_review | admin_review | approved | rejected | revoked | expired
  ownerDecision     String?   // approved | rejected
  adminDecision     String?   // approved | rejected
  rejectionReason   String?
  createdAt         DateTime  @default(now())
  reviewedAt        DateTime?

  agreement         DataUseAgreement?
  grant             DataAccessGrant?
  auditLogs         DataAuditLog[]
}
```

#### `DataUseAgreement`
Digital NDA signature captured before access is granted.

```prisma
model DataUseAgreement {
  id             String            @id @default(cuid())
  requestId      String            @unique
  request        DataAccessRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  agreementText  String
  signedByUserId String
  signedAt       DateTime          @default(now())
  ipAddress      String?
  status         String            @default("signed")
}
```

#### `DataAccessGrant`
The active permission record that controls actual file access.

```prisma
model DataAccessGrant {
  id           String            @id @default(cuid())
  requestId    String            @unique
  request      DataAccessRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  userId       String
  dataAssetId  String
  dataAsset    DataAsset         @relation(fields: [dataAssetId], references: [id])
  accessMode   String
  expiresAt    DateTime
  revokedAt    DateTime?
  status       String            @default("active") // active, expired, revoked
}
```

#### `DataAuditLog`
Immutable log of every action taken on a data asset.

```prisma
model DataAuditLog {
  id           String            @id @default(cuid())
  userId       String
  dataAssetId  String
  dataAsset    DataAsset         @relation(fields: [dataAssetId], references: [id])
  requestId    String?
  request      DataAccessRequest? @relation(fields: [requestId], references: [id])
  action       String
  // viewed_metadata | requested_access | owner_approved | owner_rejected
  // admin_approved | admin_rejected | agreement_signed | access_granted
  // download_attempted | access_revoked | access_expired
  ipAddress    String?
  userAgent    String?
  metadata     String?  // JSON
  createdAt    DateTime @default(now())
}
```

### 3.2 `User` model additions (two new relations)

```prisma
// Add inside model User:
ownedDataAssets    DataAsset[]        @relation("OwnedDataAssets")
dataAccessRequests DataAccessRequest[] @relation("DataAccessRequests")
```

### 3.3 Migration command

```bash
npx prisma db push
# or for production:
npx prisma migrate dev --name add_data_room_module
```

---

## 4. Zod Validation Schemas to Add

Add to `src/lib/validations.ts`:

```ts
export const dataAssetSchema = z.object({
  title:            z.string().min(5),
  description:      z.string().min(30),
  sector:           z.string().optional(),
  dataType:         z.enum(["tabular", "image", "text", "audio", "mixed"]),
  sensitivityLevel: z.enum(["low", "medium", "high", "critical"]),
  accessMode:       z.enum(["metadata_only", "download", "controlled"]),
  anonymization:    z.enum(["none", "deidentified", "anonymized", "synthetic"]),
  recordsCount:     z.number().positive().optional(),
  timePeriod:       z.string().optional(),
  ndaRequired:      z.boolean(),
  ethicsRequired:   z.boolean(),
  commercialUse:    z.boolean(),
});

export const dataAccessRequestSchema = z.object({
  purpose:         z.string().min(30, "Explain your research purpose in at least 30 characters"),
  methodology:     z.string().optional(),
  expectedOutput:  z.string().optional(),
  institution:     z.string().optional(),
  ethicsDocUrl:    z.string().url().optional().or(z.literal("")),
  requestedDays:   z.enum(["30", "60", "90"]),
});
```

---

## 5. API Routes to Create

All routes follow the exact same pattern as existing routes: `getServerSession` auth check → role/ownership guard → Zod parse → Prisma query → `NextResponse.json`.

```
src/app/api/data-assets/route.ts                           GET (browse), POST (create)
src/app/api/data-assets/[id]/route.ts                      GET (detail), PUT (edit), DELETE
src/app/api/data-assets/[id]/request-access/route.ts       POST — researcher submits request
src/app/api/data-assets/[id]/download/route.ts             GET — returns short-lived signed URL
src/app/api/data-access-requests/route.ts                  GET — my requests (researcher) / incoming (owner)
src/app/api/data-access-requests/[id]/owner-review/route.ts  POST — owner approves/rejects
src/app/api/data-access-requests/[id]/admin-review/route.ts  POST — admin approves/rejects
src/app/api/data-access-requests/[id]/sign-agreement/route.ts POST — researcher signs NDA
src/app/api/data-access-grants/[id]/revoke/route.ts        POST — owner or admin revokes access
src/app/api/admin/data-assets/route.ts                     GET — admin sees all assets
src/app/api/admin/data-access-requests/route.ts            GET — admin sees all pending requests
src/app/api/admin/data-audit-logs/route.ts                 GET — admin sees full audit trail
```

### Role guards per route

| Route | Who can call |
|---|---|
| `POST /api/data-assets` | `industry`, `government`, `admin` (must be verified) |
| `GET /api/data-assets` | any authenticated user |
| `POST /api/data-assets/[id]/request-access` | `student`, `researcher` (verified preferred) |
| `POST /api/data-access-requests/[id]/owner-review` | asset owner only |
| `POST /api/data-access-requests/[id]/admin-review` | `admin` only |
| `POST /api/data-access-requests/[id]/sign-agreement` | request requester only |
| `GET /api/data-assets/[id]/download` | requester with an active `DataAccessGrant` |
| `POST /api/data-access-grants/[id]/revoke` | asset owner or `admin` |
| All `/api/admin/*` routes | `admin` only |

---

## 6. Frontend Pages to Create

```
src/app/(dashboard)/data-rooms/page.tsx             — Browse all published data assets
src/app/(dashboard)/data-rooms/new/page.tsx         — Create data asset form (industry/admin)
src/app/(dashboard)/data-rooms/[id]/page.tsx        — Dataset detail + request access button
src/app/(dashboard)/data-rooms/[id]/request/page.tsx — Request access form (researcher)
src/app/(dashboard)/data-requests/page.tsx           — My requests dashboard (researcher)
                                                     — Incoming requests dashboard (owner)
```

The admin view goes inside the **existing** `src/app/(dashboard)/admin/page.tsx` as a new tab, following the exact same `TabType` union and tab-switching pattern already there.

### Page-by-page breakdown

#### `/data-rooms` — Browse Page
- Grid of `Card` components showing: title, owner name, sector badge, data type badge, sensitivity badge, access mode tag, NDA required indicator
- Filter bar: sector, sensitivity level, data type, access mode
- "Create Data Room" button visible only to `industry`/`government`/`admin` roles
- Clicking a card goes to `/data-rooms/[id]`

#### `/data-rooms/new` — Create Form
- Fields matching `dataAssetSchema`: title, description, sector, data type, sensitivity level, access mode, anonymization, records count, time period, NDA required toggle, ethics required toggle, commercial use toggle
- On submit → `POST /api/data-assets` → redirect to the new asset's detail page with `status: draft`
- Owner must then submit for review to publish

#### `/data-rooms/[id]` — Detail Page
- Displays all metadata fields in a two-column layout using existing `Card` components
- Sensitivity level shown with color-coded `Badge` (green=low, yellow=medium, orange=high, red=critical)
- Access requirements section: NDA required, ethics required, allowed access mode
- **"Request Access"** button:
  - Hidden if: user is the owner, user already has a pending/approved request, asset is not published
  - Shows "Access Pending" badge if they already applied
  - Shows "Download Dataset" button if they have an active `DataAccessGrant`
  - For `metadata_only` access mode: shows "Contact Owner" button linking to `/messages`
- Owner sees their own asset status (draft/review/published) + a "Submit for Review" button if draft
- Message owner button for all other users

#### `/data-rooms/[id]/request` — Request Form
- Fields matching `dataAccessRequestSchema`: purpose, methodology, expected output, institution, ethics document URL, requested access duration (30/60/90 days)
- Warning banner if `ethicsRequired: true` on the asset
- On submit → `POST /api/data-assets/[id]/request-access`
- Redirects to `/data-requests`

#### `/data-requests` — My Requests
- Two views toggled by role:
  - **Researcher view**: table of all their submitted requests with status pipeline badges
  - **Owner/Industry view**: incoming requests with Approve/Reject buttons per request
- Status pipeline displayed as a horizontal stepper:
  ```
  Submitted → Owner Review → Admin Review → NDA Sign → Access Granted
  ```
- If `ownerDecision = approved` and `adminDecision = null`: owner-approved, waiting for admin
- If both approved: researcher sees "Sign NDA" button which opens a modal with the agreement text + confirm checkbox
- After signing: `DataAccessGrant` is created, "Download Dataset" button appears on the detail page

#### Admin tab in `/admin`
- New `"data-rooms"` tab added to the existing `TabType` union in `admin/page.tsx`
- Three sub-sections within the tab:
  1. **Pending review** — assets submitted by owners awaiting publish approval
  2. **Pending access requests** — requests that have passed owner review and need admin sign-off
  3. **Audit log** — paginated table of all `DataAuditLog` entries with user, asset, action, IP, timestamp

---

## 7. Component Files to Create

```
src/components/data-rooms/DataAssetCard.tsx       — Reusable card for browse grid
src/components/data-rooms/SensitivityBadge.tsx    — Color-coded sensitivity level badge
src/components/data-rooms/AccessRequestForm.tsx   — Controlled form component
src/components/data-rooms/RequestStatusStepper.tsx — Horizontal approval pipeline UI
src/components/data-rooms/NdaSignModal.tsx         — Modal with agreement text + sign checkbox
src/components/data-rooms/AuditLogTable.tsx        — Table for admin audit log view
```

These follow the exact same patterns as existing components in `src/components/ui/`.

---

## 8. Navbar Change

In `src/components/layout/navbar.tsx`, add one entry to the `navLinks` array:

```ts
{ href: "/data-rooms", label: "Data Rooms", icon: Database, notify: false },
```

Place it between `Jobs` and `Messages`. Import `Database` from `lucide-react`.

---

## 9. Approval Workflow State Machine

```
[Owner creates asset]
        ↓
   status: "draft"
        ↓
[Owner submits for review]
        ↓
   status: "review"       ← Admin sees it in the queue
        ↓
[Admin publishes]
        ↓
   status: "published"    ← Now visible on /data-rooms

[Researcher requests access]
        ↓
   DataAccessRequest.status: "pending"
        ↓
[Owner approves]
        ↓
   ownerDecision: "approved", status: "owner_review" → "admin_review"
        ↓
[Admin approves]
        ↓
   adminDecision: "approved", status: "approved"
        ↓
[Researcher signs NDA]
        ↓
   DataUseAgreement created
   DataAccessGrant created (status: "active", expiresAt = now + requestedDays)
        ↓
[Researcher downloads]
        ↓
   GET /api/data-assets/[id]/download
   → server checks grant is active + not expired
   → returns signed URL (short-lived, e.g. 15 minutes)
   → DataAuditLog entry: action = "download_attempted"
```

Every state transition writes a `DataAuditLog` entry.

---

## 10. Security Rules Summary

| Rule | Where enforced |
|---|---|
| Only verified industry/government can publish | `POST /api/data-assets` — check `session.user.verified` |
| `critical` sensitivity → `accessMode` forced to `metadata_only` or `controlled` | Zod schema + API-level check |
| Signed download URL expires in 15 min | Server generates URL with short TTL; no permanent links stored client-side |
| NDA must be signed before grant is created | `sign-agreement` route creates both `DataUseAgreement` and `DataAccessGrant` atomically |
| Grant expiry checked on every download attempt | `download` route checks `grant.status === "active"` and `grant.expiresAt > new Date()` |
| Admin can revoke any grant at any time | `POST /api/data-access-grants/[id]/revoke` sets `revokedAt` and `status: "revoked"` |
| Every download attempt is logged | `DataAuditLog` written regardless of success or failure |
| IP address captured in audit log and NDA | Extracted from `req.headers.get("x-forwarded-for")` |

---

## 11. Implementation Order (Task Sequence)

| # | Task | Files touched |
|---|---|---|
| 1 | **Schema + migrate** | `prisma/schema.prisma` → `npx prisma db push` |
| 2 | **Zod schemas** | `src/lib/validations.ts` |
| 3 | **Core API routes** | `data-assets/route.ts`, `data-assets/[id]/route.ts` |
| 4 | **Request + review APIs** | `request-access`, `owner-review`, `admin-review`, `sign-agreement`, `revoke` routes |
| 5 | **Download API** | `data-assets/[id]/download/route.ts` |
| 6 | **Admin API routes** | `/api/admin/data-assets`, `/api/admin/data-access-requests`, `/api/admin/data-audit-logs` |
| 7 | **Reusable components** | `DataAssetCard`, `SensitivityBadge`, `AccessRequestForm`, `RequestStatusStepper`, `NdaSignModal`, `AuditLogTable` |
| 8 | **Browse + detail pages** | `/data-rooms/page.tsx`, `/data-rooms/[id]/page.tsx` |
| 9 | **Create + request pages** | `/data-rooms/new/page.tsx`, `/data-rooms/[id]/request/page.tsx` |
| 10 | **My requests page** | `/data-requests/page.tsx` |
| 11 | **Admin tab** | Extend existing `src/app/(dashboard)/admin/page.tsx` |
| 12 | **Navbar** | Add link + `Database` icon to `navbar.tsx` |
| 13 | **Seed data** | Add 3 sample `DataAsset` records to `prisma/seed.ts` |

---

## 12. Seed Data to Add

Three sample datasets for testing:

```ts
// In prisma/seed.ts, after existing seed runs:

await prisma.dataAsset.createMany({
  data: [
    {
      ownerId: techSolve.id,              // existing industry user
      title: "E-commerce Transaction Fraud Dataset",
      description: "Anonymized transaction records from 2020–2024. Useful for fraud detection model training.",
      sector: "Finance",
      dataType: "tabular",
      sensitivityLevel: "medium",
      accessMode: "download",
      anonymization: "anonymized",
      recordsCount: 250000,
      timePeriod: "2020–2024",
      ndaRequired: true,
      ethicsRequired: false,
      commercialUse: false,
      status: "published",
    },
    {
      ownerId: agriData.id,               // existing industry user
      title: "Soil Health & Crop Yield Dataset — Bangladesh Districts",
      description: "Aggregated soil sensor and crop yield data across 20 districts. Suitable for predictive modelling.",
      sector: "Agriculture",
      dataType: "tabular",
      sensitivityLevel: "low",
      accessMode: "download",
      anonymization: "anonymized",
      recordsCount: 48000,
      timePeriod: "2019–2023",
      ndaRequired: false,
      ethicsRequired: false,
      commercialUse: true,
      status: "published",
    },
    {
      ownerId: techSolve.id,
      title: "Hospital Readmission Records — De-identified",
      description: "De-identified patient readmission data. High sensitivity. Workspace access only. Ethics approval required.",
      sector: "Healthcare",
      dataType: "tabular",
      sensitivityLevel: "critical",
      accessMode: "metadata_only",
      anonymization: "deidentified",
      recordsCount: 15000,
      timePeriod: "2021–2023",
      ndaRequired: true,
      ethicsRequired: true,
      commercialUse: false,
      status: "published",
    },
  ],
});
```

---

## 13. Out of Scope for This MVP

These are noted for future phases and should **not** be built now:

- **Secure research workspace** (JupyterHub / Docker containers) — Phase 2
- **Federated learning** — Phase 3
- **Synthetic data generation** — Phase 3
- **File watermarking** — can be added to the download route later
- **K-anonymity / differential privacy checks** on uploads — Phase 2
- **Vercel Blob or S3 file upload UI** — the `storagePath` field is stored but upload UI is deferred; for MVP the owner provides an external link or uploads manually
- **Email notifications** on status changes — deferred; can use existing messaging system for now

---

## 14. Definition of Done

- [ ] `npx prisma db push` runs without errors and creates all 5 new tables
- [ ] All 13 API routes return correct HTTP status codes and role-guard errors
- [ ] Browse page lists published assets with correct metadata (no raw file paths exposed)
- [ ] Researcher can submit an access request and see it on `/data-requests`
- [ ] Owner can approve/reject incoming requests from `/data-requests`
- [ ] Admin can approve/reject from the new admin tab
- [ ] NDA modal appears after admin approves; signing creates a `DataAccessGrant`
- [ ] Download route returns a signed URL only for active, non-expired grants
- [ ] Every state transition writes a `DataAuditLog` row visible in the admin audit log tab
- [ ] `critical` sensitivity assets show no download button regardless of grant status
- [ ] Navbar shows "Data Rooms" link for all logged-in users
- [ ] Seed data includes 3 sample assets covering low, medium, and critical sensitivity
