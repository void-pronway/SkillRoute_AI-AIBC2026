import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { credentialId: string } }) {
  try {
    const cred = await prisma.credential.findUnique({
      where: { credentialId: params.credentialId },
      include: {
        user: {
          select: {
            name: true,
            isVerified: true,
            studentProfile: {
              select: {
                university: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!cred) {
      return NextResponse.json({ error: "Credential not found or invalid" }, { status: 404 });
    }

    const disclaimer =
      cred.assessmentType === "EMPLOYER_VERIFIED"
        ? "This verified credential substantiates direct technical interview endorsement and candidate validation by an authorized partner employer."
        : cred.assessmentType === "PROJECT_REVIEWED"
        ? "This verified credential substantiates rigorous multi-criteria project rubric evaluation and portfolio artifact verification on SkillRoute AI."
        : "This verified credential substantiates practical task evaluation conducted on SkillRoute Mission Arena. It does not replace formal university degrees.";

    return NextResponse.json({
      success: true,
      credential: {
        credentialId: cred.credentialId,
        studentName: cred.user.name,
        university: cred.user.studentProfile?.university || "Daffodil International University",
        department: cred.user.studentProfile?.department || "Computer Science and Engineering",
        competencyTitle: cred.competencyTitle,
        skillId: cred.skillId,
        assessmentType: cred.assessmentType,
        score: cred.score,
        status: cred.status,
        issuedAt: cred.issuedAt,
        isRevoked: cred.status === "REVOKED",
        verificationUrl: cred.verificationUrl,
        authority: "SkillRoute AI Platform Verification Authority",
        disclaimer,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
