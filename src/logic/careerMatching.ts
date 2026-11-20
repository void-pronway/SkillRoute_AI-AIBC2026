/**
 * SkillRoute AI - Career Matching Engine
 * Pure deterministic calculation of weighted skill coverage.
 *
 * Formula:
 *   q(s, c) = min(1, P(s) / T(s, c))
 *   CareerMatch(c) = 100 * (sum(w(s, c) * q(s, c)) / sum(w(s, c)))
 *
 * NOTE: Output represents estimated coverage of required catalog skills,
 * NOT hiring probability, job-readiness, or certified employability.
 */

import { CareerTrack, CareerSkillRequirement } from "../data/careers";

export interface SkillMatchBreakdown {
  skill_id: string;
  current: number;
  target: number;
  weight: number;
  coverage: number;
  gap: number;
  weightedContribution: number;
  isReported: boolean;
  isFullyMet: boolean;
}

export interface CareerMatchResult {
  career_id: string;
  title: string;
  category: string;
  interest_tag: string;
  coveredWeight: number;
  totalWeight: number;
  matchPercentage: number;
  rawPercentage: number;
  breakdown: SkillMatchBreakdown[];
  qualification: string;
}

export interface CareerEvaluation extends CareerTrack {
  match: CareerMatchResult;
  effort: any;
}

/**
 * Calculates weighted skill coverage and breakdown for a single career track.
 */
export function calculateCareerMatch(
  career: CareerTrack,
  userSkillLevels: Record<string, number> = {}
): CareerMatchResult {
  if (!career || !Array.isArray(career.skills)) {
    throw new Error("Invalid career object provided to calculateCareerMatch.");
  }

  let coveredWeight = 0;
  let totalWeight = 0;
  const breakdown: SkillMatchBreakdown[] = [];

  for (const req of career.skills) {
    const target = req.target_level;
    const weight = req.weight;
    const isReported = req.skill_id in userSkillLevels;
    const rawVal = userSkillLevels[req.skill_id];
    const current = Math.max(0, Math.min(5, Number(rawVal) || 0));

    if (!(target > 0 && weight > 0)) {
      throw new Error(`Invalid skill target or weight for skill '${req.skill_id}' in career '${career.title}'`);
    }

    const coverage = Math.min(1, current / target);
    const gap = Math.max(0, (target - current) / target);
    const weightedContribution = weight * coverage;

    coveredWeight += weightedContribution;
    totalWeight += weight;

    breakdown.push({
      skill_id: req.skill_id,
      current,
      target,
      weight,
      coverage,
      gap,
      weightedContribution,
      isReported,
      isFullyMet: current >= target,
    });
  }

  const rawPercentage = totalWeight > 0 ? (100 * coveredWeight) / totalWeight : 0;
  const matchPercentage = Number(rawPercentage.toFixed(2));

  return {
    career_id: career.career_id,
    title: career.title,
    category: career.category,
    interest_tag: career.interest_tag,
    coveredWeight,
    totalWeight,
    matchPercentage,
    rawPercentage,
    breakdown,
    qualification: "Provisional scenario, not validated job readiness",
  };
}

/**
 * Ranks an array of careers using deterministic metrics.
 */
export function rankCareers(
  careers: CareerTrack[] = [],
  userSkillLevels: Record<string, number> = {},
  effortCalculator: ((career: CareerTrack, levels: Record<string, number>) => any) | null = null,
  sortBy: "match" | "effort" = "match"
): CareerEvaluation[] {
  const evaluated: CareerEvaluation[] = careers.map((career) => {
    const match = calculateCareerMatch(career, userSkillLevels);
    const effort = effortCalculator ? effortCalculator(career, userSkillLevels) : null;

    return {
      ...career,
      match,
      effort,
    };
  });

  return evaluated.sort((a, b) => {
    if (sortBy === "effort" && a.effort && b.effort) {
      if (a.effort.totalEffortHours !== b.effort.totalEffortHours) {
        return a.effort.totalEffortHours - b.effort.totalEffortHours;
      }
      return b.match.rawPercentage - a.match.rawPercentage;
    }

    // Default: sort by match percentage descending
    if (b.match.rawPercentage !== a.match.rawPercentage) {
      return b.match.rawPercentage - a.match.rawPercentage;
    }
    // Tie-breaker: least learning effort ascending
    if (a.effort && b.effort) {
      return a.effort.totalEffortHours - b.effort.totalEffortHours;
    }
    return 0;
  });
}
