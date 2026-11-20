import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAuthorizedRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAuthorizedRole(user.role, ["PLATFORM_ADMIN"])) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const orgs = await prisma.employerOrganization.findMany({
      include: {
        members: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        _count: {
          select: { jobs: true, shortlists: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orgs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAuthorizedRole(user.role, ["PLATFORM_ADMIN"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { organizationId, isVerified } = await req.json();

    const org = await prisma.employerOrganization.update({
      where: { id: organizationId },
      data: { isVerified: !!isVerified },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ORGANIZATION_VERIFIED",
        resourceType: "EmployerOrganization",
        resourceId: org.id,
        details: `Organization ${org.name} verification set to: ${isVerified}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, org });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
