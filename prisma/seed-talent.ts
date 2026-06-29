import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 12);

  // 1. Medical Informatics student — covers the health-tech gap
  await prisma.user.create({
    data: {
      name: "Nadia Islam",
      email: "nadia@iubat.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 83,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Health Informatics student building data systems for the Bangladeshi public health sector. Interested in EHR systems, telemedicine, and clinical data analysis.",
          university: "International University of Business Agriculture and Technology",
          department: "Health Informatics",
          studentId: "22-49401-1",
          gpa: 3.74,
          graduationYear: 2026,
          availableForInternship: true,
          skills: JSON.stringify(["Python", "SQL", "HL7/FHIR", "EHR Systems", "Clinical Data Analysis", "Tableau"]),
          location: "Uttara, Dhaka",
          githubUrl: "https://github.com/nadiaiubat",
          linkedinUrl: "https://linkedin.com/in/nadia-islam-health",
          portfolioItems: JSON.stringify([
            { title: "Telemedicine Booking System", description: "Built a full-stack telemedicine appointment system for a local clinic.", year: 2025 },
            { title: "COVID-19 Patient Dashboard", description: "Visualized patient recovery trends using public MoH datasets.", year: 2024 },
          ]),
        },
      },
    },
  });

  // 2. Cybersecurity researcher — covers the security gap
  await prisma.user.create({
    data: {
      name: "Dr. Mehedi Hasan",
      email: "mehedi@cuet.edu.bd",
      password,
      role: "researcher",
      verified: true,
      trustScore: 92,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Assistant Professor at CUET specializing in cybersecurity, network intrusion detection, and applied cryptography. 12+ peer-reviewed publications. Available for industry consulting on security audits and vulnerability assessments.",
          university: "Chittagong University of Engineering and Technology",
          department: "Computer Science and Engineering",
          availableForConsulting: true,
          skills: JSON.stringify(["Cybersecurity", "Network Security", "Cryptography", "Penetration Testing", "Python", "Intrusion Detection"]),
          orcidId: "0000-0003-1122-4455",
          googleScholarUrl: "https://scholar.google.com/citations?user=mehedi_cuet",
          publicationCount: 12,
          hIndex: 5,
          citationCount: 148,
          location: "Chittagong",
          researchInterests: JSON.stringify(["Network Intrusion Detection", "Applied Cryptography", "IoT Security", "Zero-Trust Architecture"]),
        },
      },
    },
  });

  // 3. Product Design / UX student — covers the design gap
  await prisma.user.create({
    data: {
      name: "Tanvir Alam",
      email: "tanvir@eastwest.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 77,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Product Design student with a hybrid background in HCI and front-end development. Passionate about making digital products more accessible for users in rural Bangladesh.",
          university: "East West University",
          department: "Information and Communication Technology",
          studentId: "2020-1-60-088",
          gpa: 3.52,
          graduationYear: 2025,
          availableForInternship: true,
          skills: JSON.stringify(["Figma", "UI/UX Design", "User Research", "Prototyping", "React", "Accessibility (WCAG)"]),
          location: "Dhaka",
          portfolioUrl: "https://tanvir-design.framer.website",
          linkedinUrl: "https://linkedin.com/in/tanvir-ux",
          portfolioItems: JSON.stringify([
            { title: "Agri App Redesign", description: "Redesigned a crop advisory app to increase farmer engagement by 40%.", year: 2025 },
            { title: "Rural Banking UX Audit", description: "Conducted accessibility audit and redesign of a mobile banking app for rural users.", year: 2024 },
            { title: "Government Service Portal", description: "Designed a simplified eGov portal prototype for low-literacy users.", year: 2024 },
          ]),
        },
      },
    },
  });

  // 4. Economics & Data Science student — covers fintech/policy gap
  await prisma.user.create({
    data: {
      name: "Sharmin Akter",
      email: "sharmin@du.edu.bd",
      password,
      role: "student",
      verified: true,
      trustScore: 88,
      profile: {
        create: {
          verificationStatus: "verified",
          bio: "Economics and Data Science double major at Dhaka University. Research focus on financial inclusion, microcredit modeling, and macroeconomic forecasting for developing markets.",
          university: "University of Dhaka",
          department: "Economics",
          studentId: "DU-ECO-20-045",
          gpa: 3.91,
          graduationYear: 2025,
          availableForInternship: true,
          skills: JSON.stringify(["R Programming", "Python", "Econometrics", "Data Visualization", "Statistical Modeling", "SQL", "STATA"]),
          location: "Dhaka",
          linkedinUrl: "https://linkedin.com/in/sharmin-du-economics",
          pastResearch: JSON.stringify([
            { title: "Microcredit Default Prediction in Rural Bangladesh", journal: "Bangladesh Journal of Economics", year: 2024, url: "" },
            { title: "Mobile Banking Adoption Drivers Among Unbanked Populations", journal: "Conference: ICDE 2025", year: 2025, url: "" },
          ]),
        },
      },
    },
  });

  const added = await prisma.user.count({ where: { role: { in: ["student", "researcher"] } } });
  console.log("4 new talent added. Total talent in DB:", added);
  console.log("");
  console.log("New accounts (password: password123):");
  console.log("  nadia@iubat.edu.bd     — Health Informatics student");
  console.log("  mehedi@cuet.edu.bd     — Cybersecurity researcher (CUET)");
  console.log("  tanvir@eastwest.edu.bd — Product Design / UX student");
  console.log("  sharmin@du.edu.bd      — Economics & Data Science student (DU)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
