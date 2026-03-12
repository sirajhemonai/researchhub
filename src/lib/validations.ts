import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "researcher", "industry", "government"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const problemSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  abstract: z.string().min(20, "Abstract must be at least 20 characters"),
  fullDescription: z.string().min(50, "Description must be at least 50 characters"),
  visibility: z.enum(["public", "private", "nda"]),
  bountyType: z.enum(["cash", "certificate", "none"]).optional(),
  bountyValue: z.string().optional(),
  skills: z.array(z.string()).optional(),
  sector: z.string().optional(),
  deadline: z.string().optional(),
  ipClauseAccepted: z.boolean().refine((v) => v === true, "IP clause must be accepted"),
});

const optionalSafeUrl = z.string().url().refine((u) => u.startsWith("http://") || u.startsWith("https://"), { message: "URL must start with http:// or https://" }).optional().or(z.literal(""));

export const submissionSchema = z.object({
  description: z.string().min(20, "Description must be at least 20 characters"),
  fileUrl: optionalSafeUrl,
  githubRepoUrl: optionalSafeUrl,
  demoUrl: optionalSafeUrl,
  ipAccepted: z.boolean().refine((v) => v === true, "IP clause must be accepted"),
  teamMembers: z.array(z.string()).optional(),
});

export const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  type: z.enum(["internship", "fulltime", "parttime", "contract"]),
  skills: z.array(z.string()).optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().optional(),
  salary: z.string().optional(),
  deadline: z.string().optional(),
});

const safeUrl = z.string().url().refine((u) => u.startsWith("http://") || u.startsWith("https://"), { message: "URL must start with http:// or https://" }).optional().or(z.literal(""));

export const profileSchema = z.object({
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: safeUrl,
  githubUrl: safeUrl,
  portfolioUrl: safeUrl,
  skills: z.array(z.string()).optional(),
  university: z.string().optional(),
  department: z.string().optional(),
  studentId: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
  graduationYear: z.number().min(1900).max(2040).optional(),
  availableForInternship: z.boolean().optional(),
  researchInterests: z.array(z.string()).optional(),
  orcidId: z.string().optional(),
  googleScholarUrl: safeUrl,
  researchGateUrl: safeUrl,
  hIndex: z.number().min(0).max(1000).optional(),
  publicationCount: z.number().min(0).max(100000).optional(),
  citationCount: z.number().min(0).max(10000000).optional(),
  publications: z.array(z.string()).optional(),
  availableForConsulting: z.boolean().optional(),
  companyName: z.string().optional(),
  companySector: z.string().optional(),
  companySize: z.string().optional(),
  tradeLicenseNumber: z.string().optional(),
  website: safeUrl,
  yearEstablished: z.number().min(1800).max(2040).optional(),
});

export const messageSchema = z.object({
  receiverId: z.string().min(1),
  body: z.string().min(1, "Message cannot be empty"),
});
