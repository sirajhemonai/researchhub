import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with comprehensive demo data...");

  const password = await bcrypt.hash("password123", 12);

  // ─── ADMIN ───────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@researchbridge.com.bd" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@researchbridge.com.bd",
      password,
      role: "admin",
      verified: true,
      trustScore: 100,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Platform administrator",
          location: "Dhaka",
          standingBadge: "green",
        },
      },
    },
  });

  // ─── STUDENTS ─────────────────────────────────────────────────────────────────
  const student1 = await prisma.user.upsert({
    where: { email: "rahim@diu.edu.bd" },
    update: {},
    create: {
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
          standingBadge: "green",
        },
      },
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "fatima@bracu.edu.bd" },
    update: {},
    create: {
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
          standingBadge: "green",
        },
      },
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: "karim@nsu.edu.bd" },
    update: {},
    create: {
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
          standingBadge: "yellow",
        },
      },
    },
  });

  const student4 = await prisma.user.upsert({
    where: { email: "sara@buet.edu.bd" },
    update: {},
    create: {
      name: "Sara Begum",
      email: "sara@buet.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 92,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "EEE graduate specializing in IoT and embedded systems. Interned at Bangladesh Space Research.",
          university: "BUET",
          department: "EEE",
          studentId: "1805012",
          gpa: 3.94,
          graduationYear: 2024,
          availableForInternship: false,
          skills: JSON.stringify(["Python", "C/C++", "IoT", "Raspberry Pi", "TensorFlow", "MATLAB"]),
          location: "Dhaka",
          standingBadge: "green",
        },
      },
    },
  });

  const student5 = await prisma.user.upsert({
    where: { email: "arif@uiu.edu.bd" },
    update: {},
    create: {
      name: "Arif Mahmud",
      email: "arif@uiu.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 65,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Computer Science student focusing on cybersecurity and blockchain. Active CTF participant.",
          university: "United International University",
          department: "CSE",
          gpa: 3.40,
          graduationYear: 2026,
          availableForInternship: true,
          skills: JSON.stringify(["Cybersecurity", "Blockchain", "Solidity", "Python", "Java"]),
          location: "Dhaka",
          standingBadge: "green",
        },
      },
    },
  });

  // ─── RESEARCHERS ─────────────────────────────────────────────────────────────
  const researcher1 = await prisma.user.upsert({
    where: { email: "nasrin@diu.edu.bd" },
    update: {},
    create: {
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
          publicationCount: 27,
          hIndex: 12,
          citationCount: 543,
          supervisedStudents: 14,
          location: "Dhaka",
          standingBadge: "green",
        },
      },
    },
  });

  const researcher2 = await prisma.user.upsert({
    where: { email: "hassan@buet.edu.bd" },
    update: {},
    create: {
      name: "Prof. Hassan Reza",
      email: "hassan@buet.edu.bd",
      password,
      role: "researcher",
      verified: true,
      trustScore: 98,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Professor of Applied Mathematics, BUET. Expertise in computational fluid dynamics and numerical methods.",
          university: "BUET",
          department: "Mathematics",
          availableForConsulting: true,
          skills: JSON.stringify(["Numerical Methods", "MATLAB", "Python", "CFD", "Statistics"]),
          orcidId: "0000-0002-3456-7890",
          publicationCount: 52,
          hIndex: 18,
          citationCount: 1240,
          supervisedStudents: 32,
          location: "Dhaka",
          standingBadge: "green",
        },
      },
    },
  });

  // ─── COMPANIES ───────────────────────────────────────────────────────────────
  const company1 = await prisma.user.upsert({
    where: { email: "hr@techsolve.com.bd" },
    update: {},
    create: {
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
          standingBadge: "green",
        },
      },
    },
  });

  const company2 = await prisma.user.upsert({
    where: { email: "info@agridata.com.bd" },
    update: {},
    create: {
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
          standingBadge: "green",
        },
      },
    },
  });

  const company3 = await prisma.user.upsert({
    where: { email: "contact@finedge.com.bd" },
    update: {},
    create: {
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
          standingBadge: "yellow",
        },
      },
    },
  });

  const company4 = await prisma.user.upsert({
    where: { email: "hello@newstartup.com.bd" },
    update: {},
    create: {
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
          standingBadge: "green",
        },
      },
    },
  });

  const company5 = await prisma.user.upsert({
    where: { email: "info@healthtech.com.bd" },
    update: {},
    create: {
      name: "HealthTech BD",
      email: "info@healthtech.com.bd",
      password,
      role: "industry",
      verified: false,
      profile: {
        create: {
          verificationStatus: "pending",
          companyName: "HealthTech BD",
          companySector: "Healthcare",
          companySize: "11-50",
          tradeLicenseNumber: "TRAD-2025-00089",
          bio: "Digital health solutions for Bangladesh: telemedicine, EHR, and health analytics.",
          location: "Mohakhali, Dhaka",
          standingBadge: "green",
        },
      },
    },
  });

  // ─── VERIFICATIONS (pending queue) ───────────────────────────────────────────
  await prisma.verification.upsert({
    where: { id: "ver-company4-trade" },
    update: {},
    create: {
      id: "ver-company4-trade",
      userId: company4.id,
      type: "trade_license",
      status: "pending",
    },
  });
  await prisma.verification.upsert({
    where: { id: "ver-company5-trade" },
    update: {},
    create: {
      id: "ver-company5-trade",
      userId: company5.id,
      type: "trade_license",
      status: "pending",
    },
  });
  await prisma.verification.upsert({
    where: { id: "ver-researcher2-faculty" },
    update: {},
    create: {
      id: "ver-researcher2-faculty",
      userId: researcher2.id,
      type: "faculty",
      status: "pending",
    },
  });

  // ─── PROBLEMS ────────────────────────────────────────────────────────────────
  const problem1 = await prisma.problem.upsert({
    where: { id: "prob-resume-ai" },
    update: {},
    create: {
      id: "prob-resume-ai",
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

  const problem2 = await prisma.problem.upsert({
    where: { id: "prob-crop-disease" },
    update: {},
    create: {
      id: "prob-crop-disease",
      companyId: company2.id,
      title: "Crop Disease Detection System Using Smartphone Images",
      abstract: "Farmers in rural Bangladesh need a simple way to diagnose crop diseases using their smartphones. We need a mobile-friendly system that can identify common rice and vegetable diseases from photos.",
      fullDescription: `Bangladesh's agriculture sector needs accessible technology for disease detection.

Problem Statement:
Rice, potato, and tomato crops in Bangladesh suffer from multiple diseases each season. Farmers lack access to agricultural experts for timely diagnosis.

Requirements:
- Accept images from smartphone cameras
- Identify at least 10 common diseases for rice, potato, and tomato
- Provide treatment recommendations in Bangla
- Work on low-bandwidth connections
- Offline capability preferred

Dataset:
- We can provide 5,000+ labeled images from our field teams
- Standard PlantVillage dataset can supplement training

Evaluation Criteria:
- Detection accuracy (top priority)
- Bangla language support
- Mobile-friendliness`,
      visibility: "public",
      bountyType: "certificate",
      skills: JSON.stringify(["Computer Vision", "Deep Learning", "Python", "Flutter"]),
      sector: "Agriculture & Agritech",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem3 = await prisma.problem.upsert({
    where: { id: "prob-fraud-detection" },
    update: {},
    create: {
      id: "prob-fraud-detection",
      companyId: company3.id,
      title: "Fraud Detection Model for Mobile Banking Transactions",
      abstract: "Our mobile banking platform processes 100K+ transactions daily. We need a real-time fraud detection model that can flag suspicious transactions while minimizing false positives.",
      fullDescription: `We need an ML-based fraud detection system for our mobile banking platform.

Context:
FinEdge processes over 100,000 mobile banking transactions daily. Current rule-based system catches only 60% of fraudulent transactions.

Requirements:
- Real-time scoring (under 100ms per transaction)
- Handle transaction features: amount, time, location, device, history
- Reduce false positive rate below 2%
- Improve fraud catch rate to 90%+
- Explainable predictions

Data Provided:
- 12 months of anonymized transaction data (500K+ records)
- Labeled fraud cases`,
      visibility: "public",
      bountyType: "cash",
      bountyValue: "25000",
      skills: JSON.stringify(["Machine Learning", "Python", "Data Science", "SQL"]),
      sector: "Fintech",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem4 = await prisma.problem.upsert({
    where: { id: "prob-inventory" },
    update: {},
    create: {
      id: "prob-inventory",
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

  const problem5 = await prisma.problem.upsert({
    where: { id: "prob-agri-price" },
    update: {},
    create: {
      id: "prob-agri-price",
      companyId: company2.id,
      title: "Market Price Prediction for Agricultural Commodities",
      abstract: "Predict weekly market prices for rice, potato, onion, and tomato across major Bangladesh markets.",
      fullDescription: `Build a price prediction model for key agricultural commodities.

Requirements:
- Predict prices 1-4 weeks ahead
- Cover at least 4 commodities: rice, potato, onion, tomato
- Incorporate weather data, historical prices, and seasonal patterns

Data Available:
- 5 years of daily market price data from DAM
- Weather data from BMD`,
      visibility: "public",
      bountyType: "none",
      skills: JSON.stringify(["Data Science", "Python", "Machine Learning", "Statistics"]),
      sector: "Agriculture & Agritech",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem6 = await prisma.problem.upsert({
    where: { id: "prob-telemedicine" },
    update: {},
    create: {
      id: "prob-telemedicine",
      companyId: company5.id,
      title: "Telemedicine Platform for Rural Bangladesh",
      abstract: "Design a low-bandwidth video consultation platform that connects rural patients with urban doctors, supporting both Bangla and English interfaces.",
      fullDescription: `Bangladesh needs accessible telehealth solutions for rural populations.

Requirements:
- Low-bandwidth video/audio calls (supports 2G/3G)
- Patient registration and appointment booking
- Doctor availability calendar
- Digital prescription generation
- Bangla-first UI
- Works on Android 7+ devices

Integration:
- bKash/Nagad payment for consultation fees
- SMS appointment reminders via Twilio/SSL Wireless`,
      visibility: "public",
      bountyType: "cash",
      bountyValue: "20000",
      skills: JSON.stringify(["React Native", "WebRTC", "Node.js", "PostgreSQL"]),
      sector: "Healthcare",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  const problem7 = await prisma.problem.upsert({
    where: { id: "prob-iot-water" },
    update: {},
    create: {
      id: "prob-iot-water",
      companyId: company2.id,
      title: "IoT-Based Water Quality Monitoring for Fish Farms",
      abstract: "Aquaculture farmers need affordable IoT sensors to monitor dissolved oxygen, pH, temperature, and ammonia in real time to prevent fish deaths.",
      fullDescription: `Bangladesh is one of the world's top fish producers. Water quality monitoring can reduce losses significantly.

Requirements:
- Raspberry Pi / Arduino-based sensor nodes
- Real-time dashboard showing DO, pH, temp, NH3 levels
- SMS/push alerts when levels go out of safe range
- Data logging for trend analysis
- Battery + solar power option for off-grid farms
- BDT cost target: under ৳5,000 per node`,
      visibility: "public",
      bountyType: "cash",
      bountyValue: "12000",
      skills: JSON.stringify(["IoT", "Python", "Raspberry Pi", "React", "MQTT"]),
      sector: "Agriculture & Agritech",
      status: "in_review",
      ipClauseAccepted: true,
    },
  });

  const problem8 = await prisma.problem.upsert({
    where: { id: "prob-blockchain-land" },
    update: {},
    create: {
      id: "prob-blockchain-land",
      companyId: company3.id,
      title: "Blockchain-Based Land Registry Prototype",
      abstract: "Land fraud is rampant in Bangladesh. Design a blockchain-based prototype for immutable land ownership records with smart contract-based transfer.",
      fullDescription: `A decentralized land registry could eliminate fraudulent double-selling and title disputes.

Requirements:
- Ethereum/Polygon smart contract for land titles
- Admin portal for government officials to register parcels
- Owner portal for viewing and initiating transfers
- QR code verification for physical documents
- Proof-of-concept with at least 100 test parcels

Stack preference: Solidity, Hardhat, React, IPFS for document storage`,
      visibility: "public",
      bountyType: "certificate",
      skills: JSON.stringify(["Blockchain", "Solidity", "React", "IPFS"]),
      sector: "Government & Public Sector",
      status: "open",
      ipClauseAccepted: true,
    },
  });

  // ─── SUBMISSIONS ─────────────────────────────────────────────────────────────
  const sub1 = await prisma.submission.upsert({
    where: { id: "sub-rahim-resume" },
    update: {},
    create: {
      id: "sub-rahim-resume",
      problemId: problem1.id,
      userId: student1.id,
      description: `I propose a solution using a fine-tuned BERT model for resume parsing and matching.

Approach:
1. PDF/DOCX parsing using Python (PyMuPDF + python-docx)
2. Named Entity Recognition for extracting skills, education, experience
3. Sentence-BERT for semantic matching between resume and job description
4. Weighted scoring algorithm combining keyword match + semantic similarity
5. React dashboard with drag-and-drop upload

Can deliver a working prototype within 3 weeks.`,
      ipAccepted: true,
      status: "shortlisted",
      score: 85,
    },
  });

  await prisma.submission.upsert({
    where: { id: "sub-fatima-resume" },
    update: {},
    create: {
      id: "sub-fatima-resume",
      problemId: problem1.id,
      userId: student2.id,
      description: `My approach uses a combination of traditional NLP and LLM-based analysis.

Architecture:
1. Resume parser supporting both Bangla and English (custom tokenizer)
2. Feature extraction pipeline: skills, education quality, experience years
3. Fine-tuned GPT-based matching for nuanced requirement understanding
4. Configurable scoring weights for different job types
5. Streamlit dashboard for quick deployment

I have published research on Bangla NLP.`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  await prisma.submission.upsert({
    where: { id: "sub-karim-resume" },
    update: {},
    create: {
      id: "sub-karim-resume",
      problemId: problem1.id,
      userId: student3.id,
      description: `Full-stack SaaS approach using Next.js + Python microservice.

Tech Stack:
- Next.js 14 frontend + FastAPI backend
- Sentence transformers for semantic matching
- Elasticsearch for fast candidate search
- PostgreSQL for candidate storage

Timeline: 4 weeks for MVP. I have built similar tools for two local companies.`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  await prisma.submission.upsert({
    where: { id: "sub-fatima-crop" },
    update: {},
    create: {
      id: "sub-fatima-crop",
      problemId: problem2.id,
      userId: student2.id,
      description: `Proposed solution: Transfer learning with MobileNetV3 for lightweight crop disease detection.

Key aspects:
- MobileNetV3 backbone for smartphone-friendly inference
- Data augmentation to handle limited training data
- TensorFlow Lite model for offline Android deployment
- Bangla UI using Flutter
- Treatment database linked to identified diseases

Expected accuracy: 92%+ based on similar work on PlantVillage dataset.`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  await prisma.submission.upsert({
    where: { id: "sub-sara-crop" },
    update: {},
    create: {
      id: "sub-sara-crop",
      problemId: problem2.id,
      userId: student4.id,
      description: `Hybrid CNN + edge computing approach.

- EfficientNet-B0 model (97.2% accuracy on PlantVillage)
- Quantized INT8 model for Raspberry Pi Zero deployment
- REST API for cloud inference fallback
- Bangla treatment guide from BADC database
- Open-source Android app

I have previous IoT + CV project at BRAC labs.`,
      ipAccepted: true,
      status: "shortlisted",
      score: 90,
    },
  });

  await prisma.submission.upsert({
    where: { id: "sub-karim-inventory" },
    update: {},
    create: {
      id: "sub-karim-inventory",
      problemId: problem4.id,
      userId: student3.id,
      description: `Full-stack solution proposal using Next.js + PostgreSQL.

Tech Stack:
- Next.js 14 with App Router
- PostgreSQL with Prisma ORM
- TailwindCSS for responsive UI
- Chart.js for visualizations
- NextAuth for role-based access

Timeline: 4 weeks for MVP.`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  await prisma.submission.upsert({
    where: { id: "sub-arif-blockchain" },
    update: {},
    create: {
      id: "sub-arif-blockchain",
      problemId: problem8.id,
      userId: student5.id,
      description: `Polygon-based land registry with IPFS document storage.

Stack:
- Solidity smart contracts (ERC-721 for land titles)
- Hardhat for local testing + Polygon Mumbai testnet
- React frontend + Metamask wallet integration
- IPFS via Web3.Storage for deed documents
- QR code verification using on-chain lookup

I have completed Alchemy Web3 Developer Bootcamp and deployed 3 live dApps.`,
      ipAccepted: true,
      status: "submitted",
    },
  });

  await prisma.submission.upsert({
    where: { id: "sub-sara-iot" },
    update: {},
    create: {
      id: "sub-sara-iot",
      problemId: problem7.id,
      userId: student4.id,
      description: `Cost-optimized IoT solution for aquaculture.

Hardware:
- ESP32 microcontroller (BDT 800 vs Raspberry Pi BDT 3000)
- Atlas Scientific sensor suite: DO, pH, temp, NH3
- LoRa WAN for 5km range without WiFi
- 10W solar panel + 10,000mAh LiPo backup

Software:
- MQTT broker (Mosquitto) on EC2 free tier
- Grafana dashboard for real-time viz
- SMS alerts via SSL Wireless API

Total BOM cost: ~৳4,200 per node.`,
      ipAccepted: true,
      status: "shortlisted",
      score: 88,
    },
  });

  // ─── ENGAGEMENTS ─────────────────────────────────────────────────────────────
  // 1. Active engagement — resume AI (company1 + student1) with milestones
  const eng1 = await prisma.engagement.upsert({
    where: { id: "eng-resume-active" },
    update: {},
    create: {
      id: "eng-resume-active",
      problemId: problem1.id,
      companyId: company1.id,
      studentId: student1.id,
      status: "active",
      projectValueBdt: 15000,
      platformFeeRate: 0.30,
      depositAmountBdt: 4500,
      netStudentPayoutBdt: 10500,
      namedContactPhone: "+8801712345678",
      namedContactEmail: "hr@techsolve.com.bd",
      negotiationRound: 2,
      companyConfirmed: true,
      studentConfirmed: true,
      depositConfirmedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      agreedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  // Milestones for eng1
  const ms1 = await prisma.milestone.upsert({
    where: { id: "ms-resume-1" },
    update: {},
    create: {
      id: "ms-resume-1",
      engagementId: eng1.id,
      title: "Resume Parser & NER Module",
      description: "Build the PDF/DOCX parsing pipeline with Named Entity Recognition to extract education, skills, and experience from both English and Bangla resumes.",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      submissionRequirements: "GitHub repo link + working demo URL + documentation PDF",
      order: 0,
      status: "approved",
      deliverableUrl: "https://github.com/rahim-ahmed/resume-parser",
      writtenNote: "NER module achieves 91% F1 on test set. Bangla support added via XLM-R model.",
      isLate: false,
      revisionCount: 0,
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  const ms2 = await prisma.milestone.upsert({
    where: { id: "ms-resume-2" },
    update: {},
    create: {
      id: "ms-resume-2",
      engagementId: eng1.id,
      title: "Matching Engine & Scoring API",
      description: "Implement Sentence-BERT semantic matching between resumes and job descriptions. Expose as a FastAPI REST endpoint with scoring and ranking.",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      submissionRequirements: "Live API URL + Postman collection + accuracy report",
      order: 1,
      status: "under_review",
      deliverableUrl: "https://api.rahimdev.xyz/resume-match",
      writtenNote: "AUC-ROC = 0.94, precision at 85% recall = 0.87. Latency avg 1.2s per resume.",
      isLate: false,
      revisionCount: 1,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reviewDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  const ms3 = await prisma.milestone.upsert({
    where: { id: "ms-resume-3" },
    update: {},
    create: {
      id: "ms-resume-3",
      engagementId: eng1.id,
      title: "React Dashboard & Final Delivery",
      description: "Build the HR-facing web dashboard with drag-and-drop upload, ranked results view, export to Excel, and full technical documentation.",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      submissionRequirements: "Deployed Vercel URL + GitHub repo + documentation PDF + presentation",
      order: 2,
      status: "pending",
    },
  });

  // MilestoneTags for approved milestone
  await prisma.milestoneTag.upsert({
    where: { milestoneId_submittedBy: { milestoneId: ms1.id, submittedBy: company1.id } },
    update: {},
    create: {
      milestoneId: ms1.id,
      submittedBy: company1.id,
      taggedRole: "company",
      targetUserId: student1.id,
      tags: JSON.stringify(["delivered_on_time", "good_communication", "exceeded_expectations"]),
      overallTag: "would_collaborate_again",
      skipped: false,
    },
  });

  // 2. Pending deposit engagement — fraud detection (company3 + student2)
  const eng2 = await prisma.engagement.upsert({
    where: { id: "eng-fraud-pending-deposit" },
    update: {},
    create: {
      id: "eng-fraud-pending-deposit",
      problemId: problem3.id,
      companyId: company3.id,
      studentId: student2.id,
      status: "pending_deposit",
      projectValueBdt: 25000,
      platformFeeRate: 0.30,
      depositAmountBdt: 7500,
      netStudentPayoutBdt: 17500,
      namedContactPhone: "+8801898765432",
      namedContactEmail: "contact@finedge.com.bd",
      negotiationRound: 1,
      companyConfirmed: true,
      studentConfirmed: true,
      agreedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      depositDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.milestone.upsert({
    where: { id: "ms-fraud-1" },
    update: {},
    create: {
      id: "ms-fraud-1",
      engagementId: eng2.id,
      title: "EDA & Feature Engineering",
      description: "Exploratory data analysis of 12 months transaction data. Feature engineering: velocity features, device fingerprint, geo anomaly score.",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      order: 0,
      status: "pending",
    },
  });

  await prisma.milestone.upsert({
    where: { id: "ms-fraud-2" },
    update: {},
    create: {
      id: "ms-fraud-2",
      engagementId: eng2.id,
      title: "Model Training & Evaluation",
      description: "Train XGBoost + LSTM ensemble. Achieve AUC-ROC > 0.95, precision at 90% recall, inference < 100ms.",
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      order: 1,
      status: "pending",
    },
  });

  await prisma.milestone.upsert({
    where: { id: "ms-fraud-3" },
    update: {},
    create: {
      id: "ms-fraud-3",
      engagementId: eng2.id,
      title: "API Deployment & Explainability Report",
      description: "FastAPI microservice + Docker image + SHAP explanations for top fraud signals + final report.",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      order: 2,
      status: "pending",
    },
  });

  // 3. Closing engagement — crop disease (company2 + student4)
  const eng3 = await prisma.engagement.upsert({
    where: { id: "eng-crop-closing" },
    update: {},
    create: {
      id: "eng-crop-closing",
      problemId: problem2.id,
      companyId: company2.id,
      studentId: student4.id,
      status: "closing",
      projectValueBdt: 0,
      platformFeeRate: 0.30,
      depositAmountBdt: 0,
      netStudentPayoutBdt: 0,
      negotiationRound: 1,
      companyConfirmed: false,
      studentConfirmed: true,
      depositConfirmedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      agreedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  const ms_crop1 = await prisma.milestone.upsert({
    where: { id: "ms-crop-1" },
    update: {},
    create: {
      id: "ms-crop-1",
      engagementId: eng3.id,
      title: "Model Training & Accuracy Report",
      description: "Train EfficientNet-B0 on combined PlantVillage + local dataset. Target: >92% accuracy.",
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      order: 0,
      status: "approved",
      deliverableUrl: "https://drive.google.com/sara-crop-model-v1",
      writtenNote: "Final accuracy: 94.7% on test set. Bangla disease names mapped successfully.",
      isLate: false,
      submittedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  const ms_crop2 = await prisma.milestone.upsert({
    where: { id: "ms-crop-2" },
    update: {},
    create: {
      id: "ms-crop-2",
      engagementId: eng3.id,
      title: "Flutter App & Final Delivery",
      description: "Complete Flutter mobile app with TFLite model, Bangla UI, offline mode, and treatment database.",
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      order: 1,
      status: "approved",
      deliverableUrl: "https://github.com/sara-begum/krishiDoc",
      writtenNote: "App published on Play Store (internal testing). Works offline on Android 7+.",
      isLate: false,
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Tags for crop milestones
  await prisma.milestoneTag.upsert({
    where: { milestoneId_submittedBy: { milestoneId: ms_crop1.id, submittedBy: company2.id } },
    update: {},
    create: {
      milestoneId: ms_crop1.id,
      submittedBy: company2.id,
      taggedRole: "company",
      targetUserId: student4.id,
      tags: JSON.stringify(["delivered_on_time", "exceeded_expectations", "proactive_communication"]),
      overallTag: "would_collaborate_again",
    },
  });

  await prisma.milestoneTag.upsert({
    where: { milestoneId_submittedBy: { milestoneId: ms_crop2.id, submittedBy: company2.id } },
    update: {},
    create: {
      milestoneId: ms_crop2.id,
      submittedBy: company2.id,
      taggedRole: "company",
      targetUserId: student4.id,
      tags: JSON.stringify(["excellent_documentation", "clean_code", "thorough_testing"]),
      overallTag: "would_collaborate_again",
    },
  });

  // 4. Engagement with dispute — IoT water quality (company2 + student4)
  const eng4 = await prisma.engagement.upsert({
    where: { id: "eng-iot-disputed" },
    update: {},
    create: {
      id: "eng-iot-disputed",
      problemId: problem7.id,
      companyId: company2.id,
      studentId: student4.id,
      status: "active",
      projectValueBdt: 12000,
      platformFeeRate: 0.30,
      depositAmountBdt: 3600,
      netStudentPayoutBdt: 8400,
      namedContactPhone: "+8801955555555",
      namedContactEmail: "info@agridata.com.bd",
      negotiationRound: 1,
      companyConfirmed: true,
      studentConfirmed: true,
      depositConfirmedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      agreedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  const ms_iot1 = await prisma.milestone.upsert({
    where: { id: "ms-iot-1" },
    update: {},
    create: {
      id: "ms-iot-1",
      engagementId: eng4.id,
      title: "Hardware Prototype & Sensor Calibration",
      description: "Assemble ESP32 + Atlas Scientific sensors. Calibrate DO, pH, temperature, NH3. Verify readings against lab reference.",
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      order: 0,
      status: "disputed",
      deliverableUrl: "https://drive.google.com/sara-iot-proto-v1",
      writtenNote: "Prototype assembled and calibrated. All sensors within ±2% of reference.",
      isLate: false,
      submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      revisionCount: 1,
    },
  });

  await prisma.milestone.upsert({
    where: { id: "ms-iot-2" },
    update: {},
    create: {
      id: "ms-iot-2",
      engagementId: eng4.id,
      title: "MQTT Dashboard & Alerting System",
      description: "Set up Mosquitto MQTT broker, Grafana dashboard, and SMS alerting via SSL Wireless.",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      order: 1,
      status: "pending",
    },
  });

  // Dispute on milestone
  await prisma.dispute.upsert({
    where: { id: "disp-iot-calibration" },
    update: {},
    create: {
      id: "disp-iot-calibration",
      engagementId: eng4.id,
      milestoneId: ms_iot1.id,
      raisedById: company2.id,
      raisedBy: "company",
      reason: "Sensor readings outside acceptable tolerance",
      description: "The submitted NH3 sensor readings differ by ±8% from our independent lab test, not ±2% as claimed. The deliverable does not meet the specification of ±5% tolerance for ammonia sensors in field conditions. We are requesting either re-calibration with certified lab equipment or partial rework.",
      status: "open",
      raisedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Payment released / closed engagement — inventory (company1 + student3) — for transaction log
  const eng5 = await prisma.engagement.upsert({
    where: { id: "eng-inventory-closed" },
    update: {},
    create: {
      id: "eng-inventory-closed",
      problemId: problem4.id,
      companyId: company1.id,
      studentId: student3.id,
      status: "closed",
      projectValueBdt: 8000,
      platformFeeRate: 0.30,
      depositAmountBdt: 2400,
      netStudentPayoutBdt: 5600,
      namedContactPhone: "+8801611223344",
      negotiationRound: 1,
      companyConfirmed: true,
      studentConfirmed: true,
      depositConfirmedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      agreedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      ratingByCompany: 5,
      ratingByStudent: 4,
    },
  });

  const ms_inv1 = await prisma.milestone.upsert({
    where: { id: "ms-inv-1" },
    update: {},
    create: {
      id: "ms-inv-1",
      engagementId: eng5.id,
      title: "Database Schema & API Design",
      description: "Design PostgreSQL schema for multi-warehouse inventory. Implement CRUD RESTful API.",
      dueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      order: 0,
      status: "approved",
      deliverableUrl: "https://api.karimdev.xyz/inventory/docs",
      submittedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000),
    },
  });

  const ms_inv2 = await prisma.milestone.upsert({
    where: { id: "ms-inv-2" },
    update: {},
    create: {
      id: "ms-inv-2",
      engagementId: eng5.id,
      title: "Dashboard & Reporting Module",
      description: "Next.js dashboard with Chart.js visualizations, barcode scanning, and Excel export.",
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      order: 1,
      status: "approved",
      deliverableUrl: "https://inventory.karimdev.xyz",
      submittedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
  });

  // Certificate for closed engagement
  await prisma.certificate.upsert({
    where: { id: "cert-karim-inventory" },
    update: {},
    create: {
      id: "cert-karim-inventory",
      engagementId: eng5.id,
      studentId: student3.id,
      studentName: "Karim Hossain",
      university: "North South University",
      projectTitle: "E-commerce Inventory Management Dashboard",
      companyName: "TechSolve BD Ltd.",
      duration: "7 weeks",
      milestoneSummary: JSON.stringify([
        "Database Schema & API Design — Approved",
        "Dashboard & Reporting Module — Approved",
      ]),
      verificationUrl: `https://researchbridge.com.bd/verify/cert-karim-inventory`,
    },
  });

  // 6. Negotiating engagement — telemedicine (company5 + student5)
  const eng6 = await prisma.engagement.upsert({
    where: { id: "eng-tele-negotiating" },
    update: {},
    create: {
      id: "eng-tele-negotiating",
      problemId: problem6.id,
      companyId: company5.id,
      studentId: student5.id,
      status: "negotiating",
      projectValueBdt: 20000,
      platformFeeRate: 0.30,
      depositAmountBdt: 6000,
      netStudentPayoutBdt: 14000,
      negotiationRound: 1,
      proposedBy: student5.id,
      companyConfirmed: false,
      studentConfirmed: true,
    },
  });

  await prisma.milestone.upsert({
    where: { id: "ms-tele-1" },
    update: {},
    create: {
      id: "ms-tele-1",
      engagementId: eng6.id,
      title: "Backend API & Auth System",
      description: "Node.js/Express backend with JWT auth, patient/doctor models, appointment booking API.",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      order: 0,
      status: "pending",
    },
  });

  await prisma.milestone.upsert({
    where: { id: "ms-tele-2" },
    update: {},
    create: {
      id: "ms-tele-2",
      engagementId: eng6.id,
      title: "WebRTC Video Module",
      description: "Low-bandwidth peer-to-peer video using WebRTC with Twilio STUN/TURN servers.",
      dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      order: 1,
      status: "pending",
    },
  });

  await prisma.milestone.upsert({
    where: { id: "ms-tele-3" },
    update: {},
    create: {
      id: "ms-tele-3",
      engagementId: eng6.id,
      title: "React Native App & Payment Integration",
      description: "Cross-platform app with Bangla UI, bKash/Nagad payment, and digital prescription.",
      dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      order: 2,
      status: "pending",
    },
  });

  // ─── ADMIN ACTIONS ────────────────────────────────────────────────────────────
  // Deposit confirmation for eng1
  await prisma.adminAction.upsert({
    where: { id: "adm-deposit-eng1" },
    update: {},
    create: {
      id: "adm-deposit-eng1",
      adminId: admin.id,
      actionType: "deposit_confirmed",
      entityId: eng1.id,
      entityType: "engagement",
      engagementId: eng1.id,
      notes: "Deposit of ৳4,500 confirmed via bKash transaction ID: BK24112800001. Reference verified against company phone +8801712345678.",
      metadata: JSON.stringify({ bkashTxId: "BK24112800001", amount: 4500 }),
    },
  });

  // Quality check on eng1 milestone
  await prisma.adminAction.upsert({
    where: { id: "adm-qc-ms2" },
    update: {},
    create: {
      id: "adm-qc-ms2",
      adminId: admin.id,
      actionType: "quality_check",
      entityId: ms2.id,
      entityType: "milestone",
      engagementId: eng1.id,
      notes: "Checked deliverable URL and API response times. URL accessible, latency 1.2s within 2s SLA. Accuracy report reviewed — AUC 0.94 meets spec. Flagging for company review.",
      metadata: JSON.stringify({ urlCheck: true, latencyMs: 1200, aucRoc: 0.94 }),
    },
  });

  // Deposit confirmation for eng5 (closed)
  await prisma.adminAction.upsert({
    where: { id: "adm-deposit-eng5" },
    update: {},
    create: {
      id: "adm-deposit-eng5",
      adminId: admin.id,
      actionType: "deposit_confirmed",
      entityId: eng5.id,
      entityType: "engagement",
      engagementId: eng5.id,
      notes: "Deposit of ৳2,400 received via Nagad. Transaction confirmed with finance team. Engagement activated.",
      metadata: JSON.stringify({ nagadTxId: "NG24101500042", amount: 2400 }),
    },
  });

  // Payment release for eng5
  await prisma.adminAction.upsert({
    where: { id: "adm-release-eng5" },
    update: {},
    create: {
      id: "adm-release-eng5",
      adminId: admin.id,
      actionType: "payment_released",
      entityId: eng5.id,
      entityType: "engagement",
      engagementId: eng5.id,
      notes: "Final payout of ৳5,600 transferred to student bKash +8801611XX9999. Both parties confirmed project closure. Certificate issued.",
      metadata: JSON.stringify({ payoutAmount: 5600, method: "bKash" }),
    },
  });

  // ─── FRAUD REPORTS ────────────────────────────────────────────────────────────
  await prisma.fraudReport.upsert({
    where: { id: "fraud-1" },
    update: {},
    create: {
      id: "fraud-1",
      reportedById: student3.id,
      reportedUserId: company3.id,
      reason: "Misrepresentation of project scope",
      description: "After I was selected for the fraud detection engagement, the company added 3 extra requirements not in the original problem statement (real-time streaming pipeline, Kafka integration, and 2-year model maintenance) without offering additional compensation. This appears to be a pattern of scope creep used to extract more work for free.",
      status: "pending",
    },
  });

  await prisma.fraudReport.upsert({
    where: { id: "fraud-2" },
    update: {},
    create: {
      id: "fraud-2",
      reportedById: company1.id,
      reportedUserId: student5.id,
      reason: "Plagiarized submission",
      description: "The blockchain land registry submission from Arif Mahmud appears to be largely copied from an open-source GitHub repository (ethereum-land-registry by devfolio) without disclosure. More than 70% of the smart contract code matches verbatim.",
      status: "pending",
    },
  });

  await prisma.fraudReport.upsert({
    where: { id: "fraud-3" },
    update: {},
    create: {
      id: "fraud-3",
      reportedById: student4.id,
      reportedUserId: company2.id,
      reason: "Non-payment after project completion",
      description: "The inventory project (eng-inventory-closed) was completed and both milestones approved, but TechSolve BD has not confirmed the closure or released payment despite the 7-day grace period ending yesterday. Admin intervention requested.",
      status: "resolved",
    },
  });

  // ─── JOBS ────────────────────────────────────────────────────────────────────
  await prisma.job.upsert({
    where: { id: "job-techsolve-intern" },
    update: {},
    create: {
      id: "job-techsolve-intern",
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
- Studying CSE, SWE, or related field
- Familiarity with JavaScript, React, and Node.js
- Understanding of REST APIs and databases

Duration: 3 months (extendable)
Stipend: BDT 10,000/month
Location: Gulshan, Dhaka (hybrid)`,
      skills: JSON.stringify(["JavaScript", "React", "Node.js", "SQL"]),
      location: "Gulshan, Dhaka",
      salary: "10000",
      status: "active",
    },
  });

  await prisma.job.upsert({
    where: { id: "job-agridata-ds" },
    update: {},
    create: {
      id: "job-agridata-ds",
      companyId: company2.id,
      title: "Data Science Intern",
      type: "internship",
      description: `AgriData Solutions is looking for a data science intern.

Responsibilities:
- Clean and preprocess agricultural datasets
- Build predictive models for crop yield and pricing
- Create data visualizations and reports

Requirements:
- Background in CSE, Statistics, or related field
- Proficiency in Python (pandas, scikit-learn)
- Basic understanding of machine learning

Duration: 6 months | Stipend: BDT 8,000/month`,
      skills: JSON.stringify(["Python", "Data Science", "Machine Learning", "Statistics"]),
      location: "Banani, Dhaka",
      salary: "8000",
      status: "active",
    },
  });

  await prisma.job.upsert({
    where: { id: "job-finedge-backend" },
    update: {},
    create: {
      id: "job-finedge-backend",
      companyId: company3.id,
      title: "Backend Developer",
      type: "fulltime",
      description: `FinEdge is hiring a backend developer to build scalable fintech solutions.

Responsibilities:
- Design and implement RESTful APIs
- Build microservices for payment processing
- Ensure security best practices for financial data

Requirements:
- 1-2 years experience in backend development
- Node.js/Python, PostgreSQL, Redis
- Docker and CI/CD

Salary: BDT 40,000-60,000/month`,
      skills: JSON.stringify(["Node.js", "PostgreSQL", "Docker", "Python"]),
      location: "Dhanmondi, Dhaka",
      salary: "40000-60000",
      status: "active",
    },
  });

  await prisma.job.upsert({
    where: { id: "job-techsolve-uxd" },
    update: {},
    create: {
      id: "job-techsolve-uxd",
      companyId: company1.id,
      title: "UI/UX Designer",
      type: "fulltime",
      description: `Join our design team to create intuitive user experiences.

Responsibilities:
- Design user interfaces for web and mobile applications
- Conduct user research and usability testing
- Create wireframes, prototypes, and high-fidelity mockups

Requirements:
- Portfolio showcasing UI/UX projects
- Proficiency in Figma
- Understanding of design systems

Salary: BDT 35,000-50,000/month`,
      skills: JSON.stringify(["UI/UX Design", "Figma"]),
      location: "Gulshan, Dhaka",
      salary: "35000-50000",
      status: "active",
    },
  });

  await prisma.job.upsert({
    where: { id: "job-healthtech-react" },
    update: {},
    create: {
      id: "job-healthtech-react",
      companyId: company5.id,
      title: "React Native Developer",
      type: "contract",
      description: `HealthTech BD needs a React Native developer for our telemedicine app.

Contract: 3 months, extendable
Rate: BDT 25,000-35,000/month

Responsibilities:
- Develop cross-platform mobile app (Android + iOS)
- Integrate WebRTC for video consultations
- Implement bKash/Nagad payment SDK
- Bangla localization

Requirements:
- React Native with Expo
- REST API integration experience
- TypeScript`,
      skills: JSON.stringify(["React Native", "TypeScript", "WebRTC", "REST APIs"]),
      location: "Remote / Mohakhali",
      salary: "25000-35000",
      status: "active",
    },
  });

  // ─── MESSAGES ────────────────────────────────────────────────────────────────
  await prisma.message.upsert({
    where: { id: "msg-1" },
    update: {},
    create: {
      id: "msg-1",
      senderId: company1.id,
      receiverId: student1.id,
      body: "Hi Rahim! We were impressed with your resume screening proposal. Would you be available for a quick call to discuss the implementation details?",
    },
  });
  await prisma.message.upsert({
    where: { id: "msg-2" },
    update: {},
    create: {
      id: "msg-2",
      senderId: student1.id,
      receiverId: company1.id,
      body: "Thank you! I'd be happy to discuss. I'm available any weekday after 4 PM. Would that work for you?",
    },
  });
  await prisma.message.upsert({
    where: { id: "msg-3" },
    update: {},
    create: {
      id: "msg-3",
      senderId: company1.id,
      receiverId: student1.id,
      body: "Perfect. Let's schedule a call for tomorrow at 5 PM. I'll send you a Google Meet link.",
    },
  });
  await prisma.message.upsert({
    where: { id: "msg-4" },
    update: {},
    create: {
      id: "msg-4",
      senderId: company2.id,
      receiverId: student4.id,
      body: "Sara, your submission for the crop disease detection problem was outstanding. Especially impressed by the EfficientNet accuracy of 94.7%! Would you be open to discussing an engagement?",
    },
  });
  await prisma.message.upsert({
    where: { id: "msg-5" },
    update: {},
    create: {
      id: "msg-5",
      senderId: student4.id,
      receiverId: company2.id,
      body: "Thank you so much! Yes, I'm very interested. I'm also working on a LoRa-based sensor node for fish farms that could complement this project. Happy to discuss both.",
    },
  });
  await prisma.message.upsert({
    where: { id: "msg-6" },
    update: {},
    create: {
      id: "msg-6",
      senderId: researcher1.id,
      receiverId: company3.id,
      body: "I noticed your fraud detection problem. I've published research on transaction anomaly detection for Bangladeshi MFS systems. Would you consider including an academic research collaboration alongside the student engagement?",
    },
  });
  await prisma.message.upsert({
    where: { id: "msg-7" },
    update: {},
    create: {
      id: "msg-7",
      senderId: student2.id,
      receiverId: researcher1.id,
      body: "Dr. Nasrin, I'm working on the fraud detection project for FinEdge. I wanted to ask if you'd be willing to review my feature engineering approach — particularly the velocity features for Bangla mobile banking patterns.",
    },
  });

  // ─── PROJECT RATINGS ─────────────────────────────────────────────────────────
  await prisma.projectRating.upsert({
    where: { engagementId_raterId: { engagementId: eng5.id, raterId: company1.id } },
    update: {},
    create: {
      engagementId: eng5.id,
      raterId: company1.id,
      rateeId: student3.id,
      tags: JSON.stringify(["clean_code", "good_documentation", "on_time_delivery"]),
      overallTag: "would_collaborate_again",
    },
  });
  await prisma.projectRating.upsert({
    where: { engagementId_raterId: { engagementId: eng5.id, raterId: student3.id } },
    update: {},
    create: {
      engagementId: eng5.id,
      raterId: student3.id,
      rateeId: company1.id,
      tags: JSON.stringify(["clear_requirements", "responsive_communication", "fair_assessment"]),
      overallTag: "would_collaborate_again",
    },
  });

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Test accounts (all passwords: password123):");
  console.log("  Admin:        admin@researchbridge.com.bd");
  console.log("  Student 1:    rahim@diu.edu.bd          (active engagement, milestones under review)");
  console.log("  Student 2:    fatima@bracu.edu.bd        (pending deposit engagement)");
  console.log("  Student 3:    karim@nsu.edu.bd           (closed engagement + certificate)");
  console.log("  Student 4:    sara@buet.edu.bd           (dispute + closing engagement)");
  console.log("  Student 5:    arif@uiu.edu.bd            (negotiating engagement, fraud flag)");
  console.log("  Researcher 1: nasrin@diu.edu.bd");
  console.log("  Researcher 2: hassan@buet.edu.bd         (pending faculty verification)");
  console.log("  Company 1:    hr@techsolve.com.bd        (active project + closed project)");
  console.log("  Company 2:    info@agridata.com.bd       (dispute + closing engagement)");
  console.log("  Company 3:    contact@finedge.com.bd     (pending deposit, fraud report against)");
  console.log("  Company 4:    hello@newstartup.com.bd    (pending verification)");
  console.log("  Company 5:    info@healthtech.com.bd     (pending verification, negotiating)");
  console.log("\n🔍 Admin panel coverage:");
  console.log("  ✔ Overview stats: 13 users, 8 problems, 8 submissions, 6 engagements, 5 jobs");
  console.log("  ✔ Verifications: 3 pending (2 trade license, 1 faculty)");
  console.log("  ✔ Fraud reports: 2 pending, 1 resolved");
  console.log("  ✔ Payment queue: 1 pending deposit (eng-fraud-pending-deposit, deadline tomorrow)");
  console.log("  ✔ Review watch: 1 milestone under review (ms-resume-2)");
  console.log("  ✔ Dispute queue: 1 open dispute (IoT sensor calibration)");
  console.log("  ✔ Closure queue: 1 closing engagement (crop disease)");
  console.log("  ✔ Transaction log: 3 admin actions (deposit x2, payment release x1)");
  console.log("  ✔ Standing badges: mix of green/yellow profiles");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
