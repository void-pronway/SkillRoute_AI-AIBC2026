import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAuthorizedRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAuthorizedRole(user.role, ["PLATFORM_ADMIN", "ASSESSMENT_REVIEWER"])) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        studentProfile: {
          select: {
            university: true,
            careerGoal: true,
          },
        },
        _count: {
          select: { credentials: true, challengeSessions: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
