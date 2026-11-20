import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAuthorizedRole } from "@/lib/auth";
import { CAREER_CATALOG } from "@/data/careers";
import { calculateCareerMatch } from "@/logic/careerMatching";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isAuthorizedRole(user.role, ["EMPLOYER_OWNER", "EMPLOYER_RECRUITER"])) {
      return NextResponse.json({ error: "Forbidden: Employer access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const careerFilter = searchParams.get("careerTrack");
    const minLevel = parseInt(searchParams.get("minLevel") || "0", 10);
    const skillFilter = searchParams.get("skill");

    // Retrieve active students with their profiles and verified credentials
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      include: {
        studentProfile: true,
        credentials: {
          where: { status: "ACTIVE" },
        },
        challengeSessions: {
          where: { passed: true },
          include: {
            challenge: true,
          },
        },
        publicProfiles: {
          where: { isPublic: true },
        },
      },
    });

    const candidateCards = students.map((s) => {
      const sp = s.studentProfile;
      const skills: Record<string, number> = JSON.parse(sp?.skillsJson || "{}");
      const targetCareerId = sp?.careerGoal || "junior_data_analyst";
      const career = CAREER_CATALOG.find((c) => c.career_id === targetCareerId) || CAREER_CATALOG[0];

      const match = calculateCareerMatch(career, skills);

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        university: sp?.university || "Daffodil International University",
        department: sp?.department || "Computer Science and Engineering",
        graduationYear: sp?.graduationYear || 2026,
        educationStatus: sp?.educationStatus || "Undergraduate",
        careerGoal: targetCareerId,
        careerTitle: career.title,
        careerTitle_bn: career.title_bn,
        matchPercentage: match.matchPercentage,
        skills,
        publicProfileId: s.publicProfiles?.[0]?.publicId || null,
        credentials: s.credentials.map((c) => ({
          credentialId: c.credentialId,
          competencyTitle: c.competencyTitle,
          score: c.score,
          assessmentType: c.assessmentType,
          issuedAt: c.issuedAt,
        })),
        missionsSolved: s.challengeSessions.map((cs) => ({
          id: cs.challengeId,
          title: cs.challenge.title,
          score: cs.score,
          completedAt: cs.completedAt,
        })),
        weeklyStudyHours: sp?.weeklyStudyHours || 8,
      };
    });

    // Apply filtering
    let filtered = candidateCards;
    if (careerFilter && careerFilter !== "ALL") {
      filtered = filtered.filter((c) => c.careerGoal === careerFilter);
    }
    if (skillFilter) {
      filtered = filtered.filter((c) => (c.skills[skillFilter] || 0) >= minLevel);
    }

    // Sort by match percentage descending
    filtered.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return NextResponse.json({
      success: true,
      candidates: filtered,
      count: filtered.length,
    });
  } catch (err: any) {
    console.error("Candidates GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
