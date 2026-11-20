import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAuthorizedRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAuthorizedRole(user.role, ["PLATFORM_ADMIN"])) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const counts = {
      totalUsers: await prisma.user.count(),
      students: await prisma.user.count({ where: { role: "STUDENT" } }),
      organizations: await prisma.employerOrganization.count(),
      credentialsIssued: await prisma.credential.count(),
      missionsEvaluated: await prisma.challengeSession.count(),
    };

    return NextResponse.json({ success: true, logs, counts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
