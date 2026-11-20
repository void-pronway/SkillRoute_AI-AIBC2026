import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { CAREER_CATALOG } from "@/data/careers";
import { calculateCareerMatch, rankCareers } from "@/logic/careerMatching";
import { calculateLearningEffort } from "@/logic/learningEffort";

function areSkillsDifferent(a: Record<string, number> = {}, b: Record<string, number> = {}): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return true;
  for (const k of keysA) {
    if (Number(a[k]) !== Number(b[k])) return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          careerGoal: "junior_data_analyst",
          weeklyStudyHours: 8,
          skillsJson: JSON.stringify({ python: 3, sql: 2, excel: 3 }),
        },
      });
    }

    const skills: Record<string, number> = JSON.parse(profile.skillsJson || "{}");
    const assessedSkills: Record<string, any> = JSON.parse(profile.assessedSkillsJson || "{}");

    // Parse persisted AI guidance and evaluate freshness
    let aiGuidance = null;
    if (profile.aiGuidanceJson) {
      try {
        aiGuidance = JSON.parse(profile.aiGuidanceJson);
        if (aiGuidance && aiGuidance.skillsSnapshot) {
          aiGuidance.isStale =
            areSkillsDifferent(skills, aiGuidance.skillsSnapshot) ||
            aiGuidance.careerGoalSnapshot !== profile.careerGoal;
        }
      } catch (e) {
        aiGuidance = null;
      }
    }

    // Deterministic career ranking for all 5 careers with user's weekly study capacity
    const weeklyHours = profile.weeklyStudyHours || 8;
    const ranked = rankCareers(
      CAREER_CATALOG,
      skills,
      (c, l) => calculateLearningEffort(c, l, weeklyHours),
      "match"
    );

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        skills,
        assessedSkills,
        aiGuidance,
      },
      careerMatches: ranked,
    });
  } catch (err: any) {
    console.error("Profile GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      skills,
      weeklyStudyHours,
      careerGoal,
      university,
      department,
      graduationYear,
      educationStatus,
    } = await req.json();

    const currentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    const previousSkills: Record<string, number> = JSON.parse(currentProfile?.skillsJson || "{}");
    const assessedSkills: Record<string, any> = JSON.parse(currentProfile?.assessedSkillsJson || "{}");

    // Invalidate assessment status for skills whose proficiency level changed
    if (skills && typeof skills === "object") {
      for (const [skillId, newLevel] of Object.entries(skills)) {
        if (assessedSkills[skillId] && assessedSkills[skillId].levelAssessed !== Number(newLevel)) {
          assessedSkills[skillId].evaluated = false;
        }
      }
    }

    // Detect if skills or career target changed to mark AI guidance as stale
    const skillsModified =
      skills &&
      (areSkillsDifferent(skills, previousSkills) ||
        (careerGoal && careerGoal !== currentProfile?.careerGoal));

    let updatedAiGuidanceJson = currentProfile?.aiGuidanceJson;
    if (skillsModified && currentProfile?.aiGuidanceJson) {
      try {
        const existing = JSON.parse(currentProfile.aiGuidanceJson);
        existing.isStale = true;
        updatedAiGuidanceJson = JSON.stringify(existing);
      } catch (e) {}
    }

    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        skillsJson: skills ? JSON.stringify(skills) : undefined,
        assessedSkillsJson: JSON.stringify(assessedSkills),
        aiGuidanceJson: updatedAiGuidanceJson,
        weeklyStudyHours: weeklyStudyHours !== undefined ? Math.max(1, Math.min(40, Number(weeklyStudyHours))) : undefined,
        careerGoal: careerGoal || undefined,
        university: university !== undefined ? university : undefined,
        department: department !== undefined ? department : undefined,
        graduationYear: graduationYear !== undefined ? Number(graduationYear) : undefined,
        educationStatus: educationStatus !== undefined ? educationStatus : undefined,
      },
      create: {
        userId: user.id,
        careerGoal: careerGoal || "junior_data_analyst",
        weeklyStudyHours: weeklyStudyHours !== undefined ? Math.max(1, Math.min(40, Number(weeklyStudyHours))) : 8,
        skillsJson: JSON.stringify(skills || {}),
        assessedSkillsJson: JSON.stringify(assessedSkills),
        university: university || "Daffodil International University",
        department: department || "Computer Science and Engineering",
        graduationYear: graduationYear ? Number(graduationYear) : 2026,
        educationStatus: educationStatus || "Undergraduate",
      },
    });

    const activeSkills = JSON.parse(updatedProfile.skillsJson || "{}");
    const activeWeeklyHours = updatedProfile.weeklyStudyHours || 8;
    const ranked = rankCareers(
      CAREER_CATALOG,
      activeSkills,
      (c, l) => calculateLearningEffort(c, l, activeWeeklyHours),
      "match"
    );

    let activeGuidance = null;
    if (updatedProfile.aiGuidanceJson) {
      try {
        activeGuidance = JSON.parse(updatedProfile.aiGuidanceJson);
        if (activeGuidance?.skillsSnapshot) {
          activeGuidance.isStale =
            areSkillsDifferent(activeSkills, activeGuidance.skillsSnapshot) ||
            activeGuidance.careerGoalSnapshot !== updatedProfile.careerGoal;
        }
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...updatedProfile,
        skills: activeSkills,
        assessedSkills,
        aiGuidance: activeGuidance,
      },
      careerMatches: ranked,
      skillsModified: Boolean(skillsModified),
    });
  } catch (err: any) {
    console.error("Profile POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
