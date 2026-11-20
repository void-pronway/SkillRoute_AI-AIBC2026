import { GoogleGenAI } from "@google/genai";
import { CAREER_CATALOG } from "../src/data/careers.ts";
import { VERIFIED_RESOURCES } from "../src/data/resources.ts";
import { calculateCareerMatch } from "../src/logic/careerMatching.ts";
import { calculateLearningEffort } from "../src/logic/learningEffort.ts";
import { generateStarterRoadmap } from "../src/logic/roadmap.ts";

const apiKey = "AQ.Ab8RN6KnUClPhKk7mr1sZuo2D_iGyGzE32GeeiNJ3TAaEpSeUw";
const MODEL_NAME = "gemini-3.5-flash-lite";

async function run() {
  const career = CAREER_CATALOG[0]; // Junior Data Analyst
  const userSkills = { python: 3, sql: 2, excel: 3 };
  const weeklyHours = 8;
  const lang = "en";

  const canonicalMatch = calculateCareerMatch(career, userSkills);
  const canonicalEffort = calculateLearningEffort(career, userSkills, weeklyHours);
  const canonicalRoadmap = generateStarterRoadmap(career, userSkills, weeklyHours);

  const mathOutputs = {
    matchPercentage: canonicalMatch.matchPercentage,
    totalEffortHours: canonicalEffort.totalEffortHours,
    fourWeekAllocatedHours: canonicalRoadmap.fourWeekAllocatedHours,
    remainingHoursBeyondWeek4: canonicalRoadmap.remainingHoursBeyondWeek4,
    totalWeeks: canonicalRoadmap.totalWeeks,
  };

  const availableResources = {};
  career.skills.forEach((s) => {
    if (VERIFIED_RESOURCES[s.skill_id]) {
      availableResources[s.skill_id] = VERIFIED_RESOURCES[s.skill_id].map((r) => ({
        title: r.title,
        url: r.url,
        provider: r.provider,
        type: r.type,
      }));
    }
  });

  const scheduledWeeksPrompt = canonicalRoadmap.weeks
    .map(
      (w) =>
        `- Week ${w.weekNumber}: Main Focus Skill is "${w.focusTheme}" (${w.allocatedHours} hours). Tasks: ${w.activities.map(a => a.title).join("; ")}`
    )
    .join("\n");

  const prompt = `You are the AI Career Guidance Assistant for SkillRoute AI, a university career navigation platform for undergraduate students in Bangladesh.
Generate personalized, encouraging, and actionable learning advice anchored strictly to our deterministic assessment and gap-analysis calculations.

STUDENT PROFILE CONTEXT:
- Target Role: ${career.title} (${career.category})
- Role Summary: ${career.role_summary}
- Claimed Skills: ${JSON.stringify(userSkills)}
- Weekly Study Availability: ${weeklyHours} hours/week

DETERMINISTIC MATHEMATICAL INVARIANTS (IMMUTABLE GROUND TRUTH — NEVER RECALCULATE OR CONTRADICT):
- Current Requirement Coverage: ${mathOutputs.matchPercentage}%
- Total Estimated Learning Effort: ${mathOutputs.totalEffortHours} hours
- First 4-Week Allocation (Capacity Capped): ${mathOutputs.fourWeekAllocatedHours} hours
- Remaining Effort Beyond Week 4: ${mathOutputs.remainingHoursBeyondWeek4} hours
- Total Indicative Timeline: ${mathOutputs.totalWeeks} weeks
- Documented Prerequisite Sequence: ${career.learning_sequence_explanation}

IMMUTABLE DETERMINISTIC ROADMAP SCHEDULE (You MUST adhere strictly to these scheduled skills for each week):
${scheduledWeeksPrompt}

AVAILABLE VERIFIED LEARNING RESOURCES:
${JSON.stringify(availableResources, null, 2)}

STRICT GENERATION RULES:
1. Explain WHY the student is a promising fit for this role (${mathOutputs.matchPercentage}% match) given their current strengths.
   DO NOT claim that requirement coverage is 0% (the student's coverage is strictly ${mathOutputs.matchPercentage}%).
2. Outline priority focus areas respecting the prerequisite order: ${career.learning_sequence_explanation}.
3. Generate weekly study advice for Weeks 1 through 4.
   CRITICAL: For each week, your guidance MUST focus on the exact scheduled skill specified above in the IMMUTABLE DETERMINISTIC ROADMAP SCHEDULE.
4. Each weekly milestone must be concrete, hands-on, and relevant to the scheduled skill.
5. You MUST ONLY recommend learning resources from the verified list provided above. NEVER invent or hallucinate URLs.
6. The entire text MUST be written in clear, professional English.
7. Return ONLY a valid JSON object matching the requested schema. No markdown formatting outside the JSON.

REQUIRED JSON FORMAT (MUST USE EXACT KEYS):
{
  "suitabilityExplanation": "Explanation of student fit and coverage (${mathOutputs.matchPercentage}%)",
  "prioritySummary": "Prerequisite-ordered learning priorities",
  "weeklySuggestions": [
    {
      "week": 1,
      "skill": "Exact Scheduled Skill ID or Name",
      "focus": "Primary topic aligned with scheduled tasks",
      "practiceAdvice": "Specific actionable exercise advice",
      "milestone": "Measurable weekly checkpoint"
    }
  ],
  "recommendedResources": [
    {
      "skill": "skill_id",
      "title": "Verified resource title",
      "url": "Verified resource URL from provided list",
      "advice": "How to study this resource effectively"
    }
  ]
}`;

  console.log("Calling GoogleGenAI with model:", MODEL_NAME);
  const ai = new GoogleGenAI({ apiKey });
  const start = Date.now();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 2000,
    },
  });
  console.log(`Response received in ${(Date.now() - start) / 1000}s`);
  console.log("Output:\n", response.text);
}

run().catch(console.error);
