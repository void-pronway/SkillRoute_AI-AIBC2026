import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAuthorizedRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAuthorizedRole(user.role, ["EMPLOYER_OWNER", "EMPLOYER_RECRUITER"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orgMember = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const shortlists = await prisma.candidateShortlist.findMany({
      where: { organizationId: orgMember.organizationId },
      include: {
        user: {
          include: {
            studentProfile: true,
            credentials: true,
          },
        },
        job: true,
      },
      orderBy: { shortlistedAt: "desc" },
    });

    return NextResponse.json({ success: true, shortlists });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAuthorizedRole(user.role, ["EMPLOYER_OWNER", "EMPLOYER_RECRUITER"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orgMember = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const { candidateUserId, jobId, status = "SHORTLISTED", recruiterNotes } = await req.json();

    if (!candidateUserId) {
      return NextResponse.json({ error: "candidateUserId is required" }, { status: 400 });
    }

    const item = await prisma.candidateShortlist.upsert({
      where: {
        organizationId_userId: {
          organizationId: orgMember.organizationId,
          userId: candidateUserId,
        },
      },
      update: {
        status,
        recruiterNotes: recruiterNotes || undefined,
        jobId: jobId || undefined,
        updatedAt: new Date(),
      },
      create: {
        organizationId: orgMember.organizationId,
        userId: candidateUserId,
        jobId: jobId || undefined,
        status,
        recruiterNotes: recruiterNotes || undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CANDIDATE_SHORTLISTED",
        resourceType: "CandidateShortlist",
        resourceId: item.id,
        details: `Shortlisted candidate ${candidateUserId} with status: ${status}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    console.error("Shortlist POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
