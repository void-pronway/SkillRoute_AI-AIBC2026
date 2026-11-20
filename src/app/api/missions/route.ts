import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { MISSION_CATALOG } from "@/data/challenges";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();

    let userSessions: any[] = [];
    if (user) {
      userSessions = await prisma.challengeSession.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: "desc" },
      });
    }

    const sessionMap = new Map<string, any>();
    userSessions.forEach((s) => {
      const existing = sessionMap.get(s.challengeId);
      if (!existing || s.score > existing.score) {
        sessionMap.set(s.challengeId, s);
      }
    });

    const missionsWithUserStats = MISSION_CATALOG.map((m) => {
      const bestSession = sessionMap.get(m.id);
      return {
        id: m.id,
        title: m.title,
        title_bn: m.title_bn,
        category: m.category,
        careerTrackId: m.careerTrackId,
        difficulty: m.difficulty,
        estimatedMinutes: m.estimatedMinutes,
        passingScore: m.passingScore,
        scenario: m.scenario,
        scenario_bn: m.scenario_bn,
        rubricCount: m.rubric.length,
        hasAttempted: !!bestSession,
        bestScore: bestSession?.score || 0,
        isPassed: bestSession?.passed || false,
      };
    });

    return NextResponse.json({
      success: true,
      missions: missionsWithUserStats,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
