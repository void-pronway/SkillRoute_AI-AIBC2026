/**
 * SkillRoute AI - Assessment Engine
 * Deterministic grading of diagnostic MCQs.
 * Produces honest evidence labels, NOT certified proficiency levels.
 */

import { DiagnosticQuestion } from "../data/questions";

export const EVIDENCE_STATUS = {
  SUPPORTED: "SOME_SUPPORTING_EVIDENCE",
  INCONCLUSIVE: "INCONCLUSIVE",
  NOT_SUPPORTED: "CLAIM_NOT_SUPPORTED",
  UNASSESSED: "UNASSESSED",
} as const;

export type EvidenceStatus = typeof EVIDENCE_STATUS[keyof typeof EVIDENCE_STATUS];

export const EVIDENCE_LABELS_EN: Record<string, string> = {
  [EVIDENCE_STATUS.SUPPORTED]: "Initial evidence supports claim",
  [EVIDENCE_STATUS.INCONCLUSIVE]: "Inconclusive — needs further review",
  [EVIDENCE_STATUS.NOT_SUPPORTED]: "Claim not supported by this short check",
  [EVIDENCE_STATUS.UNASSESSED]: "Self-reported only — not independently assessed",
};

export const EVIDENCE_LABELS_BN: Record<string, string> = {
  [EVIDENCE_STATUS.SUPPORTED]: "প্রাথমিক প্রমাণ পাওয়া গেছে",
  [EVIDENCE_STATUS.INCONCLUSIVE]: "অমীমাংসিত — পুনরায় পর্যালোচনা প্রয়োজন",
  [EVIDENCE_STATUS.NOT_SUPPORTED]: "এই সংক্ষিপ্ত পরীক্ষায় দাবি সমর্থিত হয়নি",
  [EVIDENCE_STATUS.UNASSESSED]: "শুধুমাত্র স্ব-প্রতিবেদিত — স্বাধীনভাবে যাচাই করা হয়নি",
};

export interface SkillEvidenceReport {
  skill_id: string;
  totalQuestions: number;
  correctCount: number;
  answeredCount: number;
  accuracy: number;
  status: string;
  label_en: string;
  label_bn: string;
}

export interface DiagnosticEvaluationResult {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  overallAccuracy: number;
  skillEvidence: Record<string, SkillEvidenceReport>;
  evidenceSummary: string;
  disclaimer: string;
}

export interface AssessedSkillRecord {
  levelAssessed: number;
  answers: Record<string, number>;
  evaluated: boolean;
}

/**
 * Grades user answers against answer keys and generates per-skill evidence statuses.
 */
export function evaluateDiagnostic(
  questions: DiagnosticQuestion[] = [],
  userAnswers: Record<string, number> = {},
  userReportedSkills: string[] = []
): DiagnosticEvaluationResult {
  const totalQuestions = questions.length;
  let correctCount = 0;
  let answeredCount = 0;

  const skillBreakdown: Record<string, {
    skill_id: string;
    totalQuestions: number;
    correctCount: number;
    answeredCount: number;
  }> = {};

  for (const q of questions) {
    const skillId = q.skill_id;
    if (!skillBreakdown[skillId]) {
      skillBreakdown[skillId] = {
        skill_id: skillId,
        totalQuestions: 0,
        correctCount: 0,
        answeredCount: 0,
      };
    }

    skillBreakdown[skillId].totalQuestions += 1;

    const chosen = userAnswers[q.question_id];
    if (chosen !== undefined && chosen !== null) {
      answeredCount += 1;
      skillBreakdown[skillId].answeredCount += 1;

      if (chosen === q.correct_option_index) {
        correctCount += 1;
        skillBreakdown[skillId].correctCount += 1;
      }
    }
  }

  // Assign evidence status per skill
  const skillEvidence: Record<string, SkillEvidenceReport> = {};

  // First process tested skills
  for (const [skillId, stats] of Object.entries(skillBreakdown)) {
    let status: EvidenceStatus = EVIDENCE_STATUS.UNASSESSED;
    if (stats.answeredCount > 0) {
      if (stats.correctCount === stats.totalQuestions && stats.totalQuestions >= 2) {
        status = EVIDENCE_STATUS.SUPPORTED;
      } else if (stats.correctCount > 0) {
        status = EVIDENCE_STATUS.INCONCLUSIVE;
      } else {
        status = EVIDENCE_STATUS.NOT_SUPPORTED;
      }
    }

    skillEvidence[skillId] = {
      ...stats,
      accuracy: stats.totalQuestions > 0 ? stats.correctCount / stats.totalQuestions : 0,
      status,
      label_en: EVIDENCE_LABELS_EN[status] || status,
      label_bn: EVIDENCE_LABELS_BN[status] || status,
    };
  }

  // Also include any user-reported skills that had no questions
  for (const skillId of userReportedSkills) {
    if (!skillEvidence[skillId]) {
      skillEvidence[skillId] = {
        skill_id: skillId,
        totalQuestions: 0,
        correctCount: 0,
        answeredCount: 0,
        accuracy: 0,
        status: EVIDENCE_STATUS.UNASSESSED,
        label_en: EVIDENCE_LABELS_EN[EVIDENCE_STATUS.UNASSESSED],
        label_bn: EVIDENCE_LABELS_BN[EVIDENCE_STATUS.UNASSESSED],
      };
    }
  }

  // Construct structured evidence summaries
  const summaryParts = Object.values(skillEvidence).map(
    (s) => `${s.skill_id}: ${s.label_en} (${s.correctCount}/${s.totalQuestions})`
  );
  const evidenceSummary = summaryParts.length > 0 ? summaryParts.join("; ") : "No skills assessed.";

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    overallAccuracy: totalQuestions > 0 ? Number((correctCount / totalQuestions).toFixed(2)) : 0,
    skillEvidence,
    evidenceSummary,
    disclaimer: "Diagnostic output represents provisional observational evidence, not formal competency certification.",
  };
}

/**
 * Change-aware diagnostic state evaluator.
 */
export function getDiagnosticAssessmentState(
  currentSkills: Record<string, number> = {},
  assessedSkills: Record<string, AssessedSkillRecord> = {},
  questions: DiagnosticQuestion[] = []
) {
  const supportedSkillMap = new Map<string, DiagnosticQuestion[]>();
  for (const q of questions) {
    if (!supportedSkillMap.has(q.skill_id)) {
      supportedSkillMap.set(q.skill_id, []);
    }
    supportedSkillMap.get(q.skill_id)!.push(q);
  }

  const skillStates: Record<string, any> = {};
  const pendingSkillIds: string[] = [];
  const completedSkillIds: string[] = [];
  const unsupportedSkillIds: string[] = [];

  for (const [skillId, currentLevel] of Object.entries(currentSkills)) {
    const isSupported = supportedSkillMap.has(skillId);
    const availableQuestions = supportedSkillMap.get(skillId) || [];
    const history = assessedSkills[skillId];

    if (!isSupported) {
      unsupportedSkillIds.push(skillId);
      skillStates[skillId] = {
        skill_id: skillId,
        status: "UNSUPPORTED",
        currentLevel,
        assessedLevel: null,
        isSupported: false,
        needsAssessment: false,
        questions: [],
      };
      continue;
    }

    if (!history || !history.evaluated) {
      pendingSkillIds.push(skillId);
      skillStates[skillId] = {
        skill_id: skillId,
        status: "PENDING_NEW",
        currentLevel,
        assessedLevel: null,
        isSupported: true,
        needsAssessment: true,
        questions: availableQuestions,
      };
    } else if (history.levelAssessed !== currentLevel) {
      pendingSkillIds.push(skillId);
      skillStates[skillId] = {
        skill_id: skillId,
        status: "PENDING_REASSESSMENT",
        currentLevel,
        assessedLevel: history.levelAssessed,
        isSupported: true,
        needsAssessment: true,
        questions: availableQuestions,
      };
    } else {
      completedSkillIds.push(skillId);
      skillStates[skillId] = {
        skill_id: skillId,
        status: "COMPLETED",
        currentLevel,
        assessedLevel: history.levelAssessed,
        isSupported: true,
        needsAssessment: false,
        questions: availableQuestions,
      };
    }
  }

  // Active diagnostic evidence: evaluate only currently active skills
  const activeQuestions: DiagnosticQuestion[] = [];
  const activeAnswers: Record<string, number> = {};

  for (const skillId of completedSkillIds) {
    const qs = supportedSkillMap.get(skillId) || [];
    const history = assessedSkills[skillId];
    activeQuestions.push(...qs);
    if (history?.answers) {
      Object.assign(activeAnswers, history.answers);
    }
  }

  const activeEvidence = evaluateDiagnostic(activeQuestions, activeAnswers, Object.keys(currentSkills));

  // Mark pending skills in activeEvidence status
  for (const skillId of pendingSkillIds) {
    if (activeEvidence.skillEvidence[skillId]) {
      activeEvidence.skillEvidence[skillId].status = EVIDENCE_STATUS.INCONCLUSIVE;
      activeEvidence.skillEvidence[skillId].label_en = "Reassessment required (Proficiency changed)";
      activeEvidence.skillEvidence[skillId].label_bn = "পুনঃমূল্যায়ন প্রয়োজন (দক্ষতার স্তর পরিবর্তিত)";
    }
  }

  const isComplete = pendingSkillIds.length === 0;

  return {
    skillStates,
    pendingSkillIds,
    completedSkillIds,
    unsupportedSkillIds,
    isComplete,
    activeEvidence,
  };
}
