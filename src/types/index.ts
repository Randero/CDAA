export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  price: number;
  thumbnail: string;
  instructor: Instructor;
  objectives: string[];
  requirements: string[];
  curriculum: CurriculumSection[];
  featured?: boolean;
}

export type CourseCategory =
  | "fundamentals"
  | "network-security"
  | "ethical-hacking"
  | "soc"
  | "cloud-security"
  | "grc"
  | "digital-forensics"
  | "awareness";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface CurriculumSection {
  title: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumLesson {
  title: string;
  duration: string;
  type: "video" | "quiz" | "lab" | "reading";
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  expertise: string[];
  coursesCount: number;
  studentsCount: number;
  rating: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  country: string;
  content: string;
  avatar: string;
  courseTitle: string;
  rating: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  author: BlogAuthor;
  publishedAt: string;
  readTime: string;
  thumbnail: string;
  featured?: boolean;
}

export type BlogCategory =
  | "threat-intelligence"
  | "career-advice"
  | "tutorials"
  | "industry-news"
  | "best-practices"
  | "tools";

export interface BlogAuthor {
  name: string;
  avatar: string;
  role: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  twitter?: string;
}

export interface Stat {
  value: string;
  label: string;
  icon: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export const categoryLabels: Record<CourseCategory, string> = {
  fundamentals: "Cybersecurity Fundamentals",
  "network-security": "Network Security",
  "ethical-hacking": "Ethical Hacking & Penetration Testing",
  soc: "Security Operations (SOC)",
  "cloud-security": "Cloud Security",
  grc: "Governance, Risk & Compliance",
  "digital-forensics": "Digital Forensics",
  awareness: "Cybersecurity Awareness",
};

export const levelLabels: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const blogCategoryLabels: Record<BlogCategory, string> = {
  "threat-intelligence": "Threat Intelligence",
  "career-advice": "Career Advice",
  tutorials: "Tutorials",
  "industry-news": "Industry News",
  "best-practices": "Best Practices",
  tools: "Tools & Resources",
};