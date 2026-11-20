import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const publicProfile = await prisma.publicSkillProofProfile.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      publicProfile: publicProfile ? {
        ...publicProfile,
        consentedFields: JSON.parse(publicProfile.consentedFields || "[]"),
      } : null,
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

    const { action, consentedFields, targetCareerId } = await req.json();

    if (action === "REVOKE") {
      await prisma.publicSkillProofProfile.updateMany({
        where: { userId: user.id },
        data: {
          isPublic: false,
          revokedAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PUBLIC_PROFILE_REVOKED",
          resourceType: "PublicProfile",
          details: "Student revoked public portfolio access",
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        },
      });

      return NextResponse.json({ success: true, message: "Public portfolio revoked" });
    }

    // Publish or update
    const randomSlug = crypto.randomBytes(6).toString("hex");
    const fields = Array.isArray(consentedFields) ? consentedFields : ["name", "careerGoal", "verifiedSkills"];

    let profile = await prisma.publicSkillProofProfile.findFirst({
      where: { userId: user.id },
    });

    if (profile) {
      profile = await prisma.publicSkillProofProfile.update({
        where: { id: profile.id },
        data: {
          consentedFields: JSON.stringify(fields),
          targetCareerId: targetCareerId || profile.targetCareerId,
          isPublic: true,
          revokedAt: null,
        },
      });
    } else {
      profile = await prisma.publicSkillProofProfile.create({
        data: {
          publicId: `portfolio-${randomSlug}`,
          userId: user.id,
          targetCareerId: targetCareerId || "junior_data_analyst",
          consentedFields: JSON.stringify(fields),
          isPublic: true,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PUBLIC_PROFILE_PUBLISHED",
        resourceType: "PublicProfile",
        resourceId: profile.id,
        details: `Published public portfolio with ID: ${profile.publicId}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({
      success: true,
      publicProfile: {
        ...profile,
        consentedFields: fields,
      },
    });
  } catch (err: any) {
    console.error("Public Profile POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
