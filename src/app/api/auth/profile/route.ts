import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, bio, targetUserId } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters long." }, { status: 400 });
    }

    // Admins can update any user's name if targetUserId is supplied; otherwise users update their own name
    let userIdToUpdate = user.id;
    if (targetUserId && user.role === "PLATFORM_ADMIN") {
      userIdToUpdate = targetUserId;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: {
        name: name.trim(),
        bio: bio !== undefined ? bio : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "NAME_UPDATED",
        resourceType: "User",
        resourceId: updatedUser.id,
        details: `Updated name to: ${updatedUser.name}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
