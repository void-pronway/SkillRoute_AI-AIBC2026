/**
 * SkillRoute AI - Curated Career Catalog
 * Contains 5 entry-level tech roles with explicit target levels (1-5),
 * importance weights (1-3), baseline hours from zero to target, and documented skill prerequisites.
 *
 * NOTE: As per blueprint guidelines, these values are illustrative seed assumptions
 * and are not certified market benchmarks.
 */

export interface CareerSkillRequirement {
  skill_id: string;
  target_level: number;
  weight: number;
  hours_zero_to_target: number;
  prerequisites: string[];
}

export interface CareerSource {
  title: string;
  url: string | null;
  checked_on: string;
  status: string;
}

export interface CareerTrack {
  career_id: string;
  title: string;
  title_bn?: string;
  category: "data" | "software" | "security" | "design";
  interest_tag: string;
  role_summary: string;
  role_summary_bn?: string;
  learning_sequence_explanation: string;
  skills: CareerSkillRequirement[];
  prerequisites: string[];
  sources: CareerSource[];
  estimate_status: string;
}

export const CAREER_CATALOG: CareerTrack[] = [
  {
    career_id: "junior_data_analyst",
    title: "Junior Data Analyst",
    title_bn: "জুনিয়র ডেটা অ্যানালিস্ট",
    category: "data",
    interest_tag: "Data & Analytics",
    role_summary: "Extracts insights from structured data, writes analytical queries, and creates decision-support dashboards.",
    role_summary_bn: "স্ট্রাকচার্ড ডেটা থেকে তথ্য বিশ্লেষণ, অ্যানালিটিক্যাল কুয়েরি তৈরি এবং ডিসিশন-সাপোর্ট ড্যাশবোর্ড প্রস্তুত করে।",
    learning_sequence_explanation: "Sequence prioritizes relational querying (SQL) and math foundations (Statistics) before building advanced business intelligence dashboards (Power BI).",
    skills: [
      { skill_id: "python", target_level: 3, weight: 3, hours_zero_to_target: 60, prerequisites: [] },
      { skill_id: "sql", target_level: 3, weight: 3, hours_zero_to_target: 30, prerequisites: [] },
      { skill_id: "excel", target_level: 3, weight: 2, hours_zero_to_target: 20, prerequisites: [] },
      { skill_id: "statistics", target_level: 3, weight: 2, hours_zero_to_target: 45, prerequisites: [] },
      { skill_id: "power_bi", target_level: 3, weight: 2, hours_zero_to_target: 25, prerequisites: ["sql", "excel", "statistics"] },
    ],
    prerequisites: ["Basic quantitative reasoning", "Spreadsheet familiarity"],
    sources: [
      {
        title: "Curated entry-level analytics curriculum & job requirements",
        url: null,
        checked_on: "2026-10-26",
        status: "illustrative seed assumptions",
      },
    ],
    estimate_status: "illustrative seed assumptions",
  },
  {
    career_id: "junior_backend_developer",
    title: "Junior Backend Developer",
    title_bn: "জুনিয়র ব্যাকএন্ড ডেভেলপার",
    category: "software",
    interest_tag: "Software Engineering",
    role_summary: "Builds application logic, implements RESTful APIs, interacts with relational databases, and maintains version control.",
    role_summary_bn: "অ্যাপ্লিকেশন লজিক তৈরি, RESTful এপিআই বাস্তবায়ন, রিলেশনাল ডেটাবেস পরিচালনা এবং ভার্সন কন্ট্রোল বজায় রাখে।",
    learning_sequence_explanation: "Sequence establishes version control (Git) and foundational programming (Python), followed by database persistence (SQL), before assembling public API endpoints (REST APIs).",
    skills: [
      { skill_id: "git", target_level: 2, weight: 1, hours_zero_to_target: 15, prerequisites: [] },
      { skill_id: "python", target_level: 4, weight: 3, hours_zero_to_target: 90, prerequisites: [] },
      { skill_id: "sql", target_level: 3, weight: 3, hours_zero_to_target: 30, prerequisites: ["python"] },
      { skill_id: "rest_apis", target_level: 3, weight: 3, hours_zero_to_target: 40, prerequisites: ["python", "sql"] },
    ],
    prerequisites: ["Computer programming fundamentals", "Basic relational database concepts"],
    sources: [
      {
        title: "Standard junior backend engineering requirements",
        url: null,
        checked_on: "2026-10-26",
        status: "illustrative seed assumptions",
      },
    ],
    estimate_status: "illustrative seed assumptions",
  },
  {
    career_id: "junior_frontend_developer",
    title: "Junior Frontend Developer",
    title_bn: "জুনিয়র ফ্রন্টএন্ড ডেভেলপার",
    category: "software",
    interest_tag: "Software Engineering",
    role_summary: "Constructs responsive user interfaces, implements semantic structure, and manages client-side interactivity.",
    role_summary_bn: "রেসপনসিভ ইউজার ইন্টারফেস তৈরি, সিম্যান্টিক কাঠামো বাস্তবায়ন এবং ক্লায়েন্ট-সাইড ইন্টারঅ্যাক্টিভিটি পরিচালনা করে।",
    learning_sequence_explanation: "Sequence follows standard web architecture: Semantic HTML first, visual styling with CSS second, client logic with JavaScript third, and collaborative Git throughout.",
    skills: [
      { skill_id: "html", target_level: 3, weight: 2, hours_zero_to_target: 20, prerequisites: [] },
      { skill_id: "css", target_level: 3, weight: 2, hours_zero_to_target: 25, prerequisites: ["html"] },
      { skill_id: "javascript", target_level: 3, weight: 3, hours_zero_to_target: 60, prerequisites: ["html", "css"] },
      { skill_id: "git", target_level: 2, weight: 1, hours_zero_to_target: 15, prerequisites: ["html"] },
    ],
    prerequisites: ["Web browsing fundamentals", "Visual styling interest"],
    sources: [
      {
        title: "Entry frontend web development specifications",
        url: null,
        checked_on: "2026-10-26",
        status: "illustrative seed assumptions",
      },
    ],
    estimate_status: "illustrative seed assumptions",
  },
  {
    career_id: "junior_cybersecurity_analyst",
    title: "Junior Cybersecurity Analyst",
    title_bn: "জুনিয়র সাইবার সিকিউরিটি অ্যানালিস্ট",
    category: "security",
    interest_tag: "Cybersecurity & Systems",
    role_summary: "Monitors systems for security events, investigates vulnerabilities, and enforces foundational network security controls.",
    role_summary_bn: "সিকিউরিটি ইভেন্ট মনিটরিং, সিস্টেমের দুর্বলতা তদন্ত এবং নেটওয়ার্ক সুরক্ষা নিয়ন্ত্রণ নিশ্চিত করে।",
    learning_sequence_explanation: "Sequence grounds defense in operating systems (Linux) and communications (Networking), advances to threat modeling (Security Fundamentals), and finishes with incident telemetry (Log Analysis).",
    skills: [
      { skill_id: "networking", target_level: 3, weight: 3, hours_zero_to_target: 50, prerequisites: [] },
      { skill_id: "linux", target_level: 3, weight: 3, hours_zero_to_target: 40, prerequisites: [] },
      { skill_id: "python", target_level: 2, weight: 2, hours_zero_to_target: 30, prerequisites: [] },
      { skill_id: "security_fundamentals", target_level: 3, weight: 3, hours_zero_to_target: 45, prerequisites: ["networking", "linux"] },
      { skill_id: "log_analysis", target_level: 2, weight: 2, hours_zero_to_target: 35, prerequisites: ["linux", "security_fundamentals"] },
    ],
    prerequisites: ["Computer systems literacy", "Operating system basics"],
    sources: [
      {
        title: "Junior SOC and security analyst initial baseline",
        url: null,
        checked_on: "2026-10-26",
        status: "illustrative seed assumptions",
      },
    ],
    estimate_status: "illustrative seed assumptions",
  },
  {
    career_id: "junior_ui_ux_designer",
    title: "Junior UI/UX Designer",
    title_bn: "জুনিয়র ইউআই/ইউএক্স ডিজাইনার",
    category: "design",
    interest_tag: "UI/UX & Product Design",
    role_summary: "Designs user flows, tests user wireframes, builds interactive Figma prototypes, and applies design systems.",
    role_summary_bn: "ইউজার ফ্লো ডিজাইন, ওয়্যারফ্রেম পরীক্ষণ, ফিগমা ইন্টারঅ্যাক্টিভ প্রোটোটাইপ তৈরি এবং ডিজাইন সিস্টেমের প্রয়োগ করে।",
    learning_sequence_explanation: "Sequence begins with problem discovery (User Research) and core tooling (Figma), followed by Visual and Interaction design, culminating in scalable Design Systems.",
    skills: [
      { skill_id: "user_research", target_level: 3, weight: 3, hours_zero_to_target: 40, prerequisites: [] },
      { skill_id: "figma", target_level: 4, weight: 3, hours_zero_to_target: 60, prerequisites: [] },
      { skill_id: "visual_design", target_level: 3, weight: 2, hours_zero_to_target: 35, prerequisites: ["figma"] },
      { skill_id: "interaction_design", target_level: 3, weight: 2, hours_zero_to_target: 35, prerequisites: ["figma", "visual_design"] },
      { skill_id: "design_systems", target_level: 2, weight: 2, hours_zero_to_target: 25, prerequisites: ["visual_design", "interaction_design"] },
    ],
    prerequisites: ["Empathy for user workflows", "Visual composition basics"],
    sources: [
      {
        title: "Entry product and UI/UX design baseline",
        url: null,
        checked_on: "2026-10-26",
        status: "illustrative seed assumptions",
      },
    ],
    estimate_status: "illustrative seed assumptions",
  },
];
