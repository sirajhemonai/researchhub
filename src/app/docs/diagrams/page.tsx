import type { Metadata } from "next";
import { MermaidDiagram } from "@/components/docs/mermaid-diagram";
import { PrintButton } from "@/components/docs/print-button";

export const metadata: Metadata = {
  title: "System Diagrams — ResearchBridge BD",
  description:
    "Architecture, database, use-case, workflow, and trust-model diagrams for the ResearchBridge BD platform.",
};

type Diagram = {
  no: number;
  title: string;
  caption: string;
  chart: string;
};

const DIAGRAMS: Diagram[] = [
  {
    no: 1,
    title: "System Architecture (High-Level)",
    caption:
      "Figure 1: Layered system architecture showing request flow left-to-right from the browser through the presentation, API, authentication, ORM, and data layers.",
    chart: `flowchart LR
  subgraph CLIENT["CLIENT LAYER — Browser"]
    direction TB
    U["Users — 5 Roles<br/>Student · Researcher<br/>Industry · Government · Admin"]
  end

  subgraph PRES["PRESENTATION LAYER<br/>Next.js 16 · React 19 · Tailwind v4"]
    direction TB
    P1["Dashboard"]
    P2["Problems"]
    P3["Jobs"]
    P4["Talent"]
    P5["Messages"]
    P6["Admin Panel"]
  end

  subgraph APIL["APPLICATION LAYER<br/>Route Handlers (/api/*)"]
    direction TB
    A1["/api/problems"]
    A2["/api/submissions"]
    A3["/api/engagements"]
    A4["/api/jobs"]
    A5["/api/messages"]
    A6["/api/admin"]
  end

  subgraph SVC["AUTH & BUSINESS LOGIC LAYER"]
    direction TB
    AU["NextAuth.js<br/>JWT · bcrypt · RBAC"]
    BL["Trust Score · Verification<br/>Validation (Zod)"]
  end

  ORM["DATA ACCESS LAYER — Prisma ORM (Prisma Client)"]

  DB[("DATA LAYER — PostgreSQL (Neon)<br/>15 Models: User · Profile · Problem · Submission<br/>Engagement · Milestone · Message · Job · Dispute<br/>Certificate · Rating · Verification · FraudReport")]

  U -->|HTTPS| PRES
  PRES -->|fetch / REST JSON| APIL
  APIL --> SVC
  SVC --> ORM
  APIL --> ORM
  ORM -->|SQL| DB`,
  },
  {
    no: 2,
    title: "Entity-Relationship Diagram (Database)",
    caption:
      "Figure 2: Core data model. A User owns one Profile and can author Problems; each Problem receives Submissions that mature into Engagements tracked by Milestones.",
    chart: `erDiagram
  USER ||--|| PROFILE : has
  USER ||--o{ PROBLEM : posts
  USER ||--o{ SUBMISSION : makes
  USER ||--o{ JOB : posts
  USER ||--o{ MESSAGE : sends
  USER ||--o{ VERIFICATION : requests
  PROBLEM ||--o{ SUBMISSION : receives
  PROBLEM ||--o{ ENGAGEMENT : yields
  SUBMISSION ||--o| ENGAGEMENT : becomes
  ENGAGEMENT ||--o{ MILESTONE : contains
  ENGAGEMENT ||--o| DISPUTE : may_raise
  ENGAGEMENT ||--o| CERTIFICATE : issues
  ENGAGEMENT ||--o| PROJECTRATING : rated_by
  USER ||--o{ FRAUDREPORT : files
  ADMIN ||--o{ ADMINACTION : performs

  USER {
    string id PK
    string email
    string role
    int trustScore
  }
  PROFILE {
    string id PK
    string userId FK
    string verificationStatus
  }
  PROBLEM {
    string id PK
    string companyId FK
    string status
  }
  SUBMISSION {
    string id PK
    string problemId FK
    string userId FK
    string status
  }
  ENGAGEMENT {
    string id PK
    string problemId FK
    string status
  }
  MILESTONE {
    string id PK
    string engagementId FK
    string status
  }`,
  },
  {
    no: 3,
    title: "Use-Case Diagram (Actors & Capabilities)",
    caption:
      "Figure 3: Actor-based view of platform capabilities across the five user roles, highlighting the multi-stakeholder design.",
    chart: `flowchart LR
  STU(["Student"])
  RES(["Researcher"])
  IND(["Industry"])
  GOV(["Government"])
  ADM(["Admin"])

  subgraph SYSTEM["ResearchBridge BD"]
    UC1(["Post Problem"])
    UC2(["Submit Solution"])
    UC3(["Shortlist Candidate"])
    UC4(["Create Engagement"])
    UC5(["Track Milestones"])
    UC6(["Exchange Messages"])
    UC7(["Post / Apply Job"])
    UC8(["Verify Company"])
    UC9(["Resolve Dispute"])
    UC10(["Issue Certificate"])
  end

  IND --> UC1
  GOV --> UC1
  STU --> UC2
  RES --> UC2
  IND --> UC3
  IND --> UC4
  STU --> UC5
  IND --> UC5
  STU --> UC6
  IND --> UC6
  RES --> UC6
  IND --> UC7
  STU --> UC7
  ADM --> UC8
  ADM --> UC9
  ADM --> UC10`,
  },
  {
    no: 4,
    title: "Problem-to-Engagement Workflow (Sequence)",
    caption:
      "Figure 4: The core value chain — the sequence of interactions that turns a posted industry problem into a completed, certified engagement.",
    chart: `sequenceDiagram
  actor C as Industry
  actor S as Student/Researcher
  participant SYS as Platform
  actor A as Admin

  C->>SYS: Post Problem (open)
  S->>SYS: Submit Solution
  SYS-->>C: Notify new submission
  C->>SYS: Shortlist submission
  C->>SYS: Create Engagement (negotiating)
  S->>SYS: Accept terms
  C->>SYS: Confirm deposit
  A->>SYS: Verify payment -> active
  loop Each Milestone
    S->>SYS: Submit milestone work
    C->>SYS: Review & approve
  end
  SYS-->>C: Engagement completed
  SYS-->>S: Issue Certificate + Rating`,
  },
  {
    no: 5,
    title: "Trust & Verification Model",
    caption:
      "Figure 5: How platform integrity is enforced — the verification pipeline, trust-score inputs, and fraud-handling loop.",
    chart: `flowchart TB
  subgraph VERIFY["Verification Pipeline"]
    V1["User submits<br/>documents"] --> V2{"Admin<br/>review"}
    V2 -->|Approve| V3["Verified Badge"]
    V2 -->|Reject| V4["Rejected"]
  end

  subgraph TRUST["Trust Score Engine"]
    T1["Verification status"] --> TS(("Trust<br/>Score"))
    T2["Completed engagements"] --> TS
    T3["Project ratings"] --> TS
    T4["Disputes / penalties"] --> TS
  end

  subgraph FRAUD["Fraud Handling"]
    F1["User files<br/>Fraud Report"] --> F2{"Admin<br/>Action"}
    F2 -->|Valid| F3["Status override /<br/>score penalty"]
    F2 -->|Dismiss| F4["No change"]
  end

  V3 --> T1
  F3 --> T4`,
  },
];

export default function DiagramsPage() {
  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      {/* Screen-only toolbar */}
      <div className="mx-auto max-w-4xl px-6 pt-10 pb-6 print:hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              Documentation
            </p>
            <h1 className="mt-1 text-3xl font-bold text-balance text-foreground">
              ResearchBridge BD — System Diagrams
            </h1>
            <p className="mt-2 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              Five methodology diagrams, formatted one per page. Use{" "}
              <span className="font-medium text-foreground">Print / Save as PDF</span>{" "}
              to export a clean report where each figure occupies its own page.
            </p>
          </div>
          <PrintButton />
        </div>
      </div>

      {/* Pages */}
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-16 print:max-w-none print:gap-0 print:px-0 print:pb-0">
        {DIAGRAMS.map((d) => (
          <section
            key={d.no}
            className="diagram-page flex flex-col rounded-xl border border-border bg-card p-8 shadow-sm print:min-h-screen print:rounded-none print:border-0 print:shadow-none"
          >
            <header className="mb-6 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {d.no}
                </span>
                <h2 className="text-xl font-semibold text-balance text-foreground">
                  {d.title}
                </h2>
              </div>
            </header>

            <div className="flex flex-1 items-center justify-center py-4">
              <MermaidDiagram id={`diagram-${d.no}`} chart={d.chart} />
            </div>

            <footer className="mt-6 border-t border-border pt-4">
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                {d.caption}
              </p>
            </footer>
          </section>
        ))}
      </div>
    </div>
  );
}
