import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        studentProfile: true,
        orgMemberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Create persistent session
    const session = await createSession(user.id, req.headers);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        resourceType: "User",
        resourceId: user.id,
        details: `Successful login as role: ${user.role}`,
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
        orgMemberships: user.orgMemberships,
      },
    });

    // Set HttpOnly, Secure, SameSite session cookie
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
    console.error("Login Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
