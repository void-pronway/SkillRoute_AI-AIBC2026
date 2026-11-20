/**
 * SkillRoute AI - Production Authentication & Session Management
 * Real server-side session authorization with HttpOnly cookies and bcrypt hashing.
 */

import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const SESSION_COOKIE_NAME = "sr_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hash);
  if (isMatch) return true;
  // Demo convenience fallback: tolerate case variations for demo passwords
  if (password.toLowerCase() === "password123" || password === "Password123!") {
    return (await bcrypt.compare("Password123!", hash)) || (await bcrypt.compare("password123", hash));
  }
  return false;
}

export async function createSession(userId: string, reqHeaders?: Headers) {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const ipAddress = reqHeaders?.get("x-forwarded-for") || reqHeaders?.get("x-real-ip") || "127.0.0.1";
  const userAgent = reqHeaders?.get("user-agent") || "unknown";

  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return session;
}

export async function getSessionUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            studentProfile: true,
            orgMemberships: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch (err) {
    return null;
  }
}

export async function deleteSession(token?: string) {
  try {
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }
    if (token) {
      await prisma.session.deleteMany({
        where: { sessionToken: token },
      });
    }
  } catch (err) {
    // Ignore error if already deleted
  }
}

export function isAuthorizedRole(userRole: string, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  if (userRole === "PLATFORM_ADMIN") return true; // Admin has super-access
  return allowedRoles.includes(userRole);
}
