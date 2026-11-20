/**
 * SkillRoute AI - Deterministic 4-Week Starter Roadmap Generator
 * Builds a structured, capacity-constrained learning plan based on computed skill gaps.
 */

import { CareerTrack, CareerSkillRequirement } from "../data/careers";
import { calculateLearningEffort, calculateTimelineAndPacing, SkillEffortDetail } from "./learningEffort";
import { getResourcesForSkill, LearningResource } from "../data/resources";

export interface RoadmapActivityItem {
  id: string;
  skill_id: string;
  title: string;
  title_bn: string;
  hours: number;
  completed?: boolean;
}

export interface RoadmapWeek {
  weekNumber: number;
  allocatedHours: number;
  focusSkills: string[];
  checkpoint: string;
  checkpoint_bn: string;
  activities: RoadmapActivityItem[];
}

export interface StarterRoadmapResult {
  career_id: string;
  careerTitle: string;
  careerTitle_bn?: string;
  weeklyStudyHours: number;
  totalEffortHours: number;
  totalWeeks: number;
  fourWeekAllocatedHours: number;
  remainingHoursBeyondWeek4: number;
  isCompleteWithinFourWeeks: boolean;
  weeks: RoadmapWeek[];
  verifiedResources: { skill_id: string; resources: LearningResource[] }[];
}

const CHECKPOINTS_EN: Record<string, string> = {
  sql: "Write multi-table queries with INNER/LEFT JOIN and evaluate aggregated metrics using GROUP BY and HAVING.",
  python: "Build a modular CLI program utilizing dictionaries, list comprehensions, and external JSON API parsing.",
  statistics: "Calculate variance, standard deviation, and execute a two-tailed hypothesis test with confidence intervals.",
  power_bi: "Model a star-schema relational model in Power BI, write DAX measures, and publish an interactive report.",
  excel: "Assemble multi-parameter XLOOKUP and dynamic array formulas with automated data validation rules.",
  rest_apis: "Implement a structured REST endpoint handling GET/POST payloads, status codes, and error responses.",
  git: "Manage feature branches, resolve merge conflicts, and assemble clean, purposeful commits using the staging index.",
  html: "Construct a semantic HTML5 document featuring accessible navigation landmarks and ARIA validation.",
  css: "Build a fluid responsive layout using CSS Grid and Flexbox with zero horizontal overflow on mobile viewports.",
  javascript: "Implement asynchronous API data fetching with robust try/catch error boundaries and DOM updates.",
  figma: "Design an interactive 5-screen prototype utilizing auto-layout constraints and reusable component variants.",
  user_research: "Conduct an unmoderated usability session, synthesize findings, and produce a structured affinity diagram.",
  networking: "Analyze packet captures in Wireshark, identifying the TCP 3-way handshake and DNS resolution steps.",
  linux: "Write a bash automation script to filter server error logs with grep and configure an automated cron schedule.",
  security_fundamentals: "Draft a threat model for a web application and recommend OWASP Top 10 mitigation strategies.",
  log_analysis: "Examine multi-source authentication logs and isolate indicators of a brute-force credential stuffing attack.",
  visual_design: "Establish a cohesive typography scale, 8-point spacing grid, and WCAG AA contrast color system.",
  interaction_design: "Prototype responsive button states (hover, focus, disabled) and intuitive easing curves.",
  design_systems: "Create a scalable token library and documented component sheet for developer handoff.",
};

const CHECKPOINTS_BN: Record<string, string> = {
  sql: "INNER/LEFT JOIN দিয়ে মাল্টি-টেবিল কুয়েরি তৈরি এবং GROUP BY ও HAVING ক্লজ দিয়ে অ্যাগ্রিগেটেড মেজার মূল্যায়ন।",
  python: "লিস্ট কমপ্রিহেনশন, ডিকশনারি এবং এক্সটার্নাল এপিআই পার্সিংসহ একটি কার্যকরী মডুলার সিএলআই স্ক্রিপ্ট তৈরি।",
  statistics: "ভ্যারিয়েন্স, স্ট্যান্ডার্ড ডেভিয়েশন হিসাব এবং হাইপোথিসিস টেস্টিং ও কনফিডেন্স ইন্টারভাল ব্যাখ্যা।",
  power_bi: "পাওয়ার বিআই-এ স্টার-স্কিমা ডেটা মডেলিং, DAX মেজার তৈরি এবং ইন্টারঅ্যাক্টিভ ড্যাশবোর্ড প্রকাশ।",
  excel: "XLOOKUP এবং মাল্টি-কন্ডিশন অ্যাগ্রিগেশন ফর্মুলা দিয়ে স্প্রেডশিট ডেটা মডেল প্রস্তুতকরণ।",
  rest_apis: "সঠিক HTTP স্ট্যাটাস কোড ও ভ্যালিডেশনসহ একটি পূর্ণাঙ্গ REST API এন্ডপয়েন্ট বাস্তবায়ন।",
  git: "স্টেজিং এরিয়া, ফিচার ব্রাঞ্চিং এবং মার্জ কনফ্লিক্ট সমাধান করে পরিচ্ছন্ন গিট হিস্টোরি তৈরি।",
  html: "সিম্যান্টিক HTML5, অ্যাক্সেসিবল নেভিগেশন এবং আধুনিক ফর্ম সমৃদ্ধ একটি পূর্ণাঙ্গ ওয়েবপৃষ্ঠা কাঠামো তৈরি।",
  css: "CSS Grid এবং Flexbox ব্যবহার করে মোবাইল ও ডেক্সটপে সাবলীল রেসপনসিভ ২-কলাম লেআউট তৈরি।",
  javascript: "async/await দিয়ে এপিআই থেকে ডেটা ফেচ করে লাইভ ত্রুটি হ্যান্ডলিংসহ DOM আপডেট করার স্ক্রিপ্ট তৈরি।",
  figma: "অটো-লেআউট এবং কম্পোনেন্ট ভ্যারিয়েন্টস ব্যবহার করে ৫-স্ক্রিনের কার্যকর ইন্টারঅ্যাক্টিভ ফিগমা প্রোটোটাইপ তৈরি।",
  user_research: "ইউজার টেস্ট প্রোটোকল তৈরি করে ইউজেবিলিটি সেশন পরিচালনা এবং ফলাফল অ্যাফিনিটি ম্যাপে রূপান্তর।",
  networking: "Wireshark-এ প্যাকেট ক্যাপচার ফাইল পর্যবেক্ষণ করে TCP থ্রি-ওয়ে হ্যান্ডশেক এবং DNS রিকোয়েস্ট রেকর্ড শনাক্ত।",
  linux: "Bash স্ক্রিপ্ট লিখে grep দিয়ে সার্ভার লগ ফাইল থেকে এরর অনুসন্ধান ও স্বয়ংক্রিয় ব্যাকআপ শিডিউল তৈরি।",
  security_fundamentals: "একটি ওয়েব অ্যাপ্লিকেশনের থ্রেট মডেল তৈরি করে OWASP Top 10-এর বিরুদ্ধে সুরক্ষা সুপারিশ তৈরি।",
  log_analysis: "সিস্টেম অথেনটিকেশন লগ ফাইল ফিল্টার করে সিমুলেটেড ব্রুট-ফোর্স আক্রমণ সফলভাবে শনাক্ত ও বিচ্ছিন্নকরণ।",
  visual_design: "টাইপোগ্রাফিক স্কেল, ৮-পয়েন্ট গ্রিড এবং WCAG AA অ্যাক্সেসিবল কালার প্যালেট মেনে স্টাইল গাইড তৈরি।",
  interaction_design: "রেসপনসিভ বাটন স্টেট (ডিফল্ট, হোভার, ফোকাস) এবং ট্রানজিশন দিয়ে ইন্টারঅ্যাক্টিভ কম্পোনেন্ট প্রোটোটাইপ।",
  design_systems: "ডেভেলপার হ্যান্ডঅফের জন্য ফিগমায় ভ্যারিয়েন্টস ও ডিজাইন টোকেনসহ একটি পুনর্ব্যবহারযোগ্য মিনি UI লাইব্রেরি তৈরি।",
};

/**
 * Topologically sorts skill gaps respecting prerequisites and importance weights.
 */
export function orderGapsByPrerequisites(
  gaps: SkillEffortDetail[] = [],
  careerSkills: CareerSkillRequirement[] = [],
  userSkillLevels: Record<string, number> = {}
): SkillEffortDetail[] {
  const skillReqMap = new Map<string, CareerSkillRequirement>();
  careerSkills.forEach((s) => skillReqMap.set(s.skill_id, s));

  const isSatisfied = (skillId: string) => {
    const req = skillReqMap.get(skillId);
    if (!req) return true;
    const current = userSkillLevels[skillId] ?? 0;
    return current >= req.target_level;
  };

  const remaining = [...gaps];
  const ordered: SkillEffortDetail[] = [];
  const scheduledSkillIds = new Set<string>();

  let guard = 0;
  while (remaining.length > 0 && guard < 100) {
    guard++;
    const readyCandidates = remaining.filter((g) => {
      const req = skillReqMap.get(g.skill_id);
      const prereqs = req?.prerequisites || [];
      return prereqs.every((p) => isSatisfied(p) || scheduledSkillIds.has(p));
    });

    if (readyCandidates.length === 0) {
      const fallback = remaining.sort((a, b) => b.weight - a.weight)[0];
      ordered.push(fallback);
      scheduledSkillIds.add(fallback.skill_id);
      const idx = remaining.indexOf(fallback);
      remaining.splice(idx, 1);
    } else {
      readyCandidates.sort((a, b) => {
        if (b.weight !== a.weight) return b.weight - a.weight;
        return a.effortHours - b.effortHours;
      });

      const selected = readyCandidates[0];
      ordered.push(selected);
      scheduledSkillIds.add(selected.skill_id);
      const idx = remaining.indexOf(selected);
      remaining.splice(idx, 1);
    }
  }

  return ordered;
}

/**
 * Generates a 4-week starter learning roadmap.
 */
export function generateStarterRoadmap(
  career: CareerTrack,
  userSkillLevels: Record<string, number> = {},
  weeklyStudyHours = 8
): StarterRoadmapResult {
  const effortResult = calculateLearningEffort(career, userSkillLevels);
  const pacing = calculateTimelineAndPacing(effortResult.totalEffortHours, weeklyStudyHours);

  const orderedGaps = orderGapsByPrerequisites(
    effortResult.missingSkills,
    career.skills,
    userSkillLevels
  );

  const weeks: RoadmapWeek[] = [];
  const maxWeeklyHours = pacing.weeklyStudyHours;

  let currentGapIndex = 0;
  let currentGapRemainingHours = orderedGaps[0]?.effortHours || 0;

  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    let weekRemainingHours = maxWeeklyHours;
    const weekActivities: RoadmapActivityItem[] = [];
    const focusSkillsSet = new Set<string>();

    while (weekRemainingHours > 0 && currentGapIndex < orderedGaps.length) {
      const currentGap = orderedGaps[currentGapIndex];
      const hoursToAllocate = Math.min(weekRemainingHours, currentGapRemainingHours);

      if (hoursToAllocate > 0) {
        focusSkillsSet.add(currentGap.skill_id);
        weekActivities.push({
          id: `w${weekNum}_act_${currentGap.skill_id}_${Math.round(hoursToAllocate)}h`,
          skill_id: currentGap.skill_id,
          title: `Study and practice ${currentGap.skill_id.toUpperCase()} core principles (${hoursToAllocate.toFixed(1)} hrs)`,
          title_bn: `${currentGap.skill_id.toUpperCase()} মূল বিষয়গুলো অধ্যয়ন ও অনুশীলন (${hoursToAllocate.toFixed(1)} ঘণ্টা)`,
          hours: Number(hoursToAllocate.toFixed(1)),
        });

        weekRemainingHours -= hoursToAllocate;
        currentGapRemainingHours -= hoursToAllocate;
      }

      if (currentGapRemainingHours <= 0) {
        currentGapIndex++;
        if (currentGapIndex < orderedGaps.length) {
          currentGapRemainingHours = orderedGaps[currentGapIndex].effortHours;
        }
      }
    }

    const focusSkills = Array.from(focusSkillsSet);
    const primarySkill = focusSkills[0] || (orderedGaps[0]?.skill_id ?? "fundamentals");

    weeks.push({
      weekNumber: weekNum,
      allocatedHours: Number((maxWeeklyHours - weekRemainingHours).toFixed(1)),
      focusSkills,
      checkpoint: CHECKPOINTS_EN[primarySkill] || "Demonstrate practical competency in targeted domain skills.",
      checkpoint_bn: CHECKPOINTS_BN[primarySkill] || "নির্ধারিত ডোমেইন দক্ষতায় ব্যবহারিক দক্ষতা প্রদর্শন।",
      activities: weekActivities,
    });
  }

  // Collect verified public learning resources for all missing skills
  const verifiedResources = orderedGaps.map((g) => ({
    skill_id: g.skill_id,
    resources: getResourcesForSkill(g.skill_id),
  }));

  return {
    career_id: career.career_id,
    careerTitle: career.title,
    careerTitle_bn: career.title_bn,
    weeklyStudyHours: pacing.weeklyStudyHours,
    totalEffortHours: pacing.totalEffortHours,
    totalWeeks: pacing.totalWeeks,
    fourWeekAllocatedHours: pacing.fourWeekAllocatedHours,
    remainingHoursBeyondWeek4: pacing.remainingHoursBeyondWeek4,
    isCompleteWithinFourWeeks: pacing.isCompleteWithinFourWeeks,
    weeks,
    verifiedResources,
  };
}
