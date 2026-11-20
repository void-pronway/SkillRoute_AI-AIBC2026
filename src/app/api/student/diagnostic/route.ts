import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { DIAGNOSTIC_QUESTIONS } from "@/data/questions";
import { evaluateDiagnostic, getDiagnosticAssessmentState } from "@/logic/assessment";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    const currentSkills: Record<string, number> = JSON.parse(profile?.skillsJson || "{}");
    const assessedSkills: Record<string, any> = JSON.parse(profile?.assessedSkillsJson || "{}");

    const state = getDiagnosticAssessmentState(currentSkills, assessedSkills, DIAGNOSTIC_QUESTIONS);

    return NextResponse.json({
      success: true,
      questions: DIAGNOSTIC_QUESTIONS,
      state,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userAnswers } = await req.json();

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const currentSkills: Record<string, number> = JSON.parse(profile.skillsJson || "{}");
    const assessedSkills: Record<string, any> = JSON.parse(profile.assessedSkillsJson || "{}");

    // Deterministically grade answers
    const report = evaluateDiagnostic(DIAGNOSTIC_QUESTIONS, userAnswers || {}, Object.keys(currentSkills));

    // Update assessed skills state
    for (const [skillId, evidence] of Object.entries(report.skillEvidence)) {
      if (evidence.answeredCount > 0) {
        assessedSkills[skillId] = {
          levelAssessed: currentSkills[skillId] ?? 0,
          answers: userAnswers,
          evaluated: true,
          status: evidence.status,
          accuracy: evidence.accuracy,
          correctCount: evidence.correctCount,
          totalQuestions: evidence.totalQuestions,
        };

        // Record persistent assessment attempt in database
        await prisma.assessmentAttempt.create({
          data: {
            userId: user.id,
            skillId,
            totalQuestions: evidence.totalQuestions,
            correctCount: evidence.correctCount,
            answeredCount: evidence.answeredCount,
            accuracy: evidence.accuracy,
            evidenceStatus: evidence.status,
            answersJson: JSON.stringify(userAnswers),
          },
        });
      }
    }

    await prisma.studentProfile.update({
      where: { userId: user.id },
      data: {
        assessedSkillsJson: JSON.stringify(assessedSkills),
      },
    });

    return NextResponse.json({
      success: true,
      report,
      assessedSkills,
    });
  } catch (err: any) {
    console.error("Diagnostic POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
