import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAuthorizedRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgMember = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    const orgId = orgMember?.organizationId;

    const jobs = await prisma.job.findMany({
      where: orgId ? { organizationId: orgId } : {},
      include: {
        requirements: true,
        organization: true,
        _count: {
          select: { shortlists: true, invitations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, jobs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAuthorizedRole(user.role, ["EMPLOYER_OWNER", "EMPLOYER_RECRUITER"])) {
      return NextResponse.json({ error: "Forbidden: Employer access required" }, { status: 403 });
    }

    const orgMember = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    });

    if (!orgMember) {
      return NextResponse.json({ error: "No organization associated with this account" }, { status: 400 });
    }

    const {
      title,
      description,
      careerCategory,
      careerTrackId,
      location,
      employmentType,
      salaryRange,
      requirements,
    } = await req.json();

    if (!title || !description || !careerCategory) {
      return NextResponse.json({ error: "Title, description, and career category are required" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        organizationId: orgMember.organizationId,
        title: title.trim(),
        description: description.trim(),
        careerCategory,
        careerTrackId: careerTrackId || "junior_data_analyst",
        location: location || "Dhaka, Bangladesh (Hybrid)",
        employmentType: employmentType || "Full-time",
        salaryRange,
        requirements: {
          create: Array.isArray(requirements)
            ? requirements.map((r: any) => ({
                skillId: r.skillId,
                targetLevel: Number(r.targetLevel) || 3,
                weight: Number(r.weight) || 3,
                isRequired: r.isRequired !== false,
              }))
            : [],
        },
      },
      include: {
        requirements: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "JOB_POSTED",
        resourceType: "Job",
        resourceId: job.id,
        details: `Posted new job: ${job.title}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (err: any) {
    console.error("Job POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
