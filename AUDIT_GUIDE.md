# ResearchBridge BD - Platform Audit Guide

## 🎯 Overview

ResearchBridge BD is a multi-stakeholder collaboration platform connecting industry, academia, and students in Bangladesh. This comprehensive guide will help you audit all platform features.

**Platform URL:** http://localhost:5000  
**All Test Passwords:** `password123`

---

## 👥 Test Accounts & User Roles

### Admin (1 account)
- **Email:** `admin@researchbridge.com.bd`
- **Access:** Full admin dashboard, verification queue, fraud reports, platform statistics

### Students (5 accounts)
| Email | University | Skills | Status |
|-------|-----------|--------|--------|
| `rahim@diu.edu.bd` | Daffodil (DIU) | JavaScript, React, Python, ML | Verified, GPA 3.72 |
| `fatima@bracu.edu.bd` | BRAC University | Data Science, NLP, Deep Learning | Verified, GPA 3.89 |
| `karim@nsu.edu.bd` | North South University | TypeScript, Next.js, Docker, AWS | Verified, GPA 3.55 |
| `aisha@aiub.edu.bd` | American Int'l University | Python, GIS, Climate Modeling | Verified, GPA 3.68 |
| `hassan@iu.edu.bd` | Islamic University | Solidity, Blockchain, Web3 | Verified, GPA 3.45 |

### Researchers (1 account)
- **Email:** `nasrin@diu.edu.bd`
- **University:** Daffodil International University
- **Expertise:** AI, NLP, Computer Vision
- **Availability:** Open for consulting

### Companies (5 accounts)
| Email | Company | Sector | Verification |
|-------|---------|--------|--------------|
| `hr@techsolve.com.bd` | TechSolve BD Ltd | Software & IT | ✅ Verified |
| `info@agridata.com.bd` | AgriData Solutions | Agriculture & Agritech | ✅ Verified |
| `contact@finedge.com.bd` | FinEdge Technologies | Fintech | ✅ Verified |
| `contact@greenenergy.com.bd` | GreenEnergy Bangladesh | Energy & Renewable | ✅ Verified |
| `hello@newstartup.com.bd` | NewStartup BD | E-commerce | ⏳ Pending |

---

## 📊 Database Contents (Ready for Audit)

### User Base
- **12 Total Users** across 4 roles
- **5 Students** with verified profiles and diverse skills
- **5 Companies** across different sectors (IT, Agritech, Fintech, Energy, E-commerce)
- **1 Researcher** with consulting availability
- **1 Admin** for platform management

### Industry Problems (8 Total)
1. **AI-Powered Resume Screening Tool** - TechSolve (₹15,000 bounty)
   - Status: Open
   - Submissions: 2 (1 shortlisted, 1 submitted)
   
2. **Crop Disease Detection System** - AgriData Solutions
   - Status: Open
   - Submissions: 1 (submitted)
   
3. **Fraud Detection Model** - FinEdge Technologies (₹25,000 bounty)
   - Status: Open
   - Submissions: 1 (submitted)
   
4. **E-commerce Inventory Dashboard** - TechSolve
   - Status: Open
   - Submissions: 1 (submitted)
   
5. **Market Price Prediction** - AgriData Solutions
   - Status: Open
   - Submissions: 1 (submitted)

6. **Solar Panel Efficiency Optimization** - GreenEnergy Bangladesh
   - Status: Open
   - Submissions: 1 (submitted)

7. **E-commerce Platform Localization** - TechSolve (₹30,000 bounty)
   - Status: Open
   - Submissions: 1 (shortlisted - Hassan)

8. **Drone-Based Crop Monitoring System** - AgriData Solutions (₹40,000 bounty)
   - Status: Open
   - Submissions: 1 (shortlisted - Dr. Nasrin)

### Student/Researcher Submissions (7 Total)
- Various stages: submitted, shortlisted
- Scores: 85-95 for shortlisted submissions
- Includes team collaboration proposals

### Active Engagements (2 Total)
1. **Resume Screening Problem** - Rahim (Status: Active)
   - 3 Milestones with status tracking
   - Messages between company and student
   
2. **Drone Monitoring Problem** - AgriData with Rahim (Status: Negotiating)
   - Under discussion phase
   - 2 Milestones pending

### Project Milestones (5 Total)
- Resume Parser Development (Status: In Progress)
- Job Matching Algorithm (Status: Pending)
- Dashboard & Testing (Status: Pending)
- Image Processing Pipeline (Status: Pending)
- ML Model Development (Status: Pending)

### Job Postings (6 Total)
| Title | Company | Type | Salary |
|-------|---------|------|--------|
| Junior Full-Stack Developer Intern | TechSolve | Internship | ₹10,000/month |
| Data Science Intern | AgriData | Internship | ₹8,000/month |
| Backend Developer | FinEdge | Full-time | ₹40,000-60,000/month |
| UI/UX Designer | TechSolve | Full-time | ₹35,000-50,000/month |
| Environmental Data Scientist | GreenEnergy | Full-time | ₹50,000-70,000/month |
| Full-Stack Developer (Localization) | TechSolve | Full-time | ₹60,000-80,000/month |

### Messaging System (11 Messages)
- **Active conversations** between:
  - TechSolve HR ↔ Rahim (Resume screening)
  - Dr. Nasrin ↔ AgriData Solutions (Crop monitoring)
  - Hassan ↔ TechSolve (Localization interest)
  - Aisha ↔ GreenEnergy (Solar project)
  - And more...

---

## 🔍 Feature Audit Checklist

### 1. User Registration & Authentication
- [ ] Register new student with .edu.bd email
- [ ] Register new company with trade license
- [ ] Login/Logout functionality
- [ ] Profile verification workflow
- [ ] Trust score calculation

### 2. Problem Marketplace
- [ ] Browse all problems with filters
- [ ] View problem details (full description, requirements, bounty)
- [ ] Filter by sector, visibility (public/private/NDA)
- [ ] Search by keywords and skills
- [ ] Problem status tracking (open/in_review/closed)

### 3. Solution Submissions
- [ ] Submit solution to a problem (as student/researcher)
- [ ] Upload supporting files
- [ ] Accept IP clause
- [ ] View submission status
- [ ] Company shortlisting/acceptance flow

### 4. Talent Discovery
- [ ] Browse verified students by skill, university, GPA
- [ ] Filter by availability for internship
- [ ] View student profiles with project history
- [ ] Search by sector/skill combination
- [ ] Direct messaging from talent view

### 5. Job & Internship Postings
- [ ] Browse active job listings
- [ ] Filter by type (internship/full-time/part-time)
- [ ] View company details
- [ ] Contact company via messaging
- [ ] Job status (active/closed)

### 6. Engagement & Contracts
- [ ] **Active Engagement with Rahim** (Resume Project)
  - View 3 milestones with different statuses
  - See project value and fees
  - Track milestone submissions
  - View status progression
  
- [ ] **Negotiating Engagement** (Drone Monitoring)
  - Follow negotiation workflow
  - See pending milestones
  - Track communication history

### 7. Messaging System
- [ ] Send message between accounts
- [ ] View conversation threads
- [ ] Check message read status
- [ ] Deep-link to profile/problem/job

### 8. Admin Panel
- [ ] Admin dashboard with statistics
- [ ] View verification queue (NewStartup BD pending)
- [ ] Access fraud reports section
- [ ] Platform overview metrics

### 9. Profile System
- [ ] Student profile with skills, education, GPA
- [ ] Company profile with sector, size, trade license
- [ ] Researcher profile with consulting availability
- [ ] Skill badges and verification status
- [ ] Trust score display

### 10. Security & Permissions
- [ ] Student can only see shortlisted submissions
- [ ] Company owns their problems
- [ ] Only engaged parties see engagement details
- [ ] Admin-only access to verification queue
- [ ] Email verification for registration

---

## 🚀 Testing Scenarios

### Scenario 1: Student Discovers & Submits to Problem
1. Login as `rahim@diu.edu.bd`
2. Navigate to Problems marketplace
3. Filter by "Software & IT" sector
4. Click on "AI-Powered Resume Screening Tool"
5. Review problem details and requirements
6. Click "Submit Solution"
7. Fill form and submit
8. Verify submission appears in company's shortlist

### Scenario 2: Company Reviews Submissions
1. Login as `hr@techsolve.com.bd`
2. Go to Problems → Resume Screening Problem
3. View all submissions (should see 2)
4. Shortlist Rahim's submission (already shortlisted - score 85)
5. View submission details and approach
6. Send message to shortlisted student

### Scenario 3: Engage with Researcher
1. Login as `info@agridata.com.bd`
2. Go to Problems → Crop Disease Detection
3. View Dr. Nasrin's shortlisted submission
4. Navigate to engagement (already created)
5. View 3 milestones: Resume Parser (In Progress), Algorithm (Pending), Dashboard (Pending)
6. Check milestone descriptions and due dates

### Scenario 4: Student Searches for Talent
1. Login as `hr@techsolve.com.bd`
2. Go to Talent Discovery
3. Filter by "Machine Learning", "Python", "Data Science"
4. View Fatima's profile (GPA 3.89, published research)
5. Send direct message
6. View her submission history

### Scenario 5: Browse Job Opportunities
1. Login as `rahim@diu.edu.bd`
2. Go to Jobs & Internships
3. Filter by "Internship" type
4. Browse available positions
5. Click on "Junior Full-Stack Developer Intern" at TechSolve
6. Contact TechSolve HR via messaging

### Scenario 6: Admin Verification Queue
1. Login as `admin@researchbridge.com.bd`
2. Go to Admin Panel → Verification Queue
3. See "NewStartup BD" company pending verification
4. Review trade license number
5. Option to approve/reject with notes

### Scenario 7: Cross-Sector Collaboration
1. Login as `contact@greenenergy.com.bd`
2. Go to Problems → Solar Panel Efficiency
3. View Aisha's (AIUB) submission
4. See her skills match perfectly
5. Shortlist and engage for project

---

## 📈 Key Metrics to Verify

When auditing, check these metrics in the database or admin panel:

| Metric | Expected | Status |
|--------|----------|--------|
| Total Users | 12 | ✅ |
| Active Problems | 8 | ✅ |
| Total Submissions | 7 | ✅ |
| Shortlisted Submissions | 3 | ✅ |
| Active Engagements | 2 | ✅ |
| Job Postings | 6 | ✅ |
| Verified Companies | 4 | ✅ |
| Pending Verification | 1 | ✅ |
| Messages in System | 11+ | ✅ |

---

## 🎯 Critical User Journeys to Audit

### Journey 1: Student → Problem → Submission → Engagement
- Rahim's complete journey from resume problem to active engagement
- Track 3 milestones and communication

### Journey 2: Researcher → Application → Engagement
- Dr. Nasrin's application to drone monitoring project
- Engagement with agricultural company

### Journey 3: Company → Problem Posting → Submissions Review
- TechSolve's problem management
- Submission review and shortlisting process

### Journey 4: Cross-functional Messaging
- Multiple conversation threads active
- Real-time updates

---

## 🔐 Security & Trust Features to Verify

- [ ] Verified badges on profiles
- [ ] Trade license verification for companies
- [ ] University email requirement for students (.edu.bd)
- [ ] Trust score visible on profiles
- [ ] IP clause acceptance on submissions
- [ ] Fraud report capability

---

## 📱 Responsive Design Check

- [ ] Mobile view of problems list
- [ ] Mobile submission form
- [ ] Mobile messaging interface
- [ ] Mobile job listings
- [ ] Touch-friendly buttons and forms

---

## ⚡ Performance Notes

The platform handles:
- **12 Users** across multiple roles
- **8 Problems** with descriptions and images
- **7+ Submissions** with file uploads
- **Real-time Messaging** with 11+ messages
- **Multi-milestone Projects** with status tracking

---

## 💡 Next Steps After Audit

1. **Test High-Traffic Scenarios:** Multiple companies posting problems simultaneously
2. **Test Mobile Performance:** Load testing on slower networks
3. **Verify Notifications:** Check if updates trigger properly
4. **Backup & Recovery:** Test database backup procedures
5. **User Role Transitions:** Students becoming researchers, etc.

---

## 📞 Support & Questions

For issues or questions during the audit:
1. Check database consistency using provided queries
2. Verify user roles and permissions
3. Test account permissions and data visibility
4. Confirm messaging functionality
5. Validate engagement workflow

---

## ✅ Audit Sign-Off

**Date Tested:** [Date]  
**Tester:** [Name]  
**Issues Found:** [Number]  
**Overall Status:** [Status]  

**Signature:** _________________

---

**Last Updated:** 2026-06-29  
**Platform Version:** 0.1.0  
**Database State:** Production Demo Data
