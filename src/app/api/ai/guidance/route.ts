import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CAREER_CATALOG } from "@/data/careers";
import { VERIFIED_RESOURCES } from "@/data/resources";
import { calculateCareerMatch } from "@/logic/careerMatching";
import { calculateLearningEffort } from "@/logic/learningEffort";
import { generateStarterRoadmap } from "@/logic/roadmap";

const MODEL_NAME = "gemini-3.5-flash-lite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      careerId = "junior_data_analyst",
      skills = {},
      weeklyHours = 8,
      lang = "bn",
      model = MODEL_NAME,
    } = body;

    const user = await getSessionUser();
    const career = CAREER_CATALOG.find((c) => c.career_id === careerId) || CAREER_CATALOG[0];

    // Priority for API key: Environment Variable > User Profile
    let apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey && user?.id) {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        select: { geminiApiKey: true },
      });
      if (profile?.geminiApiKey) {
        apiKey = profile.geminiApiKey.trim();
      }
    }

    const activeModel = model || MODEL_NAME;
    const isValidKey = Boolean(apiKey && (apiKey.startsWith("AIzaSy") || apiKey.startsWith("AQ.")) && apiKey.length >= 35);

    // 1. Compute Canonical Deterministic Mathematical Metrics (Immutable Ground Truth)
    const canonicalMatch = calculateCareerMatch(career, skills);
    const canonicalEffort = calculateLearningEffort(career, skills, weeklyHours);
    const canonicalRoadmap = generateStarterRoadmap(career, skills, weeklyHours);

    const mathOutputs = {
      matchPercentage: canonicalMatch.matchPercentage,
      totalEffortHours: canonicalEffort.totalEffortHours,
      fourWeekAllocatedHours: canonicalRoadmap.fourWeekAllocatedHours,
      remainingHoursBeyondWeek4: canonicalRoadmap.remainingHoursBeyondWeek4,
      totalWeeks: canonicalRoadmap.totalWeeks,
    };

    // 2. Assemble verified resources for this career's skills
    const availableResources: Record<string, any[]> = {};
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

    // 3. Structure the immutable deterministic weekly roadmap schedule
    const scheduledWeeksPrompt = canonicalRoadmap.weeks
      .map((w) => {
        const focusSkill = w.focusSkills && w.focusSkills.length > 0 ? w.focusSkills.join(", ") : "Core Skills";
        return `- Week ${w.weekNumber}: Main Focus Skill is "${focusSkill}" (${w.allocatedHours} hours). Tasks: ${w.activities.map((a: any) => a.title).join("; ")}`;
      })
      .join("\n");

    // 4. Deterministic fallback response function (honoring the same schema)
    const generateFallbackGuidance = () => {
      const missingSkills = career.skills
        .filter((req) => (skills[req.skill_id] || 0) < req.target_level)
        .map((req) => req.skill_id.toUpperCase());

      const fallbackWeekly = canonicalRoadmap.weeks.map((w) => {
        const focusSkill = w.focusSkills && w.focusSkills.length > 0 ? w.focusSkills.join(", ") : "Core Skills";
        return {
          week: w.weekNumber,
          skill: focusSkill,
          focus: w.activities.map((a: any) => a.title).join("; "),
          practiceAdvice: lang === "bn"
            ? `${focusSkill} বিষয়ের মৌলিক কুয়েরি ও প্রাক্টিক্যাল সমস্যার নিয়মিত সমাধান করুন।`
            : `Consistently solve practical scenarios and core problem sets in ${focusSkill}.`,
          milestone: lang === "bn"
            ? `${w.allocatedHours} ঘণ্টার অধ্যয়ন সমাপ্তি ও চেকপয়েন্ট যাচাই।`
            : `Complete all ${w.allocatedHours} hours of focused exercises for week ${w.weekNumber}.`,
        };
      });

      const fallbackResources = Object.entries(availableResources).flatMap(([skillId, list]) =>
        list.slice(0, 1).map((r) => ({
          skill: skillId,
          title: r.title,
          url: r.url,
          advice: lang === "bn"
            ? "প্রতিটি অধ্যায়ের কনসেপ্ট বুঝে হ্যান্ডস-অন অনুশীলন সম্পন্ন করুন।"
            : "Review core concepts and complete all accompanying interactive drills.",
        }))
      );

      if (lang === "bn") {
        return {
          source: "deterministic_fallback",
          model: "deterministic_rule_engine",
          suitabilityExplanation: `আপনার প্রোফাইল অনুযায়ী ${career.title_bn || career.title} রোলের সাথে আপনার বর্তমান রিকোয়ারমেন্ট কভারেজ হলো ${mathOutputs.matchPercentage}%। আপনার বর্তমান দক্ষতা এই রোলের ভিত্তি তৈরিতে সহায়ক।`,
          suitability_explanation: `আপনার প্রোফাইল অনুযায়ী ${career.title_bn || career.title} রোলের সাথে আপনার বর্তমান রিকোয়ারমেন্ট কভারেজ হলো ${mathOutputs.matchPercentage}%। আপনার বর্তমান দক্ষতা এই রোলের ভিত্তি তৈরিতে সহায়ক।`,
          prioritySummary: `আমাদের পূর্বশর্ত সিকোয়েন্স অনুযায়ী: ${career.learning_sequence_explanation}। ঘাটতি থাকা বিষয়গুলো (${missingSkills.join(", ") || "কোনো বড় ঘাটতি নেই"}) ক্রমান্বয়ে শেষ করতে হবে।`,
          skill_gap_priorities: `আমাদের পূর্বশর্ত সিকোয়েন্স অনুযায়ী: ${career.learning_sequence_explanation}। ঘাটতি থাকা বিষয়গুলো (${missingSkills.join(", ") || "কোনো বড় ঘাটতি নেই"}) ক্রমান্বয়ে শেষ করতে হবে।`,
          weeklySuggestions: fallbackWeekly,
          weekly_suggestions: fallbackWeekly,
          recommendedResources: fallbackResources,
          recommended_resources: fallbackResources,
          skillsSnapshot: { ...skills },
          careerGoalSnapshot: careerId,
          weeklyHoursSnapshot: weeklyHours,
          generatedAt: new Date().toISOString(),
          isStale: false,
        };
      }

      return {
        source: "deterministic_fallback",
        model: "deterministic_rule_engine",
        suitabilityExplanation: `You are already a promising fit for the ${career.title} role with a current requirement coverage of ${mathOutputs.matchPercentage}%. Your existing competencies form a strong foundation.`,
        suitability_explanation: `You are already a promising fit for the ${career.title} role with a current requirement coverage of ${mathOutputs.matchPercentage}%. Your existing competencies form a strong foundation.`,
        prioritySummary: `Respecting our prerequisite order: ${career.learning_sequence_explanation}. Your primary focus will be closing the remaining gaps in ${missingSkills.join(", ") || "None (Targets Met)"}.`,
        skill_gap_priorities: `Respecting our prerequisite order: ${career.learning_sequence_explanation}. Your primary focus will be closing the remaining gaps in ${missingSkills.join(", ") || "None (Targets Met)"}.`,
        weeklySuggestions: fallbackWeekly,
        weekly_suggestions: fallbackWeekly,
        recommendedResources: fallbackResources,
        recommended_resources: fallbackResources,
        skillsSnapshot: { ...skills },
        careerGoalSnapshot: careerId,
        weeklyHoursSnapshot: weeklyHours,
        generatedAt: new Date().toISOString(),
        isStale: false,
      };
    };

    let resultGuidance: any = null;

    if (!isValidKey) {
      const fallback = generateFallbackGuidance();
      resultGuidance = {
        ...fallback,
        apiNotice: apiKey
          ? (lang === "bn"
              ? "প্রদত্ত জেমিনাই কী-টি যাচাই করা যায়নি। ভেরিফাইড গাণিতিক রোডম্যাপ পরিবেশন করা হচ্ছে।"
              : "Notice: Provided Gemini API key is unverified or restricted. Serving deterministic verified roadmap.")
          : (lang === "bn"
              ? "ভেরিফাইড গাণিতিক রোডম্যাপ সক্রিয়। (লাইভ গুগল জেমিনাই সংযুক্ত করতে AI Settings-এ AI Studio কী যোগ করুন)।"
              : "Operating in verified deterministic guidance mode. (To enable live Google Gemini 3.5, configure an API key from Google AI Studio in Settings)."),
      };
    } else {
      try {
        const isBangla = lang === "bn";
        const prompt = `You are the AI Career Guidance Assistant for SkillRoute AI, a university career navigation platform for undergraduate students in Bangladesh.
Generate personalized, encouraging, and actionable learning advice anchored strictly to our deterministic assessment and gap-analysis calculations.

STUDENT PROFILE CONTEXT:
- Target Role: ${career.title} (${career.category})
- Role Summary: ${career.role_summary}
- Claimed Skills: ${JSON.stringify(skills)}
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
   NEVER recommend or substitute an unscheduled skill.
4. Each weekly milestone must be concrete, hands-on, and relevant to the scheduled skill.
5. You MUST ONLY recommend learning resources from the verified list provided above. NEVER invent or hallucinate URLs.
6. The entire text MUST be written in ${isBangla ? "natural, encouraging Bengali (বাংলা)" : "clear, professional English"}.
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

      // Initialize Google Gen AI SDK
      const ai = new GoogleGenAI({ apiKey });
      let response: any = null;
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: activeModel,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
              maxOutputTokens: 2000,
            },
          });
          if (response?.text) break;
        } catch (callErr: any) {
          const isTransient =
            callErr.status === 503 ||
            callErr.status === 429 ||
            String(callErr.message).includes("503") ||
            String(callErr.message).includes("UNAVAILABLE") ||
            String(callErr.message).includes("overloaded") ||
            String(callErr.message).includes("429") ||
            String(callErr.message).includes("RESOURCE_EXHAUSTED");

          if (isTransient && attempt < maxAttempts) {
            const delayMs = attempt * 1200 + Math.floor(Math.random() * 300);
            await new Promise((r) => setTimeout(r, delayMs));
          } else {
            throw callErr;
          }
        }
      }

      const rawText = response?.text?.trim() || "{}";
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseErr) {
        const cleaned = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        parsedData = JSON.parse(cleaned);
      }

      if (!parsedData || typeof parsedData !== "object") {
        throw new Error("Model returned invalid JSON structure.");
      }

      // Security check: verify no hallucinated URLs
      const allVerifiedUrls = new Set<string>();
      Object.values(availableResources).forEach((list) => {
        list.forEach((r) => allVerifiedUrls.add(r.url));
      });

      let cleanResources = Array.isArray(parsedData.recommendedResources)
        ? parsedData.recommendedResources.filter((r: any) => !r.url || allVerifiedUrls.has(r.url))
        : [];

      // If AI didn't recommend any or hallucinated, use default verified resources
      if (cleanResources.length === 0) {
        cleanResources = Object.entries(availableResources).flatMap(([sId, list]) =>
          list.slice(0, 1).map((r) => ({
            skill: sId,
            title: r.title,
            url: r.url,
            advice: isBangla
              ? "মৌলিক বিষয়গুলো বুঝে নিয়ে অনুশীলনী সমাধান করুন।"
              : "Study the foundational examples and solve the accompanying practice questions.",
          }))
        );
      }

      const rawWeekly = Array.isArray(parsedData.weeklySuggestions)
        ? parsedData.weeklySuggestions
        : Array.isArray(parsedData.weekly_suggestions)
        ? parsedData.weekly_suggestions
        : [];

      const normalizedWeekly = rawWeekly.map((w: any, idx: number) => ({
        week: w.week || idx + 1,
        skill: w.skill || w.focus_skill || `Week ${idx + 1}`,
        focus: w.focus || w.tasks || "",
        practiceAdvice: w.practiceAdvice || w.study_suggestion || "",
        study_suggestion: w.study_suggestion || w.practiceAdvice || "",
        milestone: w.milestone || w.milestone_exercise || "",
        milestone_exercise: w.milestone_exercise || w.milestone || "",
      }));

      const suitabilityText =
        parsedData.suitabilityExplanation ||
        parsedData.suitability_explanation ||
        "";

      const priorityText =
        parsedData.prioritySummary ||
        parsedData.skill_gap_priorities ||
        "";

      resultGuidance = {
        source: "gemini_api",
        model: activeModel,
        suitabilityExplanation: suitabilityText,
        suitability_explanation: suitabilityText,
        prioritySummary: priorityText,
        skill_gap_priorities: priorityText,
        weeklySuggestions: normalizedWeekly,
        weekly_suggestions: normalizedWeekly,
        recommendedResources: cleanResources,
        recommended_resources: cleanResources,
        skillsSnapshot: { ...skills },
        careerGoalSnapshot: careerId,
        weeklyHoursSnapshot: weeklyHours,
        generatedAt: new Date().toISOString(),
        isStale: false,
      };
      } catch (apiErr: any) {
        console.warn("Gemini API call failed, falling back to deterministic engine:", apiErr.message);
        let cleanMsg = "Authentication or network error";
        try {
          if (typeof apiErr.message === "string") {
            if (apiErr.message.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") || apiErr.message.includes("UNAUTHENTICATED")) {
              cleanMsg = "API key unauthenticated or project API restricted (ensure 'Generative Language API' is enabled in Google Cloud Console)";
            } else {
              const jsonMatch = apiErr.message.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                cleanMsg = parsed?.error?.message || cleanMsg;
              } else {
                cleanMsg = apiErr.message;
              }
            }
          }
        } catch {
          cleanMsg = apiErr.message || cleanMsg;
        }

        const fallback = generateFallbackGuidance();
        resultGuidance = {
          ...fallback,
          apiNotice: `Gemini AI (${activeModel}): ${cleanMsg}. Serving deterministic verified roadmap.`,
        };
      }
    }

    // Persist guidance to StudentProfile in database
    if (user?.id) {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          aiGuidanceJson: JSON.stringify(resultGuidance),
          geminiApiKey: apiKey,
          geminiModel: activeModel,
        },
        create: {
          userId: user.id,
          careerGoal: careerId,
          weeklyStudyHours: weeklyHours,
          skillsJson: JSON.stringify(skills),
          aiGuidanceJson: JSON.stringify(resultGuidance),
          geminiApiKey: apiKey,
          geminiModel: activeModel,
        },
      });
    }

    return NextResponse.json({
      success: true,
      model: activeModel,
      canonicalMatchPercentage: mathOutputs.matchPercentage,
      canonicalTotalEffort: mathOutputs.totalEffortHours,
      guidance: resultGuidance,
      savedToProfile: Boolean(user?.id),
    });
  } catch (err: any) {
    console.error("AI Guidance Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
