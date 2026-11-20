import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { CAREER_CATALOG } from "@/data/careers";
import { generateStarterRoadmap } from "@/logic/roadmap";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    const careerId = profile?.careerGoal || "junior_data_analyst";
    const career = CAREER_CATALOG.find((c) => c.career_id === careerId) || CAREER_CATALOG[0];
    const skills: Record<string, number> = JSON.parse(profile?.skillsJson || "{}");
    const weeklyHours = profile?.weeklyStudyHours || 8;

    // Check if active roadmap exists in database
    let dbRoadmap = await prisma.learningRoadmap.findFirst({
      where: {
        userId: user.id,
        careerId,
        isActive: true,
      },
      include: {
        activities: true,
      },
    });

    // If no roadmap exists or regenerated, generate and persist
    if (!dbRoadmap) {
      const generated = generateStarterRoadmap(career, skills, weeklyHours);

      dbRoadmap = await prisma.learningRoadmap.create({
        data: {
          userId: user.id,
          careerId,
          weeklyStudyHours: generated.weeklyStudyHours,
          totalEffortHours: generated.totalEffortHours,
          totalWeeks: generated.totalWeeks,
          fourWeekAllocatedHours: generated.fourWeekAllocatedHours,
          remainingHoursBeyondWeek4: generated.remainingHoursBeyondWeek4,
          weeksJson: JSON.stringify(generated.weeks),
          isActive: true,
          activities: {
            create: generated.weeks.flatMap((w) =>
              w.activities.map((a) => ({
                weekNumber: w.weekNumber,
                skillId: a.skill_id,
                title: a.title,
                titleBn: a.title_bn,
                hours: a.hours,
                completed: false,
              }))
            ),
          },
        },
        include: {
          activities: true,
        },
      });
    }

    const weeks = JSON.parse(dbRoadmap.weeksJson || "[]");

    // Augment weeks with completed state and db id from activities table
    const activityMap = new Map<string, { id: string; completed: boolean }>();
    dbRoadmap.activities.forEach((act) => {
      activityMap.set(`${act.weekNumber}_${act.skillId}_${act.title}`, {
        id: act.id,
        completed: act.completed,
      });
    });

    weeks.forEach((w: any) => {
      w.activities.forEach((a: any) => {
        const matched = activityMap.get(`${w.weekNumber}_${a.skill_id}_${a.title}`);
        if (matched) {
          a.id = matched.id;
          a.completed = matched.completed;
        } else {
          a.completed = false;
        }
      });
    });

    return NextResponse.json({
      success: true,
      roadmap: {
        id: dbRoadmap.id,
        careerId: dbRoadmap.careerId,
        careerTitle: career.title,
        careerTitle_bn: career.title_bn,
        weeklyStudyHours: dbRoadmap.weeklyStudyHours,
        totalEffortHours: dbRoadmap.totalEffortHours,
        totalWeeks: dbRoadmap.totalWeeks,
        fourWeekAllocatedHours: dbRoadmap.fourWeekAllocatedHours,
        remainingHoursBeyondWeek4: dbRoadmap.remainingHoursBeyondWeek4,
        isCompleteWithinFourWeeks: dbRoadmap.remainingHoursBeyondWeek4 === 0,
        weeks,
        activities: dbRoadmap.activities,
      },
    });
  } catch (err: any) {
    console.error("Roadmap GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, activityId, completed, regenerate } = await req.json();

    if (action === "TOGGLE_ACTIVITY" && activityId) {
      let act = await prisma.roadmapActivity.findUnique({
        where: { id: activityId },
      }).catch(() => null);

      if (!act) {
        const activeRoadmap = await prisma.learningRoadmap.findFirst({
          where: { userId: user.id, isActive: true },
          include: { activities: true },
        });

        if (activeRoadmap) {
          act = activeRoadmap.activities.find((a) => a.id === activityId) || null;
          if (!act && activityId.startsWith("act_")) {
            const parts = activityId.split("_");
            const wIdx = parseInt(parts[1], 10);
            const aIdx = parseInt(parts[2], 10);
            const weekActivities = activeRoadmap.activities.filter(
              (a) => a.weekNumber === wIdx + 1
            );
            act = weekActivities[aIdx] || null;
          }
        }
      }

      if (act) {
        const updatedActivity = await prisma.roadmapActivity.update({
          where: { id: act.id },
          data: {
            completed: !!completed,
            completedAt: completed ? new Date() : null,
          },
        });

        // Sync weeksJson in parent roadmap
        if (act.roadmapId) {
          try {
            const rm = await prisma.learningRoadmap.findUnique({ where: { id: act.roadmapId } });
            if (rm && rm.weeksJson) {
              const parsedWeeks = JSON.parse(rm.weeksJson);
              parsedWeeks.forEach((w: any) => {
                if (w.weekNumber === act.weekNumber) {
                  w.activities?.forEach((a: any) => {
                    if (a.title === act.title && a.skill_id === act.skillId) {
                      a.completed = !!completed;
                    }
                  });
                }
              });
              await prisma.learningRoadmap.update({
                where: { id: act.roadmapId },
                data: { weeksJson: JSON.stringify(parsedWeeks) },
              });
            }
          } catch (e) {
            console.warn("Could not sync weeksJson:", e);
          }
        }

        return NextResponse.json({ success: true, activity: updatedActivity });
      }

      return NextResponse.json({ success: true, note: "Activity toggled locally" });
    }

    if (regenerate) {
      // Regenerate roadmap respecting updated skills or availability
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });
      const careerId = profile?.careerGoal || "junior_data_analyst";
      const career = CAREER_CATALOG.find((c) => c.career_id === careerId) || CAREER_CATALOG[0];
      const skills = JSON.parse(profile?.skillsJson || "{}");
      const weeklyHours = profile?.weeklyStudyHours || 8;

      // Mark old roadmaps inactive
      await prisma.learningRoadmap.updateMany({
        where: { userId: user.id, careerId },
        data: { isActive: false },
      });

      const generated = generateStarterRoadmap(career, skills, weeklyHours);

      const newRoadmap = await prisma.learningRoadmap.create({
        data: {
          userId: user.id,
          careerId,
          weeklyStudyHours: generated.weeklyStudyHours,
          totalEffortHours: generated.totalEffortHours,
          totalWeeks: generated.totalWeeks,
          fourWeekAllocatedHours: generated.fourWeekAllocatedHours,
          remainingHoursBeyondWeek4: generated.remainingHoursBeyondWeek4,
          weeksJson: JSON.stringify(generated.weeks),
          isActive: true,
          activities: {
            create: generated.weeks.flatMap((w) =>
              w.activities.map((a) => ({
                weekNumber: w.weekNumber,
                skillId: a.skill_id,
                title: a.title,
                titleBn: a.title_bn,
                hours: a.hours,
                completed: false,
              }))
            ),
          },
        },
        include: {
          activities: true,
        },
      });

      return NextResponse.json({ success: true, roadmap: newRoadmap });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Roadmap POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
