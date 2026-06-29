import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 12);

  // Admin user
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@researchbridge.com.bd",
      password,
      role: "admin",
      verified: true,
      trustScore: 100,
      profile: { create: { verificationStatus: "verified", bio: "Platform administrator", location: "Dhaka" } },
    },
  });

  // Student users
  const student1 = await prisma.user.create({
    data: {
      name: "Rahim Ahmed",
      email: "rahim@diu.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 85,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "CSE student passionate about web development and machine learning. Looking for internship opportunities.",
          university: "Daffodil International University",
          department: "CSE",
          studentId: "211-15-4001",
          gpa: 3.72,
          graduationYear: 2025,
          availableForInternship: true,
          skills: JSON.stringify(["JavaScript", "React", "Python", "Machine Learning", "Node.js"]),
          location: "Dhaka",
          phone: "+880171XXXXXXX",
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Fatima Khan",
      email: "fatima@bracu.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 90,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Data Science enthusiast with strong analytical skills. Published research on NLP for Bangla language.",
          university: "BRAC University",
          department: "CSE",
          studentId: "20101042",
          gpa: 3.89,
          graduationYear: 2025,
          availableForInternship: true,
          skills: JSON.stringify(["Python", "Data Science", "NLP", "Deep Learning", "SQL", "R Programming"]),
          location: "Dhaka",
        },
      },
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Karim Hossain",
      email: "karim@nsu.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 75,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Full-stack developer and competitive programmer. Built multiple web applications for local businesses.",
          university: "North South University",
          department: "CSE",
          gpa: 3.55,
          graduationYear: 2026,
          availableForInternship: true,
          skills: JSON.stringify(["TypeScript", "Next.js", "PostgreSQL", "Docker", "AWS", "React"]),
          location: "Dhaka",
        },
      },
    },
  });

  // Researcher
  const researcher1 = await prisma.user.create({
    data: {
      name: "Dr. Nasrin Akter",
      email: "nasrin@diu.edu.bd",
      password,
      role: "researcher",
      verified: true,
      trustScore: 95,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Associate Professor, CSE Department. Research interests: AI, NLP, and Computer Vision. Published 25+ papers.",
          university: "Daffodil International University",
          department: "CSE",
          availableForConsulting: true,
          skills: JSON.stringify(["Machine Learning", "NLP", "Computer Vision", "Deep Learning", "Python"]),
          orcidId: "0000-0001-2345-6789",
          location: "Dhaka",
        },
      },
    },
  });

  // Industry users
  const company1 = await prisma.user.create({
    data: {
      name: "TechSolve BD",
      email: "hr@techsolve.com.bd",
      password,
      role: "industry",
      verified: true,
      trustScore: 88,
      profile: {
        create: {
          verificationStatus: "verified",
          companyName: "TechSolve BD Ltd.",
          companySector: "Software & IT",
          companySize: "51-200",
          tradeLicenseNumber: "TRAD-2024-00451",
          website: "https://techsolve.com.bd",
          bio: "Leading software development company in Bangladesh, building enterprise solutions.",
          location: "Gulshan, Dhaka",
          skills: JSON.stringify(["Software & IT"]),
        },
      },
    },
  });

  const company2 = await prisma.user.create({
    data: {
      name: "AgriData Solutions",
      email: "info@agridata.com.bd",
      password,
      role: "industry",
      verified: true,
      trustScore: 80,
      profile: {
        create: {
          verificationStatus: "verified",
          companyName: "AgriData Solutions",
          companySector: "Agriculture & Agritech",
          companySize: "11-50",
          tradeLicenseNumber: "TRAD-2024-00892",
          bio: "Using technology to transform agriculture in Bangladesh. We help farmers with data-driven decisions.",
          location: "Banani, Dhaka",
          skills: JSON.stringify(["Agriculture & Agritech"]),
        },
      },
    },
  });

  const company3 = await prisma.user.create({
    data: {
      name: "FinEdge Technologies",
      email: "contact@finedge.com.bd",
      password,
      role: "industry",
      verified: true,
      trustScore: 82,
      profile: {
        create: {
          verificationStatus: "verified",
          companyName: "FinEdge Technologies",
          companySector: "Fintech",
          companySize: "11-50",
          tradeLicenseNumber: "TRAD-2024-01234",
          bio: "Building the future of digital finance in Bangladesh. Mobile banking and payment solutions.",
          location: "Dhanmondi, Dhaka",
          skills: JSON.stringify(["Fintech"]),
        },
      },
    },
  });

  // Unverified company (for admin verification queue)
  const company4 = await prisma.user.create({
    data: {
      name: "NewStartup BD",
      email: "hello@newstartup.com.bd",
      password,
      role: "industry",
      verified: false,
      profile: {
        create: {
          verificationStatus: "pending",
          companyName: "NewStartup BD",
          companySector: "E-commerce",
          companySize: "1-10",
          tradeLicenseNumber: "TRAD-2025-00001",
          bio: "New e-commerce platform for local artisans.",
          location: "Uttara, Dhaka",
        },
      },
    },
  });

  await prisma.verification.create({
    data: {
      userId: company4.id,
      type: "trade_license",
      status: "pending",
    },
  });

  // Problems
  const problem1 = await prisma.problem.create({
    data: {
      companyId: company1.id,
      title: "Build an AI-Powered Resume Screening Tool",
      abstract: "We receive 500+ applications per job posting. We need a tool that can automatically screen resumes, rank candidates based on job requirements, and shortlist the top 20%.",
      fullDescription: `We are looking for a solution to automate our hiring pipeline.

Requirements:
- Accept resume uploads in PDF/DOCX format
- Extract key information: education, skills, experience, certifications
- Match candidates against job description requirements using NLP
- Provide a ranked list with match scores and reasoning
- Simple web dashboard for HR team to review results

Technical Constraints:
- Must handle Bangla and English resumes
- Processing time under 30 seconds per resume
- Accuracy should be comparable to manual screening (>85%)

Deliverables:
- Working prototype with sample data
- Technical documentation
- Brief presentation of approach`,
      visibility: "public",
      bountyType: "cash",
      bountyValue: "15000",
      skills: JSON.stringify(["Python", "NLP", "Machine Learning", "React"]),
      sector: "Software & IT",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem2 = await prisma.problem.create({
    data: {
      companyId: company2.id,
      title: "Crop Disease Detection System Using Smartphone Images",
      abstract: "Farmers in rural Bangladesh need a simple way to diagnose crop diseases using their smartphones. We need a mobile-friendly system that can identify common rice and vegetable diseases from photos.",
      fullDescription: `Bangladesh's agriculture sector needs accessible technology for disease detection.

Problem Statement:
Rice, potato, and tomato crops in Bangladesh suffer from multiple diseases each season. Farmers lack access to agricultural experts for timely diagnosis. A smartphone-based solution could save millions in crop losses.

Requirements:
- Accept images from smartphone cameras
- Identify at least 10 common diseases for rice, potato, and tomato
- Provide treatment recommendations in Bangla
- Work on low-bandwidth connections
- Offline capability preferred

Dataset:
- We can provide 5,000+ labeled images of crop diseases from our field teams
- Standard PlantVillage dataset can supplement training

Evaluation Criteria:
- Detection accuracy (top priority)
- Bangla language support
- Mobile-friendliness
- Practical usability for farmers`,
      visibility: "public",
      bountyType: "certificate",
      skills: JSON.stringify(["Computer Vision", "Deep Learning", "Python", "Flutter"]),
      sector: "Agriculture & Agritech",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem3 = await prisma.problem.create({
    data: {
      companyId: company3.id,
      title: "Fraud Detection Model for Mobile Banking Transactions",
      abstract: "Our mobile banking platform processes 100K+ transactions daily. We need a real-time fraud detection model that can flag suspicious transactions while minimizing false positives.",
      fullDescription: `We need an ML-based fraud detection system for our mobile banking platform.

Context:
FinEdge processes over 100,000 mobile banking transactions daily. Current rule-based system catches only 60% of fraudulent transactions and generates too many false positives.

Requirements:
- Real-time scoring (under 100ms per transaction)
- Handle transaction features: amount, time, location, device, history
- Reduce false positive rate below 2%
- Improve fraud catch rate to 90%+
- Explainable predictions (why flagged)

Data Provided:
- 12 months of anonymized transaction data (500K+ records)
- Labeled fraud cases
- Feature descriptions and data dictionary

Evaluation:
- AUC-ROC score
- Precision at 90% recall
- Inference time
- Model interpretability`,
      visibility: "public",
      bountyType: "cash",
      bountyValue: "25000",
      skills: JSON.stringify(["Machine Learning", "Python", "Data Science", "SQL"]),
      sector: "Fintech",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem4 = await prisma.problem.create({
    data: {
      companyId: company1.id,
      title: "E-commerce Inventory Management Dashboard",
      abstract: "We need a web dashboard to track inventory across multiple warehouses, handle stock alerts, and generate reports for our garment export clients.",
      fullDescription: `Design and develop a full-stack inventory management system.

Features Required:
- Multi-warehouse inventory tracking
- Real-time stock level monitoring
- Low-stock alerts via email/SMS
- Barcode/QR code scanning support
- Monthly/weekly inventory reports
- Role-based access (admin, warehouse manager, viewer)

Technical Requirements:
- Responsive web application
- RESTful API backend
- Database design for scalability
- Charts and visualizations for reports

Bonus:
- Integration with popular courier APIs (Pathao, Steadfast)
- Export to Excel functionality`,
      visibility: "public",
      bountyType: "certificate",
      skills: JSON.stringify(["React", "Node.js", "PostgreSQL", "TypeScript"]),
      sector: "Software & IT",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem5 = await prisma.problem.create({
    data: {
      companyId: company2.id,
      title: "Market Price Prediction for Agricultural Commodities",
      abstract: "Predict weekly market prices for rice, potato, onion, and tomato across major Bangladesh markets to help farmers decide optimal selling times.",
      fullDescription: `Build a price prediction model for key agricultural commodities in Bangladesh.

Background:
Farmers often sell at the wrong time due to lack of market information. Price prediction could help them make better selling decisions and increase income.

Requirements:
- Predict prices 1-4 weeks ahead
- Cover at least 4 commodities: rice, potato, onion, tomato
- Cover major markets: Dhaka, Chittagong, Rajshahi, Khulna
- Incorporate weather data, historical prices, and seasonal patterns
- Simple API for integration

Data Available:
- 5 years of daily market price data from DAM
- Weather data from BMD
- Production statistics from BBS`,
      visibility: "public",
      bountyType: "none",
      skills: JSON.stringify(["Data Science", "Python", "Machine Learning", "Statistics"]),
      sector: "Agriculture & Agritech",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  // Submissions
  await prisma.submission.create({
    data: {
      problemId: problem1.id,
      userId: student1.id,
      description: `I propose a solution using a fine-tuned BERT model for resume parsing and matching.

Approach:
1. PDF/DOCX parsing using Python (PyMuPDF + python-docx)
2. Named Entity Recognition for extracting skills, education, experience
3. Sentence-BERT for semantic matching between resume and job description
4. Weighted scoring algorithm combining keyword match + semantic similarity
5. React dashboard with drag-and-drop upload

I have experience building similar NLP tools for my university project. Can deliver a working prototype within 3 weeks.`,
      ipAccepted: true,
      status: "shortlisted",
      score: 85,
    },
  });

  await prisma.submission.create({
    data: {
      problemId: problem1.id,
      userId: student2.id,
      description: `My approach uses a combination of traditional NLP and LLM-based analysis.

Architecture:
1. Resume parser supporting both Bangla and English (custom tokenizer)
2. Feature extraction pipeline: skills, education quality, experience years, certifications
3. Fine-tuned GPT-based matching for nuanced requirement understanding
4. Configurable scoring weights for different job types
5. Streamlit dashboard for quick deployment

I have published research on Bangla NLP and have the linguistic expertise to handle bilingual resumes effectively.`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  await prisma.submission.create({
    data: {
      problemId: problem2.id,
      userId: student2.id,
      description: `Proposed solution: Transfer learning with MobileNetV3 for lightweight crop disease detection.

Key aspects:
- MobileNetV3 backbone for smartphone-friendly inference
- Data augmentation to handle limited Bangladesh-specific training data
- TensorFlow Lite model for offline Android deployment
- Bangla UI using Flutter
- Treatment database linked to identified diseases

Expected accuracy: 92%+ based on similar work on PlantVillage dataset.`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  await prisma.submission.create({
    data: {
      problemId: problem4.id,
      userId: student3.id,
      description: `Full-stack solution proposal using Next.js + PostgreSQL.

Tech Stack:
- Next.js 14 with App Router
- PostgreSQL with Prisma ORM
- TailwindCSS for responsive UI
- Chart.js for visualizations
- NextAuth for role-based access

Features I will implement:
- Real-time inventory dashboard with warehouse views
- Barcode scanning using browser camera API
- Automated low-stock email alerts
- Excel export with formatted reports
- RESTful API documented with Swagger

Timeline: 4 weeks for MVP.`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  // Jobs
  await prisma.job.create({
    data: {
      companyId: company1.id,
      title: "Junior Full-Stack Developer Intern",
      type: "internship",
      description: `TechSolve BD is looking for a motivated intern to join our development team.

Responsibilities:
- Develop features for our SaaS products using React and Node.js
- Write clean, testable code
- Participate in code reviews
- Collaborate with design and product teams

Requirements:
- Studying CSE, SWE, or related field at a recognized university
- Familiarity with JavaScript, React, and Node.js
- Understanding of REST APIs and databases
- Good problem-solving skills

Duration: 3 months (extendable)
Stipend: BDT 10,000/month
Location: Gulshan, Dhaka (hybrid)`,
      skills: JSON.stringify(["JavaScript", "React", "Node.js", "SQL"]),
      location: "Gulshan, Dhaka",
      salary: "10000",
      status: "active",
    },
  });

  await prisma.job.create({
    data: {
      companyId: company2.id,
      title: "Data Science Intern",
      type: "internship",
      description: `AgriData Solutions is looking for a data science intern to work on agricultural data analysis.

Responsibilities:
- Clean and preprocess agricultural datasets
- Build predictive models for crop yield and pricing
- Create data visualizations and reports
- Support senior data scientists on research projects

Requirements:
- Background in CSE, Statistics, or related field
- Proficiency in Python (pandas, scikit-learn, matplotlib)
- Basic understanding of machine learning
- Interest in agriculture and development

Duration: 6 months
Stipend: BDT 8,000/month
Location: Banani, Dhaka`,
      skills: JSON.stringify(["Python", "Data Science", "Machine Learning", "Statistics"]),
      location: "Banani, Dhaka",
      salary: "8000",
      status: "active",
    },
  });

  await prisma.job.create({
    data: {
      companyId: company3.id,
      title: "Backend Developer",
      type: "fulltime",
      description: `FinEdge is hiring a backend developer to build scalable fintech solutions.

Responsibilities:
- Design and implement RESTful APIs
- Build microservices for payment processing
- Ensure security best practices for financial data
- Optimize database queries and system performance
- Write comprehensive tests

Requirements:
- 1-2 years experience in backend development
- Proficiency in Node.js/Python
- Experience with PostgreSQL and Redis
- Understanding of payment systems and security
- Familiarity with Docker and CI/CD

Salary: BDT 40,000-60,000/month
Location: Dhanmondi, Dhaka`,
      skills: JSON.stringify(["Node.js", "PostgreSQL", "Docker", "Python"]),
      location: "Dhanmondi, Dhaka",
      salary: "40000-60000",
      status: "active",
    },
  });

  await prisma.job.create({
    data: {
      companyId: company1.id,
      title: "UI/UX Designer",
      type: "fulltime",
      description: `Join our design team to create intuitive user experiences.

Responsibilities:
- Design user interfaces for web and mobile applications
- Conduct user research and usability testing
- Create wireframes, prototypes, and high-fidelity mockups
- Collaborate with developers for design implementation

Requirements:
- Portfolio showcasing UI/UX projects
- Proficiency in Figma
- Understanding of design systems
- Experience with user research methodologies

Salary: BDT 35,000-50,000/month`,
      skills: JSON.stringify(["UI/UX Design", "Figma"]),
      location: "Gulshan, Dhaka",
      salary: "35000-50000",
      status: "active",
    },
  });

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

  // Additional companies with different sectors
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
      companyId: company4.id,
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
      sector: "E-commerce",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  // More submissions from different students
  await prisma.submission.create({
    data: {
      problemId: problem5.id,
      userId: student4.id,
      description: `Interested in price prediction using environmental and market data.

Proposed Approach:
- ARIMA models for time series analysis
- Include weather and seasonal factors
- API development for real-time predictions
- Mobile-friendly dashboard for farmers`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  await prisma.submission.create({
    data: {
      problemId: problem6.id,
      userId: student2.id,
      description: `Can conduct comprehensive solar efficiency analysis using ML.

My background:
- Strong data science skills
- Published research on energy systems
- Can deliver complete analysis and visualization`,
      ipAccepted: true,
      status: "shortlisted",
      score: 88,
    },
  });

  // Engagements showing different statuses
  const engagement1 = await prisma.engagement.create({
    data: {
      problemId: problem1.id,
      companyId: company1.id,
      studentId: student1.id,
      status: "active",
      projectValueBdt: 50000,
      platformFeeRate: 0.30,
      depositAmountBdt: 15000,
    },
  });

  const engagement2 = await prisma.engagement.create({
    data: {
      problemId: problem3.id,
      companyId: company3.id,
      studentId: student3.id,
      status: "negotiating",
    },
  });

  // Milestones for active engagement
  await prisma.milestone.create({
    data: {
      engagementId: engagement1.id,
      title: "Resume Parser Development",
      description: "Build core PDF/DOCX parsing with NLP extraction",
      dueDate: new Date("2026-08-15"),
      order: 1,
      status: "in_progress",
    },
  });

  await prisma.milestone.create({
    data: {
      engagementId: engagement1.id,
      title: "Job Matching Algorithm",
      description: "Implement matching algorithm and scoring",
      dueDate: new Date("2026-08-29"),
      order: 2,
      status: "pending",
    },
  });

  await prisma.milestone.create({
    data: {
      engagementId: engagement1.id,
      title: "Dashboard & Testing",
      description: "Dashboard development and comprehensive testing",
      dueDate: new Date("2026-09-15"),
      order: 3,
      status: "pending",
    },
  });

  // Messages for conversations
  await prisma.message.create({
    data: {
      senderId: company1.id,
      receiverId: student1.id,
      body: "Hi Rahim! We were impressed with your resume screening proposal. Would you be available for a quick call to discuss the implementation details?",
    },
  });

  await prisma.message.create({
    data: {
      senderId: student1.id,
      receiverId: company1.id,
      body: "Thank you! I'd be happy to discuss. I'm available any weekday after 4 PM. Would that work for you?",
    },
  });

  await prisma.message.create({
    data: {
      senderId: company1.id,
      receiverId: student1.id,
      body: "Perfect. Let's schedule a call for tomorrow at 5 PM. I'll send you a Google Meet link.",
    },
  });

  // Messages between researcher and company
  await prisma.message.create({
    data: {
      senderId: researcher1.id,
      receiverId: company2.id,
      body: "I'm interested in the crop disease detection project. I have relevant computer vision experience and access to image datasets from university.",
    },
  });

  await prisma.message.create({
    data: {
      senderId: company2.id,
      receiverId: researcher1.id,
      body: "Excellent! Your background sounds perfect for this project. Let's discuss collaboration terms and data sharing agreements.",
    },
  });

  // Additional messages between industry and student
  await prisma.message.create({
    data: {
      senderId: student3.id,
      receiverId: company3.id,
      body: "I saw your fraud detection problem and I'm very interested. I've built similar systems before.",
    },
  });

  await prisma.message.create({
    data: {
      senderId: company3.id,
      receiverId: student3.id,
      body: "Great! Would love to hear your approach. Can you share some details about your previous work?",
    },
  });

  console.log("\n✅ Database seeded successfully with comprehensive demo data!");
  console.log("\n📊 PLATFORM OVERVIEW:");
  console.log("  ✓ 5 Students seeded (various universities & skills)");
  console.log("  ✓ 1 Researcher with consulting availability");
  console.log("  ✓ 5 Companies (IT, Agritech, Fintech, E-commerce, Energy)");
  console.log("  ✓ 7 Industry problems with detailed descriptions");
  console.log("  ✓ 6 Submissions from students/researchers");
  console.log("  ✓ 2 Active engagements with milestones");
  console.log("  ✓ 4 Job postings across different companies");
  console.log("  ✓ 7 Test messages in conversation threads");
  console.log("\n🔑 TEST ACCOUNTS (password: password123):");
  console.log("  👨‍💼 Admin:           admin@researchbridge.com.bd");
  console.log("  👨‍🎓 Students:         rahim@diu.edu.bd, fatima@bracu.edu.bd, karim@nsu.edu.bd");
  console.log("                      aisha@aiub.edu.bd, hassan@iu.edu.bd");
  console.log("  👨‍🔬 Researcher:      nasrin@diu.edu.bd");
  console.log("  🏢 Companies:        hr@techsolve.com.bd, info@agridata.com.bd");
  console.log("                      contact@finedge.com.bd, contact@greenenergy.com.bd");
  console.log("  ⏳ Pending Verify:   hello@newstartup.com.bd");
  console.log("\n🚀 READY FOR AUDIT: The platform is now fully populated with demo data!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
