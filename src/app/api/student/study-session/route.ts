import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.learningSession.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: "desc" },
      take: 20,
    });

    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = Number((totalMinutes / 60).toFixed(1));

    const milestones = await prisma.learningMilestone.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      totalHours,
      totalMinutes,
      sessions,
      milestones,
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

    const { skillId, durationMinutes, notes } = await req.json();

    if (!skillId || !durationMinutes) {
      return NextResponse.json({ error: "Skill ID and duration minutes are required" }, { status: 400 });
    }

    const session = await prisma.learningSession.create({
      data: {
        userId: user.id,
        skillId,
        durationMinutes: Math.max(5, Math.min(600, Number(durationMinutes))),
        notes: notes || undefined,
      },
    });

    // Check for milestone: first study session logged
    await prisma.learningMilestone.upsert({
      where: {
        userId_milestoneKey: {
          userId: user.id,
          milestoneKey: "first_study_session",
        },
      },
      update: {},
      create: {
        userId: user.id,
        milestoneKey: "first_study_session",
        title: "First Study Session Logged",
        titleBn: "প্রথম অধ্যয়ন সেশন রেকর্ড সম্পন্ন",
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
