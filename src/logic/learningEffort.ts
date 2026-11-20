/**
 * SkillRoute AI - Learning Effort Engine
 * Pure deterministic calculation of gap-adjusted learning hours and timeline pacing.
 *
 * Formulas:
 *   Gap(s, c) = max(0, (T(s, c) - P(s)) / T(s, c))
 *   Effort(s, c) = H(s, c) * Gap(s, c)
 *   CareerEffort(c) = sum(Effort(s, c))
 *   EstimatedWeeks(c) = ceil(CareerEffort(c) / WeeklyStudyHours)
 *
 * H(s, c) is baseline focused hours from zero to the role's target proficiency.
 */

import { CareerTrack } from "../data/careers";

export interface SkillEffortDetail {
  skill_id: string;
  current: number;
  target: number;
  weight: number;
  baseHours: number;
  gap: number;
  effortHours: number;
  isReported: boolean;
  hasGap: boolean;
}

export interface LearningEffortResult {
  career_id: string;
  title: string;
  totalEffortHours: number;
  estimatedWeeks: number;
  skillEfforts: SkillEffortDetail[];
  missingSkills: SkillEffortDetail[];
  estimateStatus: string;
}

export interface TimelinePacingResult {
  weeklyStudyHours: number;
  totalEffortHours: number;
  totalWeeks: number;
  fourWeekAllocatedHours: number;
  remainingHoursBeyondWeek4: number;
  isCompleteWithinFourWeeks: boolean;
}

/**
 * Calculates gap-adjusted learning hours per skill and total effort for a career track.
 */
export function calculateLearningEffort(
  career: CareerTrack,
  userSkillLevels: Record<string, number> = {},
  weeklyStudyHours: number = 8
): LearningEffortResult {
  if (!career || !Array.isArray(career.skills)) {
    throw new Error("Invalid career object provided to calculateLearningEffort.");
  }

  let totalEffortHours = 0;
  const skillEfforts: SkillEffortDetail[] = [];

  for (const req of career.skills) {
    const target = req.target_level;
    const baseHours = req.hours_zero_to_target;
    const isReported = req.skill_id in userSkillLevels;
    const current = Math.max(0, Math.min(5, Number(userSkillLevels[req.skill_id]) || 0));

    if (!(target > 0 && baseHours >= 0)) {
      throw new Error(`Invalid target or baseline hours for skill '${req.skill_id}' in career '${career.title}'`);
    }

    const gap = Math.max(0, (target - current) / target);
    const effortHours = baseHours * gap;
    totalEffortHours += effortHours;

    skillEfforts.push({
      skill_id: req.skill_id,
      current,
      target,
      weight: req.weight,
      baseHours,
      gap,
      effortHours: Number(effortHours.toFixed(2)),
      isReported,
      hasGap: gap > 0,
    });
  }

  // Filter only missing/deficient skills for gap focus
  const missingSkills = skillEfforts
    .filter((s) => s.hasGap)
    .sort((a, b) => {
      // Sort by importance weight descending, then by effort hours ascending
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.effortHours - b.effortHours;
    });

  const capacity = Math.max(1, Number(weeklyStudyHours) || 8);
  const estimatedWeeks = Math.ceil(totalEffortHours / capacity);

  return {
    career_id: career.career_id,
    title: career.title,
    totalEffortHours: Number(totalEffortHours.toFixed(2)),
    estimatedWeeks,
    skillEfforts,
    missingSkills,
    estimateStatus: career.estimate_status || "illustrative seed assumptions",
  };
}

/**
 * Calculates schedule duration, 4-week starter capacity, and remaining effort beyond week 4.
 */
export function calculateTimelineAndPacing(
  totalEffortHours = 0,
  weeklyStudyHours = 8
): TimelinePacingResult {
  const capacity = Math.max(1, Number(weeklyStudyHours) || 8);
  const totalWeeks = Math.ceil(totalEffortHours / capacity);

  const maxFourWeekHours = 4 * capacity;
  const fourWeekAllocatedHours = Math.min(totalEffortHours, maxFourWeekHours);
  const remainingHoursBeyondWeek4 = Math.max(0, totalEffortHours - fourWeekAllocatedHours);

  return {
    weeklyStudyHours: capacity,
    totalEffortHours: Number(totalEffortHours.toFixed(2)),
    totalWeeks,
    fourWeekAllocatedHours: Number(fourWeekAllocatedHours.toFixed(2)),
    remainingHoursBeyondWeek4: Number(remainingHoursBeyondWeek4.toFixed(2)),
    isCompleteWithinFourWeeks: remainingHoursBeyondWeek4 === 0,
  };
}
