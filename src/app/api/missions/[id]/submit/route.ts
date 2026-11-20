import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getChallengeById } from "@/data/challenges";
import { evaluateMissionSubmission } from "@/logic/evaluator";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submission, mode = "INDEPENDENT", aiNotes = "", blurredCount = 0, timeSpentSeconds = 0 } = await req.json();

    const challenge = getChallengeById(params.id);
    if (!challenge) {
      return NextResponse.json({ error: "Mission challenge not found" }, { status: 404 });
    }

    // Evaluate server-side with AI integrity analysis
    const evalResult = evaluateMissionSubmission(challenge.id, submission || "", mode, aiNotes);

    // Record session
    const session = await prisma.challengeSession.create({
      data: {
        userId: user.id,
        challengeId: challenge.id,
        status: "EVALUATED",
        mode,
        aiDisclosureNotes: mode === "AI_ASSISTED" ? aiNotes : null,
        blurredCount: Number(blurredCount) || 0,
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
        score: evalResult.totalScore,
        passed: evalResult.passed,
        feedback: evalResult.overallFeedback,
        codeSubmission: submission || "",
        evalResultsJson: JSON.stringify(evalResult.detailedResults),
        completedAt: new Date(),
      },
    });

    let issuedCredential: any = null;

    // If passed, issue credential if not already issued
    if (evalResult.passed) {
      const primarySkillId = challenge.category === "data" ? "sql"
        : challenge.category === "backend" ? "rest_apis"
        : challenge.category === "security" ? "log_analysis"
        : challenge.category === "design" ? "user_research" : "html";

      const existingCred = await prisma.credential.findFirst({
        where: {
          userId: user.id,
          skillId: primarySkillId,
          status: "ACTIVE",
        },
      });

      if (!existingCred) {
        const randSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
        const credId = `SKILL-${new Date().getFullYear()}-${primarySkillId.toUpperCase()}-${randSuffix}`;

        issuedCredential = await prisma.credential.create({
          data: {
            credentialId: credId,
            userId: user.id,
            skillId: primarySkillId,
            competencyTitle: `${challenge.title} (Practically Demonstrated)`,
            assessmentType: "PRACTICALLY_DEMONSTRATED",
            score: evalResult.totalScore,
            verificationUrl: `/verify/${credId}`,
            status: "ACTIVE",
          },
        });

        // Audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "CREDENTIAL_ISSUED",
            resourceType: "Credential",
            resourceId: issuedCredential.id,
            details: `Earned credential ${credId} for passing mission ${challenge.id}`,
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          },
        });
      }

      // Record Milestone
      await prisma.learningMilestone.upsert({
        where: {
          userId_milestoneKey: {
            userId: user.id,
            milestoneKey: `mission_solved_${challenge.id}`,
          },
        },
        update: {},
        create: {
          userId: user.id,
          milestoneKey: `mission_solved_${challenge.id}`,
          title: `Solved Mission: ${challenge.title}`,
          titleBn: `মিশন সমাধান: ${challenge.title_bn}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      evaluation: evalResult,
      session,
      issuedCredential,
    });
  } catch (err: any) {
    console.error("Mission Submit Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
