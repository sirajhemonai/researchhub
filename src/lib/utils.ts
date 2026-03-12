import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJsonField(value: string | null | undefined): string[];
export function parseJsonField<T>(value: string | null | undefined): T[];
export function parseJsonField(value: string | null | undefined): unknown[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function isEduBdEmail(email: string): boolean {
  return email.endsWith(".edu.bd");
}

export const BD_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "PHP", "Go", "Rust",
  "React", "Next.js", "Angular", "Vue.js", "Node.js", "Django", "Laravel", "Spring Boot",
  "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Science",
  "Data Analysis", "Statistics", "R Programming",
  "Android Development", "iOS Development", "Flutter", "React Native",
  "Cloud Computing", "AWS", "Azure", "DevOps", "Docker", "Kubernetes",
  "Cybersecurity", "Network Security", "Blockchain",
  "Database Management", "SQL", "MongoDB", "PostgreSQL",
  "UI/UX Design", "Figma", "Adobe XD",
  "Digital Marketing", "SEO", "Content Writing",
  "Business Analysis", "Project Management", "Agile/Scrum",
  "Embedded Systems", "IoT", "Arduino", "Raspberry Pi",
  "VLSI Design", "PCB Design", "Signal Processing",
  "Textile Engineering", "Garment Technology",
  "Pharmaceutical Research", "Biomedical Engineering",
  "Agricultural Technology", "Food Processing",
  "Civil Engineering", "Structural Analysis",
  "Financial Analysis", "Accounting", "Banking",
  "Supply Chain Management", "Logistics",
  "Environmental Science", "Renewable Energy",
];

export const BD_SECTORS = [
  "Software & IT", "Fintech", "E-commerce", "Telecommunications",
  "Garments & Textile", "Pharmaceutical", "Agriculture & Agritech",
  "Banking & Finance", "Healthcare", "Education & EdTech",
  "Manufacturing", "Construction", "Energy & Power",
  "Transportation & Logistics", "Food & Beverage",
  "Media & Entertainment", "Real Estate", "Tourism & Hospitality",
  "NGO & Development", "Government & Public Sector",
];

export const BD_UNIVERSITIES = [
  "Daffodil International University", "BRAC University", "North South University",
  "East West University", "Independent University Bangladesh", "United International University",
  "American International University-Bangladesh", "BSMRSTU", "BUET",
  "University of Dhaka", "Jahangirnagar University", "Rajshahi University",
  "Chittagong University", "Khulna University", "Shahjalal University of Science & Technology",
  "CUET", "RUET", "KUET", "MIST", "Ahsanullah University of Science & Technology",
  "Stamford University Bangladesh", "Green University of Bangladesh",
  "Bangladesh University of Professionals", "University of Asia Pacific",
  "Bangabandhu Sheikh Mujibur Rahman Digital University",
  "Other",
];
