import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding demo data for platform audit...");

  const password = await bcrypt.hash("password123", 12);

  // Additional Students
  const student4 = await prisma.user.create({
    data: {
      name: "Aisha Begum",
      email: "aisha@aiub.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 82,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Environmental Science student interested in sustainable tech solutions.",
          university: "American International University",
          department: "Environmental Science",
          gpa: 3.68,
          graduationYear: 2025,
          availableForInternship: true,
          skills: JSON.stringify(["Python", "Environmental Data Analysis", "GIS", "Climate Modeling"]),
          location: "Dhaka",
        },
      },
    },
  });

  const student5 = await prisma.user.create({
    data: {
      name: "Hassan Khan",
      email: "hassan@iu.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 79,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "CSE student with interest in blockchain and Web3 technologies.",
          university: "Islamic University",
          department: "CSE",
          gpa: 3.45,
          graduationYear: 2026,
          availableForInternship: true,
          skills: JSON.stringify(["Solidity", "Blockchain", "Web3.js", "Smart Contracts", "React"]),
          location: "Dhaka",
        },
      },
    },
  });

  // Additional company with different sector
  const company5 = await prisma.user.create({
    data: {
      name: "GreenEnergy Bangladesh",
      email: "contact@greenenergy.com.bd",
      password,
      role: "industry",
      verified: true,
      trustScore: 85,
      profile: {
        create: {
          verificationStatus: "verified",
          companyName: "GreenEnergy Bangladesh",
          companySector: "Energy & Renewable",
          companySize: "51-200",
          tradeLicenseNumber: "TRAD-2024-05432",
          bio: "Leading renewable energy solutions in Bangladesh.",
          location: "Gulshan, Dhaka",
          skills: JSON.stringify(["Energy & Renewable"]),
        },
      },
    },
  });

  // Get existing companies for creating problems
  const companies = await prisma.user.findMany({ where: { role: "industry" } });
  const company1 = companies[0];
  const company2 = companies[1];

  // Additional problems with variety
  const problem6 = await prisma.problem.create({
    data: {
      companyId: company5.id,
      title: "Solar Panel Efficiency Optimization Research",
      abstract: "Improve solar panel efficiency by analyzing performance data and weather patterns.",
      fullDescription: `We need research into optimizing our solar panel farm performance.

Focus Areas:
- Analyze 2 years of performance data
- Correlate with weather patterns
- Identify efficiency loss factors
- Recommend optimization strategies

Deliverables:
- Data analysis report
- Visualization dashboard
- Recommendations document`,
      visibility: "public",
      bountyType: "none",
      skills: JSON.stringify(["Data Analysis", "Python", "Climate Data", "Research"]),
      sector: "Energy & Renewable",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem7 = await prisma.problem.create({
    data: {
      companyId: company1.id,
      title: "E-commerce Platform Localization",
      abstract: "Localize an e-commerce platform for Bangladeshi market with Bangla support.",
      fullDescription: `Need localization of e-commerce platform for Bangladesh market.

Requirements:
- Full Bangla language support
- Bangladeshi payment methods integration
- Local currency handling (BDT)
- RTL text rendering optimization
- Cultural adaptation of UI/UX

Technical Stack:
- Currently Next.js based
- PostgreSQL database
- Looking for full-stack expertise`,
      visibility: "public",
      bountyType: "cash",
      bountyValue: "30000",
      skills: JSON.stringify(["Next.js", "i18n", "PostgreSQL", "Payment Integration"]),
      sector: "Software & IT",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem8 = await prisma.problem.create({
    data: {
      companyId: company2.id,
      title: "Drone-Based Crop Monitoring System",
      abstract: "Build a drone data processing system to monitor crop health using aerial imagery.",
      fullDescription: `Create a comprehensive system for processing drone imagery data.

Features:
- Ingest drone footage from specific areas
- Detect crop health issues using computer vision
- Generate health maps for farmers
- Provide actionable recommendations

Technology Stack:
- OpenCV for image processing
- Deep learning for plant disease detection
- Mobile app for farmer access
- Web dashboard for data visualization`,
      visibility: "public",
      bountyType: "cash",
      bountyValue: "40000",
      skills: JSON.stringify(["Computer Vision", "Deep Learning", "Python", "GIS"]),
      sector: "Agriculture & Agritech",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  // More submissions from different students
  const students = await prisma.user.findMany({ where: { role: "student" } });
  const researcher = await prisma.user.findFirst({ where: { role: "researcher" } });

  await prisma.submission.create({
    data: {
      problemId: problem6.id,
      userId: student4.id,
      description: `Interested in solar efficiency analysis using environmental and ML techniques.

My approach:
- Time series analysis with ARIMA and Prophet
- Feature engineering from weather data
- Deep learning models for prediction
- Interactive visualization dashboard

Experience:
- Published research on renewable energy
- Strong Python and data science skills`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  await prisma.submission.create({
    data: {
      problemId: problem7.id,
      userId: student5.id,
      description: `I can handle the full localization pipeline for your e-commerce platform.

Experience:
- Built i18n systems with next-intl
- Integrated multiple payment gateways
- Strong TypeScript and Next.js expertise
- Familiar with RTL implementations

Timeline: 6-8 weeks for production-ready solution`,
      ipAccepted: true,
      status: "shortlisted",
      score: 90,
    },
  });

  await prisma.submission.create({
    data: {
      problemId: problem8.id,
      userId: researcher.id,
      description: `Our research group has experience with drone-based agricultural monitoring.

Expertise:
- Computer vision and deep learning models
- Published papers on crop disease detection
- Access to field datasets for training
- Can supervise students for implementation`,
      ipAccepted: true,
      status: "shortlisted",
      score: 95,
    },
  });

  // Create some engagements to show different statuses
  const problems = await prisma.problem.findMany();
  const allStudents = await prisma.user.findMany({ where: { role: "student" } });

  const engagement3 = await prisma.engagement.create({
    data: {
      problemId: problem8.id,
      companyId: company2.id,
      studentId: allStudents[0].id,
      status: "negotiating",
      projectValueBdt: 75000,
      platformFeeRate: 0.30,
    },
  });

  // Create milestones for engagement
  await prisma.milestone.create({
    data: {
      engagementId: engagement3.id,
      title: "Image Processing Pipeline",
      description: "Build data ingestion and preprocessing system",
      dueDate: new Date("2026-09-15"),
      order: 1,
      status: "pending",
    },
  });

  await prisma.milestone.create({
    data: {
      engagementId: engagement3.id,
      title: "ML Model Development",
      description: "Train and validate disease detection models",
      dueDate: new Date("2026-10-15"),
      order: 2,
      status: "pending",
    },
  });

  // Add more messages for conversation threads
  const company2User = companies[1];

  await prisma.message.create({
    data: {
      senderId: student4.id,
      receiverId: company5.id,
      body: "Hi, I'm very interested in the solar efficiency project. Can we discuss the data format and expected outcomes?",
    },
  });

  await prisma.message.create({
    data: {
      senderId: company5.id,
      receiverId: student4.id,
      body: "Absolutely! We have 2 years of hourly performance data. Let's schedule a call to discuss the project scope.",
    },
  });

  await prisma.message.create({
    data: {
      senderId: student5.id,
      receiverId: company1.id,
      body: "I noticed your e-commerce localization need. I've done similar projects before with next-intl.",
    },
  });

  await prisma.message.create({
    data: {
      senderId: company1.id,
      receiverId: student5.id,
      body: "Perfect! That's exactly what we're looking for. Can you share your portfolio with recent localization work?",
    },
  });

  // Create jobs to show opportunities
  await prisma.job.create({
    data: {
      companyId: company5.id,
      title: "Environmental Data Scientist",
      type: "fulltime",
      description: `Join our team as an Environmental Data Scientist.

Responsibilities:
- Analyze environmental and performance data
- Build predictive models
- Create data visualizations
- Report to management

Requirements:
- Strong Python and data analysis skills
- Background in environmental science or related field
- Experience with renewable energy data

Salary: BDT 50,000-70,000/month`,
      skills: JSON.stringify(["Python", "Data Science", "Environmental Science", "Statistics"]),
      location: "Gulshan, Dhaka",
      salary: "50000-70000",
      status: "active",
    },
  });

  await prisma.job.create({
    data: {
      companyId: company1.id,
      title: "Full-Stack Developer (Localization Focus)",
      type: "fulltime",
      description: `Help us expand our e-commerce platform to Bangladesh.

You'll work on:
- Bangla language integration
- Payment system localization
- Regional feature customization
- Performance optimization

Requirements:
- 2+ years full-stack experience
- Next.js/React expertise
- International project experience
- Attention to detail`,
      skills: JSON.stringify(["Next.js", "PostgreSQL", "TypeScript", "i18n"]),
      location: "Gulshan, Dhaka",
      salary: "60000-80000",
      status: "active",
    },
  });

  console.log("\n✅ Demo data added successfully!");
  console.log("\n📊 NEW DATA ADDED:");
  console.log("  ✓ 2 Additional Students (Aisha, Hassan)");
  console.log("  ✓ 1 New Company (GreenEnergy Bangladesh)");
  console.log("  ✓ 3 New Problems (solar, localization, drone monitoring)");
  console.log("  ✓ 3 New Submissions from students");
  console.log("  ✓ 1 New Engagement with milestones");
  console.log("  ✓ 4 New Messages in conversation threads");
  console.log("  ✓ 2 New Job Postings");
  console.log("\n📈 UPDATED DATABASE STATE:");
  console.log("  • Total Users: 11");
  console.log("  • Total Problems: 8");
  console.log("  • Total Submissions: 7");
  console.log("  • Total Jobs: 6");
  console.log("  • Total Engagements: 3");
  console.log("\n🎯 Perfect for platform audit with diverse data!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
