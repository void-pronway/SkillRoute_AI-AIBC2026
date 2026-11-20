/**
 * SkillRoute AI 2.0 - Core Mathematical & Business Logic Regression Suite
 * Tests exact mathematical invariants, benchmarks A & B, graders, and localization.
 */

import { CAREER_CATALOG } from "../src/data/careers";
import { DIAGNOSTIC_QUESTIONS } from "../src/data/questions";
import { calculateCareerMatch } from "../src/logic/careerMatching";
import { calculateLearningEffort, calculateTimelineAndPacing } from "../src/logic/learningEffort";
import { evaluateDiagnostic, EVIDENCE_STATUS } from "../src/logic/assessment";
import { normalizeSkill } from "../src/logic/normalizer";
import { generateStarterRoadmap } from "../src/logic/roadmap";
import { evaluateMissionSubmission, detectAiFingerprints } from "../src/logic/evaluator";
import { toBengaliNumber, TRANSLATIONS } from "../src/lib/i18n";
import { resolveSkillEvidenceTier, EVIDENCE_TIERS } from "../src/logic/evidenceTier";
import { MISSION_CATALOG } from "../src/data/challenges";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedCount++;
  }
}

function assertClose(actual: number, expected: number, testName: string, tolerance = 0.05) {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    console.log(`  ✓ PASS: ${testName} (actual=${actual}, expected=${expected})`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} (actual=${actual}, expected=${expected}, diff=${diff})`);
    failedCount++;
  }
}

console.log("==================================================================");
console.log(" SkillRoute AI 2.0 - Verification of Mathematical Invariants");
console.log("==================================================================\n");

// ------------------------------------------------------------------
// Group 1: Benchmark A — Junior Data Analyst (58.33%, 80h, 10 weeks)
// ------------------------------------------------------------------
console.log("Test Group 1: Benchmark A — Junior Data Analyst");
const dataAnalyst = CAREER_CATALOG.find((c) => c.career_id === "junior_data_analyst")!;
const profileA = {
  python: 3,
  sql: 2,
  excel: 3,
  statistics: 0,
  power_bi: 0,
};

const matchA = calculateCareerMatch(dataAnalyst, profileA);
assertClose(matchA.matchPercentage, 58.33, "Benchmark A: Match score must equal ~58.33%");

const effortA = calculateLearningEffort(dataAnalyst, profileA);
assertClose(effortA.totalEffortHours, 80.0, "Benchmark A: Total effort must equal exactly 80.0 hours");

const pacingA = calculateTimelineAndPacing(effortA.totalEffortHours, 8);
assert(pacingA.totalWeeks === 10, "Benchmark A: 80h at 8h/wk = 10 weeks");
assert(pacingA.fourWeekAllocatedHours === 32.0, "Benchmark A: First 4 weeks allocate 32.0h");
assert(pacingA.remainingHoursBeyondWeek4 === 48.0, "Benchmark A: Remaining hours beyond week 4 = 48.0h");

const roadmapA = generateStarterRoadmap(dataAnalyst, profileA, 8);
assert(roadmapA.totalWeeks === 10, "Roadmap reports 10 weeks total");
assert(roadmapA.weeks.length === 4, "Roadmap generates exactly 4 starter weeks");

// ------------------------------------------------------------------
// Group 2: Benchmark B — Updated SQL Proficiency (66.67%, 70h, 9 weeks)
// ------------------------------------------------------------------
console.log("\nTest Group 2: Benchmark B — Updated SQL Proficiency (Level 2 -> Level 3)");
const profileB = {
  python: 3,
  sql: 3,
  excel: 3,
  statistics: 0,
  power_bi: 0,
};

const matchB = calculateCareerMatch(dataAnalyst, profileB);
assertClose(matchB.matchPercentage, 66.67, "Benchmark B: Match score must equal ~66.67%");

const effortB = calculateLearningEffort(dataAnalyst, profileB);
assertClose(effortB.totalEffortHours, 70.0, "Benchmark B: Total effort must equal exactly 70.0 hours (45h Stats + 25h PBI)");

const pacingB = calculateTimelineAndPacing(effortB.totalEffortHours, 8);
assert(pacingB.totalWeeks === 9, "Benchmark B: 70h at 8h/wk = 9 weeks");
assert(pacingB.fourWeekAllocatedHours === 32.0, "Benchmark B: First 4 weeks allocate 32.0h");
assert(pacingB.remainingHoursBeyondWeek4 === 38.0, "Benchmark B: Remaining hours beyond week 4 = 38.0h");

// ------------------------------------------------------------------
// Group 3: Monotonicity & Clamping
// ------------------------------------------------------------------
console.log("\nTest Group 3: Monotonicity & Clamping Invariants");
const overqualified = calculateCareerMatch(dataAnalyst, { python: 5, sql: 5, excel: 5, statistics: 5, power_bi: 5 });
assertClose(overqualified.matchPercentage, 100.0, "Overqualification clamps at 100%");

const zeroEffort = calculateLearningEffort(dataAnalyst, { python: 5, sql: 5, excel: 5, statistics: 5, power_bi: 5 });
assertClose(zeroEffort.totalEffortHours, 0.0, "Meeting all targets yields 0 effort hours");

assert(matchB.matchPercentage >= matchA.matchPercentage, "Monotonicity: Higher skill yields equal or higher match %");
assert(effortB.totalEffortHours <= effortA.totalEffortHours, "Monotonicity: Higher skill yields equal or lower effort hours");

// ------------------------------------------------------------------
// Group 4: Skill Normalizer
// ------------------------------------------------------------------
console.log("\nTest Group 4: Skill Normalization & Aliases");
assert(normalizeSkill("python3").canonicalId === "python", "Normalize 'python3' -> 'python'");
assert(normalizeSkill("PostgreSQL").canonicalId === "sql", "Normalize 'PostgreSQL' -> 'sql'");
assert(normalizeSkill("JS").canonicalId === "javascript", "Normalize 'JS' -> 'javascript'");
assert(normalizeSkill("Figma Tool").canonicalId === "figma", "Normalize 'Figma Tool' -> 'figma'");

const unknown = normalizeSkill("Quantum Machine Learning");
assert(unknown.recognized === false, "Unknown skill recognized is false");
assert(unknown.raw === "Quantum Machine Learning", "Preserves raw input without silent drop");

// ------------------------------------------------------------------
// Group 5: Diagnostic Assessment Grader
// ------------------------------------------------------------------
console.log("\nTest Group 5: Diagnostic Assessment Observational Evidence");
const diagReport = evaluateDiagnostic(
  DIAGNOSTIC_QUESTIONS.filter((q) => q.skill_id === "sql" || q.skill_id === "python"),
  { sql_q1: 1, sql_q2: 2, py_q1: 2, py_q2: 0 },
  ["sql", "python", "excel"]
);
assert(diagReport.skillEvidence["sql"].status === EVIDENCE_STATUS.SUPPORTED, "SQL 2/2 correct -> Initial evidence supports claim");
assert(diagReport.skillEvidence["python"].status === EVIDENCE_STATUS.INCONCLUSIVE, "Python 1/2 correct -> Inconclusive");
assert(diagReport.skillEvidence["excel"].status === EVIDENCE_STATUS.UNASSESSED, "Excel untested -> Unassessed");

// ------------------------------------------------------------------
// Group 6: Mission Arena Practical Graders
// ------------------------------------------------------------------
console.log("\nTest Group 6: Mission Arena Server-Side Assessment Graders");
const validSqlSubmission = `
SELECT r.region_name, COUNT(o.order_id) AS order_count, SUM(o.order_amount) AS total_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id
WHERE o.order_status = 'COMPLETED'
GROUP BY r.region_name
HAVING SUM(o.order_amount) > 5000
ORDER BY total_revenue DESC;
`;
const sqlEval = evaluateMissionSubmission("mission_sql_regional_sales", validSqlSubmission);
assert(sqlEval.passed === true, "Valid SQL submission passes grading");
assert(sqlEval.totalScore >= 75, `SQL submission score meets threshold (${sqlEval.totalScore}/100)`);
assert(sqlEval.queryOutput?.length === 2, "Query output returns top 2 regions (Dhaka & Chittagong)");

const validSocSubmission = JSON.stringify({
  attacker_ip: "198.51.100.42",
  compromised_account: "student1",
  breach_timestamp: "02:11:24",
  suspicious_command: "curl payload.sh -o /tmp/update.sh",
  remediation_actions: ["Block attacker IP on perimeter firewall", "Reset student1 credentials", "Enforce mandatory MFA"],
});
const socEval = evaluateMissionSubmission("mission_soc_incident_response", validSocSubmission);
assert(socEval.passed === true, "Accurate SOC report passes grading");
assert(socEval.totalScore === 100, `SOC report scores 100/100 (actual=${socEval.totalScore})`);

// ------------------------------------------------------------------
// Group 7: Bengali Numerals & Localization Parity
// ------------------------------------------------------------------
console.log("\nTest Group 7: Bengali Numerals & Localization Parity");
assert(toBengaliNumber(2026) === "২০২৬", "toBengaliNumber(2026) = '২০২৬'");
assert(toBengaliNumber("58.33%") === "৫৮.৩৩%", "toBengaliNumber('58.33%') = '৫৮.৩৩%'");
assert(toBengaliNumber(80) === "৮০", "toBengaliNumber(80) = '৮০'");

const enKeys = Object.keys(TRANSLATIONS.en);
const bnKeys = Object.keys(TRANSLATIONS.bn);
assert(enKeys.length === bnKeys.length, `100% Translation Key Parity: EN=${enKeys.length}, BN=${bnKeys.length}`);

const missingInBn = enKeys.filter((k) => !(k in TRANSLATIONS.bn));
assert(missingInBn.length === 0, "Zero missing translation keys in Bengali dictionary");

// ------------------------------------------------------------------
// Group 8: Academic Integrity & Transparent AI Disclosure Engine
// ------------------------------------------------------------------
console.log("\nTest Group 8: Academic Integrity & Transparent AI Disclosure Engine");
const sqlWithAiMarkers = `
-- Here is the SQL query generated by AI assistant:
\`\`\`sql
SELECT r.region_name, COUNT(o.order_id) AS order_count, SUM(o.order_amount) AS total_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id
WHERE o.order_status = 'COMPLETED'
GROUP BY r.region_name
HAVING SUM(o.order_amount) > 5000
ORDER BY total_revenue DESC;
\`\`\`
`;

const flaggedEval = evaluateMissionSubmission("mission_sql_regional_sales", sqlWithAiMarkers, "INDEPENDENT");
assert(flaggedEval.aiDetected === true, "AI markers detected in Mode A");
assert(flaggedEval.aiIntegrityFlag === "FLAGGED_UNDECLARED_AI", "Integrity flag = FLAGGED_UNDECLARED_AI");
assert(flaggedEval.aiPenaltyPoints === 25, "25-point penalty applied for undeclared AI in Mode A");
assert(flaggedEval.totalScore === 75, "100 raw score reduced to 75 after penalty");

const disclosedEval = evaluateMissionSubmission(
  "mission_sql_regional_sales",
  sqlWithAiMarkers,
  "AI_ASSISTED",
  "Used ChatGPT to structure the window aggregation query and verify column names"
);
assert(disclosedEval.aiIntegrityFlag === "VERIFIED_DISCLOSED_AI", "Integrity flag = VERIFIED_DISCLOSED_AI");
assert(disclosedEval.aiPenaltyPoints === 0, "0 points deducted when AI is transparently disclosed");
assert(disclosedEval.totalScore === 100, "Full 100 marks awarded for transparently disclosed AI submission");

// ------------------------------------------------------------------
// Group 9: Starter Code (Partially Correct) & Full Mark Solutions
// ------------------------------------------------------------------
console.log("\nTest Group 9: Starter Code (Partially Correct) vs Full Mark Verification");
const sqlChallenge = MISSION_CATALOG.find((m) => m.id === "mission_sql_regional_sales")!;
const starterEval = evaluateMissionSubmission("mission_sql_regional_sales", sqlChallenge.initialCode, "INDEPENDENT");
assert(starterEval.totalScore >= 40 && starterEval.totalScore < 70, `Starter code evaluates to partially correct (${starterEval.totalScore}/100)`);
assert(starterEval.passed === false, "Starter code alone does not pass before completion");

const fullMarkEval = evaluateMissionSubmission("mission_sql_regional_sales", sqlChallenge.fullMarkSolution, "INDEPENDENT");
assert(fullMarkEval.totalScore === 100, `Full mark solution scores 100/100 (actual=${fullMarkEval.totalScore})`);
assert(fullMarkEval.passed === true, "Full mark solution passes with flying colors");

// ------------------------------------------------------------------
// Group 10: 5-Tier Skill Evidence Framework Resolver
// ------------------------------------------------------------------
console.log("\nTest Group 10: Five-Tier Skill Evidence Framework Resolver");
const tier1 = resolveSkillEvidenceTier("python", [], null, []);
assert(tier1.tierNumber === 1 && tier1.tierKey === "SELF_REPORTED", "Default skill resolves to Tier 1: SELF_REPORTED");

const diagMock = {
  skillEvidence: {
    sql: { skill_id: "sql", correctCount: 2, status: "SOME_SUPPORTING_EVIDENCE" },
  },
};
const tier2 = resolveSkillEvidenceTier("sql", [], diagMock, []);
assert(tier2.tierNumber === 2 && tier2.tierKey === "KNOWLEDGE_ASSESSED", "MCQ-validated skill resolves to Tier 2: KNOWLEDGE_ASSESSED");

const practicalCred = [{ skillId: "sql", assessmentType: "PRACTICALLY_DEMONSTRATED", score: 90, status: "ACTIVE" }];
const tier3 = resolveSkillEvidenceTier("sql", practicalCred, diagMock, []);
assert(tier3.tierNumber === 3 && tier3.tierKey === "PRACTICALLY_DEMONSTRATED", "Challenge credential resolves to Tier 3: PRACTICALLY_DEMONSTRATED");

const employerCred = [{ skillId: "sql", assessmentType: "EMPLOYER_VERIFIED", score: 95, status: "ACTIVE" }];
const tier5 = resolveSkillEvidenceTier("sql", employerCred, diagMock, []);
assert(tier5.tierNumber === 5 && tier5.tierKey === "EMPLOYER_VERIFIED", "Employer verified skill resolves to Tier 5: EMPLOYER_VERIFIED");

console.log("\n==================================================================");
console.log(` Test Summary: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("==================================================================");

if (failedCount > 0) {
  process.exit(1);
}
