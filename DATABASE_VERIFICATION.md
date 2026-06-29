# ResearchBridge BD - Database Verification Guide

This document provides SQL and TypeScript queries to verify the demo data population for audit purposes.

---

## 📊 Quick Data Summary

Run this to see current state:

```typescript
// Run with: set -a && source /vercel/share/.env.project && set +a && npx tsx -e "..."

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  const stats = {
    users: await prisma.user.count(),
    students: await prisma.user.count({ where: { role: 'student' } }),
    companies: await prisma.user.count({ where: { role: 'industry' } }),
    researchers: await prisma.user.count({ where: { role: 'researcher' } }),
    admins: await prisma.user.count({ where: { role: 'admin' } }),
    problems: await prisma.problem.count(),
    submissions: await prisma.submission.count(),
    jobs: await prisma.job.count(),
    messages: await prisma.message.count(),
    engagements: await prisma.engagement.count(),
    milestones: await prisma.milestone.count(),
  };
  
  console.table(stats);
  await prisma.$disconnect();
})();
```

---

## 👥 User Verification

### List All Users with Roles
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verified: true,
      trustScore: true,
    },
  });
  
  console.table(users);
  await prisma.$disconnect();
})();
```

### Verify Test Accounts
```typescript
const testAccounts = [
  'admin@researchbridge.com.bd',
  'rahim@diu.edu.bd',
  'fatima@bracu.edu.bd',
  'karim@nsu.edu.bd',
  'aisha@aiub.edu.bd',
  'hassan@iu.edu.bd',
  'nasrin@diu.edu.bd',
  'hr@techsolve.com.bd',
  'info@agridata.com.bd',
  'contact@finedge.com.bd',
  'contact@greenenergy.com.bd',
  'hello@newstartup.com.bd',
];

const users = await prisma.user.findMany({
  where: { email: { in: testAccounts } },
  select: { email: true, role: true, verified: true },
});

console.log(`✅ ${users.length} test accounts verified`);
```

### Check Student Profiles
```typescript
const students = await prisma.user.findMany({
  where: { role: 'student' },
  include: { profile: true },
});

console.log(`Students: ${students.length}`);
students.forEach(s => {
  console.log(`- ${s.name}: ${s.profile?.university} (GPA: ${s.profile?.gpa})`);
});
```

### Check Company Verification Status
```typescript
const companies = await prisma.user.findMany({
  where: { role: 'industry' },
  include: { profile: true },
});

console.log('Companies:');
companies.forEach(c => {
  console.log(`- ${c.name}: ${c.profile?.verificationStatus}`);
});
```

---

## 📋 Problem Marketplace Verification

### List All Problems
```typescript
const problems = await prisma.problem.findMany({
  include: {
    company: { select: { name: true } },
    submissions: { select: { id: true } },
  },
});

console.table(problems.map(p => ({
  title: p.title.substring(0, 40) + '...',
  company: p.company.name,
  status: p.status,
  submissions: p.submissions.length,
  bounty: p.bountyValue,
})));
```

### Check Problem Details
```typescript
const problem1 = await prisma.problem.findFirst({
  where: { title: { contains: 'Resume' } },
  include: {
    company: true,
    submissions: {
      include: { user: true },
    },
  },
});

console.log('Problem:', problem1?.title);
console.log('Company:', problem1?.company.name);
console.log('Submissions:', problem1?.submissions.length);
problem1?.submissions.forEach(s => {
  console.log(`  - ${s.user.name}: ${s.status}`);
});
```

### Count by Status
```typescript
const statuses = await prisma.problem.groupBy({
  by: ['status'],
  _count: true,
});

console.log('Problems by Status:');
console.table(statuses);
```

---

## 📤 Submission Verification

### List All Submissions
```typescript
const submissions = await prisma.submission.findMany({
  include: {
    user: { select: { name: true, email: true } },
    problem: { select: { title: true } },
  },
});

console.table(submissions.map(s => ({
  student: s.user.name,
  problem: s.problem.title.substring(0, 30),
  status: s.status,
  score: s.score,
})));
```

### Shortlisted Submissions
```typescript
const shortlisted = await prisma.submission.findMany({
  where: { status: 'shortlisted' },
  include: {
    user: { select: { name: true } },
    problem: { select: { title: true } },
  },
});

console.log(`Shortlisted Submissions: ${shortlisted.length}`);
shortlisted.forEach(s => {
  console.log(`- ${s.user.name}: ${s.problem.title}`);
});
```

---

## 💼 Engagement Verification

### List Active Engagements
```typescript
const engagements = await prisma.engagement.findMany({
  include: {
    company: { select: { name: true } },
    student: { select: { name: true } },
    problem: { select: { title: true } },
    milestones: { select: { id: true, status: true } },
  },
});

console.table(engagements.map(e => ({
  company: e.company.name,
  student: e.student.name,
  problem: e.problem.title.substring(0, 30),
  status: e.status,
  milestones: e.milestones.length,
})));
```

### Engagement Status Breakdown
```typescript
const statuses = await prisma.engagement.groupBy({
  by: ['status'],
  _count: true,
});

console.log('Engagements by Status:');
console.table(statuses);
```

### Check Milestones
```typescript
const milestones = await prisma.milestone.findMany({
  include: {
    engagement: {
      include: { company: { select: { name: true } } },
    },
  },
});

console.log('All Milestones:');
milestones.forEach(m => {
  console.log(`- ${m.title} (${m.status}) - Due: ${m.dueDate}`);
});
```

---

## 💬 Messaging Verification

### Count Messages
```typescript
const messageCount = await prisma.message.count();
console.log(`Total Messages: ${messageCount}`);
```

### List Conversations
```typescript
const messages = await prisma.message.findMany({
  include: {
    sender: { select: { name: true } },
    receiver: { select: { name: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
});

console.table(messages.map(m => ({
  from: m.sender.name,
  to: m.receiver.name,
  body: m.body.substring(0, 50) + '...',
  read: m.read,
})));
```

### Message Volume by User Pair
```typescript
const messages = await prisma.message.findMany({
  include: {
    sender: { select: { name: true } },
    receiver: { select: { name: true } },
  },
});

const conversations = {};
messages.forEach(m => {
  const key = [m.sender.name, m.receiver.name].sort().join(' ↔ ');
  conversations[key] = (conversations[key] || 0) + 1;
});

console.log('Active Conversations:');
Object.entries(conversations).forEach(([pair, count]) => {
  console.log(`  ${pair}: ${count} messages`);
});
```

---

## 🏢 Company & Job Verification

### List Companies with Sectors
```typescript
const companies = await prisma.user.findMany({
  where: { role: 'industry' },
  include: { profile: true },
});

console.table(companies.map(c => ({
  name: c.name,
  sector: c.profile?.companySector,
  verified: c.profile?.verificationStatus,
  trustScore: c.trustScore,
})));
```

### Job Postings by Company
```typescript
const jobs = await prisma.job.findMany({
  include: { company: { select: { name: true } } },
});

console.table(jobs.map(j => ({
  title: j.title,
  company: j.company.name,
  type: j.type,
  salary: j.salary,
  status: j.status,
})));
```

### Jobs by Type
```typescript
const jobTypes = await prisma.job.groupBy({
  by: ['type'],
  _count: true,
});

console.log('Jobs by Type:');
console.table(jobTypes);
```

---

## 🔍 Data Integrity Checks

### Verify Foreign Key Relationships
```typescript
// Check orphaned data
const problemsWithoutCompany = await prisma.problem.findMany({
  where: { company: null },
});

const submissionsWithoutProblem = await prisma.submission.findMany({
  where: { problem: null },
});

console.log(`Orphaned Problems: ${problemsWithoutCompany.length}`);
console.log(`Orphaned Submissions: ${submissionsWithoutProblem.length}`);
```

### Verify Profile Completeness
```typescript
const incompleteProfiles = await prisma.profile.findMany({
  where: {
    OR: [
      { bio: null },
      { location: null },
    ],
  },
});

console.log(`Incomplete Profiles: ${incompleteProfiles.length}`);
```

### Check Duplicate Emails
```typescript
const emails = await prisma.user.groupBy({
  by: ['email'],
  _count: true,
  having: { email: { _count: { gt: 1 } } },
});

console.log(`Duplicate Emails: ${emails.length}`);
```

---

## 📈 Statistics & Metrics

### Platform Activity Summary
```typescript
const stats = {
  totalUsers: await prisma.user.count(),
  studentCount: await prisma.user.count({ where: { role: 'student' } }),
  companyCount: await prisma.user.count({ where: { role: 'industry' } }),
  verifiedUsers: await prisma.user.count({ where: { verified: true } }),
  totalProblems: await prisma.problem.count(),
  openProblems: await prisma.problem.count({ where: { status: 'open' } }),
  totalSubmissions: await prisma.submission.count(),
  shortlistedSubmissions: await prisma.submission.count({ where: { status: 'shortlisted' } }),
  activeEngagements: await prisma.engagement.count({ where: { status: 'active' } }),
  totalMessages: await prisma.message.count(),
  totalJobs: await prisma.job.count(),
  totalMilestones: await prisma.milestone.count(),
};

console.log('Platform Statistics:');
console.table(stats);
```

### Skill Tag Analysis
```typescript
const problems = await prisma.problem.findMany();
const skills = new Set();

problems.forEach(p => {
  const problemSkills = JSON.parse(p.skills);
  problemSkills.forEach(s => skills.add(s));
});

console.log(`Unique Skills in Problems: ${skills.size}`);
console.log('Skills:', Array.from(skills).sort());
```

---

## ✅ Audit Verification Checklist

Run these to verify everything is set up correctly:

```typescript
const checks = {
  adminExists: await prisma.user.findFirst({ where: { role: 'admin' } }),
  studentCount: await prisma.user.count({ where: { role: 'student' } }),
  companyCount: await prisma.user.count({ where: { role: 'industry' } }),
  problemCount: await prisma.problem.count(),
  submissionCount: await prisma.submission.count(),
  engagementCount: await prisma.engagement.count(),
  messageCount: await prisma.message.count(),
};

console.log('✅ Audit Checks:');
console.log(`  Admin Account: ${checks.adminExists ? '✅' : '❌'}`);
console.log(`  Students: ${checks.studentCount >= 5 ? '✅' : '❌'} (${checks.studentCount})`);
console.log(`  Companies: ${checks.companyCount >= 4 ? '✅' : '❌'} (${checks.companyCount})`);
console.log(`  Problems: ${checks.problemCount >= 8 ? '✅' : '❌'} (${checks.problemCount})`);
console.log(`  Submissions: ${checks.submissionCount >= 5 ? '✅' : '❌'} (${checks.submissionCount})`);
console.log(`  Engagements: ${checks.engagementCount >= 2 ? '✅' : '❌'} (${checks.engagementCount})`);
console.log(`  Messages: ${checks.messageCount >= 7 ? '✅' : '❌'} (${checks.messageCount})`);
```

---

## 🔐 Security Verification

### Check Password Hashing
```typescript
const user = await prisma.user.findFirst({
  where: { email: 'rahim@diu.edu.bd' },
});

console.log('Password Hash Length:', user?.password.length);
console.log('Is Bcrypt Hash:', user?.password.startsWith('$2a$') || user?.password.startsWith('$2b$'));
```

### Verify IP Clause Acceptance
```typescript
const submissions = await prisma.submission.findMany();
const allAccepted = submissions.every(s => s.ipAccepted === true);
console.log(`All Submissions Have IP Clause: ${allAccepted ? '✅' : '❌'}`);
```

---

## 📝 Sample Query Output

Expected output from key queries:

```
User Count: 12
├─ Students: 5
├─ Companies: 5
├─ Researchers: 1
└─ Admin: 1

Problem Count: 8
├─ Open: 8
├─ In Review: 0
└─ Closed: 0

Submission Count: 7
├─ Submitted: 4
├─ Shortlisted: 3
├─ Accepted: 0
└─ Rejected: 0

Engagement Count: 2
├─ Active: 1
├─ Negotiating: 1
└─ Other: 0

Message Count: 11+
Job Count: 6
Milestone Count: 5+
```

---

## 🚀 Running Verification

To run any query:

```bash
cd /vercel/share/v0-project
set -a && source /vercel/share/.env.project && set +a
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  // Paste your query here
  
  await prisma.\$disconnect();
})();
"
```

---

**Last Updated:** 2026-06-29  
**Database:** PostgreSQL via Neon  
**ORM:** Prisma
