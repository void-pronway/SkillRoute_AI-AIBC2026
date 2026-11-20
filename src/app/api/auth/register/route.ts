import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = "STUDENT", university, department } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: name.trim(),
        role,
        isVerified: true,
        studentProfile: role === "STUDENT" ? {
          create: {
            university: university || "Daffodil International University",
            department: department || "Computer Science and Engineering",
            graduationYear: 2026,
            careerGoal: "junior_data_analyst",
            weeklyStudyHours: 8,
            skillsJson: JSON.stringify({
              python: 1,
              sql: 1,
              excel: 1,
            }),
          },
        } : undefined,
      },
      include: {
        studentProfile: true,
      },
    });

    const session = await createSession(user.id, req.headers);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTER",
        resourceType: "User",
        resourceId: user.id,
        details: `Registered new account with role: ${user.role}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentProfile: user.studentProfile,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Register Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
