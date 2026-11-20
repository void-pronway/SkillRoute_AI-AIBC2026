import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAuthorizedRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    const userIdToFetch =
      targetUserId && isAuthorizedRole(user.role, ["EMPLOYER_OWNER", "EMPLOYER_RECRUITER", "ADMIN"])
        ? targetUserId
        : user.id;

    const credentials = await prisma.credential.findMany({
      where: { userId: userIdToFetch },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      credentials,
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

    const body = await req.json();
    const {
      targetUserId,
      skillId = "sql",
      competencyTitle,
      projectTitle,
      assessmentType = "PROJECT_REVIEWED", // "PROJECT_REVIEWED" | "EMPLOYER_VERIFIED" | "PRACTICALLY_DEMONSTRATED"
      score = 95,
      projectUrl,
      notes,
    } = body;

    // Strict Institutional Verification Demarcation:
    // Tier 5 (EMPLOYER_VERIFIED) can ONLY be awarded by an authorized employer or platform admin!
    if (assessmentType === "EMPLOYER_VERIFIED") {
      const isEmployerOrAdmin = isAuthorizedRole(user.role, ["EMPLOYER_OWNER", "EMPLOYER_RECRUITER", "ADMIN"]);
      if (!isEmployerOrAdmin) {
        return NextResponse.json(
          {
            error: "Forbidden: Tier 5 (Employer Verified) can only be awarded by authorized partner employers.",
          },
          { status: 403 }
        );
      }
    }

    // Tier 4 (PROJECT_REVIEWED): SkillRoute AI requires a valid project title and artifact/GitHub URL
    if (assessmentType === "PROJECT_REVIEWED") {
      if (!projectUrl || typeof projectUrl !== "string" || projectUrl.trim().length < 5) {
        return NextResponse.json(
          {
            error: "A valid GitHub repository or project artifact URL is required for Tier 4 evaluation.",
          },
          { status: 400 }
        );
      }
    }

    // Determine target recipient (candidate if employer is endorsing, or current user)
    let recipientId = user.id;
    if (targetUserId) {
      recipientId = targetUserId;
    }

    const normSkillId = skillId.toLowerCase();
    const currentYear = new Date().getFullYear();
    const randSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();

    let prefix = "SKILL";
    let defaultTitle = `${normSkillId.toUpperCase()} Competency`;

    if (assessmentType === "PROJECT_REVIEWED") {
      prefix = "SR-PRJ";
      defaultTitle = `${normSkillId.toUpperCase()}: ${projectTitle || "Production Architecture & Implementation"}`;
    } else if (assessmentType === "EMPLOYER_VERIFIED") {
      prefix = "SR-EMP";
      defaultTitle = `${normSkillId.toUpperCase()}: Direct Technical Recruiter Endorsement`;
    } else if (assessmentType === "PRACTICALLY_DEMONSTRATED") {
      prefix = "SR-PRAC";
      defaultTitle = `${normSkillId.toUpperCase()} Mission Arena Practical Execution`;
    }

    const credentialId = `${prefix}-${currentYear}-${normSkillId.toUpperCase()}-${randSuffix}`;

    // Deactivate existing active credential of the exact same type and skill to ensure clean state
    await prisma.credential.updateMany({
      where: {
        userId: recipientId,
        skillId: normSkillId,
        assessmentType,
        status: "ACTIVE",
      },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    });

    const credential = await prisma.credential.create({
      data: {
        credentialId,
        userId: recipientId,
        skillId: normSkillId,
        competencyTitle: competencyTitle || defaultTitle,
        assessmentType,
        score: Number(score) || 95,
        verificationUrl: `/verify/${credentialId}`,
        status: "ACTIVE",
      },
    });

    // Platform Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREDENTIAL_ISSUED",
        resourceType: "Credential",
        resourceId: credential.id,
        details: `Issued ${assessmentType} credential (${credentialId}) for skill ${normSkillId} to user ${recipientId}. Submitter role: ${user.role}.`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    // Milestone tracking
    const milestoneKey = `milestone_${assessmentType.toLowerCase()}_${normSkillId}`;
    await prisma.learningMilestone.upsert({
      where: {
        userId_milestoneKey: {
          userId: recipientId,
          milestoneKey,
        },
      },
      update: {},
      create: {
        userId: recipientId,
        milestoneKey,
        title: `Earned ${
          assessmentType === "EMPLOYER_VERIFIED" ? "Tier 5 Employer Verification" : "Tier 4 Project Review"
        }: ${normSkillId.toUpperCase()}`,
        titleBn: `অর্জিত ${
          assessmentType === "EMPLOYER_VERIFIED" ? "স্তর ৫ নিয়োগকারী সত্যায়ন" : "স্তর ৪ প্রজেক্ট মূল্যায়ন"
        }: ${normSkillId.toUpperCase()}`,
      },
    });

    return NextResponse.json({
      success: true,
      credential,
    });
  } catch (err: any) {
    console.error("Credential POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
