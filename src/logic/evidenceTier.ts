/**
 * SkillRoute AI - Five-Tier Skill Evidence Classification Framework
 * Resolves skills into their verified evidence levels:
 * Tier 1: SELF_REPORTED (Level 0-5 self rating)
 * Tier 2: KNOWLEDGE_ASSESSED (Diagnostic check MCQ validated)
 * Tier 3: PRACTICALLY_DEMONSTRATED (Mission Arena challenge evaluated)
 * Tier 4: PROJECT_REVIEWED (Multi-criteria portfolio artifact reviewed)
 * Tier 5: EMPLOYER_VERIFIED (Endorsed during interview/trial by employer)
 */

export type SkillEvidenceTier =
  | "SELF_REPORTED"
  | "KNOWLEDGE_ASSESSED"
  | "PRACTICALLY_DEMONSTRATED"
  | "PROJECT_REVIEWED"
  | "EMPLOYER_VERIFIED";

export interface SkillEvidenceTierInfo {
  tierNumber: 1 | 2 | 3 | 4 | 5;
  tierKey: SkillEvidenceTier;
  titleEn: string;
  titleBn: string;
  badgeClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  descriptionEn: string;
  descriptionBn: string;
}

export const EVIDENCE_TIERS: Record<SkillEvidenceTier, SkillEvidenceTierInfo> = {
  SELF_REPORTED: {
    tierNumber: 1,
    tierKey: "SELF_REPORTED",
    titleEn: "Tier 1: Self-Reported",
    titleBn: "স্তর ১: স্ব-প্রতিবেদিত",
    badgeClass: "bg-brand-sage/40 text-brand-black dark:bg-brand-onyx dark:text-brand-cream border-brand-sage/80 dark:border-brand-onyx",
    badgeBg: "#CFDBD5",
    badgeText: "#242423",
    badgeBorder: "#CFDBD5",
    descriptionEn: "Unverified self-claimed rating on 0-5 proficiency scale.",
    descriptionBn: "০-৫ স্কেলে স্ব-প্রতিবেদিত দাবি, স্বাধীনভাবে অপরীক্ষিত।",
  },
  KNOWLEDGE_ASSESSED: {
    tierNumber: 2,
    tierKey: "KNOWLEDGE_ASSESSED",
    titleEn: "Tier 2: Knowledge Assessed",
    titleBn: "স্তর ২: তাত্ত্বিক যাচাইকৃত",
    badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    badgeBg: "#FDE68A",
    badgeText: "#78350F",
    badgeBorder: "#FCD34D",
    descriptionEn: "Observed and validated through standardized diagnostic MCQs.",
    descriptionBn: "স্ট্যান্ডার্ড ডায়াগনস্টিক পরীক্ষার মাধ্যমে তাত্ত্বিক জ্ঞান পর্যবেক্ষণকৃত।",
  },
  PRACTICALLY_DEMONSTRATED: {
    tierNumber: 3,
    tierKey: "PRACTICALLY_DEMONSTRATED",
    titleEn: "Tier 3: Practically Demonstrated",
    titleBn: "স্তর ৩: প্র্যাকটিক্যাল প্রদর্শিত",
    badgeClass: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    badgeBg: "#A7F3D0",
    badgeText: "#064E3B",
    badgeBorder: "#6EE7B7",
    descriptionEn: "Proven via execution in Mission Arena practical challenges.",
    descriptionBn: "মিশন এরিনার প্র্যাকটিক্যাল কোডিং ও টাস্ক বাস্তবায়নের মাধ্যমে প্রমাণিত।",
  },
  PROJECT_REVIEWED: {
    tierNumber: 4,
    tierKey: "PROJECT_REVIEWED",
    titleEn: "Tier 4: Project Reviewed",
    titleBn: "স্তর ৪: প্রজেক্ট মূল্যায়িত",
    badgeClass: "bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    badgeBg: "#BFDBFE",
    badgeText: "#1E3A8A",
    badgeBorder: "#93C5FD",
    descriptionEn: "Evaluated and verified through multi-criteria project review.",
    descriptionBn: "রুব্রিক ফ্রেমওয়ার্কের মাধ্যমে পুঙ্খানুপুঙ্খ প্রকল্প পর্যালোচিত।",
  },
  EMPLOYER_VERIFIED: {
    tierNumber: 5,
    tierKey: "EMPLOYER_VERIFIED",
    titleEn: "Tier 5: Employer Verified",
    titleBn: "স্তর ৫: নিয়োগকারী সত্যায়িত",
    badgeClass: "bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800",
    badgeBg: "#E9D5FF",
    badgeText: "#581C87",
    badgeBorder: "#D8B4FE",
    descriptionEn: "Directly endorsed and verified by employer during evaluation or recruitment.",
    descriptionBn: "নিয়োগকারী প্রতিষ্ঠান কর্তৃক সরাসরি মূল্যায়নে সত্যায়িত দক্ষতা।",
  },
};

/**
 * Resolves a skill's highest demonstrated tier given credentials, diagnostic report, and practical sessions.
 */
export function resolveSkillEvidenceTier(
  skillId: string,
  credentials: any[] = [],
  diagnosticReport?: any,
  challengeSessions: any[] = []
): SkillEvidenceTierInfo {
  const normId = skillId.toLowerCase();

  // Check Employer Verified (Tier 5)
  const hasEmployerCred = credentials.some(
    (c) =>
      (c.skillId?.toLowerCase() === normId || c.competencyTitle?.toLowerCase().includes(normId)) &&
      c.assessmentType === "EMPLOYER_VERIFIED" &&
      c.status === "ACTIVE"
  );
  if (hasEmployerCred) return EVIDENCE_TIERS.EMPLOYER_VERIFIED;

  // Check Project Reviewed (Tier 4)
  const hasProjectCred = credentials.some(
    (c) =>
      (c.skillId?.toLowerCase() === normId || c.competencyTitle?.toLowerCase().includes(normId)) &&
      c.assessmentType === "PROJECT_REVIEWED" &&
      c.status === "ACTIVE"
  );
  if (hasProjectCred) return EVIDENCE_TIERS.PROJECT_REVIEWED;

  // Check Practically Demonstrated (Tier 3)
  const hasPracticalCred = credentials.some(
    (c) =>
      (c.skillId?.toLowerCase() === normId || c.competencyTitle?.toLowerCase().includes(normId)) &&
      (c.assessmentType === "PRACTICALLY_DEMONSTRATED" || c.score >= 70) &&
      c.status === "ACTIVE"
  );

  const hasPassedSession = challengeSessions.some((s) => {
    if (!s.passed && (s.score || 0) < 70) return false;
    const cid = (s.challengeId || "").toLowerCase();
    if (normId === "sql" && cid.includes("sql")) return true;
    if (normId === "rest_apis" && cid.includes("backend")) return true;
    if (normId === "log_analysis" && cid.includes("soc")) return true;
    if (normId === "html" && cid.includes("frontend")) return true;
    if (normId === "user_research" && cid.includes("design")) return true;
    return false;
  });

  if (hasPracticalCred || hasPassedSession) return EVIDENCE_TIERS.PRACTICALLY_DEMONSTRATED;

  // Check Knowledge Assessed (Tier 2) via Diagnostic MCQ Report
  if (diagnosticReport?.skillEvidence?.[normId]) {
    const ev = diagnosticReport.skillEvidence[normId];
    if (ev.status === "SOME_SUPPORTING_EVIDENCE" || ev.correctCount > 0) {
      return EVIDENCE_TIERS.KNOWLEDGE_ASSESSED;
    }
  }

  // Default Tier 1
  return EVIDENCE_TIERS.SELF_REPORTED;
}
