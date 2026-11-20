import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CAREER_CATALOG } from "@/data/careers";
import { calculateCareerMatch } from "@/logic/careerMatching";
import { calculateLearningEffort } from "@/logic/learningEffort";

export async function GET(req: NextRequest, { params }: { params: { publicId: string } }) {
  try {
    const publicProfile = await prisma.publicSkillProofProfile.findUnique({
      where: { publicId: params.publicId },
      include: {
        user: {
          include: {
            studentProfile: true,
            credentials: {
              where: { status: "ACTIVE" },
            },
            assessmentAttempts: {
              take: 5,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!publicProfile || !publicProfile.isPublic || publicProfile.revokedAt) {
      return NextResponse.json({ error: "Portfolio not found or access revoked by owner" }, { status: 404 });
    }

    // Increment view count
    await prisma.publicSkillProofProfile.update({
      where: { id: publicProfile.id },
      data: { viewCount: { increment: 1 } },
    });

    const consented: string[] = JSON.parse(publicProfile.consentedFields || "[]");
    const u = publicProfile.user;
    const sp = u.studentProfile;
    const skills: Record<string, number> = JSON.parse(sp?.skillsJson || "{}");

    const career = CAREER_CATALOG.find((c) => c.career_id === publicProfile.targetCareerId) || CAREER_CATALOG[0];
    const match = calculateCareerMatch(career, skills);
    const effort = calculateLearningEffort(career, skills);

    // Filter fields according to student's explicit consent
    const responseData = {
      publicId: publicProfile.publicId,
      publishedAt: publicProfile.createdAt,
      targetCareer: {
        id: career.career_id,
        title: career.title,
        title_bn: career.title_bn,
        matchPercentage: match.matchPercentage,
        totalEffortHours: effort.totalEffortHours,
      },
      student: {
        name: consented.includes("name") ? u.name : "Anonymous Candidate",
        university: consented.includes("university") ? sp?.university : undefined,
        department: consented.includes("university") ? sp?.department : undefined,
        careerGoal: consented.includes("careerGoal") ? sp?.careerGoal : undefined,
      },
      skills: consented.includes("verifiedSkills") ? skills : {},
      credentials: consented.includes("verifiedSkills")
        ? u.credentials.map((c) => ({
            credentialId: c.credentialId,
            competencyTitle: c.competencyTitle,
            assessmentType: c.assessmentType,
            score: c.score,
            issuedAt: c.issuedAt,
            verificationUrl: c.verificationUrl,
          }))
        : [],
      assessmentEvidence: consented.includes("assessmentResults")
        ? u.assessmentAttempts.map((a) => ({
            skillId: a.skillId,
            evidenceStatus: a.evidenceStatus,
            accuracy: a.accuracy,
            date: a.createdAt,
          }))
        : [],
      disclaimer:
        "SkillRoute AI Public Portfolios display self-reported claims, diagnostic observations, and verified practical missions with explicit student consent. This portfolio does not constitute an accredited university degree or certified guarantee of employment.",
    };

    const response = NextResponse.json({ success: true, portfolio: responseData });
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
